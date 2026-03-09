import { DropDown } from "@/common/PopOver";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { GoChevronDown } from "react-icons/go";
import { IoIosSearch } from "react-icons/io";
import Button from "@/common/Button";
import { twMerge } from "tailwind-merge";
import CustomInput from "@/common/FormElements/CustomInput";
import { ResetIcon } from "@/components/Icons";

interface PropertyHeaderProps {
  rootCls?: string;
  allowedDropDowns?: Array<
    | "location"
    | "houseType"
    | "budget"
    | "sort"
    | "locality"
    | "search"
    | "rooms"
    | "reset"
    | "searchbar"
    | "searchbtn"
  >;
  dropDownButtonCls?: string;
  outerSearchCls?: string;
  searchButtonCls?: string;
  cityOptions: Array<{ label: string; value: string }>;
  typeOptions?: Array<string>;
  roomsOptions?: Array<string>;
  budgetOptions?: Array<string>;

  activeTab?: string;
  handleSearch: (prop: any) => void;
}

const PropertyHeader = ({
  rootCls,
  allowedDropDowns,
  dropDownButtonCls,
  outerSearchCls,
  searchButtonCls,
  cityOptions,
  typeOptions,
  roomsOptions,
  budgetOptions = [],
  activeTab,
  handleSearch,
}: PropertyHeaderProps) => {
  const city = typeof window !== "undefined" && localStorage.getItem("city");
  const [selectedFilters, setSelectedFilters] = useState({
    location:
      cityOptions.find((item) => item.value === city)?.label ||
      cityOptions[0]?.label,
    houseType: "",
    rooms: "",
    budget: "",
    search: "",
  });

  const handleFilterChange = (filter: string, value: string) => {
    const updatedFilters = {
      ...selectedFilters,
      [filter]: value,
    };
    setSelectedFilters(updatedFilters);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleSearchbtn = () => {
    handleSearch(selectedFilters);
  };

  const resetFilters = () => {
    const initialFilters = {
      location: cityOptions[0]?.label || "",
      houseType: "",
      rooms: "",
      budget: "",
      search: "",
    };
    setSelectedFilters(initialFilters);
  };

  useEffect(() => {
    resetFilters();
  }, [activeTab]);

  return (
    <>
      <div
        className={twMerge(
          "flex flex-row items-start w-full   divide-x divide-[#E1E1E1] rounded-lg border border-[#E1E1E1] ",
          rootCls
        )}
      >
        <div className="flex flex-row md:flex-nowrap flex-wrap justify-start items-center w-full mx-auto md:px-4 px-1">
          {allowedDropDowns?.includes("location") && (
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <button
                  className={twMerge(
                    "flex items-center md:gap-2 gap-1 cursor-pointer md:py-4 md:px-3 py-4 px-2.5 text-nowrap md:text-wrap hover:bg-black hover:bg-opacity-5",
                    dropDownButtonCls
                  )}
                >
                  <Image
                    src={`/icons/Location.svg`}
                    alt="location"
                    width={24}
                    height={24}
                    priority
                  ></Image>
                  <span className="font-medium text-[14px]">
                    {selectedFilters.location || "Select City"}
                  </span>
                  <GoChevronDown className="md:text-[20px] text-[16px] text-[#3586FF]" />
                </button>
              }
            >
              <div className="px-4 py-2 flex flex-col border bg-white border-[#E1E1E1] w-[130px] rounded shadow-md">
                {cityOptions?.map((option) => (
                  <span
                    key={option.value}
                    onClick={() => handleFilterChange("location", option.label)}
                    className="px-2 py-1 cursor-pointer  font-medium text-[14px] !hover:bg-[#3586FF] hover:bg-opacity-5"
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </DropDown>
          )}

          {allowedDropDowns?.includes("houseType") && (
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <button
                  className={twMerge(
                    "flex items-center md:gap-4 gap-2 cursor-pointer md:py-4 md:px-6 py-4 px-2.5 text-nowrap md:text-wrap hover:bg-black hover:bg-opacity-5",
                    dropDownButtonCls
                  )}
                >
                  <Image
                    src={`/icons/home.svg`}
                    alt="home"
                    width={24}
                    height={24}
                    priority
                  ></Image>
                  <span className="font-medium text-[14px] text-nowrap">
                    {selectedFilters.houseType || "Select Type"}
                  </span>
                  <GoChevronDown className="md:text-[20px] text-[16px] text-[#3586FF]" />
                </button>
              }
            >
              <div className="px-4 py-2 flex flex-col border bg-white border-[#E1E1E1] min-w-[130px] rounded shadow-md">
                {typeOptions?.map((option) => (
                  <span
                    key={option}
                    onClick={() => handleFilterChange("houseType", option)}
                    className="px-2 py-1 cursor-pointer font-medium text-[14px] !hover:bg-[#3586FF] hover:bg-opacity-5"
                  >
                    {option}
                  </span>
                ))}
              </div>
            </DropDown>
          )}
          {allowedDropDowns?.includes("rooms") &&
            roomsOptions &&
            roomsOptions?.length > 0 && (
              <DropDown
                gapY={8}
                placement="bottom-start"
                fallBackPlcmnts={["bottom", "bottom-end"]}
                buttonElement={
                  <button
                    className={twMerge(
                      "flex items-center   md:gap-4  gap-2 cursor-pointer md:py-4 md:px-6 py-4 px-2.5 text-nowrap md:text-wrap hover:bg-black hover:bg-opacity-5",
                      dropDownButtonCls
                    )}
                  >
                    <Image
                      src={`/icons/Bedtime.svg`}
                      alt="Bed time"
                      width={24}
                      height={24}
                      priority
                    ></Image>
                    <span className="font-medium text-[14px] text-nowrap">
                      {selectedFilters.rooms || "Select Rooms"}
                    </span>
                    <GoChevronDown className="md:text-[20px] text-[16px] text-[#3586FF]" />
                  </button>
                }
              >
                <div className="px-4 py-2 flex flex-col border bg-white border-[#E1E1E1] w-[130px] rounded shadow-md">
                  {roomsOptions?.map((option) => (
                    <span
                      key={option}
                      onClick={() => handleFilterChange("rooms", option)}
                      className="px-2 py-1 cursor-pointer font-medium text-[14px] !hover:bg-[#3586FF] hover:bg-opacity-5"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </DropDown>
            )}
          {allowedDropDowns?.includes("budget") &&
            budgetOptions &&
            budgetOptions?.length > 0 && (
              <DropDown
                gapY={8}
                placement="bottom-start"
                fallBackPlcmnts={["bottom", "bottom-end"]}
                buttonElement={
                  <button
                    className={twMerge(
                      "flex items-center md:gap-4 gap-2 cursor-pointer md:py-4 md:px-6  py-4 px-2.5 text-nowrap md:text-wrap hover:bg-black hover:bg-opacity-5",
                      dropDownButtonCls
                    )}
                  >
                    <Image
                      src={`/icons/rupee.svg`}
                      alt="rupee"
                      width={24}
                      height={24}
                      priority
                    ></Image>
                    <span className="font-medium text-[14px] text-nowrap">
                      {selectedFilters.budget || "Select Budget"}
                    </span>
                    <GoChevronDown className="md:text-[20px] text-[16px] text-[#3586FF]" />
                  </button>
                }
              >
                <div className="px-4 py-2 flex flex-col border bg-white border-[#E1E1E1] w-[130px] rounded shadow-md">
                  {budgetOptions?.map((option) => (
                    <span
                      key={option}
                      onClick={() => handleFilterChange("budget", option)}
                      className="px-2 font-medium text-[14px] py-1 text-nowrap cursor-pointer  !hover:bg-[#3586FF] hover:bg-opacity-5"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </DropDown>
            )}
          {allowedDropDowns?.includes("locality") && (
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <div
                  className={twMerge(
                    "flex items-center gap-4 cursor-pointer md:py-6 md:px-4 py-4 px-2.5 text-nowrap md:text-wrap hover:bg-black hover:bg-opacity-5",
                    dropDownButtonCls
                  )}
                >
                  <span className="font-medium text-[14px] text-nowrap">
                    Tambaram
                  </span>
                  <GoChevronDown className="text-[20px] text-[#3586FF]" />
                </div>
              }
            >
              <div className="px-4 py-2 flex flex-col border bg-white border-[#E1E1E1] w-[130px] rounded shadow-md">
                <span className="px-2 py-1 cursor-pointer hover:bg-black hover:bg-opacity-5">
                  Tambaram
                </span>
                <span className="px-2 py-1 cursor-pointer hover:bg-black hover:bg-opacity-5">
                  Tambaram
                </span>
                <span className="px-2 py-1 cursor-pointer hover:bg-black hover:bg-opacity-5">
                  Tambaram
                </span>
              </div>
            </DropDown>
          )}

          {allowedDropDowns?.includes("sort") && (
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <div
                  className={twMerge(
                    "flex items-center gap-4 cursor-pointer md:py-6 md:px-4 py-4 px-2.5 text-nowrap md:text-wrap hover:bg-black hover:bg-opacity-5",
                    dropDownButtonCls
                  )}
                >
                  <Image
                    src={`/icons/Location.svg`}
                    alt={""}
                    width={24}
                    height={24}
                    priority
                  ></Image>
                  <span className="font-medium text-[14px]">
                    Sort By: Relevence
                  </span>
                  <GoChevronDown className="text-[20px] text-[#3586FF]" />
                </div>
              }
            >
              <div className="px-4 py-2 flex flex-col border bg-white border-[#E1E1E1] w-[130px] rounded shadow-md">
                <span className="px-2 py-1 cursor-pointer hover:bg-black hover:bg-opacity-5">
                  Date
                </span>
                <span className="px-2 py-1 cursor-pointer hover:bg-black hover:bg-opacity-5">
                  Cost
                </span>
                <span className="px-2 py-1 cursor-pointer hover:bg-black hover:bg-opacity-5">
                  Type
                </span>
              </div>
            </DropDown>
          )}
          {allowedDropDowns?.includes("search") && (
            <div className={twMerge("py-2 px-4", outerSearchCls)}>
              <Button
                className={twMerge(
                  "font-medium text-white text-nowrap md:text-wrap bg-[#3586FF] px-4 py-[13px] rounded-xl flex items-center gap-1",
                  searchButtonCls
                )}
                onClick={handleSearchbtn}
              >
                <IoIosSearch />
                <>Search here</>
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-3  justify-between items-center !w-[90%] mx-auto mt-4">
        {allowedDropDowns?.includes("searchbar") && (
          <div className="md:w-[60%]">
            <CustomInput
              type="text"
              name="name"
              value={selectedFilters?.search}
              rootCls="bg-white "
              className="placeholder:text-[14px] leading-[20px] font-regular h-[34px]  placeholder:text-[#959595] py-3 "
              onChange={(e: any) =>
                handleFilterChange("search", e.target.value)
              }
              placeholder="Enter locality ,landmark or builder"
            />
          </div>
        )}
        {allowedDropDowns?.includes("searchbtn") && (
          <div className={twMerge("py-2 px-4", outerSearchCls)}>
            <Button
              className={twMerge(
                "font-medium text-white text-nowrap md:text-wrap bg-[#418cfb] px-4 md:py-[13px] py-2 lg:py-[10px] lg:px-[12px] rounded-3xl flex items-center gap-1",
                searchButtonCls
              )}
              onClick={handleSearchbtn}
            >
              <IoIosSearch />
              <span className="lg:text-nowrap">Search here</span>
            </Button>
          </div>
        )}
        {allowedDropDowns?.includes("reset") && (
          <div className={twMerge("xl:py-2 xl:px-4 ", outerSearchCls)}>
            <Button
              className={twMerge(
                "font-medium  text-[#418cfb] text-nowrap md:text-wrap bg-white border-2 border-[#3586FF] px-4 xl:py-[12px] py-[6px] lg:py-[8px] lg:px-[12px] rounded-3xl flex items-center gap-1 hover:bg-blue-300",
                searchButtonCls
              )}
              onClick={handleResetFilters}
            >
              <ResetIcon />
              <span className="text-nowrap">Reset</span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyHeader;
