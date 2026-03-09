import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";

export type CompanyStatusFilter = 'all' | 'pending' | 'approved' | 'draft';

export interface StatusCounts {
  all: number;
  pending: number;
  approved: number;
  draft: number;
}

export interface CompanyStore {
  id: number;
  companyName: string;
  developerInformation: { fullName: string; email?: string };
  estdYear: number;
  promotionType?: string[];
  isPosted?: boolean;
  isApproved?: boolean;
  approvedBy?: string;
  approvedDate?: Date;
  [key: string]: any;
}

interface CompanyPropertyState {
  companyDetails: CompanyStore[];
  isLoading: boolean;
  error: string | null;
  statusFilter: CompanyStatusFilter;
  statusCounts: StatusCounts;
  total: number;
  currentPage: number;
  totalPages: number;

  fetchCompanies: (page?: number, limit?: number, status?: CompanyStatusFilter, search?: string, forceRefresh?: boolean) => Promise<void>;
  setCompanyDetails: (
    companies: CompanyStore[] | ((prev: CompanyStore[]) => CompanyStore[])
  ) => void;
  setStatusFilter: (status: CompanyStatusFilter) => void;
  approveCompany: (companyId: string, isApproved: boolean, approvedBy: string, isPosted?: boolean, rejectionReason?: string) => Promise<boolean>;
  clearCompanies: () => void;
}

export const useCompanyStore = create<CompanyPropertyState>((set, get) => ({
  companyDetails: [],
  isLoading: false,
  error: null,
  statusFilter: 'all',
  statusCounts: { all: 0, pending: 0, approved: 0, draft: 0 },
  total: 0,
  currentPage: 1,
  totalPages: 1,

  fetchCompanies: async (page = 1, limit = 50, status?: CompanyStatusFilter, search?: string, forceRefresh = false) => {
    const state = get();
    const currentStatus = status ?? state.statusFilter;

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.company_Onboarding}/admin/all?page=${page}&limit=${limit}&status=${currentStatus}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        "",
        true
      );
      if (response.status === 200 && response.body) {
        set({ 
          companyDetails: response.body.data || [], 
          total: response.body.total || 0,
          currentPage: response.body.currentPage || page,
          totalPages: response.body.totalPages || 1,
          statusCounts: response.body.counts || { all: 0, pending: 0, approved: 0, draft: 0 },
          statusFilter: currentStatus,
          isLoading: false 
        });
      } else {
        set({ companyDetails: [], isLoading: false });
      }
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch companies", isLoading: false });
      toast.error("Failed to fetch companies");
    }
  },

  setCompanyDetails: (companies) =>
    set((state) => ({
      companyDetails:
        typeof companies === "function" ? companies(state.companyDetails) : companies,
    })),

  setStatusFilter: (status: CompanyStatusFilter) => {
    set({ statusFilter: status });
    get().fetchCompanies(1, 50, status, '', true);
  },

  approveCompany: async (companyId: string, isApproved: boolean, approvedBy: string, isPosted?: boolean, rejectionReason?: string) => {
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.company_Onboarding}/admin/${companyId}/approve`,
        {
          isApproved,
          isPosted: isPosted ?? isApproved,
          approvedBy,
          rejectionReason,
        },
        true
      );

      if (res.status === 200) {
        set((state) => ({
          companyDetails: state.companyDetails.map((c) =>
            String(c.id) === companyId
              ? { ...c, isApproved, isPosted: isPosted ?? isApproved, approvedBy, approvedDate: new Date() }
              : c
          ),
        }));
        toast.success(isApproved ? "Company approved successfully" : "Company rejected");
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      toast.error("Failed to update company status");
      return false;
    }
  },

  clearCompanies: () => set({ companyDetails: [], totalPages: 1, currentPage: 1, total: 0 }),
}));
