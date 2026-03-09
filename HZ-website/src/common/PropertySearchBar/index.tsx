"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon } from "lucide-react";
import { IoIosSearch } from "react-icons/io";
import { GoChevronDown } from "react-icons/go";

import { DropDown } from "@/common/PopOver";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import { generateSlug } from "@/utils/helpers";
import { ResetIcon } from "../../components/Icons";

import { FilterOptions, PropertyTab } from "../PropertyFilterBar";
import { PurposeType } from "@/components/Property/PropertyDetails/PropertyHelpers";

interface PropsInterface {
  activeTab: PropertyTab;
  cityOptions: Array<{ label: string; value: string }>;
  searchrootCls?: string;
  dropDownButtonCls?: string;
  searchButtonCls?: string;
  outerSearchCls?: string;
  rootCls?: string;
}

interface SearchOptions {
  city: string;
  locality?: string;
  search?: string;
  propertyType?: string[];
  bhkType?: string[];
  priceRange?: string[];
  constructionStatus?: string[];
  facing?: string[];
  saleType?: string[];
  furnishingType?: string[];
  commercialPurpose?: string;
  genderPreference?: string[];
  sharingType?: string[];
  purpose?: string;
}

const activeTabOptions: Record<PropertyTab, FilterOptions> = {
  buy: {
    purpose: ["Residential", "Commercial"],
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    constructionStatus: ["Ready to Move", "Under Construction"],
    facing: ["East", "West", "North", "South"],
    priceRange: ["₹0 - ₹50L", "₹50L - ₹1Cr", "₹1Cr - ₹5Cr", "₹5Cr+"],
  },
  rent: {
    purpose: ["Residential", "Commercial"],
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    furnishingType: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
    facing: ["East", "West", "North", "South"],
  },
  plot: {
    purpose: ["Residential", "Commercial"],
    priceRange: ["₹0 - ₹50L", "₹50L - ₹1Cr", "₹1Cr+"],
    facing: ["East", "West", "North", "South"],
  },
  flatshare: {
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    sharingType: ["Shared", "Single", "Any"],
    genderPreference: ["Male", "Female", "Any"],
    facing: ["East", "West", "North", "South"],
  },
};

const toTitleCase = (str: string) =>
  str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

const clampLabel = (txt: string, max = 18) =>
  txt.length > max ? `${txt.slice(0, max)}…` : txt;

