import React, { useEffect, useMemo, useState } from "react";
import CustomInput from "../FormElements/CustomInput";
import Button from "../Button";
import { MdSearch } from "react-icons/md";
import { X } from "lucide-react";

const filterOptions = {
  buy: {
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    priceRange: ["₹0 - ₹50L", "₹50L - ₹1Cr", "₹1Cr - ₹5Cr", "₹5Cr+"],
    saleType: ["Resale", "New Launch", "Under Construction"],
    constructionStatus: ["Ready to Move", "Under Construction"],
    amenities: ["Gated Community", "Lift", "Swimming Pool", "Gym", "Parking"],
    propertyAge: ["0-5 years", "5-10 years", "10+ years"],
    facing: ["East", "West", "North", "South"],
  },
  rent: {
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    priceRange: ["₹0 - ₹10K", "₹10K - ₹25K", "₹25K - ₹50K", "₹50K+"],
    saleType: ["Furnished", "Semi-Furnished", "Unfurnished"],
    amenities: ["Security", "Power Backup", "Lift", "Swimming Pool", "Gym"],
  },
  plot: {
    propertyType: ["Residential Plot", "Commercial"],
    priceRange: ["₹0 - ₹50L", "₹50L - ₹1Cr", "₹1Cr+"],
    facing: ["East", "West", "North", "South"],
  },
  commercial: {
    propertyType: ["Commercial Plot"],
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

type TabType = "buy" | "rent" | "plot" | "commercial" |"flatshare";

const formatLabel = (label: string) =>
  label.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

interface SearchBarProps {
  onFiltersChange: (filters: Record<string, string>) => void;
  onSearchTermChange: (search: string) => void;
  filters: Record<string, string>;
  searchTerm?: string;
  activeTab: TabType | null;
  onTabChange: (tab: TabType) => void;
}

const TABS: Array<{ id: TabType; label: string }> = [
  { id: "buy", label: "Buy" },
  { id: "rent", label: "Rent" },
  { id: "commercial", label: "Commercial" },
  { id: "plot", label: "Plot" },
  {id:"flatshare",label:"Flat Share"}
];

const SearchBar = ({
  onFiltersChange,
  onSearchTermChange,
  filters,
  searchTerm,
  activeTab,
  onTabChange,
}: SearchBarProps) => {
  // keep local mirrors, but sync from parent so UI never desyncs
  const [localSearch, setLocalSearch] = useState(searchTerm ?? "");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>(
    filters || {}
  );

  useEffect(() => setLocalSearch(searchTerm ?? ""), [searchTerm]);
  useEffect(() => setSelectedFilters(filters || {}), [filters]);

  const hasAnyFilter = useMemo(
    () => Object.values(selectedFilters).some((v) => !!v),
    [selectedFilters]
  );

  const handleFilterChange = (key: string, value: string) => {
    const next = { ...selectedFilters };
    if (!value) delete next[key];
    else next[key] = value;
    setSelectedFilters(next);
    onFiltersChange(next);
  };

  const clearAll = () => {
    setSelectedFilters({});
    onFiltersChange({});
  };

  const handleTabClick = (tab: TabType) => {
    onTabChange(tab);
    clearAll();
  };

  const handleSearch = () => {
    onSearchTermChange(localSearch.trim());
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Button
                key={t.id}
                onClick={() => handleTabClick(t.id)}
                className={[
                  "relative px-3 md:py-[4px] py-[3px] rounded-lg text-[12px] md:text-[13px] font-medium transition",
                  "border",
                  active
                    ? "bg-[#5297ff] text-white border-[#5297ff]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {t.label}
                {active && (
                  <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-[48px] h-[3px] rounded-full bg-[#5297ff]" />
                )}
              </Button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            {hasAnyFilter && (
              <Button
                onClick={clearAll}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[11px] md:text-[12px] font-medium flex items-center gap-2"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {activeTab && (
        <div className="px-4 mt-3">
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent md:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent md:hidden" />

            <div className="flex flex-nowrap md:flex-wrap gap-2  overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-hide">
              {Object.entries(filterOptions[activeTab]).map(([key, values]) => (
                <div key={key} className="min-w-[120px] md:min-w-[160px]">
                  <select
                    value={selectedFilters[key] || ""}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className={[
                      "w-full",
                      "bg-white border border-gray-200 rounded-lg",
                      "px-2 md:py-[6px] py-1",
                      "text-[12px] md:text-[13px] font-medium text-gray-800",
                      "outline-none focus:border-[#5297ff] focus:ring-2 focus:ring-[#5297ff]/20",
                    ].join(" ")}
                  >
                    <option value="">{formatLabel(key)}</option>
                    {values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <CustomInput
              type="text"
              placeholder="Search by locality, landmark, builder…"
              value={localSearch}
              onChange={(e) => {
                const val = (e.target as HTMLInputElement).value;
                setLocalSearch(val);
                onSearchTermChange(val.trim());
              }}
              className="w-full !border-0 !p-0 bg-transparent outline-none font-medium md:text-[13px] text-[12px]"
              name="search"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-[#5297ff] hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium md:text-[13px] text-[12px] md:min-w-[140px]"
          >
            <MdSearch />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
