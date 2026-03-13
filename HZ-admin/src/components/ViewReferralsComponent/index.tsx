import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";
import BackRoute from "@/src/common/BackRoute";
import Button from "@/src/common/Button";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";
import toast from "react-hot-toast";
import PaginationControls from "@/src/components/CrmView/pagination";
import { MdPeople } from "react-icons/md";
import { ChevronRight } from "lucide-react";
import { FiSearch, FiGrid, FiList } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

const STEPS = [
  "Calling & informing",
  "Site visit & confirmation",
  "Finances",
  "Advance Payment",
  "Registration",
];

enum ReferralCaseStatus {
  OPEN = "OPEN",
  WON = "WON",
  LOST = "LOST",
  CANCELLED = "CANCELLED",
}

const STATUS_CONFIG: Record<ReferralCaseStatus, { bg: string; text: string; dot: string; border: string }> = {
  [ReferralCaseStatus.OPEN]: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  [ReferralCaseStatus.WON]: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  [ReferralCaseStatus.LOST]: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  [ReferralCaseStatus.CANCELLED]: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400", border: "border-gray-200" },
};

function getReferrerDisplayName(referrer: any): string {
  const name =
    `${referrer.firstName || ""} ${referrer.lastName || ""}`.trim() ||
    referrer.fullName ||
    referrer.username ||
    referrer.email;
  return name || "—";
}

function parseReferralCodeDisplay(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "—";
  const t = raw.trim();
  if (/^\d+$/.test(t)) return t;
  try {
    const o = JSON.parse(t);
    if (o && typeof o.referralCode !== "undefined")
      return String(o.referralCode);
  } catch {
    // ignore
  }
  return t.length > 12 ? t.slice(0, 12) + "…" : t;
}

const StatusBadge = ({ status }: { status?: ReferralCaseStatus | string | null }) => {
  const safeStatus =
    status && Object.values(ReferralCaseStatus).includes(status as any)
      ? (status as ReferralCaseStatus)
      : ReferralCaseStatus.OPEN;
  const cfg = STATUS_CONFIG[safeStatus];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {safeStatus}
    </span>
  );
};

