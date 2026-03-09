import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import Loader from "@/src/common/Loader";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import CustomTooltip from "@/src/common/ToolTip";
import CreateCBuser from "./CreateUser";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import { usePermissionStore } from "@/src/stores/usePermissions";
import { ConstructionScope } from "../helper";
import { useSession } from "next-auth/react";
import { useCustomBuildersListStore } from "@/src/stores/custom-builderstore";

import {
  Download,
  ChevronDown,
  ArrowUpDown,
  Clock3,
  MapPin,
  Mail,
  Phone,
  Home,
  Building2,
  Building,
  UserRound,
  UserRoundCheck,
  Compass,
  Ruler,
  ImageIcon,
  Calendar,
} from "lucide-react";
import { ViewToggleIcons } from "../ViewSelector";
import PaginationControls from "@/src/components/CrmView/pagination";

type FiltersState = {
  PropertyTypeData: Record<string, boolean>;
  constructionTypeData: Record<string, boolean>;
  constructionScopeData: Record<string, boolean>;
  CityData: Record<string, boolean>;
};

const AdminCustomBuilders: React.FC = () => {
  const router = useRouter();
  const { setCustomBuilderID } = useCustomBuilderStore();
  const { hasPermission, activeBranchId, userRole } = usePermissionStore((s) => s);
  const { data: session, status } = useSession();

  const [userId, setUserId] = useState<number | null>(null);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const [view, setView] = useState<"cards" | "compact">("cards");
  const [sort, setSort] = useState<"recent" | "alpha" | "progress">("recent");
  const [query, setQuery] = useState("");
  const { rows, isLoading, fetchAll, hasFetched, clear } =
    useCustomBuildersListStore();

  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    PropertyTypeData: {},
    constructionTypeData: {},
    constructionScopeData: {},
    CityData: {},
  });

  const [propertyTypeOptions, setPropertyTypeOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [constructionTypeOptions, setConstructionTypeOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [cityOptions, setCityOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const constructionScopeOptions = ConstructionScope.map((scope) => ({
    id: scope.toLowerCase(),
    label: scope,
  }));
  const [branchOptions, setBranchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const { data: sessionData } = useSession();

  // ---------- data ----------

  useEffect(() => {
    if (!router.isReady) return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      if (rows?.length === 0) {
        fetchAll(session.user.id, userRole || "STANDARD", activeBranchId);
      }
    }
  }, [router.isReady, status, userRole, activeBranchId, session?.user?.id]);
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

  useEffect(() => {
    if (!rows.length) return;
    const uniq = (arr: (string | undefined)[]) =>
      Array.from(
        new Set(arr.map((v) => v?.trim()).filter(Boolean)),
      ) as string[];

    const propertyTypes = uniq(
      rows.map((r) => r?.propertyInformation?.construction_type),
    );
    setPropertyTypeOptions(propertyTypes.map((t) => ({ id: t, label: t })));

    const constructionTypes = uniq(
      rows.map((r) => r?.propertyInformation?.property_type),
    );
    setConstructionTypeOptions(
      constructionTypes.map((t) => ({ id: t, label: t })),
    );

    const cityMap = new Map<string, string>();
    rows.forEach((r) => {
      const c = r?.location?.city?.trim();
      if (!c) return;
      const key = c.toLowerCase();
      if (!cityMap.has(key)) cityMap.set(key, c);
    });
    setCityOptions(
      Array.from(cityMap.values()).map((c) => ({
        id: c.toLowerCase(),
        label: c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
      })),
    );
  }, [rows]);

  const isEmpty = (o: Record<string, boolean>) =>
    Object.values(o).every((v) => !v);

  const progressPct = (currentDay?: number, est?: number) => {
    if (!currentDay || !est || est <= 0) return 0;
    const pct = ((currentDay - 1) / est) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const progressColor = (pct: number) => {
    if (pct < 30) return "bg-red-500";
    if (pct < 60) return "bg-amber-500";
    if (pct < 90) return "bg-emerald-500";
    return "bg-blue-600";
  };

  const handleRoute = (id: string, route: string) => {
    setCustomBuilderID(id);
    router.push(`/custom-builder/${id}/${route}`);
  };

  const toggleDropdown = (idx: number) =>
    setDropdownOpen((prev) => (prev === idx ? null : idx));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ---------- filtering / sorting ----------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter((r) => {
      const matchQ =
        !q ||
        r?.user?.firstName?.toLowerCase().includes(q) ||
        r?.user?.lastName?.toLowerCase().includes(q) ||
        r?.user?.phone?.toLowerCase().includes(q) ||
        r?.user?.email?.toLowerCase().includes(q) ||
        r?.location?.locality?.toLowerCase().includes(q) ||
        r?.location?.state?.toLowerCase().includes(q) ||
        r?.location?.city?.toLowerCase().includes(q);

      const pf = selectedFilters.PropertyTypeData;
      const cf = selectedFilters.constructionTypeData;
      const sf = selectedFilters.constructionScopeData;
      const cityf = selectedFilters.CityData;

      const matchProp =
        isEmpty(pf) ||
        pf[r?.propertyInformation?.construction_type?.trim?.() || ""];
      const matchConst =
        isEmpty(cf) || cf[r?.propertyInformation?.property_type || ""];
      const matchScope =
        isEmpty(sf) ||
        sf[
        r?.propertyInformation?.construction_scope?.trim?.()?.toLowerCase() ||
        ""
        ];
      const matchCity =
        isEmpty(cityf) || cityf[r?.location?.city?.trim()?.toLowerCase() || ""];
      const matchesBranch = !selectedBranch || r.branchId === selectedBranch;

      return (
        matchQ &&
        matchProp &&
        matchConst &&
        matchScope &&
        matchCity &&
        matchesBranch
      );
    });

    if (sort === "alpha") {
      out.sort((a, b) =>
        (a?.user?.firstName || "").localeCompare(b?.user?.firstName || ""),
      );
    } else if (sort === "progress") {
      out.sort(
        (a, b) =>
          progressPct(b?.currentDay, b?.estimatedDays) -
          progressPct(a?.currentDay, a?.estimatedDays),
      );
    } else {
      out.sort((a, b) => (b?.id || 0) - (a?.id || 0));
    }
    return out;
  }, [rows, query, selectedFilters, sort, selectedBranch]);
  const membership = session?.user?.branchMemberships?.[0];

  const canShowBranchFilter =
    membership?.branchRoles?.some((r) => r.roleName === "SuperAdmin") &&
    membership?.isBranchHead === true &&
    membership?.level === "ORG";
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, currentPage, pageSize]);
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedFilters, sort, selectedBranch]);

  const Card = (item: any, index: number) => {
    const pct = progressPct(item?.currentDay, item?.estimatedDays);
    const scope = item?.propertyInformation?.construction_scope;
    const totalAreaSize =
      item?.propertyInformation?.house_construction_info?.total_area?.size ??
      item?.propertyInformation?.interior_info?.total_area?.size ??
      "NA";
    const totalAreaUnit =
      item?.propertyInformation?.house_construction_info?.total_area?.unit ??
      item?.propertyInformation?.interior_info?.total_area?.unit ??
      "";

    return (
      <div
        key={`${item?.id}-${index}`}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4"
      >
        <div className="flex items-start md:items-center justify-between gap-2">
          {item?.currentDay > 0 && item?.estimatedDays > 0 ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-blue-50 text-[#3586FF]  px-3 py-1 rounded-md font-medium text-[12px] md:text-[14px]">
                <Calendar className="w-4 h-4" />
                Day {item?.currentDay}/{item?.estimatedDays}
              </div>

              <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-medium text-[12px] md:text-[14px]">
                {pct.toFixed(0)}% complete
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <Clock3 className="w-4 h-4" />
              <span className="font-medium text-[12px] md:text-[14px]">
                Work not started yet
              </span>
            </div>
          )}

          <div className="relative">
            <Button
              className="bg-[#5297ff] hover:bg-blue-700 text-white px-3 py-1 md:text-[14px] text-[12px] rounded-md font-medium flex items-center gap-1"
              onClick={() => toggleDropdown(index)}
            >
              View Details <ChevronDown className="w-4 h-4" />
            </Button>

            {dropdownOpen === index && (
              <div className="absolute right-0 mt-2 w-[180px] bg-white border border-gray-200 shadow-lg rounded-md z-10 overflow-hidden">
                <Button
                  className="w-full text-left px-3 py-1 hover:bg-gray-50 font-medium text-[13px] border-b"
                  onClick={() => handleRoute(item?.id, "customer-onboarding")}
                >
                  Onboarding
                </Button>
                <Button
                  className="w-full text-left px-3 py-1 hover:bg-gray-50 font-medium text-[13px] border-b"
                  onClick={() => handleRoute(item?.id, "document-upload")}
                >
                  Documents
                </Button>
                <Button
                  className="w-full text-left px-3 py-1 hover:bg-gray-50 border-b font-medium text-[13px]"
                  onClick={() => handleRoute(item?.id, "workprogress")}
                >
                  Day Progress
                </Button>
                <Button
                  className="w-full text-left px-3 py-1 hover:bg-gray-50 font-medium text-[13px] border-b"
                  onClick={() => handleRoute(item?.id, "materials")}
                >
                  Materials
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 md:mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-x-3 gap-y-2">
          <KV
            icon={<UserRound className="w-4 h-4" />}
            label="First Name"
            value={item?.customer?.firstName || "NA"}
          />
          <KV
            icon={<UserRoundCheck className="w-4 h-4" />}
            label="Last Name"
            value={item?.customer?.lastName || "NA"}
          />
          <KV
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={
              item?.customer?.email
                ? `${item?.customer?.email?.slice(0, 6)}..@gmail.com`
                : "NA"
            }
          />
          <KV
            icon={<Phone className="w-4 h-4" />}
            label="Phone"
            value={item?.customer?.phone || "NA"}
          />
          <KV
            icon={<MapPin className="w-4 h-4" />}
            label="Locality"
            value={item?.location?.locality || "NA"}
          />
          <KV
            icon={<MapPin className="w-4 h-4" />}
            label="State"
            value={item?.location?.state || "NA"}
          />
          <KV
            icon={<MapPin className="w-4 h-4" />}
            label="City"
            value={item?.location?.city || "NA"}
          />
          <KV
            icon={<Building2 className="w-4 h-4" />}
            label="Property Type"
            value={item?.propertyInformation?.construction_type || "NA"}
          />
          <KV
            icon={<Building className="w-4 h-4" />}
            label="Construction Type"
            value={item?.propertyInformation?.property_type || "NA"}
          />
          <KV
            icon={<Home className="w-4 h-4" />}
            label="Construction Scope"
            value={scope ? scope[0]?.toUpperCase() + scope?.slice(1) : "NA"}
          />
          {scope === "house" && (
            <KV
              icon={<Compass className="w-4 h-4" />}
              label="Facing"
              value={
                item?.propertyInformation?.house_construction_info
                  ?.land_facing || "NA"
              }
            />
          )}
          <KV
            icon={<Ruler className="w-4 h-4" />}
            label="Total Area"
            value={
              totalAreaSize !== "NA"
                ? `${totalAreaSize} ${totalAreaUnit}`.trim()
                : "NA"
            }
          />
          <div className="mt-3 md:mt-4">
            <p className="text-gray-500 font-medium text-[12px] md:text-[14px] mb-1 flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> Property Image
            </p>
            <div className="relative h-[60px] md:h-[60px] w-full md:max-w-[260px] rounded-md overflow-hidden border">
              <Image
                src={
                  item?.propertyInformation?.propertyImages?.[0] ||
                  "/images/custombuilder/propimage.png"
                }
                alt="property"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Compact = (items: any[]) => (
    <div className="w-full overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-[900px] w-full text-left">
        <thead className="bg-gray-50">
          <tr className="text-gray-600 text-[14px]">
            <Th className="text-[14px]">Customer</Th>
            <Th className="text-[14px]">Contact</Th>
            <Th className="text-[14px]">Location</Th>
            <Th className="text-[14px]">Property</Th>
            <Th className="text-[14px]">Scope</Th>
            <Th className="text-[14px]">Progress</Th>
            <Th className="text-right text-[14px] pr-3">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => {
            const pct = progressPct(item?.currentDay, item?.estimatedDays);
            const scope = item?.propertyInformation?.construction_scope;
            return (
              <tr key={`${item?.id}-${i}`} className="border-t">
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-14 relative rounded overflow-hidden border">
                      <Image
                        src={
                          item?.propertyInformation?.propertyImages?.[0] ||
                          "/images/custombuilder/propimage.png"
                        }
                        alt="thumb"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold">
                        {item?.customer?.firstName || "NA"}{" "}
                        {item?.customer?.lastName || ""}
                      </div>
                      <div className="text-[12px] text-gray-500">
                        ID #{item?.id ?? "-"}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="text-[13px]">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium">
                        {item?.customer?.email || "NA"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium">
                        {item?.customer?.phone || "NA"}
                      </span>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="text-[13px]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-medium">
                        {item?.location?.city || "NA"}
                      </span>
                    </div>
                    <div className="text-gray-500 text-[12px]">
                      {item?.location?.state || "NA"}
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="text-[13px]">
                    <div className="font-medium">
                      {item?.propertyInformation?.construction_type || "NA"}
                    </div>
                    <div className="text-gray-500 text-[12px]">
                      {item?.propertyInformation?.property_type || "NA"}
                    </div>
                  </div>
                </Td>
                <Td className="font-medium text-[13px]">
                  {scope ? scope[0]?.toUpperCase() + scope?.slice(1) : "NA"}
                </Td>
                <Td>
                  {item?.currentDay > 0 && item?.estimatedDays > 0 ? (
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <div className="w-[120px] h-[8px] bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor(pct)} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-medium">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 text-[13px]">
                      <Clock3 className="w-4 h-4" />
                      <span className="font-medium">Not started</span>
                    </div>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="inline-flex relative">
                    <Button
                      className="bg-[#5297ff] hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium text-[12px] flex items-center gap-1"
                      onClick={() => toggleDropdown(i)}
                    >
                      View <ChevronDown className="w-4 h-4" />
                    </Button>
                    {dropdownOpen === i && (
                      <div className="absolute right-0 mt-7 w-[150px] bg-white border border-gray-200 shadow-lg rounded-md z-10 overflow-hidden">
                        <Button
                          className="w-full text-left px-3 py-1 hover:bg-gray-50 font-medium text-[12px] border-b"
                          onClick={() =>
                            handleRoute(item?.id, "customer-onboarding")
                          }
                        >
                          Onboarding
                        </Button>
                        <Button
                          className="w-full text-left px-3 py-1 hover:bg-gray-50 font-medium text-[12px] border-b"
                          onClick={() =>
                            handleRoute(item?.id, "document-upload")
                          }
                        >
                          Documents
                        </Button>
                        <Button
                          className="w-full text-left px-3 py-1 border-b hover:bg-gray-50 font-medium text-[12px]"
                          onClick={() => handleRoute(item?.id, "workprogress")}
                        >
                          Day Progress
                        </Button>
                        <Button
                          className="w-full text-left px-3 py-1 hover:bg-gray-50 font-medium text-[12px] border-b"
                          onClick={() => handleRoute(item?.id, "materials")}
                        >
                          Materials
                        </Button>
                      </div>
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ---------- UI ----------
  if (isLoading)
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header row: title + Add Customer */}
      <div className="flex items-center justify-between gap-2 px-2 md:px-0 md:mb-6 mb-3 w-full ">
        <h1 className="text-[#3586FF]  font-bold text-[18px] md:text-[24px]">
          Custom Builders
        </h1>

        <CustomTooltip
          label="Access Restricted — Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!hasPermission("custom_builder", "create")}
        >
          <Button
            className="bg-[#5297ff] hover:bg-blue-700 label-text text-white font-bold px-3 md:px-4 py-1 rounded-md flex items-center gap-2"
            onClick={() => setOpenDrawer(true)}
            disabled={!hasPermission("custom_builder", "create")}
          >
            + New Customer
          </Button>
        </CustomTooltip>
      </div>

      {/* Toolbar container */}
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-2 md:p-3 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
          <div className="w-full">
            <ReusableSearchFilter
              searchText={query}
              placeholder="search by name, phone, email, or location"
              onSearchChange={setQuery}
              className=""
              filters={[
                {
                  groupLabel: "Property Type",
                  key: "PropertyTypeData",
                  options: propertyTypeOptions,
                },
                {
                  groupLabel: "Construction Type",
                  key: "constructionTypeData",
                  options: constructionTypeOptions,
                },
                {
                  groupLabel: "Construction Scope",
                  key: "constructionScopeData",
                  options: constructionScopeOptions,
                },
                {
                  groupLabel: "City",
                  key: "CityData",
                  options: cityOptions,
                },
              ]}
              rootCls="!mb-0 md:mb-0"
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
              branchOptions={branchOptions}
              selectedBranch={selectedBranch}
              onBranchChange={(opt) => {
                setSelectedBranch(opt?.value ?? null);
              }}
              showBranchFilter={canShowBranchFilter}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              className="border border-blue-300 md:text-[12px] text-[10px] text-[#3586FF]  bg-white hover:bg-blue-50 px-3 md:py-1 py-[3px] rounded-md flex items-center text-nowrap gap-2 font-medium"
              onClick={() => toast.success("Exporting CSV…")}
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>

            <Button
              className="px-3 md:py-[7px] py-1 rounded-md border bg-white text-nowrap md:text-[12px] text-[10px] text-gray-800 flex items-center gap-1"
              onClick={() =>
                setSort((s) =>
                  s === "recent"
                    ? "alpha"
                    : s === "alpha"
                      ? "progress"
                      : "recent",
                )
              }
              title="Toggle sort"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span className="font-bold capitalize text-[#3586FF] ">
                &nbsp;{sort}
              </span>
            </Button>

            <ViewToggleIcons view={view} onChange={setView} className="ml-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      {view === "cards" ? (
        <div className="flex flex-col gap-4 pb-8">
          {paginatedData.map(Card)}
        </div>
      ) : (
        <div className="pb-8">{Compact(paginatedData)}</div>
      )}
      <div className="flex items-end justify-end md:mt-0 mt-2 max-md:mb-5">
        {totalItems > pageSize && (
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
        )}
      </div>

      {openDrawer && (
        <Drawer
          open={openDrawer}
          handleDrawerToggle={() => setOpenDrawer(false)}
          closeIconCls="!text-black z-[9999] mt-10"
          openVariant="right"
          title="Create Custom Builder"
          panelCls="w-[95%] lg:w-[calc(100%-390px)] shadow-xl"
          overLayCls="bg-black/40"
        >
          <CreateCBuser
            setopenDrawer={setOpenDrawer}
            handleClose={() => setOpenDrawer(false)}
          />
        </Drawer>
      )}
    </div>
  );
};

export default AdminCustomBuilders;

/* ---------- small helpers ---------- */
const KV = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 text-[#6A6767]">
      <span className="text-gray-600">{icon}</span>
      <span className="font-medium text-[12px] md:text-[14px]">
        {label}
      </span>
    </div>
    <div className="font-medium text-[13px] md:text-[14px]">
      {value}
    </div>
  </div>
);

const Th = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <th className={`px-3 py-3 font-medium text-[12px] ${className}`}>
    {children}
  </th>
);

const Td = ({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) => (
  <td className={`px-3 py-3 align-middle ${className}`}>{children}</td>
);
