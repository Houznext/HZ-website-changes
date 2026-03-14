import React, { useState, useEffect, useCallback, useMemo } from "react";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { FiArrowLeft } from "react-icons/fi";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import { Delete } from "@mui/icons-material";
import Button from "@/src/common/Button";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import { useSession } from "next-auth/react";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { FiSliders } from "react-icons/fi";
import {
  status_options,
  roleIcons,
  roleColors,
  filtersdata,
} from "@/src/components/CrmView/helper";
import { LuTrash2 } from "react-icons/lu";
import PaginationControls from "@/src/components/CrmView/pagination";
import { BiLogoWhatsapp } from "react-icons/bi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import BackRoute from "@/src/common/BackRoute";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { ServiceCategory } from "@/src/components/NewCrmView/types";
import { MdAdd } from "react-icons/md";
import { Gift } from "lucide-react";

type Role = {
  id: number;
  roleName: string;
};
interface FilterOption {
  id: string;
  label: string;
}
export type FiltersState = {
  [group: string]: Record<string | number, boolean>;
};

type FilterType = (typeof filtersdata)[number]["id"];

export default function ReferandEarnView() {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentpage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();
  const [roleUsers, setRoleUsers] = useState<any[]>([]);
  const [roleId, setRoleId] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const { hasPermission } = usePermissionStore((state) => state);

  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<any>();
  const [customRange, setCustomRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  });

  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const session = useSession();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newReferral, setNewReferral] = useState<{
    friendName: string;
    friendPhone: string;
    friendEmail: string;
    friendCity: string;
    category: ServiceCategory | "";
  }>({
    friendName: "",
    friendPhone: "",
    friendEmail: "",
    friendCity: "",
    category: "",
  });

  function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDateRange(
    filter: FilterType,
    custom?: { startDate: string; endDate: string }
  ) {
    if (filter === "all") return { startDate: null as any, endDate: null as any };

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.setHours(23, 59, 59, 999));

    switch (filter) {
      case "today": {
        const s = new Date();
        s.setHours(0, 0, 0, 0);
        const e = new Date();
        e.setHours(23, 59, 59, 999);
        startDate = s;
        endDate = e;
        break;
      }
      case "yesterday": {
        const s = new Date();
        s.setDate(s.getDate() - 1);
        s.setHours(0, 0, 0, 0);
        const e = new Date(s);
        e.setHours(23, 59, 59, 999);
        startDate = s;
        endDate = e;
        break;
      }
      case "last7Days": {
        const s = new Date();
        s.setDate(s.getDate() - 7);
        s.setHours(0, 0, 0, 0);
        startDate = s;
        break;
      }
      case "last14Days": {
        const s = new Date();
        s.setDate(s.getDate() - 14);
        s.setHours(0, 0, 0, 0);
        startDate = s;
        break;
      }
      case "lastMonth": {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0);
        e.setHours(23, 59, 59, 999);
        startDate = s;
        endDate = e;
        break;
      }
      case "custom": {
        if (!custom) throw new Error("Custom range requires start and end dates");
        const s = new Date(custom.startDate);
        const e = new Date(custom.endDate);
        if (isNaN(s.getTime()) || isNaN(e.getTime()))
          throw new Error("Invalid custom date range");
        startDate = s;
        endDate = e;
        break;
      }
      default:
        throw new Error("Invalid filter type");
    }

    return {
      startDate: toLocalDateString(startDate!),
      endDate: toLocalDateString(endDate!),
    };
  }


  const fetchAllLeads = async (
    userId: string,
    filter: FilterType,
    custom?: { startDate: string; endDate: string }
  ) => {
    try {
      let queryString = "";
      if (filter !== "all") {
        const { startDate, endDate } = getDateRange(filter, custom);
        if (!startDate || !endDate) throw new Error("Invalid date range");
        queryString = `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
          endDate
        )}`;
      }
      const res = await apiClient.get(`${apiClient.URLS.referrals}/all/${userId}${queryString}`);
      if (res.status === 200 && res.body) setAllLeads(res.body);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleStatusSelect = async (leadstatus: string, leadId: number) => {
    setAllLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, leadstatus } : l)));
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.servicecustomlead}/${leadId}/leadstatus`,
        { leadstatus }
      );
      if (res.status === 200) toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.roles, {});
      if (res.status === 200 && res.body) setRoles(res.body);
    } catch (error) {
      console.error("error is ", error);
    }
  };

  const fetchUsersById = async (rId: number) => {
    try {
      const res = await apiClient.get(`${apiClient.URLS.roles}/${rId}/userids`, {});
      if (res.status === 200 && res.body) {
        const formatted = res.body.map((u: any) => ({ id: u.id, name: `${u.fullName}` }));
        setRoleUsers(formatted);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAssignUser = async (leadId: number, userId: string) => {
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.servicecustomlead}/assign/${leadId}/${userId}/3`,
        true
      );
      if (response.status === 201) toast.success("Lead assigned successfully");
    } catch (error) {
      console.error("Error assigning lead:", error);
    }
  };

  const handleselectedLead = (leadid: number) => {
    setSelectedLeads((prev) => (prev.includes(leadid) ? prev.filter((id) => id !== leadid) : [...prev, leadid]));
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.referrals}/bulk?ids=${selectedLeads.join(",")}`,
        true
      );
      if (res.status === 200) {
        setAllLeads((prev) => prev.filter((l) => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
        toast.success("Leads deleted successfully");
      } else {
        toast.error("Leads not deleted");
      }
    } catch (error) {
      console.error("Failed to delete selected leads", error);
    }
  };

  useEffect(() => {
    fetchUsersById(roleId);
  }, [roleId]);

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.user?.id) {
      setUser(session.data.user);
      fetchUsers();
      fetchAllLeads((session.data.user.id), "all");
    }
  }, [session?.status]);

  const handleDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(`${apiClient.URLS.referrals}/${id}`, true);
      if (res.status === 200) {
        setAllLeads((prev: any) => prev.filter((lead: any) => lead.id !== id));
        toast.success("Lead deleted");
      } else {
        console.error("Failed to delete custom lead", res);
      }
    } catch (error) {
      console.error("Failed to delete custom lead", error);
    }
  };

  const handleWhatsappSend = async (name: string, phonenumber: string) => {
    try {
      setIsLoading(true);
      const payload = { name, phone: phonenumber };
      const res = await apiClient.post(`${apiClient.URLS.whatsappSend}/document `, { ...payload }, true);
      if (res.status === 201) toast.success("WhatsApp sent successfully");
    } catch (error) {
      console.log("error occurred while whatsapp ", error);
      toast.error("Error occurred while sending WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const serviceCategoryOptions = Object.values(ServiceCategory).map((value) => ({
    label: value
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\s+/g, " "),
    value,
  }));

  const resetCreateForm = () => {
    setNewReferral({
      friendName: "",
      friendPhone: "",
      friendEmail: "",
      friendCity: "",
      category: "",
    });
  };

  const handleCreateReferral = async () => {
    if (!user?.id) {
      toast.error("User not found. Please re-login.");
      return;
    }
    if (!newReferral.category) {
      toast.error("Please select a service type.");
      return;
    }
    try {
      setCreateLoading(true);
      const payload: any = {
        referrerId: String(user.id),
        category: newReferral.category,
      };
      if (newReferral.friendName) payload.friendName = newReferral.friendName;
      if (newReferral.friendPhone) payload.friendPhone = newReferral.friendPhone;
      if (newReferral.friendEmail) payload.friendEmail = newReferral.friendEmail;
      if (newReferral.friendCity) payload.friendCity = newReferral.friendCity;

      const res = await apiClient.post(apiClient.URLS.referrals, payload, true);
      if (res.status === 201) {
        toast.success("Referral created successfully");
        resetCreateForm();
        setIsCreateModalOpen(false);
        fetchAllLeads(user.id, "all");
      }
    } catch (error: any) {
      console.error("Error creating referral:", error);
      const message =
        error?.body?.message ||
        error?.message ||
        "Failed to create referral. Please try again.";
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  function applyFilter() {
    try {
      let range: { startDate: string; endDate: string } | undefined;
      if (selectedDateFilter === "custom") {
        if (!customRange.startDate || !customRange.endDate) return;
        range = { startDate: customRange.startDate, endDate: customRange.endDate };
      }
      const { startDate, endDate } = getDateRange(selectedDateFilter, range);
      if (!user?.id) return;
      fetchAllLeads(user.id, selectedDateFilter, { startDate, endDate });
      setIsOpen(false);
    } catch (err) {
      console.error("error", err);
    }
  }

  // Build initial service-type filters from data
  useEffect(() => {
    if (!allLeads.length) return;
    const serviceTypes = [...new Set(allLeads.map((lead) => lead.category).filter(Boolean))];
    const initialFilters = serviceTypes.reduce(
      (acc, type) => ({ ...acc, [type]: false }),
      {} as Record<string, boolean>
    );
    setSelectedFilters(initialFilters);
  }, [allLeads]);

  const TableHeader = [
    { label: "Full Name", key: "friendName" },
    { label: "Phone Number", key: "friendPhone" },
    { label: "Email", key: "friendEmail" },
    { label: "City", key: "friendCity" },
    { label: "Service Type", key: "category" },
    { label: "Referral", key: "Referral" },
    { label: "Created At", key: "createdAt" },
    { label: "Assign By", key: "assignBy" },
    { label: "Assign To", key: "assignTo" },
  ];

  // ------- Memoized filtering & pagination (UI only, logic same) -------
  const filteredData = useMemo(() => {
    const q = (searchQuery || "").toLowerCase().trim();
    return allLeads.filter((lead) => {
      const matchSearch =
        (lead.friendName || "").toLowerCase().includes(q) ||
        (lead.friendPhone || "").includes(searchQuery);
      const matchesFilters =
        Object.values(selectedFilters).every((v) => !v) || selectedFilters[lead.category];
      return matchSearch && matchesFilters;
    });
  }, [allLeads, searchQuery, selectedFilters]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = useMemo(
    () => filteredData.slice((currentpage - 1) * pageSize, currentpage * pageSize),
    [filteredData, currentpage, pageSize]
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handlePageChange = useCallback(
    (newPage: number) => setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages]
  );
  {
    (isLoading || session.status === "loading") && (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-white/50 backdrop-blur-[1px]">
        <Loader />
      </div>
    )
  }

  const EmptyState = () => (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3 text-2xl">🗂️</div>
      <p className="font-medium text-[17px] text-[#1A1A1A]">No referrals found</p>
      <p className="text-[12px] text-[#6B7280] mt-1">Try changing filters or date range.</p>
    </div>
  );

  return (
    <>
      <div className="p-4 md:p-6 w-full bg-[#f5f6f8] min-h-screen">
        <div className="w-full max-w-[1500px]">
          <div className="flex items-center gap-3 mb-4">
            <BackRoute />
          </div>
          {/* Page header */}
          <div className="mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[8px] bg-[#E6F1FB] flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#0C447C]" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[17px] font-medium text-[#1A1A1A]">Houznext Rewards</h1>
                  <p className="text-[12px] text-[#6B7280]">{filteredData.length} referrals found</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CustomTooltip
                  label="Access Restricted. Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="text-[10px] font-medium"
                  showTooltip={!hasPermission("referral", "create")}
                >
                  <Button
                    className="flex items-center gap-2 px-4 py-[7px] rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium transition-colors"
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!hasPermission("referral", "create")}
                  >
                    <MdAdd className="w-4 h-4" />
                    New Reference
                  </Button>
                </CustomTooltip>
                <CustomTooltip
                  label="Access Restricted. Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="text-[10px] font-medium"
                  showTooltip={!hasPermission("referral", "delete")}
                >
                  <Button
                    className={`p-2 rounded-[8px] transition-colors ${selectedLeads.length ? "bg-red-50 hover:bg-red-100 text-red-600" : "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280]"}`}
                    onClick={handleDeleteSelected}
                    disabled={!hasPermission("referral", "delete") || selectedLeads.length === 0}
                    title={selectedLeads.length ? "Delete selected" : "No rows selected"}
                  >
                    <Delete className="!text-[20px]" />
                  </Button>
                </CustomTooltip>
                <CSVLink data={allLeads} headers={TableHeader} filename="referandearn">
                  <Button className="flex items-center gap-2 px-4 py-[7px] rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white hover:border-[#1D4E7A] text-[#4B5563] text-[13px] font-medium transition-colors">
                    <LuDownload className="w-4 h-4" />
                    Download
                  </Button>
                </CSVLink>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white p-3 md:p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
              <div className="flex items-center  gap-2 w-full">
                <ReusableSearchFilter
                  searchText={searchQuery}
                  placeholder="Search by name, phone"
                  onSearchChange={setSearchQuery}
                  filters={Array.from(new Set(allLeads.map((lead) => lead.category))).map((category) => ({
                    id: category,
                    label: category
                      ?.split("_")
                      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" "),
                  }))}
                  selectedFilters={selectedFilters}
                  onFilterChange={setSelectedFilters}
                  rootCls="md:mb-0"
                />
                <Button
                  onClick={() => setIsOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white border border-[rgba(0,0,0,0.12)] hover:border-[#1D4E7A] font-medium text-[13px] text-[#4B5563] py-2 px-3 rounded-[8px] transition-colors"
                >
                  <FiSliders className="text-[#6B7280]" />
                  Sort By
                </Button>
              </div>

              <div className="text-[12px] text-[#6B7280]">
                <span className="mr-2">Total:</span>
                <span className="font-semibold text-[#111827]">{filteredData.length}</span>
                {selectedLeads.length > 0 && (
                  <span className="ml-3 inline-flex items-center gap-2 rounded-[8px] bg-[#E6F1FB] text-[#0C447C] border border-[#0C447C]/20 px-3 py-1 text-[12px] font-medium">
                    Selected: <b>{selectedLeads.length}</b>
                  </span>
                )}
              </div>
            </div>

            {/* Date filter popover */}
            {isOpen && (
              <div className="relative">
                <div className="absolute right-0 mt-2 md:w-[260px] w-[180px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] shadow-lg z-20 overflow-hidden">
                  <ul className="py-2 max-h-[320px] overflow-auto">
                    {filtersdata.map((filter) => (
                      <li key={filter.id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] transition-colors">
                        <input
                          type="radio"
                          id={filter.id}
                          name="dateFilter"
                          checked={selectedDateFilter === filter.id}
                          onChange={() => setSelectedDateFilter(filter.id)}
                        />
                        <label htmlFor={filter.id} className="font-medium text-sm">
                          {filter.label}
                        </label>
                      </li>
                    ))}
                    {selectedDateFilter === "custom" && (
                      <li className="px-3 py-2 space-y-2">
                        <CustomDate
                          type="date"
                          label={"Start Date"}
                          labelCls="text-[12px] font-medium"
                          value={customRange.startDate}
                          onChange={(e) => setCustomRange((r) => ({ ...r, startDate: e.target.value }))}
                          placeholder="Date"
                          className="px-3 py-[2px]"
                          name="date"
                        />
                        <CustomDate
                          type="date"
                          label={"End Date"}
                          labelCls="text-[12px] font-medium"
                          value={customRange.endDate}
                          onChange={(e) => setCustomRange((r) => ({ ...r, endDate: e.target.value }))}
                          placeholder="Date"
                          className="px-3 py-[2px]"
                          name="date"
                        />
                      </li>
                    )}
                  </ul>
                  <div className="flex justify-end gap-2 px-3 py-2 border-t">
                    <Button
                      className="py-1 px-2 rounded-md border-2 text-[11px] font-medium border-gray-300"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="py-1 px-2 rounded-md text-[11px] font-medium bg-blue-500 text-white"
                      onClick={applyFilter}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Data card with table */}
          <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white overflow-hidden">
            <TableContainer component={Paper} elevation={0} className="!bg-transparent">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="bg-[#F9FAFB] text-[#6B7280] font-semibold py-3 px-3 text-center sticky top-0 z-10 text-[12px]">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length > 0 && selectedLeads.length === paginatedData.length}
                        onChange={() =>
                          setSelectedLeads(
                            selectedLeads.length === paginatedData.length
                              ? []
                              : paginatedData.map((lead) => lead.id)
                          )
                        }
                      />
                    </TableCell>
                    {[
                      "Full Name",
                      "Phone Number",
                      "Email",
                      "City",
                      "Service Type",
                      "Referral",
                      "Created At",
                      "Assign By",
                      "Assign To",
                      "Actions",
                    ].map((h) => (
                      <TableCell
                        key={h}
                        className="bg-[#F9FAFB] text-[#6B7280] text-nowrap py-3 px-4 font-semibold text-center text-[12px] md:text-[13px] sticky top-0 z-10"
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="p-0">
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  )}

                  {paginatedData.map((lead: any, index: number) => {
                    const assignedUser = lead.assignedTo;
                    return (
                      <TableRow key={index} className="hover:bg-gray-50/70 transition border-b border-gray-100">
                        {/* Row select */}
                        <TableCell className="text-start px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleselectedLead(lead.id)}
                          />
                        </TableCell>

                        <TableCell className="text-center px-4 py-2 font-medium text-[#111827] text-[12px] md:text-[14px]">
                          <span className="line-clamp-1">{lead?.friendName || "-"}</span>
                        </TableCell>

                        <TableCell className="text-center px-4 py-2 text-gray-500 font-medium text-[12px] md:text-[14px]">
                          {lead?.friendPhone || "-"}
                        </TableCell>

                        <TableCell className="text-center px-4 py-2 text-gray-500 font-medium text-[12px] md:text-[14px]">
                          {lead?.friendEmail || "-"}
                        </TableCell>

                        <TableCell className="text-center px-4 py-2 text-gray-500 font-medium text-[12px] md:text-[14px]">
                          {lead?.friendCity || "-"}
                        </TableCell>

                        <TableCell
                          className={`text-center px-4 py-2 text-[12px] md:text-[14px] ${roleColors[lead.category] || "text-gray-500"
                            }`}
                        >
                          <div className="inline-flex items-center font-medium gap-1 rounded-[6px] border border-[rgba(0,0,0,0.08)] px-2 py-1 bg-[#F3F4F6]">
                            <span className="text-[14px]">{roleIcons[lead?.category]}</span>
                            <span className="text-[12px] md:text-[13px]">{lead?.category}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center px-4 py-2 text-[#6B7280] text-[12px] md:text-[14px]">
                          {lead.referrer?.id || "-"}
                        </TableCell>

                        <TableCell className="text-center text-nowrap px-4 py-2 text-[#6B7280] text-[12px] md:text-[14px]">
                          {lead.createdAt ? new Date(lead.createdAt).toDateString() : "-"}
                        </TableCell>

                        <TableCell className="text-center px-4 py-2 text-[#6B7280] text-[12px] md:text-[14px]">
                          {lead?.assignedBy ? lead.assignedBy : "N/A"}
                        </TableCell>

                        <TableCell className="text-center px-4 py-2">
                          <SingleSelect
                            type="single-select"
                            name="assignedUser"
                            options={roleUsers.map((u) => ({ name: u.name, id: u.id }))}
                            rootCls="border border-[rgba(0,0,0,0.08)] bg-[#E6F1FB] px-1 w-full rounded-[8px] font-medium text-[12px] md:text-[14px]"
                            buttonCls="border-none"
                            selectedOption={{ name: assignedUser || "Not Available" }}
                            optionsInterface={{ isObj: true, displayKey: "name" }}
                            handleChange={(name, value) => handleAssignUser(lead.id, value.id)}
                          />
                        </TableCell>

                        <TableCell className="text-center px-4 py-3">
                          <div className="flex items-center justify-center gap-2 md:gap-3">
                            <CustomTooltip
                              label="Access Restricted. Contact Admin"
                              position="bottom"
                              tooltipBg="bg-black/60 backdrop-blur-md"
                              tooltipTextColor="text-white py-2 px-4 font-medium"
                              labelCls="text-[10px] font-medium"
                              showTooltip={!hasPermission("referral", "delete")}
                            >
                              <Button
                                onClick={() => handleDelete(lead.id)}
                                className="px-2 py-1.5 rounded-[8px] bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                disabled={!hasPermission("referral", "delete")}
                              >
                                <LuTrash2 className="md:text-[18px] text-[14px]" />
                              </Button>
                            </CustomTooltip>

                            <Button
                              className="md:px-3 px-2 md:py-2 py-1.5 text-[11px] md:text-[12px] bg-[#1D9E75] hover:bg-[#178B65] text-white rounded-[8px] flex items-center gap-1 transition-colors"
                              onClick={() => handleWhatsappSend(lead?.name, lead?.phonenumber)}
                            >
                              <BiLogoWhatsapp className="md:text-[18px] text-[14px]" />
                              Send
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-3 md:px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs font-medium text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredData.length === 0 ? 0 : (currentpage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentpage * pageSize, filteredData.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredData.length}</span> results
                </div>
                {filteredData.length > 10 && (
                  <PaginationControls
                    currentPage={currentpage}
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

      {/* Loading overlay */}

      <Modal
        isOpen={isCreateModalOpen}
        closeModal={() => {
          setIsCreateModalOpen(false);
          resetCreateForm();
        }}
        className="md:max-w-[480px] max-w-[320px] rounded-[12px] border border-[rgba(0,0,0,0.08)]"
      >
        <div className="md:px-4 px-3 md:py-4 py-3 flex flex-col gap-3">
          <h3 className="text-[17px] font-medium text-[#1A1A1A] mb-1">
            Create New Reference
          </h3>
          <p className="text-[12px] text-[#6B7280] mb-2">
            Add a new referral manually to Houznext Rewards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CustomInput
              type="text"
              label="Friend Name"
              name="friendName"
              value={newReferral.friendName}
              onChange={(e) =>
                setNewReferral((prev) => ({ ...prev, friendName: e.target.value }))
              }
              placeholder="Enter full name"
              labelCls="text-[12px] font-medium"
            />
            <CustomInput
              type="text"
              label="Phone Number"
              name="friendPhone"
              value={newReferral.friendPhone}
              onChange={(e) =>
                setNewReferral((prev) => ({ ...prev, friendPhone: e.target.value }))
              }
              placeholder="10-digit mobile"
              labelCls="text-[12px] font-medium"
            />
            <CustomInput
              type="email"
              label="Email"
              name="friendEmail"
              value={newReferral.friendEmail}
              onChange={(e) =>
                setNewReferral((prev) => ({ ...prev, friendEmail: e.target.value }))
              }
              placeholder="name@example.com"
              labelCls="text-[12px] font-medium"
            />
            <CustomInput
              type="text"
              label="City"
              name="friendCity"
              value={newReferral.friendCity}
              onChange={(e) =>
                setNewReferral((prev) => ({ ...prev, friendCity: e.target.value }))
              }
              placeholder="City"
              labelCls="text-[12px] font-medium"
            />
            <div className="md:col-span-2">
              <SingleSelect
                type="single-select"
                name="serviceType"
                label="Service Type"
                labelCls="text-[12px] font-medium"
                options={serviceCategoryOptions}
                optionsInterface={{ isObj: true, displayKey: "label" }}
                selectedOption={
                  newReferral.category
                    ? serviceCategoryOptions.find(
                        (opt) => opt.value === newReferral.category
                      ) ?? null
                    : null
                }
                handleChange={(_, option: any) =>
                  setNewReferral((prev) => ({
                    ...prev,
                    category: option?.value || "",
                  }))
                }
                placeholder="Select service"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              className="py-2 px-4 rounded-[8px] border border-[#1D4E7A] text-[#1D4E7A] bg-white hover:bg-[#E6F1FB] text-[13px] font-medium transition-colors"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              className="py-2 px-4 rounded-[8px] bg-[#1D4E7A] hover:bg-[#16375a] text-white text-[13px] font-medium transition-colors"
              onClick={handleCreateReferral}
              disabled={createLoading || !hasPermission("referral", "create")}
            >
              {createLoading ? "Saving..." : "Save Reference"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
