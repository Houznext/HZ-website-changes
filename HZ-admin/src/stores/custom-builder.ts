import { create } from "zustand";
import { IndianState } from "../utils/states";

type PackageType = "Basic" | "Classic" | "Premium" | "Royal";

export type AllowedUnits =
  | "sq.ft"
  | "sq.yard"
  | "sq.meter"
  | "acre"
  | "cent"
  | "marla"
  | "";

export const indianStateOptions = Object.values(IndianState).map((state) => ({
  label: state,
  value: state,
}));
const makeEmptyFloor = (index: number) => ({
  floor: index === 0 ? "Ground Floor" : `${index} Floor`,
  portions: 0,
  type_of_portions: [] as string[],
  portionDetails: [] as any[],
  ground_floor_details: [] as string[],
});
export interface Phase {
  id: number;
  order: number;
  name: string;
  plannedDays: number;
  plannedCost: number | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualDays: number;
  actualCost: number;
  createdAt?: string;
  updatedAt?: string;
}
interface ContactDetails {
  id?: number;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  createCustomBuilder?: boolean;
  assignCustomerBranchRole?: boolean;
}

interface AddressDetails {
  id?: number;
  city: string;
  state: string;
  locality: string;
  zipCode: string;
  address_line_1: string;
  address_line_2?: string;
}

interface ColorScheme {
  label: string;
  color: string;
}

export interface SizeWithUnit {
  size: number;
  unit: AllowedUnits;
}
interface InteriorInformation {
  total_area: SizeWithUnit | null;
  project_scope: string;
  style_preference: string;
  color_scheme: ColorScheme[];
  budget: number | null;
  totalFloors: number | null;
  total_floors: number | null;
  special_requirements: string;
  reference_images: string[];
  additional_details: string;
  additionOptions: [];
  floors: Array<{
    floor: string;
    portions: number;
    type_of_portions: string[];
    ground_floor_details: string[];
    portionDetails: Array<{
      portionType: string;
      bedrooms: number;
      bathrooms: number;
      balconies: number;
      indian_bathroom_required: boolean;
      additional_rooms: string[];
    }>;
  }>;
}

interface HouseConstructionInfo {
  total_area: SizeWithUnit | null;
  length: SizeWithUnit | null;
  width: SizeWithUnit | null;
  adjacent_roads: number | null;
  land_facing: string;
  total_floors: number | null;
  gate_side: string;
  additional_details: string;
  staircase_gate: string;
  propertyImages: string[];
  additionOptions: string[];
  floors: Array<{
    floor: string;
    portions: number;
    type_of_portions: string[];
    ground_floor_details: string[];
    portionDetails: Array<{
      portionType: string;
      bedrooms: number;
      bathrooms: number;
      balconies: number;
      indian_bathroom_required: boolean;
      additional_rooms: string[];
    }>;
  }>;
}

interface CommercialConstructionInfo {
  commercial_type: string;
  total_area: SizeWithUnit | null;
  total_floors: number | null;
  basement_floors: number | null;
  parking_floors: number | null;
  land_facing: string;
  gate_side: string;
  length: SizeWithUnit | null;
  width: SizeWithUnit | null;
  height: SizeWithUnit | null;
  adjacent_roads: number | null;
  elevator_required: boolean;
  number_of_elevators: number | null;
  central_ac_required: boolean;
  fire_safety_required: boolean;
  parking_required: boolean;
  parking_capacity: number | null;
  generator_backup_required: boolean;
  generator_capacity_kva: number | null;
  water_treatment_required: boolean;
  sewage_treatment_required: boolean;
  propertyImages: string[];
  additionOptions: string[];
  additional_details: string;
  zoning_info: {
    zone_type?: string;
    fsi_allowed?: number;
    setback_front?: number;
    setback_side?: number;
    setback_rear?: number;
  } | null;
}

export interface PaymentRecord {
  id?: string;
  amount: number;
  status: "Pending" | "Partial" | "Completed" | "Overdue" | "Refunded";
  paymentMethod?: string;
  paymentType?: string;
  paymentDate?: string;
  dueDate?: string;
  description?: string;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  phaseName?: string;
  receivedBy?: string;
  createdAt?: string;
}

