import React, { useState, useEffect, useCallback } from "react";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "../Loader";
import { BackArrow } from "../Property/PropIcons";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import usePostPropertyStore, { PropertyStore } from "@/store/postproperty";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import BackRoute from "@/common/BackRoute";
import Link from "next/link";

export default function ViewLeadsComponent() {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [property, setProperty] = useState<PropertyStore>();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertyid, setPropertyid] = useState<string | null>(null);
  const router = useRouter();
  const [entityId, setEntityId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState<"property" | "project" | null>(
    null
  );
  const [entityData, setEntityData] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const path = router.asPath;

    if (path.includes("/properties/")) {
      setEntityType("property");
      setEntityId(router.query.id as string);
    } else if (path.includes("/company-property/") && path.includes("/leads")) {
      setEntityType("project");
      setEntityId(router.query.projectId as string);
    }
  }, [router.isReady, router.query, router.asPath]);

  const fetchLeads = useCallback(async () => {
    if (!entityId || !entityType) return;
    setLoading(true);
    try {
      const url = `${apiClient.URLS.property_leads}/${entityId}?isProject=${entityType === "project"
        }`;
      const response = await apiClient.get(url);

      if (response.status === 200) {
        setAllLeads(response.body);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  const fetchEntityData = useCallback(async () => {
    if (!entityId || !entityType) return;
    setLoading(true);
    try {
      const url =
        entityType === "property"
          ? `${apiClient.URLS.property}/${entityId}`
          : `${apiClient.URLS.companyonboarding}/projects/${entityId}`;
      const response = await apiClient.get(url);
      if (response.status === 200) {
        setEntityData(response.body);
      }
    } catch (error) {
      console.error("Error fetching entity:", error);
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType]);

  useEffect(() => {
    if (entityId && entityType) {
      fetchEntityData();
      fetchLeads();
    }
  }, [entityId, entityType, fetchLeads]);

  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "agreeToContact", key: "agreeToContact" },
    { label: "interestedInLoan", key: "interestedInLoan" },
  ];
  const leadsPerPage = 10;

  const totalPages = Math.ceil(allLeads.length / leadsPerPage);
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
        Leads for this property will appear here.
      </p>
    </div>
  );
  if (loading) {
    <Loader />;
  }

  return (
    <>
      <div className="p-6 w-full flex flex-col md:gap-6 gap-3 bg-gray-50 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center mb-2">
            <BackRoute />
          </div>
          {allLeads.length > 0 && <div className=" md:mt-[10px] mt-[8px] flex items-end justify-end md:mb-[0px] mb-[5px]">
            <CSVLink
              data={allLeads}
              headers={headers}
              filename={`Leads_${property?.propertyDetails?.propertyName || "Default"
                }.csv`}
            >
              <Button className="md:px-8  px-3 md:py-4 py-2 bg-[#3586FF] md:text-[16px] text-[12px] text-white rounded-[6px] flex items-center gap-2">
                <span>
                  {" "}
                  <LuDownload className="text-white md:text-[20px] text-[14px]" />
                </span>{" "}
                <span>Download</span>
              </Button>
            </CSVLink>
          </div>}


          <div className="flex flex-col gap-1 items-start">
            <h1 className="font-bold md:text-[18px] text-[16px] ">
              {" "}
              Leads of{" "}
              {entityType === "project"
                ? entityData?.Name
                : entityData?.propertyDetails?.propertyName}
            </h1>
            <div className="text-gray-500 font-medium text-[10px] md:text-[12px]">
              Below is the list of all leads for{" "}
              <span className="font-bold">
                {entityType === "project"
                  ? entityData?.Name
                  : entityData?.propertyDetails?.propertyName}
              </span>
              . You can download the CSV .
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl md:max-w-full w-full max-w-[370px]   shadow-sm overflow-x-auto border border-gray-100 md:p-2 p-1">
          <TableContainer
            component={Paper}
            elevation={0}
            className="!bg-transparent shadow-custom md:rounded-[10px] rounded-[4px]"
          >
            <Table className="min-w-max table-auto">
              <TableHead>
                <TableRow className="bg-gradient-to-r from-[#3586FF] to-blue-600 shadow-md">
                  <TableCell className="bg-[#3586FF] text-white text-nowrap md:py-2 py-1 px-4 font-bold text-[12px] md:text-[14px] sticky top-0 z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <FiUser className="text-white md:text-[16px] text-[12px]" />
                      </div>
                      <span>Name</span>
                    </div>
                  </TableCell>

                  <TableCell className="bg-[#3586FF] text-white text-nowrap md:py-2 py-1 px-4 font-bold text-[12px] md:text-[14px] sticky top-0 z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <FiMail className="text-white  md:text-[16px] text-[12px]" />
                      </div>
                      <span>Email</span>
                    </div>
                  </TableCell>

                  <TableCell className="bg-[#3586FF] text-white text-nowrap md:py-2 py-1 px-4 font-bold text-[12px] md:text-[14px] sticky top-0 z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <FiPhone className="text-white  md:text-[16px] text-[12px]" />
                      </div>
                      <span>Phone</span>
                    </div>
                  </TableCell>

                  <TableCell className="bg-[#3586FF] text-white text-nowrap md:py-2 py-1 px-4 font-bold text-[12px] md:text-[14px] sticky top-0 z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <FiCheckCircle className="text-white md:text-[16px] text-[12px]" />
                      </div>
                      <span>Contact Consent</span>
                    </div>
                  </TableCell>

                  <TableCell className="bg-[#3586FF] text-white text-nowrap md:py-2 py-1 px-4 font-bold text-[12px] md:text-[14px] sticky top-0 z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <FiDollarSign className="text-white  md:text-[16px] text-[12px]" />
                      </div>
                      <span>Loan Interest</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {allLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}

                {allLeads
                  .slice(
                    (currentPage - 1) * leadsPerPage,
                    currentPage * leadsPerPage
                  )
                  .map((lead: any, index: number) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <TableCell
                        align="center"
                        className="font-medium text-gray-800 md:text-[14px] text-[12px] px-4 md:py-2 py-1"
                      >
                        {lead.name || "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-medium text-gray-800 md:text-[14px] text-[12px] px-4 md:py-2 py-1"
                      >
                        {lead.email ? (
                          <Link
                            href={`mailto:${lead.email}`}
                            className="underline"
                          >
                            {lead.email}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-medium text-gray-800 md:text-[14px] text-[12px] px-4 md:py-2 py-1"
                      >
                        {lead.phoneNumber ? (
                          <Link
                            href={`tel:${lead.phoneNumber}`}
                            className="underline"
                          >
                            {lead.phoneNumber}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-medium text-gray-800 md:text-[14px] text-[12px] px-4 md:py-2 py-1"
                      >
                        <BoolBadge value={lead.agreeToContact} />
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-medium text-gray-800 md:text-[14px] text-[12px] px-4 md:py-2 py-1"
                      >
                        <BoolBadge value={lead.interestedInLoan} />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {allLeads.length > 10 && (
          <div className="flex  items-end justify-end md:text-[16px] text-[10px]">
            <div className="flex gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="md:px-4 px-2 md:py-2 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg 
                   disabled:opacity-50
                  flex items-center gap-1"
              >
                <FiChevronLeft />
                Previous
              </Button>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4">
                <span className="font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#3586FF] text-white rounded-lg 
                  disabled:opacity-50
                  flex items-center gap-1"
              >
                Next
                <FiChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
