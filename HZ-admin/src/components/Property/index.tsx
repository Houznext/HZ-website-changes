import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import SearchBar from "@/src/common/SearchBar";
import usePostPropertyStore, { propertyInitialState, PropertyStore } from "@/src/stores/postproperty";
import apiClient from "@/src/utils/apiClient";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";
import PropertyCard from "./PropertyCard/PropertyCard";
import PropertyForm from "./PropertyForm";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import { Download, LayoutGrid, Rows, ArrowUpDown, Clock, CheckCircle, XCircle, FileText, Filter } from "lucide-react";
import {
  LookingType,
  OwnerType,
  PurposeType,
} from "./PropertyDetails/PropertyHelpers";
import { usePropertyStore, PropertyStatusFilter, StatusCounts } from "@/src/stores/propertystore";

type SortKey =
  | "recent"
  | "name"
  | "priceAsc"
  | "priceDesc"
  | "areaAsc"
  | "areaDesc"
  | "bhk";

const PropertyView = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isView, setIsView] = useState<boolean>(false);
  const [user, setUser] = useState<{ [key: string]: any }>();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  // const [activeTab, setActiveTab] = useState<string | null>(null);
  type TabType = "buy" | "rent" | "plot" | "commercial" |"flatshare";
  const [activeTab, setActiveTab] = useState<TabType>("buy");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"cards" | "compact">("compact");
  const { 
    properties, 
    fetchProperties, 
    setProperties, 
    isLoading, 
    totalPages, 
    total,
    statusFilter,
    setStatusFilter,
    approveProperty,
    statusCounts,
    fetchStatusCounts
  } = usePropertyStore();

  const setProperty = usePostPropertyStore((state) => state.setProperty);

  const { data: session, status } = useSession();
  const { hasPermission } = usePermissionStore((state) => state);

  // Status filter tabs for admin
  const statusTabs: { key: PropertyStatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'All', icon: <FileText className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
    { key: 'pending', label: 'Pending Review', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
    { key: 'approved', label: 'Approved', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
    { key: 'draft', label: 'Drafts', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  ];

  // Use status counts from store (fetched from backend)

  // Handle publish (for drafts - mark as posted and optionally approve)
  const handlePublish = async (propertyId: number, alsoApprove: boolean = false) => {
    if (!user?.id) return;
    const success = await approveProperty(String(propertyId), alsoApprove, user.id, true);
    if (success) {
      fetchProperties(page, limit, statusFilter, '', true);
    }
  };


  useEffect(() => {
    const handleUserSession = async () => {
      if (status === "loading") return;
      if (status === "authenticated" && session?.user) {
        setUser(session.user);
      } else {
        toast.error("session expired, please login again");
        await signOut();
      }
    };
    handleUserSession();
  }, [status, session?.user]);

  useEffect(() => {
    // Fetch properties and status counts on mount
    fetchProperties(1, limit, statusFilter, '', true);
    fetchStatusCounts();
  }, []);

  // Handle property approval
  const handleApprove = async (propertyId: number) => {
    if (!user?.id) return;
    const success = await approveProperty(String(propertyId), true, user.id, true);
    if (success) {
      // Refresh the list
      fetchProperties(page, limit, statusFilter, '', true);
    }
  };

  // Handle property rejection
  const handleReject = async (propertyId: number, reason?: string) => {
    if (!user?.id) return;
    const success = await approveProperty(String(propertyId), false, user.id, false, reason);
    if (success) {
      fetchProperties(page, limit, statusFilter, '', true);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(
        `${apiClient.URLS.property}/admin/${id}`,
       {},
        true
      );
      setProperties((prev) => prev.filter((p) => p.propertyId !== id));

      toast.success("Property deleted successfully");
    } catch (e) {
      toast.error("Something went wrong, try again!");
      console.log(e);
    }
  };

  const handleEdit = (property: PropertyStore) => {
    setOpenModal(true);
    setProperty(property);
    setIsEdit(true);
  };

  const handleView = (property: PropertyStore) => {
    setOpenModal(true);
    setProperty(property);
    setIsView(true);
  };

  const handleDrawerClose = () => {
    setOpenModal(false);
    setProperty(null);
    setIsEdit(false);
    setIsView(false);
  };

  const filterKeyMap: Record<string, (property: any) => any> = {
    propertyType: (p) => p.propertyDetails?.propertyType,
    bhkType: (p) => p.propertyDetails?.residentialAttributes?.bhk,
    priceRange: (p) => p.propertyDetails?.pricingDetails?.monthlyRent,
    saleType: (p) => p.propertyDetails?.furnishing?.furnishedType,
    constructionStatus: (p) => p.propertyDetails?.constructionStatus?.status,
    propertyAge: (p) => p.propertyDetails?.constructionStatus?.ageOfProperty,
    facing: (p) => p.propertyDetails?.residentialAttributes?.facing,
    amenities: (p) => p.propertyDetails?.furnishing?.amenities || [],
     sharingType: (p) =>
    p.propertyDetails?.flatshareAttributes?.sharingType,

  genderPreference: (p) =>
    p.propertyDetails?.flatshareAttributes?.genderPreference,
  };
  const tabToLookingType: Record<string, any | null> = {
    buy: LookingType.Sell,
    rent: LookingType.Rent,
    commercial: PurposeType.Commercial,
    plot: null,
    flatshare:LookingType.FlatShare
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Search filter
      const matchesSearch = searchTerm
        ? property.propertyDetails?.propertyName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.locationDetails?.city
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        property.locationDetails?.locality
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
        : true;
      
      // Category tab filter (Buy/Rent/Commercial/Plot) - optional
      const matchesTab = (() => {
        if (!activeTab) return true;

        if (activeTab === "commercial") {
          return property.basicDetails?.purpose === PurposeType.Commercial;
        }

        if (activeTab === "plot") {
          return property.propertyDetails?.propertyType
            ?.toLowerCase()
            .includes("plot");
        }
        if (activeTab === "flatshare") {
    return property.basicDetails?.lookingType === LookingType.FlatShare;
  }


        // buy/rent mapping
        const expectedLookingType = tabToLookingType[activeTab];
        return property.basicDetails?.lookingType === expectedLookingType;
      })();

      // Other filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (
          !value ||
          value === "Select" ||
          value === "Select BHK" ||
          value === "All"
        )
          return true;

        const getValue = filterKeyMap[key];
        if (!getValue) return true;

        const propVal = getValue(property);

        if (key === "priceRange") {
          const rent = Number(propVal) || 0;
          if (value === "₹0 - ₹10K") return rent <= 10000;
          if (value === "₹10K - ₹25K") return rent > 10000 && rent <= 25000;
          if (value === "₹25K - ₹50K") return rent > 25000 && rent <= 50000;
          if (value === "₹50K+") return rent > 50000;

          if (value === "₹0 - ₹50L") return rent <= 5000000;
          if (value === "₹50L - ₹1Cr")
            return rent > 5000000 && rent <= 10000000;
          if (value === "₹1Cr - ₹5Cr")
            return rent > 10000000 && rent <= 50000000;
          if (value === "₹5Cr+") return rent > 50000000;

          return true;
        }

        if (key === "propertyAge") {
          const age = Number(propVal) || 0;
          if (value === "0-5 years") return age <= 5;
          if (value === "5-10 years") return age > 5 && age <= 10;
          if (value === "10+ years") return age > 10;
          return true;
        }

        if (key === "bhkType") {
          const valFormatted = value.replace(/\s/g, "").toLowerCase();
          const propFormatted = propVal
            ?.toString()
            .replace(/\s/g, "")
            .toLowerCase();
          return valFormatted === propFormatted;
        }

        if (Array.isArray(propVal)) {
          return propVal
            .map((v) => v.toLowerCase())
            .includes(value.toLowerCase());
        }

        return propVal?.toString().toLowerCase() === value.toLowerCase();
      });

      return matchesSearch && matchesFilters && matchesTab;
    });
  }, [properties, searchTerm, filters, activeTab]);

  const getCreatedAt = (p: PropertyStore) =>
    new Date((p as any)?.createdAt ?? (p as any)?.updatedAt ?? 0).getTime();
  const getName = (p: PropertyStore) =>
    (p?.propertyDetails?.propertyName ?? "").toString().toLowerCase();
  const getPrice = (p: PropertyStore) =>
    Number(
      p?.propertyDetails?.pricingDetails?.expectedPrice ??
      p?.propertyDetails?.pricingDetails?.monthlyRent ??
      0
    );
  const getArea = (p: PropertyStore) =>
    Number(p?.propertyDetails?.residentialAttributes?.buildupArea?.size ?? 0);
  const getBhk = (p: PropertyStore) =>
    (p?.propertyDetails?.residentialAttributes?.bhk ?? "")
      .toString()
      .toLowerCase();

  const comparators: Record<
    SortKey,
    (a: PropertyStore, b: PropertyStore) => number
  > = {
    recent: (a, b) => getCreatedAt(b) - getCreatedAt(a),
    name: (a, b) => getName(a).localeCompare(getName(b)),
    priceAsc: (a, b) => getPrice(a) - getPrice(b),
    priceDesc: (a, b) => getPrice(b) - getPrice(a),
    areaAsc: (a, b) => getArea(a) - getArea(b),
    areaDesc: (a, b) => getArea(b) - getArea(a),
    bhk: (a, b) => getBhk(a).localeCompare(getBhk(b)),
  };

  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort(comparators[sort]);
  }, [filteredProperties, sort]);

  // const totalFilteredPages = useMemo(() => {
  //   return Math.ceil(sortedProperties.length / limit) || 1;
  // }, [sortedProperties.length, limit]);

  // const displayed = useMemo(() => {
  //   const start = (page - 1) * limit;
  //   return sortedProperties.slice(start, start + limit);
  // }, [sortedProperties, page, limit]);
  const displayed = sortedProperties;
  useEffect(() => {
  fetchProperties(page, limit, statusFilter, searchTerm, true);
}, [page, statusFilter, searchTerm]);



  const activeChips = useMemo(
    () =>
      Object.entries(filters).filter(
        ([, v]) => v && !["Select", "Select BHK", "All"].includes(v)
      ),
    [filters]
  );
