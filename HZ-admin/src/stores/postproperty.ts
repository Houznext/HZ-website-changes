import { create } from "zustand";

// Define interfaces for the data structures
export type AllowedUnits =
  | "sq.ft"
  | "sq.yard"
  | "sq.meter"
  | "acre"
  | "cent"
  | "marla"
  | "";
interface BasicDetails {
  ownerType: string;
  purpose: string;
  lookingType: string;
  email: string;
  phone: string;
}
export interface SizeWithUnit {
  size: number;
  unit: AllowedUnits;
}

export interface ILocationDetails {
  city: string;
  locality: string;
  state: string;
  subLocality: string | null;
  landmark: string | null;
  latitude: string;
  longitude: string;
  place_id: string;
  street?: string | null;
  zipCode?: string | null;
  formattedAddress?: string | null;
}

export interface ResidentialAttributes {
  bhk: string;
  facing: string;
  floorArea: SizeWithUnit | null;
  buildupArea: SizeWithUnit | null;
  bathrooms: number | null;
  balcony: number | null;
  totalFloors: number | null;
  currentFloor: number | null;
  parking2w: boolean;
  parking4w: boolean;
}

export interface IPricingDetails {
  advanceAmount: number | null;
  securityDeposit: number | null;
  monthlyRent: number | null;
  maxPriceOffer: number | null;
  minPriceOffer: number | null;
  isNegotiable: boolean;
  maintenanceCharges: number | null;
  pricePerSqft: number | null;
  expectedPrice: number | null;
}

export interface ConstructionStatus {
  status: string;
  ageOfProperty: number | null;
  possessionYears: number | null;
  possessionBy: Date | null;
}

export interface Furnishing {
  furnishedType: string;
  amenities: string[];
  furnishings: string[];
}
export interface FlatshareAttributes {
  lookingFor: string;
  occupancy: string;
  bhk: string;
  waterAvailability: string;
  facing: string;
  bathroom: number | null;
  balcony: number | null;
  floorArea: SizeWithUnit | null;
  totalFloors: number | null;
  currentFloor: number | null;
  parking2w: boolean;
  parking4w: boolean;
}

export interface PlotAttributes {
  plotArea: SizeWithUnit | null;
  length: SizeWithUnit | null;
  width: SizeWithUnit | null;
  widthFacingRoad: SizeWithUnit | null;
  facing: string;
  possessionStatus: string;
  possessionDate: Date;
  transactionType: string;
  boundaryWall: boolean;
  noOfFloorsAllowed: number | null;
}

export interface CommercialFacilities {
  minSeats: number | null;
  numberOfCabins: number | null;
  numberOfMeetingRooms: number | null;
  numberOfWashrooms: number | null;
}

export interface CommercialAttributes {
  suitableFor: string[];
  ownership: string;
  locationHub: string;
  builtUpArea: SizeWithUnit | null;
  totalFloors: number | null;
  currentFloor: number | null;
  twoWheelerParking: number | null;
  fourWheelerParking: number | null;
  staircases: number | null;
  passengerLifts: number | null;
  entranceAreaWidth: SizeWithUnit | undefined;
  entranceAreaHeight: SizeWithUnit | undefined;
}

export interface IPropertyDetails {
  propertyType: string;
  propertyName: string;
  description: string;
  residentialAttributes: null | ResidentialAttributes;
  commercialAttributes: null | CommercialAttributes;
  facilities: CommercialFacilities | null;
  occupancyDetails: null;
  plotAttributes: null | PlotAttributes;
  pricingDetails: null | IPricingDetails;
  constructionStatus: null | ConstructionStatus;
   flatshareAttributes: null | FlatshareAttributes;
  furnishing: null | Furnishing;
}

export interface MediaDetails {
  propertyImages: string[];
  propertyVideo: string[];
}

type ReadOnlyPropertyStore = Omit<
  PropertyStore,
  | "setBasicDetails"
  | "setLocationDetails"
  | "setPropertyDetails"
  | "setMediaDetails"
  | "setProperty"
  | "resetState"
>;

// Define the store state interface
export interface PropertyStore {
  propertyId: number | null;
  currentStep: number;
  isPosted: boolean;
  postedDate: Date | null;
  isApproved: boolean;
  basicDetails: BasicDetails | null;
  locationDetails: ILocationDetails | null;
  propertyDetails: IPropertyDetails | null;
  mediaDetails: MediaDetails | null;
  updatedDate: Date | null;
  updatedBy: string | null;
  errors: Record<string, string>;
   isReferAndEarnEnabled: boolean;
  referAndEarnAgreementId: number | null;
   setReferAndEarnData: (data: { enabled: boolean; agreementId?: number }) => void;

