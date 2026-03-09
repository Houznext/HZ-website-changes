import React, { useState, useEffect, useCallback } from "react";
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
import { LuTrash2, LuMoreVertical } from "react-icons/lu";
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

export default function ServiceLeadsView() {
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [currentpage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const [roleUsers, setRoleUsers] = useState([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [roleId, setRoleId] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<any>();
  const { hasPermission, permissions } = usePermissionStore((state) => state);

  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, boolean>
  >({});

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const session = useSession();
  const handleuserMenuClose = () => {
    setAnchor(null);
  };
  function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDateRange(
    filter: FilterType,
    customRange?: { startDate: string; endDate: string }
  ) {
    if (filter === "all") {
      return {
        startDate: null,
        endDate: null,
      };
    }
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.setHours(23, 59, 59, 999));

    switch (filter) {
      case "today":
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        startDate = todayStart;
        endDate = todayEnd;

        break;

      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "last7Days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last14Days":
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 14);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (!customRange)
          throw new Error("Custom range requires start and end dates");
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid custom date range");
        }
        break;
      default:
        throw new Error("Invalid filter type");
    }

    return {
      startDate: toLocalDateString(startDate),
      endDate: toLocalDateString(endDate),
    };
  }
  type FilterType = (typeof filtersdata)[number]["id"];
  const fetchAllLeads = async (
    userId: string,
    filter: FilterType,
    customRange?: { startDate: string; endDate: string }
  ) => {
    try {
      let queryString = "";

      if (filter !== "all") {
        const { startDate, endDate } = getDateRange(filter, customRange);

        if (
          !startDate ||
          !endDate ||
          isNaN(new Date(startDate).getTime()) ||
          isNaN(new Date(endDate).getTime())
        ) {
          throw new Error("Invalid date range");
        }

        queryString = `?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`;
      }

      const res = await apiClient.get(
        `${apiClient.URLS.servicecustomlead}/by-user/${userId}${queryString}`
      );

      if (res.status === 200 && res.body) {
        setAllLeads(res.body);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const handleStatusSelect = async (leadstatus: string, leadId: number) => {
    setAllLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, leadstatus } : lead
      )
    );
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.servicecustomlead}/${leadId}/leadstatus`,
        { leadstatus },true
      );
      if (res.status === 200) {
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };
  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.roles, {});
      if (res.status === 200 && res.body) {
        setRoles(res.body);
      }
    } catch (error) {
      console.error("error is ", error);
    }
  };
  const fetchUsersById = async (roleId) => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.roles}/${roleId}/userids`,
        {}
      );
      if (res.status === 200 && res.body) {
        formatUser(res.body);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const formatUser = (user) => {
    const formattedUsers = user.map((user) => ({
      id: user.id,
      name: `${user.fullName}`,
    }));
    setRoleUsers(formattedUsers);
  };

  const handleAssignUser = async (leadId: number, userId: string) => {
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.servicecustomlead}/assign/${leadId}/${userId}/3`,true
      );
      if (response.status === 201) {
        toast.success("Lead assigned successfully");
      }
    } catch (error) {
      console.error("Error assigning lead:", error);
    }
    handleuserMenuClose();
  };
  const handleselectedLead = (leadid: number) => {
    setSelectedLeads((prev) =>
      prev.includes(leadid)
        ? prev.filter((id) => id !== leadid)
        : [...prev, leadid]
    );
  };
  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) {
      return;
    }
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.servicecustomlead}/bulk?ids=${selectedLeads.join(
          ","
        )}`,true
      );
      const remainingLeads = allLeads.filter(
        (lead) => !selectedLeads.includes(lead.id)
      );
      if (res.status === 200) {
        setAllLeads(remainingLeads);
        setSelectedLeads([]);
        toast.success("lead has been deleted successfully");
      } else {
        console.error("Failed to delete selected leads", res);
        toast.error("lead has not been deleted");
      }
    } catch (error) {
      console.error("Failed to delete selected leads", error);
    }
  };

  useEffect(() => {
    fetchUsersById(roleId);
  }, [roleId]);
  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
      fetchUsers();
      fetchAllLeads((session.data?.user.id), "all");
    }
  }, [session?.status]);

  const handleDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.servicecustomlead}/${id}`,true
      );
      if (res.status === 200) {
        setAllLeads((prevData: any) =>
          prevData.filter((lead: any) => lead.id !== id)
        );
      } else {
        console.error("Failed to delete custom lead", res);
      }
    } catch (error) {
      console.error("Failed to delete custom lead", error);
    }
  };
  const handleWhatsappSend = async (name: string, phonenumber: string) => {
    try {
      const payload = {
        name: name,
        phone: phonenumber,
      };
      const res = await apiClient.post(
        `${apiClient.URLS.whatsappSend}/document `,
        {
          ...payload,
        },true
      );
      if (res.status === 201) {
        toast.success("whatsapp send successfully");
        setIsLoading(false);
      }
    } catch (error) {
      console.log("error occuured while whatsapp ", error);
      toast.error("error occuured while whatsapp");
      setIsLoading(false);
    }
  };
  function applyFilter() {
    try {
      let range;
      if (selectedDateFilter === "custom") {
        if (!customRange.startDate || !customRange.endDate) {
          return;
        }
        range = {
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        };
      }

      const { startDate, endDate } = getDateRange(selectedDateFilter, range);

      fetchAllLeads(user.id, selectedDateFilter, { startDate, endDate });
      setIsOpen(false);
    } catch (err) {
      console.error("error", err);
    }
  }
  useEffect(() => {
    if (!allLeads.length) return;

    const serviceTypes = [
      ...new Set(allLeads.map((lead) => lead.serviceType).filter(Boolean)),
    ];

    const initialFilters = serviceTypes.reduce(
      (acc, type) => ({
        ...acc,
        [type]: false,
      }),
      {}
    );

    setSelectedFilters(initialFilters);
  }, [allLeads]);

  if (IsLoading) {
    return (
      <div className="w-full ">
        <Loader />
      </div>
    );
  }
  const TableHeader = [
    { label: "Full Name", key: "name" },
    { label: "Phone Number", key: "phonenumber" },
    { label: "Description", key: "description" },
    { label: "Service Type", key: "serviceType" },
    { label: "Status", key: "leadstatus" },
    { label: "Created At", key: "createdAt" },
    { label: "Assign By", key: "assignBy" },
    { label: "Assign To", key: "assignTo" },
  ];
  const isEmpty = (filters: Record<string, boolean>) =>
    Object.values(filters).every((val) => !val);

  const filteredData = allLeads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phonenumber.includes(searchQuery);
    const matchesFilters =
      Object.values(selectedFilters).every((val) => !val) ||
      selectedFilters[lead.serviceType];
    return matchSearch && matchesFilters;
  });

  const paginatedData = filteredData.slice(
    (currentpage - 1) * pageSize,
    currentpage * pageSize
  );
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages]
  );

  return (
    <>
      <div className="p-4 w-full flex flex-col gap-2">
        <div className=" md:mt-[10px] mt-[8px] flex justify-between md:px-5 px-3">
          <div className="flex items-start">
            <h1 className="font-bold text-nowrap md:text-[24px] text-[16px] ">
              {" "}
              Service Leads
            </h1>
          </div>
          <div className=" flex items-center md:gap-2 gap-1">
            <div>
              <CustomTooltip
                label="Access Restricted Contact Admin"
                position="bottom"
                tooltipBg="bg-black/60 backdrop-blur-md"
                tooltipTextColor="text-white py-2 px-4 font-medium"
                labelCls="text-[10px] font-medium"
                showTooltip={!hasPermission("servicecustomlead", "delete")}
              >
                {selectedLeads.length > 0 && (
                  <Button
                    className="p-2 text-red-500 rounded-full cursor-pointer"
                    onClick={handleDeleteSelected}
                    disabled={!hasPermission("servicecustomlead", "delete")}
                  >
                    <Delete />
                  </Button>
                )}
              </CustomTooltip>
            </div>
            <CSVLink
              data={allLeads}
              headers={TableHeader}
              filename="service_leads"
            >
              <Button className="md:px-8  px-4 md:py-[6px] py-1 bg-[#5297ff] md:text-[16px] text-[12px] text-white rounded-[6px] flex items-center gap-2">
                <span>
                  {" "}
                  <LuDownload className="text-white text-[20px]" />
                </span>{" "}
                <span className="font-medium">Download</span>
              </Button>
            </CSVLink>
          </div>
        </div>

        <div className="space-y-3 mt-5  shadow-custom rounded-[8px] px-2 py-4 border-[3px]">
          <div className="md:max-w-full max-w-[370px] w-[100%] md:px-[20px] px-0 ">
            <div className="flex items-center  md:gap-2 gap-1">
              <ReusableSearchFilter
                searchText={searchQuery}
                placeholder="Search by name, phone"
                onSearchChange={setSearchQuery}
                filters={Array.from(
                  new Set(allLeads.map((lead) => lead.serviceType))
                ).map((serviceType) => ({
                  id: serviceType,
                  label: serviceType
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" "),
                }))}
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
              />
              <Button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white border font-medium border-gray-300 md:text-[16px] text-[12px] text-nowrap md:py-[10px] py-[7px] md:px-4 px-2 rounded-lg focus:outline-none md:mb-5 mb-3"
              >
                {" "}
                <FiSliders className="text-gray-500" />
                Sort By
              </Button>
            </div>
            {isOpen && (
              <div className="absolute right-0  md:w-[250px] w-[160px] mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-10 text-[12px] md:text-[14px]">
                <ul className="py-2 ">
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
                      <label
                        htmlFor={filter.id}
                        className="font-medium"
                      >
                        {filter.label}
                      </label>
                    </li>
                  ))}
                  {selectedDateFilter === "custom" && (
                    <li className="px-3 py-2">
                      <CustomDate
                        type="date"
                        label={" Start Date "}
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
                        label={" End Date "}
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
                    className="md:py-2 py-1 md:px-3 px-1 font-medium rounded-md border-2 md:text-[12px] text-[10px] bg-[#3B82F6] text-white"
                    onClick={applyFilter}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="md:max-w-full max-w-[370px] w-[100%] md:px-[20px] custom-scrollbar px-0 flex flex-col ">
            <TableContainer component={Paper} className="mt-4">
              <Table>
                <TableHead>
                  <TableRow className="md:text-[18px] text-[12px]">
                    <TableCell className="bg-gray-200 text-gray-600 font-bold md:py-3 py-1 px-3 text-center md:text-[18px] text-[12px]">
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === allLeads.length}
                        onChange={() =>
                          setSelectedLeads(
                            selectedLeads.length === allLeads.length
                              ? []
                              : allLeads.map((lead) => lead.id)
                          )
                        }
                      />
                    </TableCell>
                    {TableHeader.map((header) => (
                      <TableCell
                        key={header.key}
                        className="bg-gray-200 uppercase text-gray-600 text-nowrap md:py-3 py-1 md:px-7  px-3 font-bold text-center md:text-[14px] text-[12px]"
                      >
                        {header.label}
                      </TableCell>
                    ))}
                    <TableCell className="bg-gray-200 uppercase text-gray-600 font-bold md:py-3 py-1 px-4 text-center md:text-[14px] text-[12px]">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((lead: any, index: number) => {
                    const assignedUser = lead.assignedTo;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-gray-600 md:text-[16px] text-[10px] text-start md:px-4 px-2 md:py-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleselectedLead(lead.id)}
                          />
                        </TableCell>
                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center md:px-6 px-2 md:py-3 py-1">
                          {lead.name || "-"}
                        </TableCell>

                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center md:px-6 px-2 md:py-3 py-1">
                          {lead.phonenumber || "-"}
                        </TableCell>
                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center md:px-6 px-2 md:py-3 py-1">
                          {lead.description || "-"}
                        </TableCell>

                        <TableCell
                          className={`capitalize text-nowrap font-medium text-center md:px-7 px-3 md:py-2 py-1 text-[10px] md:text-[14px] ${
                            roleColors[lead.serviceType] || "text-gray-700"
                          }`}
                        >
                          <div className="flex items-center justify-start gap-1">
                            <span className="md:text-[14px] text-[10px]">
                              {roleIcons[lead.serviceType]}
                            </span>
                            <span className="text-[10px] md:text-[14px]">
                              {lead.serviceType}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center md:px-7 px-3 md:py-2 py-1">
                          <select
                            value={lead?.leadstatus}
                            onChange={(e) =>
                              handleStatusSelect(e.target.value, lead.id)
                            }
                            className={`px-3 py-2 md:rounded-md rounded-[4px] md:text-[14px] text-[10px] font-medium outline-none cursor-pointer ${
                              lead.leadstatus === "New"
                                ? "bg-blue-200 text-blue-800"
                                : lead.leadstatus === "Contacted"
                                ? "bg-purple-100 text-purple-800"
                                : lead.leadstatus === "Follow-up"
                                ? "bg-yellow-100 text-yellow-800"
                                : lead.leadstatus === "Interested"
                                ? "bg-green-100 text-green-800"
                                : lead.leadstatus === "Not Interested"
                                ? "bg-red-100 text-red-800"
                                : lead.leadstatus === "Closed"
                                ? "bg-gray-500 text-white"
                                : "bg-blue-200 text-blue-800"
                            }`}
                          >
                            {status_options.map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="text-black flex flex-col gap-3 space-y-4 bg-white"
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center  md:px-7 px-3 md:py-2 py-1">
                          {new Date(lead.createdAt).toDateString()}
                        </TableCell>
                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center  md:px-7 px-3 md:py-2 py-1">
                          {lead?.assignedBy ? lead.assignedBy : "N/A"}
                        </TableCell>
                        <TableCell className="capitalize text-nowrap font-medium text-gray-600  md:text-[14px] text-[10px] text-center md:px-7 px-3 md:py-2 py-1">
                          <SingleSelect
                            type="single-select"
                            name="assignedUser"
                            options={roleUsers.map((user) => ({
                              name: user.name,
                              id: user.id,
                            }))}
                            rootCls="border-b-[1px] md:h-[40px] h-[35px] bg-blue-50  px-1 py-0.5 w-full border border-[#CFCFCF] md:rounded-[8px] font-medium text-[14px] rounded-[4px]"
                            buttonCls="border-none "
                            selectedOption={{
                              name: assignedUser || "Not Available",
                            }}
                            optionsInterface={{
                              isObj: true,
                              displayKey: "name",
                            }}
                            handleChange={(name, value) =>
                              handleAssignUser(lead.id, value.id)
                            }
                          />
                        </TableCell>
                        <TableCell className="capitalize text-nowrap font-medium text-gray-600 md:text-[14px] text-[10px] text-center md:px-7 px-3 md:py-2 py-1">
                          <div className="flex items-center md:gap-3 gap-1">
                            <CustomTooltip
                              label="Access Restricted Contact Admin"
                              position="bottom"
                              tooltipBg="bg-black/60 backdrop-blur-md"
                              tooltipTextColor="text-white py-2 px-4 font-medium"
                              labelCls="text-[10px] font-medium"
                              showTooltip={
                                !hasPermission("servicecustomlead", "delete")
                              }
                            >
                              <Button
                                onClick={() => handleDelete(lead.id)}
                                className="px-3 py-1 text-white rounded"
                                disabled={
                                  !hasPermission("servicecustomlead", "delete")
                                }
                              >
                                <LuTrash2 className="md:text-[20px] text-[12px] text-red-500" />
                              </Button>
                            </CustomTooltip>
                            <Button
                              className="md:px-3 px-2 md:py-2 py-1 md:text-[12px] text-[10px] bg-green-500 text-white md:rounded-[8px] rounded-[4px] flex items-center gap-1"
                              onClick={() =>
                                handleWhatsappSend(
                                  lead?.name,
                                  lead?.phonenumber
                                )
                              }
                            >
                              <BiLogoWhatsapp className="text-white md:text-[20px] text-[12px]" />
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
            {allLeads.length > 10 && (
              <div className="flex items-end justify-end ">
                <PaginationControls
                  currentPage={currentpage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
