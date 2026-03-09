import SingleProperty from "./SingleProperty";
import React, { useEffect, useRef, useState, useMemo } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PropertyStore } from "@/store/postproperty";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { usePathname } from "next/navigation";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { PropertyTab } from "@/common/PropertyFilterBar";
import { twMerge } from "tailwind-merge";
import { IoMdArrowDropdown } from "react-icons/io";
import { useRouter } from "next/router";
import { DropDown } from "@/common/PopOver";
import Button from "@/common/Button";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import GoogleAdSense from "../GoogleAdSense";
import { parseQueryParam, removeAllSpaces } from "@/utils/helpers";
import CheckboxInput from "@/common/FormElements/CheckBoxInput";
import Modal from "@/common/Modal";
import { ArrowRight, Share2, Download, X, Trash2, Scale } from "lucide-react";
import EmptyState from "../EmptyState";
import { CompanyProjectCard } from "../CompanyProject/ProjectCardList/companyProjectCard";
import { lowerCase } from "lodash";
import isEqual from "lodash.isequal";
import { usePropertyFilterStore } from "@/store/usePropertyFilterStore";
import PropertyAds from "../PropertiesListComponent/PropertiesAds";

/** Format earning amount for display (e.g. 25000 -> "₹25k", 150000 -> "₹1.5L"). */
function formatEarning(amount: number): string {
  if (amount >= 10_00_000) return `₹${amount / 10_00_000}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}k`;
  return `₹${Math.round(amount)}`;
}

export type ReferAndEarnOption = { label: string; value: string };

/** Build Refer & Earn filter options from DB referrerValue (unique, sorted). Value = string number for client-side filter. */
function buildReferAndEarnOptionsFromAgreements(
  individualProperties: any[]
): ReferAndEarnOption[] {
  const values = new Set<number>();
  for (const p of individualProperties || []) {
    const active = Array.isArray(p?.referralAgreements)
      ? p.referralAgreements.find((a: any) => a?.status === "ACTIVE")
      : null;
    const rv = active?.referrerValue;
    const num = typeof rv === "string" ? parseFloat(rv) : rv;
    if (typeof num === "number" && !Number.isNaN(num) && num > 0) values.add(num);
  }
  const sorted = Array.from(values).sort((a, b) => a - b);
  return sorted.map((v) => ({
    label: `Earn up to ${formatEarning(v)}`,
    value: String(v),
  }));
}

export type AllowedUnits =
  | "sq.ft"
  | "sq.yard"
  | "sq.meter"
  | "acre"
  | "cent"
  | "marla"
  | "";
export interface SizeWithUnit {
  size: number | null;
  unit: AllowedUnits;
}

type CompareItem = {
  id: string | number;
  type: "company" | "property";
  name: string;
  city: string;
  locality: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  company?: string;
  developer?: string;
  estdYear?: string;
  size?: SizeWithUnit | null;
  bhkType?: string[];
  facing?: string[];
  purpose?: string[];
  furnishingType?: string[];
  saleType?: string[];
  genderPreference?: string[];
  sharingType?: string[];
  constructionStatus?: string | string[];
  ageOfProperty?: string | string[];
  amenities?: string[];
  lookingType?: string;
  expectedPrice?: number;
  monthlyRent?: number;
  promotions?: string[];
  image?: string;
};

