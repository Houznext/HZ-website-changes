import React, { useState, useEffect, useCallback, useMemo } from "react";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import { useRouter } from "next/router";
import Loader from "@/src/common/Loader";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import PaginationControls from "@/src/components/CrmView/pagination";
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
  const [entityData, setEntityData] = useState<any>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const path = router.asPath;
    const idFromQuery = (router.query.id as string) || null;
    if (path.includes("/projects/")) {
      setEntityId(idFromQuery);
    }
  }, [router.isReady, router.query.id, router.asPath]);

  const fetchEntityData = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.company_Onboarding}/projects/${entityId}`
      );
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
  }, [entityId]);

  const fetchNormalLeads = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const url = `${apiClient.URLS.property_leads}/${entityId}`;
      const response = await apiClient.get(url, { isProject: true });
      if (response.status === 200) {
        const list = Array.isArray(response.body) ? response.body : [];
        setAllLeads(list);
      } else {
        setAllLeads([]);
      }
    } catch (err) {
      console.error(err);
      setAllLeads([]);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    if (!entityId) return;
    fetchEntityData();
    fetchNormalLeads();
  }, [entityId, fetchEntityData, fetchNormalLeads]);

  const normalCsvHeaders = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Agree to Contact", key: "agreeToContact" },
    { label: "Interested in Loan", key: "interestedInLoan" },
  ];

  const entityTitle =
    entityData?.Name ?? entityData?.name ?? "-";

  const totalPages = useMemo(
    () => Math.ceil((allLeads.length || 0) / pageSize) || 1,
    [pageSize, allLeads.length]
  );

  const pageLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allLeads.slice(start, start + pageSize);
  }, [allLeads, currentPage, pageSize]);

  const effectiveTotal = allLeads.length;

  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages]
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const csvFilename = `Leads_${entityTitle}_Normal.csv`;
  const from = effectiveTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to =
    effectiveTotal === 0 ? 0 : Math.min(currentPage * pageSize, effectiveTotal);

  return (
    <>
      <div className="w-full p-4 md:p-6">
        <div className="w-full max-w-[1200px]">
          <div className="flex flex-col gap-3 md:gap-4">
            <BackRoute />

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
                  data={allLeads}
                  headers={normalCsvHeaders}
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
                    {[
                      "Name",
                      "Email",
                      "Phone Number",
                      "Agree to Contact",
                      "Interested in Loan",
                    ].map((h) => (
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
                      <TableCell colSpan={5} className="p-0">
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  )}

                  {pageLeads.map((lead: any, index: number) => (
                    <TableRow
                      key={lead?.id ?? index}
                      className="hover:bg-gray-50/80 transition border-b border-gray-100"
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

            <div className="border-t border-gray-200 bg-gray-50 px-3 md:px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs text-gray-600">
                  Showing <span className="font-medium">{from}</span> to{" "}
                  <span className="font-medium">{to}</span> of{" "}
                  <span className="font-medium">{effectiveTotal}</span> results
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