interface PropertyInformation {
  id?: number;
  construction_type: string;
  propertyName?: string;
  property_type: string;
  commercial_property_type?: string;
  construction_scope: "House" | "Interior";
  house_construction_info: HouseConstructionInfo;
  interior_info: InteriorInformation;
  commercial_construction_info: CommercialConstructionInfo;
}

interface Borewells {
  id?: number;
  recommendedDepth: number | null;
  borewellDiameter: number | null;
  hydroSurvey: boolean;
  casingType: string;
  drillingType: string;
  casingDepth: string;
  pumpBrand: string;
  additionalRequirement: string;
}
interface DocumentDrafting {
  id?: number;
  documentType: string;
  additionalRequirement: string;
}
interface Centring {
  id?: number;
  centringMaterial: string;
  totalArea: number | null;
  steelBrand: string;
  additionalRequirement: string;
  isScaffoldingRequired: boolean;
  cementBrand: string;
}
interface Flooring {
  id?: number;
  flooringMaterial: string;
  totalArea: number | null;
  finishType: string;
  materialThickness: number | null;
  installationType: string;
  isSkirtingRequired: boolean;
  additionalRequirement: string;
}

interface Plumbing {
  id?: number;
  typeOfWork: string;
  pipeMaterial: string;
  pipeBrand: string;
  fixtureBrand: string;
  totalBathrooms: number;
  totalKitchens: number;
  waterSource: string;
  indianBathrooms: number | null;
  westernBathrooms: number | null;
  pipeThickness: number | null;
  additionalRequirement: string;
  isDrainageRequired: boolean;
}
interface Painting {
  id?: number;
  typeOfWork: string;
  paintType: string;
  paintBrand: string;
  totalArea: number | null;
  numberOfCoats: number | null;
  surfacePreparation: string[];
  roomCount: number | null;
  surfaceType: string;
  finishType: string;
  additionalRequirement: string;
}

interface Electricity {
  id?: number;
  typeOfWork: string;
  wiringType: string;
  wireBrand: string;
  switchBrand: string;
  totalPowerPoints: number | null;
  totalLights: number | null;
  totalFans: number | null;
  safetyEquipment: string[];
  additionalRequirement: string;
}

interface FallCeiling {
  id?: number;
  numberOfRooms: number;
  ceilingMaterial: string;
  ceilingDesign: string;
  lightingOptions: [];
  ceilingFinish: string;
  roomType: string;
  totalArea: number;
  additionalRequirement: string;
}

interface BrickMasonry {
  id?: number;
  typeOfWork: string;
  brickType: string;
  brickQuality: string;
  cementBrand: string;
  cementType: string;
  plasteringRequired: boolean;
  plasteringType: string[];
  basementRequired: boolean;
  basementArea: number | null;
  basementHeight: number | null;
  railingMaterial: string;
  railingType: string;
  totalArea: number | null;
  structureType: string;
  elevationDetails: string;
  additionalRequirement: string;
}
export interface RoomFeature {
  roomType: string; // e.g., "Living Room"
  featureType: string; // e.g., "TV Unit"
  area?: number; // in sqft or relevant unit
  materialDetails?: string; // e.g., 18mm BWP + Laminate
}

interface InteriorService {
  id?: number;
  modularKitchen: boolean;
  wardrobes: boolean;
  cabinetry: string | null;
  furnitureDesign: string | null;
  wallPaneling: boolean;
  decorStyle: string | null;
  soundProofing: boolean;
  smartHomeFeatures: boolean;
  storageSolutions: string | null;
  additionalRequirements: string | null;
  furnitureLayout: boolean;
  ecoFriendlyMaterials: boolean;
  childPetFriendly: boolean;
  materialPreferences: string[] | null;
  bhkType?: string;
  plywood?: string;
  rooms: {
    livingRoom: number;
    kitchen: number;
    dining: number;
    bedroom: number;
    bathroom: number;
  };
  featureBreakDown?: RoomFeature[];
}