const PropertySearchBar = ({
  activeTab,
  cityOptions,
  searchrootCls,
  dropDownButtonCls,
  searchButtonCls,
  outerSearchCls,
  rootCls,
}: PropsInterface) => {
  const router = useRouter();

  const initialCity =
    (typeof window !== "undefined" && localStorage.getItem("city")) || "";

  const singleSelectKeys: (keyof SearchOptions)[] = ["purpose"];

  const getResetState = useCallback((): SearchOptions => {
    return {
      city: initialCity || cityOptions?.[0]?.label || "",
      locality: "",
      search: "",
      propertyType: [],
      bhkType: [],
      constructionStatus: [],
      priceRange: [],
      saleType: [],
      facing: [],
      genderPreference: [],
      sharingType: [],
      furnishingType: [],
      commercialPurpose: "Buy",
      purpose: PurposeType.Residential,
    };
  }, [cityOptions, initialCity]);

  const [mounted, setMounted] = useState(false);
  const [selectedFilters, setSelectedFilters] =
    useState<SearchOptions>(getResetState());

  const [suggestions, setSuggestions] = useState<
    { label: string; id: number; type: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Reset filters when tab changes
    setSelectedFilters(getResetState());
    setSuggestions([]);
    setShowSuggestions(false);
    setNoResults(false);
  }, [activeTab, getResetState]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (inputWrapRef.current && !inputWrapRef.current.contains(target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleResetFilters = () => {
    setSelectedFilters(getResetState());
    setSuggestions([]);
    setShowSuggestions(false);
    setNoResults(false);
  };

  const handleFilterChange = (key: keyof SearchOptions, value: string) => {
    setSelectedFilters((prev) => {
      if (singleSelectKeys.includes(key)) {
        return { ...prev, [key]: value as any };
      }

      const prevValue = prev[key];

      if (Array.isArray(prevValue)) {
        const currentValues = prevValue as string[];
        const isSelected = currentValues.includes(value);
        return {
          ...prev,
          [key]: isSelected
            ? currentValues.filter((item) => item !== value)
            : [...currentValues, value],
        };
      }

      return { ...prev, [key]: value };
    });
  };

  const handleSearch = () => {
    if (!selectedFilters.city) return;

    const base = `/properties/${activeTab}/${selectedFilters.city}`;
    const params = new URLSearchParams();

    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (!value || key === "city") return;

      const k = key as keyof SearchOptions;

      if (singleSelectKeys.includes(k) && typeof value === "string") {
        const v = value.trim();
        if (v) params.append(key, v);
        return;
      }

      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
        return;
      }

      if (typeof value === "string" && value.trim() !== "") {
        params.append(key, value.trim());
      }
    });

    const finalUrl = params.toString() ? `${base}?${params.toString()}` : base;
    router.push(finalUrl);
  };

  const handleSuggestionClick = async (item: any) => {
    setShowSuggestions(false);
    setSelectedFilters((prev) => ({
      ...prev,
      search: item.label,
    }));

    const slug = generateSlug(item.label);
    const city = selectedFilters.city || cityOptions?.[0]?.label || "Hyderabad";
    const category = activeTab;

    if (!category) return;

    if (item.type === "Locality") {
      if (!slug) return;
      const params = new URLSearchParams();
      params.set("purpose", String(selectedFilters.purpose || "Residential"));
      params.set("page", "1");
      params.set("localityId", String(item.id));
      params.set("locality", encodeURIComponent(slug));
      router.push(
        `/properties/${category}/${city}?${params.toString()}`,
      );
      return;
    }

    if (item.type === "City") {
      if (!slug) return;
      router.push(
        `/properties/${category}/${city}?city=${encodeURIComponent(slug)}`,
      );
      return;
    }

    if (item.type === "Project" || item.type === "Property") {
      if (!slug) return;
      try {
        const response = await apiClient.get(
          `${apiClient.URLS.unified_listing}/resolve-slug`,
          { slug, city, category },
        );

        if (response.status === 200 && response.body) {
          const { id, type } = response.body;
          router.push(
            `/properties/${category}/${city}/details/${slug}?id=${id}&type=${type}`,
          );
        } else {
          toast.error("Unable to open this item");
        }
      } catch (error) {
        console.error("Error resolving slug:", error);
        toast.error("Error resolving slug");
      }
      return;
    }

    if (item.type === "Builder") {
      const params = new URLSearchParams();
      params.set("purpose", String(selectedFilters.purpose || "Residential"));
      params.set("page", "1");
      params.set("builderId", String(item.id));
      params.set("builderName", encodeURIComponent(item.label));
      router.push(
        `/properties/${category}/${city}?${params.toString()}`,
      );
      return;
    }
  };

  const fetchSuggestions = useMemo(
    () =>
      debounce(
        async (input: string, tab: PropertyTab, selectedCity: string) => {
          if (!input || input.length < 2 || !selectedCity) {
            setSuggestions([]);
            setShowSuggestions(false);
            setNoResults(false);
            return;
          }

          const lookingType = tab === "buy" ? "Sell" : tab;

          try {
            const response = await apiClient.get(
              `${apiClient.URLS.unified_listing}/search-suggestions`,
              {
                search: input,
                city: selectedCity,
                lookingType,
              },
            );

            const result = response?.body;

            if (response.status === 200 && result) {
              // Order: localities → properties → projects → builders (based in user input)
              const formatted = [
                ...(result.localities || []).map((x: any) => ({
                  ...x,
                  type: "Locality",
                })),
                ...(result.properties || []).map((x: any) => ({
                  ...x,
                  type: "Property",
                })),
                ...(result.projects || []).map((x: any) => ({
                  ...x,
                  type: "Project",
                })),
                ...(result.builders || []).map((x: any) => ({
                  ...x,
                  type: "Builder",
                })),
              ];

              setSuggestions(formatted);
              setShowSuggestions(true);
              setNoResults(formatted.length === 0);
            } else {
              setSuggestions([]);
              setShowSuggestions(true);
              setNoResults(true);
            }
          } catch (error) {
            console.error("Suggestion fetch error:", error);
            setSuggestions([]);
            setShowSuggestions(true);
            setNoResults(true);
          }
        },
        250,
      ),
    [],
  );

  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  const renderDropdown = (
    label: string,
    key: keyof SearchOptions,
    options: string[],
  ) => {
    if (!options?.length) return null;

    const isArray = Array.isArray(selectedFilters[key]);
    const selected = isArray ? (selectedFilters[key] as string[]) : [];
    const selectedLabel =
      isArray && selected.length > 0 ? selected.join(", ") : label;

    const isPurpose = key === "purpose";
    const shown = isPurpose
      ? String(selectedFilters.purpose || label)
      : selectedLabel;

    return (
      <div className="relative">
        <DropDown
          gapY={8}
          placement="bottom-start"
          fallBackPlcmnts={["bottom", "bottom-end"]}
          buttonElement={
            <Button
              className={twMerge(
                // compact “chip” button
                "group flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-800 shadow-sm hover:bg-gray-50 active:scale-[0.99] transition",
                // when selected -> highlight
                (Array.isArray(selectedFilters[key]) &&
                  (selectedFilters[key] as string[])?.length > 0) ||
                  (singleSelectKeys.includes(key) &&
                    String(selectedFilters[key] || ""))
                  ? "border-blue-200"
                  : "",
                dropDownButtonCls,
              )}
            >
              <span className="max-w-[120px] truncate">
                {toTitleCase(clampLabel(String(shown), 22))}
              </span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-[#3586FF] opacity-90 group-hover:opacity-100" />
            </Button>
          }
        >
          <div className="w-[220px] rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
            <div className="px-3 py-2 text-[11px] font-semibold text-gray-700 border-b bg-gray-50">
              {toTitleCase(label)}
            </div>

            <div className="max-h-[260px] overflow-y-auto">
              {options.map((option) => {
                const active =
                  singleSelectKeys.includes(key) &&
                  typeof selectedFilters[key] === "string"
                    ? String(selectedFilters[key]) === option
                    : (selectedFilters[key] as string[])?.includes(option);

                return (
                  <button
                    key={option}
                    onClick={() => handleFilterChange(key, option)}
                    className={twMerge(
                      "w-full flex items-center justify-between px-3 py-2 text-left text-[12px] font-medium hover:bg-gray-50 transition",
                      active ? "bg-blue-50 text-blue-700" : "text-gray-800",
                    )}
                    type="button"
                  >
                    <span className="truncate">{option}</span>
                    {active ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Selected
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Tap</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </DropDown>
      </div>
    );
  };

  if (!mounted) return null;

  const filterEntries = Object.entries(activeTabOptions[activeTab] || {});

  return (
    <div
      ref={shellRef}
      className={twMerge(
        // NEW: compact “glass card” look, stable across devices
        "w-full rounded-2xl border border-white/60 bg-white/95 backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
        "px-2.5 py-2 md:px-3 md:py-3",
        rootCls,
      )}
    >
      {/* FILTER CHIPS ROW */}
      <div className="w-full  mx-auto min-w-full">
        <div
          className={twMerge(
            "flex items-center  justify-center gap-2 overflow-x-auto no-scrollbar pb-1",
            outerSearchCls,
          )}
        >
          {filterEntries.map(([filterKey, options]) =>
            renderDropdown(
              filterKey,
              filterKey as keyof SearchOptions,
              options as string[],
            ),
          )}
        </div>
      </div>

      {/* SEARCH ROW */}
      <div
        className={twMerge(
          "mt-2 grid grid-cols-12 gap-2 items-center",
          searchrootCls,
        )}
      >
        {/* City (desktop + mobile unified) */}
        <div className="col-span-4 sm:col-span-3 md:col-span-2">
          <DropDown
            gapY={8}
            placement="bottom-start"
            fallBackPlcmnts={["bottom", "bottom-end"]}
            buttonElement={
              <Button
                className={twMerge(
                  "w-full flex items-center justify-between text-nowrap gap-2 rounded-xl border border-gray-200 bg-white px-2.5 md:py-[6px] py-1 text-[12px] font-semibold text-gray-800 shadow-sm hover:bg-gray-50",
                  dropDownButtonCls,
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Image
                    src="/icons/Location.svg"
                    alt="location"
                    width={14}
                    height={14}
                    priority
                  />
                  <span className="truncate">
                    {selectedFilters.city || "City"}
                  </span>
                </div>
                <GoChevronDown className="text-[18px] text-[#3586FF]" />
              </Button>
            }
          >
            <div className="w-[220px] rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
              <div className="px-3 md:py-2 py-1 text-[11px] font-semibold text-gray-700 border-b bg-gray-50">
                Select City
              </div>
              <div className="max-h-[260px] overflow-y-auto">
                {cityOptions?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleFilterChange("city", option.label)}
                    className={twMerge(
                      "w-full px-3 md:py-1 py-1 text-left text-[12px] font-medium hover:bg-gray-50",
                      selectedFilters.city === option.label
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-800",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </DropDown>
        </div>

        {/* Search input */}
        <div
          ref={inputWrapRef}
          className="col-span-8 sm:col-span-9 md:col-span-7 relative z-30"
        >
          <div className="relative">
            <CustomInput
              type="text"
              name="search"
              value={selectedFilters.search}
              rootCls="bg-transparent mt-0"
              className={twMerge(
                "w-full rounded-xl !md:py-0 !py-0 bg-white",
                "md:placeholder:text-[12px] placeholder:text-[10px]",
                "text-[12px] font-medium text-gray-800 shadow-sm",
                "",
              )}
              // outerInptCls="!md:py-1 !py-1 !px-2"
              outerInptCls="py-2 px-3"
              onChange={(e: any) => {
                const value = e.target.value;
                handleFilterChange("search", value);
                const trimmed = value?.trim() ?? "";
                if (trimmed.length < 2) {
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setNoResults(false);
                  return;
                }
                setShowSuggestions(true);
                setNoResults(false);
                fetchSuggestions(trimmed, activeTab, selectedFilters.city);
              }}
              placeholder="Search locality, landmark, builder..."
            />

            {/* input icon */}
            <div className="md:flex hidden absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <IoIosSearch className="md:text-[18px] text-[12px]" />
            </div>
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="absolute left-0 top-full mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              {suggestions.length > 0 ? (
                <div className="max-h-[280px] overflow-y-auto">
                  {["Locality", "Property", "Project", "Builder"].map(
                    (group) => {
                      const groupItems = suggestions.filter(
                        (s) => s.type === group,
                      );
                      if (!groupItems.length) return null;

                      return (
                        <div key={group} className="border-b last:border-b-0">
                          <div className="px-3 py-2 text-[11px] font-semibold text-gray-600 bg-gray-50">
                            {group}
                          </div>

                          {groupItems.map((item) => (
                            <button
                              key={`${group}-${item.id}`}
                              type="button"
                              onClick={() => handleSuggestionClick(item)}
                              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-50"
                            >
                              <span className="text-[12px] font-semibold text-gray-800 truncate">
                                {item.label}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                {item.type}
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                noResults && (
                  <div className="px-3 py-3 text-[12px] text-gray-500">
                    {
                      `No properties found for "${
                        selectedFilters.search?.trim() || "your search"
                      }"`
                    }
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="col-span-12 md:col-span-3 flex gap-2">
          <Button
            className={twMerge(
              "flex-1 rounded-xl bg-[#3586FF] text-white font-semibold",
              "px-3 py-1 text-[12px] shadow-sm hover:opacity-95 active:scale-[0.99] transition",
              searchButtonCls,
            )}
            onClick={handleSearch}
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              <IoIosSearch className="text-[16px]" />
              Search
            </span>
          </Button>

          <Button
            className={twMerge(
              "rounded-xl bg-white border border-blue-200 text-[#3586FF] font-semibold",
              "px-3 py-1 text-[12px] shadow-sm hover:bg-blue-50 active:scale-[0.99] transition",
            )}
            onClick={handleResetFilters}
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              <ResetIcon />
              <span className="hidden sm:inline">Reset</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertySearchBar;
