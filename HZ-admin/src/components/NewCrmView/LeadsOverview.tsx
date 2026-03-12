import React, { useState, useMemo, useEffect } from "react";
import { FaUsers, FaCalendarDay, FaPlus } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import apiClient from "@/src/utils/apiClient";
import { CSVLink } from "react-csv";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import Button from "@/src/common/Button";
import CustomTooltip from "@/src/common/ToolTip";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import Modal from "@/src/common/Modal";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { useSession } from "next-auth/react";

import {
  Lead,
  FilterState,
  DateFilterType,
  status_Tabs,
  headers,
  platformData,
  categoryData,
  propertytypedata,
  leaddata,
  filtersdata,
  statusFieldConfig,
} from "./types";
import { FiSliders } from "react-icons/fi";
import { BiLogoWhatsapp } from "react-icons/bi";
import { MdSms } from "react-icons/md";
import LeadCard from "./Leadcard";
import PaginationControls from "../CrmView/pagination";
import LeadDetailsModal from "./Leaddetailsmodal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
);

interface LeadsOverviewProps {
  allLeads: Lead[];
  setAllLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  user: any;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedFilters: FilterState;
  setSelectedFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedDateFilter: DateFilterType;
  setSelectedDateFilter: React.Dispatch<React.SetStateAction<DateFilterType>>;
  customRange: { startDate: string; endDate: string };
  setCustomRange: React.Dispatch<
    React.SetStateAction<{ startDate: string; endDate: string }>
  >;
  activeStatus: string;
  setActiveStatus: React.Dispatch<React.SetStateAction<string>>;
  categorized: { total: number; states: Record<string, number> };
  statusData: { total: number; statuses: Record<string, number> };
  roleData: { total: number; roles: Record<string, number> };
  todayLeadsCount: number;
  selectedLeads: string[];
  setSelectedLeads: React.Dispatch<React.SetStateAction<string[]>>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  openFileModal: boolean;
  setOpenFileModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleFileUpload: (event: any) => void;
  handleUpload: () => void;
  applyFilter: () => void;
  hasPermission: (module: string, action: string) => boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  selectedBranch:any;
  setSelectedBranch:any;
  setFormData: any;
  formData: any;
  selectedLeadId: any;
  setSelectedLeadId: any;
}
interface BranchList {
  branchName: string;
  branchId: string;
}

