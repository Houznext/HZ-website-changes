import { FaCalendarAlt, FaTools, FaMapMarkerAlt, FaFileAlt, FaUsers, FaExclamationTriangle, FaStickyNote, FaCalendar,FaBuilding,
  FaClipboardList,
  FaCubes,
  FaRupeeSign,
  FaDoorClosed,
  FaStar,
  FaShieldAlt,
  FaArrowUp,
  FaParking,
  FaSignature } from "react-icons/fa";
import { MdImage, MdLocalFireDepartment } from "react-icons/md";
import { AiOutlineFileImage } from "react-icons/ai";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { FaBed, FaCouch, FaUtensils, FaBath, FaChair, FaHome, FaPrayingHands, FaUserFriends, FaTree } from "react-icons/fa";
import { MdOutlineApartment, MdOutlineMeetingRoom, MdOutlineKitchen } from "react-icons/md";
import { GiPipes, GiWaterMill, GiPaintRoller, GiCeilingLight } from "react-icons/gi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiBuildingLine } from "react-icons/ri";
import { TbAirConditioning, TbGlass } from "react-icons/tb";

export interface DropdownOption {
  label: string;
  value: string | number;
}

export const constructionType = ["Residential", "Commercial"];

export const PropertyType = ["Apartment", "Villas", "Independent House"];

export const CommercialPropertyTypes = [
  "Showroom",
  "Hotel",
  "Hospital",
  "Commercial Building",
];

export const ConstructionScope = ["House", "Interior"];

export const ServiceTypes = ["Packages", "Customized"];
export const DayProgressTableHeader = [
  { label: "Date", key: "date" },
  { label: "Work Type", key: "workType" },
  { label: "Place Type", key: "placeType" },
  { label: "Status", key: "status" },
  { label: "Description", key: "description" },
  { label: "Labour Count", key: "laborCount" },
  { label: "Floor", key: "floor" },
  { label: "Issues", key: "issues" },
  { label: "Customer Notes", key: "customerNotes" },
  { label: "UploadedBy", key: "uploadedByName" },
  { label: "Uploader Location", key: "uploadLocation" },
  { label: "Uploader", key: "uploadedByProfile" },

  { label: "Images and Videos", key: "imageOrVideo" },
];


export const baseOptions = [
  { label: "Kitchen", value: "kitchen" },
  { label: "Guest room", value: "guest_room" },
  { label: "Pooja room", value: "pooja_room" },
];

export const extendedOptions = [
  { label: "Store room", value: "store_room" },
  { label: "Cinema room", value: "cinema_room" },
];

export const Addoptions = [
  { label: "Pent house", value: "pent_house" },
  { label: "Cellar", value: "cellar" },
  { label: "Stilt", value: "stilt" },
  { label: "Shutter", value: "shutter" },
  { label: "Lift area", value: "lift_area" },
  { label: "Garden area", value: "garden_area" },
  { label: "Back yard area", value: "back_yard_area" },
  { label: "Swimming pool", value: "swimming_pool" },
];

export const GroundfloorOptions = [
  { label: "Parking", value: "parking" },
  { label: "Lift", value: "lift" },
  { label: "Common washroom", value: "common_washroom" },
];

