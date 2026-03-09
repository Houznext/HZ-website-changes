import { create } from "zustand";
export type PropertyTab = "buy" | "rent" | "plot" | "flatshare";

interface FilterOptions {
  propertyType: string[];
  bhkType: string[];
  priceRange: string[];
  /** Refer & Earn price filter (only when referAndEarn mode is on); sent as priceRange to API when active. */
  referAndEarnPriceRange?: string[];
  saleType: string[];
  furnishingType:string[];
  constructionStatus: string[];
  amenities: string[];
  propertyAge: string[];
  facing: string[];
  builtUpArea?: [number, number];
  genderPreference?: string[];
  sharingType?: string[];
  purpose?: string[];
}

interface PropertyFilterState {
  filters: FilterOptions;
  activeTab: PropertyTab;
  selectedCities: string[];

  /** When Refer & Earn only is on; display "Earn up to ₹X", value = price range for API */
  referAndEarnPriceOptions: (string | { label: string; value: string })[];

  setFilters: (filters: Partial<FilterOptions>) => void;
  setActiveTab: (tab: PropertyTab) => void;
  setSelectedCities: (cities: string[]) => void;
  setReferAndEarnPriceOptions: (options: (string | { label: string; value: string })[]) => void;

  resetFilters: () => void;
}
const defaultFilters: FilterOptions = {
  propertyType: [],
  bhkType: [],
  priceRange: [],
  referAndEarnPriceRange: [],
  saleType: [],
  furnishingType:[],
  constructionStatus: [],
  amenities: [],
  propertyAge: [],
  facing: [],
  builtUpArea: [0, 5000],
  genderPreference: [],
  sharingType: [],
};
export const usePropertyFilterStore = create<PropertyFilterState>((set) => ({
  filters: defaultFilters,
  activeTab: "buy",
  selectedCities: [],
  referAndEarnPriceOptions: [],
  setFilters: (newFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCities: (cities) => set({ selectedCities: cities }),
  setReferAndEarnPriceOptions: (options) =>
    set({ referAndEarnPriceOptions: options }),

  resetFilters: () => set({ filters: defaultFilters }),
}));