const StepProgress = ({ step }: { step: number }) => (
  <div className="flex items-center gap-1">
    {STEPS.map((s, i) => (
      <div
        key={s}
        title={s}
        className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? "bg-[#3586FF]" : "bg-gray-200"}`}
      />
    ))}
  </div>
);

export default function ViewReferralsComponent() {
  const router = useRouter();
  const propertyId = (router.query.id as string) || null;

  const [property, setProperty] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralCaseStatus | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchProperty = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await apiClient.get(`${apiClient.URLS.property}/${id}`);
      setProperty(res.body);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load property");
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.propertyReferral}/referrals`,
        { propertyId, page: currentPage, limit: pageSize },
        true
      );
      if (res.status === 200) {
        const data = res?.body?.data ?? [];
        const total = res?.body?.total ?? 0;
        setReferrals(Array.isArray(data) ? data : []);
        setTotalCount(Number(total) || 0);
      } else {
        setReferrals([]);
        setTotalCount(0);
      }
    } catch (e) {
      console.error(e);
      setReferrals([]);
      setTotalCount(0);
      toast.error("Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, [propertyId, currentPage, pageSize]);

  useEffect(() => {
    if (propertyId) fetchProperty(propertyId);
  }, [propertyId, fetchProperty]);

  useEffect(() => {
    if (propertyId) fetchReferrals();
  }, [fetchReferrals]);

  const filtered = useMemo(() => {
    let list = referrals;
    if (statusFilter !== "ALL") {
      list = list.filter((r) => (r.status || "OPEN") === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.leadName || "").toLowerCase().includes(q) ||
          (r.leadPhone || "").includes(q) ||
          (r.leadEmail || "").toLowerCase().includes(q) ||
          (r.leadCity || "").toLowerCase().includes(q) ||
          (r.referrer ? getReferrerDisplayName(r.referrer) : "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [referrals, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: referrals.length };
    Object.values(ReferralCaseStatus).forEach((s) => { counts[s] = 0; });
    referrals.forEach((r) => { counts[r.status || "OPEN"] = (counts[r.status || "OPEN"] || 0) + 1; });
    return counts;
  }, [referrals]);

  const totalPages = Math.ceil((totalCount || 0) / pageSize) || 1;
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

  const propertyName =
    property?.propertyDetails?.propertyName ?? property?.propertyName ?? "—";
  const locality = property?.locationDetails?.locality ?? "—";
  const city = property?.locationDetails?.city ?? "—";
  const purpose = property?.basicDetails?.purpose ?? "";
  const lookingType = property?.basicDetails?.lookingType ?? "";

  const formatDate = (d: string | Date | null | undefined) =>
    d
      ? new Date(d).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
      : "—";

  const csvHeaders = [
    { label: "Lead Name", key: "leadName" },
    { label: "Phone", key: "leadPhone" },
    { label: "Email", key: "leadEmail" },
    { label: "City", key: "leadCity" },
    { label: "Requirement", key: "requirementNote" },
    { label: "Status", key: "status" },
    { label: "Referrer", key: "referrerName" },
    { label: "Referrer Email", key: "referrerEmail" },
    { label: "Referred At", key: "createdAtFormatted" },
    { label: "Referral Code", key: "referralCode" },
    { label: "Step", key: "currentStep" },
  ];
  const csvData = referrals.map((r) => ({
    ...r,
    referrerName: r.referrer ? getReferrerDisplayName(r.referrer) : "-",
    referrerEmail: r.referrer?.email ?? "-",
    createdAtFormatted: formatDate(r.createdAt),
    referralCode: parseReferralCodeDisplay(r.referralCode),
  }));

  const navigateToLead = (leadId: string) =>
    router.push(`/property/${propertyId}/referrals/${leadId}`);

  if (!propertyId) {
    return (
      <div className="w-full p-4 md:p-6">
        <BackRoute />
        <p className="text-gray-500 mt-4">No property selected.</p>
      </div>
    );
  }

  if (!property && !loading) {
    return (
      <div className="w-full p-4 md:p-6">
        <BackRoute />
        <p className="text-gray-500 mt-4">Property not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="max-w-8xl mx-auto">
        <BackRoute />

        {/* Property summary */}
        <div className="mt-4 p-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MdPeople className="text-lg" />
                <span className="text-xs font-medium uppercase tracking-wide">Property</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{propertyName}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {purpose && lookingType ? `${purpose} · ${lookingType}` : purpose || lookingType || "—"}
                {locality && city && ` · ${locality}, ${city}`}
              </p>
            </div>
            <span className="hidden md:inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-mono text-gray-500">
              {propertyId?.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-800">
              Referrals
              <span className="ml-2 text-sm font-normal text-gray-400">
                {totalCount} total{filtered.length !== referrals.length && ` · ${filtered.length} shown`}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-[#3586FF]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-[#3586FF]" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
              {totalCount > 0 && (
                <CSVLink
                  data={csvData}
                  headers={csvHeaders}
                  filename={`Referrals_${propertyName.replace(/\s+/g, "_")}.csv`}
                >
                  <Button className="px-3 py-1.5 bg-[#3586FF] hover:bg-blue-600 text-white rounded-lg flex items-center gap-1.5 text-sm font-medium">
                    <LuDownload className="w-3.5 h-3.5" />
                    Export
                  </Button>
                </CSVLink>
              )}
            </div>
          </div>

          {/* Search + Status filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, phone, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3586FF]/20 focus:border-[#3586FF] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoClose className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["ALL", ...Object.values(ReferralCaseStatus)] as const).map((s) => {
                const active = statusFilter === s;
                const count = statusCounts[s] || 0;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${active
                      ? "bg-[#3586FF] text-white border-[#3586FF] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                    <span className={`ml-1.5 ${active ? "text-blue-200" : "text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader /></div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <MdPeople className="text-2xl text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700">
              {referrals.length > 0 ? "No matching referrals" : "No referrals yet"}
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {referrals.length > 0
                ? "Try adjusting your search or filters."
                : "Referrals for this property will appear here when users submit them."}
            </p>
            {(search || statusFilter !== "ALL") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                className="mt-4 text-sm text-[#3586FF] font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((lead: any, index: number) => (
              <div
                key={lead.id ?? index}
                role="button"
                tabIndex={0}
                onClick={() => navigateToLead(lead.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToLead(lead.id); } }}
                className="group flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#3586FF]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3586FF] focus:ring-offset-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{lead.leadName || "—"}</h3>
                    {lead.leadCity && <p className="text-xs text-gray-400 mt-0.5">{lead.leadCity}</p>}
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-300 transition group-hover:text-[#3586FF] group-hover:translate-x-0.5" />
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                  {lead.leadPhone && <p className="truncate text-xs">
                    <span className="text-gray-400 w-4 inline-block">P</span> {lead.leadPhone}
                  </p>}
                  {lead.leadEmail && <p className="truncate text-xs">
                    <span className="text-gray-400 w-4 inline-block">E</span> {lead.leadEmail}
                  </p>}
                  {lead.requirementNote && (
                    <p className="line-clamp-2 text-xs text-gray-400 mt-1" title={lead.requirementNote}>
                      {lead.requirementNote}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-3">
                  <StepProgress step={lead.currentStep || 0} />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Step {lead.currentStep || 0}/{STEPS.length} · {STEPS[Math.min((lead.currentStep || 1) - 1, STEPS.length - 1)]}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                  <StatusBadge status={lead.status} />
                  <span className="text-[10px] text-gray-400">{formatDate(lead.createdAt)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="truncate">
                    by {lead.referrer ? getReferrerDisplayName(lead.referrer) : "—"}
                  </span>
                  <span className="font-mono text-gray-500 flex-shrink-0">
                    #{parseReferralCodeDisplay(lead.referralCode)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px_120px_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Lead</span>
              <span>Phone</span>
              <span>Status</span>
              <span>Progress</span>
              <span>Referrer</span>
              <span className="text-right">Date</span>
            </div>
            {filtered.map((lead: any, index: number) => (
              <div
                key={lead.id ?? index}
                role="button"
                tabIndex={0}
                onClick={() => navigateToLead(lead.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateToLead(lead.id); } }}
                className="group cursor-pointer grid grid-cols-1 md:grid-cols-[1fr_120px_100px_140px_120px_80px] gap-2 md:gap-4 items-center px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 transition-colors focus:outline-none focus:bg-blue-50/40"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#3586FF] transition-colors">
                    {lead.leadName || "—"}
                  </p>
                  {lead.leadEmail && <p className="text-xs text-gray-400 truncate">{lead.leadEmail}</p>}
                </div>
                <p className="text-sm text-gray-600 truncate">{lead.leadPhone || "—"}</p>
                <div><StatusBadge status={lead.status} /></div>
                <div>
                  <StepProgress step={lead.currentStep || 0} />
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {lead.currentStep || 0}/{STEPS.length}
                  </p>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {lead.referrer ? getReferrerDisplayName(lead.referrer) : "—"}
                </p>
                <p className="text-xs text-gray-400 text-right whitespace-nowrap">
                  {formatDate(lead.createdAt).split(",")[0]}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{from}–{to}</span> of{" "}
              <span className="font-medium text-gray-700">{totalCount}</span>
            </p>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
              pageSize={pageSize}
            />
          </div>
        )}
      </div>
    </div>
  );
}