export const serviceCategories = [
  { label: "Document Drafting", value: "document_drafting" },
  { label: "Borewells", value: "borewells" },
  { label: "Centring", value: "centring" },
  { label: "Brick Masonry", value: "brick_masonry" },
  { label: "Fall Ceiling", value: "fall_ceiling" },
  { label: "Electricity Lines", value: "electricity" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Painting", value: "painting" },
  { label: "Flooring", value: "Flooring" },
  { label: "Interiors Service", value: "interior_service" },
];

export const restrictedServiceCategories = [
  { label: "Fall Ceiling", value: "fall_ceiling" },
  { label: "Electricity Lines", value: "electricity" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Painting", value: "painting" },
  { label: "Flooring", value: "Flooring" },
  { label: "Interiors Service", value: "interior_service" },
];

export const commercialServiceCategories = [
  { label: "Document Drafting", value: "document_drafting" },
  { label: "Centring", value: "centring" },
  { label: "Brick Masonry", value: "brick_masonry" },
  { label: "Electricity Lines", value: "electricity" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Painting", value: "painting" },
  { label: "Flooring", value: "Flooring" },
  { label: "Fall Ceiling", value: "fall_ceiling" },
  { label: "HVAC Systems", value: "hvac" },
  { label: "Fire Safety", value: "fire_safety" },
  { label: "Elevator Installation", value: "elevator" },
  { label: "Glazing & Facade", value: "glazing_facade" },
  { label: "Parking Infrastructure", value: "parking_infra" },
  { label: "Signage & Branding", value: "signage" },
];

export const commercialOnlyServices = [
  "hvac",
  "fire_safety",
  "elevator",
  "glazing_facade",
  "parking_infra",
  "signage",
];

export const commercialInteriorServiceCategories = [
  { label: "Fall Ceiling", value: "fall_ceiling" },
  { label: "Electricity Lines", value: "electricity" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Painting", value: "painting" },
  { label: "Flooring", value: "Flooring" },
  { label: "Interiors Service", value: "interior_service" },
  { label: "HVAC Systems", value: "hvac" },
  { label: "Fire Safety", value: "fire_safety" },
  { label: "Elevator Installation", value: "elevator" },
  { label: "Signage & Branding", value: "signage" },
];

export enum DailyProgressStatus {
  Pending = "Pending",
  InProgress = "In Progress",
  Completed = "Completed",
  Delayed = "Delayed",
}

export const dailyStatus = [
  { label: "Pending", value: DailyProgressStatus.Pending },
  { label: "In Progress", value: DailyProgressStatus.InProgress },
  { label: "Completed", value: DailyProgressStatus.Completed },
  { label: "Delayed", value: DailyProgressStatus.Delayed },
];

export const AdjacentRoads: DropdownOption[] = [
  { label: "1 side road", value: 1 },
  { label: "2 side road", value: 2 },
  { label: "3 side road", value: 3 },
  { label: "4 side road", value: 4 },
];

export const LandFacing: DropdownOption[] = [
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "South & East", value: "south-east" },
  { label: "North & West", value: "north-west" },
];

export const TotalFloorsRequired: DropdownOption[] = [
  { label: "Ground floor", value: 0 },
  { label: "1 floor", value: 1 },
  { label: "2 floors", value: 2 },
  { label: "3 floors", value: 3 },
  { label: "4 floors", value: 4 },
  { label: "5 floors", value: 5 },
  { label: "Others", value: 6 },
];

//floor options in floor details
export const floorOptions = [
  { label: "Ground floor", value: 0 },
  { label: "1 floor", value: 1 },
  { label: "2 floors", value: 2 },
  { label: "3 floors", value: 3 },
  { label: "4 floors", value: 4 },
];

//portion options in floor details
export const portionOptions = [
  { label: "1 portion", value: 1 },
  { label: "2 portion", value: 2 },
  { label: "3 portion", value: 3 },
  { label: "4 portion", value: 4 },
];

//services required

//document types

export const houseConstructionDocuments = [
  {
    label: "Land Title Deed",
    value: "land_title_deed",
    description: "Proof of ownership of the land.",
  },
  {
    label: "Property Tax Receipts",
    value: "property_tax_receipts",
    description: "Latest tax receipts showing no dues on the property.",
  },
  {
    label: "Encumbrance Certificate",
    value: "encumbrance_certificate",
    description:
      "Confirms the property is free of legal or monetary liabilities.",
  },
  {
    label: "Building Plan Approval",
    value: "building_plan_approval",
    description: "Approval from local authorities for the building plan.",
  },
  {
    label: "Layout Approval",
    value: "layout_approval",
    description: "Approval of the layout design by the local authorities.",
  },
  {
    label: "Land Conversion Certificate",
    value: "land_conversion_certificate",
    description:
      "If the land is converted from agricultural to non-agricultural use.",
  },
  {
    label: "Zoning Clearance Certificate",
    value: "zoning_clearance_certificate",
    description: "Ensures the land is zoned for residential construction.",
  },
  {
    label: "Commencement Certificate",
    value: "commencement_certificate",
    description: "Approval to start construction after plans are sanctioned.",
  },
  {
    label: "Completion Certificate",
    value: "completion_certificate",
    description:
      "Issued after construction, confirming adherence to approved plans.",
  },
  {
    label: "Occupancy Certificate",
    value: "occupancy_certificate",
    description:
      "Allows occupation after verifying all building norms are met.",
  },
];

export const PlywoodTypes: { label: string; value: string }[] = [
  { label: "Commercial Plywood", value: "commercial" },
  { label: "Marine Plywood", value: "marine" },
  { label: "BWR (Boiling Water Resistant)", value: "bwr" },
  { label: "MR (Moisture Resistant)", value: "mr" },
  { label: "Shuttering Plywood", value: "shuttering" },
  { label: "Flexible Plywood", value: "flexible" },
  { label: "Laminated Plywood", value: "laminated" },
  { label: "Hardwood Plywood", value: "hardwood" },
];


//borewells

export const casingOptions = [
  { label: "Shallow casing", value: "shallow" },
  { label: "Medium casing", value: "medium" },
  { label: "Deep casing", value: "deep" },
];

//pumpbrands

export const pumpBrands = [
  { label: "Kirloskar Brothers Limited", value: "kirloskar" },
  { label: "Shakti Pumps", value: "shakti" },
  { label: "Jindal Industries", value: "jindal" },
  { label: "CRI Pumps", value: "cri" },
  { label: "KSB Pumps", value: "ksb" },
  { label: "Texmo Industries", value: "texmo" },
  { label: "V-Guard Pumps", value: "vguard" },
  { label: "Suguna Pumps Limited", value: "suguna" },
];

//centring

export const steelBrands = [
  { label: "Tata Steel", value: "tata" },
  { label: "JSW Steel", value: "jsw" },
  { label: "SAIL", value: "sail" },
  { label: "Vizag Steel", value: "vizag" },
];

export const cementBrands = [
  { label: "UltraTech Cement", value: "ultratech" },
  { label: "Ambuja Cement", value: "ambuja" },
  { label: "ACC Cement", value: "acc" },
  { label: "Shree Cement", value: "shree" },
  { label: "Kotak Cement", value: "kotak" },
  { label: "Dalmia Cement", value: "dalmia" },
  { label: "Sakshi Cement", value: "sakshi" },
];

export const centringMaterials = [
  { label: "Wooden Planks", value: "wooden" },
  { label: "Iron Sheets", value: "iron" },
  { label: "Aluminium", value: "aluminium" },
];

//flooring

export const flooringMaterials = [
  { label: "Tiles", value: "tiles" },
  { label: "Marble", value: "marble" },
  { label: "Granite", value: "granite" },
  { label: "Wood", value: "wood" },
  { label: "Vinyl", value: "vinyl" },
];

export const finishTypes = [
  { label: "Matte", value: "matte" },
  { label: "Glossy", value: "glossy" },
  { label: "Textured", value: "textured" },
];

export const installationTypes = [
  { label: "Direct Installation", value: "direct" },
  { label: "With Adhesive", value: "adhesive" },
  { label: "Interlocking", value: "interlocking" },
];

//plumbing

export const pipeMaterials = [
  { label: "CPVC", value: "cpvc" },
  { label: "UPVC", value: "upvc" },
  { label: "PVC", value: "pvc" },
  { label: "PPR", value: "ppr" },
  { label: "Copper", value: "copper" },
  { label: "Galvanized Iron (GI)", value: "gi" },
];

export const pipeBrands = [
  { label: "Ashirvad Pipes", value: "ashirvad" },
  { label: "Astral Pipes", value: "astral" },
  { label: "Finolex Pipes", value: "finolex" },
  { label: "Supreme Pipes", value: "supreme" },
  { label: "Prince Pipes", value: "prince" },
];

export const fixtureBrands = [
  { label: "Jaquar", value: "jaquar" },
  { label: "Kohler", value: "kohler" },
  { label: "Hindware", value: "hindware" },
  { label: "Cera", value: "cera" },
  { label: "Parryware", value: "parryware" },
];

//painting
export const paintBrands = [
  { label: "Asian Paints", value: "asian_paints" },
  { label: "Berger", value: "berger" },
  { label: "Nerolac", value: "nerolac" },
  { label: "Dulux", value: "dulux" },
  { label: "Shalimar", value: "shalimar" },
];

export const surfacePreparationOptions = [
  { label: "Wall Putty", value: "wallPutty" },
  { label: "Primer", value: "primer" },
  { label: "Sanding", value: "sanding" },
];

//electricity
export const wireBrands = [
  { label: "Havells", value: "havells" },
  { label: "Finolex", value: "finolex" },
  { label: "Polycab", value: "polycab" },
  { label: "KEI Wires", value: "kei" },
  { label: "RR Kabel", value: "rr_kabel" },
];

export const switchBrands = [
  { label: "Anchor", value: "anchor" },
  { label: "Schneider", value: "schneider" },
  { label: "Legrand", value: "legrand" },
  { label: "GM Modular", value: "gm_modular" },
];

export const safetyOptions = [
  { label: "Fuse Box Installation", value: "fuse_box" },
  { label: "Circuit Breaker (MCB/DB)", value: "circuit_breaker" },
  { label: "Earthing Connection", value: "earthing" },
];

//ceilingMaterials

export const ceilingMaterials = [
  { label: "Gypsum", value: "gypsum" },
  { label: "POP (Plaster of Paris)", value: "pop" },
  { label: "Wooden Panels", value: "wooden" },
  { label: "PVC Panels", value: "pvc" },
  { label: "Metal Sheets", value: "metal" },
];

export const ceilingDesigns = [
  { label: "Plain Ceiling", value: "plain" },
  { label: "Cove Ceiling", value: "cove" },
  { label: "Layered Ceiling", value: "layered" },
  { label: "Tray Ceiling", value: "tray" },
  { label: "Grid Ceiling", value: "grid" },
];

export const lightingOptions = [
  { label: "Recessed Lights (Downlights)", value: "recessed_lights" },
  { label: "LED Strips", value: "led_strips" },
  { label: "Hanging Fixtures", value: "hanging_fixtures" },
];

export const finishOptions = [
  { label: "Matte", value: "matte" },
  { label: "Glossy", value: "glossy" },
  { label: "Textured", value: "textured" },
];

export const roomTypes = [
  { label: "Bedroom", value: "bedroom" },
  { label: "Living Room", value: "living_room" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Bathroom", value: "bathroom" },
  { label: "Dining Room", value: "dining_room" },
];

export const placeTypes = [
  ...roomTypes,
  { label: "Hall", value: "hall" },
  { label: "Puja Room", value: "puja_room" },
  { label: "Guest Room", value: "guest_room" },
  { label: "Balcony", value: "balcony" },
  { label: "Whole property", value: "whole_property" },
];

export const commercialPlaceTypes = [
  { label: "Lobby", value: "lobby" },
  { label: "Reception", value: "reception" },
  { label: "Office Space", value: "office_space" },
  { label: "Conference Room", value: "conference_room" },
  { label: "Showroom Floor", value: "showroom_floor" },
  { label: "Parking Area", value: "parking_area" },
  { label: "Cafeteria", value: "cafeteria" },
  { label: "Washroom", value: "washroom" },
  { label: "Server Room", value: "server_room" },
  { label: "Store Room", value: "store_room" },
  { label: "Patient Ward", value: "patient_ward" },
  { label: "Operation Theater", value: "operation_theater" },
  { label: "Hotel Room", value: "hotel_room" },
  { label: "Kitchen (Commercial)", value: "commercial_kitchen" },
  { label: "Banquet Hall", value: "banquet_hall" },
  { label: "Corridor", value: "corridor" },
  { label: "Terrace", value: "terrace" },
  { label: "Basement", value: "basement" },
  { label: "Whole Property", value: "whole_property" },
  { label: "External Area", value: "external_area" },
];

export const brickTypes = [
  { label: "Clay Bricks", value: "clay" },
  { label: "Fly Ash Bricks", value: "flyash" },
  { label: "AAC Blocks", value: "aac" },
  { label: "Concrete Bricks", value: "concrete" },
];

export const plasteringOptions = [
  { label: "Internal Plastering", value: "internal" },
  { label: "External Plastering", value: "external" },
];

export const railingMaterials = [
  { label: "Stainless Steel", value: "stainless_steel" },
  { label: "Wrought Iron", value: "wrought_iron" },
  { label: "Aluminum", value: "aluminum" },
  { label: "Glass", value: "glass" },
  { label: "Wood", value: "wood" },
  { label: "Concrete", value: "concrete" },
  { label: "Brass", value: "brass" },
  { label: "PVC (Polyvinyl Chloride)", value: "pvc" },
  { label: "Mild Steel (MS)", value: "mild_steel" },
  { label: "Cast Iron", value: "cast_iron" },
];

export const directions = ["North", "South", "East", "West"];

export const generateDirectionCombinations = (count) => {
  const results = [];
  const helper = (start, path) => {
    if (path.length === count) {
      results.push(path);
      return;
    }
    for (let i = start; i < directions.length; i++) {
      helper(i + 1, [...path, directions[i]]);
    }
  };
  helper(0, []);
  return results;
};

//generate function for portion combination
export const generatePortionCombinations = (
  numPortions: number,
  types: string[]
) => {
  const results: string[][] = [];

  const helper = (start: number, path: string[]) => {
    if (path?.length === numPortions) {
      results.push([...path]);
      return;
    }

    for (let i = 0; i < types.length; i++) {
      helper(i, [...path, types[i]]);
    }
  };

  helper(0, []);
  return results.map((combination) => combination.join(" & "));
};

export function generateFloorsData(numberOfFloors) {
  const floorData = [];

  for (let i = 0; i <= numberOfFloors; i++) {
    floorData.push({
      floor: i == 0 ? "Ground floor" : `${i} Floor`,
      portions: 0,
      type_of_portions: [],
      parking_required_ground_floor: false,
      common_washroom_ground_floor: false,
      type_of_rooms: [],
    });
  }

  return floorData;
}

export function getCombinationsWithLabels(size) {
  const result = [];
  const arr = [1, 2, 3];

  function helper(temp, start) {
    if (temp.length === size) {
      result.push({
        label: temp.join(" & ") + " bhk",
        value: [...temp],
      });
      return;
    }

    for (let i = start; i < arr.length; i++) {
      temp.push(arr[i]);
      helper(temp, i);
      temp.pop();
    }
  }

  helper([], 0);
  return result;
}

export function generateDefaultRoomTypes(roomTypes) {
  const data = roomTypes.map((typeIndex) => ({
    type: typeIndex,
    options: [],
    number_of_bathrooms: 1,
    number_of_balconies: 0,
    indian_bathroom_required: false,
  }));
  return data;
}

export function generateBathroomOptions(num) {
  return Array.from({ length: num }, (_, index) => ({
    label: `${index + 1} bathroom${index + 1 > 1 ? "s" : ""}`,
    value: index + 1,
  }));
}

//helper functions to get dynamic portion options
export const getDynamicFloorPortionoptions = (portionType) => {
  if (["3BHK", "4BHK"].includes(portionType.toString())) {
    return [...baseOptions, ...extendedOptions];
  } else {
    return [...baseOptions];
  }
};

export const getMaxBedrooms = (portionType) => {
  switch (portionType) {
    case "1BHK":
      return 1;
    case "2BHK":
      return 2;
    case "3BHK":
      return 3;
    case "4BHK":
      return 4;
    default:
      return 0;
  }
};

export const getIcon = (name: string) => {
  switch (name) {
    case "Date":
      return <FaCalendar className="text-gray-500 mr-2" />;
    case "Work Type":
      return <FaTools className="text-[#3586FF]  mr-2" />;
    case "Place Type":
      return <FaMapMarkerAlt className="text-green-500 mr-2" />;
    case "Description":
      return <FaFileAlt className="text-gray-700 mr-2" />;
    case "Labour Count":
      return <FaUsers className="text-yellow-500 mr-2" />;
    case "Issues":
      return <FaExclamationTriangle className="text-red-500 mr-2" />;
    case "Customer Notes":
      return <FaStickyNote className="text-purple-500 mr-2" />;
    case "Images":
      return <AiOutlineFileImage className="text-[#3586FF]  mr-2" />;
case "Floor":
      return <FaBuilding className="text-orange-500 mr-2" />;
    case "Status":
      return <FaClipboardList className="text-teal-500 mr-2" />;
    case "Materials":
      return <FaCubes className="text-pink-500 mr-2" />;
    case "Expenses Incurred":
      return <FaRupeeSign className="text-green-600 mr-2" />;
    case "Room Type":
      return <FaDoorClosed className="text-indigo-500 mr-2" />;
    case "Feature Type":
      return <FaStar className="text-yellow-600 mr-2" />;

    default:
      return null;
    
    
  }
};
export const keyLabelMap: Record<string, string> = {
  date: "Date",
  workType: "Work Type",
  placeType: "Place Type",
  description: "Description",
  laborCount: "Labour Count",
  issues: "Issues",
  customerNotes: "Customer Notes",
  floor:"Floor",
  status:"Status",
  featureType:'Feature Type',
  roomType:"Room Type",

};
export const getStatusIcon = (status) => {
  switch (status) {
    case "In Progress": return <FaClock className="inline mr-1 text-[#3586FF] " />;
    case "Completed": return <FaCheckCircle className="inline mr-1 text-green-500" />;
    case "Pending": return <FaExclamationTriangle className="inline mr-1 text-yellow-500" />;
    case "Delayed": return <FaTimesCircle className="inline mr-1 text-red-500" />;
    default: return null;
  }
};
export const getStatusClasses = (status) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-green-100 text-green-700";
    case "Pending":
      return "bg-yellow-100 text-yellow-700";
    case "Delayed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const placeTypeMap = {
  bedroom: { 
    icon: <FaBed />, 
    style: "bg-purple-100 text-purple-700" 
  },
  living_room: { 
    icon: <FaCouch />, 
    style: "bg-pink-100 text-pink-700" 
  },
  kitchen: { 
    icon: <MdOutlineKitchen />, 
    style: "bg-yellow-100 text-yellow-700" 
  },
  bathroom: { 
    icon: <FaBath />, 
    style: "bg-blue-100 text-blue-700" 
  },
  dining_room: { 
    icon: <FaChair />, 
    style: "bg-green-100 text-green-700" 
  },
  hall: { 
    icon: <FaHome />, 
    style: "bg-orange-100 text-orange-700" 
  },
  puja_room: { 
    icon: <FaPrayingHands />, 
    style: "bg-red-100 text-red-700" 
  },
  guest_room: { 
    icon: <FaUserFriends />, 
    style: "bg-indigo-100 text-indigo-700" 
  },
  balcony: { 
    icon: <FaTree />, 
    style: "bg-teal-100 text-teal-700" 
  },
  whole_property: { 
  icon: <MdOutlineApartment />, 
  style: "bg-cyan-100 text-cyan-700" 
}
};


export const workTypeMap = {
  document_drafting: { 
    icon: <IoDocumentTextOutline />, 
    style: "bg-gray-100 text-gray-700" 
  },
  borewells: { 
    icon: <GiWaterMill />, 
    style: "bg-blue-100 text-blue-700" 
  },
  centring: { 
    icon: <RiBuildingLine />, 
    style: "bg-orange-100 text-orange-700" 
  },
  brick_masonry: { 
    icon: <MdOutlineMeetingRoom />, 
    style: "bg-red-100 text-red-700" 
  },
  fall_ceiling: { 
    icon: <GiCeilingLight />, 
    style: "bg-purple-100 text-purple-700" 
  },
  electricity: { 
    icon: <RiBuildingLine />, 
    style: "bg-yellow-100 text-yellow-700" 
  },
  plumbing: { 
    icon: <GiPipes />, 
    style: "bg-teal-100 text-teal-700" 
  },
  painting: { 
    icon: <GiPaintRoller />, 
    style: "bg-pink-100 text-pink-700" 
  },
  flooring: { 
    icon: <FaChair />, 
    style: "bg-green-100 text-green-700" 
  },
  interior_service: { 
    icon: <FaCouch />, 
    style: "bg-indigo-100 text-indigo-700" 
  },
  hvac: {
    icon: <TbAirConditioning />,
    style: "bg-sky-100 text-sky-700"
  },
  fire_safety: {
    icon: <MdLocalFireDepartment />,
    style: "bg-red-100 text-red-700"
  },
  elevator: {
    icon: <FaArrowUp />,
    style: "bg-violet-100 text-violet-700"
  },
  glazing_facade: {
    icon: <TbGlass />,
    style: "bg-cyan-100 text-cyan-700"
  },
  parking_infra: {
    icon: <FaParking />,
    style: "bg-stone-100 text-stone-700"
  },
  signage: {
    icon: <FaSignature />,
    style: "bg-amber-100 text-amber-700"
  }
};
export const billCategoryOptions = [
  { id: 1, role: "materials" },
  { id: 2, role: "labour" },
  { id: 3, role: "machinery" },
  { id: 4, role: "permits" },
  { id: 5, role: "utilities" },
  { id: 6, role: "transport" },
  { id: 7, role: "misc" },
];
export const workTypePlaceMap: Record<string, string[]> = {
  painting: ['bedroom', 'living_room', 'hall', 'dining_room', 'whole_property'],
  flooring: ['bedroom', 'living_room', 'hall', 'kitchen'],
  plumbing: ['bathroom', 'kitchen'],
  electricity: ['bedroom', 'living_room', 'kitchen', 'bathroom', 'hall'],
  fall_ceiling: ['living_room', 'hall', 'bedroom'],
  interior_service: ['living_room', 'bedroom', 'dining_room', 'hall'],
  document_drafting: ['whole_property'],
  brick_masonry: ['whole_property'],
  centring: ['whole_property'],
  borewells: ['whole_property'],
};

export const commercialWorkTypePlaceMap: Record<string, string[]> = {
  painting: ['lobby', 'reception', 'office_space', 'conference_room', 'showroom_floor', 'corridor', 'whole_property'],
  flooring: ['lobby', 'reception', 'office_space', 'showroom_floor', 'corridor', 'whole_property'],
  plumbing: ['washroom', 'commercial_kitchen', 'whole_property'],
  electricity: ['office_space', 'conference_room', 'showroom_floor', 'server_room', 'whole_property'],
  fall_ceiling: ['lobby', 'reception', 'office_space', 'conference_room', 'corridor'],
  interior_service: ['lobby', 'reception', 'office_space', 'conference_room', 'showroom_floor'],
  document_drafting: ['whole_property'],
  brick_masonry: ['whole_property'],
  centring: ['whole_property'],
  hvac: ['office_space', 'conference_room', 'showroom_floor', 'server_room', 'patient_ward', 'hotel_room', 'banquet_hall', 'whole_property'],
  fire_safety: ['whole_property', 'server_room', 'commercial_kitchen', 'basement', 'parking_area'],
  elevator: ['whole_property'],
  glazing_facade: ['external_area', 'lobby', 'showroom_floor', 'whole_property'],
  parking_infra: ['parking_area', 'basement'],
  signage: ['external_area', 'lobby', 'reception', 'showroom_floor'],
};

export const phaseWorkTypeMap: Record<string, string[]> = {
  Documentation: ['document_drafting'],
  Foundation: ['borewells', 'brick_masonry', 'centring'],
  Structure: ['brick_masonry', 'centring'],
  Services: ['electricity', 'plumbing'],
  Finishes: ['painting', 'flooring', 'fall_ceiling'],
  Interiors: ['interior_service'],
};

export const commercialPhaseWorkTypeMap: Record<string, string[]> = {
  Documentation: ['document_drafting'],
  Foundation: ['borewells', 'centring'],
  Structure: ['brick_masonry', 'centring'],
  'MEP & Services': ['hvac', 'fire_safety', 'elevator', 'electricity', 'plumbing'],
  'Envelope & Facade': ['glazing_facade', 'painting'],
  Infrastructure: ['parking_infra', 'borewells'],
  'Signage & Finishing': ['signage', 'flooring', 'fall_ceiling', 'interior_service'],
};

export const commercialPlaceTypeMap = {
  lobby: { icon: <FaBuilding />, style: "bg-blue-100 text-blue-700" },
  reception: { icon: <FaHome />, style: "bg-purple-100 text-purple-700" },
  office_space: { icon: <MdOutlineApartment />, style: "bg-indigo-100 text-indigo-700" },
  conference_room: { icon: <MdOutlineMeetingRoom />, style: "bg-green-100 text-green-700" },
  showroom_floor: { icon: <FaBuilding />, style: "bg-amber-100 text-amber-700" },
  parking_area: { icon: <FaParking />, style: "bg-stone-100 text-stone-700" },
  cafeteria: { icon: <FaUtensils />, style: "bg-orange-100 text-orange-700" },
  washroom: { icon: <FaBath />, style: "bg-blue-100 text-blue-700" },
  server_room: { icon: <FaCubes />, style: "bg-gray-100 text-gray-700" },
  store_room: { icon: <FaDoorClosed />, style: "bg-yellow-100 text-yellow-700" },
  patient_ward: { icon: <FaBed />, style: "bg-red-100 text-red-700" },
  operation_theater: { icon: <FaShieldAlt />, style: "bg-red-100 text-red-700" },
  hotel_room: { icon: <FaBed />, style: "bg-purple-100 text-purple-700" },
  commercial_kitchen: { icon: <MdOutlineKitchen />, style: "bg-yellow-100 text-yellow-700" },
  banquet_hall: { icon: <FaHome />, style: "bg-pink-100 text-pink-700" },
  corridor: { icon: <RiBuildingLine />, style: "bg-gray-100 text-gray-700" },
  terrace: { icon: <FaTree />, style: "bg-teal-100 text-teal-700" },
  basement: { icon: <FaBuilding />, style: "bg-stone-100 text-stone-700" },
  external_area: { icon: <FaTree />, style: "bg-green-100 text-green-700" },
};

export const commercialAddOptions = [
  { label: "Generator Room", value: "generator_room" },
  { label: "Water Treatment Plant", value: "water_treatment" },
  { label: "Sewage Treatment Plant", value: "sewage_treatment" },
  { label: "Security Cabin", value: "security_cabin" },
  { label: "Loading Dock", value: "loading_dock" },
  { label: "Fire Escape", value: "fire_escape" },
  { label: "Rooftop Access", value: "rooftop_access" },
  { label: "CCTV Room", value: "cctv_room" },
];





