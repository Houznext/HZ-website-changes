import {
  FaHome,
  FaPaintRoller,
  FaTools,
  FaTruck,
  FaChair,
  FaSun,
  FaUserTie,
  FaHouseUser,
  FaPlus,
  FaPhone,
  FaRegCalendarCheck,
  FaThumbsUp,
  FaThumbsDown,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaClipboardCheck,
  FaListUl,
  FaInfoCircle,
  FaChartLine,
  FaBan ,FaPowerOff,FaExclamationTriangle ,FaBellSlash, FaStar
} from "react-icons/fa";
import { GiPaintBrush, GiVibratingShield } from "react-icons/gi";
import {
  MdEngineering,
  MdPlumbing,
  MdHelpOutline,
  MdApartment,
  MdHolidayVillage,
} from "react-icons/md";
import { TbBuildingSkyscraper } from "react-icons/tb";
import { HiOutlineHomeModern } from "react-icons/hi2";
import { RiGlobalLine } from "react-icons/ri";

// ============================================================================
// ENUMS (matching backend)
// ============================================================================

export enum ServiceCategory {
  RealEstate = 'RealEstate',
  Interiors = 'Interiors',
  CustomBuilder = 'CustomBuilder',
  Solar = 'Solar',
  PackersAndMovers = 'PackersAndMovers',
  Painting = 'Painting',
  Plumber = 'Plumber',
  EarthMovers = 'EarthMovers',
  HomeDecor = 'HomeDecor',
  Furniture = 'Furniture',
  CivilEngineeringDesign = 'CivilEngineeringDesign',
  VaastuConsultation = 'VaastuConsultation',
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Proposal_Sent = 'Proposal Sent',
  Negotiation = 'Negotiation',
  Follow_up = 'Follow-up',
  Interested = 'Interested',
  SiteVisit = 'Site Visit',
  Visit_Scheduled = 'Visit Scheduled',
  Visit_Done = 'Visit Done',
  completed = 'completed',
  Won = 'Won',
  NotInterested = 'Not Interested',
  Rejected = 'Rejected',
  Lost = 'Lost',
  Closed = 'Closed',
  Not_Lifted = 'Not Lifted',
  NotAnswered = 'Not Answered',
  Switched_Off = 'Switched Off',
  Wrong_Number = 'Wrong Number',
  DND = 'DND',
}

/** Statuses to hide from UI (deprecated/legacy) */
export const HIDDEN_LEAD_STATUSES = ['Yes', 'No', 'Site visited', 'Not completed'];

export enum PropertyTypeEnum {
  flat = 'Flat',
  villa = 'Villa',
  independent_house = 'Independent House',
  independent_floor = 'Independent Floor',
}

export enum PlatForm {
  MAGIC_BRICKS = 'MAGIC BRICKS',
  NINETY_NINE_ACRES = '99 ACERS',
  HOUSING = 'HOUSING.Com',
  TOLET = 'TOLET',
  WALKIN = 'Walkin',
  OWNER_REFERENCE = 'OWNER REFERENCE',
  HIHIKER = 'Hihiker',
  SULEKHA = 'SULEKHA',
  BUILDER_LEAD = 'Builder Lead',
  COMMONFLOOR = 'commonfloor',
  PROPTEINSION = 'propteinsion',
  MAKSAAN = 'maksaen',
  COMMENY = 'commeny',
  REAL_ESTATE_INDIA = 'real estate India',
  BNI = 'BNI',
  SQUAREYARD = 'squareyard',
  NO_BROKER = 'no broker',
  WEB_SITE = 'Website',
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
}

export enum PaintingTypeEnum {
  FRESH = "Fresh Painting",
  REPAINT = "Repainting",
  RENTAL = "Rental Painting",
}

export enum PaintingPackageEnum {
  ECONOMY = "Economy",
  PREMIUM = "Premium",
  LUXURY = "Luxury",
}

