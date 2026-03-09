import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import { FaChartLine, FaEdit } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { CSVLink } from "react-csv";
import { LuDownload } from "react-icons/lu";
import { Delete } from "@mui/icons-material";
import apiClient from "@/src/utils/apiClient";
import LeadTimelineStepper from "./LeadTimelineStepper";
import toast from "react-hot-toast";
import Papa from "papaparse";
import Modal from "@/src/common/Modal";
import { MdOutlineTrackChanges, MdUpdate } from "react-icons/md";
import CustomDate from "@/src/common/FormElements/CustomDate";
import { FiSliders } from "react-icons/fi";
import {
  FaEye,
  FaPaintRoller,
  FaBoxOpen,
  FaFileInvoice,
  FaInfoCircle,
  FaUserPlus,
  FaTrashAlt,
  FaUser,
  FaPhone,
  FaCity,
  FaHome,
  FaCalendarAlt,
  FaEnvelope,
  FaTools,
  FaUserTie,
  FaUserCheck,
  FaCommentDots,
  FaFlagCheckered,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarDay,
} from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { MdApartment, MdPin, MdOutlineCategory } from "react-icons/md";
import { BiLogoWhatsapp } from "react-icons/bi";
import { IoMdMore } from "react-icons/io";
import { Bar } from "react-chartjs-2";
import LeadsDashboard from "./LeadsDashboard";
import { HiOutlineHomeModern } from "react-icons/hi2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  legend
);
import { HiOutlineChartBar, HiOutlineIdentification } from "react-icons/hi";
import { RiGlobalLine } from "react-icons/ri";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { useSession } from "next-auth/react";
import {
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Tooltip,
  Grow,
  Popper,
  List,
  ListItemButton,
  ClickAwayListener,
  Box,
} from "@mui/material";

import {
  categoryData,
  headers,
  Lead,
  leaddata,
  status_options,
  TableHeader,
  roleIcons,
  roleColors,
  propertyTypeIcons,
  propertytypedata,
  filtersdata,
  platformData,
  status_Tabs,
  GetDateshow,
  statusFieldConfig,
  statesOptions,
} from "./helper";
import PaginationControls from "./pagination";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import Loader from "@/src/common/Loader";
type Role = {
  id: number;
  roleName: string;
};

