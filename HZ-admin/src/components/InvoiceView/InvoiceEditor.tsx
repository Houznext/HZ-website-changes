import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";
import Modal from "@/src/common/Modal";
import { useInvoiceStore } from "@/src/stores/invoicesstrore";
import styles from "./invoice.module.css";
import {
  GSTIN_REGEX,
  INDIAN_STATES,
  formatINR,
  type InvoiceFormState,
  type InvoiceItemForm,
} from "./invoice.types";
import { previewInvoice, previewLine } from "./invoiceCalc";

const emptyItem = (group: string): InvoiceItemForm => ({
  group_name: group,
  item_name: "",
  pricing_mode: "area",
  area_unit: "sqft",
  unit_label: "nos",
  gst_rate: 18,
  quantity: 1,
  unit_price: 0,
  area_value: 0,
  rate_per_unit: 0,
});

const defaultForm = (userId: string): InvoiceFormState => ({
  userId,
  invoice_type: "interiors",
  bill_to_name: "",
  bill_to_gstin: "",
  bill_to_address: "",
  bill_to_city: "",
  bill_to_state: "Telangana",
  bill_to_state_code: "36",
  bill_to_pincode: "",
  bill_to_mobile: "",
  bill_to_email: "",
  ship_to_same_as_bill: true,
  ship_to_name: "",
  ship_to_address: "",
  ship_to_city: "",
  ship_to_state: "",
  ship_to_state_code: "",
  ship_to_pincode: "",
  ship_to_email: "",
  invoice_number: "",
  invoice_date: new Date().toISOString().slice(0, 10),
  invoice_due: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  notes: "",
  internal_notes: "",
  terms_and_conditions: "",
  additional_work_details: "",
  prepared_by_name: "",
  prepared_by_role: "Interior Designer",
  payment_status: "payment_due",
  amount_paid: "",
  invoice_discount_type: "amount",
  invoice_discount_value: "",
  pdf_total_paid: "",
  pdf_balance_due: "",
  last_payment_date: "",
  last_payment_method: "",
  supplier_name: "Houznext Interiors Pvt Ltd",
  supplier_gstin: "36AABCH9876F1Z2",
  supplier_state: "Telangana",
  supplier_state_code: "36",
  supplier_pan: "",
  supplier_bank_name: "HDFC Bank, Hitech City",
  supplier_bank_account: "",
  supplier_bank_ifsc: "",
  supplier_upi_id: "",
  items: [],
});

function buildDefaultSendEmail(form: InvoiceFormState, grandTotal: number): string {
  const name = str(form.bill_to_name) || "Customer";
  const invNo = str(form.invoice_number) || "your invoice";
  return `Dear ${name},

Please find attached tax invoice ${invNo} from Houznext Interiors.

Invoice date: ${form.invoice_date || "—"}
Due date: ${form.invoice_due || "—"}
Amount: ${formatINR(grandTotal)}

Thank you for choosing Houznext.

Best regards,
Houznext Team`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function paymentStatusFromApi(data: Record<string, unknown>): InvoiceFormState["payment_status"] {
  const status = str(data.status);
  if (status === "paid") return "paid";
  if (status === "partially_paid") return "partially_paid";
  return "payment_due";
}

function groupItems(items: InvoiceItemForm[]) {
  const map = new Map<string, InvoiceItemForm[]>();
  items.forEach((it) => {
    const g = (it.group_name || "").trim() || "Unnamed group";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(it);
  });
  return map;
}

function nextGroupName(items: InvoiceItemForm[]) {
  const existing = new Set(
    items.map((it) => (it.group_name || "").trim()).filter(Boolean),
  );
  let n = 1;
  let name = `Group ${n}`;
  while (existing.has(name)) {
    n += 1;
    name = `Group ${n}`;
  }
  return name;
}

function omitEmptyStrings<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const [key, value] of Object.entries(out)) {
    if (value === "") delete out[key as keyof T];
  }
  return out;
}

function str(value: unknown): string {
  return value == null ? "" : String(value);
}

const FORM_STRING_KEYS: (keyof InvoiceFormState)[] = [
  "bill_to_name",
  "bill_to_gstin",
  "bill_to_address",
  "bill_to_city",
  "bill_to_state",
  "bill_to_state_code",
  "bill_to_pincode",
  "bill_to_mobile",
  "bill_to_email",
  "ship_to_name",
  "ship_to_address",
  "ship_to_city",
  "ship_to_state",
  "ship_to_state_code",
  "ship_to_pincode",
  "ship_to_email",
  "invoice_number",
  "invoice_date",
  "invoice_due",
  "notes",
  "internal_notes",
  "terms_and_conditions",
  "additional_work_details",
  "prepared_by_name",
  "prepared_by_role",
  "last_payment_date",
  "last_payment_method",
  "supplier_name",
  "supplier_gstin",
  "supplier_state",
  "supplier_state_code",
  "supplier_pan",
  "supplier_bank_name",
  "supplier_bank_account",
  "supplier_bank_ifsc",
  "supplier_upi_id",
];

function normalizeFormState(form: InvoiceFormState): InvoiceFormState {
  const out = { ...form };
  for (const key of FORM_STRING_KEYS) {
    (out as Record<string, unknown>)[key] = str(out[key]);
  }
  out.items = (form.items || []).map((it) => ({
    ...it,
    group_name: str(it.group_name),
    item_name: str(it.item_name),
  }));
  return out;
}

