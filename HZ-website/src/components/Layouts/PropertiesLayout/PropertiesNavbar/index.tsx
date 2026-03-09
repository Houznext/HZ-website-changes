import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/common/Button";
import Avatar from "@/components/Avatar";
import { IoCartOutline } from "react-icons/io5";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { IoChevronDown, IoHeart } from "react-icons/io5";
import { usePropertyFilterStore } from "@/store/usePropertyFilterStore";
import PropertyFilterBar, { FilterOptions } from "@/common/PropertyFilterBar";
import { Dialog, Menu, Tab } from "@headlessui/react";
import { Check, ChevronDownIcon, Square, X } from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import SearchBar from "@/common/searchBar";
import { DropDown } from "@/common/PopOver";
import { twMerge } from "tailwind-merge";
import { IoMdArrowDropdown } from "react-icons/io";
import { useAuthModal } from "@/common/auth/AuthProvider";
interface PropertiesNavbarProps {
  isDetailPage?: boolean;
}

export type PropertyTab = "buy" | "rent" | "plot" | "flatshare";

const filterOptions: Record<PropertyTab, FilterOptions> = {
  buy: {
    purpose: ["Residential", "Commercial"],
    propertyType: ["Apartment", "Villa", "Independent House", "Plot"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    priceRange: ["₹0 - ₹50L", "₹50L - ₹1Cr", "₹1Cr - ₹5Cr", "₹5Cr+"],
    saleType: ["Resale", "New Launch", "Under Construction"],
    constructionStatus: ["Ready to Move", "Under Construction"],
    amenities: ["Gated Community", "Lift", "Swimming Pool", "Gym", "Parking"],
    propertyAge: ["0-5 years", "5-10 years", "10+ years"],
    facing: ["East", "West", "North", "South","NorthEast",
    "SouthEast",
    "SouthWest",
    "NorthWest",],
  },
  rent: {
    purpose: ["Residential", "Commercial"],
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    priceRange: ["₹0 - ₹10K", "₹10K - ₹25K", "₹25K - ₹50K", "₹50K+"],
    furnishingType: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
    amenities: ["Security", "Power Backup", "Lift", "Swimming Pool", "Gym"],
    facing: ["East", "West", "North", "South","NorthEast",
    "SouthEast",
    "SouthWest",
    "NorthWest",],

  },
  plot: {
    purpose: ["Residential", "Commercial"],
    propertyType: ["Residential Plot", "Commercial Plot"],
    priceRange: ["₹0 - ₹50L", "₹50L - ₹1Cr", "₹1Cr+"],
    facing: ["East", "West", "North", "South","NorthEast",
    "SouthEast",
    "SouthWest",
    "NorthWest",],
  },
  flatshare: {
    propertyType: ["Apartment", "Villa", "Independent House"],
    bhkType: ["1 BHK", "2 BHK", "3 BHK", "4 BHK+"],
    sharingType: ["Shared", "Single", "Any"],
    genderPreference: ["Male", "Female", "Any"],
    facing: ["East", "West", "North", "South","NorthEast",
    "SouthEast",
    "SouthWest",
    "NorthWest",],
  },
};

/** Default Refer & Earn filter options: how much user can earn (not property price). Used when API returns no options. */
const DEFAULT_REFER_AND_EARN_OPTIONS: { label: string; value: string }[] = [
  { label: "Earn up to ₹10k", value: "10000" },
  { label: "Earn up to ₹25k", value: "25000" },
  { label: "Earn up to ₹50k", value: "50000" },
  { label: "Earn up to ₹1L", value: "100000" },
  { label: "Earn up to ₹2.5L", value: "250000" },
];

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

export const emptyPropertyBarFilters: FilterState = {
  propertyType: [],
  bhkType: [],
  priceRange: [],
  referAndEarnPriceRange: [],
  saleType: [],
  furnishingType: [],
  constructionStatus: [],
  amenities: [],
  propertyAge: [],
  facing: [],
  builtUpArea: [0, 5000],
  genderPreference: [],
  sharingType: [],
  purpose: [],
};

export interface User {
  id: string;
  username?: string;
  fullName?: string;
  email: string;
  phone?: string;
  token?: string;
  roles: {
    id: string;
    roleName: string;
  };
}

type DropdownOption = string | { label: string; value: string };

/** Inner content for portaled dropdown; uses effect to track position when open. */
function FilterDropdownPortaledInner({
  open,
  buttonRef,
  displayLabel,
  filterKey,
  options,
  getOptionValue,
  getOptionDisplay,
  filters,
  onFilterChange,
}: {
  open: boolean;
  buttonRef: React.RefObject<HTMLDivElement>;
  displayLabel: string;
  filterKey: keyof FilterOptions;
  options: DropdownOption[];
  getOptionValue: (o: DropdownOption) => string;
  getOptionDisplay: (o: DropdownOption) => string;
  filters: FilterState;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
}) {
  const [position, setPosition] = useState<{ top: number; left: number; minWidth: number } | null>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: rect.width,
      });
    }
  };

  useLayoutEffect(() => {
    if (open) {
      updatePosition();
      const onScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    } else {
      setPosition(null);
    }
  }, [open]);

  return (
    <>
      <div ref={buttonRef}>
        <Menu.Button className="flex items-center border md:text-[12px] text-[10px] md:px-4 px-2 md:py-[6px] py-[4px] rounded-md font-medium bg-white text-black hover:bg-gray-100 text-nowrap w-full">
          {displayLabel} <ChevronDownIcon className="w-4 h-4 ml-2" />
        </Menu.Button>
      </div>
      {open &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <Menu.Items
            static
            className="flex flex-col w-42 bg-white border rounded-md shadow-lg p-0 z-[9999]"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              minWidth: position.minWidth,
            }}
          >
            {options.map((option) => {
              const value = getOptionValue(option);
              const display = getOptionDisplay(option);
              const isChecked = (filters[filterKey] as string[])?.includes(value);
              const showCheckbox = filterKey === "referAndEarnPriceRange";
              return (
                <Menu.Item key={value}>
                  {({ active }) => (
                    <Button
                      onClick={() => onFilterChange(filterKey, value)}
                      className={`flex items-center gap-2 w-full border-[1px] md:text-[12px] text-[10px] border-gray-200 font-medium md:rounded-[0px] rounded-[6px] px-2 py-1 text-left ${
                        isChecked ? "bg-[#3586FF] text-white" : "bg-gray-100"
                      }`}
                    >
                      {showCheckbox &&
                        (isChecked ? (
                          <Check className="w-4 h-4 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 shrink-0" />
                        ))}
                      {display}
                    </Button>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>,
          document.body
        )}
    </>
  );
}

/** Dropdown that renders its panel in a portal so it is not clipped by the filter bar's overflow-x. */
function FilterDropdownPortaled({
  displayLabel,
  filterKey,
  options,
  getOptionValue,
  getOptionDisplay,
  filters,
  onFilterChange,
}: {
  displayLabel: string;
  filterKey: keyof FilterOptions;
  options: DropdownOption[];
  getOptionValue: (o: DropdownOption) => string;
  getOptionDisplay: (o: DropdownOption) => string;
  filters: FilterState;
  onFilterChange: (key: keyof FilterOptions, value: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);

  return (
    <Menu as="div" className="inline-block text-left shadow-custom shrink-0">
      {({ open }) => (
        <FilterDropdownPortaledInner
          open={open}
          buttonRef={buttonRef}
          displayLabel={displayLabel}
          filterKey={filterKey}
          options={options}
          getOptionValue={getOptionValue}
          getOptionDisplay={getOptionDisplay}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      )}
    </Menu>
  );
}

export default function PropertiesNavbar({
  isDetailPage,
}: PropertiesNavbarProps) {
  const [user, setUser] = useState<User | null>();

  const [token, setToken] = useState<string | null>();
  const { items: wishListItems } = useWishlistStore((state) => state);
  const {
    activeTab,
    filters,
    selectedCities,
    setActiveTab,
    setFilters,
    setSelectedCities,
    referAndEarnPriceOptions,
  } = usePropertyFilterStore();

  const session = useSession();
  const { items } = useCartStore((state: any) => state);
  const { openAuth } = useAuthModal();

  const handlePostProperty = () => {
    if (session.status !== "authenticated") {
      router.push("/post-property");
    } else {
      router.push("/post-property/details");
    }
  };
  useEffect(() => {
    if (session.status === "authenticated") {
      const userData = session.data?.user as User | null;
      const userToken = userData?.token || localStorage.getItem("token");

      setUser(userData);
      setToken(userToken);

      if (userToken) {
        localStorage.setItem("token", userToken);
      }
    }
  }, [session]);

  const logo_place_holder = {
    imageUrl: "/images/logobw.png",
    link: "/",
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const isReferAndEarnOnly =
    typeof router.query.referAndEarn === "string"
      ? router.query.referAndEarn.toLowerCase() === "true"
      : false;

  const updateTabAndRoute = (newTab: PropertyTab) => {
    setActiveTab(newTab);
    const selectedCity = selectedCities?.[0]
      ?.toLowerCase()
      .replace(/\s+/g, "-");

    const newQuery: Record<string, any> = {};

    // if (newTab === "commercial") {
    //   newQuery["commercialPurpose"] = "Buy";
    // } else 
    if (newTab === "plot") {
      newQuery["plotPurpose"] = "Buy";
    }

    router.push({
      pathname: `/properties/${newTab}/${selectedCity || "Hyderabad"}`,
      query: newQuery,
    });
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    if (key === "builtUpArea") return;

    const currentValue = (filters as any)[key] as string[] | undefined;

    const updatedValue = (currentValue || []).includes(value)
      ? (currentValue || []).filter((item) => item !== value)
      : [...(currentValue || []), value];

    setFilters({ [key]: updatedValue });
  };

  type DropdownOption = string | { label: string; value: string };
  const getOptionValue = (o: DropdownOption) => (typeof o === "string" ? o : o.value);
  const getOptionDisplay = (o: DropdownOption) => (typeof o === "string" ? o : o.label);

  const renderDropdown = (
    label: string,
    key: keyof FilterOptions,
    options?: DropdownOption[]
  ) => {
    if (!options?.length) return null;

    const selectedValues = (filters[key] as string[] | undefined) || [];
    const displayLabel =
      selectedValues.length > 0
        ? selectedValues
            .map(
              (v) =>
                options.find((o) => getOptionValue(o) === v) !== undefined
                  ? getOptionDisplay(options.find((o) => getOptionValue(o) === v)!)
                  : v
            )
            .join(", ")
        : label;

    return (
      <>
        <div className="relative md:block hidden shrink-0">
          <FilterDropdownPortaled
            displayLabel={displayLabel}
            filterKey={key}
            options={options}
            getOptionValue={getOptionValue}
            getOptionDisplay={getOptionDisplay}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
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
                {displayLabel}
                <IoMdArrowDropdown className="w-4 h-4 ml-2" />
              </Button>
            }
          >
            <div
              className={twMerge(
                `md:absolute relative top-full md:left-0 left-0 mt-1 w-auto min-w-[180px] md:w-42 
          bg-white border rounded-md shadow-lg 
          flex flex-col md:flex-col 
          overflow-y-auto max-h-[70vh] md:max-h-none
          md:gap-0 gap-1 md:p-0 p-2`
              )}
            >
              {options.map((option) => {
                const value = getOptionValue(option);
                const display = getOptionDisplay(option);
                const isChecked = (filters[key] as string[])?.includes(value);
                const showCheckbox = key === "referAndEarnPriceRange";
                return (
                  <Button
                    key={value}
                    onClick={() => handleFilterChange(key, value)}
                    className={twMerge(
                      `flex items-center gap-2 border-[1px] text-[10px] md:text-[10px]
               border-gray-200 font-medium 
               rounded-[6px] 
               px-3 py-2.5 min-h-[44px] md:py-1 md:min-h-0 md:px-2
               text-left w-full justify-start
               ${isChecked ? "bg-[#3586FF] text-white border-[#3586FF]" : "bg-gray-100"} 
               hover:bg-gray-200 active:bg-gray-300`
                    )}
                  >
                    {showCheckbox &&
                      (isChecked ? (
                        <Check className="w-4 h-4 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 shrink-0" />
                      ))}
                    {display}
                  </Button>
                );
              })}
            </div>
          </DropDown>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="md:min-h-[40px] sticky z-[999] flex w-full items-center inset-x-0 top-0 bg-[#081221] py-[4px] ">
        <div className="flex w-full h-full max-md:px-3 items-center justify-between xl:px-10 lg:px-3">
          <Link
            className="relative shrink-0 lg:min-w-[130px] xl:min-w-[170px] min-h-[40px] hidden lg:flex flex-row items-center"
            href={logo_place_holder.link}
          >
            <span className="relative block h-[36px] w-[36px] xl:h-[40px] xl:w-[40px]">
              <Image
                src={logo_place_holder.imageUrl}
                alt={`source_image`}
                className="absolute object-contain"
                fill
              />
            </span>
            <span className="ml-1.5 xl:ml-2 flex flex-col items-center justify-center">
              <span className="font-bold lg:text-[17px] xl:text-[20px] text-[#3586FF] leading-tight">
                ONE
                <span className="text-white">CASA</span>
              </span>
              <span className="text-[9px] xl:text-[10px] text-center text-white leading-none">
                One Roof Every Solution
              </span>
            </span>
          </Link>
          <Link
            className="relative xl:min-w-[187px] xl:min-h-[40px] flex lg:hidden"
            href={logo_place_holder.link}
          >
            <span className="relative block h-[40px] w-[40px] pr-[10px]">
              <Image
                src={logo_place_holder.imageUrl}
                alt={`source_image`}
                className="absolute object-cover"
                fill
              />
            </span>
          </Link>

          <div className="w-full min-w-0 md:ml-[5px] ml-[1px]">
            <div className="flex items-center justify-between lg:gap-2 xl:gap-4 gap-1 w-full lg:px-2 xl:px-4 px-4 overflow-hidden">
              <div className=" max-w-[150px] md:max-w-none">
                <DropDown
                  gapY={8}
                  placement="bottom-start"
                  fallBackPlcmnts={["bottom", "bottom-end"]}
                  buttonElement={
                    <Button
                      className={twMerge(
                        "flex items-center border rounded-[6px] md:text-[14px] text-[10px] md:px-4 px-2 md:py-[4px] py-[2px] font-medium bg-white text-black hover:bg-gray-100 text-nowrap"
                      )}
                    >
                      {
                        tabs.find((tab) => tab.tabKey === activeTab)
                          ?.buttonLabel
                      }
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
                    ${activeTab === tab.tabKey
                            ? "bg-[#3586FF] text-white"
                            : "bg-white"
                          } 
                    `
                        )}
                      >
                        {tab.buttonLabel}
                      </Button>
                    ))}
                  </div>
                </DropDown>
              </div>

              <div className="md:flex-1  flex-0 min-w-0 md:ml-2 ml-0 w-full">
                <SearchBar
                  defaultCities={
                    selectedCities.length > 0 ? [selectedCities[0]] : []
                  }
                  activeTab={activeTab}
                  selectedCity={selectedCities[0] || "Hyderabad"}
                  onCitiesChange={(selectedCities) => {
                    setSelectedCities(selectedCities);
                  }}
                />
              </div>
            </div>
          </div>
          {
            <div className="hidden lg:flex items-center shrink-0 lg:gap-1 xl:gap-2 lg:ml-[4px] xl:ml-[10px]">
              <Button
                onClick={handlePostProperty}
                className="py-[3px] lg:px-[8px] xl:px-[10px] bg-white text-[#000000] font-medium rounded"
              >
                <span className="flex flex-row items-center gap-1.5">
                  <span className="text-nowrap lg:text-[12px] xl:text-[14px]">Post property</span>
                  <span
                    style={{
                      background:
                        "linear-gradient(99.41deg, #3586FF 7.11%, #205199 98.13%)",
                    }}
                    className="text-[10px] xl:text-xs w-[42px] xl:w-[50px] max-h-[20px] rounded px-1.5 xl:px-2 py-0.5 leading-[17px] text-white text-center"
                  >
                    Free
                  </span>
                </span>
              </Button>
              <div className="flex relative flex-row lg:gap-0 xl:gap-1 justify-center items-center">
                {user && (
                  <>
                    <Link
                      className="cursor-pointer lg:p-[6px] xl:p-[10px] relative"
                      href={"/user/wishlist"}
                      aria-label="Go to wishlist"
                    >
                      <IoHeart className="text-white lg:text-[20px] xl:text-[24px]" />
                      {wishListItems.length > 0 && (
                        <span className="absolute text-[8px] top-[2px] right-[2px] px-[5px] py-[2px] rounded-full bg-red-600 text-white">
                          {wishListItems.length}
                        </span>
                      )}
                    </Link>
                    <Link
                      className="cursor-pointer lg:p-[6px] xl:p-[10px]"
                      href={"/cart"}
                      aria-label="Go to cart"
                    >
                      <IoCartOutline className="text-white lg:text-[20px] xl:text-[24px]" />
                    </Link>
                  </>
                )}
                <p
                  className={`${items.length === 0 && "hidden"
                    } text-white font-medium text-[10px] absolute -top-[2px] -right-[2px] px-[6px] py-[1px] rounded-full bg-[#3586FF]`}
                >
                  {items.length}
                </p>
              </div>
              {!user || !token ? (
                <Button
                  onClick={() =>
                    openAuth({
                      callbackUrl: `${window.location.pathname}${window.location.search}`,
                      defaultMethod: "phone",
                    })
                  }
                  className="py-[4px] lg:px-[12px] xl:px-[18px] lg:text-[12px] xl:text-[14px] bg-[#3586FF] font-medium text-white rounded"
                >
                  Login
                </Button>
              ) : (
                <div className="cursor-pointer">
                  <Avatar />
                </div>
              )}
            </div>
          }
        </div>
      </div>
      {!isDetailPage && (
        <div className="sticky md:top-[54px] top-[40px] z-[50] bg-blue-100 w-full mx-auto md:px-4 md:py-1 px-3 py-1 md:mb-0 mb-2 pb-2 shadow-md backdrop-blur-sm overflow-x-auto overflow-y-visible no-scrollbar">
          <div className="lg:px-10 flex flex-row items-center gap-2 flex-nowrap min-w-max">
            {renderDropdown("Purpose", "purpose", filterOptions[activeTab]?.purpose)}
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
              "Price Range",
              "priceRange",
              filterOptions[activeTab]?.priceRange
            )}
            {renderDropdown(
              "Sale Type",
              "saleType",
              filterOptions[activeTab]?.saleType
            )}
            {renderDropdown(
              "Furnishing Type",
              "furnishingType",
              filterOptions[activeTab]?.furnishingType
            )}
            {renderDropdown(
              "Construction St...",
              "constructionStatus",
              filterOptions[activeTab]?.constructionStatus
            )}
            {renderDropdown(
              "Sharing Type",
              "sharingType",
              filterOptions[activeTab]?.sharingType
            )}
            {renderDropdown(
              "Gender",
              "genderPreference",
              filterOptions[activeTab]?.genderPreference
            )}


            <div className="relative">
              {activeTab !== "plot" && (
                <Button
                  onClick={() => setIsDrawerOpen(true)}
                  className="border md:px-4 px-2 md:py-[6px] py-[4px] font-medium md:rounded-md  rounded-[20px] bg-white hover:bg-gray-100 md:text-[12px] text-[10px] text-nowrap"
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
                      onChange={(value: any) => {
                        const key: keyof FilterState = "builtUpArea";
                        const updatedFilters = {
                          ...filters,
                          [key]: value as [number, number],
                        };
                        setFilters(updatedFilters);
                      }}
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
                        setIsDrawerOpen(false), setFilters(filters);
                      }}
                      className="w-full bg-[#3586FF] text-white py-2 rounded-md font-medium hover:bg-blue-700"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </Dialog>
            </div>
            <Button
              type="button"
              onClick={() => {
                const { referAndEarn, ...rest } = router.query;
                const baseQuery: Record<string, any> = { ...rest };

                const next = !isReferAndEarnOnly;
                if (next) {
                  baseQuery.referAndEarn = "true";
                }

                router.push(
                  {
                    pathname: `/properties/${activeTab}/${
                      selectedCities?.[0] ?? "Hyderabad"
                    }`,
                    query: baseQuery,
                  },
                  undefined,
                  { shallow: true },
                );
              }}
              className={twMerge(
                "border md:px-4 px-2 md:py-[6px] py-[4px] font-medium md:rounded-md rounded-[20px] text-[10px] md:text-[12px] text-nowrap shrink-0",
                isReferAndEarnOnly
                  ? "bg-[#3586FF] text-white border-[#3586FF]"
                  : "bg-white text-gray-800 hover:bg-gray-100",
              )}
            >
              Refer &amp; Earn
            </Button>
            {isReferAndEarnOnly &&
              renderDropdown(
                "Refer & Earn Price",
                "referAndEarnPriceRange",
                referAndEarnPriceOptions?.length > 0
                  ? referAndEarnPriceOptions
                  : DEFAULT_REFER_AND_EARN_OPTIONS
              )}
            <div className="hidden md:block shrink-0">
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
                        {filterOptions[activeTab].amenities?.map(
                          (amenity: any) => (
                            <Button
                              key={amenity}
                              className={`border px-3 py-1 text-[10px] rounded-md ${filters.amenities?.length &&
                                filters.amenities.includes(amenity)
                                ? "bg-[#3586FF] text-white"
                                : "bg-gray-100"
                                }`}
                              onClick={() =>
                                handleFilterChange("amenities", amenity)
                              }
                            >
                              {amenity}
                            </Button>
                          )
                        )}
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
                      "flex items-center border md:px-4 px-2 md:py-[6px] py-[4px] md:text-[16px] text-[10px] rounded-[20px] bg-white text-black font-medium hover:bg-gray-100 text-nowrap"
                    )}
                  >
                    More Filters
                    <IoMdArrowDropdown className="w-4 h-4 ml-2" />
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
                        {filterOptions[activeTab].amenities?.map(
                          (amenity: any) => (
                            <Button
                              key={amenity}
                              className={twMerge(
                                "border px-3 py-1 text-[10px] rounded-md whitespace-nowrap",
                                filters.amenities?.includes(amenity)
                                  ? "bg-[#3586FF] text-white"
                                  : "bg-gray-100"
                              )}
                              onClick={() =>
                                handleFilterChange("amenities", amenity)
                              }
                            >
                              {amenity}
                            </Button>
                          )
                        )}
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
      )}
    </>
  );
}
