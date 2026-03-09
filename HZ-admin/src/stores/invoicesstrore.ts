import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";

export interface Invoice {
  id: number;
  invoiceNumber: string;
  billToName?: string;
  billToAddress?: string;
  billToCity?: string;
  shipToAddress?: string;
  shipToCity?: string;
  date?: string;
  totalAmount?: number;
  [key: string]: any;
}

interface InvoiceStore {
  allInvoices: Invoice[];
  isLoading: boolean;
  fetchInvoiceEstimator: (userId: string, query: any) => Promise<void>;
  setAllInvoices: (data: Invoice[]) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  allInvoices: [],
  isLoading: false,

  setAllInvoices: (data: Invoice[]) => set({ allInvoices: data }),

  fetchInvoiceEstimator: async (userId: string, query: any = {}) => {
    set({ isLoading: true });

    try {
      const response = await apiClient.get(
        `${apiClient.URLS.invoice_estimator}`,
        query,
        true
      );

      if (response.status === 200) {
        set({ allInvoices: response.body?.data || [] });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch invoices");
    } finally {
      set({ isLoading: false });
    }
  },
}));