function formFromApi(data: Record<string, unknown>, userId: string): InvoiceFormState {
  return normalizeFormState({
    userId,
    branchId: data.branchId as string | undefined,
    invoice_type: (data.invoice_type as InvoiceFormState["invoice_type"]) || "interiors",
    bill_to_name: str(data.bill_to_name),
    bill_to_gstin: str(data.bill_to_gstin),
    bill_to_address: str(data.bill_to_address),
    bill_to_city: str(data.bill_to_city),
    bill_to_state: str(data.bill_to_state),
    bill_to_state_code: str(data.bill_to_state_code) || "36",
    bill_to_pincode: str(data.bill_to_pincode),
    bill_to_mobile: str(data.bill_to_mobile),
    bill_to_email: str(data.bill_to_email),
    ship_to_same_as_bill: data.ship_to_same_as_bill !== false,
    ship_to_name: str(data.ship_to_name),
    ship_to_address: str(data.ship_to_address),
    ship_to_city: str(data.ship_to_city),
    ship_to_state: str(data.ship_to_state),
    ship_to_state_code: str(data.ship_to_state_code),
    ship_to_pincode: str(data.ship_to_pincode),
    ship_to_email: str(data.ship_to_email),
    invoice_number: str(data.invoice_number),
    invoice_date: str(data.invoice_date),
    invoice_due: str(data.invoice_due),
    invoice_discount_type:
      (data.invoice_discount_type as InvoiceFormState["invoice_discount_type"]) || "amount",
    invoice_discount_value: data.invoice_discount_value as InvoiceFormState["invoice_discount_value"],
    notes: str(data.notes),
    internal_notes: str(data.internal_notes),
    terms_and_conditions: str(data.terms_and_conditions),
    additional_work_details: str(data.additional_work_details),
    prepared_by_name: str(data.prepared_by_name),
    prepared_by_role: str(data.prepared_by_role) || "Interior Designer",
    payment_status: paymentStatusFromApi(data),
    amount_paid: data.total_paid != null ? Number(data.total_paid) : "",
    pdf_total_paid: data.total_paid != null ? String(data.total_paid) : "",
    pdf_balance_due: data.balance_due != null ? String(data.balance_due) : "",
    last_payment_date: str(data.last_payment_date),
    last_payment_method: str(data.last_payment_method),
    supplier_name: str(data.supplier_name) || "Houznext Interiors Pvt Ltd",
    supplier_gstin: str(data.supplier_gstin) || "36AABCH9876F1Z2",
    supplier_state: str(data.supplier_state) || "Telangana",
    supplier_state_code: str(data.supplier_state_code) || "36",
    supplier_pan: str(data.supplier_pan),
    supplier_bank_name: str(data.supplier_bank_name) || "HDFC Bank, Hitech City",
    supplier_bank_account: str(data.supplier_bank_account),
    supplier_bank_ifsc: str(data.supplier_bank_ifsc),
    supplier_upi_id: str(data.supplier_upi_id),
    status: data.status as InvoiceFormState["status"],
    linked_quotation_id: data.linked_quotation_id as string | undefined,
    grand_total: data.grand_total as number | undefined,
    total_paid: data.total_paid as number | undefined,
    balance_due: data.balance_due as number | undefined,
    payments: data.payments as InvoiceFormState["payments"],
    items: ((data.items as InvoiceItemForm[]) || []).map((it) => ({
      ...it,
      group_name: str(it.group_name),
      item_name: str(it.item_name),
    })),
  });
}