  // Actions
  setBasicDetails: (data: any) => void;
  setLocationDetails: (data: any) => void;
  setPropertyDetails: (data: any) => void;
  setMediaDetails: (data: any) => void;
  setCurrentStep: (step: number) => void;

  setProperty: (data: Partial<PropertyStore>) => void;
  setErrors: (errors: Record<string, string>) => void;
  getProperty: () => ReadOnlyPropertyStore;

  resetState: () => void;
}

export const propertyInitialState: Omit<
  PropertyStore,
  | "setBasicDetails"
  | "setLocationDetails"
  | "setPropertyDetails"
  | "setMediaDetails"
  | "setProperty"
  | "resetState"
  | "setErrors"
  | "getProperty"
  | "setCurrentStep"
  |"setReferAndEarnData"
> = {
  propertyId: null,
  currentStep: 0,
  isPosted: false,
  postedDate: null,
  isApproved: false,
  basicDetails: {
    ownerType: "",
    purpose: "",
    lookingType: "",
    email: "",
    phone: "",
  },
  locationDetails: {
    city: "",
    state: "",
    locality: "",
    subLocality: "",
    landmark: "",
    longitude: "",
    latitude: "",
    place_id: "",
  },
  propertyDetails: {
    propertyType: "",
    propertyName: "",
    description: "",
    residentialAttributes: {
      bhk: "",
      facing: "",
      floorArea: null,
      buildupArea: null,
      bathrooms: null,
      balcony: null,
      totalFloors: null,
      currentFloor: null,
      parking2w: false,
      parking4w: false,
    },
    flatshareAttributes: null,
    commercialAttributes: null,
    facilities: null,
    occupancyDetails: null,
    plotAttributes: null,
    pricingDetails: {
      pricePerSqft: null,
      expectedPrice: null,
      monthlyRent: null,
      advanceAmount: null,
      maintenanceCharges: null,
      securityDeposit: null,
      maxPriceOffer: null,
      minPriceOffer: null,
      isNegotiable: false,
    },
    constructionStatus: {
      status: "",
      ageOfProperty: null,
      possessionYears: null,
      possessionBy: null,
    },
    furnishing: {
      furnishedType: "",
      amenities: [],
      furnishings: [],
    },
  },
  mediaDetails: null,
  updatedDate: null,
  updatedBy: null,
  errors: {},
  isReferAndEarnEnabled: false,
  referAndEarnAgreementId: null,
};


const usePostPropertyStore = create<PropertyStore>((set, get) => ({
  ...propertyInitialState,

  setBasicDetails: (data) =>
    set((prev) => ({
      ...prev,
      currentStep: data.currentStep,
      postedDate: data.postedDate,
      basicDetails: data.basicDetails,
    })),

  setLocationDetails: (data) =>
    set((prev) => ({
      ...prev,
      currentStep: data.currentStep,
      locationDetails: data.locationDetails,
      updatedDate: data.updatedDate,
      updatedBy: data.updatedBy,
    })),

  setPropertyDetails: (data: any) => {
    set((prev) => ({
      ...prev,
      currentStep: data.currentStep,
      propertyDetails: data.propertyDetails,
      updatedDate: data.updatedDate,
      updatedBy: data.updatedBy,
    }));
  },

  setMediaDetails: (data) =>
    set((prev) => ({
      ...prev,
      currentStep: data.currentStep,
      isPosted: data.isPosted,
      mediaDetails: data.mediaDetails,
      updatedDate: data.updatedDate,
      updatedBy: data.updatedBy,
    })),

  setProperty: (data) =>
    set((state) => ({
      ...state,
      ...data,
    })),
  setErrors: (errors) => {
    set((state) => ({
      ...state,
      errors,
    }));
  },

  setCurrentStep: (step) => {
    set((state) => ({ ...state, currentStep: step }));
  },
 setReferAndEarnData: ({ enabled, agreementId }) => 
    set((state) => ({
      ...state,
      isReferAndEarnEnabled: enabled,
      referAndEarnAgreementId: agreementId ?? null,
    })),
  getProperty: (): ReadOnlyPropertyStore => {
    const state = get();
    return state;
  },

  resetState: () => set(() => ({ ...propertyInitialState })),
}));

export default usePostPropertyStore;
