import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";

interface CustomBuilderItem {
  id: number;
  user: any;
  location: any;
  propertyInformation: any;
  currentDay?: number;
  estimatedDays?: number;
  branchId: any;
}

interface CustomBuildersListState {
  rows: CustomBuilderItem[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchAll: (userId: string, userRole: string, branchId?: string | null) => Promise<void>;
  clear: () => void;
}

export const useCustomBuildersListStore = create<CustomBuildersListState>(
  (set, get) => ({
    rows: [],
    isLoading: false,
    error: null,
    hasFetched: false,

    fetchAll: async (userId, userRole, branchId) => {
      if (get().hasFetched) return;

      set({ isLoading: true, error: null });

      try {
        let res;
        const isAdmin = userRole === "ADMIN";

        if (isAdmin) {
          const params: any = { userId };
          if (branchId) params.branchId = branchId;
          res = await apiClient.get(`${apiClient.URLS.custom_builder}/all`, params, true);
        } else {
          const params: any = {};
          if (branchId) params.branchId = branchId;
          res = await apiClient.get(
            `${apiClient.URLS.custom_builder}/user/${userId}`,
            params,
            true
          );
        }

        if (res.status === 200) {
          set({
            rows: res.body || [],
            isLoading: false,
            hasFetched: true,
          });
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Failed to load data");
        set({ error: "Failed to load data", isLoading: false });
      }
    },

    clear: () =>
      set({
        rows: [],
        isLoading: false,
        error: null,
        hasFetched: false,
      }),
  })
);
