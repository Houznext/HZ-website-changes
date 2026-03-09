import React, { useEffect, useRef, useState, useCallback } from "react";
import { MdSearch } from "react-icons/md";
import { X } from "lucide-react";
import Button from "../Button";
import debounce from "lodash/debounce";
import apiClient from "@/utils/apiClient";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PropertyTab } from "@/store/usePropertyFilterStore";

interface SuggestionItem {
  label: string;
  subtext?: string;
  type: "City" | "Locality" | "Project" | "Property" | "Builder";
  id?: string | number;
}

interface SearchBarProps {
  defaultCities?: string[];
  onCitiesChange: (cities: string[]) => void;
  activeTab?: PropertyTab;
  selectedCity?: string;
}

const SearchBar = ({
  defaultCities = [],
  onCitiesChange,
  activeTab = "buy",
  selectedCity = "",
}: SearchBarProps) => {
  const [search, setSearch] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>(defaultCities);
  const [selectedLocality, setSelectedLocality] = useState<string | null>(null);
  const [selectedBuilder, setSelectedBuilder] = useState<{ id: string; label: string } | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSelectCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      const updated = [city];
      setSelectedCities(updated);
      onCitiesChange(updated);
    }
    setShowDropdown(false);
    setSearch("");
  };

  const handleRemoveCity = (city: string) => {
    const updated = selectedCities.filter((c) => c !== city);
    setSelectedCities(updated);
    onCitiesChange(updated);

    const category = (router.query.category as string) || activeTab;
    const cityToUse = updated[0] || selectedCity || "Hyderabad";

    router.push(`/properties/${category}/${cityToUse}`);
  };

  useEffect(() => {
    const { locality, builderId, builderName } = router.query;
    if (locality && typeof locality === "string") {
      setSelectedLocality(decodeURIComponent(locality).replace(/-/g, " "));
    } else {
      setSelectedLocality(null);
    }
    if (builderId && typeof builderId === "string") {
      const label =
        builderName && typeof builderName === "string"
          ? decodeURIComponent(builderName)
          : "Builder";
      setSelectedBuilder({ id: builderId, label });
    } else {
      setSelectedBuilder(null);
    }
  }, [router.query]);

  useEffect(() => {
    setSelectedCities(defaultCities);
  }, [defaultCities]);
  const getCityToUse = () =>
    selectedCity || selectedCities[0] || defaultCities[0] || "Hyderabad";

  const debouncedFetchSuggestions = useCallback(
    debounce(async (input: string) => {
      if (!input || input.length < 2 || !selectedCity) {
        setSuggestions([]);
        setNoResults(false);
        setShowDropdown(false);
        return;
      }

      const lookingType = activeTab === "buy" ? "Sell" : activeTab;

      try {
        const response = await apiClient.get(
          `${apiClient.URLS.unified_listing}/search-suggestions`,
          {
            search: input,
            city: selectedCity,
            lookingType,
          }
        );

        const result = response?.body;

        if (response.status === 200 && result) {
          const formatted: SuggestionItem[] = [
            ...(result.localities || []).map((item: any) => ({
              ...item,
              type: "Locality",
            })),
            ...(activeTab === "buy" || activeTab === "rent"
              ? [
                ...(result.projects || []).map((item: any) => ({
                  ...item,
                  type: "Project",
                })),
                ...(result.properties || []).map((item: any) => ({
                  ...item,
                  type: "Property",
                })),
              ]
              : []),
            ...(result.builders || []).map((item: any) => ({
              ...item,
              type: "Builder",
            })),
          ];

          setSuggestions(formatted);
          setShowDropdown(true);
          setNoResults(formatted.length === 0);
        } else {
          setSuggestions([]);
          setShowDropdown(true);
          setNoResults(true);
        }
      } catch (error) {
        console.error("Suggestion fetch error:", error);
        setSuggestions([]);
        setShowDropdown(true);
        setNoResults(true);
      }
    }, 300),
    [activeTab, selectedCity]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setNoResults(false);
      setShowDropdown(false);
      return;
    }
    setNoResults(false);
    debouncedFetchSuggestions(value);
  };
  const handleSuggestionClick = async (item: SuggestionItem) => {
    setSearch("");
    setShowDropdown(false);

    const slug = item.label.toLowerCase().replace(/\s+/g, "-");
    const category = (router.query.category as string) || activeTab;

    if (!category) return;

    if (item.type === "City") {
      // Update both local & parent immediately
      const updated = [item.label];
      setSelectedCities(updated);
      onCitiesChange(updated);

      // Route with the *new* city value, not stale state
      router.push(`/properties/${category}/${item.label}`);
      return;
    }

    if (item.type === "Locality") {
      const cityToUse = getCityToUse();
      const localitySlug = item.label.toLowerCase().replace(/\s+/g, "-");
      setSelectedLocality(item.label);

      router.push({
        pathname: `/properties/${category}/${cityToUse}`,
        query: { locality: localitySlug },
      });
      return;
    }

    if (item.type === "Project" || item.type === "Property") {
      try {
        const cityToUse = getCityToUse();
        const response = await apiClient.get(
          `${apiClient.URLS.unified_listing}/resolve-slug`,
          { slug, city: cityToUse, category }
        );

        if (response.status === 200 && response.body) {
          const { id, type } = response.body;
          router.push(
            `/properties/${category}/${cityToUse}/details/${slug}?id=${id}&type=${type}`
          );
        } else {
          toast.error("Unable to resolve selected item");
        }
      } catch (error) {
        console.error("Error resolving slug:", error);
        toast.error("Error resolving item");
      }
      return;
    }

    if (item.type === "Builder") {
      const cityToUse = getCityToUse();
      const query: Record<string, string> = {
        purpose: "Residential",
        page: "1",
        builderId: String(item.id),
        builderName: encodeURIComponent(item.label),
      };
      router.push({
        pathname: `/properties/${category}/${cityToUse}`,
        query: { ...router.query, ...query },
      });
    }
  };

  // const handleSuggestionClick = async (item: SuggestionItem) => {
  //   setSearch("");
  //   setShowDropdown(false);

  //   const slug = item.label.toLowerCase().replace(/\s+/g, "-");
  //   const city = selectedCities[0];

  //   const category = router.query.category || activeTab;

  //   if (!slug || !category) return;

  //   if (item.type === "City") {
  //     handleSelectCity(item.label);
  //     router.push({ pathname: `/properties/${category}/${city}`, });
  //     return;
  //   }

  //   if (item.type === "Locality") {
  //     const city = selectedCities[0];
  //     const localitySlug = item.label.toLowerCase().replace(/\s+/g, "-");

  //     setSelectedLocality(item.label);
  //     router.push({
  //       pathname: `/properties/${category}/${city}`,
  //       query: { locality: localitySlug },
  //     });

  //     return;
  //   }

  //   if (item.type === "Project" || item.type === "Property") {
  //     try {
  //       const response = await apiClient.get(`${apiClient.URLS.unified_listing}/resolve-slug`, {
  //         slug,
  //         city,
  //         category,
  //       });

  //       if (response.status === 200 && response.body) {
  //         const { id, type } = response.body;
  //         router.push(`/properties/${category}/${city}/details/${slug}?id=${id}&type=${type}`);
  //       } else {
  //         toast.error("Unable to resolve selected item");
  //       }
  //     } catch (error) {
  //       console.error("Error resolving slug:", error);
  //       toast.error("Error resolving item");
  //     }
  //   }

  //   if (item.type === "Builder") {
  //     console.log("Builder selected:", item);
  //   }
  // };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className=" md:max-w-[720px] max-w-[250px] w-full rounded-md">
      <div className="flex items-center shadow-custom rounded-md bg-white px-2 md:py-[2px] py-[0px] gap-2 md:flex-wrap flex-nowrap">
        <MdSearch size={22} className="text-gray-500" />
        <div
          ref={wrapperRef}
          className="flex md:flex-wrap  rounded-md flex-nowrap gap-2 items-center flex-grow"
        >
          {selectedCities.map((city, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 md:py-1 py-0.5 rounded-[15px] bg-blue-400 text-white md:text-[12px] text-[10px] font-regular"
            >
              {city}
              <Button onClick={() => handleRemoveCity(city)}>
                <X size={14} />
              </Button>
            </div>
          ))}
          {selectedLocality && (
            <div className="flex items-center gap-1 px-2 md:py-[2px] py-0.5 rounded-[15px] bg-blue-400 text-white md:text-[12px] text-[10px] font-regular">
              {selectedLocality}
              <Button
                onClick={() => {
                  setSelectedLocality(null);
                  const cityToUse = getCityToUse();
                  const q = { ...router.query };
                  delete q.locality;
                  delete q.localityId;
                  router.push({
                    pathname: `/properties/${activeTab}/${cityToUse}`,
                    query: q,
                  });
                }}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          {selectedBuilder && (
            <div className="flex items-center gap-1 px-2 md:py-[2px] py-0.5 rounded-[15px] bg-blue-400 text-white md:text-[12px] text-[10px] font-regular max-w-[140px] truncate" title={selectedBuilder.label}>
              <span className="truncate">{selectedBuilder.label}</span>
              <Button
                onClick={() => {
                  setSelectedBuilder(null);
                  const cityToUse = getCityToUse();
                  const q = { ...router.query };
                  delete q.builderId;
                  delete q.builderName;
                  router.push({
                    pathname: `/properties/${activeTab}/${cityToUse}`,
                    query: q,
                  });
                }}
              >
                <X size={14} />
              </Button>
            </div>
          )}
          <input
            type="text"
            placeholder="Search City, Locality, Builder..."
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className="outline-none bg-transparent text-sm font-regular md:text-[12px] flex-grow w-0 min-w-[70px] md:min-w-[150px] md:py-[4px] py-0 px-2 border-none md:placeholder:text-[14px] placeholder:text-[12px]"
          />
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-[999999999] md:top-10 md:min-w-[400px]  max-w-[400px] bg-white border rounded shadow-md mt-1 max-h-[200px] overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className="cursor-pointer px-4 py-2 hover:bg-blue-300 hover:text-white border-b text-[12px] font-medium"
              >
                <div className="flex flex-row w-full justify-between ">
                  <span>
                    {item.label}
                    {item.subtext ? `, ${item.subtext}` : ""}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    {item.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            noResults && (
              <div className="px-4 py-3 text-[12px] text-gray-500">
                {`No properties found for "${search.trim() || "your search"}"`}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
