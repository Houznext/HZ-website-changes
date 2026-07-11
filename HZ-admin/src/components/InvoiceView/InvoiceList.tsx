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
  { key: "revised", label: "Revised" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

function statusClass(s: string) {
  if (s === "paid") return styles.rowPaid;
  if (s === "partially_paid") return styles.rowPartial;
  if (s === "overdue") return styles.rowOverdue;
  if (s === "draft") return styles.rowDraft;
  if (s === "revised") return styles.rowRevised;
  return styles.rowSent;
}

function statusPill(s: string) {
  if (s === "paid") return styles.stPaid;
  if (s === "partially_paid") return styles.stPartial;
  if (s === "overdue") return styles.stOverdue;
  if (s === "draft") return styles.stDraft;
  if (s === "revised") return styles.stRevised;
  return styles.stSent;
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    paid: "Paid",
    partially_paid: "Partial",
    overdue: "Overdue",
    draft: "Draft",
    sent: "Sent",
    revised: "Revised",
    cancelled: "Cancelled",
  };
  return map[s] || s;
}

function formatSentDateTime(value?: string | Date | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function InvoiceList() {
  const router = useRouter();
  const session = useSession();
  const { hasPermission } = usePermissionStore();
  const { invoices, stats, total, isLoading, fetchInvoices, fetchStats, downloadPdf, deleteInvoice, reviseInvoice } =
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
  const [editTarget, setEditTarget] = useState<{
    id: string;
    status?: string;
    invoice_number?: string;
    bill_to_name?: string;
  } | null>(null);
  const [revising, setRevising] = useState(false);

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

  const handleConfirmEdit = async () => {
    if (!editTarget) return;
    if (editTarget.status === "sent") {
      setRevising(true);
      try {
        const revised = await reviseInvoice(editTarget.id);
        setEditTarget(null);
        refreshList();
        if (revised?.id) {
          router.push(`/invoice/${revised.id}`);
        }
      } catch {
        /* toast handled in store */
      } finally {
        setRevising(false);
      }
      return;
    }
    const id = editTarget.id;
    setEditTarget(null);
    router.push(`/invoice/${id}`);
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
            const dateLabel = inv.invoice_date
              ? new Date(inv.invoice_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "";
            const payHint =
              inv.status === "paid"
                ? "Fully paid"
                : inv.status === "partially_paid"
                  ? `${paidPct}% paid`
                  : inv.status === "draft"
                    ? "Not sent yet"
                    : inv.balance_due > 0
                      ? `Balance ${formatINR(inv.balance_due)}`
                      : statusLabel(inv.status);

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
                <div className={styles.rowAccent} aria-hidden="true" />

                <div className={styles.rowGrid}>
                  <div className={styles.rowThumb}>
                    <span className={`${styles.rowStatus} ${statusPill(inv.status)}`}>
                      <span className={styles.statusDot} />
                      {statusLabel(inv.status)}
                    </span>
                    <i className="ti ti-receipt" aria-hidden="true" />
                    <span className={styles.rowType}>
                      {inv.invoice_type || "interiors"}
                    </span>
                  </div>

                  <div className={styles.rowBody}>
                    <div className={styles.rowTop}>
                      <div className={styles.rowTopL}>
                        <h3 className={styles.rowName}>{inv.bill_to_name}</h3>
                        <div className={styles.rowSub}>
                          {inv.bill_to_email && (
                            <span className={styles.rowSubItem}>{inv.bill_to_email}</span>
                          )}
                          {inv.bill_to_mobile && (
                            <>
                              {inv.bill_to_email && <span className={styles.dot}>·</span>}
                              <span>{inv.bill_to_mobile}</span>
                            </>
                          )}
                          {dateLabel && (
                            <>
                              <span className={styles.dot}>·</span>
                              <span>{dateLabel}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={styles.rowTopR}>
                        <div
                          className={styles.rowAmount}
                          style={
                            inv.status === "overdue" ? { color: "#dc2626" } : undefined
                          }
                        >
                          {formatINR(inv.grand_total ?? 0)}
                        </div>
                        <div className={styles.rowAmountSub}>{payHint}</div>
                        {inv.invoice_number && (
                          <div className={styles.rowQn}>{inv.invoice_number}</div>
                        )}
                      </div>
                    </div>

                    <div className={styles.rowTags}>
                      {inv.bill_to_city && (
                        <span className={styles.tag}>
                          <i className="ti ti-map-pin" aria-hidden="true" />
                          <strong>{inv.bill_to_city}</strong>
                          {inv.bill_to_state ? `, ${inv.bill_to_state}` : ""}
                        </span>
                      )}
                      {inv.bill_to_gstin && (
                        <span className={styles.tag}>GST {inv.bill_to_gstin}</span>
                      )}
                      {inv.invoice_type && (
                        <span className={`${styles.tag} capitalize`}>
                          {inv.invoice_type}
                        </span>
                      )}
                    </div>

                    <div className={styles.rowProgress}>
                      <div
                        className={styles.rowProgressFill}
                        style={{
                          width: `${
                            inv.status === "paid"
                              ? 100
                              : inv.status === "draft" || inv.status === "revised"
                                ? 8
                                : Math.max(paidPct, 12)
                          }%`,
                        }}
                      />
                    </div>

                    {inv.status === "revised" && (
                      <p className={styles.revisedNote}>
                        This Invoice has been sent on email on{" "}
                        {formatSentDateTime(inv.original_sent_at) || "—"}
                        {inv.original_sent_email
                          ? `, ${inv.original_sent_email}`
                          : ""}
                        . And this is the revised invoice.
                      </p>
                    )}

                    <div
                      className={styles.rowFooter}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.rowFooterL}>
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          onClick={() => router.push(`/invoice/${inv.id}`)}
                        >
                          View details
                        </button>
                        {hasPermission("invoice_estimator", "edit") && (
                          <button
                            type="button"
                            className={styles.btnGhost}
                            title="Edit invoice"
                            onClick={() =>
                              setEditTarget({
                                id: inv.id,
                                status: inv.status,
                                invoice_number: inv.invoice_number,
                                bill_to_name: inv.bill_to_name,
                              })
                            }
                          >
                            <i className="ti ti-pencil" aria-hidden="true" />
                            Edit
                          </button>
                        )}
                      </div>
                      <div className={styles.rowFooterR}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Download PDF"
                          onClick={() => downloadPdf(inv.id)}
                        >
                          <i className="ti ti-download" aria-hidden="true" />
                        </button>
                        {hasPermission("invoice_estimator", "delete") && (
                          <button
                            type="button"
                            className={styles.iconBtnDanger}
                            title="Delete invoice"
                            onClick={() =>
                              setDeleteTarget({
                                id: inv.id,
                                invoice_number: inv.invoice_number,
                                bill_to_name: inv.bill_to_name,
                              })
                            }
                          >
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={Boolean(editTarget)}
        closeModal={() => !revising && setEditTarget(null)}
        title="Edit invoice"
        isCloseRequired={false}
        className="max-w-[420px]"
      >
        <p className="text-[14px] text-[#374151] leading-relaxed">
          {editTarget?.status === "sent" ? (
            <>
              Are you sure you want to edit invoice{" "}
              <span className="font-semibold">
                {editTarget?.invoice_number || "this invoice"}
              </span>
              {editTarget?.bill_to_name ? ` for ${editTarget.bill_to_name}` : ""}?
              The original will stay in Sent, and a new copy will open in Revised.
            </>
          ) : (
            <>
              Are you sure you want to edit invoice{" "}
              <span className="font-semibold">
                {editTarget?.invoice_number || "this invoice"}
              </span>
              {editTarget?.bill_to_name ? ` for ${editTarget.bill_to_name}` : ""}?
            </>
          )}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            className="min-w-[88px] rounded-md border border-[#dde8f5] bg-white px-4 py-2 text-[13px] font-semibold text-[#1f2933]"
            onClick={() => setEditTarget(null)}
            disabled={revising}
          >
            No
          </Button>
          <Button
            type="button"
            className="min-w-[88px] rounded-md bg-[#2f80ed] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1a6dd6]"
            onClick={handleConfirmEdit}
            disabled={revising}
          >
            {revising ? "Creating…" : "Yes, edit"}
          </Button>
        </div>
      </Modal>

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