interface CommercialServiceDetail {
  id?: number;
  scope: string;
  specifications: string;
  brand: string;
  capacity: string;
  additionalRequirement: string;
  [key: string]: any;
}

interface ServiceDetails {
  borewells: Borewells | null;
  document_drafting: DocumentDrafting | null;
  centring: Centring | null;
  flooring: Flooring | null;
  plumbing: Plumbing | null;
  painting: Painting | null;
  electricity: Electricity | null;
  fallCeiling: FallCeiling | null;
  brickMasonry: BrickMasonry | null;
  interiorService: InteriorService | null;
  hvac: CommercialServiceDetail | null;
  fire_safety: CommercialServiceDetail | null;
  elevator: CommercialServiceDetail | null;
  glazing_facade: CommercialServiceDetail | null;
  parking_infra: CommercialServiceDetail | null;
  signage: CommercialServiceDetail | null;
}

interface PackageDetails {
  city?: string;
  state?: string;
  packageSelected?: PackageType;
  branchId?:number;
}
interface servicesRequired {
  id?: number;
  serviceType: "Packages" | "Customized";
  selectedServices: string[];
  package: PackageDetails | null;
  serviceDetails: ServiceDetails;
}

interface DayProgressLog {
  id?: number;
  day: number;
  date: string;
  workType: string;
  placeType: string[];
  description: string;
  imageOrVideo: string[];
  laborCount: number | null;
  customerNotes?: string;
  issues?: string;
  status: string;
  floor: number | null;
  materials: Array<{ material: string; quantity: number; desc }>;
  expensesIncurred?: number | null;
  createdAt?: string;
  roomType?: string;
  featureType?: string;
  updatedAt?: string;
  phaseId?: number | null;
  uploadedById?: number;
  uploadedByName?: string;
  uploadedByProfile?: string;
  uploadLocation?: any;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
}

interface CustomBuilderState {
  currentStep: "customer-onboarding" | "document-upload" | "day-progress";
  onboardingSteps: number;
  custom_builder_id: string| null;

  customerOnboarding: {
    contactDetails: ContactDetails;
    addressDetails: AddressDetails;
    propertyInformation: PropertyInformation;
    servicesRequired: servicesRequired;
    summary: string | null;
  };
  customerId: number | null;

  documentUpload: {
    costEstimation: string[] | null;
    agreement: string[] | null;
    paymentReports: string[] | null;
    weeklyReports: string[];
    monthlyReports: string[] | null;
    warranty: string[] | null;
    bills: string[] | null;
    floorPlan: string[] | null;
  };
  dayProgress: {
    logs: DayProgressLog[];
  };
  contactErrors: { [key: string]: string };
  propertyInformationErrors: { [key: string]: string };
  interiorInformationErrors: { [key: string]: string };
  houseConstructionInfoErrors: { [key: string]: string };
  serviceErrors: { [serviceKey: string]: { [key: string]: string } };
  daysEstimated: number | null;

  currentDay: number;
  setCurrentDay: (day: number) => void;

  setDaysEstimated: (days: number) => void;

  setCustomBuilderID: (id: string) => void;
  setCustomerId: (id: number) => void;
  setCurrentStep: (step: CustomBuilderState["currentStep"]) => void;
  setOnboardingSteps: (steps: number) => void;
  updateContactDetails: (details: Partial<ContactDetails>) => void;
  updateFloorDetails: (
    floorIndex: number,
    updates: {
      floor?: string;
      portions?: number;
      type_of_portions?: string[];
      ground_floor_details?: string[];
      portionDetails?: Array<{
        portionType: string;
        bedrooms: number;
        bathrooms: number;
        balconies: number;
        indian_bathroom_required: boolean;
        additional_rooms: string[];
      }>;
    }
  ) => void;