export default function LeadsOverview({
  allLeads,
  setAllLeads,
  user,
  searchQuery,
  setSearchQuery,
  selectedFilters,
  setSelectedFilters,
  selectedDateFilter,
  setSelectedDateFilter,
  customRange,
  setCustomRange,
  activeStatus,
  setActiveStatus,
  categorized,
  statusData,
  roleData,
  todayLeadsCount,
  selectedLeads,
  setSelectedLeads,
  openModal,
  setOpenModal,
  openFileModal,
  setOpenFileModal,
  selectedFile,
  handleFileUpload,
  handleUpload,
  applyFilter,
  hasPermission,
  fileInputRef,
  setFormData,
  formData,
  setSelectedLeadId,
  selectedLeadId,
  selectedBranch,
  setSelectedBranch,

}: LeadsOverviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [dateValue, setDateValue] = useState<string>("");
  const [reviewValue, setReviewValue] = useState<string>("");
  const [dateErrors, setDateErrors] = useState<{ date?: string; rejectionReason?: string }>({});
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [bulkSendChannel, setBulkSendChannel] = useState<"whatsapp" | "sms" | "both">("whatsapp");
  const [bulkSendMessage, setBulkSendMessage] = useState("");
  const [bulkSendLoading, setBulkSendLoading] = useState(false);
  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  // const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const { data: sessionData } = useSession();

  type LeadStatusPayload = {
    leadstatus: string;
    followUpDate?: string;
    visitScheduledAt?: string;
    visitDoneAt?: string;
    review?: string;
    rejectionReason?: string;
  };

  const handleChange = (value: string, id: string) => {
    const lead = allLeads.find((l: any) => l.id === id);
    const statusesNeedingModal = [
      "Follow-up",
      "Visit Scheduled",
      "Visit Done",
      "completed",
      "Not Interested",
      "Rejected",
      "Lost",
    ];
    if (statusesNeedingModal.includes(value)) {
      setPendingStatus(value);
      setPendingLeadId(id);
      setStatusModalOpen(true);
    } else {
      handleStatusSelect({ leadstatus: value }, id, lead.branchId);
    }
  };

  const handleStatusSelect = async (
    payload: LeadStatusPayload,
    leadId: string,
    branchId: string,
  ) => {
    setAllLeads((prevLeads: any) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, ...payload } : lead,
      ),
    );

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.crmlead}/${leadId}/leadstatus`,
        {
          ...payload,
          actorId: user?.id,
          actorBranchId: branchId,
        },
        true,
      );

      if (res.status === 200) {
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };
  const fetchBranches = async () => {
    // Branch listing API removed; leave branchOptions empty to avoid 404s.
    setBranchOptions([]);
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  const handleModalSubmit = () => {
    const newErrors: { date?: string; rejectionReason?: string } = {};

    if (
      ["Follow-up", "Visit Scheduled", "Visit Done"].includes(pendingStatus)
    ) {
      if (!dateValue) {
        newErrors.date = "Please select a date";
      } else {
        const selectedDate = new Date(dateValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) {
          newErrors.date = "Date must be in the future";
        }
      }
    }

    if (["Not Interested", "Rejected", "Lost"].includes(pendingStatus)) {
      if (!reviewValue?.trim()) {
        newErrors.rejectionReason = "Please provide a reason for rejection";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setDateErrors(newErrors);
      return;
    }
    setDateErrors({});

    const payload: LeadStatusPayload = { leadstatus: pendingStatus };

    if (pendingStatus === "Follow-up") payload.followUpDate = dateValue;
    else if (pendingStatus === "Visit Scheduled")
      payload.visitScheduledAt = dateValue;
    else if (pendingStatus === "Visit Done") payload.visitDoneAt = dateValue;
    else if (pendingStatus === "completed" && reviewValue?.trim())
      payload.review = reviewValue.trim();
    else if (
      ["Not Interested", "Rejected", "Lost"].includes(pendingStatus) &&
      reviewValue?.trim()
    )
      payload.rejectionReason = reviewValue.trim();

    if (pendingLeadId) {
      const lead = allLeads.find((l: any) => l.id === pendingLeadId);
      if (lead) {
        handleStatusSelect(payload, pendingLeadId, lead.branchId);
      }
    }
    (document.activeElement as HTMLElement | null)?.blur();
    setStatusModalOpen(false);
    setDateValue("");
    setReviewValue("");
  };

  // State options from leads
  const stateOptions = useMemo(() => {
    const uniqueStates = Array.from(
      new Set(
        allLeads
          .map((lead) => lead.state?.trim().toLowerCase() || "")
          .filter(Boolean),
      ),
    );

    return uniqueStates.map((state) => ({
      id: state,
      label: state
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
  }, [allLeads]);

  const isEmpty = (filters?: Record<string, boolean> | null) =>
    !filters ||
    Object.keys(filters).length === 0 ||
    Object.values(filters).every((val) => !val);

  const filteredData = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();

    return (allLeads || []).filter((lead) => {
      const matchedSearch =
        (lead?.Fullname || "").toLowerCase().includes(q) ||
        String(lead?.Phonenumber || "").includes(searchQuery || "") ||
        (lead?.city || "").toLowerCase().includes(q);

      const propertyTypeFilters = selectedFilters?.propertytypedata ?? {};
      const matchesPropertyType =
        isEmpty(propertyTypeFilters) ||
        !!propertyTypeFilters[String(lead?.propertytype || "")];

      const categoryFilters = selectedFilters?.categoryData ?? {};
      const matchesCategory =
        isEmpty(categoryFilters) ||
        !!categoryFilters[String(lead?.serviceType || "")];

      const leadStatusFilters = selectedFilters?.leaddata ?? {};
      const matchesLeadStatus =
        isEmpty(leadStatusFilters) ||
        !!leadStatusFilters[String(lead?.leadstatus || "")];

      const stateFilters = selectedFilters?.stateData ?? {};
      const leadStateKey = String(lead?.state || "")
        .trim()
        .toLowerCase();
      const matchesState =
        isEmpty(stateFilters) || !!stateFilters[leadStateKey];

      const matchesBranch =
        !selectedBranch || lead?.branchId === selectedBranch;

      return (
        matchedSearch &&
        matchesPropertyType &&
        matchesCategory &&
        matchesLeadStatus &&
        matchesState &&
        matchesBranch
      );
    });
  }, [allLeads, searchQuery, selectedFilters, selectedBranch]);

  const statusFilteredLeads = useMemo(() => {
    if (activeStatus === "all") return filteredData;
    if (activeStatus === "__future_potential__") {
      return filteredData.filter((lead) => lead.isFuturePotential === true);
    }
    return filteredData.filter(
      (lead) =>
        lead.leadstatus?.trim().toLowerCase() ===
        activeStatus.trim().toLowerCase(),
    );
  }, [filteredData, activeStatus]);
  const membership = sessionData?.user?.branchMemberships?.[0];

  const canShowBranchFilter =
    membership?.branchRoles?.some((r) => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";

  const paginatedData = useMemo(() => {
    return statusFilteredLeads.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
  }, [statusFilteredLeads, currentPage, pageSize]);

  const totalPages = Math.ceil(statusFilteredLeads.length / pageSize);

  // Drag and drop handlers
  const onDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (status: string) => {
    if (draggedLead) {
      handleChange(status, draggedLead.id);
      setDraggedLead(null);
    }
  };
  const handleAssignUser = async (leadId: string, userId: string) => {
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.crmlead}/assign/${leadId}/${userId}/3`,
        true,
      );
      if (response.status === 201) {
        toast.success("Lead assigned successfully");
      }
    } catch (error) {
      console.error("Error assigning lead:", error);
    }
    // handleuserMenuClose();
  };
  const handleDelete = async (lead: any) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.crmlead}/${lead.id}?branchId=${lead.branchId}`,
        {},
        true,
      );

      if (res.status === 200) {
        setAllLeads((prev) => prev.filter((l) => l.id !== lead?.id));
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleEdit = (lead) => {
    setFormData(lead);
    setSelectedLeadId(lead.id);
    setOpenModal(true);
  };

  const handleBulkSend = async () => {
    if (statusFilteredLeads.length === 0) {
      toast.error("No leads to send to");
      return;
    }
    setBulkSendLoading(true);
    try {
      const branchId = statusFilteredLeads[0]?.branchId || selectedBranch;
      const res = await apiClient.post(
        `${apiClient.URLS.crmlead}/bulk-send`,
        {
          leadIds: statusFilteredLeads.map((l) => l.id),
          channel: bulkSendChannel,
          branchId,
          customMessage: bulkSendMessage.trim() || undefined,
        },
        true,
      );
      const body = res?.body || {};
      toast.success(`Sent: ${body.sent || 0}, Failed: ${body.failed || 0}`);
      setBulkSendOpen(false);
      setBulkSendMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Bulk send failed");
    } finally {
      setBulkSendLoading(false);
    }
  };

  const handleUpdateLead = async (
    leadId: string,
    patch: Partial<Lead>,
  ) => {
    const lead = allLeads.find((l: any) => l.id === leadId);
    if (!lead?.branchId) return;
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.crmlead}/${leadId}`,
        { ...patch, actorBranchId: lead.branchId },
        true,
      );
      if (res.status === 200 && res.body) {
        const updated = { ...lead, ...res.body };
        setAllLeads((prev) =>
          prev.map((l) => (l.id === leadId ? updated : l)),
        );
        if (selectedLead?.id === leadId) setSelectedLead(updated);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update lead");
    }
  };

  // Platform chart data
  const platformCounts = platformData.map((p) => {
    const count = statusFilteredLeads.filter(
      (lead) =>
        lead.platform?.trim().toLowerCase() === p.platform.trim().toLowerCase(),
    ).length;
    return { platform: p.platform, count };
  });

  const chartData = {
    labels: platformCounts.map((p) => p.platform),
    datasets: [
      {
        label: "Leads Per Platform",
        data: platformCounts.map((p) => p.count),
        backgroundColor: "#6B7280",
        borderColor: "#6B7280",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Leads Per Platform",
        color: "#000000",
        font: { size: 18, weight: 700 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#000000", font: { weight: 500 } },
        grid: { drawBorder: false, color: "#e0e0e0" },
      },
      y: {
        ticks: { color: "#000000", font: { weight: 500 } },
      },
    },
  };

  return (
    <div className="space-y-4 px-1">
      {/* Saved Views - Already rendered in parent */}

      {/* Stats Cards */}
      <div className="flex md:flex-nowrap flex-wrap items-stretch max-md:justify-center md:gap-4 gap-3">
        {/* Total Leads by States */}
        <div className="relative md:max-w-[320px] w-full min-h-[250px] h-full rounded-xl bg-white border border-gray-200 shadow-sm px-3 py-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Total Leads
              </p>
              <h2 className="text-xl font-bold text-gray-800">
                {categorized?.total}
              </h2>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FaUsers className="text-blue-600 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {Object.entries(categorized.states)
              .sort((a, b) => b[1] - a[1])
              .map(([state, count]) => (
                <div
                  key={state}
                  className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-[#5297ff] flex-shrink-0" />
                    <span className="text-[12px] font-medium text-gray-700 truncate capitalize">
                      {state.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Leads by Status */}
        <div className="relative md:max-w-[320px] w-full min-h-[250px] h-full rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Leads by Status
              </p>
              <h2 className="text-xl font-bold text-gray-800">
                {statusData.total}
              </h2>
            </div>
          </div>

          <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {leaddata
              .map((status) => ({
                status: status.leadstatus,
                count: statusData.statuses[status.leadstatus] || 0,
              }))
              .filter(({ count }) => count > 0)
              .sort((a, b) => b.count - a.count)
              .map(({ status, count }) => (
                <div
                  key={status}
                  className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-gray-700">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Leads by Category */}
        <div className="relative md:max-w-[320px] w-full min-h-[250px] h-full rounded-xl bg-white border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Leads By Roles
              </p>
              <h2 className="text-xl font-bold text-gray-800">
                {roleData.total}
              </h2>
            </div>
          </div>

          <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {Object.entries(roleData.roles).map(([role, count]) => (
              <div
                key={role}
                className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="text-[12px] font-medium text-gray-700 truncate capitalize"
                    title={role.replace(/_/g, " ")}
                  >
                    {role.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Tabs - Mobile */}
      <div className="flex px-3 md:hidden w-full bg-white shadow-custom custom-scrollbar py-2 gap-1 md:mb-4 mb-2 overflow-x-auto">
        {status_Tabs.map((status, index) => (
          <Button
            key={index}
            onClick={() => {
              setActiveStatus(status.value);
              setCurrentPage(1);
            }}
            onDragOver={onDragOver}
            onDrop={() => onDrop(status.value)}
            className={`md:px-3 px-2 py-1.5 text-nowrap rounded-lg text-[10px] md:text-[11px] font-semibold flex items-center gap-2 transition-all ${
              activeStatus === status.value
                ? "bg-[#3586FF] text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span className="md:text-[12px] text-[10px]">{status.icon}</span>
            {status.label}
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-2 flex md:flex-row flex-col items-start shadow-custom rounded-[8px] md:px-2 px-0 py-4 border-[3px] w-[100%]">
        {/* Left Sidebar - Leads List */}
        <div className="md:max-w-[30%] max-w-full w-full bg-white border-r border-gray-200 md:rounded-xl rounded-lg shadow-sm max-h-[670px] max-md:mb-6 custom-scrollbar overflow-x-hidden overflow-y-auto">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-100 py-3 px-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#3586FF]  md:text-[16px] text-[14px]">
                All Leads
              </p>
              <p className="font-medium md:text-[13px] text-[12px]">
                Total: {statusFilteredLeads.length}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 px-2 py-2 custom-scrollbar-y overflow-x-hidden">
            {paginatedData?.length > 0 ? (
              paginatedData.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onDragStart={() => onDragStart(lead)}
                  onClick={() => {
                    setSelectedLead(lead);
                    setOpenDetailsModal(true);
                  }}
                  onStatusChange={(id, status) => handleChange(status, id)}
                  hasPermission={hasPermission}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAssign={handleAssignUser}
                  roleUsers={[]}
                />
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 text-[14px] font-medium">
                  No leads found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="space-y-2 w-full md:max-w-[70%] max-w-full overflow-x-hidden overflow-y-hidden">
          {/* Status Tabs - Desktop */}
          <div className="hidden px-3 md:flex w-full bg-white shadow-custom custom-scrollbar py-2 gap-1 md:mb-4 mb-2">
            {status_Tabs.map((status, index) => (
              <Button
                key={index}
                onClick={() => {
                  setActiveStatus(status.value);
                  setCurrentPage(1);
                }}
                onDragOver={onDragOver}
                onDrop={() => onDrop(status.value)}
                className={`md:px-2 px-2 py-1 text-nowrap rounded-md text-[10px] md:text-[11px] font-bold flex items-center gap-1 ${
                  activeStatus === status.value
                    ? "bg-[#3586FF] text-white"
                    : "bg-gray-100 border-[1px] border-gray-300 text-gray-600"
                }`}
              >
                <span className="md:text-[12px] text-[10px]">
                  {status.icon}
                </span>
                {status.label}
              </Button>
            ))}
          </div>
          {bulkSendOpen && (
            <Modal
              isOpen={bulkSendOpen}
              closeModal={() => !bulkSendLoading && setBulkSendOpen(false)}
              title="Bulk Send Messages"
              isCloseRequired={true}
              titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF]"
              className="md:max-w-[450px] max-w-[95vw]"
              rootCls="z-[9999]"
            >
              <div className="px-4 py-3 space-y-4">
                <p className="text-sm text-gray-600">
                  Send to <strong>{statusFilteredLeads.length}</strong> lead
                  {statusFilteredLeads.length !== 1 ? "s" : ""} in current view
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <div className="flex gap-2">
                    {(["whatsapp", "sms", "both"] as const).map((ch) => (
                      <Button
                        key={ch}
                        type="button"
                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                          bulkSendChannel === ch
                            ? "bg-[#3586FF] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        onClick={() => setBulkSendChannel(ch)}
                      >
                        {ch === "whatsapp" && <BiLogoWhatsapp className="inline mr-1" />}
                        {ch === "sms" && <MdSms className="inline mr-1" />}
                        {ch.charAt(0).toUpperCase() + ch.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom message (optional)
                  </label>
                  <textarea
                    value={bulkSendMessage}
                    onChange={(e) => setBulkSendMessage(e.target.value)}
                    placeholder="Leave blank for default template"
                    className="w-full min-h-[80px] border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    className="border border-gray-300 px-4 py-2 rounded-md text-sm"
                    onClick={() => !bulkSendLoading && setBulkSendOpen(false)}
                    disabled={bulkSendLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-[#3586FF] text-white px-4 py-2 rounded-md text-sm disabled:opacity-60"
                    onClick={handleBulkSend}
                    disabled={bulkSendLoading}
                  >
                    {bulkSendLoading ? "Sending…" : "Send"}
                  </Button>
                </div>
              </div>
            </Modal>
          )}
          {statusModalOpen && (
            <Modal
              isOpen={statusModalOpen}
              closeModal={() => setStatusModalOpen(false)}
              title={pendingStatus}
              isCloseRequired={false}
              titleCls="font-medium uppercase md:text-[18px] text-[12px] text-center text-[#3586FF] "
              className="md:max-w-[400px] max-w-[300px] "
              rootCls="z-[99999] "
            >
              <div>
                <form
                  className="flex flex-col md:px-4 px-2 justify-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleModalSubmit();
                  }}
                >
                  {["Follow-up", "Visit Scheduled", "Visit Done"].includes(
                    pendingStatus,
                  ) && (
                    <div>
                      <CustomDate
                        type="date"
                        label={
                          statusFieldConfig[pendingStatus]?.label ||
                          "Select Date"
                        }
                        labelCls="md:text-[16px] mt-2 text-[12px] font-medium"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        placeholder="Date"
                        className="md:px-2 px-1 md:py-1 py-[0.5px]"
                        name={statusFieldConfig[pendingStatus]?.name || "date"}
                        errorMsg={dateErrors.date}
                      />
                    </div>
                  )}
                  {pendingStatus === "completed" && (
                    <div className="mt-2">
                      <CustomInput
                        type="textarea"
                        label="Review"
                        labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                        name="review"
                        className="w-full min-h-[100px] md:min-h-[120px] border border-[#CFCFCF] rounded-md px-3  text-sm md:text-[14px]"
                        value={reviewValue}
                        onChange={(e) => setReviewValue(e.target.value)}
                        placeholder="Write a short review / remark…"
                        required
                      />
                    </div>
                  )}
                  {["Not Interested", "Rejected", "Lost"].includes(pendingStatus) && (
                    <div className="mt-2">
                      <CustomInput
                        type="textarea"
                        label="Reason for Rejection"
                        labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                        name="rejectionReason"
                        className="w-full min-h-[100px] md:min-h-[120px] border border-[#CFCFCF] rounded-md px-3  text-sm md:text-[14px]"
                        value={reviewValue}
                        onChange={(e) => setReviewValue(e.target.value)}
                        placeholder="Why was this lead rejected? (e.g. Budget mismatch, timeline not suitable…)"
                        required
                        errorMsg={dateErrors.rejectionReason}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-10 md:px-10">
                    <Button type="button"
                      className="md:py-[6px] py-1 md:px-[14px] px-[10px] md:rounded-[8px] rounded-[4px] border-2 btn-text border-[#3B82F6]"
                      onClick={() => setStatusModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      //  onClick={handleModalSubmit}
                      className="md:py-[6px] py-1 md:px-[14px] px-[10px] md:rounded-[8px] rounded-[4px] border-2   btn-text bg-[#3B82F6] text-white"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>
          )}

          {/* Filters & Actions */}
          <div className="md:flex hidden  md:flex-row flex-col items-center md:gap-2 gap-1 max-w-full w-[100%] scrollbar-custom overflow-visible md:z-[99] z-[9]">
                        <div className="flex-[2] px-2">
              <div className="flex items-center md:gap-2 gap-1">
                <ReusableSearchFilter
                  searchText={searchQuery}
                  placeholder="Search by name, phone, city"
                  className="!py-[0px] md:!py-[0px]"
                  onSearchChange={setSearchQuery}
                  branchOptions={branchOptions}
                  selectedBranch={selectedBranch}
                  onBranchChange={(opt) => {
                    setSelectedBranch(opt?.value ?? null);
                  }}
                  filters={[
                    {
                      groupLabel: "Property Type",
                      key: "propertytypedata",
                      options: propertytypedata.map((item) => ({
                        id: String(item.propertytype),
                        label: String(item.propertytype)
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" "),
                      })),
                    },
                    {
                      groupLabel: "Category",
                      key: "categoryData",
                      options: categoryData.map((item) => ({
                        id: String(item.role),
                        label: item.role,
                      })),
                    },
                    {
                      groupLabel: "Lead Status",
                      key: "leaddata",
                      options: leaddata.map((item) => ({
                        id: String(item.leadstatus),
                        label: item.leadstatus,
                      })),
                    },
                    {
                      groupLabel: "State",
                      key: "stateData",
                      options: stateOptions,
                    },
                  ]}
                  selectedFilters={selectedFilters}
                  onFilterChange={setSelectedFilters}
                  showBranchFilter={canShowBranchFilter}
                />

                {/* Date Filter */}
                <div className="relative">
                  <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:text-[14px] text-[10px] text-nowrap md:py-[4px] py-[3px] md:px-4 px-2 rounded-lg focus:outline-none "
                  >
                    <FiSliders className="text-gray-500" />
                    Sort By
                  </Button>
                  {isOpen && (
                    <div className="absolute top-8 -right-2 md:w-[250px] w-[160px] mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-[9999] text-[12px] md:text-[14px]">
                      <ul className="py-2">
                        {filtersdata.map((filter) => (
                          <li
                            key={filter.id}
                            className="flex items-center md:gap-2 gap-2 px-3 py-2"
                          >
                            <input
                              type="radio"
                              id={filter.id}
                              name="dateFilter"
                              checked={selectedDateFilter === filter.id}
                              onChange={() => setSelectedDateFilter(filter.id)}
                            />
                            <label htmlFor={filter.id} className="font-medium">
                              {filter.label}
                            </label>
                          </li>
                        ))}
                        {selectedDateFilter === "custom" && (
                          <li className="px-3 py-2">
                            <CustomDate
                              type="date"
                              label="Start Date"
                              labelCls="md:text-[16px] mt-2 text-[12px] font-medium"
                              value={customRange.startDate}
                              onChange={(e) =>
                                setCustomRange({
                                  ...customRange,
                                  startDate: e.target.value,
                                })
                              }
                              placeholder="Date"
                              className="px-3 md:py-1 py-[2px]"
                              name="date"
                            />
                            <CustomDate
                              type="date"
                              label="End Date"
                              labelCls="md:text-[16px] mt-2 text-[12px] font-medium"
                              value={customRange.endDate}
                              onChange={(e) =>
                                setCustomRange({
                                  ...customRange,
                                  endDate: e.target.value,
                                })
                              }
                              placeholder="Date"
                              className="px-3 md:py-1 py-[2px]"
                              name="date"
                            />
                          </li>
                        )}
                      </ul>
                      <div className="flex justify-end px-3 py-2 gap-2">
                        <Button
                          className="md:py-2 py-1 md:px-3 px-1 rounded-md border-2 md:text-[12px] text-[10px] font-medium border-[#3B82F6]"
                          onClick={() => setIsOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="md:py-2 py-1 md:px-3 px-1 rounded-md border-2 md:text-[12px] text-[10px] font-medium bg-[#3B82F6] text-white"
                          onClick={applyFilter}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center md:gap-3 gap-1">
              <Button
                className="bg-[#5297ff] md:text-[14px] text-nowrap text-[12px] font-medium text-white px-5 py-1 rounded-[4px] md:rounded-md"
                onClick={() => setOpenFileModal(true)}
              >
                CSV Uploader
              </Button>

              <Button
                className="px-2 py-1 bg-emerald-600 text-nowrap hover:bg-emerald-700 text-white md:rounded-[6px] font-medium rounded-[4px] flex items-center gap-2 md:text-[14px] text-[12px] flex-nowrap"
                onClick={() => setBulkSendOpen(true)}
              >
                <BiLogoWhatsapp className="md:text-[14px] text-[12px]" />
                Bulk Send
              </Button>
              <CSVLink
                data={allLeads}
                headers={headers}
                filename={`onecasa-leads-${
                  new Date().toISOString().split("T")[0]
                }.csv`}
              >
                <Button className="px-2 py-1 bg-[#5297ff] text-white md:rounded-[6px] font-medium rounded-[4px] flex items-center gap-2 md:text-[14px] text-[12px] flex-nowrap">
                  <LuDownload className="text-white md:text-[14px] text-[12px]" />
                  Export
                </Button>
              </CSVLink>

              <CustomTooltip
                label="Access Restricted Contact Admin"
                position="bottom"
                tooltipBg="bg-black/60 backdrop-blur-md"
                tooltipTextColor="text-white py-2 px-4 font-medium"
                labelCls="text-[10px] font-medium"
                // showTooltip={!hasPermission("crm", "create")}
              >
                <Button
                  // disabled={!hasPermission("crm", "create")}
                  className="bg-[#5297ff] md:text-[14px] text-[12px] font-medium text-white md:px-[14px] px-[7px] py-0 md:py-[6px] rounded-[4px] md:rounded-md flex items-center gap-1"
                  onClick={() => setOpenModal(true)}
                >
                  <FaPlus />
                  {/* Add Lead */}
                </Button>
              </CustomTooltip>
            </div>
          </div>

          {/* Stats & Chart */}
          <div className="md:max-w-full max-w-full w-[100%] md:px-[5px] px-0 flex flex-col">
            <div className="flex items-stretch">
              <div className="flex-1 bg-gray-50 flex flex-col gap-6 items-center">
                <div className="flex items-center md:gap-4 gap-2 w-full md:px-8 px-2">
                  <div className="bg-gradient-to-r from-white to-gray-200 text-black md:p-4 px-2 py-1 md:rounded-[8px] rounded-[4px] shadow-custom flex items-center justify-between gap-3 transform hover:scale-105 transition-transform duration-200 md:w-full md:max-w-full w-[170px]">
                    <div className="bg-gray-500 md:p-3 p-1 rounded-full">
                      <FaUsers className="text-white md:text-[20px] text-[14px]" />
                    </div>
                    <div>
                      <span className="md:text-[18px] text-[16px] font-bold">
                        {statusFilteredLeads.length}
                      </span>
                      <p className="text-[10px] font-medium md:text-[14px] opacity-80">
                        Total Leads
                      </p>
                    </div>
                  </div>

                  <div className="md:max-w-full md:w-full max-w-[270px] bg-gradient-to-r from-white to-gray-200 text-black md:p-4 px-2 py-1 md:rounded-[8px] rounded-[4px] shadow-custom flex items-center justify-between gap-3 transform hover:scale-105 w-[170px] transition-transform duration-200">
                    <div className="bg-gray-500 md:p-3 p-1 rounded-full">
                      <FaCalendarDay className="text-white md:text-[20px] text-[14px]" />
                    </div>
                    <div>
                      <span className="md:text-[18px] text-[16px] font-bold">
                        {todayLeadsCount}
                      </span>
                      <p className="text-[10px] md:text-[14px] font-medium opacity-80">
                        Today's Leads
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:min-h-[80%] min-h-[50%] md:px-4 px-2">
                  <Bar
                    data={chartData}
                    options={{ ...chartOptions, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-end justify-end md:mt-0 mt-2 max-md:mb-5">
        {statusFilteredLeads.length > 10 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Lead Details Modal */}
      {selectedLead && openDetailsModal && (
        <LeadDetailsModal
          lead={selectedLead}
          open={openDetailsModal}
          onClose={() => {
            setOpenDetailsModal(false);
            setSelectedLead(null);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={(id, status) => handleChange(status, id)}
          onUpdateLead={handleUpdateLead}
          hasPermission={hasPermission}
        />
      )}
    </div>
  );
}