export enum Categories {
  Commercial = 'Commercial',
  Residential = 'Residential',
  Industrial = 'Industrial',
  Agriculture = 'Agriculture',
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Lead {
  id: string;
  Fullname: string;
  Phonenumber: string;
  bhk: string;
  propertytype: PropertyTypeEnum;
  email: string;
  platform: PlatForm;
  serviceType: ServiceCategory;
  review: string;
  city: string;
  state: string;
  leadstatus: LeadStatus;
  assignedTo: string | null;
  assignedBy: string | null;
  createdAt: string;
  updatedAt?: string;
  phase?: number;
  followUpDate?: string | null;
  visitScheduledAt?: string | null;
  visitDoneAt?: string | null;
  branchId: string;
  houseNo?: string;
  apartmentName?: string;
  areaName?: string;
  pincode?: string;
  package?: string;
  paintArea?: string;
  paintingPackage?: PaintingPackageEnum;
  paintingType?: PaintingTypeEnum;
  category?: Categories;
  monthly_bill?: number;
  rejectionReason?: string | null;
  isFuturePotential?: boolean;
  createdBy?: string | null;
  rooms?: {
    livingRoom: number;
    kitchen: number;
    bedroom: number;
    bathroom: number;
    dining: number;
  };
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roles: string[];
}

export interface StatusLog {
  status: string;
  at: string;
}

export interface FilterState {
  categoryData: Record<string, boolean>;
  leaddata: Record<string, boolean>;
  propertytypedata: Record<string, boolean>;
  stateData: Record<string, boolean>;
}

export interface SavedView {
  id: string;
  name: string;
  searchQuery: string;
  selectedFilters: FilterState;
  selectedDateFilter: DateFilterType;
  customRange: { startDate: string; endDate: string };
  activeStatus: string;
  followUpTab:any;
}

export type DateFilterType = 
  | "all" 
  | "today" 
  | "yesterday" 
  | "last7Days" 
  | "last14Days" 
  | "lastMonth" 
  | "custom";

// ============================================================================
// ICONS MAPPING
// ============================================================================

export const roleIcons: Record<string, JSX.Element> = {
  RealEstate: <FaHome size={12} />,
  Interiors: <FaChair size={12} />,
  CustomBuilder: <TbBuildingSkyscraper size={12} />,
  Solar: <FaSun size={12} />,
  PackersAndMovers: <FaTruck size={12} />,
  Painting: <GiPaintBrush size={12} />,
  Plumber: <MdPlumbing size={12} />,
  EarthMovers: <FaTools size={12} />,
  HomeDecor: <FaChair size={12} />,
  Furniture: <FaChair size={12} />,
  CivilEngineeringDesign: <MdEngineering size={12} />,
  VaastuConsultation: <GiVibratingShield size={12} />,
  unknown: <MdHelpOutline size={12} />,
};

export const propertyTypeIcons: Record<string, JSX.Element> = {
  Flat: <FaHome className="text-[12px]" />,
  Villa: <MdHolidayVillage className="text-[12px]" />,
  "Independent House": <FaHouseUser className="text-[12px]" />,
  "Independent Floor": <MdApartment className="text-[12px]" />,
};

export const roleColors: Record<string, string> = {
  RealEstate: "text-emerald-600 bg-emerald-100",
  Interiors: "text-fuchsia-600 bg-fuchsia-100",
  CustomBuilder: "text-sky-600 bg-sky-100",
  Solar: "text-amber-500 bg-amber-100",
  PackersAndMovers: "text-orange-800 bg-orange-100",
  Painting: "text-indigo-500 bg-indigo-100",
  Plumber: "text-cyan-600 bg-cyan-100",
  EarthMovers: "text-stone-600 bg-stone-100",
  HomeDecor: "text-rose-500 bg-rose-100",
  Furniture: "text-violet-500 bg-violet-100",
  CivilEngineeringDesign: "text-lime-600 bg-lime-100",
  VaastuConsultation: "text-teal-600 bg-teal-100",
  unknown: "text-gray-700 bg-gray-100",
};

export const statusColors: Record<string, string> = {
  New: "bg-blue-200 text-blue-800",
  Contacted: "bg-purple-100 text-purple-800",
  Qualified: "bg-sky-100 text-sky-800",
  "Proposal Sent": "bg-indigo-100 text-indigo-800",
  Negotiation: "bg-amber-100 text-amber-800",
  "Follow-up": "bg-yellow-100 text-yellow-800",
  Interested: "bg-green-100 text-green-800",
  "Site Visit": "bg-orange-200 text-orange-800",
  "Visit Scheduled": "bg-indigo-100 text-indigo-800",
  "Visit Done": "bg-teal-100 text-teal-800",
  Won: "bg-emerald-500 text-white",
  completed: "bg-green-500 text-white",
  "Not Interested": "bg-red-100 text-red-800",
  Rejected: "bg-red-200 text-red-900",
  Lost: "bg-red-300 text-red-900",
  Closed: "bg-gray-500 text-white",
  "Not Lifted": "bg-gray-300 text-gray-700",
  "Not Answered": "bg-gray-300 text-gray-700",
  "Switched Off": "bg-gray-300 text-gray-700",
  "Wrong Number": "bg-gray-300 text-gray-700",
  DND: "bg-gray-300 text-gray-700",
};

// ============================================================================
// DATA ARRAYS
// ============================================================================

export const categoryData = Object.values(ServiceCategory).map((role, index) => ({
  id: index + 1,
  role,
}));

export const propertytypedata = Object.values(PropertyTypeEnum).map((propertytype, index) => ({
  id: index + 1,
  propertytype,
}));

export const platformData = Object.values(PlatForm).map((platform, index) => ({
  id: index + 1,
  platform,
}));

export const leaddata = Object.values(LeadStatus)
  .filter((s) => !HIDDEN_LEAD_STATUSES.includes(s))
  .map((leadstatus, index) => ({ id: index + 1, leadstatus }));

export const status_options = Object.values(LeadStatus).filter(
  (s) => !HIDDEN_LEAD_STATUSES.includes(s),
);

export const statesOptions = [
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Kerala",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Delhi",
];

export const filtersdata: Array<{ id: DateFilterType; label: string }> = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7Days", label: "Last 7 Days" },
  { id: "last14Days", label: "Last 14 Days" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
];

export const status_Tabs = [
  { label: "All", value: "all", icon: <FaListUl />, count: 0 },
  { label: "New", value: LeadStatus.New, icon: <FaPlus />, count: 0 },
  { label: "Contacted", value: LeadStatus.Contacted, icon: <FaPhone />, count: 0 },
  { label: "Qualified", value: LeadStatus.Qualified, icon: <FaCheckCircle />, count: 0 },
  { label: "Proposal", value: LeadStatus.Proposal_Sent, icon: <FaChartLine />, count: 0 },
  { label: "Negotiation", value: LeadStatus.Negotiation, icon: <FaChartLine />, count: 0 },
  { label: "Follow-up", value: LeadStatus.Follow_up, icon: <FaRegCalendarCheck />, count: 0 },
  { label: "Interested", value: LeadStatus.Interested, icon: <FaThumbsUp />, count: 0 },
  { label: "Site Visit", value: LeadStatus.SiteVisit, icon: <FaMapMarkerAlt />, count: 0 },
  { label: "Visit Scheduled", value: LeadStatus.Visit_Scheduled, icon: <FaRegCalendarAlt />, count: 0 },
  { label: "Visit Done", value: LeadStatus.Visit_Done, icon: <FaClipboardCheck />, count: 0 },
  { label: "Won", value: LeadStatus.Won, icon: <FaCheckCircle />, count: 0 },
  { label: "Completed", value: LeadStatus.completed, icon: <FaCheckCircle />, count: 0 },
  { label: "Not Interested", value: LeadStatus.NotInterested, icon: <FaThumbsDown />, count: 0 },
  { label: "Rejected", value: LeadStatus.Rejected, icon: <FaThumbsDown />, count: 0 },
  { label: "Lost", value: LeadStatus.Lost, icon: <FaThumbsDown />, count: 0 },
  { label: "Not Answered", value: LeadStatus.NotAnswered, icon: <FaBan />, count: 0 },
  { label: "Switched Off", value: LeadStatus.Switched_Off, icon: <FaPowerOff />, count: 0 },
  { label: "Wrong Number", value: LeadStatus.Wrong_Number, icon: <FaExclamationTriangle />, count: 0 },
  { label: "DND", value: LeadStatus.DND, icon: <FaBellSlash />, count: 0 },
  { label: "Future Potential", value: "__future_potential__", icon: <FaStar />, count: 0 },
];

export const tabLabels = [
  { key: "OverView", label: "Overview", icon: <FaInfoCircle className="text-[12px]" /> },
  { key: "DashBoard", label: "Dashboard", icon: <FaChartLine className="text-[12px]" /> },
  { key: "FuturePotential", label: "Future Potential", icon: <FaStar className="text-[12px]" /> },
];

// ============================================================================
// CSV HEADERS
// ============================================================================

export const headers = [
  { label: "Full Name", key: "Fullname" },
  { label: "Phone", key: "Phonenumber" },
  { label: "Email", key: "email" },
  { label: "City", key: "city" },
  { label: "State", key: "state" },
  { label: "Property Type", key: "propertytype" },
  { label: "BHK", key: "bhk" },
  { label: "Platform", key: "platform" },
  { label: "Service Type", key: "serviceType" },
  { label: "Review", key: "review" },
  { label: "Status", key: "leadstatus" },
  { label: "Created At", key: "createdAt" },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const GetDateshow = (status: string): keyof Lead => {
  switch (status) {
    case LeadStatus.Visit_Scheduled:
      return "visitScheduledAt";
    case LeadStatus.Visit_Done:
      return "visitDoneAt";
    case LeadStatus.Follow_up:
      return "followUpDate";
    default:
      return "updatedAt";
  }
};

export const statusFieldConfig: Record<string, { name: string; label: string }> = {
  "Follow-up": {
    name: "followUpDate",
    label: "Follow-up Date",
  },
  "Visit Scheduled": {
    name: "visitScheduledAt",
    label: "Visit Scheduled Date",
  },
  "Visit Done": {
    name: "visitDoneAt",
    label: "Visit Done Date",
  },
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export const getUpcomingFollowUps = (leads: Lead[], days: number = 7): Lead[] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + days);

  return leads.filter(lead => {
    if (!lead.followUpDate) return false;
    const followUp = new Date(lead.followUpDate);
    return followUp >= now && followUp <= futureDate;
  });
};

export const getOverdueFollowUps = (leads: Lead[]): Lead[] => {
  const now = new Date();
  return leads.filter(lead => {
    if (!lead.followUpDate) return false;
    return new Date(lead.followUpDate) < now && lead.leadstatus === LeadStatus.Follow_up;
  });
};

export const getTodayFollowUps = (leads: Lead[]): Lead[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return leads.filter(lead => {
    if (!lead.followUpDate) return false;
    const followUp = new Date(lead.followUpDate);
    return followUp >= today && followUp < tomorrow;
  });
};