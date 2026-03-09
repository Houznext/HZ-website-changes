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
  FaBan,
  FaPowerOff,
  FaExclamationTriangle,
  FaBellSlash,
  FaListUl,
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
export interface User {
  id: string;
  username: string;
  profile: string | null;
  password: string;
  agent: boolean | null;
  isVerified: boolean;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdById: number | null;
  roles: string[];
  properties: number[];
  createdAt: string;
  createdBlogs: number[];
  updatedBlogs: number[];
  testimonials: number[];
  addresses: number[];
  furnitureLeads: number[];
  customBuilders: number[];
  locations: number[];
  costEstimators: number[];
  updatedAt: string;
  cart: number | null;
  orders: number[];
  reviews: number[];
  wishlist: number | null;
  crmLeads: number[];
}
export const roleIcons = {
  RealEstate: <FaHome size={12} />,
  Interiors: <FaChair size={12} />,
  CustomBuilder: <TbBuildingSkyscraper size={12} />,
  Solar: <FaSun size={12} />,
  PackersAndMovers: <FaTruck size={12} />,
  Painting: <GiPaintBrush size={12} />,
  Plumber: <MdPlumbing size={12} />,
  " EarthMovers": <FaTools size={12} />,
  HomeDecor: <FaChair size={12} />,
  Furniture: <FaChair size={12} />,
  " CivilEngineeringDesign": <MdEngineering size={12} />,
  VaastuConsultation: <GiVibratingShield size={12} />,
  unknown: <MdHelpOutline size={12} />,
};
export const propertyTypeIcons = {
  Flat: <FaHome />,
  Villa: <MdHolidayVillage />,
  "Independent House": <FaHouseUser />,
  "Independent Floor": <MdApartment />,
};

export const roleColors = {
  RealEstate: "text-emerald-600 bg-emerald-100",
  Interiors: "text-fuchsia-600 bg-fuchsia-100",
  CustomBuilder: "text-sky-600 bg-sky-100",
  Solar: "text-amber-500 bg-amber-100",
  PackersAndMovers: "text-orange-800 bg-orange-100",
  Painting: "text-indigo-500 bg-indigo-100 ",
  Plumber: "text-cyan-600 bg-cyan-100",
  "EarthMovers ": "text-stone-600 bg-stone-100",
  HomeDecor: "text-rose-500 bg-rose-100",
  Furniture: "text-violet-500 bg-violet-100",
  " CivilEngineeringDesign": "text-lime-600 bg-lime-100",
  VaastuConsultation: "text-teal-600 bg-teal-100",
  unknown: "text-gray-700 bg-gray-100",
};

export interface Lead {
  id: number;
  Fullname: string;
  Phonenumber: string;
  bhk: string;
  propertytype: string;

  email: string;
  platform: string;
  serviceType: string;
  review: string;
  city: string;
  state: string;
  leadstatus: string;
  assignedTo: string | null;
  assignedBy: string | null;
  createdAt: string;
  updatedAt?: string;
  phase: number;
  followUpDate: string;
  visitScheduledAt: string;
  visitDoneAt: string;
}

export const TableHeader = [
  { label: "Full Name", key: "Fullname" },
  { label: "Phone", key: "Phonenumber" },
  { label: "Email", key: "email" },
  { label: "Property Type", key: "propertytype" },
  { label: "BHK", key: "bhk" },

  { label: "City", key: "city" },
  { label: "State", key: "state" },
  { label: " Date", key: "Date" },
  { label: " phase", key: "phase" },
  { label: "Platform", key: "platform" },
  { label: "Role", key: "role" },
  { label: "Review", key: "review" },
  { label: "Status", key: "leadstatus" },
  { label: "Assign By", key: "assignBy" },
  { label: "Assign To", key: "assignTo" },
];

export const leaddata = [
  { id: 1, leadstatus: "New" },
  { id: 2, leadstatus: "Contacted" },
  { id: 3, leadstatus: "Qualified" },
  { id: 4, leadstatus: "Proposal Sent" },
  { id: 5, leadstatus: "Negotiation" },
  { id: 6, leadstatus: "Follow-up" },
  { id: 7, leadstatus: "Interested" },
  { id: 8, leadstatus: "Site Visit" },
  { id: 9, leadstatus: "Visit Scheduled" },
  { id: 10, leadstatus: "Visit Done" },
  { id: 11, leadstatus: "Won" },
  { id: 12, leadstatus: "completed" },
  { id: 13, leadstatus: "Not Interested" },
  { id: 14, leadstatus: "Rejected" },
  { id: 15, leadstatus: "Lost" },
  { id: 16, leadstatus: "Closed" },
  { id: 17, leadstatus: "Not Lifted" },
  { id: 18, leadstatus: "Not Answered" },
  { id: 19, leadstatus: "Switched Off" },
  { id: 20, leadstatus: "Wrong Number" },
  { id: 21, leadstatus: "DND" },
  { id: 22, leadstatus: "Site visited" },
  { id: 23, leadstatus: "Not completed" },
];

