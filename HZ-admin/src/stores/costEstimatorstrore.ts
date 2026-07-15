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

export type QuotationStatusFilter = "all" | "draft" | "revised";
export type QuotationSortBy = "recent" | "name" | "date" | "value";
export type QuotationSortDir = "asc" | "desc";

interface CostEstimatorStore {
  costEstimators: CostEstimator[];
  setCostEstimators: (estimators: CostEstimator[]) => void;
  total: number;
  statusCounts: { all: number; draft: number; revised: number };
  isLoading: boolean;
  statusFilter: QuotationStatusFilter;
  setStatusFilter: (status: QuotationStatusFilter) => void;
  fetchCostEstimators: (
    userId: string,
    category: string,
    page?: number,
    limit?: number,
    status?: QuotationStatusFilter,
    sortBy?: QuotationSortBy,
    sortDir?: QuotationSortDir,
  ) => Promise<void>;
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useCostEstimatorStore = create<CostEstimatorStore>((set, get) => ({
  costEstimators: [],
  total: 0,
  statusCounts: { all: 0, draft: 0, revised: 0 },
  isLoading: false,
  statusFilter: "all",
  filters: { bhkTypeData: {}, DateData: {}, DesignedData: {}, stateData: {} },
  setCostEstimators: (estimators: CostEstimator[]) =>
    set({ costEstimators: estimators }),
  activeTab: "Interior",

  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setStatusFilter: (statusFilter: QuotationStatusFilter) => set({ statusFilter }),

  setFilters: (filters: FiltersState) => set({ filters }),

  fetchCostEstimators: async (
    userId,
    category,
    page = 1,
    limit = 10,
    status,
    sortBy = "recent",
    sortDir = "desc",
  ) => {
    set({ isLoading: true });
    try {
      const cleaned = category?.trim().replace(/\?+$/, "");
      const statusFilter = status ?? get().statusFilter;
      const statusQuery =
        statusFilter && statusFilter !== "all"
          ? `&status=${encodeURIComponent(statusFilter)}`
          : "";
      const sortQuery = `&sortBy=${encodeURIComponent(sortBy)}&sortDir=${encodeURIComponent(
        sortBy === "date" ? sortDir : sortBy === "value" ? sortDir : "desc",
      )}`;
      const url = `${apiClient.URLS.cost_estimator}/by-user/${userId}?category=${encodeURIComponent(
        cleaned,
      )}&page=${page}&limit=${limit}${statusQuery}${sortQuery}`;
      const res = await apiClient.get(url, {}, true);
      const data = Array.isArray(res.body?.data)
        ? res.body.data
        : Array.isArray(res.body)
          ? res.body
          : [];
      const total = Number(res.body?.total ?? data.length);
      const counts = res.body?.statusCounts;
      set({
        costEstimators: data,
        total,
        statusCounts: {
          all: Number(counts?.all ?? total),
          draft: Number(counts?.draft ?? 0),
          revised: Number(counts?.revised ?? 0),
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Error fetching cost estimations");
    } finally {
      set({ isLoading: false });
    }
  },
}));