  updatePropertyInformation: (info: Partial<PropertyInformation>) => void;
  updateInteriorInformation: (info: Partial<InteriorInformation>) => void;
  updateHouseConstructionInfo: (info: Partial<HouseConstructionInfo>) => void;
  updateCommercialConstructionInfo: (info: Partial<CommercialConstructionInfo>) => void;
  updateaddressDetails: (details: Partial<AddressDetails>) => void;
  updateServicesRequired: (info: Partial<servicesRequired>) => void;
  updateServiceDetails: <K extends keyof ServiceDetails>(
    serviceKey: K,
    data: Partial<NonNullable<ServiceDetails[K]>>
  ) => void;
  updateDocumentUpload: (
    key: keyof CustomBuilderState["documentUpload"],
    file: string[] | null,
    replace: boolean
  ) => void;

  //Error service calls

  updateServiceErrors: (
    serviceKey: string,
    errors: { [key: string]: string }
  ) => void;
  clearServiceErrors: (serviceKey: string) => void;

  //Contact error calls

  updateContactErrors: (errors: { [key: string]: string }) => void;
  clearContactErrors: () => void;

  //Property info error calls
  updatePropertyInfoErrors: (errors: { [key: string]: string }) => void;
  clearPropertyInfoErrors: () => void;

  // interior info error calls
  updateInteriorInfoErrors: (errors: Record<string, string>) => void;
  clearInteriorInfoErrors: () => void;

  // House construction error calls
  updateHouseConstructionErrors: (errors: Record<string, string>) => void;
  clearHouseConstructionErrors: () => void;

  //dayprogress log calls
  addDayProgressLog: (log: DayProgressLog) => void;
  updateDayProgressLog: (
    day: number | Date,
    updates: Partial<DayProgressLog>
  ) => void;

  //service clear details
  clearServiceDetails: (serviceKey: string) => void;
}