export const statesOptions = ["Andhra Pradesh", "Telangana", "Maharastra", "Karnataka"];

export const categoryData = [
  { id: 1, role: "RealEstate" },
  { id: 2, role: "Interiors" },
  { id: 3, role: "CustomBuilder" },
  { id: 4, role: "Solar" },
  { id: 5, role: "PackersAndMovers" },
  { id: 6, role: "Painting" },
  { id: 7, role: "Plumber" },
  { id: 8, role: "EarthMovers" },
  { id: 9, role: "Home Decor" },
  { id: 10, role: "Furniture" },
  { id: 11, role: "Civil Engineering Design" },
  { id: 12, role: "Vaastu Consultation" },
];
export const propertytypedata = [
  { id: 1, propertytype: "Flat" },
  { id: 2, propertytype: "Villa" },
  { id: 3, propertytype: "Independent House" },
  { id: 4, propertytype: "Independent Floor" },
];
export const platformData = [
  { id: 1, platform: "MAGIC BRICKS" },
  { id: 2, platform: "99 ACERS" },
  { id: 3, platform: "HOUSING.Com" },
  { id: 4, platform: "TOLET" },
  { id: 5, platform: "Walkin" },
  { id: 6, platform: "OWNER REFERENCE" },
  { id: 7, platform: "Hihiker" },
  { id: 8, platform: "SULEKHA" },
  { id: 9, platform: "Builder Lead" },
  { id: 10, platform: "commonfloor" },
  { id: 11, platform: "propteinsion" },
  { id: 12, platform: "maksaen" },
  { id: 13, platform: "commeny" },
  { id: 14, platform: "real estate India" },
  { id: 15, platform: "BNI" },
  { id: 16, platform: "squareyard" },
  { id: 17, platform: "no broker" },
  { id: 18, platform: "Facebook" },
  { id: 19, platform: "Instagram" },
];

export const headers = [
  { label: "  Full name", key: "Fullname" },
  { label: " Phone", key: "Phonenumber" },
  { label: " Email", key: "email" },
  { label: "City", key: "city" },
  { label: " State", key: "state" },
  { label: " Date", key: "Date" },
  { label: " Platform", key: "platform" },
  { label: "  Role", key: "role" },
  { label: "   Review", key: "review" },
  { label: " Status", key: "leadstatus" },
];

export const status_options = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Follow-up",
  "Interested",
  "Site Visit",
  "Visit Scheduled",
  "Visit Done",
  "Won",
  "completed",
  "Not Interested",
  "Rejected",
  "Lost",
  "Closed",
  "Not Lifted",
  "Not Answered",
  "Switched Off",
  "Wrong Number",
  "DND",
];
export const filtersdata = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7Days", label: "Last 7 Days" },
  { id: "last14Days", label: "Last 14 Days" },
  { id: "lastMonth", label: "Last Month" },
  {
    id: "custom",
    label: "Date range",
  },
];

export const status_Tabs = [
  { label: "All", value: "all", icon: <FaListUl /> },
  { label: "New", value: "New", icon: <FaPlus /> },
  { label: "Contacted", value: "Contacted", icon: <FaPhone /> },
  { label: "Follow-up", value: "Follow-up", icon: <FaRegCalendarCheck /> },
  { label: "Interested", value: "Interested", icon: <FaThumbsUp /> },
  { label: "Not Interested", value: "Not Interested", icon: <FaThumbsDown /> },
  { label: "completed", value: "completed", icon: <FaCheckCircle /> },
  { label: "Site Visit", value: "Site Visit", icon: <FaMapMarkerAlt /> },
  {
    label: "Visit Scheduled",
    value: "Visit Scheduled",
    icon: <FaRegCalendarAlt />,
  },
  { label: "Visit Done", value: "Visit Done", icon: <FaClipboardCheck /> },
  { label: "Not Answered", value: "Not Answered", icon: <FaBan /> },
  { label: "Switched Off", value: "Switched Off", icon: <FaPowerOff /> },
  {
    label: "Wrong Number",
    value: "Wrong Number",
    icon: <FaExclamationTriangle />,
  },
  { label: "DND", value: "DND", icon: <FaBellSlash /> },
];
export const GetDateshow = (status: string) => {
  switch (status) {
    case "Visit Scheduled":
      return "visitScheduledAt";
    case "Visit Done":
      return "visitDoneAt";
    case "Follow-up":
      return "followUpDate";
    default:
      return "updatedAt";
  }
};
export const statusFieldConfig = {
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

