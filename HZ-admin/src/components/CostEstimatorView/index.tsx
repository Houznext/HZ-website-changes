import React, { useEffect, useMemo, useState, useRef } from "react";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import Loader from "../SpinLoader";
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
import Modal from "@/src/common/Modal";

export interface CEcardProps {
  key?: number;
  data: CostEstimator;
  onDuplicate: (data: CostEstimator) => void;
  activeTab: string;
}
/* ---------------- Types ---------------- */
type FiltersState = {
  bhkTypeData: Record<string, boolean>;
  DateData: Record<string, boolean>;
  DesignedData: Record<string, boolean>;
  stateData: Record<string, boolean>;
};

const TABS = [
  { key: "Interior", label: "Interiors" },
  { key: "CustomBuilder", label: "Custom Builder" },
  { key: "Solar", label: "Solar" },
];

const CostEstimatorView: React.FC = () => {
  const router = useRouter();
  const { hasPermission, activeBranchId } = usePermissionStore((s) => s);

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
  } = useCostEstimatorStore();

  console.log("costEstimators", costEstimators);

  const [view, setView] = useState<"cards" | "compact">("cards");
  const [sort, setSort] = useState<"recent" | "name" | "total">("recent");
  const [query, setQuery] = useState("");
  const searchTimer = useRef<number | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const fetchBranches = async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.branches}/idwithname`,
        {},
        true,
      );
      const list: any[] = res.body || [];
      setBranchOptions(
        list.map((branch) => ({
          label: branch.branchName,
          value: branch.branchId,
        })),
      );
    } catch (error) {
      console.error("error is ", error);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (router.query?.category && typeof router.query.category === "string") {
      setActiveTab(router.query.category);
    }
  }, [router.query?.category]);

  // Fetch on auth/tab change
  useEffect(() => {
    if (status === "authenticated" && userId) {
      fetchCostEstimators(userId, activeTab, activeBranchId);
    }
  }, [status, userId, activeTab, activeBranchId]);

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
  const membership = session?.user?.branchMemberships?.[0];

  const canShowBranchFilter =
    membership?.branchRoles?.some((r) => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";

  /* ---------------- Data ---------------- */

  /* ---------------- Helpers ---------------- */
  // const isEmpty = (o: Record<string, boolean>) =>
  //   Object.values(o).every((v) => !v);
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
          const matchesBranch =
            !selectedBranch || e.branchId === selectedBranch;

          return (
            matchQ &&
            bhkMatch &&
            dateMatch &&
            designerMatch &&
            stateMatch &&
            matchesBranch
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
  }, [costEstimators, debouncedQuery, selectedFilters, sort, selectedBranch]);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, currentPage, pageSize]);
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedFilters, activeTab, selectedBranch]);

  const exportCSV = () => {
    if (!paginatedData.length) {
      toast("Nothing to export");
      return;
    }
    const header = [
      "First Name",
      "Last Name",
      "Email",
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

  const tabIcons: Record<string, React.ReactNode> = {
    Interior: <FiPenTool className="w-4 h-4" />,
    CustomBuilder: <FiHome className="w-4 h-4" />,
    Solar: <FiSun className="w-4 h-4" />,
  };

  if (isLoading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="w-full max-w-full overflow-hidden px-2 md:px-0">
      {/* Header with Tabs */}
      <div className="sticky top-0 z-10 pt-4 mb-6">
        <div className="flex  md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-200/40 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white grid place-items-center shadow-lg shadow-blue-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Cost Estimator
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} estimations found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === t.key
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tabIcons[t.key]}
                  <span className="hidden md:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Add Button */}
            <CustomTooltip
              label="Access Restricted"
              position="bottom"
              tooltipBg="bg-black/60 backdrop-blur-md"
              tooltipTextColor="text-white py-2 px-4 font-medium"
              labelCls="text-[10px] font-medium"
              showTooltip={!hasPermission("cost_estimator", "create")}
            >
              <Button
                onClick={() => setOpenModal(true)}
                // disabled={!hasPermission("cost_estimator", "create")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">New</span>
              </Button>
            </CustomTooltip>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <ReusableSearchFilter
              searchText={query}
              placeholder="Search by name, email, phone, property or location..."
              onSearchChange={setQuery}
              branchOptions={branchOptions}
              selectedBranch={selectedBranch}
              onBranchChange={(opt) => {
                setSelectedBranch(opt?.value ?? null);
              }}
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
              rootCls="md:mb-0"
              showBranchFilter={canShowBranchFilter}
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Export Button */}
            <button
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
              onClick={exportCSV}
              title="Export filtered list"
            >
              <Download className="w-4 h-4 group-hover:animate-bounce" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Sort Button */}
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium text-sm transition-all duration-200"
              onClick={() =>
                setSort((s) =>
                  s === "recent" ? "name" : s === "name" ? "total" : "recent",
                )
              }
              title={`Sort: ${sort}`}
            >
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Sort:</span>
              <span className="capitalize text-blue-600 font-semibold">
                {sort}
              </span>
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-1.5 gap-1">
              <button
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  view === "cards"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                }`}
                onClick={() => setView("cards")}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  view === "compact"
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                }`}
                onClick={() => setView("compact")}
                title="Compact view"
              >
                <Rows className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {paginatedData?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Calculator className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            No estimations found
          </h3>
          <p className="text-sm text-slate-500">
            No {activeTab} estimations match your criteria
          </p>
        </div>
      ) : view === "compact" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData?.map((e) => (
              <CompactRow
                key={e.id}
                item={e}
                activeTab={activeTab}
                onDuplicate={async (d) => {
                  try {
                    await handleDuplicateProxy(d);
                    await fetchCostEstimators(userId!, activeTab);
                  } catch {}
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 pb-8">
          {paginatedData.map((item, idx) => (
            <CostEstimationCard
              key={idx}
              data={item}
              activeTab={activeTab}
              onDuplicate={async (d) => {
                try {
                  await handleDuplicateProxy(d);
                  await fetchCostEstimators(userId!, activeTab);
                } catch {}
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Form Drawer */}
      <Drawer
        open={openModal}
        handleDrawerToggle={() => setOpenModal(false)}
        closeIconCls="text-slate-500 hover:text-slate-800"
        openVariant="right"
        panelCls="w-[95%] sm:w-[95%] lg:w-[calc(100%-340px)] shadow-2xl"
        overLayCls="bg-slate-900/60 backdrop-blur-sm"
      >
        <CostEstimatorForm
          closeDrawer={closeDrawer}
          setCostEstimators={setCostEstimators}
          setEditingEstimation={setEditingEstimation}
          editingEstimation={editingEstimation}
          userId={userId}
          branchId={activeBranchId}
        />
      </Drawer>
    </div>
  );

  async function handleDuplicateProxy(data: CostEstimator) {
    try {
      const fullData =
        data?.itemGroups && data?.itemGroups.length > 0
          ? data
          : (await apiClient.get(`${apiClient.URLS.cost_estimator}/${data.id}`))
              .body;

      const { id, postedBy, itemGroups = [], discount, ...rest } = fullData;

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

/* ---------------- Compact Row ---------------- */
const CompactRow = ({
  item,
  activeTab,
  onDuplicate,
}: {
  item: CostEstimator;
  activeTab: string;
  onDuplicate: (data: CostEstimator) => Promise<void>;
}) => {
  const router = useRouter();
  const total = (Number(item.subTotal) || 0) - (Number(item.discount) || 0);
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-sm">
              {item.firstname?.charAt(0)}
              {item.lastname?.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-[15px] text-slate-800">
                {item.firstname} {item.lastname}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {new Date(item.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-sm text-slate-500">
                {item.location?.city}, {item.location?.state}
              </span>
              {item.bhk && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {item.bhk}
                </span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="text-right">
            <span className="text-lg font-bold text-slate-800">
              ₹ {total.toLocaleString()}
            </span>
            {Number(item.discount) > 0 && (
              <p className="text-xs text-emerald-600">
                -₹{Number(item.discount).toLocaleString()} discount
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:ml-4">
        <button
          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-medium transition-all flex items-center gap-1.5"
          onClick={() => router.push(`/cost-estimator/${activeTab}/${item.id}`)}
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg
             bg-blue-50 text-blue-600
             hover:bg-blue-100 hover:text-blue-700
             border border-blue-100
             text-sm font-medium
             transition-all duration-200"
          onClick={() => setDuplicateModal(true)}
        >
          <Copy className="w-4 h-4" />
          Duplicate
        </button>
        <Modal
          isOpen={duplicateModal}
          closeModal={() => setDuplicateModal(false)}
          title=""
          className="md:max-w-[420px] max-w-[340px] rounded-2xl shadow-2xl"
          rootCls="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm"
          isCloseRequired={false}
        >
          <div className="p-6 flex flex-col items-center text-center gap-3 z-20">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Copy className="w-6 h-6 text-blue-600" />
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-semibold text-blue-600">
              Confirm Duplication
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-500 leading-relaxed max-w-[280px]">
              Are you sure you want to duplicate this estimation? A new copy
              will be created with the same details.
            </p>

            {/* Actions */}
            <div className="mt-5 flex w-full gap-3">
              <Button
                onClick={() => setDuplicateModal(false)}
                disabled={isLoading}
                className="flex-1 py-2 rounded-lg
                   border border-slate-200
                   bg-white text-slate-700
                   hover:bg-slate-50
                   transition-all"
              >
                Cancel
              </Button>

              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 py-2 rounded-lg
                   bg-blue-600 text-white
                   hover:bg-blue-700
                   flex items-center justify-center gap-2
                   transition-all
                   disabled:opacity-60"
              >
                {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
                {isLoading ? "Duplicating..." : "Continue"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* <button
          className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all flex items-center gap-1.5"
          onClick={() =>
            window.open(
              `/cost-estimator/${activeTab}/${item.id}?download=1`,
              "_blank",
            )
          }
          title="Download PDF"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button> */}
      </div>
    </div>
  );
};