const useCustomBuilderStore = create<CustomBuilderState>((set) => ({
  daysEstimated: 100,
  currentStep: "customer-onboarding",
  custom_builder_id: null,
  onboardingSteps: 1,
  customerId: null,
  currentDay: 1,

  customerOnboarding: {
    contactDetails: {
      id: undefined,
      first_name: "",
      last_name: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      assignCustomerBranchRole: true, 
  createCustomBuilder: false, 
    },
    addressDetails: {
      id: undefined,
      city: "",
      state: "",
      zipCode: "",
      locality: "",
      address_line_1: "",
      address_line_2: "",
    },
    propertyInformation: {
      id: undefined,
      construction_type: "",
      propertyName: "",
      property_type: "",
      commercial_property_type: "",
      construction_scope: "House",
      house_construction_info: {
        total_area: null,
        width: null,
        length: null,
        adjacent_roads: null,
        land_facing: "",
        total_floors: null,
        gate_side: "",
        additional_details: "",
        staircase_gate: "",
        propertyImages: [],
        additionOptions: [],
        floors: [],
      },
      interior_info: {
        project_scope: "",
        style_preference: "",
        color_scheme: [],
        budget: null,
        total_area: null,
        totalFloors: null,
        total_floors: null,
        special_requirements: "",
        reference_images: [],
        additional_details: "",
        additionOptions: [],
        floors: [],
      },
      commercial_construction_info: {
        commercial_type: "",
        total_area: null,
        total_floors: null,
        basement_floors: null,
        parking_floors: null,
        land_facing: "",
        gate_side: "",
        length: null,
        width: null,
        height: null,
        adjacent_roads: null,
        elevator_required: false,
        number_of_elevators: null,
        central_ac_required: false,
        fire_safety_required: false,
        parking_required: false,
        parking_capacity: null,
        generator_backup_required: false,
        generator_capacity_kva: null,
        water_treatment_required: false,
        sewage_treatment_required: false,
        propertyImages: [],
        additionOptions: [],
        additional_details: "",
        zoning_info: null,
      },
    },

    servicesRequired: {
      id: undefined,
      serviceType: "Packages",
      selectedServices: [],
      package: {
        city: null,
        state: null,
        packageSelected: null,
        branchId:null,

      },
      serviceDetails: {
        borewells: null,
        document_drafting: null,
        centring: null,
        flooring: null,
        plumbing: null,
        painting: null,
        electricity: null,
        fallCeiling: null,
        brickMasonry: null,
        interiorService: null,
        hvac: null,
        fire_safety: null,
        elevator: null,
        glazing_facade: null,
        parking_infra: null,
        signage: null,
      },
    },
    summary: null,
  },

  documentUpload: {
    costEstimation: [],
    agreement: [],
    weeklyReports: [],
    paymentReports: [],
    monthlyReports: [],
    warranty: [],
    bills: [],
    floorPlan: [],
  },

  dayProgress: {
    logs: [],
  },
  propertyInformationErrors: {},
  serviceErrors: {},
  contactErrors: {},
  interiorInformationErrors: {},
  houseConstructionInfoErrors: {},

  setCustomerId(id) {
    set(() => ({
      customerId: id,
    }));
  },
  setCustomBuilderID(id:string) {
    set(() => ({
      custom_builder_id: String(id),
    }));
  },
  setCurrentDay(day) {
    set(() => ({
      currentDay: day,
    }));
  },

  setDaysEstimated: (days) => set({ daysEstimated: days }),

  setCurrentStep: (step) => set({ currentStep: step }),
  setOnboardingSteps: (steps) => set({ onboardingSteps: steps }),

  updateContactDetails: (details) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        contactDetails: {
          ...state.customerOnboarding.contactDetails,
          ...details,
        },
      },
    })),

  updateFloorDetails: (floorIndex, updates) =>
    set((state) => {
      const { propertyInformation } = state.customerOnboarding;
      const isHouse = propertyInformation.construction_scope === "House";

      const currentFloors = isHouse
        ? [...propertyInformation.house_construction_info.floors]
        : [...propertyInformation.interior_info.floors];

      if (!currentFloors[floorIndex]) {
        currentFloors[floorIndex] = makeEmptyFloor(floorIndex);
      }

      currentFloors[floorIndex] = {
        ...currentFloors[floorIndex],
        ...updates,
      };

      return {
        customerOnboarding: {
          ...state.customerOnboarding,
          propertyInformation: {
            ...propertyInformation,
            ...(isHouse
              ? {
                  house_construction_info: {
                    ...propertyInformation.house_construction_info,
                    floors: currentFloors,
                  },
                }
              : {
                  interior_info: {
                    ...propertyInformation.interior_info,
                    floors: currentFloors,
                  },
                }),
          },
        },
      };
    }),

  updateaddressDetails: (details) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        addressDetails: {
          ...state.customerOnboarding.addressDetails,
          ...details,
        },
      },
    })),
  updatePropertyInformation: (info) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        propertyInformation: {
          ...state.customerOnboarding.propertyInformation,
          ...info,
        },
      },
    })),
  updateInteriorInformation: (interiorInfo) =>
    set((state) => {
      const prior = state.customerOnboarding.propertyInformation.interior_info;
      const merged = { ...prior, ...interiorInfo };

      if (typeof interiorInfo.totalFloors === "number") {
        const desiredLen = interiorInfo.totalFloors + 1;
        let floors = Array.isArray(merged.floors) ? [...merged.floors] : [];

        if (floors.length > desiredLen) {
          floors = floors.slice(0, desiredLen);
        } else if (floors.length < desiredLen) {
          for (let i = floors.length; i < desiredLen; i++) {
            floors.push(makeEmptyFloor(i));
          }
        }

        merged.floors = floors;
      }

      return {
        customerOnboarding: {
          ...state.customerOnboarding,
          propertyInformation: {
            ...state.customerOnboarding.propertyInformation,
            interior_info: merged,
          },
        },
      };
    }),

  // updateInteriorInformation: (interiorInfo) =>
  //   set((state) => ({
  //     customerOnboarding: {
  //       ...state.customerOnboarding,
  //       propertyInformation: {
  //         ...state.customerOnboarding.propertyInformation,
  //         interior_info: {
  //           ...state.customerOnboarding.propertyInformation.interior_info,

  //           ...interiorInfo,
  //         },
  //       },
  //     },
  //   })),

  updateHouseConstructionInfo: (houseInfo) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        propertyInformation: {
          ...state.customerOnboarding.propertyInformation,
          house_construction_info: {
            ...state.customerOnboarding.propertyInformation
              .house_construction_info,
            ...houseInfo,
          },
        },
      },
    })),

  updateCommercialConstructionInfo: (commercialInfo) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        propertyInformation: {
          ...state.customerOnboarding.propertyInformation,
          commercial_construction_info: {
            ...state.customerOnboarding.propertyInformation
              .commercial_construction_info,
            ...commercialInfo,
          },
        },
      },
    })),

  updateServicesRequired: (updates: Partial<servicesRequired>) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        servicesRequired: {
          ...state.customerOnboarding.servicesRequired,
          ...updates,
        },
      },
    })),
  updateServiceDetails: (serviceKey, data) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        servicesRequired: {
          ...state.customerOnboarding.servicesRequired,
          serviceDetails: {
            ...state.customerOnboarding.servicesRequired.serviceDetails,
            [serviceKey]: {
              ...state.customerOnboarding.servicesRequired.serviceDetails[
                serviceKey
              ],
              ...data,
            },
          },
        },
      },
    })),

  updateSummary: (info) => {
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        summary: info,
      },
    }));
  },

  updateDocumentUpload: (key: string, files: string[], replace = false) =>
    set((state) => {
      const existingFiles = state.documentUpload[key] || [];
      const newFiles = replace ? files : [...existingFiles, ...files];
      return {
        documentUpload: {
          ...state.documentUpload,
          [key]: newFiles,
        },
      };
    }),

  addDayProgressLog: (log) =>
    set((state) => ({
      dayProgress: { logs: [...state.dayProgress.logs, log] },
    })),

  updateDayProgressLog: (day, updates) =>
    set((state) => ({
      dayProgress: {
        logs: state.dayProgress.logs.map((log) =>
          log.day === day ? { ...log, ...updates } : log
        ),
      },
    })),

  updateServiceErrors: (serviceKey, errors) =>
    set((state) => ({
      serviceErrors: { ...state.serviceErrors, [serviceKey]: errors },
    })),
  clearServiceErrors: (serviceKey) =>
    set((state) => {
      const updatedErrors = { ...state.serviceErrors };
      delete updatedErrors[serviceKey];
      return { serviceErrors: updatedErrors };
    }),

  updateContactErrors: (errors) =>
    set((state) => ({
      contactErrors: { ...state.contactErrors, ...errors },
    })),

  clearContactErrors: () =>
    set(() => ({
      contactErrors: {},
    })),
  updatePropertyInfoErrors: (errors) =>
    set((state) => ({
      propertyInformationErrors: {
        ...state.propertyInformationErrors,
        ...errors,
      },
    })),
  clearPropertyInfoErrors: () =>
    set(() => ({
      propertyInformationErrors: {},
    })),
  updateInteriorInfoErrors: (errors: { [key: string]: string }) =>
    set((state) => ({
      interiorInformationErrors: {
        ...state.interiorInformationErrors,
        ...errors,
      },
    })),

  clearInteriorInfoErrors: () =>
    set(() => ({
      interiorInformationErrors: {},
    })),

  updateHouseConstructionErrors: (errors: { [key: string]: string }) =>
    set((state) => ({
      houseConstructionInfoErrors: {
        ...state.houseConstructionInfoErrors,
        ...errors,
      },
    })),
  clearHouseConstructionErrors: () =>
    set(() => ({
      houseConstructionInfoErrors: {},
    })),
  clearServiceDetails: (serviceKey) =>
    set((state) => ({
      customerOnboarding: {
        ...state.customerOnboarding,
        servicesRequired: {
          ...state.customerOnboarding.servicesRequired,
          serviceDetails: {
            ...state.customerOnboarding.servicesRequired.serviceDetails,
            [serviceKey]: null,
          },
        },
      },
    })),
}));

export default useCustomBuilderStore;
