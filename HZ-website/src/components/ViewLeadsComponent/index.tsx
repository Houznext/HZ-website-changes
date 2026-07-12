import React, { useState, useEffect, useCallback } from "react";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "../Loader";
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

export default function ViewLeadsComponent() {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const [entityId, setEntityId] = useState<string | null>(null);
  const [entityData, setEntityData] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const path = router.asPath;
    if (path.includes("/company-property/") && path.includes("/leads")) {
      setEntityId(router.query.projectId as string);
    }
  }, [router.isReady, router.query, router.asPath]);

  const fetchLeads = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const url = `${apiClient.URLS.property_leads}/${entityId}?isProject=true`;
      const response = await apiClient.get(url);
      if (response.status === 200) {
        setAllLeads(response.body);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  const fetchEntityData = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const url = `${apiClient.URLS.companyonboarding}/projects/${entityId}`;
      const response = await apiClient.get(url);
      if (response.status === 200) {
        setEntityData(response.body);
      }
    } catch (error) {
      console.error("Error fetching entity:", error);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    if (entityId) {
      fetchEntityData();
      fetchLeads();
    }
  }, [entityId, fetchLeads, fetchEntityData]);

  const headers = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "agreeToContact", key: "agreeToContact" },
    { label: "interestedInLoan", key: "interestedInLoan" },
  ];
  const leadsPerPage = 10;
  const totalPages = Math.ceil(allLeads.length / leadsPerPage) || 1;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
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
      <p className="font-bold text-[16px] md:text-[18px]">No leads found yet</p>
      <p className="text-gray-500 text-sm md:text-[14px]">
        Leads for this project will appear here.
      </p>
    </div>
  );

  const pageLeads = allLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  return (
    <>
      <div className="p-6 w-full flex flex-col md:gap-6 gap-3 bg-gray-50 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center mb-2">
            <BackRoute />
          </div>
          {allLeads.length > 0 && (
            <div className=" md:mt-[10px] mt-[8px] flex items-end justify-end md:mb-[0px] mb-[5px]">
              <CSVLink
                data={allLeads}
                headers={headers}
                filename={`Leads_${entityData?.Name || "Default"}.csv`}
              >
                <Button className="md:px-8  px-3 md:py-4 py-2 bg-[#3586FF] md:text-[16px] text-[12px] text-white rounded-[6px] flex items-center gap-2">
                  <span>
                    <LuDownload className="text-white md:text-[20px] text-[14px]" />
                  </span>
                  <span>Download</span>
                </Button>
              </CSVLink>
            </div>
          )}

          <div className="flex flex-col gap-1 items-start">
            <h1 className="font-bold md:text-[18px] text-[16px] ">
              Leads of {entityData?.Name}
            </h1>
            <div className="text-gray-500 font-medium text-[10px] md:text-[12px]">
              Below is the list of all leads for{" "}
              <span className="font-bold">{entityData?.Name}</span>. You can
              download the CSV .
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
                        <FiDollarSign className="text-white md:text-[16px] text-[12px]" />
                      </div>
                      <span>Loan Interest</span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
                {pageLeads.map((lead: any, index: number) => (
                  <TableRow
                    key={lead?.id ?? index}
                    className="hover:bg-blue-50/50 transition border-b border-gray-100"
                  >
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-2">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white border shadow-sm disabled:opacity-40"
            >
              <FiChevronLeft />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-white border shadow-sm disabled:opacity-40"
            >
              <FiChevronRight />
            </Button>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-white/50 backdrop-blur-[1px]">
          <Loader />
        </div>
      )}
    </>
  );
}