export default function InvoiceEditor({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const session = useSession();
  const userId = session?.data?.user?.id || "";
  const branchId =
    session?.data?.user?.branchMemberships?.[0]?.branchId ||
    (session?.data as { branchMemberships?: { branchId?: string }[] })?.branchMemberships?.[0]
      ?.branchId ||
    "";
  const {
    fetchInvoice,
    fetchNextInvoiceNumber,
    createInvoice,
    updateInvoice,
    sendInvoice,
    reopenInvoice,
    recordPayment,
    downloadPdf,
  } = useInvoiceStore();

  const [form, setForm] = useState<InvoiceFormState>(() => defaultForm(userId));
  const [loading, setLoading] = useState(!!invoiceId);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendStep, setSendStep] = useState<"compose" | "confirm">("compose");
  const [sending, setSending] = useState(false);
  const [sendForm, setSendForm] = useState({
    customer_email: "",
    email_subject: "",
    email_body: "",
    send_whatsapp: false,
  });
  const [payForm, setPayForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "upi",
    reference_no: "",
    notes: "",
  });

  const locked = form.status && form.status !== "draft";
  const supplierCode = "36";

  const totals = useMemo(
    () =>
      previewInvoice(
        form.items,
        supplierCode,
        form.bill_to_state_code,
        form.invoice_discount_type,
        form.invoice_discount_value,
      ),
    [form],
  );

  const gstinValid = useMemo(() => {
    const g = str(form.bill_to_gstin).trim().toUpperCase();
    if (!g) return null;
    return GSTIN_REGEX.test(g);
  }, [form.bill_to_gstin]);

  const load = useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    try {
      const data = await fetchInvoice(invoiceId);
      setForm(formFromApi(data, userId));
    } catch {
      toast.error("Failed to load invoice");
      router.push("/invoice");
    } finally {
      setLoading(false);
    }
  }, [invoiceId, fetchInvoice, router, userId]);

  useEffect(() => {
    if (userId) setForm((f) => ({ ...f, userId }));
  }, [userId]);

  useEffect(() => {
    if (branchId) setForm((f) => ({ ...f, branchId: f.branchId || branchId }));
  }, [branchId]);

  useEffect(() => {
    if (invoiceId) return;
    const u = session?.data?.user as
      | { firstName?: string; lastName?: string; username?: string }
      | undefined;
    if (!u) return;
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.username || "";
    if (!name) return;
    setForm((f) => ({
      ...f,
      prepared_by_name: f.prepared_by_name || name,
    }));
  }, [invoiceId, session?.data?.user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (invoiceId) return;
    let cancelled = false;
    fetchNextInvoiceNumber()
      .then((num) => {
        if (!cancelled && num) setForm((f) => ({ ...f, invoice_number: num }));
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load next invoice number");
      });
    return () => {
      cancelled = true;
    };
  }, [invoiceId, fetchNextInvoiceNumber]);

  const setField = (key: keyof InvoiceFormState, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const updateItem = (idx: number, patch: Partial<InvoiceItemForm>) => {
    setForm((f) => {
      const items = [...f.items];
      const next = { ...items[idx], ...patch };
      if (patch.pricing_mode === "unit") {
        next.area_value = undefined;
        next.rate_per_unit = undefined;
      }
      if (patch.pricing_mode === "area") {
        next.quantity = undefined;
        next.unit_price = undefined;
      }
      items[idx] = next;
      return { ...f, items };
    });
  };

  const renameGroup = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setForm((f) => ({
      ...f,
      items: f.items.map((it) => {
        const current = (it.group_name || "").trim() || "Unnamed group";
        return current === oldName ? { ...it, group_name: trimmed } : it;
      }),
    }));
  };

  const addGroup = () => {
    setForm((f) => ({
      ...f,
      items: [...f.items, emptyItem(nextGroupName(f.items))],
    }));
  };

  const removeGroup = (groupName: string) => {
    setForm((f) => ({
      ...f,
      items: f.items.filter((it) => {
        const current = (it.group_name || "").trim() || "Unnamed group";
        return current !== groupName;
      }),
    }));
  };

  const payload = () => {
    let totalPaid = form.pdf_total_paid !== "" ? Number(form.pdf_total_paid) : undefined;
    if (totalPaid == null) {
      if (form.payment_status === "paid") totalPaid = totals.grandTotal;
      else if (form.payment_status === "partially_paid" && form.amount_paid !== "") {
        totalPaid = Number(form.amount_paid);
      } else {
        totalPaid = 0;
      }
    }
    const balanceDue =
      form.pdf_balance_due !== ""
        ? Number(form.pdf_balance_due)
        : Math.max(0, totals.grandTotal - totalPaid);

    return omitEmptyStrings({
      userId: form.userId || userId,
      branchId: form.branchId || branchId || undefined,
      invoice_type: form.invoice_type,
      bill_to_name: form.bill_to_name,
      bill_to_gstin: form.bill_to_gstin || undefined,
      bill_to_address: form.bill_to_address,
      bill_to_city: form.bill_to_city,
      bill_to_state: form.bill_to_state,
      bill_to_state_code: form.bill_to_state_code,
      bill_to_pincode: form.bill_to_pincode,
      bill_to_mobile: form.bill_to_mobile,
      bill_to_email: form.bill_to_email || undefined,
      ship_to_same_as_bill: form.ship_to_same_as_bill,
      ship_to_name: form.ship_to_name || undefined,
      ship_to_address: form.ship_to_address || undefined,
      ship_to_city: form.ship_to_city || undefined,
      ship_to_state: form.ship_to_state || undefined,
      ship_to_state_code: form.ship_to_state_code || undefined,
      ship_to_pincode: form.ship_to_pincode || undefined,
      ship_to_email: form.ship_to_email || undefined,
      invoice_number: form.invoice_number,
      invoice_date: form.invoice_date,
      invoice_due: form.invoice_due,
      invoice_discount_type:
        form.invoice_discount_type ||
        (form.invoice_discount_value ? "amount" : undefined),
      invoice_discount_value: form.invoice_discount_value
        ? Number(form.invoice_discount_value)
        : undefined,
      notes: form.notes,
      internal_notes: form.internal_notes,
      terms_and_conditions: form.terms_and_conditions,
      additional_work_details: form.additional_work_details,
      prepared_by_name: str(form.prepared_by_name) || undefined,
      prepared_by_role: str(form.prepared_by_role) || undefined,
      payment_status: form.payment_status,
      amount_paid:
        form.payment_status === "partially_paid" && form.amount_paid !== ""
          ? Number(form.amount_paid)
          : undefined,
      total_paid: totalPaid,
      balance_due: balanceDue,
      last_payment_date: form.last_payment_date || undefined,
      last_payment_method: form.last_payment_method || undefined,
      supplier_name: form.supplier_name || undefined,
      supplier_gstin: form.supplier_gstin || undefined,
      supplier_state: form.supplier_state || undefined,
      supplier_state_code: form.supplier_state_code || undefined,
      supplier_pan: form.supplier_pan || undefined,
      supplier_bank_name: form.supplier_bank_name || undefined,
      supplier_bank_account: form.supplier_bank_account || undefined,
      supplier_bank_ifsc: form.supplier_bank_ifsc || undefined,
      supplier_upi_id: form.supplier_upi_id || undefined,
      items: form.items.map((it, i) => ({
        sort_order: i,
        group_name: (it.group_name || "").trim() || "Unnamed group",
        item_name: it.item_name || "Item",
        description: it.description,
        hsn_sac_code: it.hsn_sac_code,
        pricing_mode: it.pricing_mode,
        quantity: it.pricing_mode === "unit" ? Number(it.quantity) : undefined,
        unit_label: it.unit_label,
        unit_price: it.pricing_mode === "unit" ? Number(it.unit_price) : undefined,
        area_value: it.pricing_mode === "area" ? Number(it.area_value) : undefined,
        area_unit: it.area_unit,
        rate_per_unit:
          it.pricing_mode === "area" ? Number(it.rate_per_unit) : undefined,
        item_discount_type: it.item_discount_type,
        item_discount_value: it.item_discount_value
          ? Number(it.item_discount_value)
          : undefined,
        gst_rate: Number(it.gst_rate ?? 18),
      })),
    });
  };

  const ensureReadyToSave = () => {
    if (session.status === "loading") {
      toast.error("Session is still loading. Please try again.");
      return false;
    }
    if (!form.userId && !userId) {
      toast.error("You must be signed in to save an invoice.");
      return false;
    }
    if (!str(form.bill_to_name).trim()) {
      toast.error("Customer name is required.");
      return false;
    }
    if (!str(form.bill_to_mobile).trim()) {
      toast.error("Customer mobile is required.");
      return false;
    }
    if (form.items.length === 0) {
      toast.error("Add at least one item group before saving.");
      return false;
    }
    return true;
  };

  const saveDraft = async (): Promise<boolean> => {
    if (!ensureReadyToSave()) return false;
    setSaving(true);
    try {
      if (invoiceId) {
        const saved = await updateInvoice(invoiceId, payload());
        setForm((f) => formFromApi({ ...f, ...saved }, f.userId || userId));
      } else {
        const saved = await createInvoice(payload());
        router.replace(`/invoice/${saved.id}`);
      }
      return true;
    } catch {
      /* toast handled in store */
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openSendModal = () => {
    if (!ensureReadyToSave()) return;
    const invNo = str(form.invoice_number) || "Invoice";
    setSendForm({
      customer_email: str(form.bill_to_email),
      email_subject: `Tax Invoice ${invNo} — Houznext Interiors`,
      email_body: buildDefaultSendEmail(form, totals.grandTotal),
      send_whatsapp: false,
    });
    setSendStep("compose");
    setSendOpen(true);
  };

  const proceedSendConfirm = () => {
    if (!isValidEmail(sendForm.customer_email)) {
      toast.error("Enter a valid customer email address.");
      return;
    }
    if (!sendForm.email_body.trim()) {
      toast.error("Email message cannot be empty.");
      return;
    }
    setSendStep("confirm");
  };

  const confirmSendInvoice = async () => {
    setSending(true);
    try {
      const emailPayload = {
        ...payload(),
        bill_to_email: sendForm.customer_email.trim(),
      };
      let id = invoiceId;
      if (!id) {
        const saved = await createInvoice(emailPayload);
        id = saved.id;
        router.replace(`/invoice/${id}`);
      } else {
        await updateInvoice(id, emailPayload);
      }
      const saved = await sendInvoice(id, {
        customer_email: sendForm.customer_email.trim(),
        email_subject: sendForm.email_subject.trim() || undefined,
        email_body: sendForm.email_body.trim(),
        send_whatsapp: sendForm.send_whatsapp,
      });
      setForm((f) => formFromApi({ ...f, ...saved, bill_to_email: sendForm.customer_email.trim() }, f.userId || userId));
      setSendOpen(false);
    } catch {
      /* toast in store */
    } finally {
      setSending(false);
    }
  };

  const send = openSendModal;

  const handleDownload = async () => {
    if (!ensureReadyToSave()) return;
    setDownloading(true);
    try {
      let id = invoiceId;
      if (!id) {
        const saved = await createInvoice(payload());
        id = saved.id;
        router.replace(`/invoice/${id}`);
      } else {
        await updateInvoice(id, payload());
      }
      await downloadPdf(id, form.invoice_number || id);
    } catch {
      /* toast handled in store */
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loader />;

  const groups = groupItems(form.items);

  return (
    <div className={styles.app}>
      <div className={styles.topbar}>
        <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => router.push("/invoice")}>
          <i className="ti ti-arrow-left" />
        </button>
        <div className={styles.tbL}>
          <h1 className="text-[18px] font-extrabold mf">
            Invoice {form.invoice_number}{" "}
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#f1f5f9] capitalize">
              {form.status || "draft"}
            </span>
          </h1>
          <p>
            {form.linked_quotation_id
              ? `Linked to Quotation ${form.linked_quotation_id}`
              : "Draft invoice"}
          </p>
        </div>
        <div className={styles.tbR}>
          {form.status !== "draft" && (
            <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => invoiceId && downloadPdf(invoiceId, form.invoice_number)}>
              Download
            </button>
          )}
          {!locked && (
            <>
              <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={saveDraft} disabled={saving || downloading}>
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSm}`}
                onClick={handleDownload}
                disabled={saving || downloading}
              >
                {downloading ? "Downloading…" : "Download"}
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPri} ${styles.btnSm}`} onClick={send} disabled={saving || downloading}>
                Send Invoice
              </button>
            </>
          )}
          {locked && (
            <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={() => invoiceId && reopenInvoice(invoiceId).then(load)}>
              Reopen as Draft
            </button>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <div>
          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-file-invoice" /></div>
              <div className={styles.secT}>Invoice Details</div>
              <div className={styles.secLine} />
            </div>
            <div className={styles.g4}>
              <div className={styles.field}>
                <label className={styles.lbl}>Invoice no.</label>
                <input
                  className={styles.fi}
                  value={form.invoice_number || "Generating…"}
                  readOnly
                  style={{ background: "#f8fafc" }}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Invoice date</label>
                <input className={styles.fi} type="date" disabled={locked} value={form.invoice_date} onChange={(e) => setField("invoice_date", e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Due date</label>
                <input className={styles.fi} type="date" disabled={locked} value={form.invoice_due} onChange={(e) => setField("invoice_due", e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Invoice type</label>
                <select className={styles.fi} disabled={locked} value={form.invoice_type} onChange={(e) => setField("invoice_type", e.target.value)}>
                  <option value="interiors">Interiors</option>
                  <option value="furniture">Furniture</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-user" /></div>
              <div className={styles.secT}>Bill To</div>
              <div className={styles.secLine} />
            </div>
            <div className={styles.g2}>
              <div className={styles.field}>
                <label className={styles.lbl}>Customer name *</label>
                <input className={styles.fi} disabled={locked} value={str(form.bill_to_name)} onChange={(e) => setField("bill_to_name", e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>GSTIN (optional)</label>
                <input className={styles.fi} disabled={locked} value={str(form.bill_to_gstin)} onChange={(e) => setField("bill_to_gstin", e.target.value.toUpperCase())} />
                {gstinValid === true && <div className={styles.validOk}><i className="ti ti-check" /> Valid GSTIN</div>}
                {gstinValid === false && <div className={styles.validErr}>Invalid GSTIN format</div>}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.lbl}>Address</label>
              <textarea className={styles.fi} rows={2} disabled={locked} value={str(form.bill_to_address)} onChange={(e) => setField("bill_to_address", e.target.value)} />
            </div>
            <div className={styles.g3}>
              <div className={styles.field}>
                <label className={styles.lbl}>State *</label>
                <select
                  className={styles.fi}
                  disabled={locked}
                  value={form.bill_to_state_code}
                  onChange={(e) => {
                    const st = INDIAN_STATES.find((s) => s.code === e.target.value);
                    setForm((f) => ({
                      ...f,
                      bill_to_state_code: e.target.value,
                      bill_to_state: st?.name || "",
                    }));
                  }}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Pincode</label>
                <input className={styles.fi} disabled={locked} maxLength={6} value={str(form.bill_to_pincode)} onChange={(e) => setField("bill_to_pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Mobile *</label>
                <input className={styles.fi} disabled={locked} value={str(form.bill_to_mobile)} onChange={(e) => setField("bill_to_mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Email</label>
                <input
                  className={styles.fi}
                  type="email"
                  disabled={locked}
                  placeholder="customer@email.com"
                  value={str(form.bill_to_email)}
                  onChange={(e) => setField("bill_to_email", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-truck-delivery" /></div>
              <div className={styles.secT}>Ship To</div>
              <div className={styles.secLine} />
            </div>
            <label className="flex items-center gap-2 text-[13px] mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.ship_to_same_as_bill}
                disabled={locked}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ship_to_same_as_bill: e.target.checked }))
                }
              />
              Same as billing address
            </label>
            {!form.ship_to_same_as_bill && (
              <>
                <div className={styles.field}>
                  <label className={styles.lbl}>Recipient name</label>
                  <input
                    className={styles.fi}
                    disabled={locked}
                    value={str(form.ship_to_name)}
                    onChange={(e) => setField("ship_to_name", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.lbl}>Address</label>
                  <textarea
                    className={styles.fi}
                    rows={2}
                    disabled={locked}
                    value={str(form.ship_to_address)}
                    onChange={(e) => setField("ship_to_address", e.target.value)}
                  />
                </div>
                <div className={styles.g3}>
                  <div className={styles.field}>
                    <label className={styles.lbl}>City</label>
                    <input
                      className={styles.fi}
                      disabled={locked}
                      value={str(form.ship_to_city)}
                      onChange={(e) => setField("ship_to_city", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>State</label>
                    <input
                      className={styles.fi}
                      disabled={locked}
                      value={str(form.ship_to_state)}
                      onChange={(e) => setField("ship_to_state", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Pincode</label>
                    <input
                      className={styles.fi}
                      disabled={locked}
                      maxLength={6}
                      value={str(form.ship_to_pincode)}
                      onChange={(e) =>
                        setField("ship_to_pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.lbl}>Email</label>
                  <input
                    className={styles.fi}
                    type="email"
                    disabled={locked}
                    placeholder="recipient@email.com"
                    value={str(form.ship_to_email)}
                    onChange={(e) => setField("ship_to_email", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-user-check" /></div>
              <div className={styles.secT}>Prepared By</div>
              <div className={styles.secLine} />
            </div>
            <div className={styles.g2}>
              <div className={styles.field}>
                <label className={styles.lbl}>Name</label>
                <input
                  className={styles.fi}
                  disabled={locked}
                  value={str(form.prepared_by_name)}
                  onChange={(e) => setField("prepared_by_name", e.target.value)}
                  placeholder="e.g. Houznext Admin"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Designation</label>
                <input
                  className={styles.fi}
                  disabled={locked}
                  value={str(form.prepared_by_role)}
                  onChange={(e) => setField("prepared_by_role", e.target.value)}
                  placeholder="e.g. Interior Designer"
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-cash" /></div>
              <div className={styles.secT}>Payment Status</div>
              <div className={styles.secLine} />
            </div>
            <p className="text-[11px] text-[#5a6a7e] mb-3">
              Controls the payment badge and due/paid display on the invoice PDF header.
            </p>
            {!locked ? (
              <>
                <div className={styles.g2}>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Status on invoice</label>
                    <select
                      className={styles.fi}
                      value={form.payment_status}
                      onChange={(e) =>
                        setField(
                          "payment_status",
                          e.target.value as InvoiceFormState["payment_status"],
                        )
                      }
                    >
                      <option value="payment_due">Payment Due</option>
                      <option value="paid">Paid in Full</option>
                      <option value="partially_paid">Partially Paid</option>
                    </select>
                  </div>
                  {form.payment_status === "partially_paid" && (
                    <div className={styles.field}>
                      <label className={styles.lbl}>Amount received (₹)</label>
                      <input
                        className={styles.fi}
                        type="number"
                        min={0}
                        value={form.amount_paid ?? ""}
                        onChange={(e) => setField("amount_paid", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-[13px] space-y-1">
                <p>
                  <span className="text-[#5a6a7e]">Status: </span>
                  <span className="font-semibold capitalize">
                    {form.status === "paid"
                      ? "Paid in Full"
                      : form.status === "partially_paid"
                        ? "Partially Paid"
                        : form.status === "overdue"
                          ? "Overdue"
                          : "Payment Due"}
                  </span>
                </p>
                <p>
                  <span className="text-[#5a6a7e]">Due date: </span>
                  <span className="font-semibold">{form.invoice_due}</span>
                </p>
                {form.total_paid != null && (
                  <p>
                    <span className="text-[#5a6a7e]">Received: </span>
                    <span className="font-semibold">{formatINR(form.total_paid)}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-building-bank" /></div>
              <div className={styles.secT}>PDF Payment &amp; Bank Details</div>
              <div className={styles.secLine} />
            </div>
            <p className="text-[11px] text-[#5a6a7e] mb-3">
              Values shown in the green payment bar and bank section on the downloaded PDF.
            </p>
            {!locked ? (
              <>
                <div className={styles.g3}>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Total paid (₹)</label>
                    <input
                      className={styles.fi}
                      type="number"
                      min={0}
                      value={form.pdf_total_paid ?? ""}
                      placeholder="0"
                      onChange={(e) => {
                        const paid = e.target.value;
                        setForm((f) => ({
                          ...f,
                          pdf_total_paid: paid,
                          pdf_balance_due:
                            paid !== ""
                              ? String(Math.max(0, totals.grandTotal - Number(paid)))
                              : f.pdf_balance_due,
                        }));
                      }}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Balance due (₹)</label>
                    <input
                      className={styles.fi}
                      type="number"
                      min={0}
                      value={form.pdf_balance_due ?? ""}
                      placeholder={String(totals.grandTotal)}
                      onChange={(e) => setField("pdf_balance_due", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Last payment date</label>
                    <input
                      className={styles.fi}
                      type="date"
                      value={form.last_payment_date}
                      onChange={(e) => setField("last_payment_date", e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.lbl}>Last payment method</label>
                  <select
                    className={styles.fi}
                    value={form.last_payment_method || ""}
                    onChange={(e) => setField("last_payment_method", e.target.value)}
                  >
                    <option value="">— None —</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <hr className="my-3 border-[#e2e8f0]" />
                <div className={styles.g2}>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Bank / account name</label>
                    <input
                      className={styles.fi}
                      value={form.supplier_name}
                      onChange={(e) => setField("supplier_name", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Bank name</label>
                    <input
                      className={styles.fi}
                      value={form.supplier_bank_name}
                      onChange={(e) => setField("supplier_bank_name", e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.g2}>
                  <div className={styles.field}>
                    <label className={styles.lbl}>Account number</label>
                    <input
                      className={styles.fi}
                      value={form.supplier_bank_account}
                      onChange={(e) => setField("supplier_bank_account", e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>IFSC</label>
                    <input
                      className={styles.fi}
                      value={form.supplier_bank_ifsc}
                      onChange={(e) => setField("supplier_bank_ifsc", e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.lbl}>UPI ID</label>
                  <input
                    className={styles.fi}
                    value={form.supplier_upi_id}
                    onChange={(e) => setField("supplier_upi_id", e.target.value)}
                  />
                </div>
                <div className={styles.g3}>
                  <div className={styles.field}>
                    <label className={styles.lbl}>GSTIN</label>
                    <input
                      className={styles.fi}
                      value={form.supplier_gstin}
                      onChange={(e) => setField("supplier_gstin", e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>State code</label>
                    <input
                      className={styles.fi}
                      maxLength={2}
                      value={form.supplier_state_code}
                      onChange={(e) =>
                        setField("supplier_state_code", e.target.value.replace(/\D/g, "").slice(0, 2))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.lbl}>State</label>
                    <input
                      className={styles.fi}
                      value={form.supplier_state}
                      onChange={(e) => setField("supplier_state", e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.lbl}>PAN (optional)</label>
                  <input
                    className={styles.fi}
                    value={form.supplier_pan}
                    onChange={(e) => setField("supplier_pan", e.target.value.toUpperCase())}
                  />
                </div>
              </>
            ) : (
              <div className="text-[13px] space-y-2">
                <p><span className="text-[#5a6a7e]">Total paid: </span><span className="font-semibold">{formatINR(Number(form.pdf_total_paid || form.total_paid || 0))}</span></p>
                <p><span className="text-[#5a6a7e]">Balance due: </span><span className="font-semibold">{formatINR(Number(form.pdf_balance_due || form.balance_due || totals.grandTotal))}</span></p>
                <p><span className="text-[#5a6a7e]">Last payment: </span><span className="font-semibold">{form.last_payment_date ? `${form.last_payment_date}${form.last_payment_method ? ` · ${form.last_payment_method}` : ""}` : "—"}</span></p>
                <p><span className="text-[#5a6a7e]">Bank: </span><span className="font-semibold">{form.supplier_name}</span></p>
                <p><span className="text-[#5a6a7e]">GSTIN: </span><span className="font-semibold">{form.supplier_gstin}</span></p>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-list-details" /></div>
              <div className={styles.secT}>Items</div>
              <div className={styles.secLine} />
              <span className="text-[11px] text-[#5a6a7e]">{form.items.length} items</span>
            </div>

            {form.items.length === 0 && (
              <div className={styles.itemsEmpty}>
                No item groups yet. Click &quot;+ Add group&quot; to create your first group.
              </div>
            )}

            {[...groups.entries()].map(([groupName, groupItemsList]) => (
              <div key={groupName} className={styles.groupBlk}>
                <div className={styles.groupHead}>
                  <input
                    className={styles.groupNameInput}
                    defaultValue={groupName}
                    key={groupName}
                    disabled={locked}
                    placeholder="Group name"
                    onBlur={(e) => renameGroup(groupName, e.target.value)}
                  />
                  {!locked && (
                    <button
                      type="button"
                      className="text-red-600 text-xs font-semibold whitespace-nowrap"
                      onClick={() => removeGroup(groupName)}
                    >
                      Remove group
                    </button>
                  )}
                </div>
                {groupItemsList.map((item) => {
                  const idx = form.items.indexOf(item);
                  const line = previewLine(item, supplierCode, form.bill_to_state_code);
                  return (
                    <div key={idx} className={styles.itemCard}>
                      <input
                        className="w-full border-none font-semibold mb-2 outline-none"
                        disabled={locked}
                        value={item.item_name}
                        placeholder="Item name"
                        onChange={(e) => updateItem(idx, { item_name: e.target.value })}
                      />
                      <div className={styles.modeToggle}>
                        <button type="button" className={`${styles.modeOpt} ${item.pricing_mode === "unit" ? styles.modeOptOn : ""}`} disabled={locked} onClick={() => updateItem(idx, { pricing_mode: "unit", area_value: undefined, rate_per_unit: undefined })}>Unit-based</button>
                        <button type="button" className={`${styles.modeOpt} ${item.pricing_mode === "area" ? styles.modeOptOn : ""}`} disabled={locked} onClick={() => updateItem(idx, { pricing_mode: "area", quantity: undefined, unit_price: undefined })}>Area-based</button>
                      </div>
                      {item.pricing_mode === "unit" ? (
                        <div className={styles.g4}>
                          <div className={styles.field}><label className={styles.lbl}>Qty</label><input className={styles.fi} type="number" disabled={locked} value={item.quantity} onChange={(e) => updateItem(idx, { quantity: e.target.value })} /></div>
                          <div className={styles.field}><label className={styles.lbl}>Unit</label><select className={styles.fi} disabled={locked} value={item.unit_label} onChange={(e) => updateItem(idx, { unit_label: e.target.value })}><option>nos</option><option>set</option><option>piece</option></select></div>
                          <div className={styles.field}><label className={styles.lbl}>Unit price</label><input className={styles.fi} type="number" disabled={locked} value={item.unit_price} onChange={(e) => updateItem(idx, { unit_price: e.target.value })} /></div>
                          <div className={styles.field}><label className={styles.lbl}>GST %</label><select className={styles.fi} disabled={locked} value={item.gst_rate} onChange={(e) => updateItem(idx, { gst_rate: Number(e.target.value) })}>{[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}</select></div>
                        </div>
                      ) : (
                        <div className={styles.g4}>
                          <div className={styles.field}><label className={styles.lbl}>Area</label><input className={styles.fi} type="number" disabled={locked} value={item.area_value} onChange={(e) => updateItem(idx, { area_value: e.target.value })} /></div>
                          <div className={styles.field}><label className={styles.lbl}>Unit</label><select className={styles.fi} disabled={locked} value={item.area_unit} onChange={(e) => updateItem(idx, { area_unit: e.target.value })}><option>sqft</option><option>sqyd</option><option>rft</option></select></div>
                          <div className={styles.field}><label className={styles.lbl}>Rate (₹)</label><input className={styles.fi} type="number" disabled={locked} value={item.rate_per_unit} onChange={(e) => updateItem(idx, { rate_per_unit: e.target.value })} /></div>
                          <div className={styles.field}><label className={styles.lbl}>GST %</label><select className={styles.fi} disabled={locked} value={item.gst_rate} onChange={(e) => updateItem(idx, { gst_rate: Number(e.target.value) })}>{[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>{r}%</option>)}</select></div>
                        </div>
                      )}
                      <div className="flex justify-between mt-2 pt-2 border-t border-dashed text-sm">
                        <span className="text-[#5a6a7e]">Taxable {formatINR(line.taxable)} · GST {formatINR(line.gst)}</span>
                        <span className="font-extrabold text-[#2f80ed] mf">{formatINR(line.lineTotal)}</span>
                      </div>
                      {!locked && (
                        <button type="button" className="text-red-600 text-xs mt-2" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}>Remove</button>
                      )}
                    </div>
                  );
                })}
                {!locked && (
                  <button
                    type="button"
                    className={`${styles.btn} w-full justify-center mt-2`}
                    onClick={() =>
                      setForm((f) => ({ ...f, items: [...f.items, emptyItem(groupName)] }))
                    }
                  >
                    + Add item to {groupName}
                  </button>
                )}
              </div>
            ))}
            {!locked && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPri} w-full justify-center mt-3`}
                onClick={addGroup}
              >
                + Add group
              </button>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.secHead}>
              <div className={styles.secIc}><i className="ti ti-discount-2" /></div>
              <div className={styles.secT}>Discount &amp; Notes</div>
            </div>
            <div className={styles.g2}>
              <div className={styles.field}>
                <label className={styles.lbl}>Invoice-level discount</label>
                <div className="flex gap-2">
                  <input
                    className={styles.fi}
                    disabled={locked}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.invoice_discount_value || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        invoice_discount_value: e.target.value,
                        invoice_discount_type: f.invoice_discount_type || "amount",
                      }))
                    }
                  />
                  <select
                    className={styles.fi}
                    style={{ width: 80 }}
                    disabled={locked}
                    value={form.invoice_discount_type || "amount"}
                    onChange={(e) =>
                      setField("invoice_discount_type", e.target.value as "amount" | "percent")
                    }
                  >
                    <option value="amount">₹</option>
                    <option value="percent">%</option>
                  </select>
                </div>
                <p className="text-[11px] text-[#5a6a7e] mt-1">
                  Updates invoice totals instantly. Use Save draft to keep changes.
                </p>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.lbl}>Customer notes (visible on PDF)</label>
              <textarea className={styles.fi} rows={2} disabled={locked} value={form.additional_work_details || form.notes} onChange={(e) => setField("additional_work_details", e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.lbl}>Internal notes</label>
              <textarea className={styles.fi} rows={2} disabled={locked} value={form.internal_notes} onChange={(e) => setField("internal_notes", e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <div className={styles.totals}>
            <div className={styles.secHead}><div className={styles.secIc}><i className="ti ti-calculator" /></div><div className={styles.secT}>Invoice Totals</div></div>
            <div className="flex justify-between py-1 text-sm"><span className="text-[#5a6a7e]">Subtotal</span><span className="font-bold mf">{formatINR(totals.subtotal)}</span></div>
            <div className="flex justify-between py-1 text-sm text-red-600"><span>Item discounts</span><span>−{formatINR(totals.totalItemDiscount)}</span></div>
            <div className="flex justify-between py-1 text-sm text-red-600"><span>Invoice discount</span><span>−{formatINR(totals.invoiceDiscount)}</span></div>
            <hr className="my-2 border-[#dde8f5]" />
            <div className="flex justify-between py-1 text-sm"><span>Taxable value</span><span className="font-bold mf">{formatINR(totals.taxableValue)}</span></div>
            {totals.igst > 0 ? (
              <div className="flex justify-between py-1 text-sm"><span>IGST</span><span className="font-bold mf">{formatINR(totals.igst)}</span></div>
            ) : (
              <>
                <div className="flex justify-between py-1 text-sm"><span>CGST</span><span className="font-bold mf">{formatINR(totals.cgst)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span>SGST</span><span className="font-bold mf">{formatINR(totals.sgst)}</span></div>
              </>
            )}
            <div className="flex justify-between py-1 text-sm"><span>Round-off</span><span>{formatINR(totals.roundOff)}</span></div>
            <div className={styles.grand}>
              <div><div className="text-xs uppercase opacity-70">Grand Total</div></div>
              <div className={styles.grandV}>{formatINR(totals.grandTotal)}</div>
            </div>
          </div>

          {invoiceId && form.status !== "draft" && (
            <div className={`${styles.card} mt-3`}>
              <div className={styles.secHead}><div className={styles.secIc}><i className="ti ti-cash" /></div><div className={styles.secT}>Payment Tracking</div></div>
              <div className="flex justify-between text-sm"><span>Total paid</span><span className="text-[#0d9488] font-bold">{formatINR(form.total_paid ?? 0)}</span></div>
              <div className={styles.payBal}>
                <span className="text-xs font-bold text-[#92400e]">BALANCE DUE</span>
                <span className="text-[#d97706] font-extrabold mf text-lg">{formatINR(form.balance_due ?? totals.grandTotal)}</span>
              </div>
              <button type="button" className={`${styles.btn} ${styles.btnPri} w-full justify-center mt-3`} onClick={() => setPayOpen(true)}>+ Record Payment</button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={sendOpen}
        closeModal={() => {
          if (!sending) {
            setSendOpen(false);
            setSendStep("compose");
          }
        }}
        title={sendStep === "compose" ? "Send Invoice" : "Confirm send"}
        className="max-w-lg"
      >
        <div className="space-y-3 p-2">
          {sendStep === "compose" ? (
            <>
              <div className={styles.field}>
                <label className={styles.lbl}>Customer email *</label>
                <input
                  className={styles.fi}
                  type="email"
                  value={sendForm.customer_email}
                  onChange={(e) =>
                    setSendForm((s) => ({ ...s, customer_email: e.target.value }))
                  }
                  placeholder="customer@email.com"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Email subject</label>
                <input
                  className={styles.fi}
                  value={sendForm.email_subject}
                  onChange={(e) =>
                    setSendForm((s) => ({ ...s, email_subject: e.target.value }))
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Email message</label>
                <textarea
                  className={styles.fi}
                  rows={10}
                  value={sendForm.email_body}
                  onChange={(e) =>
                    setSendForm((s) => ({ ...s, email_body: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendForm.send_whatsapp}
                  onChange={(e) =>
                    setSendForm((s) => ({ ...s, send_whatsapp: e.target.checked }))
                  }
                />
                Also send to customer WhatsApp ({str(form.bill_to_mobile) || "mobile required"})
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => setSendOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPri}`}
                  onClick={proceedSendConfirm}
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-[#5a6a7e]">
                Please confirm you want to send this invoice to the customer.
              </p>
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm space-y-2">
                <p>
                  <span className="text-[#5a6a7e]">To: </span>
                  <span className="font-semibold">{sendForm.customer_email}</span>
                </p>
                <p>
                  <span className="text-[#5a6a7e]">Subject: </span>
                  <span className="font-semibold">{sendForm.email_subject}</span>
                </p>
                <p>
                  <span className="text-[#5a6a7e]">WhatsApp: </span>
                  <span className="font-semibold">
                    {sendForm.send_whatsapp ? "Yes" : "No"}
                  </span>
                </p>
                <p className="text-[#5a6a7e] whitespace-pre-wrap border-t border-[#e2e8f0] pt-2 mt-2 max-h-32 overflow-y-auto">
                  {sendForm.email_body}
                </p>
              </div>
              <p className="text-xs text-[#5a6a7e]">
                The invoice PDF will be attached. The invoice will be marked as sent and locked for editing.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className={styles.btn}
                  disabled={sending}
                  onClick={() => setSendStep("compose")}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPri}`}
                  disabled={sending}
                  onClick={confirmSendInvoice}
                >
                  {sending ? "Sending…" : "Yes, send invoice"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={payOpen} closeModal={() => setPayOpen(false)} title="Record Payment" className="max-w-md">
        <div className="space-y-3 p-2">
          <input className={styles.fi} placeholder="Amount" value={payForm.amount} onChange={(e) => setPayForm((p) => ({ ...p, amount: e.target.value }))} />
          <input className={styles.fi} type="date" value={payForm.payment_date} onChange={(e) => setPayForm((p) => ({ ...p, payment_date: e.target.value }))} />
          <select className={styles.fi} value={payForm.payment_method} onChange={(e) => setPayForm((p) => ({ ...p, payment_method: e.target.value }))}>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="card">Card</option>
          </select>
          <input className={styles.fi} placeholder="Reference no" value={payForm.reference_no} onChange={(e) => setPayForm((p) => ({ ...p, reference_no: e.target.value }))} />
          <p className="text-sm">Balance after: {formatINR((form.balance_due ?? totals.grandTotal) - Number(payForm.amount || 0))}</p>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPri}`}
            onClick={async () => {
              if (!invoiceId) return;
              await recordPayment(invoiceId, {
                amount: Number(payForm.amount),
                payment_date: payForm.payment_date,
                payment_method: payForm.payment_method,
                reference_no: payForm.reference_no,
                notes: payForm.notes,
              });
              setPayOpen(false);
              load();
            }}
          >
            Record Payment
          </button>
        </div>
      </Modal>
    </div>
  );
}
