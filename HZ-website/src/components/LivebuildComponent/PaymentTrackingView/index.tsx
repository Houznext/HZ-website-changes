import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  CreditCard,
  Calendar,
  FileText,
  User,
  Search,
  ArrowUpDown,
} from "lucide-react";
import Button from "@/common/Button";
import Loader from "@/components/Loader";
import RouterBack from "../RouterBack";
import { useCustomBuilderStore, PaymentStatus } from "@/store/useCustomBuilderStore ";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  Partial: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  Refunded: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
};

const SummaryCard = ({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-[11px] md:text-[13px] font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className={`md:text-2xl text-lg font-bold mt-1 ${color}`}>{value}</p>
        {subtext && (
          <p className="text-gray-400 text-[10px] md:text-[12px] mt-0.5">{subtext}</p>
        )}
      </div>
      <div className={`p-2 rounded-lg ${color.replace("text-", "bg-")}/10`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status] || statusConfig.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-[12px] font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};

export default function PaymentTrackingView() {
  const router = useRouter();
  const customBuilderId = router?.query?.id as string;

  const {
    data: customBuilder,
    fetchData,
    isLoading,
    payments,
    paymentSummary,
    paymentsLoading,
    fetchPayments,
  } = useCustomBuilderStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (customBuilderId) {
      fetchData(customBuilderId);
      fetchPayments(customBuilderId);
    }
  }, [customBuilderId]); // eslint-disable-line

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.description || "").toLowerCase().includes(q) ||
          (p.phaseName || "").toLowerCase().includes(q) ||
          (p.referenceNumber || "").toLowerCase().includes(q) ||
          (p.paymentType || "").toLowerCase().includes(q) ||
          String(p.amount).includes(q)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "amount") {
        return sortDir === "desc"
          ? Number(b.amount) - Number(a.amount)
          : Number(a.amount) - Number(b.amount);
      }
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortDir === "desc" ? db - da : da - db;
    });

    return filtered;
  }, [payments, search, statusFilter, sortBy, sortDir]);

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const fmt = (n: number) =>
    `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

  if (isLoading && !customBuilder) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full md:p-5 p-3">
      <div className="px-2 py-4">
        <RouterBack />
      </div>

      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="text-[#3586FF] md:w-6 w-4 md:h-6 h-4" />
        <h1 className="font-bold md:text-[24px] text-[16px]">
          Payment Tracking
        </h1>
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────── */}
      {paymentSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <SummaryCard
            icon={<DollarSign className="w-5 h-5 text-[#3586FF]" />}
            label="Total Amount"
            value={fmt(paymentSummary.totalAmount)}
            subtext={`${paymentSummary.totalPayments} payment${paymentSummary.totalPayments !== 1 ? "s" : ""}`}
            color="text-[#3586FF]"
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            label="Paid"
            value={fmt(paymentSummary.paidAmount)}
            subtext={paymentSummary.totalAmount > 0 ? `${Math.round((paymentSummary.paidAmount / paymentSummary.totalAmount) * 100)}% of total` : undefined}
            color="text-green-600"
          />
          <SummaryCard
            icon={<Clock className="w-5 h-5 text-yellow-600" />}
            label="Pending"
            value={fmt(paymentSummary.pendingAmount)}
            color="text-yellow-600"
          />
          <SummaryCard
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
            label="Overdue"
            value={String(paymentSummary.overdueCount)}
            subtext="payments overdue"
            color="text-red-600"
          />
        </div>
      )}

      {/* ─── Filters ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[12px] md:text-[14px] outline-none focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF]/20 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "Pending", "Completed", "Overdue", "Partial", "Refunded"].map(
              (s) => (
                <Button
                  key={s}
                  onClick={() => setStatusFilter(s === "All" ? null : s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium border transition ${
                    (s === "All" && !statusFilter) || statusFilter === s
                      ? "bg-[#3586FF] text-white border-[#3586FF]"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </Button>
              )
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              onClick={() => toggleSort("date")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium border transition ${
                sortBy === "date"
                  ? "bg-gray-100 border-gray-300 text-gray-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <Calendar className="w-3 h-3" /> Date
              {sortBy === "date" && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </Button>
            <Button
              onClick={() => toggleSort("amount")}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] md:text-[12px] font-medium border transition ${
                sortBy === "amount"
                  ? "bg-gray-100 border-gray-300 text-gray-800"
                  : "bg-white border-gray-200 text-gray-500"
              }`}
            >
              <DollarSign className="w-3 h-3" /> Amount
              {sortBy === "amount" && (
                <ArrowUpDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Payment List ─────────────────────────────────────────── */}
      {paymentsLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-12 text-center">
          <Receipt className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-gray-700 font-semibold md:text-lg">
            No payments found
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {search || statusFilter
              ? "Try adjusting your filters"
              : "Payment records will appear here once added"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3586FF]/10 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-[#3586FF]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 md:text-[15px] text-[13px]">
                      {payment.description || payment.paymentType}
                    </p>
                    <p className="text-gray-400 text-[10px] md:text-[12px]">
                      {payment.phaseName ? `Phase: ${payment.phaseName}` : payment.paymentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={payment.status} />
                  <span className="font-bold md:text-lg text-[15px] text-gray-900">
                    {fmt(payment.amount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-[10px] md:text-[12px]">
                {payment.paymentMethod && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span>{payment.paymentMethod}</span>
                  </div>
                )}
                {payment.paymentDate && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Paid: {new Date(payment.paymentDate).toLocaleDateString()}</span>
                  </div>
                )}
                {payment.dueDate && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Due: {new Date(payment.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {payment.referenceNumber && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    <span>Ref: {payment.referenceNumber}</span>
                  </div>
                )}
                {payment.receivedBy && (
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>{payment.receivedBy}</span>
                  </div>
                )}
              </div>

              {payment.notes && (
                <p className="mt-2 text-gray-400 text-[10px] md:text-[12px] italic border-t border-gray-50 pt-2">
                  {payment.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
