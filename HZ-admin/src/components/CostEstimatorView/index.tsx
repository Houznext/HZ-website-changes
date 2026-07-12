import React, { useEffect, useMemo, useState, useRef } from "react";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import Loader from "@/src/common/Loader";
import apiClient from "@/src/utils/apiClient";
import toast, { LoaderIcon } from "react-hot-toast";
import { useSession } from "next-auth/react";
import CostEstimationCard from "./CostEstimationCard";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import CostEstimatorForm from "./CostEstimatorForm";
import { CostEstimator } from "./helper";
import { useRouter } from "next/router";
import {
  Download,
  LayoutGrid,
  Rows,
  ArrowUpDown,
  Plus,
  Calculator,
  Eye,
  FileDown,
  Copy,
} from "lucide-react";
import { useCostEstimatorStore } from "@/src/stores/costEstimatorstrore";
import PaginationControls from "../CrmView/pagination";
import { FiHome, FiSun, FiPenTool } from "react-icons/fi";

export interface CEcardProps {
  key?: number;
  data: CostEstimator;
  onDuplicate: (data: CostEstimator) => void;
  onEdit: (data: CostEstimator) => void;
  onDelete: (id: string | number) => Promise<void>;
  activeTab: string;
}
/* ---------------- Types ---------------- */
type FiltersState = {
  bhkTypeData: Record<string, boolean>;
  DateData: Record<string, boolean>;
  DesignedData: Record<string, boolean>;
  stateData: Record<string, boolean>;
};

// Phase-1: Only Interiors; Custom Builder and Solar hidden
const TABS = [{ key: "Interior", label: "Interiors" }];