const PropertiesListComponent = () => {
  const [properties, setProperties] = useState<PropertyStore[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyStore[]>(
    [],
  );
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<Array<string | number>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("Relevance");
  const [isReferAndEarnOnly, setIsReferAndEarnOnly] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname?.split("/");
  const {
    locality: localityParam,
    localityId: localityIdParam,
    builderId: builderIdParam,
    referAndEarn: referAndEarnParam,
  } = router.query;
  const locality = typeof localityParam === "string" ? decodeURIComponent(localityParam) : "";
  const localityId = typeof localityIdParam === "string" ? localityIdParam : undefined;
  const builderId = typeof builderIdParam === "string" ? builderIdParam : undefined;

  const {
    filters,
    selectedCities,
    activeTab,
    setActiveTab,
    setFilters,
    setSelectedCities,
    setReferAndEarnPriceOptions,
  } = usePropertyFilterStore();

  const prevQueryRef = useRef({});
  const lastFetchPayloadRef = useRef<string>("");
  const propertyTypeMap: Record<string, string> = {
    Apartment: "Apartment",
    IndependentHouse: "Independent House",
    IndependentFloor: "Independent Floor",
    Villa: "Villa",
    Plot: "Plot",
    AgriculturalLand: "Agricultural Land",
  };
  const MAX_COMPARE = 4;
  const toggleCompare = (item: any) => {
    const id = item.id ?? item.propertyId;

    setCompareIds((prev: any) => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter((i: any) => i !== id);
      }

      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} items`);
        return prev;
      }

      return [...prev, id];
    });
  };

  function normalizeCompareItem(item: any): CompareItem {
    if (item?.company) {
      return {
        id: item?.id,
        type: "company",
        name: item?.name,
        city: item?.location?.city || "-",
        locality: item?.location?.locality || "-",
        minPrice: item?.minPrice,
        maxPrice: item?.maxPrice,
        propertyType: item?.propertyType,
        company: item?.company?.name,
        developer: item?.company?.developer,
        size: item?.size
          ? { size: item?.size?.size, unit: item?.size?.unit as AllowedUnits }
          : null,

        constructionStatus: item.constructionStatus?.status,
        ageOfProperty: item?.ageOfProperty,
        amenities: item?.amenities || [],
        promotions: item?.promotionType || [],
        image:
          item?.mediaDetails?.propertyImages?.[0] ||
          "https://via.placeholder.com/60x60.png?text=P",
      };
    }

    const details = item?.propertyDetails;
    const purpose = item?.basicDetails?.purpose;
    const lookingType = item?.basicDetails?.lookingType;

    let bhkType: string[] = [];
    let facing: string[] = [];
    let furnishingType: string[] = [];
    let genderPreference: string[] = [];
    let saleType: string[] = [];
    let sharingType: string[] = [];

    if (purpose === "Residential") {
      if (lookingType === "Flat Share") {
        bhkType = details?.flatshareAttributes?.bhk
          ? [details.flatshareAttributes.bhk]
          : [];
        facing = details?.flatshareAttributes?.facing
          ? [details.flatshareAttributes.facing]
          : [];
        furnishingType = details?.furnishing
          ? [details.furnishing.furnishingType]
          : [];
        genderPreference = details?.flatshareAttributes?.genderPreference
          ? [details.flatshareAttributes.genderPreference]
          : [];
        sharingType = details?.flatshareAttributes?.sharingType
          ? [details.flatshareAttributes.sharingType]
          : [];
      } else {
        bhkType = details?.residentialAttributes?.bhk
          ? [details.residentialAttributes.bhk]
          : [];
        facing = details?.residentialAttributes?.facing
          ? [details.residentialAttributes.facing]
          : [];
        furnishingType = details?.furnishing
          ? [details.furnishing.furnishingType]
          : [];
      }
    }

    if (purpose === "Commercial") {
      furnishingType = details?.furnishing
        ? [details.furnishing.furnishingType]
        : [];
      saleType = details?.commercialAttributes?.ownership || [];
    }

    if (
      purpose === "Residential" &&
      (details?.propertyType === "Plot" ||
        details?.propertyType === "AgriculturalLand")
    ) {
      facing = details?.plotAttributes?.facing
        ? [details.plotAttributes.facing]
        : [];
      saleType = details?.plotAttributes?.saleType
        ? [details.plotAttributes.saleType]
        : [];
    }

    return {
      id: item?.propertyId,
      type: "property",
      name: details?.propertyName || "Unnamed Property",
      city: item?.locationDetails?.city || "-",
      locality: item?.locationDetails?.locality || "-",
      propertyType: details?.propertyType,
      bhkType,
      facing,
      purpose: item?.BasicDeatils?.purpose || [],
      furnishingType,
      saleType,
      genderPreference,
      sharingType,
      constructionStatus: details?.constructionStatus?.status,

      promotions: item.promotionType || [],
      lookingType,
      expectedPrice: details?.pricingDetails?.expectedPrice,
      monthlyRent: details?.pricingDetails?.monthlyRent,
      image:
        item?.mediaDetails?.propertyImages?.[0] ||
        "https://via.placeholder.com/60x60.png?text=P",
    };
  }

  const clearCompare = () => setCompareIds([]);

  const comparedProjects = useMemo(
    () =>
      (filteredProperties || [])
        .filter((p: any) => {
          const id = p.id ?? p.propertyId;
          return compareIds.includes(id);
        })
        .map(normalizeCompareItem),
    [filteredProperties, compareIds],
  );

  const propertiesToShow = useMemo(() => {
    if (!isReferAndEarnOnly || !filters.referAndEarnPriceRange?.length)
      return filteredProperties;
    const selected = new Set(filters.referAndEarnPriceRange);
    return (filteredProperties || []).filter((p: any) => {
      const active = Array.isArray(p?.referralAgreements)
        ? p.referralAgreements.find((a: any) => a?.status === "ACTIVE")
        : null;
      const rv = active?.referrerValue;
      const num = rv != null ? (typeof rv === "string" ? parseFloat(rv) : rv) : null;
      return typeof num === "number" && !Number.isNaN(num) && selected.has(String(num));
    });
  }, [filteredProperties, isReferAndEarnOnly, filters.referAndEarnPriceRange]);

  const [showDifferences, setShowDifferences] = useState(false);

  const areValuesDifferent = (label: string, items: CompareItem[]) => {
    const values = items.map((p) => {
      const group = fieldGroups.find((fg) => fg.label === label);
      return group?.getter(p) ?? null;
    });
    return new Set(values).size > 1;
  };

  useEffect(() => {
    const queryPage = Number(router.query.page || 1);
    setCurrentPage(queryPage);
  }, [router.query.page]);

  useEffect(() => {
    const flag =
      typeof referAndEarnParam === "string"
        ? referAndEarnParam.toLowerCase() === "true"
        : false;
    setIsReferAndEarnOnly(flag);
  }, [referAndEarnParam]);

  useEffect(() => {
    if (!router.isReady) return;

    const tabFromURL = pathSegments?.[2] as PropertyTab;
    const cityFromURL = pathSegments?.[3];

    setActiveTab(tabFromURL || "buy");
    if (cityFromURL) setSelectedCities([cityFromURL]);

    setFilters({
      propertyType: parseQueryParam(router.query.propertyType),
      bhkType: parseQueryParam(router.query.bhkType),
      priceRange: parseQueryParam(router.query.priceRange),
      referAndEarnPriceRange: parseQueryParam(router.query.referAndEarnPriceRange),
      saleType: parseQueryParam(router.query.saleType),
      furnishingType: parseQueryParam(router.query.furnishingType),
      constructionStatus: parseQueryParam(router.query.constructionStatus),

      amenities: parseQueryParam(router.query.amenities),
      propertyAge: parseQueryParam(router.query.propertyAge),
      facing: parseQueryParam(router.query.facing),
      genderPreference: parseQueryParam(router.query.genderPreference),
      sharingType: parseQueryParam(router.query.sharingType),
      builtUpArea: [0, 5000],
      purpose: parseQueryParam(router.query.purpose),
    });
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady || !selectedCities.length) return;
    let lookingTypeArray: string[] = [];

    if (activeTab === "rent") {
      lookingTypeArray = ["Rent"];
    } else if (activeTab === "flatshare") {
      lookingTypeArray = ["Flat Share"];
    } else {
      lookingTypeArray = ["Sell"];
    }

    const payloadObj = {
      city: selectedCities.map((c) => lowerCase(c)),
      locality: locality || undefined,
      localityId: localityId || undefined,
      builderId: builderId || undefined,
      // propertytype:
      //   activeTab === "plot"
      //     ? ["Plot"]
      //     : filters.propertyType?.map((pt) => pt.replace(/\s+/g, "")),
      propertytype:
        activeTab === "plot"
          ? ["Plot"]
          : filters.propertyType?.map((pt) => propertyTypeMap[pt] || pt),

      bhkType: removeAllSpaces(filters?.bhkType),
      lookingtype: lookingTypeArray,
      facing: filters.facing,
      priceRange: isReferAndEarnOnly ? undefined : filters.priceRange,
      amenities: filters.amenities,
      constructionStatus: filters.constructionStatus,
      furnishingType: filters.furnishingType,

      ageOfProperty: filters.propertyAge,
      genderPreference: filters.genderPreference,
      // builtUpArea: filters.builtUpArea,
      saleType: filters.saleType,
      sharingType: filters.sharingType,
      page: currentPage,
      purpose: filters.purpose,
      referAndEarnOnly: isReferAndEarnOnly || undefined,
    };

    const payloadStr = JSON.stringify(payloadObj);
    if (payloadStr === lastFetchPayloadRef.current) return;
    lastFetchPayloadRef.current = payloadStr;

    const fetchProperties = async (payloadObj: any) => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          apiClient.URLS.unified_listing,
          payloadObj,
          false,
        );
        if (response.status === 200) {
          const unified = response.body;
          const normalizedSelectedBHKs = removeAllSpaces(
            filters?.bhkType || [],
          );

          const filteredCompanyProjects = (
            unified?.companyProjects || []
          ).filter((project: any) => {
            if (!normalizedSelectedBHKs?.length) return true;

            const unitBHKs =
              project.units?.map((unit: any) =>
                unit.BHK?.replace(/\s+/g, ""),
              ) || [];

            return unitBHKs.some((unitBHK: any) =>
              normalizedSelectedBHKs?.includes(unitBHK),
            );
          });

          const allProperties = [
            ...filteredCompanyProjects,
            ...(unified?.individualProperties || []),
          ];

          setProperties(allProperties);
          setFilteredProperties(allProperties);

          if (payloadObj.referAndEarnOnly && Array.isArray(unified?.individualProperties)) {
            const options = buildReferAndEarnOptionsFromAgreements(
              unified.individualProperties
            );
            setReferAndEarnPriceOptions(options);
          } else {
            setReferAndEarnPriceOptions([]);
          }

          const unifiedPagination = unified.pagination;
          setCurrentPage(unifiedPagination?.currentPage || 1);
          setTotalPages(unifiedPagination?.totalPages || 1);
        }
      } catch (err) {
        toast.error("Error fetching properties");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties(payloadObj);
  }, [
    filters,
    selectedCities,
    activeTab,
    router.isReady,
    localityId,
    builderId,
    locality,
    currentPage,
    isReferAndEarnOnly,
  ]);

  useEffect(() => {
    if (!router.isReady) return;

    const newQuery: Record<string, string> = {};

    if (typeof router.query.purpose === "string" && router.query.purpose)
      newQuery.purpose = router.query.purpose;
    if (typeof router.query.localityId === "string" && router.query.localityId)
      newQuery.localityId = router.query.localityId;
    if (typeof router.query.builderId === "string" && router.query.builderId)
      newQuery.builderId = router.query.builderId;
    if (typeof router.query.builderName === "string" && router.query.builderName)
      newQuery.builderName = router.query.builderName;
    if (typeof router.query.locality === "string" && router.query.locality)
      newQuery.locality = router.query.locality;

    if (filters.propertyType?.length)
      newQuery.propertyType = filters.propertyType.join(",");
    if (filters.bhkType?.length && activeTab !== "plot")
      newQuery.bhkType = filters.bhkType.join(",");
    if (filters.priceRange?.length)
      newQuery.priceRange = filters.priceRange.join(",");
    if (
      isReferAndEarnOnly &&
      filters.referAndEarnPriceRange?.length
    )
      newQuery.referAndEarnPriceRange =
        filters.referAndEarnPriceRange.join(",");
    if (filters.saleType?.length && activeTab === "buy")
      newQuery.saleType = filters.saleType.join(",");
    if (filters.furnishingType?.length && activeTab === "rent")
      newQuery.furnishingType = filters.furnishingType.join(",");
    if (filters.constructionStatus?.length && activeTab === "buy")
      newQuery.constructionStatus = filters.constructionStatus.join(",");
    if (filters.amenities?.length)
      newQuery.amenities = filters.amenities.join(",");
    if (filters.propertyAge?.length && activeTab === "buy")
      newQuery.propertyAge = filters.propertyAge.join(",");
    if (filters.facing?.length) newQuery.facing = filters.facing.join(",");
    if (filters.genderPreference?.length)
      newQuery.genderPreference = filters.genderPreference.join(",");

    if (filters.purpose?.length) newQuery.purpose = filters.purpose.join(",");

    if (filters.sharingType?.length)
      newQuery.sharingType = filters.sharingType.join(",");

    if (isReferAndEarnOnly) {
      newQuery.referAndEarn = "true";
    }

    if (localityId) newQuery.localityId = localityId;
    if (builderId) newQuery.builderId = builderId;
    const builderNameParam = router.query.builderName;
    if (typeof builderNameParam === "string" && builderNameParam)
      newQuery.builderName = builderNameParam;
    if (locality) newQuery.locality = locality;

    newQuery.page = currentPage.toString();

    const queryChanged = !isEqual(prevQueryRef.current, newQuery);
    if (queryChanged) {
      prevQueryRef.current = newQuery;
      router.push(
        {
          pathname: `/properties/${activeTab}/${
            selectedCities?.[0] ?? "Hyderabad"
          }`,
          query: newQuery,
        },
        undefined,
        { shallow: true },
      );
    }
  }, [
    filters,
    activeTab,
    selectedCities,
    currentPage,
    router.isReady,
    localityId,
    builderId,
    locality,
    isReferAndEarnOnly,
  ]);

  useEffect(() => {
    const getSortValue = (item: any) => {
      const isCompany = !!item.company;
      switch (sortOption) {
        case "Price (Low to High)":
        case "Price (High to Low)":
          if (isCompany) return item.minPrice ?? item.maxPrice ?? 0;
          else {
            const pricing = item.propertyDetails?.pricingDetails || {};
            return item.basicDetails?.lookingType === "Rent" ||
              item.basicDetails?.lookingType === "Flat Share"
              ? (pricing.monthlyRent ?? 0)
              : (pricing.expectedPrice ?? 0);
          }
        case "Area (Low to High)":
        case "Area (High to Low)":
          return isCompany
            ? (item.ProjectArea?.size ?? 0)
            : (item.propertyDetails?.residentialAttributes?.buildupArea?.size ??
                0);
        case "Date Added":
          return new Date(
            isCompany ? item.postedAt : (item.postedDate ?? 0),
          ).getTime();
        default:
          return 0;
      }
    };

    const sorted = [...properties];
    const ascending = ["Price (Low to High)", "Area (Low to High)"].includes(
      sortOption,
    );
    const descending = [
      "Price (High to Low)",
      "Area (High to Low)",
      "Date Added",
    ].includes(sortOption);

    if (ascending) sorted.sort((a, b) => getSortValue(a) - getSortValue(b));
    else if (descending)
      sorted.sort((a, b) => getSortValue(b) - getSortValue(a));

    setFilteredProperties(sorted);
  }, [sortOption, properties]);

  if (loading) return <Loader />;

  const cityFromURL = pathSegments?.[3] || "";
  const sortOptions = [
    "Relevance",
    "Price (Low to High)",
    "Price (High to Low)",
    "Area (Low to High)",
    "Area (High to Low)",
    "Date Added",
  ];

  const displayLabel = sortOption;

  const fieldGroups: {
    label: string;
    getter: (p: CompareItem) => any;
    type?: "company" | "property" | "both";
  }[] = [
    {
      label: "Location",
      getter: (p) => `${p.locality || "-"}, ${p.city || "-"}`,
      type: "both",
    },
    {
      label: "Property Type",
      getter: (p) => p.propertyType || "-",
      type: "both",
    },
    {
      label: "Cnst Status",
      getter: (p) => p.constructionStatus || "-",
      type: "both",
    },
    {
      label: "Promotions",
      getter: (p) => (p.promotions || []).join(", ") || "-",
      type: "both",
    },

    {
      label: "Price Range",
      getter: (p) =>
        p.type === "company"
          ? `₹ ${p.minPrice?.toLocaleString?.() || "-"} - ₹ ${
              p.maxPrice?.toLocaleString?.() || "-"
            }`
          : null,
      type: "company",
    },
    {
      label: "Developer",
      getter: (p) => (p.type === "company" ? p.developer || "-" : null),
      type: "company",
    },
    {
      label: "Project Size",
      getter: (p) =>
        p.type === "company" && p.size ? `${p.size.size} ${p.size.unit}` : null,
      type: "company",
    },
    {
      label: "Company",
      getter: (p) => (p.type === "company" ? p.company || "-" : null),
      type: "company",
    },

    {
      label: "Price",
      getter: (p) => {
        if (p.type !== "property") return null;

        if (p.lookingType === "Rent" || p.lookingType === "Flat Share") {
          return p.monthlyRent
            ? `₹ ${p.monthlyRent.toLocaleString?.()} / month`
            : "-";
        }

        return p.expectedPrice
          ? `₹ ${p.expectedPrice.toLocaleString?.()}`
          : "-";
      },
      type: "property",
    },

    {
      label: "BHK Type",
      getter: (p) =>
        p.type === "property" ? (p.bhkType || []).join(", ") : null,
      type: "property",
    },
    {
      label: "Sale Type",
      getter: (p) =>
        p.type === "property" ? (p?.saleType || []).join(", ") : null,
      type: "property",
    },
    {
      label: "Gender Preference",
      getter: (p) =>
        p.type === "property" ? (p.genderPreference || []).join(", ") : null,
      type: "property",
    },
    {
      label: "Sharing Type",
      getter: (p) =>
        p.type === "property" ? (p.sharingType || []).join(", ") : null,
      type: "property",
    },
    {
      label: "Facing",
      getter: (p) =>
        p.type === "property" ? (p.facing || []).join(", ") : null,
      type: "property",
    },
    {
      label: "Furnishing",
      getter: (p) =>
        p.type === "property" ? (p.furnishingType || []).join(", ") : null,
      type: "property",
    },
  ];

  const sharedCompared = async () => {
    if (comparedProjects.length === 0) return;
    const text =
      "Compare projects:\n" +
      comparedProjects
        .map((p: any) => `• ${p.name} (${p.location?.city || "-"})`)
        .join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: "properties Compare", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied compared list to clipboard");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const exportComparedCSV = () => {
    if (!comparedProjects || comparedProjects.length === 0) {
      toast.error("No projects to export");
      return;
    }

    const activeTypes = new Set(comparedProjects.map((p) => p.type));

    const activeFields = fieldGroups.filter(
      (f) => f.type === "both" || activeTypes.has(f.type as any),
    );

    const headers = ["Type", "Name", ...activeFields.map((f) => f.label)];

    const rows = comparedProjects.map((p) => [
      p.type === "company" ? "Company" : "Property",
      p.name,
      ...activeFields.map((f) => {
        const val = f.getter(p);
        return val != null && val !== "" ? val : "-";
      }),
    ]);

    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) =>
            typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compared_projects.csv";
    a.click();
    toast.success("Compared list exported");
  };

  return (
    <div className="px-4 mt-2 md:mb-10 md:space-y-5 space-y-3">
      {/* -- Top text -- */}
      {propertiesToShow?.length > 0 && (
        <div className="md:mt-[15px] mt-[8px] max-w-[1420px] text-[#3586FF] mx-auto px-2 font-medium md:text-[16px] text-[10px]">
          <span>{propertiesToShow?.length} properties For </span>
          <span>{activeTab === "rent" ? "Rent" : "Sale"} in </span>
          <span>
            {locality &&
              `${locality.charAt(0).toUpperCase() + locality.slice(1)}, `}
            {cityFromURL?.charAt(0).toUpperCase() + cityFromURL.slice(1)}
          </span>
        </div>
      )}

      {/* -- Sort and heading -- */}
      <div className="flex items-center justify-between md:max-w-[80%] max-w-full px-4 w-full">
        <div>
          <h1 className="font-medium text-[#3586FF] md:text-[14px] text-[12px] md:text-nowrap teext-wrap">
            Flats for{" "}
            {activeTab === "rent"
              ? "Rent"
              : activeTab === "flatshare"
                ? "FlatShare"
                : "Sale"}{" "}
            in
            {locality &&
              `${locality.charAt(0).toUpperCase() + locality.slice(1)}, `}
            , {selectedCities}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="font-medium md:text-[14px] text-[10px]">Sort By :</h1>
          <DropDown
            gapY={8}
            placement="bottom-start"
            fallBackPlcmnts={["bottom", "bottom-end"]}
            buttonElement={
              <Button className="flex items-center border rounded-[20px] md:text-[14px] text-[10px] md:px-4 px-2 py-[6px] font-medium bg-white text-black hover:bg-gray-100 text-nowrap">
                {displayLabel}
                <IoMdArrowDropdown className="w-4 h-4 ml-2" />
              </Button>
            }
          >
            <div
              className={twMerge(
                "md:absolute relative max-h-[200px] top-full md:left-0 left-0 mt-1 w-auto md:w-42 bg-white border rounded-md shadow-lg md:max-h-60 md:overflow-auto flex-col flex overflow-x-auto no-scrollbar md:p-1 p-2",
              )}
            >
              {sortOptions.map((option) => (
                <Button
                  key={option}
                  onClick={() => setSortOption(option)}
                  className={twMerge(
                    `border-[1px] text-[10px] text-nowrap border-gray-200 font-medium md:rounded-[0px] rounded-[0px] px-2 py-1 text-left ${
                      sortOption === option
                        ? "bg-[#3586FF] text-white"
                        : "bg-gray-100"
                    }`,
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </DropDown>
        </div>
      </div>

      {/* -- Main list -- */}
      <div
        className="mt-[15px] lg:mt-[25px] w-full flex flex-col lg:flex-row overflow-y-auto overflow-x-hidden"
        style={{ height: "calc(100vh - 140px)" }}
      >
        <div className="flex flex-col md:flex-[3] flex-1 md:px-5 px-2 gap-4 py-2 md:w-[80%] w-full">
          {propertiesToShow?.length > 0 ? (
            propertiesToShow.map((property: any, index) => (
              <React.Fragment
                key={`property-${index}--${Math.random() * 1000}`}
              >
                <div className="rounded-md">
                  {property?.company ? (
                    <CompanyProjectCard
                      data={property}
                      isCompared={compareIds.includes(property.id)}
                      onToggleCompare={() => toggleCompare(property)}
                      compareDisabled={
                        !compareIds.includes(property.id) &&
                        compareIds.length >= MAX_COMPARE
                      }
                    />
                  ) : (
                    <SingleProperty
                      property={property}
                      isCompared={compareIds.includes(property.propertyId)}
                      onToggleCompare={() => toggleCompare(property)}
                      compareDisabled={
                        !compareIds.includes(property.propertyId) &&
                        compareIds.length >= MAX_COMPARE
                      }
                    />
                  )}
                </div>
                {(index + 1) % 5 === 0 && (
                  <div className="block md:max-w-[90%] w-full rounded-md  my-4">
                    <GoogleAdSense key={`adsense-${index}`} />
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <EmptyState />
          )}
          {compareIds.length > 0 && (
  <div className="
    fixed md:bottom-5 bottom-3 left-1/2 -translate-x-1/2
    bg-white/80 backdrop-blur-xl
    border border-gray-200/60
    shadow-2xl shadow-blue-200/40
    rounded-2xl
    px-4 py-3 md:px-6 md:py-4
    z-40
    max-w-[96%]
    w-auto
    overflow-x-auto
    transition-all
  ">
    <div className="flex items-center gap-3 flex-wrap">

      {/* Counter */}
      <span className="flex items-center gap-1.5 text-[11px] md:text-[13px] text-[#3586FF] font-semibold">
        <Scale className="w-4 h-4" />
        Compare {compareIds.length}/{MAX_COMPARE}
      </span>

      {/* Selected Items */}
      <div className="flex items-center gap-2 flex-wrap">

        {comparedProjects.map((p: CompareItem) => (
          <div
            key={p.id}
            className="
              flex items-center gap-2
              bg-white
              border border-gray-200
              rounded-xl
              px-2.5 py-1.5
              shadow-sm
              hover:shadow-md
              hover:-translate-y-[1px]
              transition-all
            "
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 ring-1 ring-gray-200">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-[11px] md:text-[12px] font-semibold max-w-[120px] truncate">
              {p.name}
            </span>

            <Button
              onClick={() => toggleCompare(p)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">

        {/* Clear */}
        <Button
          onClick={clearCompare}
          className="
            px-3 py-1.5
            rounded-lg
            border border-gray-200
            bg-white
            hover:bg-gray-100
            hover:shadow-sm
            text-gray-700
            text-[11px]
            flex items-center gap-1.5
            transition
          "
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>

        {/* Share */}
        <Button
          onClick={sharedCompared}
          className="
            px-3 py-1.5
            rounded-lg
            border border-gray-200
            bg-white
            hover:bg-gray-100
            hover:shadow-sm
            text-gray-700
            text-[11px]
            flex items-center gap-1.5
            transition
          "
        >
          <Share2 className="w-3.5 h-3.5 text-[#3586FF]" />
          Share
        </Button>

        {/* Export */}
        <Button
          onClick={exportComparedCSV}
          className="
            px-3 py-1.5
            rounded-lg
            border border-gray-200
            bg-white
            hover:bg-gray-100
            hover:shadow-sm
            text-gray-700
            text-[11px]
            flex items-center gap-1.5
            transition
          "
        >
          <Download className="w-3.5 h-3.5 text-[#3586FF]" />
          Export
        </Button>

        {/* Compare CTA */}
        <Button
          onClick={() => setCompareOpen(true)}
          className="
            px-4 py-1.5
            rounded-lg
            bg-gradient-to-r from-[#3586FF] to-cyan-500
            hover:from-blue-600 hover:to-cyan-600
            text-white
            text-[11px]
            font-semibold
            shadow-md
            hover:shadow-lg
            active:scale-95
            flex items-center gap-1.5
            transition-all
          "
        >
          Compare
          <ArrowRight className="w-4 h-4" />
        </Button>

      </div>
    </div>
  </div>
)}

          <Modal
            isOpen={compareOpen}
            closeModal={() => setCompareOpen(false)}
            className="md:max-w-6xl max-w-[96vw]"
            title="Compare Projects"
            titleCls="font-bold  heading-text text-center text-[#3586FF]"
            rootCls="z-[99999]"
            isCloseRequired={false}
          >
            <div className="w-full">
              {comparedProjects.length < 2 ? (
                <p className="text-gray-600 md:text-[12px] text-[10px]">
                  Select at least two items to compare.
                </p>
              ) : (
                <div className="relative">
                  {/* Top controls (sticky inside modal) */}
                  <div className="sticky top-0 z-30 -mx-3 px-3 py-2 bg-white/95 backdrop-blur border-b">
                    <div className="flex items-center md:flex-row flex-col justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-blue-50 text-[#3586FF] font-medium text-[10px] md:text-[12px] text-nowrap">
                          {comparedProjects.length} selected
                        </span>

                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <CheckboxInput
                            label="Show only differences"
                            labelCls="font-medium text-[10px] md:text-[12px] text-gray-800"
                            name="differences"
                            className="rounded-sm md:h-[16px] h-[12px] md:w-[16px] w-[12px]"
                            type="checkbox"
                            checked={showDifferences}
                            onChange={() =>
                              setShowDifferences(!showDifferences)
                            }
                          />
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          className="px-3 py-1.5 rounded-md border font-medium border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[10px] md:text-[12px]"
                          onClick={clearCompare}
                        >
                          Clear
                        </Button>
                        <Button
                          className="px-3 py-1.5 rounded-md border font-medium border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-[10px] md:text-[12px]"
                          onClick={sharedCompared}
                        >
                          Share
                        </Button>
                        <Button
                          className="
                  px-3 py-1.5
                  rounded-lg
                  bg-gradient-to-r from-blue-500 to-cyan-500
                  text-white
                  shadow-md
                  hover:shadow-lg
                 text-[10px] md:text-[12px]
                  transition
                "
                          onClick={exportComparedCSV}
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="relative overflow-auto  rounded-xl bg-blue-50 max-h-[60vh] ring-1 ring-gray-200 shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent z-10" />

                    <table className="w-full border-collapse md:text-[12px] text-[10px]">
                      <caption className="sr-only">
                        Project comparison table
                      </caption>

                      <thead className="sticky top-[42px] md:top-[46px] bg-white z-20 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
                        <tr className="border-b">
                          <th className="sticky left-0 bg-white text-left text-gray-500 font-medium p-2 md:p-3 w-[170px] z-30">
                            Attribute
                          </th>

                          {comparedProjects?.length > 0 &&
                            comparedProjects.map((p: CompareItem) => {
                              const getPriceText = () => {
                                if (p.type === "company") {
                                  return p.minPrice || p.maxPrice
                                    ? `₹ ${p.minPrice?.toLocaleString?.() || "-"} – ₹ ${p.maxPrice?.toLocaleString?.() || "-"}`
                                    : null;
                                } else {
                                  return p.lookingType === "Rent" ||
                                    p.lookingType === "Flat Share"
                                    ? p.monthlyRent
                                      ? `₹ ${p.monthlyRent.toLocaleString?.()}/mo`
                                      : null
                                    : p.expectedPrice
                                      ? `₹ ${p.expectedPrice.toLocaleString?.()}`
                                      : null;
                                }
                              };

                              const priceText = getPriceText();

                              return (
                                <th
                                  key={p.id}
                                  className="text-left p-2 md:p-3 border-l-[1px] border-gray-200  min-w-[195px] bg-white"
                                >
                                  <div className="flex items-center gap-2">
                                    {/* Image */}
                                    <div className="relative md:w-10 w-9 md:h-10 h-14 md:rounded-lg rounded-[4px] overflow-hidden ring-1 ring-black/5 bg-gray-100 shrink-0">
                                      <Image
                                        className="object-cover"
                                        fill
                                        src={
                                          p.image ||
                                          "https://via.placeholder.com/60x60.png?text=P"
                                        }
                                        alt={p.name}
                                      />
                                    </div>

  <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 md:text-base text-sm leading-tight truncate">
                              {p.name}
                            </div>
                            <div className="text-gray-500 text-xs md:text-xs truncate flex items-center gap-1">
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {p.city}
                            </div>

                            {priceText ? (
                              <div className="hidden md:flex items-center gap-1 text-xs text-gray-600 mt-1">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded-md">{p.propertyType}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-green-600 font-medium">{priceText}</span>
                              </div>
                            ) : null}

                            <div className="md:hidden mt-1">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded-md text-gray-700">
                                  {p.propertyType}
                                </span>
                                {priceText && (
                                  <span className="text-[10px] text-green-600 font-medium">
                                    {priceText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                                    {/* Remove Button */}
                                    <Button
                                      onClick={() => toggleCompare(p)}
                                      title="Remove"
                                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </th>
                              );
                            })}
                        </tr>
                      </thead>

                      <tbody>
                        {fieldGroups.map(({ label, getter }) => {
                          const hasAnyValue = comparedProjects.some((p) =>
                            getter(p),
                          );
                          const rowDifferent = areValuesDifferent(
                            label,
                            comparedProjects,
                          );
                          const showRow =
                            hasAnyValue && (!showDifferences || rowDifferent);
                          if (!showRow) return null;

                          return (
                            <tr
                              key={label}
                              className={`align-top border-b transition-colors ${
                                rowDifferent ? "bg-amber-50/60" : "bg-white"
                              }`}
                            >
                              {/* sticky left attribute cell with accent when different */}
                              <th
                                scope="row"
                                className={`sticky left-0 bg-white font-bold text-label text-[#3586FF] p-2 md:p-3 whitespace-nowrap z-30 
                        ${
                          rowDifferent
                            ? "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-amber-400 before:content-['']"
                            : ""
                        }`}
                              >
                                {label}
                              </th>

                              {comparedProjects.map((p) => {
                                const value = getter(p) ?? "—";
                                return (
                                  <td
                                    key={`${p.id}-${label}`}
                                    className={`p-2 md:p-3 font-medium border-l-[1px] border-gray-300 align-top ${
                                      rowDifferent
                                        ? "text-gray-900"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                                      {value}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-2 text-[10px] md:text-[11px] text-gray-500">
                    Rows with a{" "}
                    <span className="inline-block align-middle h-[10px] w-[10px] bg-amber-400 rounded-sm mr-1" />
                    left accent indicate differences.
                  </div>
                </div>
              )}
            </div>
          </Modal>

          {propertiesToShow.length > 0 && totalPages > 1 && (
            <div className="flex justify-center items-center md:gap-2 gap-1 mt-6 flex-wrap">
              <Button
                disabled={currentPage === 1}
                onClick={() => {
                  const prev = Math.max(1, currentPage - 1);
                  setCurrentPage(prev);
                  router.push({
                    pathname: router.pathname,
                    query: { ...router.query, page: prev },
                  });
                }}
                className={`md:px-1 px-1 md:py-1 py-1 rounded-[4px] flex items-center gap-1 border md:text-[12px] text-[10px] ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-[#3586FF]"
                }`}
              >
                <IoMdArrowDropleft className="w-4 h-4" />
                Back
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      router.push({
                        pathname: router.pathname,
                        query: { ...router.query, page },
                      });
                    }}
                    className={`md:px-3 px-2 md:py-1 py-1 rounded-[4px] border md:text-[12px] text-[10px] ${
                      page === currentPage
                        ? "bg-[#3586FF] text-white"
                        : "bg-white text-gray-800 border-[1px] border-[#3586FF]"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                disabled={currentPage === totalPages}
                onClick={() => {
                  const next = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(next);
                  router.push({
                    pathname: router.pathname,
                    query: { ...router.query, page: next },
                  });
                }}
                className={`md:px-1 px-1 md:py-1 py-1 rounded-[4px] flex items-center gap-1 border md:text-[12px] text-[10px] ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-[#3586FF]"
                }`}
              >
                Next
                <IoMdArrowDropright className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="hidden lg:block lg:flex-[1] xl:flex-[2] sticky top-3 px-2">
          <PropertyAds />
        </div>
      </div>
    </div>
  );
};

export default PropertiesListComponent;