const handleAddProperty = () => {
  setIsEdit(false);
  setIsView(false);

  // ✅ reset zustand state to blank
  setProperty(propertyInitialState);

 

  setOpenModal(true);
};

  if (isLoading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden shadow-inner shadow-gray-200 p-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-text">Property Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and approve property listings</p>
        </div>

        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="text-[10px] font-medium"
          showTooltip={!hasPermission("property", "create")}
        >
          <Button
            onClick={handleAddProperty}
            disabled={!hasPermission("property", "create")}
            className="bg-[#5297ff] font-medium label-text text-white md:py-[6px] py-1 md:px-4 px-2 rounded-md"
          >
            + Add property
          </Button>
        </CustomTooltip>
      </div>

      {/* Status Filter Tabs with Counts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const count = statusCounts[tab.key] || 0;
          const badgeColor = tab.key === 'pending' ? 'bg-yellow-500' : 
                            tab.key === 'approved' ? 'bg-green-500' : 
                            tab.key === 'draft' ? 'bg-blue-500' : 'bg-gray-500';
          return (
            <Button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                statusFilter === tab.key
                  ? 'bg-[#5297ff] text-white shadow-md'
                  : `${tab.color} hover:opacity-80`
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`${statusFilter === tab.key ? 'bg-white/20' : badgeColor} text-white text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center`}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="mt-4">
        <SearchBar
          filters={filters}
          searchTerm={searchTerm}
          onFiltersChange={(newFilters) => setFilters(newFilters)}
          onSearchTermChange={(term) => setSearchTerm(term)}
          // onTabChange={(tab) => setActiveTab(tab)}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map(([k, v]) => (
            <Button
              key={k}
              onClick={() => setFilters((prev) => ({ ...prev, [k]: "" }))}
              className="flex items-center gap-1 px-2 py-1 md:rounded-[10px] rounded-[4px] border md:text-[12px] text-[10px] font-medium bg-gray-50 hover:bg-gray-100"
              aria-label={`Remove filter ${k}`}
            >
              <span className="font-medium">{k}</span>
              <span className="text-gray-700">: {v}</span>
              <span className="ml-1 text-red-500">✕</span>
            </Button>
          ))}
          {activeChips.length > 0 && (
            <Button
              onClick={() => setFilters({})}
              className="md:text-[12px] text-[10px] font-medium text-[#3586FF]  underline underline-offset-4 "
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[12px] md:text-[14px] font-medium text-gray-800">
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="px-1 py-[6px] rounded-md border font-medium bg-white md:text-[12px] text-[10px]"
              aria-label="Sort properties"
            >
              <option value="recent" className="rounded-sm">
                Recently added
              </option>
              <option value="name" className="rounded-sm">
                Name{" "}
              </option>
              <option value="priceAsc" className="rounded-sm">
                Price (Low→High)
              </option>
              <option value="priceDesc" className="rounded-sm">
                Price (High→Low)
              </option>
              <option value="areaAsc" className="rounded-sm">
                Area (Small→Big)
              </option>
              <option value="areaDesc" className="rounded-sm">
                Area (Big→Small)
              </option>
              <option value="bhk" className="rounded-sm">
                BHK{" "}
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <Button
              className={`px-2 py-[7px] rounded-md border ${view === "cards"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
                }`}
              onClick={() => setView("cards")}
              title="Cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              className={`px-2 py-[7px] rounded-md border ${view === "compact"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
                }`}
              onClick={() => setView("compact")}
              title="Compact view"
            >
              <Rows className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-2 md:text-[14px] text-[12px] text-gray-700 font-medium flex items-center gap-2">
        <span>Showing:</span>
        <span className="font-medium text-[#3586FF]">
          {displayed.length} of {total} properties
        </span>
        {statusFilter !== 'all' && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
            Filter: {statusTabs.find(t => t.key === statusFilter)?.label}
          </span>
        )}
      </div>

      {view === "cards" ? (
        <div className="grid md:grid-cols-4 grid-cols-1 gap-4 py-5 [column-fill:_balance]">
          {displayed.map((property) => (
            <div
              key={property.propertyId}
              className="mb-4 break-inside-avoid animate-[fadeIn_320ms_ease-out]"
            >
              <PropertyCard
                property={property}
                handleView={handleView}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleApprove={handleApprove}
                handleReject={handleReject}
                handlePublish={handlePublish}
                setProperty={setProperty}
                hasPermission={hasPermission}
                variant="cards"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 py-5">
          {displayed.map((property) => (
            <PropertyCard
              key={property.propertyId}
              property={property}
              handleView={handleView}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleApprove={handleApprove}
              handleReject={handleReject}
              handlePublish={handlePublish}
              setProperty={setProperty}
              hasPermission={hasPermission}
              variant="compact"
            />
          ))}
        </div>
      )}
  {displayed.length === limit && totalPages > 1 && (
 

        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            className={`px-3 py-1 font-medium border rounded-md ${page === 1 ? "opacity-50" : "hover:bg-gray-100"
              }`}
          >
            Prev
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => (

            <Button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 font-medium border rounded-md ${page === i + 1 ? "bg-[#5297ff] text-white" : "hover:bg-gray-100"
                }`}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 font-medium border rounded-md ${page === totalPages ? "opacity-50" : "hover:bg-gray-100"
              }`}
          >
            Next
          </Button>
        </div>
      )}

      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={handleDrawerClose}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[90%] md:w-[80%] lg:w-[calc(90%-390px)] shadow-2xl"
          overLayCls="bg-gray-700 bg-opacity-40"
        >
          
          <PropertyForm
            isEdit={isEdit}
            isView={isView}
            user={user}
            handleDrawerClose={handleDrawerClose}
            setProperties={setProperties}
          />
        </Drawer>
      )}
    </div>
  );
};

export default PropertyView;