const CostEstimatorView: React.FC = () => {
  const router = useRouter();
  const { hasPermission } = usePermissionStore((s) => s);

  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [openModal, setOpenModal] = useState(false);
  const [editingEstimation, setEditingEstimation] =
    useState<CostEstimator | null>(null);
  const {
    costEstimators,
    setCostEstimators,
    isLoading,
    fetchCostEstimators,
    activeTab,
    setActiveTab,
    total,
    statusFilter,
    setStatusFilter,
  } = useCostEstimatorStore();

  console.log("costEstimators", costEstimators);

  const [view, setView] = useState<"cards" | "compact">("cards");
  const [sort, setSort] = useState<"recent" | "name" | "total">("recent");
  const [query, setQuery] = useState("");
  const searchTimer = useRef<number | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const STATUS_FILTER_CARDS = [
    {
      key: "all" as const,
      label: "All",
      activeCls: "border-[#2f80ed] bg-[#eaf1fd] text-[#2f80ed]",
    },
    {
      key: "draft" as const,
      label: "Drafts",
      activeCls: "border-amber-400 bg-amber-50 text-amber-700",
    },
    {
      key: "revised" as const,
      label: "Revised",
      activeCls: "border-violet-400 bg-violet-50 text-violet-700",
    },
  ];

  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    bhkTypeData: {},
    DateData: {},
    DesignedData: {},
    stateData: {},
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [bhkTypeOptions, setBhkTypeOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [designerOptions, setDesignerOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [dateOptions, setDateOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [stateOptions, setStateOptions] = useState<
    { id: string; label: string }[]
  >([]);
  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (router.query?.category && typeof router.query.category === "string") {
      setActiveTab(router.query.category);
    }
  }, [router.query?.category]);

  // Fetch on auth / tab / pagination / status filter change
  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchCostEstimators(
        userId,
        activeTab,
        currentPage,
        pageSize,
        statusFilter,
      );
    }
  }, [status, userId, activeTab, currentPage, pageSize, statusFilter]);

  // Build filter option sets whenever data changes
  useEffect(() => {
    if (!Array.isArray(costEstimators) || !costEstimators.length) {
      setBhkTypeOptions([]);
      setDesignerOptions([]);
      setStateOptions([]);
      setDateOptions([]);
      return;
    }

    const uniq = (arr: (string | number | undefined | null)[]) =>
      Array.from(new Set(arr.filter(Boolean) as (string | number)[])).map(
        String,
      );

    // BHK
    setBhkTypeOptions(
      uniq(costEstimators.map((e) => e.bhk?.trim())).map((v) => ({
        id: v,
        label: v,
      })),
    );

    // Designer
    setDesignerOptions(
      uniq(costEstimators.map((e) => e.designerName?.trim())).map((v) => ({
        id: v,
        label: v
          .split(/(?=[A-Z])/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      })),
    );

    // State
    const states = uniq(
      costEstimators.map((e) => e?.location?.state?.trim()?.toLowerCase()),
    );
    setStateOptions(
      states.map((s) => ({
        id: s,
        label: s
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      })),
    );

    setDateOptions(
      uniq(costEstimators.map((e) => e.date?.trim())).map((d) => ({
        id: d,
        label: new Date(d).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      })),
    );
  }, [costEstimators]);

  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(
      () => setDebouncedQuery(query.trim()),
      300,
    );
  }, [query]);
  /* ---------------- Data ---------------- */

  /* ---------------- Helpers ---------------- */
  const isEmpty = (filters?: Record<string, boolean> | null) =>
    !filters ||
    Object.keys(filters).length === 0 ||
    Object.values(filters).every((val) => !val);

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();

    const out = Array.isArray(costEstimators)
      ? costEstimators?.filter((e) => {
          // Search
          const matchQ =
            !q ||
            e.firstname?.toLowerCase().includes(q) ||
            e.lastname?.toLowerCase().includes(q) ||
            e.email?.toLowerCase().includes(q) ||
            String((e as any).customerMobile || "").includes(q) ||
            String(e.phone || "").includes(q) ||
            e.property_name?.toLowerCase().includes(q) ||
            e.location?.city?.toLowerCase().includes(q);

          // Filters
          const bhkMatch =
            isEmpty(selectedFilters.bhkTypeData) ||
            selectedFilters.bhkTypeData[e.bhk];
          const dateMatch =
            isEmpty(selectedFilters.DateData) ||
            selectedFilters.DateData[e.date];
          const designerMatch =
            isEmpty(selectedFilters.DesignedData) ||
            selectedFilters.DesignedData[e.designerName?.trim() || ""];
          const stateMatch =
            isEmpty(selectedFilters.stateData) ||
            selectedFilters.stateData[
              e?.location?.state?.trim()?.toLowerCase() || ""
            ];
          return (
            matchQ &&
            bhkMatch &&
            dateMatch &&
            designerMatch &&
            stateMatch
          );
        })
      : [];

    // Sorting
    if (sort === "name") {
      out.sort((a, b) => (a.firstname || "").localeCompare(b.firstname || ""));
    } else if (sort === "total") {
      out.sort((a, b) => {
        const ta = (Number(a.subTotal) || 0) - (Number(a.discount) || 0);
        const tb = (Number(b.subTotal) || 0) - (Number(b.discount) || 0);
        return tb - ta;
      });
    } else {
      out.sort((a, b) => (b?.id || 0) - (a?.id || 0));
    }

    return out;
  }, [costEstimators, debouncedQuery, selectedFilters, sort]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginatedData = useMemo(() => filtered, [filtered]);
  const refetchList = () => {
    if (userId)
      fetchCostEstimators(
        userId,
        activeTab,
        currentPage,
        pageSize,
        statusFilter,
      );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedFilters, activeTab, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const exportCSV = () => {
    if (!paginatedData.length) {
      toast("Nothing to export");
      return;
    }
    const header = [
      "First Name",
      "Last Name",
      "Email",
      "User Contact",
      "Phone",
      "City",
      "State",
      "BHK",
      "Date",
      "Sub Total",
      "Discount",
      "Total",
      "Designer",
      "Category",
    ];

    const rows = paginatedData.map((e) => [
      e.firstname || "",
      e.lastname || "",
      e.email || "",
      (e as any).customerMobile || "",
      e.phone || "",
      e.location?.city || "",
      e.location?.state || "",
      e.bhk || "",
      e.date || "",
      Number(e.subTotal) || 0,
      Number(e.discount) || 0,
      (Number(e.subTotal) || 0) - (Number(e.discount) || 0),
      e.designerName || "",
      activeTab,
    ]);

    const csv =
      [header, ...rows]
        .map((r) =>
          r
            .map((v) => {
              const s = String(v ?? "");
              return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            })
            .join(","),
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `estimations_${activeTab}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  const closeDrawer = () => {
    setOpenModal(false);
    setEditingEstimation(null);
  };

  const handleEditProxy = async (estimation: CostEstimator) => {
    // The list response omits itemGroups — fetch the full record first so the
    // form can pre-populate the existing item table correctly.
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.cost_estimator}/${estimation.id}`,
        {},
        true
      );
      if (response.status === 200) {
        setEditingEstimation(response.body);
      } else {
        setEditingEstimation(estimation);
      }
    } catch (err) {
      console.error("Failed to fetch full estimation for edit:", err);
      setEditingEstimation(estimation); // fallback — form opens without item table
    }
    setOpenModal(true);
  };

  const handleDeleteProxy = async (id: string | number) => {
    try {
      const response = await apiClient.delete(
        `${apiClient.URLS.cost_estimator}/${id}`,
        { userId },
      );
      if (response.status === 200) {
        toast.success("Quotation deleted");
        const nextPage =
          paginatedData.length === 1 && currentPage > 1
            ? currentPage - 1
            : currentPage;
        if (nextPage !== currentPage) {
          setCurrentPage(nextPage);
        } else if (userId) {
          await fetchCostEstimators(
            userId,
            activeTab,
            currentPage,
            pageSize,
            statusFilter,
          );
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete quotation");
      throw error;
    }
  };

  const tabIcons: Record<string, React.ReactNode> = {
    Interior: <FiPenTool className="w-3.5 h-3.5" />,
    CustomBuilder: <FiHome className="w-3.5 h-3.5" />,
    Solar: <FiSun className="w-3.5 h-3.5" />,
  };

  // Stat computations
  const totalValue = filtered.reduce(
    (s, e) => (Number(e.subTotal) || 0) - (Number(e.discount) || 0) + s,
    0,
  );
  const avgValue = filtered.length > 0 ? totalValue / filtered.length : 0;

  if (isLoading) return <Loader />;

  return (
    <div className="w-full max-w-full bg-[#f6f8fa] min-h-full">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-5 pt-5 pb-0 mb-4 gap-3">
        <div>
          <h1 className="text-[18px] font-bold text-[#24292f] tracking-tight">
            Quotations
          </h1>
          <p className="text-[12px] text-[#8c959f] mt-0.5">
            {total} quotation{total !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category tabs */}
          <div className="flex border border-[#d0d7de] rounded-lg overflow-hidden text-[12px] font-semibold bg-white">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  router.push(
                    {
                      pathname: router.pathname,
                      query: { ...router.query, category: t.key },
                    },
                    undefined,
                    { shallow: true },
                  );
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  activeTab === t.key
                    ? "bg-[#2f80ed] text-white"
                    : "text-[#57606a] hover:bg-[#f6f8fa]"
                }`}
              >
                {tabIcons[t.key]}
                {t.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#d0d7de] rounded-lg
                       bg-white text-[#57606a] hover:text-[#24292f] hover:bg-[#f6f8fa] text-[12px] font-medium
                       transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* New Quotation */}
          <CustomTooltip
            label="Access Restricted"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[10px] font-medium"
            showTooltip={!hasPermission("cost_estimator", "create")}
          >
            <button
              onClick={() => setOpenModal(true)}
              disabled={!hasPermission("cost_estimator", "create")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2f80ed] hover:bg-[#1a6dd6]
                         text-white text-[12px] font-semibold
                         shadow-[0_1px_3px_rgba(47,128,237,0.3)] hover:shadow-[0_4px_12px_rgba(47,128,237,0.4)]
                         hover:-translate-y-px transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Plus className="w-3.5 h-3.5" />
              New Quotation
            </button>
          </CustomTooltip>
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 mb-4">
        {/* Total count */}
        <div className="bg-white border border-[#eaeef2] rounded-[10px] p-3.5 hover:border-[#d0d7de] hover:-translate-y-px transition-all duration-150">
          <div className="text-[10.5px] font-semibold text-[#8c959f] uppercase tracking-wider mb-1.5">
            Total
          </div>
          <div className="text-[22px] font-bold text-[#24292f] tracking-tight">
            {total}
          </div>
          <div className="text-[11px] text-[#8c959f] mt-1">quotations</div>
        </div>

        {/* Total value */}
        <div className="bg-white border border-[#eaeef2] rounded-[10px] p-3.5 hover:border-[#d0d7de] hover:-translate-y-px transition-all duration-150">
          <div className="text-[10.5px] font-semibold text-[#8c959f] uppercase tracking-wider mb-1.5">
            Total value
          </div>
          <div className="text-[22px] font-bold text-[#2f80ed] tracking-tight">
            ₹{(totalValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-[#8c959f] mt-1">
            across all quotations
          </div>
        </div>

        {/* Average */}
        <div className="bg-white border border-[#eaeef2] rounded-[10px] p-3.5 hover:border-[#d0d7de] hover:-translate-y-px transition-all duration-150">
          <div className="text-[10.5px] font-semibold text-[#8c959f] uppercase tracking-wider mb-1.5">
            Average
          </div>
          <div className="text-[22px] font-bold text-[#24292f] tracking-tight">
            ₹{(avgValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-[#8c959f] mt-1">per quotation</div>
        </div>

        {/* Category */}
        <div className="bg-white border border-[#eaeef2] rounded-[10px] p-3.5 hover:border-[#d0d7de] hover:-translate-y-px transition-all duration-150">
          <div className="text-[10.5px] font-semibold text-[#8c959f] uppercase tracking-wider mb-1.5">
            Category
          </div>
          <div className="text-[22px] font-bold text-[#24292f] tracking-tight capitalize">
            {activeTab}
          </div>
          <div className="text-[11px] text-[#8c959f] mt-1">active filter</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="mx-5 mb-4 bg-white border border-[#eaeef2] rounded-[10px] px-4 py-3 overflow-visible relative z-20">
        <div className="flex flex-nowrap items-center gap-2 overflow-visible w-full">
          <div className="flex-1 min-w-[200px]">
            <ReusableSearchFilter
              searchText={query}
              placeholder="Search quotations..."
              onSearchChange={setQuery}
              filters={[
                {
                  groupLabel: "BHK Type",
                  key: "bhkTypeData",
                  options: bhkTypeOptions,
                },
                {
                  groupLabel: "Designer",
                  key: "DesignedData",
                  options: designerOptions,
                },
                {
                  groupLabel: "State",
                  key: "stateData",
                  options: stateOptions,
                },
                { groupLabel: "Date", key: "DateData", options: dateOptions },
              ]}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
              rootCls="md:mb-0 relative z-30 !w-full"
            />
          </div>

          <div className="flex items-center gap-2 flex-none">
            {STATUS_FILTER_CARDS.map((card) => {
              const active = statusFilter === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setStatusFilter(card.key)}
                  className={`h-9 px-3 rounded-[8px] border text-[12.5px] font-semibold
                    transition-all duration-150 whitespace-nowrap
                    ${
                      active
                        ? card.activeCls
                        : "border-[#d0d7de] bg-white text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#24292f]"
                    }`}
                >
                  {card.label}
                </button>
              );
            })}

            {/* Sort */}
            <button
              className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] border border-[#d0d7de]
                         bg-white hover:bg-[#f6f8fa] text-[12px] font-medium text-[#57606a]
                         hover:text-[#24292f] transition-all whitespace-nowrap"
              onClick={() =>
                setSort((s) =>
                  s === "recent" ? "name" : s === "name" ? "total" : "recent",
                )
              }
              title={`Sort: ${sort}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8c959f]" />
              Sort:{" "}
              <span className="capitalize text-[#24292f] font-semibold">
                {sort}
              </span>
            </button>

            {/* View toggle */}
            <div className="flex h-9 border border-[#d0d7de] rounded-lg overflow-hidden">
              <button
                onClick={() => setView("cards")}
                className={`px-2.5 flex items-center justify-center transition-colors ${
                  view === "cards"
                    ? "bg-[#2f80ed] text-white"
                    : "bg-white text-[#8c959f] hover:bg-[#f6f8fa]"
                }`}
                title="Cards view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView("compact")}
                className={`px-2.5 flex items-center justify-center transition-colors ${
                  view === "compact"
                    ? "bg-[#2f80ed] text-white"
                    : "bg-white text-[#8c959f] hover:bg-[#f6f8fa]"
                }`}
                title="Compact view"
              >
                <Rows className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export */}
            <button
              className="flex items-center gap-1.5 h-9 px-3 rounded-[8px] bg-[#2f80ed] hover:bg-[#1a6dd6]
                         text-white text-[12px] font-semibold
                         shadow-[0_1px_3px_rgba(47,128,237,0.3)] transition-all whitespace-nowrap"
              onClick={exportCSV}
              title="Export filtered list"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {paginatedData?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 mx-5 bg-white rounded-[10px] border border-[#eaeef2]">
          <div className="w-12 h-12 rounded-[12px] bg-[#f6f8fa] border border-[#eaeef2] flex items-center justify-center mb-3">
            <Calculator className="w-6 h-6 text-[#8c959f]" />
          </div>
          <h3 className="text-[14px] font-semibold text-[#57606a] mb-1">
            No quotations found
          </h3>
          <p className="text-[12px] text-[#8c959f]">
            No{" "}
            {statusFilter === "draft"
              ? "draft"
              : statusFilter === "revised"
                ? "revised"
                : activeTab}{" "}
            quotations match your search criteria
          </p>
        </div>
      )}

      {/* ── List / compact ── */}
      {paginatedData?.length > 0 &&
        (view === "compact" ? (
          <div className="mx-5 bg-white rounded-[10px] border border-[#eaeef2] overflow-hidden">
            <div className="divide-y divide-[#eaeef2]">
              {paginatedData?.map((e) => (
                <CompactRow
                  key={e.id}
                  item={e}
                  activeTab={activeTab}
                  onDuplicate={async (d) => {
                    try {
                      await handleDuplicateProxy(d);
                      await fetchCostEstimators(
                        userId!,
                        activeTab,
                        currentPage,
                        pageSize,
                        statusFilter,
                      );
                    } catch {}
                  }}
                  onEdit={handleEditProxy}
                  onDelete={handleDeleteProxy}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-2 pb-4">
            {paginatedData.map((item, idx) => (
              <CostEstimationCard
                key={idx}
                data={item}
                activeTab={activeTab}
                onDuplicate={async (d) => {
                  try {
                    await handleDuplicateProxy(d);
                    await fetchCostEstimators(
                      userId!,
                      activeTab,
                      currentPage,
                      pageSize,
                      statusFilter,
                    );
                  } catch {}
                }}
                onEdit={handleEditProxy}
                onDelete={handleDeleteProxy}
              />
            ))}
          </div>
        ))}

      {/* ── Pagination ── */}
      {total > 0 && (
        <div className="mx-5 mb-6 bg-white border border-[#eaeef2] rounded-[10px] px-4 py-3">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* ── Form Modal — 100% unchanged ── */}
      <Modal
        isOpen={openModal}
        closeModal={closeDrawer}
        isCloseRequired={false}
        rootCls="z-[200]"
        className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_rgba(15,42,68,0.35)] rounded-2xl p-0 w-full max-w-5xl mx-auto"
        title=""
      >
        <div className="p-4 sm:p-6">
          <CostEstimatorForm
            closeDrawer={closeDrawer}
            setCostEstimators={setCostEstimators}
            setEditingEstimation={setEditingEstimation}
            editingEstimation={editingEstimation}
            userId={userId}
            category={activeTab}
            onSuccessRefetch={refetchList}
          />
        </div>
      </Modal>
    </div>
  );

  async function handleDuplicateProxy(data: CostEstimator) {
    try {
      const fullData =
        data?.itemGroups && data?.itemGroups.length > 0
          ? data
          : (await apiClient.get(`${apiClient.URLS.cost_estimator}/${data.id}`))
              .body;

      const { id, postedBy, itemGroups = [], discount, quotationNumber, ...rest } =
        fullData;

      const phone =
        typeof fullData.phone === "string" || typeof fullData.phone === "number"
          ? Number(fullData.phone)
          : 0;

      const subTotal =
        typeof fullData.subTotal === "string" ||
        typeof fullData.subTotal === "number"
          ? Number(fullData.subTotal)
          : 0;

      const formattedItemGroups = itemGroups.map(
        (group: any, index: number) => ({
          order: index + 1,
          title: group.title || "",
          items: (group.items || []).map((item: any, i: number) => ({
            id: Date.now() + index * 100 + i,
            item_name: item.item_name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
            area: item.area,
          })),
        }),
      );

      const payload = {
        ...rest,
        itemGroups: formattedItemGroups,
        discount: discount.toString(),
        userId,
        phone,
        subTotal,
        category: activeTab,
        date: new Date().toISOString(),
        status: "draft",
      };

      const response = await apiClient.post(
        apiClient.URLS.cost_estimator,
        payload,
        true,
      );
      if (response.status === 201) {
        toast.success("Successfully duplicated estimation");
        setCostEstimators([response.body, ...costEstimators]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create estimation details");
      throw error;
    }
  }
};

export default CostEstimatorView;

/* ---------------- Compact Row ── */
const CompactRow = ({
  item,
  activeTab,
  onDuplicate,
  onEdit,
  onDelete,
}: {
  item: CostEstimator;
  activeTab: string;
  onDuplicate: (data: CostEstimator) => Promise<void>;
  onEdit: (data: CostEstimator) => void;
  onDelete: (id: string | number) => Promise<void>;
}) => {
  const router = useRouter();
  const { hasPermission } = usePermissionStore((s) => s);
  const total = (Number(item.subTotal) || 0) - (Number(item.discount) || 0);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onDuplicate(item);
      setDuplicateModal(false);
    } catch {
      toast.error("Failed to duplicate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
      setDeleteModal(false);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayQN = (item as any)?.quotationNumber
    ? `QT-${String((item as any).quotationNumber).padStart(4, "0")}`
    : (item as any)?.displayQuotationNumber ?? null;

  return (
    <div className="px-4 py-3.5 flex flex-col md:flex-row md:items-center gap-3
                    hover:bg-[#fafbfc] transition-colors">
      {/* Left: avatar + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-[10px] bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
          <span className="text-[#2f80ed] font-bold text-[13px]">
            {item.firstname?.charAt(0)}{item.lastname?.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <span className="text-[13.5px] font-semibold text-[#24292f] truncate">
              {item.firstname} {item.lastname}
            </span>
            {displayQN && (
              <span className="text-[10px] font-mono text-[#8c959f] bg-[#f6f8fa] border border-[#eaeef2] px-1.5 py-0.5 rounded-[5px]">
                {displayQN}
              </span>
            )}
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                (item as any)?.status === "draft"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : (item as any)?.status === "revised"
                    ? "bg-violet-50 text-violet-700 border-violet-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {(item as any)?.status === "draft"
                ? "Draft"
                : (item as any)?.status === "revised"
                  ? "Revised"
                  : "Confirmed"}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f6f8fa] border border-[#eaeef2] text-[#57606a]">
              {new Date(item.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            {(item as any)?.customerMobile && (
              <span className="text-[12px] text-[#57606a]">
                User: {(item as any).customerMobile}
              </span>
            )}
            <span className="text-[12px] text-[#57606a]">
              {item.location?.city}{item.location?.state ? `, ${item.location.state}` : ""}
            </span>
            {item.bhk && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#2f80ed] font-medium border border-[#93c5fd]">
                {item.bhk}
              </span>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="text-right flex-shrink-0 ml-2">
          <span className="text-[14px] font-bold text-[#2f80ed] tabular-nums">
            ₹{total.toLocaleString("en-IN")}
          </span>
          {Number(item.discount) > 0 && (
            <p className="text-[10.5px] text-[#16a34a]">
              −₹{Number(item.discount).toLocaleString("en-IN")} off
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* View */}
        <button
          onClick={() => router.push(`/cost-estimator/${activeTab}/${item.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                     bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[12px] font-semibold
                     shadow-[0_1px_3px_rgba(47,128,237,0.3)] hover:shadow-[0_4px_12px_rgba(47,128,237,0.4)]
                     transition-all duration-150"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(item)}
          disabled={!hasPermission("cost_estimator", "edit")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                     bg-white hover:bg-[#f6f8fa] border border-[#d0d7de]
                     text-[#57606a] hover:text-[#24292f] text-[12px] font-medium
                     transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Edit quotation"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>

        {/* Duplicate */}
        <button
          onClick={() => setDuplicateModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                     bg-white hover:bg-[#f6f8fa] border border-[#d0d7de]
                     text-[#57606a] hover:text-[#24292f] text-[12px] font-medium
                     transition-all duration-150"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate
        </button>

        {/* Delete */}
        <button
          onClick={() => setDeleteModal(true)}
          disabled={!hasPermission("cost_estimator", "delete")}
          className="w-[30px] h-[30px] rounded-[8px] border border-[#fca5a5] bg-[#fee2e2] hover:bg-[#fecaca]
                     flex items-center justify-center text-[#dc2626] transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete quotation"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Duplicate Modal */}
      <Modal
        isOpen={duplicateModal}
        closeModal={() => setDuplicateModal(false)}
        title=""
        className="md:max-w-[420px] max-w-[340px] rounded-[14px] shadow-2xl"
        rootCls="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#dbeafe] flex items-center justify-center">
            <Copy className="w-5 h-5 text-[#2f80ed]" />
          </div>
          <h3 className="text-[17px] font-bold text-[#24292f]">Confirm Duplication</h3>
          <p className="text-[12.5px] text-[#57606a] leading-relaxed max-w-[280px]">
            Are you sure you want to duplicate this estimation? A new copy will be created with the same details.
          </p>
          <div className="mt-2 flex w-full gap-2.5">
            <button
              onClick={() => setDuplicateModal(false)}
              disabled={isLoading}
              className="flex-1 py-2 rounded-[8px] border border-[#d0d7de] bg-white
                         text-[13px] font-medium text-[#57606a] hover:bg-[#f6f8fa]
                         transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 py-2 rounded-[8px] bg-[#2f80ed] hover:bg-[#1a6dd6]
                         text-[13px] font-semibold text-white
                         flex items-center justify-center gap-2
                         transition-all disabled:opacity-60"
            >
              {isLoading && <LoaderIcon />}
              {isLoading ? "Duplicating…" : "Continue"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        closeModal={() => setDeleteModal(false)}
        title=""
        className="md:max-w-[400px] max-w-[340px] rounded-[14px] shadow-2xl"
        rootCls="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                 stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <h3 className="text-[17px] font-bold text-[#24292f]">Confirm Deletion</h3>
          <p className="text-[12.5px] text-[#57606a] leading-relaxed max-w-[280px]">
            Are you sure you want to delete this quotation? This action cannot be undone.
          </p>
          <div className="mt-2 flex w-full gap-2.5">
            <button
              onClick={() => setDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 py-2 rounded-[8px] border border-[#d0d7de] bg-white
                         text-[13px] font-medium text-[#57606a] hover:bg-[#f6f8fa]
                         transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 py-2 rounded-[8px] bg-[#fee2e2] hover:bg-[#fecaca] border border-[#fca5a5]
                         text-[13px] font-semibold text-[#dc2626]
                         flex items-center justify-center gap-2
                         transition-all disabled:opacity-60"
            >
              {isDeleting && <LoaderIcon />}
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
