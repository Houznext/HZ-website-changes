import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { PropertyStore } from "./postproperty";

export type PropertyStatusFilter = 'all' | 'pending' | 'approved' | 'posted' | 'draft';

export interface StatusCounts {
  all: number;
  pending: number;
  approved: number;
  draft: number;
}

interface PropertyState {
  properties: PropertyStore[];
  totalPages: number;
  currentPage: number;
  total: number;
  isLoading: boolean;
  error: string | null;
  statusFilter: PropertyStatusFilter;
  searchTerm: string;
  statusCounts: StatusCounts;
  fetchProperties: (page?: number, limit?: number, status?: PropertyStatusFilter, search?: string, forceRefresh?: boolean) => Promise<void>;
  fetchStatusCounts: () => Promise<void>;
  setProperties: (
    properties: PropertyStore[] | ((prev: PropertyStore[]) => PropertyStore[])
  ) => void;
  setStatusFilter: (status: PropertyStatusFilter) => void;
  setSearchTerm: (search: string) => void;
  approveProperty: (propertyId: string, isApproved: boolean, approvedBy: string, isPosted?: boolean, rejectionReason?: string) => Promise<boolean>;
  clearProperties: () => void;
}

const limitDefault = 10;

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  totalPages: 1,
  currentPage: 1,
  total: 0,
  isLoading: false,
  error: null,
  statusFilter: 'all',
  searchTerm: '',
  statusCounts: { all: 0, pending: 0, approved: 0, draft: 0 },

  fetchStatusCounts: async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.property}/admin/counts`,
        "",
        true
      );
      
      if (res.body) {
        set({
          statusCounts: {
            all: res.body.all || 0,
            pending: res.body.pending || 0,
            approved: res.body.approved || 0,
            draft: res.body.draft || 0,
          }
        });
      }
    } catch (e) {
      console.error('Failed to fetch status counts:', e);
    }
  },

  fetchProperties: async (page = 1, limit = limitDefault, status?: PropertyStatusFilter, search?: string, forceRefresh = false) => {
    const state = get();
    const currentStatus = status ?? state.statusFilter;
    const currentSearch = search ?? state.searchTerm;

    // Don't skip if forceRefresh is true
    if (!forceRefresh && state.properties.length > 0 && state.statusFilter === currentStatus && state.searchTerm === currentSearch) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      // Use admin endpoint to fetch all properties with filters
      const res = await apiClient.get(
        `${apiClient.URLS.property}/admin/all?page=${page}&limit=${limit}&status=${currentStatus}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`,
        "",
        true
      );

      if (Array.isArray(res.body?.data)) {
        set({
          properties: res.body.data,
          totalPages: res.body.totalPages || 1,
          currentPage: res.body.currentPage || page,
          total: res.body.total || 0,
          isLoading: false,
          statusFilter: currentStatus,
          searchTerm: currentSearch,
        });
        // Also fetch status counts
        get().fetchStatusCounts();
      } else {
        set({ properties: [], isLoading: false });
      }
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch properties", isLoading: false });
      toast.error("Failed to fetch properties");
    }
  },

  setProperties: (properties) =>
    set((state) => ({
      properties:
        typeof properties === "function"
          ? properties(state.properties)
          : properties,
    })),

  setStatusFilter: (status: PropertyStatusFilter) => {
    set({ statusFilter: status });
    get().fetchProperties(1, limitDefault, status, get().searchTerm, true);
  },

  setSearchTerm: (search: string) => {
    set({ searchTerm: search });
  },

  approveProperty: async (propertyId: string, isApproved: boolean, approvedBy: string, isPosted?: boolean, rejectionReason?: string) => {
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.property}/admin/${propertyId}/approve`,
        {
          isApproved,
          isPosted: isPosted ?? isApproved, // If approved, also set as posted by default
          approvedBy,
          rejectionReason,
        },
        true
      );

      if (res.status === 200) {
        // Update the property in the local state
        set((state) => ({
          properties: state.properties.map((p) =>
            p.propertyId === parseInt(propertyId)
              ? { ...p, isApproved, isPosted: isPosted ?? isApproved, approvedBy, approvedDate: new Date() }
              : p
          ),
        }));
        toast.success(isApproved ? "Property approved successfully" : "Property rejected");
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      toast.error("Failed to update property status");
      return false;
    }
  },

  clearProperties: () => set({ properties: [], totalPages: 1, currentPage: 1, total: 0 }),
}));
