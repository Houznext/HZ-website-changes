import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Loader from "@/src/common/Loader";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";
import { useInvoiceStore } from "@/src/stores/invoicesstrore";
import { usePermissionStore } from "@/src/stores/usePermissions";
import styles from "./invoice.module.css";
import { formatINR, formatINRShort } from "./invoice.types";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

function statusClass(s: string) {
  if (s === "paid") return styles.rowPaid;
  if (s === "partially_paid") return styles.rowPartial;
  if (s === "overdue") return styles.rowOverdue;
  if (s === "draft") return styles.rowDraft;
  return styles.rowSent;
}

function statusPill(s: string) {
  if (s === "paid") return styles.stPaid;
  if (s === "partially_paid") return styles.stPartial;
  if (s === "overdue") return styles.stOverdue;
  if (s === "draft") return styles.stDraft;
  return styles.stSent;
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    paid: "Paid",
    partially_paid: "Partial",
    overdue: "Overdue",
    draft: "Draft",
    sent: "Sent",
    cancelled: "Cancelled",
  };
  return map[s] || s;
}

export default function InvoiceList() {
  const router = useRouter();
  const session = useSession();
  const { hasPermission } = usePermissionStore();
  const { invoices, stats, total, isLoading, fetchInvoices, fetchStats, downloadPdf, deleteInvoice } =
    useInvoiceStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [typeTab, setTypeTab] = useState<"interiors" | "furniture" | "mixed" | "">("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    invoice_number?: string;
    bill_to_name?: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const userId = session?.data?.user?.id;
  const branchId = session?.data?.user?.branchMemberships?.[0]?.branchId;

  const refreshList = useCallback(() => {
    if (!userId) return;
    const q: Record<string, unknown> = { page: 1, limit: 20 };
    if (branchId) q.branchId = String(branchId);
    if (status !== "all") q.status = status;
    if (search.trim()) q.search = search.trim();
    if (typeTab) q.invoice_type = typeTab;
    fetchInvoices(q);
    fetchStats(branchId ? String(branchId) : undefined);
  }, [userId, branchId, status, search, typeTab, fetchInvoices, fetchStats]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const subtitle = useMemo(() => {
    const out = stats?.outstanding ?? 0;
    return `${total} invoices found · ${formatINRShort(out)} outstanding`;
  }, [total, stats]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget.id);
      setDeleteTarget(null);
      refreshList();
    } catch {
      /* toast handled in store */
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="p-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.topbar}>
        <div className={styles.tbL}>
          <h1>Invoices</h1>
          <p>{subtitle}</p>
        </div>
        <div className={styles.tbR}>
          <button
            type="button"
            className={`${styles.btn} ${typeTab === "interiors" ? styles.btnPri : ""}`}
            onClick={() => setTypeTab(typeTab === "interiors" ? "" : "interiors")}
          >
            <i className="ti ti-receipt" aria-hidden="true" />
            Interiors
          </button>
          {hasPermission("invoice_estimator", "create") && (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPri}`}
              onClick={() => router.push("/invoice/new")}
            >
              <i className="ti ti-plus" aria-hidden="true" />
              New Invoice
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statL}>Total</div>
            <div className={styles.statV}>{stats?.total ?? total}</div>
            <div className={styles.statS}>invoices</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statL}>Total Billed</div>
            <div className={`${styles.statV} ${styles.statVBlue}`}>
              {formatINRShort(stats?.total_billed ?? 0)}
            </div>
            <div className={styles.statS}>across all invoices</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statL}>Collected</div>
            <div className={`${styles.statV} ${styles.statVTeal}`}>
              {formatINRShort(stats?.collected ?? 0)}
            </div>
            <div className={styles.statS}>
              {stats?.collected_pct ?? 0}% of billed
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statL}>Outstanding</div>
            <div className={`${styles.statV} ${styles.statVAmber}`}>
              {formatINRShort(stats?.outstanding ?? 0)}
            </div>
            <div className={styles.statS}>
              {stats?.pending_count ?? 0} invoices pending
            </div>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <i className="ti ti-search" aria-hidden="true" />
            <input
              className={styles.search}
              placeholder="Search by invoice no, name, GSTIN, phone, project…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`${styles.tabPill} ${status === t.key ? styles.tabPillOn : ""}`}
              onClick={() => setStatus(t.key)}
            >
              {t.label}
              {stats?.by_status?.[t.key] != null ? ` (${stats.by_status[t.key]})` : ""}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {invoices.map((inv) => {
            const paidPct =
              inv.grand_total > 0
                ? Math.round((inv.total_paid / inv.grand_total) * 100)
                : 0;
            return (
              <div
                key={inv.id}
                className={`${styles.row} ${statusClass(inv.status)}`}
                onClick={() => router.push(`/invoice/${inv.id}`)}
                onKeyDown={(e) =>
                  e.key === "Enter" && router.push(`/invoice/${inv.id}`)
                }
                role="button"
                tabIndex={0}
              >
                <div className={styles.rowThumb}>
                  <span className={`${styles.rowStatus} ${statusPill(inv.status)}`}>
                    {statusLabel(inv.status)}
                  </span>
                  <i className="ti ti-receipt" aria-hidden="true" />
                  <span className="text-[10px] text-[#5a6a7e] capitalize">
                    {inv.invoice_type || "interiors"}
                  </span>
                </div>
                <div className={styles.rowMid}>
                  <div className={styles.rowName}>{inv.bill_to_name}</div>
                  <div className={styles.rowSub}>
                    {inv.bill_to_email && <span>{inv.bill_to_email}</span>}
                    <span>{inv.bill_to_mobile}</span>
                    <span>{inv.invoice_date}</span>
                  </div>
                  <div className={styles.rowTags}>
                    {inv.bill_to_city && (
                      <span className={styles.tag}>
                        <i className="ti ti-map-pin" /> {inv.bill_to_city}
                      </span>
                    )}
                    {inv.bill_to_gstin && (
                      <span className={styles.tag}>GST {inv.bill_to_gstin}</span>
                    )}
                  </div>
                </div>
                <div
                  className={styles.rowActions}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between text-[11px] text-[#5a6a7e]">
                    <span className="font-semibold">{inv.invoice_number}</span>
                    <span>
                      {inv.status === "paid"
                        ? "✓ Fully paid"
                        : inv.status === "partially_paid"
                          ? `${paidPct}% paid`
                          : inv.status === "draft"
                            ? "Not sent yet"
                            : inv.status}
                    </span>
                  </div>
                  <div
                    className={styles.rowAmount}
                    style={
                      inv.status === "overdue" ? { color: "#dc2626" } : undefined
                    }
                  >
                    {formatINR(inv.grand_total ?? 0)}
                  </div>
                  {inv.balance_due > 0 && inv.status !== "draft" && (
                    <div className="text-[11px] text-right text-[#5a6a7e]">
                      Balance {formatINR(inv.balance_due)}
                    </div>
                  )}
                  <div className="flex gap-1 justify-end flex-wrap">
                    <button
                      type="button"
                      className={`${styles.btnMini} ${styles.btnMiniBlue}`}
                      onClick={() => router.push(`/invoice/${inv.id}`)}
                    >
                      <i className="ti ti-eye" /> View
                    </button>
                    {inv.status !== "draft" && (
                      <button
                        type="button"
                        className={styles.btnMini}
                        onClick={() => downloadPdf(inv.id)}
                      >
                        <i className="ti ti-download" /> PDF
                      </button>
                    )}
                    {hasPermission("invoice_estimator", "delete") && (
                      <button
                        type="button"
                        className={`${styles.btnMini} ${styles.btnMiniDanger}`}
                        onClick={() =>
                          setDeleteTarget({
                            id: inv.id,
                            invoice_number: inv.invoice_number,
                            bill_to_name: inv.bill_to_name,
                          })
                        }
                      >
                        <i className="ti ti-trash" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(deleteTarget)}
        closeModal={() => !deleting && setDeleteTarget(null)}
        title="Delete invoice"
        isCloseRequired={false}
        className="max-w-[420px]"
      >
        <p className="text-[14px] text-[#374151] leading-relaxed">
          Are you sure you want to delete invoice{" "}
          <span className="font-semibold">
            {deleteTarget?.invoice_number || "this invoice"}
          </span>
          {deleteTarget?.bill_to_name ? ` for ${deleteTarget.bill_to_name}` : ""}? This
          action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            className="min-w-[88px] rounded-md border border-[#dde8f5] bg-white px-4 py-2 text-[13px] font-semibold text-[#1f2933]"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            No
          </Button>
          <Button
            type="button"
            className="min-w-[88px] rounded-md bg-[#dc2626] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#b91c1c]"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
