import { create } from "zustand";

interface DeveloperInformation {
  Name: string;
  PhoneNumber: string;
  whatsappNumber: string;
  officialEmail: string;
}
export type AllowedUnits =
  | "sq.ft"
  | "sq.yard"
  | "sq.meter"
  | "acre"
  | "cent"
  | "marla"
  | "";

export interface SizeWithUnit {
  size: number | null;

  unit: AllowedUnits;
}
export interface Located {
  id: number | null ;
  city: string;
  state: string;
  street: string;
  locality: string;
  subLocality: string;
  landmark: string;
  latitude: string;
  longitude: string;
  place_id: string;
  zipCode: string | null | undefined;
  country: string | null;
}
export interface CompanyDetails {
  companyName: string;
  RERAId: string;
  estdYear: string;
  about: string;
  Logo: string[];
  locatedIn: Located[];
  awards: any[];
  reviewRating: string;
  developerInformation: DeveloperInformation;
}

export interface FlooringPlans {
  floorplan: string;
  BuiltupArea: SizeWithUnit | null;
  TotalPrice: number | null;
  pricePerSft: number | null;
  emiStartsAt: number | null;
}

export interface Units {
  BHK?: string; 
  unitName?: string; 
  flatSize?: SizeWithUnit | null;
  plotSize: SizeWithUnit | null;
  flooringPlans: FlooringPlans[];
}

export interface PropertyType {
  typeName?: string;
  description: string;
  additionalAttributes: any | null;
  units: Units[];
}

export interface SellerDetails {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: any;
  profile: any;
  priceRange: string;
}

