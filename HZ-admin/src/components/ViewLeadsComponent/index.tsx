import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "../SpinLoader";

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import PaginationControls from "@/src/components/CrmView/pagination";
import { FaEdit, FaTrash } from "react-icons/fa";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import BackRoute from "@/src/common/BackRoute";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";

enum ReferralCaseStatus {
  OPEN = "OPEN",
  WON = "WON",
  LOST = "LOST",
  CANCELLED = "CANCELLED",
}

type LeadTab = "normal" | "referral";
const STEPS = [
  "Calling & informing",
  "Site visit & confirmation",
  "Finances",
  "Advance Payment",
  "Registration",
];

const StatusBadge = ({
  status,
}: {
  status?: ReferralCaseStatus | string | null;
}) => {
  const safeStatus =
    status && Object.values(ReferralCaseStatus).includes(status as any)
      ? (status as ReferralCaseStatus)
      : ReferralCaseStatus.OPEN;

  const styles: Record<ReferralCaseStatus, string> = {
    [ReferralCaseStatus.OPEN]: "bg-blue-50 text-blue-700 border-blue-200",
    [ReferralCaseStatus.WON]: "bg-green-50 text-green-700 border-green-200",
    [ReferralCaseStatus.LOST]: "bg-red-50 text-red-700 border-red-200",
    [ReferralCaseStatus.CANCELLED]: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-[6px] border px-3 py-1 text-xs font-medium ${styles[safeStatus]}`}
    >
      {safeStatus}
    </span>
  );
};

const BoolBadge = ({ value }: { value?: boolean }) =>
  value ? (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 text-xs font-medium">
      <FaCheckCircle className="text-green-500" />
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 text-xs font-medium">
      <FaTimesCircle className="text-red-500" />
      No
    </span>
  );

const EmptyState = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center text-center">
    <div className="text-3xl mb-2">🗂️</div>
    <p className="font-bold text-[16px] md:text-[18px]">
      No leads found yet
    </p>
    <p className="text-gray-500 text-sm md:text-[14px]">
      Leads for this item will appear here.
    </p>
  </div>
);

export default function ViewLeadsComponent() {
  const router = useRouter();

  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [entityId, setEntityId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<"property" | "project" | null>(
    null
  );
  const [entityData, setEntityData] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<LeadTab>("normal");
  const [totalCount, setTotalCount] = useState(0);
  const session = useSession();
  const [user, setUser] = useState<{ [key: string]: any }>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const [formData, setFormData] = useState({
    leadName: "",
    leadPhone: "",
    leadEmail: "",
    leadCity: "",
    requirementNote: "",
    relationshipType: "",
    category: "",
    agreeToContact: false,
  });
  const onClose = () => {
    setIsEditOpen(false);
    setFormData({
      leadName: "",
      leadPhone: "",
      leadEmail: "",
      leadCity: "",
      requirementNote: "",
      relationshipType: "",
      category: "",
      agreeToContact: false,
    });
  };

  const openEditModal = (lead: any) => {
    setSelectedLead(lead);

    setFormData({
      leadName: lead.leadName || "",
      leadPhone: lead.leadPhone || "",
      leadEmail: lead.leadEmail || "",
      leadCity: lead.leadCity || "",
      requirementNote: lead.requirementNote || "",
      relationshipType: lead.relationshipType || "",
      category: lead.category || "",
      agreeToContact: true,
    });

    setIsEditOpen(true);
  };

  useEffect(() => {
    if (!router.isReady) return;

    const path = router.asPath;
    const idFromQuery = (router.query.id as string) || null;

    if (path.includes("/property/")) {
      setEntityType("property");
      setEntityId(idFromQuery);
    } else if (path.includes("/projects/")) {
      setEntityType("project");
      setEntityId(idFromQuery);
    }
  }, [router.isReady, router.query.id, router.asPath]);

  const fetchEntityData = useCallback(async () => {
    if (!entityId || !entityType) return;

    setLoading(true);
    try {
      const url =
        entityType === "property"
          ? `${apiClient.URLS.property}/${entityId}`
          : `${apiClient.URLS.company_Onboarding}/projects/${entityId}`;

      const response = await apiClient.get(url);
      if (response.status === 200) {
        setEntityData(response?.body?.data ?? response?.body ?? null);
      } else {
        setEntityData(null);
      }
    } catch (err) {
      console.error("Error fetching entity:", err);
      setEntityData(null);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  const fetchNormalLeads = useCallback(async () => {
    if (!entityId || !entityType) return;

    setLoading(true);
    try {
      const url = `${apiClient.URLS.property_leads}/${entityId}`;
      const response = await apiClient.get(url, {
        isProject: entityType === "project",
      });

      if (response.status === 200) {
        const list = Array.isArray(response.body) ? response.body : [];
        setAllLeads(list);
        setTotalCount(list.length);
      } else {
        setAllLeads([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error(err);
      setAllLeads([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  const fetchReferralLeads = useCallback(async () => {
    if (!entityId) return;

    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.propertyReferral}/referrals`,
        {
          propertyId: Number(entityId),
          page: currentPage,
          limit: pageSize,
        },
        true
      );

      if (response.status === 200) {
        const data = response?.body?.data ?? [];
        const total = response?.body?.total ?? 0;

        setAllLeads(Array.isArray(data) ? data : []);
        setTotalCount(Number(total) || 0);
      } else {
        setAllLeads([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error(err);
      setAllLeads([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [entityId, currentPage, pageSize]);
  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session.data?.user);
    }
  }, [session?.status]);

  useEffect(() => {
    if (!entityId || !entityType) return;

    fetchEntityData();

    if (entityType === "project") {
      fetchNormalLeads();
      return;
    }

    if (activeTab === "normal") fetchNormalLeads();
    else fetchReferralLeads();
  }, [
    entityId,
    entityType,
    activeTab,
    currentPage,
    pageSize,
    fetchEntityData,
    fetchNormalLeads,
    fetchReferralLeads,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, pageSize]);

  const referralHeaders = [
    "Lead Name",
    "Phone",
    "Email",
    "City",
    "Requirement",
    "Status",
    "Referrer",
    "Step",
    "Action",
  ];

  const normalCsvHeaders = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Agree to Contact", key: "agreeToContact" },
    { label: "Interested in Loan", key: "interestedInLoan" },
  ];

  const referralCsvHeaders = [
    { label: "Lead Name", key: "leadName" },
    { label: "Phone", key: "leadPhone" },
    { label: "Email", key: "leadEmail" },
    { label: "City", key: "leadCity" },
    { label: "Requirement", key: "requirementNote" },
    { label: "Status", key: "status" },
    { label: "Referrer", key: "referrerName" },
  ];

  const entityTitle =
    entityType === "project"
      ? entityData?.Name ?? entityData?.name ?? "-"
      : entityData?.propertyDetails?.propertyName ??
        entityData?.propertyName ??
        "-";

  const isReferralMode = entityType === "property" && activeTab === "referral";
  const handleTextInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCheckboxChange = (e: any) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const totalPages = useMemo(() => {
    if (isReferralMode) return Math.ceil((totalCount || 0) / pageSize) || 1;
    return Math.ceil((allLeads.length || 0) / pageSize) || 1;
  }, [isReferralMode, totalCount, pageSize, allLeads.length]);

  const pageLeads = useMemo(() => {
    if (isReferralMode) {
      return allLeads;
    }

    const start = (currentPage - 1) * pageSize;
    return allLeads.slice(start, start + pageSize);
  }, [isReferralMode, allLeads, currentPage, pageSize]);

  const effectiveTotal = isReferralMode ? totalCount : allLeads.length;

  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages]
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const handleStepUpdate = async (lead: any, toStep: number) => {
    if (lead.currentStep === toStep) return;

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.propertyReferral}/referrals/${lead.id}/step`,
        {
          adminUserId: (user as any)?.id,
          toStep,
          status: lead.status,
          relationshipType: lead?.relationshipType,
          category: lead?.category,
        },
        true
      );
      if (res.status === 200) {
        toast.success("Step updated successfully");
      }

      fetchReferralLeads();
    } catch (error) {
      console.error("Failed to update step", error);
      toast.error("something Went Wrong");
    }
  };

  const handleDelete = async (leadId: number) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.referandearn}/referrals/${leadId}`,
        {},
        true
      );

      if (res.status === 200) {
        setAllLeads((prev) => prev.filter((lead) => lead.id !== leadId));
        setTotalCount((prev) => Math.max(prev - 1, 0));

        toast.success("Lead deleted successfully");
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("something Went Wrong");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLead) return;
    setLoading(true);

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.referandearn}/referrals/${selectedLead.id}`,
        {
          propertyId: Number(entityId),
          referrerUserId: selectedLead.referrer.id,
          leadName: formData.leadName,
          leadPhone: formData.leadPhone,
          leadEmail: formData.leadEmail,
          leadCity: formData.leadCity,
          requirementNote: formData.requirementNote,
          relationshipType: formData.relationshipType,
          category: "PROPERTY",
        },
        true
      );
      if ((res.status = 200)) {
        toast.success("Lead details updated sucessfully");
      }

      setIsEditOpen(false);
      setSelectedLead(null);
      fetchReferralLeads();
    } catch (error: any) {
      console.error("Update failed", error);
    } finally {
      setLoading(false);
    }
  };

  const csvData = useMemo(() => {
    if (!isReferralMode) return allLeads;

    return allLeads.map((lead) => ({
      ...lead,
      referrerName: lead?.referrer
        ? `${lead.referrer.firstName || ""} ${
            lead.referrer.lastName || ""
          }`.trim()
        : "",
    }));
  }, [isReferralMode, allLeads]);

  const csvHeaders = isReferralMode ? referralCsvHeaders : normalCsvHeaders;

  const csvFilename = `Leads_${entityTitle}_${
    isReferralMode ? "Referral" : "Normal"
  }.csv`;

  const showTabs = entityType === "property";

  const from = effectiveTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to =
    effectiveTotal === 0 ? 0 : Math.min(currentPage * pageSize, effectiveTotal);

  return (
    <>
      <div className="w-full p-4 md:p-6">
        <div className="w-full max-w-[1200px]">
          <div className="flex flex-col gap-3 md:gap-4">
            <BackRoute />

            {showTabs && (
              <div className="flex gap-2 border-b border-gray-200 mt-4">
                {[
                  { key: "normal", label: "Normal Leads" },
                  { key: "referral", label: "Referral Leads" },
                ].map((tab) => (
                  <Button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as LeadTab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="font-bold text-[18px] md:text-[24px] leading-tight">
                  Leads of {entityTitle}
                </h1>

                <p className="text-gray-500 text-sm">
                  <span className="font-medium text-gray-600">
                    {effectiveTotal}
                  </span>{" "}
                  lead{effectiveTotal === 1 ? "" : "s"} • ID:{" "}
                  <span className="font-medium text-gray-600">
                    {entityId || "-"}
                  </span>
                </p>
              </div>

              {effectiveTotal > 0 && (
                <CSVLink
                  data={csvData}
                  headers={csvHeaders}
                  filename={csvFilename}
                  className="w-fit"
                >
                  <Button className="md:px-6 px-5 font-medium py-2 bg-blue-500 hover:bg-blue-700 transition text-white rounded-lg flex items-center gap-2 shadow-sm">
                    <LuDownload className="text-white text-[16px]" />
                    <span className="text-[13px] md:text-[14px]">Download</span>
                  </Button>
                </CSVLink>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
            <TableContainer
              component={Paper}
              elevation={0}
              className="!bg-transparent"
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {(isReferralMode
                      ? referralHeaders
                      : [
                          "Name",
                          "Email",
                          "Phone Number",
                          "Agree to Contact",
                          "Interested in Loan",
                        ]
                    ).map((h) => (
                      <TableCell
                        key={h}
                        align="center"
                        className="bg-blue-500 text-nowrap text-white py-3 px-4 font-bold text-[12px] md:text-[14px]"
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageLeads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  )}

                  {pageLeads.map((lead: any, index: number) => (
                    <TableRow
                      key={lead?.id ?? index}
                      className="hover:bg-gray-50/80 transition border-b border-gray-100"
                    >
                      {!isReferralMode ? (
                        <>
                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.name || "-"}
                          </TableCell>
                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.email || "-"}
                          </TableCell>
                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.phoneNumber || "-"}
                          </TableCell>
                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            <BoolBadge value={lead?.agreeToContact} />
                          </TableCell>
                          <TableCell
                            align="center"
                            className="font-medium text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            <BoolBadge value={lead?.interestedInLoan} />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.leadName || "-"}
                          </TableCell>

                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.leadPhone || "-"}
                          </TableCell>

                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.leadEmail || "-"}
                          </TableCell>

                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.leadCity || "-"}
                          </TableCell>

                          <TableCell
                            align="center"
                            title={lead?.requirementNote}
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            <span className="line-clamp-1">
                              {lead?.requirementNote || "-"}
                            </span>
                          </TableCell>

                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            <StatusBadge status={lead?.status} />
                          </TableCell>

                          <TableCell
                            align="center"
                            className="font-medium text-nowrap text-gray-800 md:text-[14px] text-[12px] px-4 py-3"
                          >
                            {lead?.referrer
                              ? `${lead.referrer.firstName || ""} ${
                                  lead.referrer.lastName || ""
                                }`.trim()
                              : "-"}
                          </TableCell>
                          <TableCell align="center" className="px-4 py-3">
                            <select
                              value={lead.currentStep}
                              onChange={(e) =>
                                handleStepUpdate(lead, Number(e.target.value))
                              }
                              className="border rounded px-2 py-1 font-medium  md:text-[12px] text-[10px]"
                            >
                              {STEPS.map((label, index) => (
                                <option key={index} value={index + 1}>
                                  {index + 1}. {label}
                                </option>
                              ))}
                            </select>
                          </TableCell>

                          <TableCell align="center" className="px-4 py-3">
                            <div className="flex items-center justify-center gap-3">
                              <Button
                                disabled={
                                  lead.status !== "OPEN" || lead.currentStep > 1
                                }
                                onClick={() => openEditModal(lead)}
                                className={`text-white font-medium px-3 py-1 rounded ${
                                  lead.status !== "OPEN" || lead.currentStep > 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "bg-[#5297ff] hover:underline"
                                }`}
                              >
                                <FaEdit className="md:text-[12px] text-[10px]" />
                              </Button>

                              <Button
                                onClick={() => handleDelete(lead.id)}
                                className="bg-red-500 font-medium text-white px-3 py-1 rounded"
                              >
                                <FaTrash className="md:text-[12px] text-[10px]" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {isEditOpen && (
              <Modal
                isOpen={isEditOpen}
                closeModal={onClose}
                title="Referral Lead"
                isCloseRequired={false}
                titleCls="font-medium uppercase md:text-[18px] text-[12px] text-center text-[#5297FF]"
                className="md:max-w-[800px] max-w-[300px] "
                rootCls="z-[99999]"
              >
                <div>
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-y-[20px]">
                      <div className="grid md:grid-cols-2 grid-cols-1 gap-1">
                        <CustomInput
                          label="Friend's Name"
                          type="text"
                          name="leadName"
                          value={formData.leadName}
                          placeholder="Enter friend's name"
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          className=" px-2 md:py-0 py-0 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                          rootCls="px-2"
                          onChange={handleTextInputChange}
                        />

                        <CustomInput
                          label="Phone Number"
                          type="number"
                          name="leadPhone"
                          value={formData.leadPhone}
                          placeholder="10-digit mobile number"
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          className=" px-2 md:py-0 py-0 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                          rootCls="px-2"
                          onChange={handleTextInputChange}
                        />

                        <CustomInput
                          label="Email"
                          type="email"
                          name="leadEmail"
                          value={formData.leadEmail}
                          placeholder="Enter email (optional)"
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          className=" px-2 md:py-0 py-0 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                          rootCls="px-2"
                          onChange={handleTextInputChange}
                        />

                        <CustomInput
                          label="City"
                          type="text"
                          name="leadCity"
                          placeholder="Enter city"
                          value={formData.leadCity}
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          className=" px-2 md:py-0 py-0 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                          rootCls="px-2"
                          onChange={handleTextInputChange}
                        />
                        <CustomInput
                          label="Relationship Type"
                          type="text"
                          name="relationshipType"
                          placeholder="Enter  relationship Type"
                          value={formData.relationshipType}
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          className=" px-2 md:py-0 py-0 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                          rootCls="px-2"
                          onChange={handleTextInputChange}
                        />

                        <CustomInput
                          name="requirementNote"
                          type="textarea"
                          label="Reqirement Note"
                          value={formData.requirementNote}
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          className="md:px-2 px-1 py-0 border border-[#CFCFCF] rounded-[4px] w-full"
                          rootCls="px-2"
                          placeholder="Requirement (budget, BHK, location, etc.)"
                          onChange={handleTextInputChange}
                        />

                        <CheckboxInput
                          label="I agree to be contacted regarding this referral"
                          labelCls="font-medium label-text leading-[22.8px] text-[#000000]"
                          name="agreeToContact"
                          checked={formData.agreeToContact}
                          onChange={handleCheckboxChange}
                        />
                      </div>
                      <div className="flex justify-end gap-3 md:mt-6 mt-3">
                        <Button
                          className="bg-gray-300 text-white md:px-6 px-3 md:py-2 py-1 btn-txt font-medium rounded"
                          onClick={onClose}
                        >
                          Cancel
                        </Button>
                        <Button
                          className=" btn-txt font-medium md:py-2 py-1 md:px-5 px-2 bg-[#5297ff] text-white rounded-[6px]"
                          type="submit"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </Modal>
            )}

            <div className="border-t border-gray-200 bg-gray-50 px-3 md:px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs text-gray-600">
                  Showing <span className="font-medium">{from}</span> to{" "}
                  <span className="font-medium">{to}</span> of{" "}
                  <span className="font-medium">{effectiveTotal}</span>{" "}
                  results
                </div>

                {totalPages > 1 && (
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-white/50 backdrop-blur-[1px]">
          <Loader />
        </div>
      )}
    </>
  );
}
