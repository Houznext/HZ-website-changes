export const INDIAN_STATES = [
  { name: "Telangana", code: "36" },
  { name: "Andhra Pradesh", code: "37" },
  { name: "Karnataka", code: "29" },
  { name: "Maharashtra", code: "27" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Kerala", code: "32" },
  { name: "Delhi", code: "07" },
  { name: "Gujarat", code: "24" },
  { name: "West Bengal", code: "19" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Rajasthan", code: "08" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Punjab", code: "03" },
  { name: "Haryana", code: "06" },
  { name: "Odisha", code: "21" },
  { name: "Bihar", code: "10" },
  { name: "Jharkhand", code: "20" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Assam", code: "18" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Uttarakhand", code: "05" },
  { name: "Goa", code: "30" },
];

export const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function formatINR(n: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "₹0";
  return `₹${v.toLocaleString("en-IN")}`;
}

/** Parse amounts typed with Indian commas / currency symbols (e.g. "2,13,808" or "₹213808"). */
export function parseAmountInput(raw: string | number | null | undefined): number {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  if (raw == null) return NaN;
  const cleaned = String(raw).replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
}

export function formatINRShort(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return formatINR(n);
}

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "revised"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export interface InvoiceItemForm {
  id?: string;
  sort_order?: number;
  group_name: string;
  item_name: string;
  description?: string;
  hsn_sac_code?: string;
  pricing_mode: "unit" | "area";
  quantity?: number | string;
  unit_label?: string;
  unit_price?: number | string;
  area_value?: number | string;
  area_unit?: string;
  rate_per_unit?: number | string;
  item_discount_type?: "percent" | "amount";
  item_discount_value?: number | string;
  gst_rate?: number;
}

export interface InvoiceFormState {
  userId: string;
  branchId?: string;
  invoice_type: "interiors" | "furniture" | "mixed";
  bill_to_name: string;
  bill_to_gstin: string;
  bill_to_address: string;
  bill_to_city: string;
  bill_to_state: string;
  bill_to_state_code: string;
  bill_to_pincode: string;
  bill_to_mobile: string;
  bill_to_email: string;
  ship_to_same_as_bill: boolean;
  ship_to_name: string;
  ship_to_address: string;
  ship_to_city: string;
  ship_to_state: string;
  ship_to_state_code: string;
  ship_to_pincode: string;
  ship_to_email: string;
  invoice_number: string;
  invoice_date: string;
  invoice_due: string;
  invoice_discount_type?: "percent" | "amount";
  invoice_discount_value?: number | string;
  notes: string;
  internal_notes: string;
  terms_and_conditions: string;
  additional_work_details: string;
  prepared_by_name: string;
  prepared_by_role: string;
  payment_status: "payment_due" | "paid" | "partially_paid";
  amount_paid?: number | string;
  pdf_total_paid?: number | string;
  pdf_balance_due?: number | string;
  last_payment_date: string;
  last_payment_method: string;
  supplier_name: string;
  supplier_gstin: string;
  supplier_state: string;
  supplier_state_code: string;
  supplier_pan: string;
  supplier_bank_name: string;
  supplier_bank_account: string;
  supplier_bank_ifsc: string;
  supplier_upi_id: string;
  items: InvoiceItemForm[];
  status?: InvoiceStatus;
  linked_quotation_id?: string;
  grand_total?: number;
  total_paid?: number;
  balance_due?: number;
  payments?: Array<{
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_no?: string;
    notes?: string;
  }>;
}
