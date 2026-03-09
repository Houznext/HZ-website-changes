import React, { useEffect, useRef, useState } from "react";
import { Dialog, Menu, Tab } from "@headlessui/react";
import { ChevronDownIcon, X } from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import Button from "../Button";
import clsx from "clsx";
import SearchBar from "../searchBar";
import { useRouter } from "next/router";
import { DropDown } from "@/common/PopOver";
import { twMerge } from "tailwind-merge";
import { IoMdArrowDropdown } from "react-icons/io";

export type PropertyTab = "buy" | "rent" | "plot" | "flatshare";

export interface FilterOptions {
  propertyType?: string[];
  bhkType?: string[];
  priceRange?: string[];
  referAndEarnPriceRange?: string[];
  saleType?: string[];
  furnishingType?: string[];
  constructionStatus?: string[];
  amenities?: string[];
  propertyAge?: string[];
  facing?: string[];
  builtUpArea?: [number, number];
  genderPreference?: string[];
  sharingType?: string[];
  purpose?: string[];
}

const filterOptions: Record<PropertyTab, FilterOptions> = {
  buy: {
    propertyType: ["Apartment", "Villa", "Independent House", "Plot"],
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
    propertyType: ["Residential Plot", "Commercial Plot"],
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

export const tabs: Array<{
  tabKey: PropertyTab;
  buttonLabel: string;
}> = [
    {
      buttonLabel: "Buy",
      tabKey: "buy",
    },
    {
      buttonLabel: "Rent",
      tabKey: "rent",
    },
    {
      buttonLabel: "FlatShare",
      tabKey: "flatshare",
    },
    {
      buttonLabel: "Plot",
      tabKey: "plot",
    },
  ];

interface FilterState {
  propertyType?: string[];
  bhkType?: string[];
  priceRange?: string[];
  saleType?: string[];
  constructionStatus?: string[];
  amenities?: string[];
  propertyAge?: string[];
  facing?: string[];
  builtUpArea?: [number, number];
  genderPreference?: string[];
  sharingType?: string[];
}

interface PropertyFilterBarProps {
  activeTab: PropertyTab;
  onFilterChange: (filters: FilterState) => void;
  setActiveTab: (value: PropertyTab) => void;
  city?: string;
  onCityChange: (city: string[]) => void;
  defaultFilters?: FilterState;
}

export const emptyPropertyBarFilters: FilterState = {
  propertyType: [],
  bhkType: [],
  priceRange: [],
  saleType: [],
  constructionStatus: [],
  amenities: [],
  propertyAge: [],
  facing: [],
  builtUpArea: [0, 5000],
};

const PropertyFilterBar: React.FC<PropertyFilterBarProps> = ({
  activeTab,
  setActiveTab,
  onFilterChange,
  city,
  onCityChange,
  defaultFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>(
    defaultFilters || emptyPropertyBarFilters
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (defaultFilters) {
      setFilters(defaultFilters);
    }
  }, [defaultFilters]);

  const updateTabAndRoute = (newTab: PropertyTab) => {
    setActiveTab(newTab);

    const newQuery: Record<string, any> = {};

    if (newTab === "flatshare") {
      newQuery["commercialPurpose"] = "Buy";
    } else if (newTab === "plot") {
      newQuery["plotPurpose"] = "Buy";
    }

    router.push({
      pathname: `/properties/${newTab}/${router.query.city || "Hyderabad"}`,
      query: newQuery,
    });
  };
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prevFilters) => {
      const currentValue = prevFilters[key] as any;

      if (Array.isArray(currentValue) && typeof currentValue[0] === "string") {
        const newValue = currentValue.includes(value)
          ? currentValue.filter((item) => item !== value)
          : [...currentValue, value];

        const updatedFilters: FilterState = {
          ...prevFilters,
          [key]: newValue as string[],
        };
        onFilterChange(updatedFilters);
        return updatedFilters;
      } else {
        const updatedFilters: FilterState = {
          ...prevFilters,
          [key]: value as any,
        };
        onFilterChange(updatedFilters);
        return updatedFilters;
      }
    });
  };

  const displayLabel =
    tabs.find((tab) => tab.tabKey === activeTab)?.buttonLabel ??
    "Select Option";

  const renderDropdown = (
    label: string,
    key: keyof FilterState,
    options?: string[]
  ) => {
    if (!options) return null;
    const displayLabel =
      filters[key] && Array.isArray(filters[key]) && filters[key]?.length > 0
        ? (filters[key] as string[]).join(", ")
        : label;

    return (
      <>
        <div className="relative md:block hidden">
          <Menu as="div" className=" inline-block text-left shadow-custom ">
            <Menu.Button className="flex items-center border md:text-[10px] text-[10px] md:px-4 px-2 md:py-[6px] py-[4px] rounded-md font-medium bg-white text-black hover:bg-gray-100  text-nowrap ">
              {displayLabel} <ChevronDownIcon className="w-4 h-4 ml-2" />
            </Menu.Button>
            <Menu.Items
              className="md:absolute relative  max-h-[200px] top-full md:left-0 left-0  mt-1 w-auto md:w-42 bg-white border rounded-md shadow-lg  md:max-h-60  md:overflow-auto
      md:flex md:flex-col
      flex flex-row overflow-x-auto md:gap-0 gap-2
      no-scrollbar
      md:p-0 p-2 "
            >
              {options.map((option) => (
                <Menu.Item key={option}>
                  {({ active }) => (
                    <Button
                      onClick={() => handleFilterChange(key, option)}
                      className={`block w-full border-[1px] md:text-[10px] text-[10px] md:text-wrap text-nowrap border-gray-200 font-medium md:rounded-[0px] rounded-[6px] px-2 py-1 text-left ${(filters[key] as string[]).includes(option)
                        ? "bg-[#3586FF] text-white"
                        : "bg-gray-100"
                        }`}
                    >
                      {option}
                    </Button>
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
        </div>
        <div className="md:hidden block">
          <DropDown
            gapY={8}
            placement="bottom-start"
            fallBackPlcmnts={["bottom", "bottom-end"]}
            buttonElement={
              <Button
                className={twMerge(
                  "flex items-center border  rounded-[20px] text-[10px] md:px-4 px-2  py-[6px]  font-medium bg-white text-black hover:bg-gray-100 text-nowrap"
                )}
              >
                {/* {displayLabel} */}
                <IoMdArrowDropdown className="w-4 h-4 ml-2" />
              </Button>
            }
          >
            <div
              className={twMerge(
                `md:absolute relative max-h-[200px] top-full md:left-0 left-0 mt-1 w-auto md:w-42 
      bg-white border rounded-md shadow-lg 
      md:max-h-60 md:overflow-auto 
      md:flex md:flex-col flex flex-row 
      overflow-x-auto md:gap-0 gap-2 
      no-scrollbar md:p-0 p-2`
              )}
            >
              {options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleFilterChange(key, option)}
                  className={twMerge(
                    `border-[1px] text-[10px]  text-nowrap 
           border-gray-200 font-medium 
           md:rounded-[0px] rounded-[6px] 
           px-2 py-1 text-left 
           ${(filters[key] as string[])?.includes(option)
                      ? "bg-[#3586FF] text-white"
                      : "bg-gray-100"
                    } 
           hover:bg-gray-200`
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
          </DropDown>
        </div>
      </>
    );
  };

  return (
    <div className="flex md:overflow-visible flex-col overflow-x-auto custom-scrollbar  gap-3 pt-2 rounded-md relative ">
      <div className="flex items-center justify-between md:gap-10 gap-1 w-full md:px-15 px-4 overflow-hidden">
        <div className="flex-shrink-0 min-w-0 max-w-[150px] md:max-w-none">
          <DropDown
            gapY={8}
            placement="bottom-start"
            fallBackPlcmnts={["bottom", "bottom-end"]}
            buttonElement={
              <Button
                className={twMerge(
                  "flex items-center border rounded-[10px] md:text-[16px] text-[12px] md:px-4 px-2 md:py-[8px] py-[6px] font-medium bg-white text-black hover:bg-gray-100 text-nowrap"
                )}
              >
                {tabs.find((tab) => tab.tabKey === activeTab)?.buttonLabel}
                <IoMdArrowDropdown className="w-4 h-4 ml-2" />
              </Button>
            }
          >
            <div
              className={twMerge(
                `md:absolute relative max-h-[200px] top-full md:left-0 left-0 mt-1 w-auto md:w-42 
      bg-blue-100 border rounded-md shadow-lg 
      md:max-h-60 md:overflow-auto 
      flex flex-row 
      overflow-x-auto md:gap-2 gap-2 
      no-scrollbar md:p-2 p-2 md:text-[12px] text-[10px]`
              )}
            >
              {tabs.map((tab) => (
                <Button
                  key={tab.tabKey}
                  onClick={() => updateTabAndRoute(tab.tabKey)}
                  className={twMerge(
                    `  text-nowrap 
          border-gray-200 font-medium 
          md:rounded-md  rounded-[6px] 
           md:py-[8px] border-[1px] px-[12px] py-[6px] md:px-[16px]   text-left
          ${activeTab === tab.tabKey ? "bg-[#3586FF] text-white" : "bg-white"} 
          `
                  )}
                >
                  {tab.buttonLabel}
                </Button>
              ))}
            </div>
          </DropDown>
        </div>

        <div className="md:flex-1 flex-0 min-w-0 ml-2">
          <SearchBar
            defaultCities={city ? [city] : []}
            onCitiesChange={(selectedCities) => {
              onCityChange(selectedCities);
            }}
          />
        </div>
      </div>

      <div className="flex md:overflow-visible overflow-x-auto  md:mb-0 mb-2 gap-x-2 pb-2">
        {renderDropdown(
          "Property Type",
          "propertyType",
          filterOptions[activeTab]?.propertyType
        )}
        {renderDropdown(
          "BHK Type",
          "bhkType",
          filterOptions[activeTab]?.bhkType
        )}
        {renderDropdown(
          "₹0 - ₹5Cr",
          "priceRange",
          filterOptions[activeTab]?.priceRange
        )}
        {renderDropdown(
          "Sale Type",
          "saleType",
          filterOptions[activeTab]?.saleType
        )}
        {renderDropdown(
          "Construction St...",
          "constructionStatus",
          filterOptions[activeTab]?.constructionStatus
        )}
        {renderDropdown(
          "Sharing Type",
          "sharingType",
          filterOptions[activeTab]?.saleType
        )}
        {renderDropdown(
          "Gender",
          "genderPreference",
          filterOptions[activeTab]?.saleType
        )}


        <div className="relative">
          {activeTab !== "plot" && (
            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="border md:px-4 px-2 md:py-[6px] py-[4px] font-medium md:rounded-md  rounded-[20px] bg-white hover:bg-gray-100 md:text-[10px] text-[10px] text-nowrap"
            >
              Show Built-Up Area
            </Button>
          )}
          <Dialog
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            className="relative z-50"
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-30"
              onClick={() => setIsDrawerOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Built-up Area in sq.ft.
                </h2>
                <Button onClick={() => setIsDrawerOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="p-6 flex flex-col md:gap-6 gap-3 flex-grow">
                <Slider
                  range
                  min={0}
                  max={5000}
                  step={100}
                  defaultValue={filters.builtUpArea}
                  trackStyle={[{ backgroundColor: "#3586FF", height: 4 }]}
                  handleStyle={[
                    {
                      backgroundColor: "white",
                      border: "3px solid #3586FF",
                      width: 22,
                      height: 22,
                    },
                    {
                      backgroundColor: "white",
                      border: "3px solid #3586FF",
                      width: 22,
                      height: 22,
                    },
                  ]}
                  railStyle={{ backgroundColor: "#D1D5DB", height: 4 }}
                  onChange={(value) =>
                    setFilters((prevFilters) => {
                      const key: keyof FilterState = "builtUpArea";
                      const updatedFilters = {
                        ...prevFilters,
                        [key]: value as [number, number],
                      };
                      return updatedFilters;
                    })
                  }
                />

                <div className="flex justify-between text-sm text-gray-500 mt-4">
                  <span>0</span>
                  <span>1000</span>
                  <span>2000</span>
                  <span>3000</span>
                  <span>4000</span>
                  <span>5000+</span>
                </div>
              </div>

              <div className="p-4 border-t bg-white flex justify-center">
                <Button
                  onClick={() => {
                    setIsDrawerOpen(false), onFilterChange(filters);
                  }}
                  className="w-full bg-[#3586FF] text-white py-2 rounded-md font-medium hover:bg-blue-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Dialog>
        </div>
        <div className="hidden md:block">
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center border md:px-4 px-2 md:py-[6px] py-[4px] md:text-[10px] text-[10px] rounded-md bg-white text-black font-medium hover:bg-gray-100  text-nowrap">
              More Filters <ChevronDownIcon className="w-4 h-4 ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute left-0 mt-2 w-64 bg-white border rounded-md shadow-lg p-3 z-[9999] ">
              {filterOptions[activeTab]?.amenities && (
                <div className="mb-3">
                  <label className="text-black font-medium">
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filterOptions[activeTab].amenities?.map((amenity) => (
                      <Button
                        key={amenity}
                        className={`border px-3 py-1 text-[10px] rounded-md ${filters.amenities?.length &&
                          filters.amenities.includes(amenity)
                          ? "bg-[#3586FF] text-white"
                          : "bg-gray-100"
                          }`}
                        onClick={() => handleFilterChange("amenities", amenity)}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {renderDropdown(
                "Age of Property",
                "propertyAge",
                filterOptions[activeTab]?.propertyAge
              )}

              {renderDropdown(
                "Facing",
                "facing",
                filterOptions[activeTab]?.facing
              )}
            </Menu.Items>
          </Menu>
        </div>
        <div className="md:hidden block">
          <DropDown
            gapY={8}
            placement="bottom-start"
            fallBackPlcmnts={["bottom", "bottom-end"]}
            buttonElement={
              <Button
                className={twMerge(
                  "flex items-center border md:px-4 px-2 md:py-[6px] py-[4px] md:text-[16px] text-[10px] rounded-md bg-white text-black font-medium hover:bg-gray-100 text-nowrap"
                )}
              >
                More Filters
                <ChevronDownIcon className="w-4 h-4 ml-2" />
              </Button>
            }
          >
            <div className="w-full max-w-xs bg-white border rounded-md shadow-lg p-3 z-[9999]">
              {filterOptions[activeTab]?.amenities && (
                <div className="mb-3">
                  <label className="text-black text-[14px] font-medium block mb-2">
                    Amenities
                  </label>
                  <div className="flex flex-row overflow-x-auto gap-2 no-scrollbar">
                    {filterOptions[activeTab].amenities?.map((amenity) => (
                      <Button
                        key={amenity}
                        className={twMerge(
                          "border px-3 py-1 text-[10px] rounded-md whitespace-nowrap",
                          filters.amenities?.includes(amenity)
                            ? "bg-[#3586FF] text-white"
                            : "bg-gray-100"
                        )}
                        onClick={() => handleFilterChange("amenities", amenity)}
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-row overflow-x-auto gap-2 no-scrollbar">
                {renderDropdown(
                  "Age of Property",
                  "propertyAge",
                  filterOptions[activeTab]?.propertyAge
                )}

                {renderDropdown(
                  "Facing",
                  "facing",
                  filterOptions[activeTab]?.facing
                )}
              </div>
            </div>
          </DropDown>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilterBar;