export default function CrmView() {
  const [allLeads, setallLeads] = useState<Lead[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentpage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [OpenfileModal, setOpenFileModal] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleUsers, setRoleUsers] = useState([]);
  const [user, setUser] = useState<any>();
  const [roleId, setRoleId] = useState(1);
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission, permissions, activeBranchId, isAdmin } = usePermissionStore((state) => state);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [OpenDetailsModal, setOpenDetailsModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuLead, setMenuLead] = useState(null);
  const [statusModel, setStatusModel] = useState(false);
  const [reviewValue, setReviewValue] = useState("");

  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingLeadId, setPendingLeadId] = useState(null);
  const [dateValue, setDateValue] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isleadsLoading, setIsleadsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: number }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  type FiltersState = {
    categoryData: Record<string, boolean>;
    leaddata: Record<string, boolean>;
    propertytypedata: Record<string, boolean>;
    stateData: Record<string, boolean>;
  };
  const [activeTab, setActiveTab] = useState<string>("OverView");
  const tabLabels = [
    {
      key: "OverView",
      label: "OverView",
      icon: <FaInfoCircle className="text-[12px]" />,
    },
    {
      key: "DashBoard",
      label: "DashBoard",
      icon: <FaChartLine className="text-[12px]" />,
    },
  ];
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    categoryData: {},
    leaddata: {},
    propertytypedata: {},
    stateData: {},
  });

  type SavedView = {
    id: string;
    name: string;
    searchQuery: string;
    selectedFilters: FiltersState;
    selectedDateFilter: FilterType;
    customRange: { startDate: string; endDate: string };
    activeStatus: string;
  };

  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [saveViewName, setSaveViewName] = useState("");
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("crm_saved_views");
      if (raw) setSavedViews(JSON.parse(raw));
    } catch (error) {
      console.log("error", error);
    }
  }, []);







  const persistViews = (views: SavedView[]) => {
    setSavedViews(views);
    try {
      localStorage.setItem("crm_saved_views", JSON.stringify(views));
    } catch { }
  };

  const saveCurrentView = () => {
    if (!saveViewName.trim()) {
      toast.error("Give this view a name");
      return;
    }
    const view: SavedView = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      name: saveViewName.trim(),
      searchQuery,
      selectedFilters,
      selectedDateFilter,
      customRange,
      activeStatus,
    };
    persistViews([view, ...savedViews]);
    setIsSaveViewOpen(false);
    setSaveViewName("");
    toast.success("View saved");
  };

  const applySavedView = (view: SavedView) => {
    setSearchQuery(view.searchQuery);
    setSelectedFilters(view.selectedFilters);
    setSelectedDateFilter(view.selectedDateFilter);
    setCustomRange(view.customRange);
    setActiveStatus(view.activeStatus);
    toast.success(`Applied view: ${view.name}`);
  };

  const deleteSavedView = (id: string) => {
    persistViews(savedViews.filter((v) => v.id !== id));
    toast.success("View deleted");
  };

  const [customRange, setCustomRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<FilterType>("all");

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [FormData, setFormData] = useState({
    Fullname: "",
    Phonenumber: "",
    propertytype: "Flat",
    bhk: "",
    email: "",
    platform: "",
    role: "",
    review: "",
    city: "",
    state: "",
    leadstatus: "",
  });
  const [todayLeadsCount, setTodayLeadsCount] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all");
  const [categorized, setCategorized] = useState<{
    total: number;
    states: Record<string, number>;
  }>({
    total: 0,
    states: {},
  });
  const [statusData, setStatusData] = useState({ total: 0, statuses: {} });
  const [stateOptions, setStateOptions] = React.useState<
    { id: string; label: string }[]
  >([]);

  const [roleData, setRoleData] = useState<{
    total: number;
    roles: Record<string, number>;
  }>({ total: 0, roles: {} });
  const [errors, setErrors] = useState<any>({});
  const [Dateerrors, setDateErrors] = useState<{ date?: string }>({});

  const validatefilds = (): boolean => {
    const newErrors: any = {};
    if (!FormData.Fullname) {
      newErrors.Fullname = "Fullname is required";
    }
    if (!FormData.Phonenumber) {
      newErrors.Phonenumber = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(FormData.Phonenumber)) {
      newErrors.Phonenumber =
        "Phone number must start with 6, 7, 8, or 9, and be 10 digits long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (allLeads.length > 0) {
      const uniqueStates = Array.from(
        new Set(
          allLeads
            .map((lead) => lead.state?.trim().toLowerCase() || "")
            .filter(Boolean)
        )
      );

      setStateOptions(
        uniqueStates.map((state) => ({
          id: state,
          label: state
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        }))
      );
    }
  }, [allLeads]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...FormData, [name]: value });
  };

  const handleSelectStateChange = (value: string) => {
    setFormData({ ...FormData, state: value });
  };
  const handleSelectChange = (selectedOption: { id: number; role: string }) => {
    setFormData({ ...FormData, role: selectedOption.role });
  };
  const handlePlatformChange = (selectedOption: {
    id: number;
    platform: string;
  }) => {
    setFormData({ ...FormData, platform: selectedOption.platform });
  };
  const handleSelectpropertyChange = (selectedOption: {
    id: number;
    propertytype: string;
  }) => {
    setFormData({ ...FormData, propertytype: selectedOption.propertytype });
  };
  const handleselectstatus = (selectedOption: {
    id: number;
    leadstatus: string;
  }) => {
    setFormData({ ...FormData, leadstatus: selectedOption.leadstatus });
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

      if (activeBranchId) {
        queryString += queryString ? `&branchId=${activeBranchId}` : `?branchId=${activeBranchId}`;
      }

      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/by-user/${userId}${queryString}`
      );

      if (res.status === 200 && res.body) {
        setallLeads(res.body);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  // const fetchAllLeads = async (userId: string) => {
  //     try {
  //       const res = await apiClient.get(
  //         `${apiClient.URLS.crmlead}/by-user/${userId}`
  //       );

  //       if (res.status === 200 && res.body) {
  //         setallLeads(res.body);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching leads: ", error);
  //     }
  //   };

  const categorizeLeadsByState = (leads) => {
    const result = {
      total: leads?.length,
      states: {},
    };
    leads.forEach((lead) => {
      const state = lead.state?.trim().toLowerCase() || "unknown";
      if (result.states[state]) {
        result.states[state] += 1;
      } else {
        result.states[state] = 1;
      }
    });
    return result;
  };
  const categorizeLeadsByStatus = (leads) => ({
    total: leads?.length || 0,
    statuses: leads?.reduce((acc, { leadstatus }) => {
      const status = leadstatus?.trim() || "New";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}),
  });

  const categorizedByRoles = (leads) => {
    const result = { total: leads.length, roles: {} };
    leads.forEach((lead) => {
      const role = lead.serviceType || "unknown";
      if (result.roles[role]) {
        result.roles[role] += 1;
      } else {
        result.roles[role] = 1;
      }
    });
    return result;
  };
  useEffect(() => {
    if (allLeads.length > 0) {
      const categorizedData = categorizeLeadsByState(allLeads);
      setCategorized(categorizedData);
    }
    const categorizedstatus = categorizeLeadsByStatus(allLeads);
    setStatusData(categorizedstatus);
    const categorizedroles = categorizedByRoles(allLeads);
    setRoleData(categorizedroles);
  }, [allLeads]);

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

  const formatUser = (user) => {
    const formattedUsers = user.map((user) => ({
      id: user.id,
      name: `${user.fullName}`,
    }));
    setRoleUsers(formattedUsers);
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

  useEffect(() => {
    fetchUsersById(roleId);
  }, [roleId]);
  const fetchTodayLeadsCount = async () => {
    try {
      const { startDate, endDate } = getDateRange("today");

      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/by-user/${user.id
        }?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`
      );

      if (res.status === 200 && res.body) {
        const todayLeads = res.body;

        const todayFilteredLeads =
          activeStatus === "all"
            ? todayLeads
            : todayLeads.filter(
              (lead) =>
                lead.leadstatus?.trim().toLowerCase() ===
                activeStatus.trim().toLowerCase()
            );

        setTodayLeadsCount(todayFilteredLeads.length);
      }
    } catch (error) {
      console.error("Error fetching today’s leads:", error);
    }
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
      fetchUsers();
      fetchAllLeads((session.data?.user?.id), "all");
      // fetchTodayLeadsCount();
    }
  }, [session?.status]);
  useEffect(() => {
    if (user?.id) {
      fetchTodayLeadsCount();
    }
  }, [user, activeStatus]);

  const handleDrawerClose = () => {
    setFormData({
      Fullname: "",
      Phonenumber: "",
      propertytype: "",
      bhk: "",
      email: "",
      platform: "",
      role: "",
      review: "",
      city: "",
      state: "",
      leadstatus: "",
    });
    setErrors({});
    setOpenModal(false);
  };
  const handleEdit = (lead) => {
    setFormData(lead);
    setSelectedLeadId(lead.id);
    setOpenModal(true);
  };
  const handlesubmit = async (e: any) => {
    e.preventDefault();

    if (!validatefilds()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setIsLoading(true);

    const payload = {
      Fullname: FormData.Fullname,
      Phonenumber: FormData.Phonenumber,
      propertytype: FormData.propertytype || "Flat",
      bhk: FormData.bhk || "N/A",
      email: FormData.email,
      platform: FormData.platform || "Walkin",
      serviceType: FormData.role || "RealEstate",

      review: FormData.review,
      city: FormData.city,
      state: FormData.state,
      leadstatus: FormData.leadstatus || "New",
    };

    try {
      let res;
      if (selectedLeadId) {
        res = await apiClient.patch(
          `${apiClient.URLS.crmlead}/${selectedLeadId}`,
          payload,
          true
        );
      } else {
        res = await apiClient.post(apiClient.URLS.crmlead, payload, true);
      }

      if (res.status === 200 || res.status === 201) {
        setFormData({
          Fullname: "",
          Phonenumber: "",
          email: "",
          propertytype: "",
          bhk: "",
          platform: "",
          role: "",
          review: "",
          city: "",
          state: "",
          leadstatus: "",
        });
        setSelectedLeadId(null);

        if (selectedLeadId) {
          setallLeads((prevData: any) =>
            prevData.map((lead) =>
              lead.id === selectedLeadId ? res.body : lead
            )
          );
        } else {
          setallLeads((prevData: any) => [...prevData, res.body]);
          toast.success("Form updated successfully");
        }
        setOpenModal(false);

        toast.success("Form submitted successfully ");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.crmlead}/${id}`,
        true
      );
      if (res.status === 200) {
        setallLeads((prevData: any) =>
          prevData.filter((lead: any) => lead.id !== id)
        );
      } else {
        console.error("Failed to delete custom lead", res);
      }
    } catch (error) {
      console.error("Failed to delete custom lead", error);
    }
  };
  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const openuserMenu = Boolean(anchor);
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    leadId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedLeadId(leadId);
  };
  const handleuserMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    roleId: number
  ) => {
    setAnchor(event.currentTarget);

    fetchUsersById(roleId);
  };

  const handleuserMenuClose = () => {
    setAnchor(null);
  };
  const handleWhatsappSend = async (name: string, phone: string) => {
    setLoading(true);
    try {
      const payload = {
        name: name,
        phone: phone,
      };
      const res = await apiClient.post(
        `${apiClient.URLS.whatsappSend}/document `,
        {
          ...payload,
        },
        true
      );
      if (res.status === 201) {
        toast.success("whatsapp send successfully");
        setLoading(false);
      }
    } catch (error) {
      console.log("error occuured while whatsapp ", error);
      toast.error("error occuured while whatsapp");
      setLoading(false);
    }
  };
  type LeadStatusPayload = {
    leadstatus: string;
    followUpDate?: string;
    visitScheduledAt?: string;
    visitDoneAt?: string;
    review?: string;
  };

  const handleChange = (value: string, id: number) => {
    if (
      ["Follow-up", "Visit Scheduled", "Visit Done", "completed"].includes(
        value
      )
    ) {
      setPendingStatus(value);
      setPendingLeadId(id);
      setStatusModel(true);
    } else {
      handleStatusSelect({ leadstatus: value }, id);
    }
  };

  const handleStatusSelect = async (
    payload: LeadStatusPayload,
    leadId: number
  ) => {
    setallLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, ...payload } : lead
      )
    );

    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.crmlead}/${leadId}/leadstatus`,
        payload,
        true
      );
      if (res.status === 200) {
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };
  const handleModalSubmit = () => {
    const newErrors: { date?: string } = {};

    // Only validate date for statuses that need it
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

    if (Object.keys(newErrors).length > 0) {
      setDateErrors(newErrors);
      return;
    }
    setDateErrors({});

    const payload: LeadStatusPayload = { leadstatus: pendingStatus };

    if (pendingStatus === "Follow-up") {
      payload.followUpDate = dateValue;
    } else if (pendingStatus === "Visit Scheduled") {
      payload.visitScheduledAt = dateValue;
    } else if (pendingStatus === "Visit Done") {
      payload.visitDoneAt = dateValue;
    } else if (pendingStatus === "completed") {
      if (reviewValue?.trim()) payload.review = reviewValue.trim();
    }

    handleStatusSelect(payload, pendingLeadId);

    setStatusModel(false);
    setDateValue("");
    setReviewValue("");
  };

  const [pageSize, setPageSize] = useState(10);

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
        `${apiClient.URLS.crmlead}/bulk?ids=${selectedLeads.join(",")}`,
        true
      );
      const remainingLeads = allLeads.filter(
        (lead) => !selectedLeads.includes(lead.id)
      );
      if (res.status === 200) {
        setallLeads(remainingLeads);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setSelectedFile(file);
  };
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsleadsLoading(true);
    setUploadProgress(0);

    try {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 20;
        });
      }, 400);

      const formattedData = await parseCSV(selectedFile);

      await sendDataToBackend(formattedData);

      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          setOpenFileModal(false);
        }, 800);
      }, 500);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing CSV file");
    } finally {
      setIsleadsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const propertyTypeMap = {
    flat: "Flat",
    villa: "Villa",
    independent_house: "Independent House",
    independent_floor: "Independent Floor",
  };

  const parseCSV = (file) => {
    const headerMap = {
      platform: "platform",
      propertytype: "propertytype",
      bhk: "bhk",
      fullname: "Fullname",
      phonenumber: "Phonenumber",
      email: "email",
      city: "city",
      state: "state",
      role: "role",
      review: "review",
      leadstatus: "leadstatus",
      assignby: "assignBy",
      assignto: "assignTo",
      date: "date",
      phase: "phase",
    };

    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          try {
            const formattedData = result.data
              .filter((row) => row.Fullname || row.Phonenumber || row.email)
              .map((row) => {
                const normalizedRow = {};
                for (const originalKey in row) {
                  if (originalKey) {
                    const cleanKey = originalKey
                      ?.trim()
                      .toLowerCase()
                      .replace(/\s+/g, "");
                    const mappedKey = headerMap[cleanKey];
                    if (mappedKey) {
                      normalizedRow[mappedKey] =
                        row[originalKey]?.toString().trim() || "";
                    }
                  }
                }

                let parsedDate = new Date();
                const dateStr = normalizedRow["date"];
                if (dateStr && /^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
                  const [day, month, year] = dateStr.split("-").map(Number);
                  parsedDate = new Date(year, month - 1, day);
                }

                return {
                  Fullname: normalizedRow["Fullname"] || "",
                  Phonenumber: normalizedRow["Phonenumber"] || "",
                  email: normalizedRow["email"] || "",
                  propertytype:
                    propertyTypeMap[
                    normalizedRow["propertytype"]?.toLowerCase()
                    ] || null,
                  bhk: normalizedRow["bhk"]
                    ? Number(normalizedRow["bhk"])
                    : null,
                  city: normalizedRow["city"] || "",
                  state: normalizedRow["state"] || "",
                  platform: normalizedRow["platform"] || "",
                  role: normalizedRow["role"] || null,
                  review: normalizedRow["review"] || "",
                  leadstatus: normalizedRow["leadstatus"] || "New",
                  assignBy: normalizedRow["assignBy"]
                    ? Number(normalizedRow["assignBy"])
                    : null,
                  assignTo: normalizedRow["assignTo"]
                    ? Number(normalizedRow["assignTo"])
                    : null,
                  date: parsedDate.toISOString(),
                  phase: normalizedRow["phase"]
                    ? Number(normalizedRow["phase"])
                    : null,
                };
              });

            sendDataToBackend(formattedData);
            resolve(formattedData);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const sendDataToBackend = async (data) => {
    try {
      if (!data.length) {
        toast.error("No valid data found in CSV");
        return;
      }

      const response = await apiClient.post(
        `${apiClient.URLS.crmlead}/bulk`,
        {
          leads: data,
        },
        true
      );

      if (response.data) {
        setallLeads((prevLeads) => [...prevLeads, ...response.data]);
        toast.success("Leads added successfully");
      }
    } catch (error) {
      console.error("Error uploading leads:", error);
      toast.error("Failed to upload leads");
      throw error;
    }
  };
  const handleFileModal = () => {
    setOpenFileModal(true);
  };
  const handleAssignUser = async (leadId: string, userId: string) => {
    try {
      const response = await apiClient.post(
        `${apiClient.URLS.crmlead}/assign/${leadId}/${userId}/3`,
        true
      );
      if (response.status === 201) {
        toast.success("Lead assigned successfully");
      }
    } catch (error) {
      console.error("Error assigning lead:", error);
    }
    handleuserMenuClose();
  };

  const isEmpty = (filters: Record<string, boolean>) =>
    Object.values(filters).every((val) => !val);

  const filteredData = allLeads.filter((lead) => {
    const matchedSearch =
      lead.Fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.Phonenumber.includes(searchQuery) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase());

    const propertyTypeFilters = selectedFilters.propertytypedata;
    const matchesPropertyType =
      isEmpty(propertyTypeFilters) || propertyTypeFilters[lead.propertytype];

    const categoryFilters = selectedFilters.categoryData;
    const matchesCategory =
      isEmpty(categoryFilters) || categoryFilters[lead.serviceType];

    const leadStatusFilters = selectedFilters.leaddata;
    const matchesLeadStatus =
      isEmpty(leadStatusFilters) || leadStatusFilters[lead.leadstatus];
    const stateFilters = selectedFilters.stateData;
    const matchesState =
      isEmpty(stateFilters) ||
      stateFilters[lead.state?.trim().toLowerCase() || ""];

    return (
      matchedSearch &&
      matchesPropertyType &&
      matchesCategory &&
      matchesLeadStatus &&
      matchesState
    );
  });
  const statusFilteredLeads =
    activeStatus === "all"
      ? filteredData
      : filteredData.filter(
        (lead) =>
          lead.leadstatus?.trim().toLowerCase() ===
          activeStatus.trim().toLowerCase()
      );

  const paginatedData = statusFilteredLeads.slice(
    (currentpage - 1) * pageSize,
    currentpage * pageSize
  );
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(statusFilteredLeads.length / pageSize);
  const [draggedLead, setDraggedLead] = React.useState(null);

  const onDragStart = (lead) => {
    setDraggedLead(lead);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (status) => {
    if (draggedLead) {
      handleChange(status, draggedLead.id);
      setDraggedLead(null);
    }
  };

  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages]
  );
  const platformCounts = platformData.map((p) => {
    const count = statusFilteredLeads.filter(
      (lead) =>
        lead.platform?.trim().toLowerCase() === p.platform.trim().toLowerCase()
    ).length;
    return { platform: p.platform, count };
  });

  const data = {
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

  const options = {
    responsive: true,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
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
        min: 0,
        max: 90,
        ticks: {
          stepSize: 10,
          color: "#000000",
          font: { weight: 500 },
        },
        grid: {
          drawBorder: false,
          color: "#e0e0e0",
        },
      },
      y: {
        ticks: {
          color: "#000000",
          font: { weight: 500 },
        },
      },
    },
    animation: {
      onComplete: (context: any) => {
        const chart = context.chart;
        const ctx = chart.ctx;
        ctx.font = "bold 12px blue";
        ctx.fillStyle = "#000";

        chart.data.datasets.forEach((dataset: any, i: number) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar: any, index: number) => {
            const value = dataset.data[index];
            ctx.fillText(value, bar.x + 5, bar.y + 4);
          });
        });
      },
    },
  };
  if (isLoading) {
    return (
      <div className="w-full ">
        <Loader />
      </div>
    );
  }

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
  if (isleadsLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
        <div className=" p-6 max-w-[100%] w-full">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <div className="w-full ">
          <Loader />
        </div>
      ) : (
        <div className="w-full min-h-screen ">
          <div className="flex  items-center justify-between  md:mb-4 mb-3">
            <h1 className="heading-text">
              Customer Relationship Management (CRM)
            </h1>
          </div>

          {openModal && (
            <Drawer
              open={openModal}
              handleDrawerToggle={() => setOpenModal(false)}
              closeIconCls="text-black"
              openVariant="right"
              rootCls="z-[99999999] "
              panelCls="w-[95%] md:w-[80%] lg:w-[calc(82%-190px)] shadow-2xl z-[9999999]"
              overLayCls="bg-gray-700 bg-opacity-40 "
            >
              <div className="w-full flex flex-col md:gap-3 gap-2 pb-10 ">
                <div className="border-b border-gray-200 md:p-5 p-3 bg-gray-50 rounded-tl-2xl">
                  <h1 className="heading-text text-center text-[#3586FF] ">
                    CRM Details
                  </h1>
                </div>

                <div className="flex flex-col  gap-3 md:px-4 md:py-2 p-2 rounded-md">
                  <form
                    className=" flex flex-col gap-2 w-full"
                    onSubmit={handlesubmit}
                  >
                    <div className="flex flex-col md:gap-3 gap-2 w-full">
                      <div className="flex flex-col  gap-3 border-2 shadow border-gray-200 md:p-3 px-2 py-1 rounded-md">
                        <h2 className="font-medium md:text-[18px] text-[14px] text-[#3586FF] ">
                          Basic Information :
                        </h2>
                        <div className="w-full grid grid-cols-2 md:grid-cols-2   gap-y-1 gap-x-3">
                          <div className="w-full md:max-w-[480px] max-w-[280px]">
                            <CustomInput
                              label="Full Name"
                              type="text"
                              name="Fullname"
                              value={FormData.Fullname}
                              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                              placeholder="Enter Name here"
                              required
                              className=" md:px-2 px-1  py-0    rounded-[4px] w-full "
                              rootCls="md:px-2 px-1 md:py-0 py-0"
                              onChange={handleInputChange}
                              errorMsg={errors?.Fullname}
                            />
                          </div>
                          <div className="w-full md:max-w-[480px] max-w-[280px]">
                            <CustomInput
                              label="Phone Number"
                              type="number"
                              name="Phonenumber"
                              value={FormData.Phonenumber}
                              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                              placeholder="Enter number here"
                              required
                              className=" md:px-2 px-1 !md:py-0 py-0   w-full  rounded-[4px] "
                              rootCls="md:px-2 px-1 md:py-0 py-0"
                              onChange={handleInputChange}
                              errorMsg={errors?.Phonenumber}
                            />
                          </div>
                          <div className="w-full md:max-w-[480px] max-w-[280px]">
                            <CustomInput
                              label="Email"
                              type="email"
                              name="email"
                              value={FormData.email}
                              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                              placeholder="Enter email here"
                              className=" md:px-2 px-1  py-0   w-full  rounded-[4px] "
                              rootCls="md:px-2  px-1 md:py-0 py-0"
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px] md:px-3 px-0 mb:mt-0 mt-1">
                            <SingleSelect
                              type="single-select"
                              label="Category"
                              labelCls="label-text"
                              name="role"
                              options={categoryData}
                              rootCls="border-b-[1px]  md:py-1  py-0 w-full border w-full  w-full rounded-[4px] "
                              buttonCls="border-none rounded-[4px]"
                              selectedOption={
                                categoryData.find(
                                  (item) => item.role === FormData.role
                                ) || { id: 1, role: "RealEstate" }
                              }
                              optionsInterface={{
                                isObj: true,
                                displayKey: "role",
                              }}
                              handleChange={(name, value) =>
                                handleSelectChange(value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col  gap-3 border-2 shadow border-gray-200 md:p-3 px-2 py-1 rounded-md">
                      <h2 className="font-medium md:text-[18px] text-[14px] text-[#3586FF] ">
                        Property Details
                      </h2>
                      <div className="w-full grid grid-cols-2 md:grid-cols-2  gap-y-1 gap-x-3">
                        <div className="w-full md:max-w-[480px] max-w-[280px]">
                          <CustomInput
                            label="BHK"
                            type="text"
                            name="bhk"
                            value={FormData.bhk}
                            labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                            placeholder="Enter bhk here"
                            required
                            className=" md:px-2 px-1  py-0   w-full  rounded-[4px] "
                            rootCls="md:px-2  px-1 md:py-0 py-0"
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px] ">
                          <SingleSelect
                            type="single-select"
                            label="Property Type"
                            labelCls="label-text"
                            name="propertytype"
                            options={propertytypedata}
                            rootCls="border-b-[1px]   px-1 md:py-1 py-0 w-full     rounded-[4px] "
                            buttonCls="border-none"
                            selectedOption={
                              propertytypedata.find(
                                (item) =>
                                  item.propertytype === FormData.propertytype
                              ) || { id: 1, propertytype: "Flat" }
                            }
                            required
                            optionsInterface={{
                              isObj: true,
                              displayKey: "propertytype",
                            }}
                            handleChange={(name, value) =>
                              handleSelectpropertyChange(value)
                            }
                          />
                        </div>
                        <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px]   md:mt-0 mt-1">
                          <CustomInput
                            label="City"
                            type="text"
                            name="city"
                            value={FormData.city}
                            labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                            placeholder="Enter Name here"
                            className=" md:px-2 px-1  py-0   w-full  rounded-[4px] "
                            rootCls="md:px-2 px-1 md:py-0 py-0"
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px]   md:mt-0 mt-1">
                          <SingleSelect
                            type="single-select"
                            label="State"
                            labelCls="label-text"
                            placeholder="Select City"
                            name="state"
                            options={statesOptions}
                            rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full   rounded-[4px]"
                            buttonCls="border-none"
                            selectedOption={statesOptions.find(
                              (item) => item === FormData.state
                            )}
                            required
                            optionsInterface={{
                              isObj: false,
                              displayKey: "name",
                            }}
                            handleChange={(name, value) =>
                              handleSelectStateChange(value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col  gap-3 border-2 shadow border-gray-200 md:p-3 px-2 py-1 rounded-md">
                      <h2 className="font-medium md:text-[18px] text-[14px] text-[#3586FF] ">
                        Lead Details
                      </h2>
                      <div className="w-full grid grid-cols-2 md:grid-cols-2   gap-y-1 gap-x-2">
                        <div className="flex flex-col md:gap-y-[8px] gap-y-[6px] w-full md:max-w-[480px] max-w-[280px] md:px-2 px-0 md:mt-0 mt-1">
                          <SingleSelect
                            type="single-select"
                            name="leadstatus"
                            options={leaddata}
                            label="Lead Status"
                            labelCls="label-text"
                            rootCls="border-b-[1px] px-1 md:py-1 py-0 w-full   rounded-[4px]"
                            buttonCls="border-none"
                            selectedOption={
                              leaddata.find(
                                (item) =>
                                  item.leadstatus === FormData.leadstatus
                              ) || { id: 1, leadstatus: "New" }
                            }
                            optionsInterface={{
                              isObj: true,
                              displayKey: "leadstatus",
                            }}
                            handleChange={(name, value) =>
                              handleselectstatus(value)
                            }
                          />
                        </div>
                        <div className="w-full md:max-w-[480px] max-w-[280px]">
                          <CustomInput
                            label="Review"
                            type="text"
                            name="review"
                            value={FormData.review}
                            labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                            placeholder="Review here"
                            className=" md:px-2 px-1  py-0 border  w-full  rounded-[4px] "
                            rootCls="md:px-2 px-1 md:py-0 py-0"
                            required
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col  gap-3 border-2 shadow border-gray-200 md:p-3 px-2 py-1 rounded-md">
                      <h2 className="font-medium md:text-[18px] text-[14px] text-[#3586FF] ">
                        Source Information
                      </h2>
                      <div className="w-full grid grid-cols-2 md:grid-cols-2 gap-y-1 gap-x-3">
                        <div className="flex flex-col md:gap-y-[8px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px] md:px-3 px-0 md:mt-0 mt-1">
                          <SingleSelect
                            type="single-select"
                            label="Platform"
                            labelCls="label-text"
                            name="platform"
                            options={platformData}
                            rootCls="border-b-[1px]   px-1 md:py-1 py-0 w-full border w-full  w-full rounded-[4px] "
                            buttonCls="border-none"
                            selectedOption={
                              platformData.find(
                                (item) => item.platform === FormData.platform
                              ) || { id: 5, platform: "Walkin" }
                            }
                            optionsInterface={{
                              isObj: true,
                              displayKey: "platform",
                            }}
                            handleChange={(name, value) =>
                              handlePlatformChange(value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0   md:static bg-white flex flex-row justify-between mt-10 mb-5">
                      <Button
                        className="md:py-[6px] py-[4px] md:px-[18px] px-[16px] rounded-[4px] border-2 btn-text border-[#3B82F6]"
                        type="button"
                        onClick={handleDrawerClose}
                      >
                        Close
                      </Button>
                      <Button
                        type="submit"
                        onClick={handlesubmit}
                        className=" md:py-[4px] py-[4px] md:px-[18px] px-[16px] rounded-[6px] border-2  btn-text bg-[#3B82F6] text-white"
                      >
                        Submit
                      </Button>{" "}
                    </div>
                  </form>
                </div>
              </div>
            </Drawer>
          )}
          <div className="flex items-center md:gap-4 gap-1 mt-5 md:mb-3 mb-2">
            {tabLabels.map((item) => (
              <Button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`md:px-4 py-1 px-2 md:py-1 max-md:text-nowrap rounded-md transform uppercase text-[10px] md:text-[12px] font-bold flex items-center gap-2 ${activeTab === item.key
                  ? "bg-[#3586FF] text-white"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>

          <p className="md:text-[16px] text-[12px] font-bold ">
            Leads {activeTab}:
          </p>
          {activeTab === "OverView" ? (
            <>
              <div className="relative flex bg-gray-100 py-1 rounded-md items-center justify-end">
                <Button
                  onClick={() => setIsSaveViewOpen(!isSaveViewOpen)}
                  className="flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:text-[12px] text-[10px] text-nowrap md:py-[4px] py-[3px] md:px-4 px-2 rounded-lg"
                >
                  Saved Views
                </Button>

                {isSaveViewOpen && (
                  <div className="absolute top-8 right-0 md:max-w-[280px] max-w-[220px] mt-2 bg-white border border-gray-200 shadow-custom rounded-lg z-[9999] p-3">
                    <div className="flex gap-2 mb-3">
                      <input
                        className="flex-1 border border-gray-300 rounded-md px-2 py-1 md:text-[12px] text-[10px]"
                        placeholder="View name"
                        value={saveViewName}
                        onChange={(e) => setSaveViewName(e.target.value)}
                      />
                      <Button
                        onClick={saveCurrentView}
                        className="bg-[#3B82F6] text-white px-2 py-1 rounded-md md:text-[12px] text-[10px]"
                      >
                        Save
                      </Button>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {savedViews.length === 0 && (
                        <p className="text-[12px] text-gray-500">
                          No saved views yet
                        </p>
                      )}
                      {savedViews.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between border rounded-md px-2 py-1"
                        >
                          <Button
                            className="text-left md:text-[12px] text-[10px] font-medium text-[#3586FF]  hover:underline"
                            onClick={() => {
                              applySavedView(v);
                              setIsSaveViewOpen(false);
                            }}
                          >
                            {v.name}
                          </Button>
                          <Button
                            className="md:text-[12px] text-[10px] text-red-500"
                            onClick={() => deleteSavedView(v.id)}
                            title="Delete view"
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col  flex-col-reverse space-y-2  w-full  px-0">
                <div className="flex md:flex-nowrap flex-wrap items-stretch max-md:justify-center md:gap-4 gap-3 mt-3">
                  {/* Card: Total Leads (by states) */}
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
                        <HiOutlineChartBar className="text-[#3586FF]  w-5 h-5" />
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

                  {/* Card: Leads by Status */}
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
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <MdOutlineTrackChanges className="text-red-600 w-5 h-5" />
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
                              <span
                                className={`h-3 w-3 rounded-full ${status === "New"
                                  ? "bg-[#5297ff]"
                                  : status === "Contacted"
                                    ? "bg-purple-500"
                                    : status === "Follow-up"
                                      ? "bg-yellow-500"
                                      : status === "Interested"
                                        ? "bg-green-500"
                                        : status === "Not Interested"
                                          ? "bg-red-500"
                                          : status === "Site Visit"
                                            ? "bg-orange-400"
                                            : "bg-gray-400"
                                  }`}
                              />
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

                  {/* Card: Leads By Roles */}
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
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <HiOutlineIdentification className="text-gray-600 w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                      {Object.entries(roleData.roles).map(([role, count]) => (
                        <div
                          key={role}
                          className="flex items-center justify-between px-2 py-1 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`${roleColors[role]} flex-shrink-0`}
                            >
                              {roleIcons[role]}
                            </div>
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


                <div className="">
                  <div className="flex items-end justify-end ">
                    {selectedLeads.length > 0 && (
                      <CustomTooltip
                        label="Access Restricted Contact Admin"
                        position="bottom"
                        tooltipBg="bg-black/60 backdrop-blur-md"
                        tooltipTextColor="text-white py-2 px-4 font-medium"
                        labelCls="text-[10px] font-medium"
                        showTooltip={!hasPermission("crm", "delete")}
                      >
                        <Button
                          disabled={!hasPermission("crm", "delete")}
                          className="px-2 py-1 text-red-500 rounded-full cursor-pointer"
                          onClick={handleDeleteSelected}
                        >
                          <Delete />
                        </Button>
                      </CustomTooltip>
                    )}
                  </div>
                  {/* <div className="flex md:flex-row flex-col  gap-2 w-full"> */}
                  <div className="space-y-2 md:mt-5 flex md:flex-row flex-col items-start shadow-custom rounded-[8px] md:px-2 px-0 py-4 border-[3px] w-[100%]  ">
                    <div className="flex px-3 md:hidden w-full  bg-white   shadow-custom custom-scrollbar py-2 gap-1 md:mb-4 mb-2">
                      {status_Tabs.map((status, index) => (
                        <Button
                          key={index}
                          onClick={() => {
                            setActiveStatus(status.value);
                            setCurrentPage(1);
                          }}
                          onDragOver={onDragOver}
                          onDrop={() => onDrop(status.value)}
                          className={`md:px-3 px-2 py-1 text-nowrap rounded-md text-[10px] md:text-[10px] font-bold flex items-center gap-2 ${activeStatus === status.value
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
                    <div className="flex md:hidden   flex-col items-center md:gap-3 gap-1 max-w-full w-[100%] scrollbar-custom">
                      <div className="flex-[2] px-2">
                        <div className="flex items-center  md:gap-2 gap-1 ">
                          <ReusableSearchFilter
                            searchText={searchQuery}
                            placeholder="Search by name, phone, city"
                            className="py-[4px] !md:py-0"
                            branchOptions={branchOptions}
                            onSearchChange={setSearchQuery}
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
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
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
                            rootCls="mb-0"
                          />


                          <div className="relative">
                            <Button
                              onClick={() => setIsOpen(!isOpen)}
                              className="  flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:text-[12px] text-[10px] text-nowrap md:py-[4px] py-[5px] md:px-4 px-2 rounded-lg focus:outline-none md:mb-6"
                            >
                              {" "}
                              <FiSliders className="text-gray-500" />
                              Sort By
                            </Button>
                            {isOpen && (
                              <div className="absolute top-8 -right-2 md:w-[200px] w-[160px] mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-[9999] text-[12px] md:text-[14px]">
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
                                        checked={
                                          selectedDateFilter === filter.id
                                        }
                                        onChange={() =>
                                          setSelectedDateFilter(filter.id)
                                        }
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
                                    className=" py-1 md:px-2 px-1 rounded-md border-2 md:text-[12px] text-[10px] font-medium border-[#3B82F6]"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    className=" py-1 md:px-2 px-1 rounded-md  border-2 md:text-[12px] text-[10px] font-medium bg-[#3B82F6] text-white"
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
                      <div className="flex items-center gap-3 lg:mb-4 mb-2 mt-2">
                        <Button
                          className="bg-[#5297ff] md:text-[12px] text-nowrap text-[12px] font-medium text-white px-5 py-1 rounded-[4px] md:rounded-md"
                          onClick={handleFileModal}
                        >
                          CSV Uploader
                        </Button>
                        {OpenfileModal && (
                          <Modal
                            isOpen={OpenfileModal}
                            closeModal={() => {
                              setOpenFileModal(false);
                              setSelectedFile(null);
                            }}
                            isCloseRequired={false}
                            className="md:max-w-[400px] w-full min-h-[260px] bg-white rounded-xl shadow-lg p-5"
                          >
                            <div className="relative flex flex-col items-center w-full">
                              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                Upload CSV File
                              </h3>

                              <label className="w-full cursor-pointer mb-3">
                                <div className="w-full max-w-[200px] mx-auto px-4 py-2 border border-dashed border-blue-400 text-center font-medium rounded-md text-[12px] text-gray-600 hover:border-blue-600 transition-colors">
                                  {selectedFile
                                    ? "Change file"
                                    : "Choose a CSV file"}
                                </div>
                                <input
                                  type="file"
                                  accept=".csv"
                                  onChange={handleFileUpload}
                                  ref={fileInputRef}
                                  className="hidden"
                                />
                              </label>

                              {selectedFile && (
                                <div className="mb-3 text-[12px] text-gray-700 text-center">
                                  <p
                                    className="truncate max-w-[260px]"
                                    title={selectedFile.name}
                                  >
                                    📄{" "}
                                    <span className="font-medium">
                                      {selectedFile.name}
                                    </span>
                                  </p>
                                </div>
                              )}

                              <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || isleadsLoading}
                                className={`w-full bg-[#5297ff] font-medium mt-5 max-w-[200px] mx-auto hover:bg-blue-600 text-white text-[12px] py-2 rounded-md transition 
          ${(!selectedFile || isleadsLoading) && "opacity-50 cursor-not-allowed"
                                  }`}
                              >
                                {isleadsLoading ? "Uploading..." : "Upload"}
                              </Button>
                            </div>
                          </Modal>
                        )}
                        <CSVLink
                          data={allLeads}
                          headers={headers}
                          filename="csvdata"
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
                          showTooltip={!hasPermission("crm", "create")}
                        >
                          <Button
                            disabled={!hasPermission("crm", "create")}
                            className="bg-[#5297ff] md:text-[14px] text-[12px] text-white md:px-[14px] px-[7px] 
              py-1 rounded-[4px] md:rounded-md"
                            onClick={() => setOpenModal(true)}
                          >
                            + Add Lead
                          </Button>
                        </CustomTooltip>
                      </div>
                    </div>
                    <div className="md:max-w-[30%] max-w-full w-full bg-white border-r border-gray-300 md:rounded-[8px] rounded-[4px] shadow-custom max-h-[670px] max-md:mb-6 custom-scrollbar overflow-x-hidden ">
                      <div className="sticky top-0 z-20 bg-white border-b border-gray-300 py-2 px-2">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[#3586FF]  md:text-[16px] text-[14px]">
                            All Leads
                          </p>
                          <p className="font-medium md:text-[13px] text-[12px]">
                            Total Leads:{statusFilteredLeads.length}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 custom-scrollbar-y px-1 custom-scrollbar overflow-x-hidden">
                        {" "}
                        {paginatedData?.length > 0 &&
                          paginatedData.map((lead) => (
                            <div
                              key={lead?.id}
                              draggable
                              onDragStart={() => onDragStart(lead)}
                              onClick={() => {
                                setOpenDetailsModal(true);
                                setSelectedLead(lead);
                              }}
                              className=" relative flex items-center  md:gap-3 gap-1 md:px-3 md:py-1 px-1 py-1 border-b border-gray-200 shadow-custom hover:bg-gray-100 cursor-pointer"
                            >
                              <div
                                className="absolute top-[2px] -right-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LeadActionsMenu
                                  lead={lead}
                                  roleUsers={roleUsers}
                                  hasPermission={hasPermission}
                                  onAssign={handleAssignUser}
                                  onEdit={(l) => handleEdit(l)}
                                  onDelete={(id) => handleDelete(id)}
                                />
                              </div>

                              <div className="md:w-10 w-8 md:h-10 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold md:text-[12px] text-[10px]">
                                {lead?.Fullname?.charAt(0).toUpperCase()}
                              </div>

                              <div className=" flex-1 flex flex-col md:gap-[2px] gap-[2px] ">
                                <h3 className="font-medium text-gray-900  text-[12px] ">
                                  {lead?.Fullname} ,{lead?.city}
                                </h3>

                                <p className=" text-[12px] font-medium ">
                                  <a
                                    href={`tel:${lead.Phonenumber}`}
                                    className="text-[#3586FF]  hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {lead?.Phonenumber}
                                  </a>
                                </p>

                                <div
                                  className={`capitalize  md:text-[11px] text-[10px] font-medium md:rounded-[6px]  rounded-[4px]  text-nowrap text-center  flex items-center  gap-1  `}
                                >
                                  {propertyTypeIcons[lead?.propertytype]}
                                  {lead?.propertytype},{lead?.bhk}
                                </div>
                                <span className="flex  items-center gap-1 font-medium mt-1">
                                  <FaCalendarAlt className="text-gray-500 text-[10px]" />{" "}
                                  <span className="md:text-[10px] text-[10px] ">
                                    {new Date(
                                      lead?.[GetDateshow(lead?.leadstatus)]
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </span>
                              </div>
                              <div className="flex justify-between flex-col items-center gap-2 font-medium">
                                <div
                                  className={`  md:text-[10px] text-[10px] md:rounded-[6px] rounded-[4px] text-center px-1.5 py-1 flex items-center justify-center gap-1 ${roleColors[lead.serviceType] ||
                                    "text-gray-700"
                                    }`}
                                >
                                  {roleIcons[lead.serviceType]}
                                  {lead.serviceType}
                                </div>

                                <span className=" text-[10px] flex items-center gap-1">
                                  <MdUpdate className="text-gray-500 text-[12px]" />
                                  {new Date(lead.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                                <select
                                  value={lead.leadstatus}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    // handleStatusSelect(e.target.value, lead.id);
                                    handleChange(e.target.value, lead.id);
                                  }}
                                  className="px-1 py-[2px] -pr-2 md:rounded-md rounded-[4px] md:text-[10px] text-[10px] font-medium outline-none cursor-pointer bg-gray-500 text-white"
                                >
                                  {status_options?.length > 0 &&
                                    status_options.map((status) => (
                                      <option
                                        key={status}
                                        value={status}
                                        className="text-black bg-white"
                                      >
                                        {status}
                                      </option>
                                    ))}
                                </select>
                                {statusModel && (
                                  <Modal
                                    isOpen={statusModel}
                                    closeModal={() => setStatusModel(false)}
                                    title={pendingStatus}
                                    isCloseRequired={false}
                                    titleCls="font-medium uppercase md:text-[18px] text-[12px] text-center text-[#3586FF] "
                                    className="md:max-w-[400px] max-w-[300px] "
                                    rootCls="z-[99999] "
                                  >
                                    <div>
                                      <form className="flex flex-col md:px-4 px-2 justify-center">
                                        {[
                                          "Follow-up",
                                          "Visit Scheduled",
                                          "Visit Done",
                                        ].includes(pendingStatus) && (
                                            <div>
                                              <CustomDate
                                                type="date"
                                                label={
                                                  statusFieldConfig[pendingStatus]
                                                    ?.label || "Select Date"
                                                }
                                                labelCls="md:text-[16px] mt-2 text-[12px] font-medium"
                                                value={dateValue}
                                                onChange={(e) =>
                                                  setDateValue(e.target.value)
                                                }
                                                placeholder="Date"
                                                className="md:px-2 px-1 md:py-1 py-[0.5px]"
                                                name={
                                                  statusFieldConfig[pendingStatus]
                                                    ?.name || "date"
                                                }
                                                errorMsg={Dateerrors.date}
                                              />
                                            </div>
                                          )}
                                        {pendingStatus === "completed" && (
                                          <div className="mt-2">
                                            <CustomInput
                                              // rows={3}
                                              type="textarea"
                                              label="Review"
                                              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                                              name="review"
                                              className="w-full min-h-[100px] md:min-h-[120px] border  rounded-md px-3  text-sm md:text-[14px]"
                                              value={reviewValue}
                                              onChange={(e) =>
                                                setReviewValue(e.target.value)
                                              }
                                              placeholder="Write a short review / remark…"
                                              required
                                            // className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-[12px] md:text-[14px] outline-none focus:ring-2 focus:ring-blue-300"
                                            // maxLength={400}
                                            />
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between mt-10 md:px-10">
                                          <Button
                                            className="md:py-[6px] py-1 md:px-[14px] px-[10px] md:rounded-[8px] rounded-[4px] border-2 btn-text border-[#3B82F6]"
                                            onClick={() =>
                                              setStatusModel(false)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={handleModalSubmit}
                                            className="md:py-[6px] py-1 md:px-[14px] px-[10px] md:rounded-[8px] rounded-[4px] border-2   btn-text bg-[#3B82F6] text-white"
                                          >
                                            Submit
                                          </Button>
                                        </div>
                                      </form>
                                    </div>
                                  </Modal>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-2 w-full md:max-w-[70%] max-w-full  overflow-x-hidden overflow-y-hidden">
                      <div className="hidden px-3 md:flex w-full  bg-white   shadow-custom custom-scrollbar py-2 gap-1 md:mb-4 mb-2">
                        {status_Tabs.map((status, index) => (
                          <Button
                            key={index}
                            onClick={() => {
                              setActiveStatus(status.value);
                              setCurrentPage(1);
                            }}
                            onDragOver={onDragOver}
                            onDrop={() => onDrop(status.value)}
                            className={`md:px-2 px-2 py-1 text-nowrap rounded-md text-[10px] md:text-[11px] font-bold flex items-center gap-1 ${activeStatus === status.value
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
                      <div className="md:flex hidden  md:flex-row flex-col items-center md:gap-2 gap-1 max-w-full w-[100%] scrollbar-custom md:z-[99] z-[9]">
                        <div className="flex-[2] px-2">
                          <div className="flex items-center  md:gap-2 gap-1 ">
                            <ReusableSearchFilter
                              searchText={searchQuery}
                              placeholder="Search by name, phone, city"
                              className="!py-[0px] md:!py-[3px]"
                              onSearchChange={setSearchQuery}
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
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
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
                            />
                            <div className="relative">
                              <Button
                                onClick={() => setIsOpen(!isOpen)}
                                className="  flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:text-[14px] text-[10px] text-nowrap md:py-[4px] py-[3px] md:px-4 px-2 rounded-lg focus:outline-none md:mb-6 mb-3"
                              >
                                {" "}
                                <FiSliders className="text-gray-500" />
                                Sort By
                              </Button>
                              {isOpen && (
                                <div className="absolute top-8 -right-2 md:w-[250px] w-[160px] mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-[9999] text-[12px] md:text-[14px]">
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
                                          checked={
                                            selectedDateFilter === filter.id
                                          }
                                          onChange={() =>
                                            setSelectedDateFilter(filter.id)
                                          }
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
                                      className="md:py-2 py-1 md:px-3 px-1 rounded-md  border-2 md:text-[12px] text-[10px] font-medium bg-[#3B82F6] text-white"
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
                        <div className="flex items-center md:gap-3 gap-1 lg:mb-6 mb-3">
                          <Button
                            className="bg-[#5297ff] md:text-[14px] text-nowrap text-[12px] font-medium text-white px-5 py-1  rounded-[4px] md:rounded-md"
                            onClick={handleFileModal}
                          >
                            CSV Uploader
                          </Button>
                          {OpenfileModal && (
                            <Modal
                              isOpen={OpenfileModal}
                              closeModal={() => {
                                setOpenFileModal(false);
                                setSelectedFile(null);
                              }}
                              isCloseRequired={false}
                              className="md:max-w-[400px] w-full min-h-[260px] bg-white rounded-xl shadow-lg p-5"
                            >
                              <div className=" relative flex flex-col items-center w-full">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                                  Upload CSV File
                                </h3>

                                <label className="w-full cursor-pointer mb-3">
                                  <div className="w-full max-w-[200px] mx-auto px-4 py-2 border border-dashed border-blue-400 text-center font-medium rounded-md text-[12px] text-gray-600 hover:border-blue-600 transition-colors">
                                    {selectedFile
                                      ? "Change file"
                                      : "Choose a CSV file"}
                                  </div>
                                  <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                    className="hidden"
                                  />
                                </label>

                                {selectedFile && (
                                  <div className="mb-3 text-[12px] text-gray-700 text-center">
                                    <p
                                      className="truncate max-w-[260px]"
                                      title={selectedFile.name}
                                    >
                                      📄{" "}
                                      <span className="font-medium">
                                        {selectedFile.name}
                                      </span>
                                    </p>
                                  </div>
                                )}

                                <Button
                                  onClick={handleUpload}
                                  disabled={!selectedFile || isleadsLoading}
                                  className={`w-full bg-[#5297ff] font-medium mt-5 max-w-[200px] mx-auto hover:bg-blue-600 text-white text-[12px] py-2 rounded-md transition 
          ${(!selectedFile || isleadsLoading) && "opacity-50 cursor-not-allowed"
                                    }`}
                                >
                                  {isleadsLoading ? "Uploading..." : "Upload"}
                                </Button>
                              </div>
                            </Modal>
                          )}
                          <CSVLink
                            data={allLeads}
                            headers={headers}
                            filename="csvdata"
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
                            showTooltip={!hasPermission("crm", "create")}
                          >
                            <Button
                              disabled={!hasPermission("crm", "create")}
                              className="bg-[#5297ff] md:text-[14px] text-[12px] font-medium text-white md:px-[14px] px-[7px] py-
              0 md:py-1  rounded-[4px] md:rounded-md"
                              onClick={() => setOpenModal(true)}
                            >
                              + Add Lead
                            </Button>
                          </CustomTooltip>
                        </div>
                      </div>

                      <div className="md:max-w-full max-w-full w-[100%]  md:px-[5px]  px-0 flex flex-col ">
                        <div className="flex items-stretch">
                          <div className="flex-1  bg-gray-50 flex  flex-col gap-6 items-center ">
                            <div className="flex items-center    md:gap-4 gap-2 w-full md:px-8 px-2">
                              <div className="bg-gradient-to-r from-white to-gray-200 text-black md:p-4    px-2 py-1 md:rounded-[8px] rounded-[4px] shadow-custom flex items-center justify-between gap-3 transform hover:scale-105 transition-transform duration-200 md:w-full md:max-w-full w-[170px]">
                                <div className="bg-gray-500 md:p-3 p-1 rounded-full">
                                  <FaUsers className="text-white md:text-[20px] text-[14px]" />
                                </div>
                                <div>
                                  <span className="md:text-[18px] text-[16px] font-bold">
                                    {statusFilteredLeads.length}
                                  </span>
                                  <p className="text-[10px] font-medium md:text-[14px] opacity-80 ">
                                    Total Leads
                                  </p>
                                </div>
                              </div>

                              <div className="md:max-w-full md:w-full bg- max-w-[270px] bg-gradient-to-r  from-white to-gray-200  text-black md:p-4 px-2 py-1 md:rounded-[8px] rounded-[4px] shadow-custom flex items-center justify-between gap-3 transform hover:scale-105 w-[170px] transition-transform duration-200">
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
                                data={data}
                                options={{
                                  ...options,
                                  maintainAspectRatio: false,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        {selectedLead && OpenDetailsModal && (
                          <Modal
                            isOpen={OpenDetailsModal}
                            closeModal={() => setOpenDetailsModal(false)}
                            title="Lead Details"
                            rootCls="z-[999] "
                            titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
                            isCloseRequired={true}
                            className="md:max-w-[1100px] max-w-[300px] "
                          >
                            <LeadDetails
                              lead={selectedLead}
                              handleEdit={handleEdit}
                              handleDelete={handleDelete}
                              handleStatusSelect={handleStatusSelect}
                              status_options={status_options}
                              hasPermission={hasPermission}
                              handleWhatsappSend={handleWhatsappSend}
                              handleChange={handleChange}
                              GetDateshow={GetDateshow}
                            />
                          </Modal>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-end md:mt-0 mt-2  max-md:mb-5">
                    {statusFilteredLeads.length > 10 && (
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
            </>
          ) : (
            <LeadsDashboard allLeads={allLeads} />
          )}
        </div>
      )}
    </>
  );
}

const LeadDetails = ({
  lead,
  handleDelete,
  handleEdit,
  handleStatusSelect,
  status_options,
  hasPermission,
  handleWhatsappSend,
  handleChange,
  GetDateshow,
}) => {
  if (!lead) return null;
  const [steps, setSteps] = useState<{ status: string; at: string }[]>([]);
  const [current, setCurrent] = useState<string>("");
  const fetchStatuslogs = async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.crmlead}/${lead?.id}/timeline`
      );
      if (res.status === 200) {
        setSteps(res?.body?.steps);
        setCurrent(res?.body?.currentStatus);
      }
    } catch (error) {
      console.error("error is", error);
    }
  };
  useEffect(() => {
    if (lead?.id) {
      fetchStatuslogs();
    }
  }, [lead?.id]);

  const statusColors = {
    New: "bg-blue-200 text-blue-800",
    Contacted: "bg-purple-100 text-purple-800",
    "Follow-up": "bg-yellow-100 text-yellow-800",
    Interested: "bg-green-100 text-green-800",
    "Not Interested": "bg-red-100 text-red-800",
    Closed: "bg-gray-500 text-white",
    "Site Visit": "bg-orange-200 text-orange-800",
  };

  return (
    <div className="md:p-6 px-2 py-1 bg-white shadow-custom md:rounded-[8px] rounded-[4px] border border-gray-200 max-w-full mx-auto">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="md:text-[20px] text-[12px] font-bold text-gray-800 flex items-center gap-2">
          <FaUser className="text-[#3586FF] " />
          {lead.Fullname}
        </h2>
        <div className="flex items-center md:gap-3 gap-1">
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("crm", "edit")}
          >
            <Button disabled={!hasPermission("crm", "edit")}>
              <FaEdit
                className="text-[#3586FF]  md:text-[20px] text-[12px] cursor-pointer"
                onClick={() => handleEdit(lead)}
              />
            </Button>
          </CustomTooltip>
          <CustomTooltip
            label="Access Restricted Contact Admin"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("crm", "delete")}
          >
            <Button
              onClick={() => handleDelete(lead.id)}
              disabled={!hasPermission("crm", "delete")}
              className="px-3 py-1 text-white rounded"
            >
              <LuTrash2 className="md:text-[20px] text-[12px] text-red-500" />
            </Button>
          </CustomTooltip>
          <Button
            className="md:px-3 px-2 md:py-2 py-1 md:text-[12px] text-[10px] bg-green-500 text-white md:rounded-[8px] rounded-[4px] flex items-center gap-1"
            onClick={() =>
              handleWhatsappSend(lead?.Fullname, lead?.Phonenumber)
            }
          >
            <BiLogoWhatsapp className="text-white md:text-[20px] text-[12px]" />
            Send
          </Button>
        </div>
      </div>
      <div className="w-full mx-auto flex items-center justify-center md:overflow-x-auto md:px-3 px-1 py-2 md:mt-4 mt-2 md:mb-4 mb-1">
        <LeadTimelineStepper steps={steps} currentStatus={current} showTimes />
      </div>

      <div className="mt-6 grid md:grid-cols-4 grid-cols-2 gap-3 font-medium">
        <IconBlock
          icon={<FaPhone className="text-green-500" />}
          label="Phone"
          value={
            <a
              href={`tel:${lead.Phonenumber}`}
              className="text-[#3586FF]  hover:underline"
            >
              {lead.Phonenumber}
            </a>
          }
        />

        <IconBlock
          icon={<FaEnvelope className="text-yellow-500" />}
          label="Email"
          value={lead.email}
        />
        <IconBlock
          icon={<FaHome className="text-orange-500" />}
          label="Property TYpe"
          value={lead.propertytype}
        />
        <IconBlock
          icon={<MdApartment className="text-indigo-500" />}
          label="BHK"
          value={lead?.bhk}
        />
        <IconBlock
          icon={<FaCity className="text-pink-500" />}
          label="City"
          value={lead?.city}
        />
        <IconBlock
          icon={<FaMapMarkerAlt className="text-pink-500" />}
          label="State"
          value={lead?.state}
        />

        <IconBlock
          icon={<RiGlobalLine className="text-green-500" />}
          label="PlatForm"
          value={lead?.platform}
        />
        <IconBlock
          icon={<FaTools className="text-gray-600" />}
          label="Service Type"
          value={lead?.serviceType}
        />
        <IconBlock
          icon={<FaUserTie className="text-green-600" />}
          label="Assigned To"
          value={lead?.assignedTo || "N/A"}
        />
        <IconBlock
          icon={<FaUserCheck className="text-green-800" />}
          label="Assigned By"
          value={lead?.assignedBy || "N/A"}
        />
        <IconBlock
          icon={<FaFlagCheckered className="text-red-500" />}
          label="Phase"
          value={lead?.phase}
        />
        <IconBlock
          icon={<FaCommentDots className="text-blue-400" />}
          label="Review"
          value={lead.review}
        />
        {lead?.houseNo && (
          <IconBlock
            icon={<HiOutlineHomeModern className="text-blue-400" />}
            label="House No"
            value={lead.houseNo}
          />
        )}
        {lead?.apartmentName && (
          <IconBlock
            icon={<MdApartment className="text-blue-400" />}
            label="Apartment / Street Name"
            value={lead.apartmentName}
          />
        )}
        {lead?.areaName && (
          <IconBlock
            icon={<FaMapMarkerAlt className="text-blue-400" />}
            label="Location"
            value={lead.areaName}
          />
        )}

        {lead?.pincode && (
          <IconBlock
            icon={<MdPin className="text-blue-400" />}
            label="Pin Code"
            value={lead.pincode}
          />
        )}

        {lead?.package && (
          <IconBlock
            icon={<FaBoxOpen className="text-blue-400" />}
            label="Package"
            value={lead.package}
          />
        )}
        {lead?.paintingPackage && (
          <IconBlock
            icon={<MdOutlineCategory className="text-blue-400" />}
            label="Painting Package"
            value={lead.paintingPackage}
          />
        )}

        {lead?.paintArea && (
          <IconBlock
            icon={<FaHome className="text-blue-400" />}
            label="Paint Area"
            value={lead.paintArea}
          />
        )}
        {lead?.paintingType && (
          <IconBlock
            icon={<FaPaintRoller className="text-blue-400" />}
            label="Painting Type"
            value={lead.paintingType}
          />
        )}

        <IconBlock
          icon={<FaCalendarAlt className="text-teal-500" />}
          label="Created At"
          value={new Date(lead.createdAt).toLocaleDateString()}
        />
        <IconBlock
          icon={<FaCalendarAlt className="text-teal-500" />}
          label={GetDateshow(lead?.leadstatus)}
          value={new Date(
            lead?.[GetDateshow(lead?.leadstatus)]
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        />

        <div
          className="flex  md:flex-row flex-col md:items-center items-start
         gap-2 text-gray-700"
        >
          <span className="md:text-[12px] text-[12px]">Status:</span>
          <select
            value={lead.leadstatus}
            onChange={(e) => handleChange(e.target.value, lead.id)}
            className={`md:px-3 px-1 md:py-2 py-1 md:rounded-md rounded-[4px] md:text-[14px] text-[10px] font-medium outline-none cursor-pointer ${lead.leadstatus === "New"
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
                        : lead.leadstatus === "Site Visit"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-blue-200 text-blue-800"
              }`}
          >
            {status_options.map((status) => (
              <option
                key={status}
                value={status}
                className="text-black flex flex-col md:gap-3 gap-1 space-y-4 bg-white"
              >
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
const IconBlock = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: any;
}) => (
  <div className="flex flex-col md:gap-1 gap-1">
    <div className="flex items-center gap-2 md:text-[12px] text-[10px] text-gray-700">
      {icon}
      <span className="font-medium text-[10px] md:text-[14px] ">
        {label}
      </span>
    </div>
    <p className="font-medium text-[10px] md:text-[14px] text-wrap">
      {value}
    </p>
  </div>
);
type LeadActionsMenuProps = {
  lead: any;
  roleUsers: { id: string; name: string }[];
  hasPermission: (mod: string, action: string) => boolean;
  onAssign: (leadId: string, userId: string) => void;
  onEdit: (lead: any) => void;
  onDelete: (leadId: string) => void;
};

export function LeadActionsMenu({
  lead,
  roleUsers,
  hasPermission,
  onAssign,
  onEdit,
  onDelete,
}: LeadActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [assignAnchorEl, setAssignAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [assignHovering, setAssignHovering] = useState(false);
  const isAssignOpen = Boolean(assignAnchorEl) || assignHovering;

  const closeAssignSubmenu = () => {
    setAssignAnchorEl(null);
    setAssignHovering(false);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAssignClick = () => {
    setSelectedUser(roleUsers.find((u) => u.name === lead.assignedTo) || null);
    setAssignOpen(true);
    handleMenuClose();
  };

  const handleAssignConfirm = () => {
    if (selectedUser) onAssign(lead.id, selectedUser.id);
    setAssignOpen(false);
  };

  const handleEditClick = () => {
    onEdit(lead);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <Tooltip title="Actions" arrow>
        <IconButton
          aria-label="lead actions"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e);
          }}
          className="!p-1 !bg-white hover:!bg-gray-100 !shadow-sm"
          size="small"
        >
          <IoMdMore size={18} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        TransitionComponent={Grow}
        PaperProps={{
          elevation: 6,
          sx: { borderRadius: 2, minWidth: 120, py: 0.5 },
        }}
      >
        <MenuItem
          onMouseEnter={(e) =>
            setAssignAnchorEl(e.currentTarget as HTMLElement)
          }
          onMouseLeave={() => {
            if (!assignHovering) setAssignAnchorEl(null);
          }}
          sx={{ minHeight: 10, py: 0.5, fontSize: 12 }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <FaUserPlus className="text-gray-700 md:text-[12px] text-[10px]" />
          </ListItemIcon>
          <span className="font-medium md:text-[12px] text-[10px]">
            Assign to…
          </span>

          <Popper
            open={isAssignOpen}
            anchorEl={assignAnchorEl}
            placement="right-start"
            modifiers={[{ name: "offset", options: { offset: [4, 0] } }]}
            style={{ zIndex: 1302 }}
          >
            <ClickAwayListener onClickAway={closeAssignSubmenu}>
              <Paper
                onMouseEnter={() => setAssignHovering(true)}
                onMouseLeave={closeAssignSubmenu}
                elevation={6}
                sx={{ borderRadius: 1.5, minWidth: 180, py: 0.5 }}
              >
                <List dense disablePadding>
                  {roleUsers?.length ? (
                    roleUsers.map((u: { id: string; name: string }) => {
                      const isCurrent = u.name === lead.assignedTo;
                      return (
                        <ListItemButton
                          key={u.id}
                          dense
                          sx={{ py: 0.25, minHeight: 32 }}
                          onClick={() => {
                            onAssign(lead.id, u.id);
                            closeAssignSubmenu();
                            handleMenuClose();
                          }}
                        >
                          <ListItemText
                            primaryTypographyProps={{ fontSize: 12 }}
                            primary={u.name}
                          />
                          {isCurrent && (
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <FaCheck size={12} />
                            </ListItemIcon>
                          )}
                        </ListItemButton>
                      );
                    })
                  ) : (
                    <ListItemButton
                      dense
                      sx={{ py: 0.25, minHeight: 32 }}
                      disabled
                    >
                      <ListItemText
                        primaryTypographyProps={{
                          fontSize: 12,
                          color: "text.secondary",
                        }}
                        primary="No users"
                      />
                    </ListItemButton>
                  )}
                </List>
              </Paper>
            </ClickAwayListener>
          </Popper>
        </MenuItem>

        <Box display="flex" flexDirection="column">
          <CustomTooltip
            label="Access Restricted — contact admin"
            showTooltip={!hasPermission("crm", "edit")}
          >
            <span>
              <MenuItem
                onClick={handleEditClick}
                disabled={!hasPermission("crm", "edit")}
                sx={{ minHeight: 10, py: 0.5, fontSize: 12 }}
              >
                <ListItemIcon>
                  <FaEdit className="text-[#3586FF]  md:text-[12px] text-[10px]" />
                </ListItemIcon>
                <span className="text-[#3586FF]  md:text-[12px] text-[10px] font-medium">
                  Edit
                </span>
              </MenuItem>
            </span>
          </CustomTooltip>

          <CustomTooltip
            label="Access Restricted — contact admin"
            showTooltip={!hasPermission("crm", "delete")}
          >
            <span>
              <MenuItem
                onClick={handleDeleteClick}
                disabled={!hasPermission("crm", "delete")}
                sx={{ minHeight: 10, py: 0.5, fontSize: 12 }}
              >
                <ListItemIcon>
                  <FaTrashAlt className="text-red-600 md:text-[12px] text-[10px]" />
                </ListItemIcon>
                <span className="text-red-500 md:text-[12px] text-[10px] font-medium">
                  Delete
                </span>
              </MenuItem>
            </span>
          </CustomTooltip>
        </Box>
      </Menu>

      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle className="!pb-1 !text-[16px]">Assign lead</DialogTitle>
        <DialogContent className="!pt-2">
          <Autocomplete
            options={roleUsers}
            value={selectedUser}
            onChange={(e, v) => setSelectedUser(v)}
            getOptionLabel={(o) => o?.name ?? ""}
            renderInput={(params) => (
              <TextField
                {...params}
                label="User"
                size="small"
                sx={{
                  "& .MuiInputBase-input": { fontSize: 13, py: 0.75 },
                  "& .MuiInputLabel-root": { fontSize: 12 },
                }}
              />
            )}
            slotProps={{
              paper: { sx: { "& .MuiAutocomplete-option": { fontSize: 12 } } },
            }}
            disablePortal
          />
        </DialogContent>
        <DialogActions className="!pb-4 !px-6">
          <Button
            className="border-2 btn-text border-gray-300 font-medium md:px-3 px-2 md:py-1 py-1 md:text-[12px] text-[10px] rounded-md"
            onClick={() => setAssignOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#3B82F6] text-white md:px-3 px-2 md:text-[12px] text-[10px] font-medium  md:py-1 py-1 rounded-md"
            onClick={handleAssignConfirm}
            disabled={!selectedUser}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        isOpen={confirmOpen}
        closeModal={() => setConfirmOpen(false)}
        rootCls="z-[99999] "
        titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
        isCloseRequired={false}
        className="md:max-w-[500px] max-w-[270px]"
      >
        <div className="md:px-2 py-1 p-1 flex flex-col gap-2 z-20 ">
          <div className="flex justify-between items-center md:mb-2 mb-1">
            <h3 className="md:text-[16px] text-center w-full text-[12px]  font-medium text-gray-900">
              Confirm Deletion
            </h3>
          </div>
          <p className="md:text-[12px] text-center text-[10px] text-gray-500 mb-2">
            Are you sure you want to delete this Lead? This action cannot be
            undone.
          </p>
          <div className="md:mt-2 mt-1 flex items-end justify-end gap-2 md:space-x-3 space-x-1">
            <Button
              className="border-2 font-medium  md:text-[12px] text-[10px] btn-text border-gray-300  md:px-3 px-2 md:py-1 py-1 rounded-md"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white font-medium md:text-[12px] text-[10px]  md:px-3 px-2 md:py-1 py-1 rounded-md"
              onClick={() => {
                onDelete(lead.id);
                setConfirmOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
