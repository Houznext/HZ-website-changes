import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { CostEstimator } from "@/src/components/CostEstimatorView/helper";


interface FiltersState {
  bhkTypeData: Record<string, boolean>;
  DateData: Record<string, boolean>;
  DesignedData: Record<string, boolean>;
  stateData: Record<string, boolean>;
}

interface CostEstimatorStore {
  costEstimators: CostEstimator[];
  setCostEstimators: (estimators: CostEstimator[]) => void;
  isLoading: boolean;
  fetchCostEstimators: (userId: string, category: string) => Promise<void>;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useCostEstimatorStore = create<CostEstimatorStore>((set, get) => ({
  costEstimators: [],
  isLoading: false,
  filters: { bhkTypeData: {}, DateData: {}, DesignedData: {}, stateData: {} },
   setCostEstimators: (estimators: CostEstimator[]) => set({ costEstimators: estimators }),
  activeTab: "Interior",

  setActiveTab: (tab: string) => set({ activeTab: tab }),

  setFilters: (filters: FiltersState) => set({ filters }),

  fetchCostEstimators: async (userId, category) => {
    set({ isLoading: true });
    try {
      const cleaned = category?.trim().replace(/\?+$/, "");
      let url = `${apiClient.URLS.cost_estimator}/by-user/${userId}?category=${encodeURIComponent(
        cleaned
      )}`;
      const res = await apiClient.get(url,{},true);
     const data = Array.isArray(res.body?.data)
      ? res.body.data
      : Array.isArray(res.body)
      ? res.body
      : [];

    set({ costEstimators: data });
    } catch (err) {
      console.error(err);
      toast.error("Error fetching cost estimations");
    } finally {
      set({ isLoading: false });
    }
  },
}));
