import { create } from "zustand";
import apiClient from "@/utils/apiClient";

export interface InteriorStrapiData {
  heroCardPrices: any;
  packages: any;
  listItems: any;
  designIdeas: any;
  workFlowTestimonials: any;
  homePageBanner: any;
}

export interface InteriorStore {
  interiorsStrapiData: InteriorStrapiData;
  loading: boolean;
  error: string | null;
  fetchInteriorsData: (
    initialData?: Partial<InteriorStrapiData>
  ) => Promise<void>;
  setInteriorsData: (data: Partial<InteriorStrapiData>) => void;
}

export const useStrapiInteriorStore = create<InteriorStore>((set, get) => ({
  interiorsStrapiData: {
    heroCardPrices: null,
    packages: null,
    listItems: null,
    designIdeas: null,
    workFlowTestimonials: null,
    homePageBanner: null,
  },
  loading: false,
  error: null,

  fetchInteriorsData: async (initialData = {}) => {
    set({ loading: true, error: null });

    try {
      const [packagesRes, listItemsRes, testimonialsRes] = await Promise.all([
        apiClient.get(`${apiClient.URLS.strapiInteriors}packages?populate=*`),
        apiClient.get(`${apiClient.URLS.strapiInteriors}list-items?populate=*`),
        apiClient.get(
          `${apiClient.URLS.strapiInteriors}work-flow-testimonials?populate=*`
        ),
      ]);

      set({
        interiorsStrapiData: {
          ...get().interiorsStrapiData,
          ...initialData,
          packages: packagesRes?.body || null,
          listItems: listItemsRes?.body || null,
          workFlowTestimonials: testimonialsRes?.body || null,
        },
        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error?.message || "Failed to fetch interior data",
      });
    }
  },

  setInteriorsData: (data) =>
    set((state) => ({
      interiorsStrapiData: { ...state.interiorsStrapiData, ...data },
    })),
}));
