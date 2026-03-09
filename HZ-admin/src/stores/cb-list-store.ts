import { create } from "zustand";
import toast from "react-hot-toast";
import apiClient from "../utils/apiClient";

export type CurrentStep = "customerOnboarding" | "document-upload" | 'materials' | '';
export interface CustomBuilderData {
  id: number;
  currentDay: number;
  currentStep: CurrentStep;
  onboardingSteps: number;
  costEstimation: string[];
  agreement: string[];
  paymentReports: string[];
  weeklyReports: string[];
  monthlyReports: string[];
  floorPlan: string[];
  bills: string[];
  warranty: string[];
  estimatedCost: number | null;
  estimatedDays: number | null;
  propertyInformation: any;
  servicesRequired: any;
  logs: any[];
  phases: any[];
  user: any;
  queries: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface CustomBuilderState {
  cache: Record<string, CustomBuilderData>;
  isLoading: boolean;
  error: string | null;

  fetchData: (id: string, force?: boolean) => Promise<void>;
  setData: (id: string, data: CustomBuilderData) => void;
  clearData: (id?: string) => void;
}

export const useFetchCustomBuilderStore = create<CustomBuilderState>((set, get) => ({
  cache: {},
  isLoading: false,
  error: null,

  fetchData: async (id, force = false) => {
    if (!id) return;

    const { cache } = get();

    if (!force && cache[id]) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.customBuilder}/${id}`
      );

      if (response.status === 200) {
        set((state) => ({
          cache: { ...state.cache, [id]: response.body },
          isLoading: false,
        }));
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      console.error("Error fetching custom builder data:", error);
      set({ error: "Error occurred while fetching details", isLoading: false });
      toast.error("Error occurred while fetching details");
    }
  },

  setData: (id, data) =>
    set((state) => ({
      cache: { ...state.cache, [id]: data },
    })),

  clearData: (id) =>
    set((state) =>
      id
        ? {
            cache: Object.fromEntries(
              Object.entries(state.cache).filter(([k]) => k !== id)
            ),
          }
        : { cache: {} }
    ),
}));
