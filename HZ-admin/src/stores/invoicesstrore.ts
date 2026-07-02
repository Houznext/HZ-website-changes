import { create } from "zustand";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { bearerFromSession } from "@/src/utils/sessionTokenCache";

function invoiceErrorMessage(err: unknown, fallback: string): string {
  const e = err as { status?: number; body?: { message?: string | string[] }; message?: string };
  if (e?.status === 401) return "Session expired. Please sign in again.";
  const msg = e?.body?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg.trim()) return msg;
  if (typeof e?.message === "string" && e.message.trim()) return e.message;
  return fallback;
}

interface InvoiceStats {
  total: number;
  total_billed: number;
  collected: number;
  collected_pct: number;
  outstanding: number;
  pending_count: number;
  by_status: Record<string, number>;
}

interface SendInvoicePayload {
  customer_email: string;
  email_subject?: string;
  email_body: string;
  send_whatsapp?: boolean;
}

interface InvoiceStore {
  invoices: any[];
  stats: InvoiceStats | null;
  total: number;
  isLoading: boolean;
  fetchInvoices: (query?: Record<string, unknown>) => Promise<void>;
  fetchStats: (branchId?: string) => Promise<void>;
  fetchInvoice: (id: string) => Promise<any>;
  fetchNextInvoiceNumber: () => Promise<string>;
  createInvoice: (payload: unknown) => Promise<any>;
  updateInvoice: (id: string, payload: unknown) => Promise<any>;
  sendInvoice: (id: string, payload: SendInvoicePayload) => Promise<any>;
  reopenInvoice: (id: string) => Promise<any>;
  cancelInvoice: (id: string, reason: string) => Promise<any>;
  recordPayment: (id: string, payload: unknown) => Promise<any>;
  deleteInvoice: (id: string) => Promise<void>;
  downloadPdf: (id: string, filename?: string) => Promise<void>;
  convertFromQuotation: (qid: string) => Promise<any>;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  stats: null,
  total: 0,
  isLoading: false,

  fetchInvoices: async (query = {}) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get(apiClient.URLS.invoices, query, true);
      if (res.status === 200) {
        set({
          invoices: res.body?.data || [],
          total: res.body?.total || 0,
        });
      }
    } catch {
      toast.error("Failed to fetch invoices");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async (branchId?: string) => {
    try {
      const q = branchId ? { branchId } : {};
      const res = await apiClient.get(`${apiClient.URLS.invoices}/stats`, q, true);
      if (res.status === 200) set({ stats: res.body });
    } catch {
      /* non-fatal */
    }
  },

  fetchInvoice: async (id: string) => {
    const res = await apiClient.get(`${apiClient.URLS.invoices}/${id}`, {}, true);
    if (res.status !== 200) throw new Error("Not found");
    return res.body;
  },

  fetchNextInvoiceNumber: async () => {
    const res = await apiClient.get(`${apiClient.URLS.invoices}/next-number`, {}, true);
    if (res.status !== 200) throw new Error("Failed to fetch invoice number");
    const body = res.body;
    if (typeof body === "string") return body;
    if (body && typeof body === "object" && "invoice_number" in body) {
      return String((body as { invoice_number: string }).invoice_number);
    }
    return String(body ?? "");
  },

  createInvoice: async (payload) => {
    try {
      const res = await apiClient.post(apiClient.URLS.invoices, payload, true);
      if (res.status === 201 || res.status === 200) {
        toast.success("Saved as draft");
        return res.body;
      }
      throw new Error("Create failed");
    } catch (err) {
      const message = invoiceErrorMessage(err, "Failed to save invoice");
      toast.error(message);
      throw err;
    }
  },

  updateInvoice: async (id, payload) => {
    try {
      const res = await apiClient.patch(`${apiClient.URLS.invoices}/${id}`, payload, true);
      if (res.status === 200) {
        toast.success("Saved as draft");
        return res.body;
      }
      throw new Error("Update failed");
    } catch (err) {
      const message = invoiceErrorMessage(err, "Failed to update invoice");
      toast.error(message);
      throw err;
    }
  },

  sendInvoice: async (id, payload) => {
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.invoices}/${id}/send`,
        payload,
        true,
      );
      if (res.status === 200) {
        const body = res.body as {
          whatsapp_sent?: boolean;
          whatsapp_error?: string;
          send_whatsapp?: boolean;
        };
        if (body?.whatsapp_error) {
          toast.error(`Email sent. WhatsApp failed: ${body.whatsapp_error}`);
        } else if (body?.whatsapp_sent) {
          toast.success("Invoice sent by email and WhatsApp");
        } else {
          toast.success("Invoice sent to customer by email");
        }
        return res.body;
      }
      throw new Error("Send failed");
    } catch (err) {
      const message = invoiceErrorMessage(err, "Failed to send invoice");
      toast.error(message);
      throw err;
    }
  },

  reopenInvoice: async (id) => {
    const res = await apiClient.post(`${apiClient.URLS.invoices}/${id}/reopen`, {}, true);
    if (res.status === 200) {
      toast.success("Reopened as draft");
      return res.body;
    }
    throw new Error("Reopen failed");
  },

  cancelInvoice: async (id, reason) => {
    const res = await apiClient.post(
      `${apiClient.URLS.invoices}/${id}/cancel`,
      { reason },
      true,
    );
    if (res.status === 200) {
      toast.success("Invoice cancelled");
      return res.body;
    }
    throw new Error("Cancel failed");
  },

  recordPayment: async (id, payload) => {
    const res = await apiClient.post(
      `${apiClient.URLS.invoices}/${id}/payments`,
      payload,
      true,
    );
    if (res.status === 201 || res.status === 200) {
      toast.success("Payment recorded");
      return res.body;
    }
    throw new Error("Payment failed");
  },

  deleteInvoice: async (id) => {
    const res = await apiClient.delete(`${apiClient.URLS.invoices}/${id}`, {}, true);
    if (res.status === 200 || res.status === 204) {
      toast.success("Invoice deleted");
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== id),
        total: Math.max(0, state.total - 1),
      }));
      return;
    }
    toast.error("Failed to delete invoice");
    throw new Error("Delete failed");
  },

  downloadPdf: async (id, filename) => {
    const session = await import("next-auth/react").then((m) => m.getSession());
    const token = bearerFromSession(session);
    const url = `${apiClient.URLS.invoices}/${id}/pdf`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      toast.error("PDF download failed");
      return;
    }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const safeName = (filename || id).replace(/[^a-zA-Z0-9_-]/g, "_");
    a.download = `invoice-${safeName}.pdf`;
    a.click();
  },

  convertFromQuotation: async (qid) => {
    const res = await apiClient.post(
      `${apiClient.URLS.invoices}/from-quotation/${qid}`,
      {},
      true,
    );
    if (res.status === 201 || res.status === 200) {
      toast.success("Invoice draft created from quotation");
      return res.body;
    }
    throw new Error("Conversion failed");
  },
}));
