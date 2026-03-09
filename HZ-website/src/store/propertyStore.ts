import { create } from "zustand";

export type FurnishedType = "Furnished" | "Unfurnished";

export type OwnerType =
  | "Freehold"
  | "Leasehold"
  | "JointTenancy"
  | "TenancyInCommon"
  | "Condominium"
  | "Partnership"
  | "Timeshare"
  | "SoleOwnership";

export type FacingType =
  | "North"
  | "South"
  | "East"
  | "West"
  | "NorthEast"
  | "NorthWest"
  | "SouthEast"
  | "SouthWest";

export type LookingForType = "Female" | "Male" | "Any";

export type OccupancyStatusType = "Single" | "Shared" | "Any";

export type ElectricityStatusType =
  | "No Powercut"
  | "Rare Powercut"
  | "Occasional Powercut"
  | "Frequent Powercut";

export type PropertyStatusType =
  | "Available"
  | "Under Contract"
  | "Sold"
  | "Pending"
  | "Off Market"
  | "Coming Soon"
  | "Leased"
  | "Reserved"
  | "In Negotiation"
  | "Withdrawn"
  | "Price Reduced"
  | "New Listing"
  | "Back on Market"
  | "Under Offer"
  | "Short Sale"
  | "Foreclosure"
  | "Auction"
  | "Temporary Hold"
  | "Pre-Approval"
  | "On Hold"
  | "Ready to Move"
  | "Under Construction"
  | "Pre-Construction"
  | "Renovation"
  | "Under Renovation"
  | "Completed"
  | "Pending Completion"
  | "For Rent"
  | "For Sale"
  | "For Lease";

export type PropertyTypeType =
  | "Apartment"
  | "Flat"
  | "Studio"
  | "Penthouse"
  | "Duplex"
  | "Villa"
  | "Townhouse"
  | "Condo"
  | "Row House"
  | "Bungalow"
  | "Plot"
  | "Open Land"
  | "Agricultural Land"
  | "Commercial Land"
  | "Industrial Property"
  | "Retail Space"
  | "Office Space"
  | "Warehouse"
  | "Mixed-Use Property"
  | "Luxury Home"
  | "Premium Home"
  | "Vacation Home"
  | "Single-Family Home"
  | "Multi-Family Home"
  | "Senior Living Community"
  | "Student Housing"
  | "Serviced Apartment"
  | "Co-Living Space";

export type WaterAvailabilityType = "Full" | "Partial" | "Tanker" | "None";

export type BedRoomsType =
  | "No Bedroom"
  | "1 Bedroom"
  | "2 Bedrooms"
  | "3 Bedrooms"
  | "4 Bedrooms"
  | "5 Bedrooms"
  | "6 Bedrooms"
  | "More than 6 Bedrooms";

export type BathRoomsType =
  | "1 Bathroom"
  | "2 Bathrooms"
  | "3 Bathrooms"
  | "4 Bathrooms"
  | "5 Bathrooms"
  | "6 Bathrooms"
  | "More than 6 Bathrooms";

export const waterAvailabilityOptions: WaterAvailabilityType[] = [
  "Full",
  "Partial",
  "Tanker",
  "None",
];

export const propertyTypeOptions: PropertyTypeType[] = [
  "Apartment",
  "Flat",
  "Studio",
  "Penthouse",
  "Duplex",
  "Villa",
  "Townhouse",
  "Condo",
  "Row House",
  "Bungalow",
  "Plot",
  "Open Land",
  "Agricultural Land",
  "Commercial Land",
  "Industrial Property",
  "Retail Space",
  "Office Space",
  "Warehouse",
  "Mixed-Use Property",
  "Luxury Home",
  "Premium Home",
  "Vacation Home",
  "Single-Family Home",
  "Multi-Family Home",
  "Senior Living Community",
  "Student Housing",
  "Serviced Apartment",
  "Co-Living Space",
];

export const propertyStatusOptions: PropertyStatusType[] = [
  "Available",
  "Under Contract",
  "Sold",
  "Pending",
  "Off Market",
  "Coming Soon",
  "Leased",
  "Reserved",
  "In Negotiation",
  "Withdrawn",
  "Price Reduced",
  "New Listing",
  "Back on Market",
  "Under Offer",
  "Short Sale",
  "Foreclosure",
  "Auction",
  "Temporary Hold",
  "Pre-Approval",
  "On Hold",
  "Ready to Move",
  "Under Construction",
  "Pre-Construction",
  "Renovation",
  "Under Renovation",
  "Completed",
  "Pending Completion",
  "For Rent",
  "For Sale",
  "For Lease",
];

export const electricityStatusOptions: ElectricityStatusType[] = [
  "No Powercut",
  "Rare Powercut",
  "Occasional Powercut",
  "Frequent Powercut",
];

export const facingTypes: FacingType[] = [
  "North",
  "South",
  "East",
  "West",
  "NorthEast",
  "NorthWest",
  "SouthEast",
  "SouthWest",
];

export const lookingForOptions: LookingForType[] = ["Male", "Female", "Any"];
export const occupanyStatusOptions: OccupancyStatusType[] = [
  "Shared",
  "Single",
  "Any",
];

export const ownerTypeOptions: OwnerType[] = [
  "Freehold",
  "Leasehold",
  "JointTenancy",
  "TenancyInCommon",
  "Condominium",
  "Partnership",
  "Timeshare",
  "SoleOwnership",
];

export const furnishedTypeOptions: FurnishedType[] = [
  "Furnished",
  "Unfurnished",
];

export const bedRoomsArray: BedRoomsType[] = [
  "No Bedroom",
  "1 Bedroom",
  "2 Bedrooms",
  "3 Bedrooms",
  "4 Bedrooms",
  "5 Bedrooms",
  "6 Bedrooms",
  "More than 6 Bedrooms",
];

export const bathRoomsArray: BathRoomsType[] = [
  "1 Bathroom",
  "2 Bathrooms",
  "3 Bathrooms",
  "4 Bathrooms",
  "5 Bathrooms",
  "6 Bathrooms",
  "More than 6 Bathrooms",
];
export interface PostPropertyState {
  propertyName: string;
  ownerName: string;
  locationLink: string;
  estimatedBudget: string;
  estimatedSquareFeet: string;
  addressDetails: string;
  overView?: string;
  ownerType: OwnerType;
  facing: FacingType;
  electricityStatus: ElectricityStatusType;
  propertyStatus: PropertyStatusType;
  propertyType: PropertyTypeType;
  waterAvailability: WaterAvailabilityType;
  furnishedStatus: FurnishedType;
  bathrooms: BathRoomsType;
  bedrooms: BedRoomsType;
  authorityApproval?: string;
  floor?: string;
  cityId?: number;
  setPropertyState: (newState: Partial<PostPropertyState>) => void;
}

export const usePropertyStore = create<PostPropertyState>((set) => ({
  propertyName: "",
  ownerName: "",
  locationLink: "",
  estimatedBudget: "",
  estimatedSquareFeet: "",
  addressDetails: "",
  overView: "",
  ownerType: "Freehold",
  bathrooms: "1 Bathroom",
  bedrooms: "2 Bedrooms",
  facing: "North",
  electricityStatus: "No Powercut",
  furnishedStatus: "Furnished",
  propertyStatus: "Available",
  propertyType: "Flat",
  waterAvailability: "Full",
  authorityApproval: "",
  floor: "",
  setPropertyState: (newState) => set((state) => ({ ...state, ...newState })),
}));