export interface ProjectDetails {
  id: number | undefined;
  Name: string;
  Description: string;
  Highlights?: string | null;
  ProjectArea?: SizeWithUnit | null;
  ProjectSize?: SizeWithUnit | null;
  MinSize?: SizeWithUnit | null;
  MaxSize?: SizeWithUnit | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  Specifications?: string | null;
  Brochure?: string[] | null;
  propertyType?: PropertyType;
  AboutProject?: string;
  ProjectAmenities?: string[];
  location: Located;
  mediaDetails: {
    propertyImages: string[];
    propertyVideo: string[];
  };
  constructionStatus?: {
    status: string;
    ageOfProperty?: number;
    possessionYears?: number;
    possessionBy?: Date | null;
  };
  sellers: SellerDetails[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface ModalState {
  awards: boolean;
  address: boolean;
  property: boolean;
}

export interface CompanyStore {
  companyId: number | null;
  companyDetails: CompanyDetails;
  projects: ProjectDetails[];
  projectDetails: ProjectDetails | null;
  originalProjectDetails: ProjectDetails | null;
  selectedProjectIndex: number | null;
  modalState: ModalState;
  errors: any;

  // Project management
  setCompanyId: (id: number) => void;
  setCompanyDetails: (companyDetails: Partial<CompanyDetails>) => void;
  setDeveloperInformation: (
    developerInfo: Partial<DeveloperInformation>
  ) => void;
  setErrors: (errors: any) => void;

  setProjects: (projects: ProjectDetails[]) => void;
  setProjectDetails: (projectDetails: Partial<ProjectDetails>) => void;

  //selected Project
  selectProjectForEditing: (index: number) => void;
  resetSelectedProject: () => void;
  resetCompanyDetails: () => void;

  // CRUD Operations for Projects
  addProject: (project: Omit<ProjectDetails, "id">) => void;
  updateProject: (index: number, updatedProject: ProjectDetails) => void;
  deleteProject: (index: number) => void;

  // Modal management
  setModalState: (modalState: Partial<ModalState>) => void;

  // Unit management
  addUnit: (projectIndex: number, newUnit: Units) => void;
  updateUnit: (
    projectIndex: number,
    unitIndex: number,
    updatedUnit: Units
  ) => void;
  removeUnit: (projectIndex: number, unitIndex: number) => void;

  // Seller management
  addSeller: (projectIndex: number, newSeller: SellerDetails) => void;
  updateSeller: (
    projectIndex: number,
    sellerIndex: number,
    updatedSeller: SellerDetails
  ) => void;
  removeSeller: (projectIndex: number, sellerIndex: number) => void;

  //add faqs
  addFaq: (
    projectIndex: number,
    newFaq: { question: string; answer: string }
  ) => void;
  updateFaq: (
    projectIndex: number,
    faqIndex: number,
    updatedFaq: { question: string; answer: string }
  ) => void;
  removeFaq: (projectIndex: number, faqIndex: number) => void;

  //setOriginalProjectDetails
  setOriginalProjectDetails: (projectDetails: ProjectDetails) => void;
}

export const useCompanyPropertyStore = create<CompanyStore>((set) => ({
  projects: [],
  selectedProjectIndex: null,
  projectDetails: null,
  originalProjectDetails: {
    id: undefined,
    Name: "",
    Description: "",
    Highlights: null,
    ProjectArea: null,
    ProjectSize: null,
    MinSize: null,
    MaxSize: null,
    minPrice: null,
    maxPrice: null,
    Specifications: null,
    Brochure: null,
    propertyType: undefined,
    AboutProject: undefined,
    ProjectAmenities: undefined,
    location: {
      id: null,
      city: "",
      state: "",
      street: "",
      locality: "",
      subLocality: "",
      landmark: "",
      latitude: "",
      longitude: "",
      place_id: "",
      zipCode: null,
      country: "India",
    },
    mediaDetails: {
      propertyImages: [],
      propertyVideo: [],
    },
    constructionStatus: {
      status: "",
      ageOfProperty: undefined,
      possessionYears: undefined,
      possessionBy: null,
    },
    faqs: [],
    sellers: [],
  },
  errors: {},
  companyDetails: {
    companyName: "",
    RERAId: "",
    estdYear: "",
    about: "",
    Logo: [],
    locatedIn: [],
    awards: [],
    reviewRating: "",
    developerInformation: {
      Name: "",
      PhoneNumber: "",
      whatsappNumber: "",
      officialEmail: "",
    },
  },
  modalState: {
    awards: false,
    address: false,
    property: false,
  },
  companyId: null,

  setOriginalProjectDetails: (details: ProjectDetails | null) =>
    set(() => ({ originalProjectDetails: details })),

  setErrors: (errors: any) => set({ errors }),

  setCompanyId: (id: number) => set({ companyId: id }),

  setProjects: (projects) => set({ projects }),

  selectProjectForEditing: (index) =>
    set(() => ({ selectedProjectIndex: index })),

  resetSelectedProject: () => set(() => ({ selectedProjectIndex: null })),

  setCompanyDetails: (details: Partial<CompanyDetails>) =>
    set((state) => ({
      companyDetails: { ...state.companyDetails, ...details },
    })),

  setDeveloperInformation: (developerInfo: Partial<DeveloperInformation>) =>
    set((state) => ({
      companyDetails: {
        ...state.companyDetails,
        developerInformation: {
          ...state.companyDetails.developerInformation,
          ...developerInfo,
        },
      },
    })),

  setProjectDetails: (details: Partial<ProjectDetails>) =>
    set((state) => ({
      projectDetails: {
        ...state.projectDetails,
        ...details,
        id: details.id ?? state.projectDetails?.id ?? Date.now(),
      } as ProjectDetails,
    })),

  addProject: (project: Omit<ProjectDetails, "id">) =>
    set((state) => {
      const newProject: ProjectDetails = {
        ...project,
        id: Date.now(),
      };
      return {
        projects: [...state.projects, newProject],
        projectDetails: null,
      };
    }),

  // Updating an existing project
  updateProject: (index, updatedProject) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      projects[index] = updatedProject;
      return { projects };
    }),

  // Deleting a project
  deleteProject: (index) =>
    set((state) => ({
      projects: state.projects.filter((_, i) => i !== index),
    })),

  // Unit management
  addUnit: (projectIndex, newUnit) =>
    set((state) => {
      const projects = [...state.projects];

      if (!projects[projectIndex]?.propertyType?.units) {
        return state;
      }

      projects[projectIndex].propertyType.units = [
        ...projects[projectIndex].propertyType.units,
        newUnit,
      ];

      return { projects };
    }),

  updateUnit: (projectIndex: number, unitIndex: number, updatedUnit: any) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];

      if (!projects[projectIndex]?.propertyType?.units) return state;

      projects[projectIndex].propertyType.units[unitIndex] = updatedUnit;
      return { projects };
    }),

  removeUnit: (projectIndex: number, unitIndex: number) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];

      if (!projects[projectIndex]?.propertyType?.units) return state;

      projects[projectIndex].propertyType.units.splice(unitIndex, 1);
      return { projects };
    }),

  // Seller management
  addSeller: (projectIndex, newSeller) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      projects[projectIndex].sellers = [
        ...projects[projectIndex].sellers,
        newSeller,
      ];
      return { projects };
    }),

  updateSeller: (projectIndex, sellerIndex, updatedSeller) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      projects[projectIndex].sellers[sellerIndex] = updatedSeller;
      return { projects };
    }),

  removeSeller: (projectIndex, sellerIndex) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      projects[projectIndex].sellers.splice(sellerIndex, 1);
      return { projects };
    }),

  // FAQ management
  addFaq: (projectIndex, newFaq) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      const project = projects[projectIndex];
      if (project) {
        project.faqs = [...(project.faqs || []), newFaq];
      }
      return { projects };
    }),

  updateFaq: (projectIndex, faqIndex, updatedFaq) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      projects[projectIndex].faqs[faqIndex] = updatedFaq;
      return { projects };
    }),

  removeFaq: (projectIndex, faqIndex) =>
    set((state) => {
      const projects: ProjectDetails[] = [...state.projects];
      projects[projectIndex].faqs.splice(faqIndex, 1);
      return { projects };
    }),

  // Inside companyproperty.ts store
  resetCompanyDetails: () =>
    set({
      companyId: null,
      companyDetails: {
        companyName: "",
        RERAId: "",
        estdYear: "",
        about: "",
        Logo: [],
        locatedIn: [],
        awards: [],
        reviewRating: "",
        developerInformation: {
          Name: "",
          PhoneNumber: "",
          whatsappNumber: "",
          officialEmail: "",
        },
      },
      projects: [],
    }),

  setModalState: (state: Partial<ModalState>) =>
    set((prev) => ({
      modalState: { ...prev.modalState, ...state },
    })),
}));
