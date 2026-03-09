import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { CgTrash } from "react-icons/cg";
import { FaEdit } from "react-icons/fa";
import { Grid, List, Search, BarChart3, ChevronRight, Home } from "lucide-react";
import PropertyForm from "./PropertyForm";
import Button from "@/common/Button";
import Drawer from "@/common/Drawer";
import Loader from "../Loader";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Modal from "@/common/Modal";
import usePostPropertyStore, {
  propertyInitialState,
  PropertyStore,
} from "@/store/postproperty";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import ReusableSearchFilter from "@/common/SearchFilter";
import { useCartStore, OrderItemType } from "@/store/cart";

interface AnalyticsItem {
  eventName: string;
  propertyname: string;
  BHK: string;
  location: string;
  city: string;
  username: string;
  customuserid: string;
  phone: string;
  itemId: string;
  usercity: string;
  userEngagementDuration: number;
  eventCount: number;
}

type ViewMode = "list" | "grid";

const PropertyView = () => {
  const [properties, setProperties] = useState<PropertyStore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isView, setIsView] = useState<boolean>(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/view_property");
      const data = await response.json();
      setAnalyticsData(data);
    };
    fetchData();
  }, []);

  const [user, setUser] = useState<{ [key: string]: any }>();

  const setProperty = usePostPropertyStore((state) => state.setProperty);

  const { data: session, status } = useSession();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [selectedPropertyForDelete, setSelectedPropertyForDelete] = useState<PropertyStore | null>(null);

  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedPropertyForPremium, setSelectedPropertyForPremium] = useState<PropertyStore | null>(null);
  const [premiumPlans, setPremiumPlans] = useState<{ id: string; name: string; slug: string; planType: string; promotionType: string; price: string; durationDays: number; description?: string }[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    const handleUserSession = async () => {
      if (status === "loading") return;
      if (status === "authenticated" && session?.user) {
        setUser(session.user);
      } else {
        toast.error("Session expired, please login again");
        await signOut();
      }
    };
    handleUserSession();
  }, [status]);

  useEffect(() => {
    if (user?.id === undefined) return;
    fetchProperties();
  }, [user]);

  useEffect(() => {
    if (!premiumModalOpen) return;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await apiClient.get(`${apiClient.URLS.propertyPremiumPlans}`, {}, true);
        if (res.status === 200 && Array.isArray(res.body)) {
          setPremiumPlans(res.body);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load premium plans");
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [premiumModalOpen]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.property}/get-all-properties/${user?.id}`,
        "",
        true
      );
      setProperties(res.body ?? []);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(
        `${apiClient.URLS.property}/admin/${id}`,
        "",
        true
      );
      const updatedProperties = properties.filter(
        (property) => property.propertyId !== id
      );
      setProperties(updatedProperties);
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
    setProperty(propertyInitialState);
    setIsEdit(false);
    setIsView(false);
  };

  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(
    {}
  );

  const purposes = useMemo(() => {
    const set = new Set(
      properties.map((p) => p.basicDetails?.purpose).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [properties]);

  const lookingTypes = useMemo(() => {
    const set = new Set(
      properties
        .map((p) => p.basicDetails?.lookingType)
        .filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [properties]);
  const purposeFilter = useMemo(() => {
    const group = (selectedFilters?.purpose ?? {}) as Record<string, boolean>;
    const picked = Object.entries(group).find(([_, v]) => v);
    return picked ? picked[0] : "";
  }, [selectedFilters]);

  const lookingTypeFilter = useMemo(() => {
    const group = (selectedFilters?.lookingType ?? {}) as Record<
      string,
      boolean
    >;
    const picked = Object.entries(group).find(([_, v]) => v);
    return picked ? picked[0] : "";
  }, [selectedFilters]);

  const cityFilter = useMemo(() => {
    const cityGroup = (selectedFilters?.city ?? {}) as Record<string, boolean>;
    const picked = Object.entries(cityGroup).find(([_, v]) => v);
    return picked ? picked[0] : ""; // first selected city id (string)
  }, [selectedFilters]);

  const router = useRouter();

  // ---- UI helpers ----
 const propertyAnalyticsMap = useMemo(() => {
  const map = new Map<string, number>();

  analyticsData?.forEach((a) => {
    const id = String(a.itemId);

    const count = Number(a.eventCount) || 0; 

    map.set(id, (map.get(id) || 0) + count);
  });

  return map;
}, [analyticsData]);

  const cities = useMemo(() => {
    const set = new Set(
      properties.map((p) => p.locationDetails?.city).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [properties]);

  const filterConfig = useMemo(() => {
    return [
      {
        groupLabel: "City",
        key: "city",
        options: cities.map((c) => ({ id: c, label: c })),
      },
      {
        groupLabel: "Purpose",
        key: "purpose",
        options: purposes.map((p) => ({ id: p, label: p })),
      },
      {
        groupLabel: "Looking Type",
        key: "lookingType",
        options: lookingTypes.map((l) => ({ id: l, label: l })),
      },
    ] as any;
  }, [cities, purposes, lookingTypes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return properties.filter((p) => {
      const hay = `${p.propertyDetails?.propertyName || ""} ${p.locationDetails?.city || ""
        } ${p.propertyDetails?.propertyType || ""}`.toLowerCase();

      const matchesQuery = q ? hay.includes(q) : true;
      const matchesCity = cityFilter
        ? p.locationDetails?.city === cityFilter
        : true;
      const matchesPurpose = purposeFilter
        ? p.basicDetails?.purpose === purposeFilter
        : true;
      const matchesLookingType = lookingTypeFilter
        ? p.basicDetails?.lookingType === lookingTypeFilter
        : true;

      return (
        matchesQuery && matchesCity && matchesPurpose && matchesLookingType
      );
    });
  }, [properties, query, cityFilter, purposeFilter, lookingTypeFilter]);

  const contentNotReady =
    status === "loading" ||
    (status === "authenticated" && user === undefined) ||
    isLoading;

  if (contentNotReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader tagline={status === "loading" ? "Loading..." : "Loading properties..."} />
      </div>
    );
  }

  // ---- UI block components ----
  const StatChip = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="flex flex-col">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
    </div>
  );

  const CardMedia = ({ imgs }: { imgs: string[] }) => (
    <div className="flex flex-col gap-2">
      <div className="relative w-full md:h-32 h-[120px] rounded-xl overflow-hidden ring-1 ring-gray-200">
        <Image
          className="object-cover"
          src={imgs?.[0] || "/images/buy_home.webp"}
          alt="image 1"
          fill
        />
      </div>
      <div className="w-full grid grid-cols-2 gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative w-full md:h-16 h-14 rounded-lg overflow-hidden ring-1 ring-gray-200"
          >
            <Image
              className="object-cover"
              src={imgs?.[i] || "/images/buy_home.webp"}
              alt={`image ${i + 1}`}
              fill
            />
            {!!imgs?.length && imgs.length > 3 && i === 2 && (
              <span className="w-full h-full bg-black/40 absolute font-medium z-10 grid place-items-center text-white text-xs">
                +{imgs.length - 3} photos
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleAddPremiumToCart = (plan: { id: string; name: string; price: string }, propertyId: string) => {
    const uid = user?.id;
    if (!uid) {
      toast.error("Please log in to add to cart");
      return;
    }
    addToCart(
      {
        productType: OrderItemType.PROPERTY_PREMIUM_PLAN,
        productId: plan.id as any,
        name: plan.name,
        mrp: Number(plan.price),
        sellingPrice: Number(plan.price),
        quantity: 1,
        taxPercent: 0,
        meta: { propertyId },
      },
      uid
    );
    setPremiumModalOpen(false);
    setSelectedPropertyForPremium(null);
    toast.success("Added to cart. Proceed to checkout to complete payment.");
  };

  const ActionButtons = ({ property }: { property: PropertyStore }) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-[#3586FF] hover:bg-[#2d75e6] transition-colors"
        onClick={() => handleView(property)}
      >
        View Details
      </Button>
      <Button
        className="px-4 py-2 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
        onClick={() => {
          setSelectedPropertyForPremium(property);
          setPremiumModalOpen(true);
        }}
      >
        Boost listing
      </Button>
      <Button
        className="px-4 py-2 rounded-lg text-xs font-medium text-[#3586FF] bg-blue-50 hover:bg-blue-100 transition-colors"
        onClick={() => {
          setProperty(property);
          router.push(`/user/properties/${property.propertyId}/viewleads`);
        }}
      >
        View Leads
      </Button>
      <Button
        className="px-4 py-2 rounded-lg text-xs font-medium text-[#3586FF] bg-blue-50 hover:bg-blue-100 transition-colors"
        onClick={() => {
          setProperty(property);
          router.push(`/user/properties/${property.propertyId}/viewanalytics`);
        }}
      >
        View Analytics
      </Button>
    </div>
  );
  const EditDelete = ({
    property,
    onDeleteClick,
  }: {
    property: PropertyStore;
    onDeleteClick: () => void;
  }) => (
    <div className="flex md:flex-col flex-row gap-2 justify-center md:justify-start">
      <Button
        className="py-2 px-4 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-colors"
        onClick={() => handleEdit(property)}
      >
        <FaEdit size={12} /> Edit
      </Button>

      <Button
        className="py-2 px-4 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 flex justify-center items-center gap-1.5 transition-colors"
        onClick={onDeleteClick}
      >
        <CgTrash size={14} /> Delete
      </Button>
    </div>
  );

  return (
    <div className="w-full bg-slate-50/50 min-h-screen p-4 md:p-6">
      {/* Reminder: Boost listings */}
      {properties?.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-amber-900">Get more visibility</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Boost your listings with Featured or Sponsored plans and reach more buyers.
            </p>
          </div>
          <Button
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200"
            onClick={() => {
              const first = properties[0];
              if (first) {
                setSelectedPropertyForPremium(first);
                setPremiumModalOpen(true);
              }
            }}
          >
            View premium plans
          </Button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="md:text-2xl text-xl font-semibold text-slate-800">
                My Properties
              </h1>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-[#3586FF] border border-blue-100">
                {properties.length} total
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Manage and track all your listed properties</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ReusableSearchFilter
              searchText={query}
              onSearchChange={setQuery}
              placeholder="Search by name, city, type..."
              filters={filterConfig}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
              rootCls="w-full md:w-[400px]"
            />

            <div className="flex items-center rounded-lg overflow-hidden border border-slate-200 bg-white">
              <Button
                onClick={() => setViewMode("list")}
                className={`px-3 h-9 grid place-items-center transition-colors ${viewMode === "list" ? "bg-slate-100 text-[#3586FF]" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                aria-label="List view"
              >
                <List size={18} />
              </Button>
              <Button
                onClick={() => setViewMode("grid")}
                className={`px-3 h-9 grid place-items-center transition-colors ${viewMode === "grid" ? "bg-slate-100 text-[#3586FF]" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </Button>
            </div>

            <Button
              className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-[#3586FF] hover:bg-[#2d75e6] transition-colors shadow-sm"
              onClick={() => router.push("/post-property/details")}
            >
              + Add Property
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        {filtered && filtered.length > 0 ? (
          viewMode === "list" ? (
            filtered.map((property) => (
              <div
                className="w-full rounded-xl bg-white md:flex-row flex-col flex gap-5 md:px-5 px-3 md:py-5 py-4 md:items-start items-center border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                key={property.propertyId}
              >
                <div className="md:w-[22%] w-full">
                  <CardMedia
                    imgs={property.mediaDetails?.propertyImages || []}
                  />
                </div>

                <div className="md:w-[63%] w-full flex flex-col justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 w-full md:px-0 px-1 gap-4">
                    <StatChip
                      label="Property Name"
                      value={property.propertyDetails?.propertyName || "-"}
                    />
                    <StatChip
                      label="City"
                      value={property.locationDetails?.city || "-"}
                    />
                    <StatChip
                      label="Property Type"
                      value={property.propertyDetails?.propertyType || "-"}
                    />

                    {property.propertyDetails?.residentialAttributes
                      ?.buildupArea ? (
                      <StatChip
                        label="Build-up Area"
                        value={
                          <>
                            {property.propertyDetails?.residentialAttributes?.buildupArea?.size}{" "}
                            {property.propertyDetails?.residentialAttributes?.buildupArea?.unit}
                          </>
                        }
                      />
                    ) : (
                      <StatChip
                        label="Build-up Area"
                        value={
                          <>
                            {property.propertyDetails?.commercialAttributes?.builtUpArea?.size}{" "}
                            {property.propertyDetails?.commercialAttributes?.builtUpArea?.unit}
                          </>
                        }
                      />
                    )}

                    {property.propertyDetails?.residentialAttributes?.bhk && (
                      <StatChip
                        label="No of BHK"
                        value={property.propertyDetails?.residentialAttributes?.bhk}
                      />
                    )}
                     {property.propertyDetails?.flatshareAttributes?.bhk && (
                      <StatChip
                        label="No of BHK"
                        value={property.propertyDetails?.flatshareAttributes?.bhk}
                      />
                    )}

{property.propertyDetails?.furnishing?.furnishedType && (
                    <StatChip
                      label="Furnishing"
                      value={property.propertyDetails?.furnishing?.furnishedType || "-"}
                    />)}

                    {property.propertyDetails?.pricingDetails?.monthlyRent ? (
                      <StatChip
                        label="Monthly Rent"
                        value={property.propertyDetails?.pricingDetails?.monthlyRent}
                      />
                    ) : (
                      <StatChip
                        label="Expected Price"
                        value={property.propertyDetails?.pricingDetails?.expectedPrice || "-"}
                      />
                    )}

                    {/* Analytics quick pill */}
                    <div className="flex items-end">
                      <div className="mt-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium">
                        <BarChart3 size={14} />
                        {propertyAnalyticsMap.get(property.propertyId!) || 0} views
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <ActionButtons property={property} />
                  </div>
                </div>

                {/* Right actions */}
                <div className="md:w-[15%] w-full md:max-w-[160px] flex md:flex-col gap-2 justify-center md:justify-start md:items-stretch">
                  <EditDelete
                    property={property}
                    onDeleteClick={() => {
                      setSelectedDeleteId(property.propertyId!);
                      setSelectedPropertyForDelete(property);
                      setOpenDeleteModal(true);
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            // Grid view
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((property) => (
                <div
                  key={property.propertyId}
                  className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Top media */}
                  <div className="relative w-full h-48">
                    <Image
                      src={
                        property.mediaDetails?.propertyImages?.[0] ||
                        "/images/buy_home.webp"
                      }
                      alt={property.propertyDetails?.propertyName || "Property"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-gray-800 text-xs border border-gray-200">
                      <BarChart3 size={14} />{" "}
                      {propertyAnalyticsMap.get(property.propertyId!) || 0}
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-medium text-[15px] text-gray-900 truncate">
                          {property.propertyDetails?.propertyName}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {property.locationDetails?.city} ·{" "}
                          {property.propertyDetails?.propertyType}
                        </p>
                      </div>
                      <button
                        onClick={() => handleView(property)}
                        className="shrink-0 inline-flex items-center gap-1 text-xs text-[#3586FF] hover:text-[#3586FF]"
                      >
                        View <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      {property.propertyDetails?.residentialAttributes
                        ?.buildupArea ? (
                        <div>
                          <p className="text-gray-500">Build-up Area</p>
                          <p className="font-medium">
                            {
                              property.propertyDetails?.residentialAttributes
                                ?.buildupArea?.size
                            }
                            {
                              property.propertyDetails?.residentialAttributes
                                ?.buildupArea?.unit
                            }
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500">Build-up Area</p>
                          <p className="font-medium">
                            {
                              property.propertyDetails?.commercialAttributes
                                ?.builtUpArea?.size
                            }
                            {
                              property.propertyDetails?.commercialAttributes
                                ?.builtUpArea?.unit
                            }
                          </p>
                        </div>
                      )}
                      {property.propertyDetails?.residentialAttributes?.bhk && (
                        <div>
                          <p className="text-gray-500">BHK</p>
                          <p className="font-medium">
                            {
                              property.propertyDetails?.residentialAttributes
                                ?.bhk
                            }
                          </p>
                        </div>
                      )}
                       {property?.propertyDetails?.flatshareAttributes?.bhk && (
                        <div>
                          <p className="text-gray-500">BHK</p>
                          <p className="font-medium">
                            {
                              property?.propertyDetails?.flatshareAttributes?.bhk
                            }
                          </p>
                        </div>
                      )}
                      {property.propertyDetails?.furnishing
                            ?.furnishedType && 
                        <div>
                          <p className="text-gray-500">Furniture</p>
                          <p className="font-medium">
                            {property.propertyDetails?.furnishing
                              ?.furnishedType || "-"}
                        </p>
                      </div>}
                      <div>
                        <p className="text-gray-500">
                          {property.propertyDetails?.pricingDetails?.monthlyRent
                            ? "Monthly Rent"
                            : "Expected Price"}
                        </p>
                        <p className="font-medium">
                          {property.propertyDetails?.pricingDetails
                            ?.monthlyRent ||
                            property.propertyDetails?.pricingDetails
                              ?.expectedPrice ||
                            "-"}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <Button
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200"
                        onClick={() => {
                          setSelectedPropertyForPremium(property);
                          setPremiumModalOpen(true);
                        }}
                      >
                        Boost
                      </Button>
                      <Button
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#3586FF]"
                        onClick={() => {
                          setProperty(property);
                          router.push(
                            `/user/properties/${property.propertyId}/viewleads`
                          );
                        }}
                      >
                        Leads
                      </Button>
                      <Button
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#3586FF]"
                        onClick={() => {
                          setProperty(property);
                          router.push(
                            `/user/properties/${property.propertyId}/viewanalytics`
                          );
                        }}
                      >
                        Analytics
                      </Button>
                      <Button
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-gray-800 bg-gray-100"
                        onClick={() => handleEdit(property)}
                      >
                        Edit
                      </Button>
                      <Button
                        className="px-3 py-1.5 rounded-md text-xs font-medium text-[#CA4D37] bg-gray-100"
                        onClick={() => {
                          if (property.propertyId) {
                            setSelectedDeleteId(property.propertyId);
                            setSelectedPropertyForDelete(property);
                            setOpenDeleteModal(true);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Home size={36} className="text-[#3586FF]/40" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base mb-2">
              No properties found
            </h3>
            <p className="text-slate-500 text-sm text-center max-w-md mb-6">
              {query || Object.keys(selectedFilters).length > 0
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by adding your first property."}
            </p>
            {!query && Object.keys(selectedFilters).length === 0 && (
              <Button
                className="px-6 py-2.5 rounded-lg text-sm text-white bg-[#3586FF] hover:bg-[#2d75e6] font-medium shadow-sm transition-colors"
                onClick={() => router.push("/post-property/details")}
              >
                + Add Your First Property
              </Button>
            )}
          </div>
        )}
      </div>
      <Modal
        isOpen={premiumModalOpen}
        closeModal={() => {
          setPremiumModalOpen(false);
          setSelectedPropertyForPremium(null);
        }}
        title="Boost your listing – Premium packages"
        className="max-w-[520px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
      >
        <div className="p-4">
          {selectedPropertyForPremium && (
            <p className="text-sm text-slate-600 mb-4">
              Choose a plan for <strong>{selectedPropertyForPremium.propertyDetails?.propertyName ?? selectedPropertyForPremium.propertyId}</strong>. You’ll complete payment in cart → checkout.
            </p>
          )}
          {loadingPlans ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : premiumPlans.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No premium plans available at the moment.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {premiumPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div>
                    <p className="font-medium text-slate-800">{plan.name}</p>
                    <p className="text-xs text-slate-500">
                      {plan.promotionType} · {plan.durationDays} days
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">₹{Number(plan.price).toLocaleString("en-IN")}</span>
                    <Button
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#3586FF]"
                      onClick={() => selectedPropertyForPremium?.propertyId && handleAddPremiumToCart(plan, selectedPropertyForPremium.propertyId)}
                    >
                      Add to cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#3586FF] bg-blue-50"
              onClick={() => {
                setPremiumModalOpen(false);
                setSelectedPropertyForPremium(null);
                router.push("/cart");
              }}
            >
              Go to cart
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openDeleteModal}
        closeModal={() => {
          setOpenDeleteModal(false);
          setSelectedPropertyForDelete(null);
        }}
        title=""
        className="max-w-[400px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6">
          <div className="flex flex-col items-center mb-5">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <CgTrash size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Delete Property
            </h3>
            <p className="text-sm text-slate-500 text-center">
              Are you sure you want to delete this property? This action cannot be undone.
              {selectedPropertyForDelete &&
                (() => {
                  const types = selectedPropertyForDelete.promotionType ?? [];
                  const expiry = selectedPropertyForDelete.promotionExpiry
                    ? new Date(selectedPropertyForDelete.promotionExpiry)
                    : null;
                  const hasActivePremium =
                    types.length > 0 && (!expiry || expiry > new Date());
                  return hasActivePremium ? (
                    <span className="block mt-3 text-amber-700 font-medium">
                      This property has active premium or boosted listing(s). All of that will be lost and cannot be recovered if you delete.
                    </span>
                  ) : null;
                })()}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              onClick={() => {
                setOpenDeleteModal(false);
                setSelectedPropertyForDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
              onClick={() => {
                if (selectedDeleteId) {
                  handleDelete(selectedDeleteId);
                }
                setOpenDeleteModal(false);
                setSelectedPropertyForDelete(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={handleDrawerClose}
          closeIconCls="text-black"
          openVariant="right"
          panelCls="w-[90%] md:w-[80%] lg:w-[calc(77%-230px)] shadow-2xl z-[9999999]"
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
