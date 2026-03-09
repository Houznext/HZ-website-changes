import CustomInput from "@/common/FormElements/CustomInput";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { SearchIcon } from "../../icons";
import SingleSelect from "@/common/FormElements/SingleSelect";
import PriceBreakdownTooltip from "../CostEstimator/PriceBreakdownTooltip";
import ReactGA from "react-ga4";
import Button from "@/common/Button";

interface ICalculatorInputsProps {
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> &
  React.ChangeEventHandler<HTMLTextAreaElement>;
  handleEstimateCost: any;
  packageDetails: { title: string; data: { title: string; desc: string }[] }[];
  activeTab: number;
  setActiveTab: any;
  estimatedCost: number | null;
  formData: {
    builtupArea: number;
    balcony: number;
    carParking: number;
    location: string;
    mobileNumber: string;
    name: string;
  };
  dummyLocations: {
    area: string;
    city: string;
    state: string;
    pincode: string;
  }[];
  carParkingInputOptions: number[];
}

const CalculatorInputs = ({
  handleInputChange,
  handleEstimateCost,
  packageDetails,
  activeTab,
  setActiveTab,
  estimatedCost,
  formData,
  dummyLocations,
  carParkingInputOptions,
}: ICalculatorInputsProps) => {
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    mobileNumber: "",
    name: "",
    location: "",
    builtupArea: "",
    balcony: "",
  });

  useEffect(() => {
    const searchQuery = formData.location.toLowerCase();

    if (searchQuery.length > 0) {
      const filteredSuggestions = dummyLocations
        .filter(
          (loc) =>
            loc.area.toLowerCase().includes(searchQuery) ||
            loc.city.toLowerCase().includes(searchQuery)
        )
        .map((loc) => `${loc.area}, ${loc.city}, ${loc.state}, ${loc.pincode}`);

      setLocationSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [formData.location, dummyLocations]);

  useEffect(() => {
    handleSubmit(true);
  }, [activeTab]);

  const handleLocationSelect = (location: string) => {
    handleInputChange({
      target: { name: "location", value: location },
    } as React.ChangeEvent<HTMLInputElement>);

    setTimeout(() => {
      setShowSuggestions(false);
    }, 0);
  };

  const validateInputs = (isPackage: boolean = false) => {
    let newErrors = {
      mobileNumber: "",
      name: "",
      location: "",
      builtupArea: "",
      balcony: "",
    };
    let isValid = true;

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number.";
      isValid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required.";
      isValid = false;
    }

    if (Number.isNaN(formData.builtupArea)) {
      newErrors.builtupArea = "Built-up area must be a number";
      isValid = false;
    } else if (formData.builtupArea <= 0) {
      newErrors.builtupArea = "Built-up area must be greater than 0.";
      isValid = false;
    }

    if (Number.isNaN(formData.balcony)) {
      newErrors.balcony = "Balcony area must be a number";
      isValid = false;
    } else if (formData.balcony <= 0) {
      newErrors.balcony = "Balcony area must be greater than 0";
      isValid = false;
    }

    if (isPackage) {
      return isValid;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (isPackage: boolean = false) => {
    if (validateInputs(isPackage)) {
      handleEstimateCost(activeTab);
    }
    ReactGA.event({
      category: "User Interaction", // General category (e.g., User Interaction)
      action: "Get Estimated Cost", // Action (e.g., button clicked)
      label: "Estimate Button", // Optional label for more context
    });
  };

  return (
    <div className="md:py-[18px] md:px-[20px] px-3  p-[20px] custom-box-shadow rounded-[16px] ">
      {/* Tab Section */}
      <div className="flex overflow-x-auto bg-[#E1EDFF] md:gap-1 mx-auto items-center justify-center gap-1 rounded-md w-full mb-6 p-1">
        {packageDetails.map((pkg, index) => (
          <Button
            key={pkg.title}
            className={`p-2 text-[#3586FF]  md:text-[14px] text-[12px] md:rounded-[10px] rounded-[4px] font-bold px-[px] md:py-[4px] py-[2px] md:w-1/4 h-full ${activeTab === index ? "bg-white shadow-md"
              : "hover:bg-[#d2e3ff]"
              }`}
            onClick={() => {
              setActiveTab(index);
            }}
          >
            {pkg.title.split(" ")[0]}
          </Button>
        ))}
      </div>

      {/* Form Fields */}
      <div className="w-full  flex flex-col md:gap-3 gap-1">
        {/* Mobile Number */}
        <div className="flex flex-col md:gap-[12px] gap-[12px]">
          <div className="flex flex-col gap-y-2 md:flex-row w-full justify-between md:items-center items-start mt-2 relative">
            <p className="md:text-[14px] text-[12px] font-medium leading-[23px] text-[#081221]">
              <label htmlFor="mobileNumber">Mobile number  <span className="text-red-500">*</span></label>
            </p>
            <CustomInput
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              placeholder="Enter your mobile number"
              required
             className="md:py-1 py-0.5"
              rootCls={`md:max-w-[300px]`}
              errorMsg={`${errors.mobileNumber ? errors.mobileNumber : ""}`}
              onChange={handleInputChange}
              errorCls="absolute -bottom-3"
            />
          </div>
        </div>

        {/* Name */}
        <div className="flex flex-col md:gap-[12px] gap-[12px]">
          <div className="flex flex-col gap-y-2 md:flex-row w-full justify-between md:items-center items-start relative">
            <p className="md:text-[14px] text-[12px] font-medium leading-[23px] text-[#081221]">
              <label htmlFor="name">Name  <span className="text-red-500">*</span></label>
            </p>
            <CustomInput
              type="text"
              name="name"
              placeholder="Enter your name"
              id="name"
              rootCls={`md:max-w-[300px]`}
              className="md:py-1 py-0.5"
              errorMsg={`${errors.name ? errors.name : ""}`}
              onChange={handleInputChange}
              errorCls="absolute -bottom-3"
              required
            />
          </div>
        </div>

        {/* Location Search */}
        <div className="flex flex-col md:gap-[12px] gap-[12px]">
          <div className="relative flex flex-col md:flex-row w-full justify-between md:items-center items-start">
            <p className="md:text-[14px] text-[12px] font-medium leading-[23px] text-[#081221]">
              <label htmlFor="searchlocation"> Search Location  <span className="text-red-500">*</span></label>
            </p>
            <div className="relative w-full md:max-w-[300px]">
              <CustomInput
                type="text"
                name="location"
                placeholder="Enter your location"
                className="md:py-1 py-0.5"
                id="searchlocation"
                value={formData.location}
                onChange={handleInputChange}
                required
                rightIcon={<SearchIcon />}
                rootCls={`md:max-w-[300px]`}
                errorMsg={`${errors.location ? errors.location : ""}`}
                errorCls="absolute -bottom-3"
              />
              {showSuggestions && (
                <ul className="absolute top-[45px] bg-white z-10 shadow-md rounded-md w-full max-h-[200px] overflow-auto">
                  {locationSuggestions.length > 0 ? (
                    locationSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))
                  ) : (
                    <li className="p-2 text-center text-gray-500">
                      No locations found
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Built-up Area */}
        <div className="flex flex-col md:flex-row w-full gap-y-2 justify-between md:items-center items-start relative">
          <p className="md:text-[14px] text-[12px] font-medium leading-[23px] text-[#081221]">
            <label htmlFor="area">House Built-up Area (sq.ft)  <span className="text-red-500">*</span></label>
          </p>
          <CustomInput
            type="number"
            name="builtupArea"
            id="area"
            className="md:py-1 py-0.5"
            rootCls={`md:max-w-[300px] ${errors.builtupArea ? "border-red-500" : ""
              }`}
            placeholder="Enter your built-up area"
            onChange={handleInputChange}
            required
            errorMsg={`${errors.builtupArea ? errors.builtupArea : ""}`}
            errorCls="absolute -bottom-3"
          />
        </div>

        {/* Balcony */}
        <div className="flex md:flex-row flex-col justify-between gap-2 items-center relative">
          <CustomInput
            label="Balcony & Utility (sq.ft)"
            type="number"
            name="balcony"
            className="md:py-1 py-0.5"
            placeholder="Balcony & Utility (sq.ft)"
            required
            rootCls={`md:w-[50%] md:max-w-[300px]`}
            onChange={handleInputChange}
            labelCls="font-medium md:text-[14px] text-[12px]"
            errorMsg={`${errors.balcony ? errors.balcony : ""}`}
            errorCls="absolute -bottom-3"
            aria-label="Balcony & Utility (sq.ft)"
          />

          <SingleSelect
            type={"single-select"}
            label="No of car parking (Eg: 100 sq.ft/unit)"
            name={"carParking"}
            rootCls={`md:w-[50%] md:max-w-[270px] `}
            handleChange={(name, value) => {
              handleInputChange({
                target: { name, value: value },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            options={carParkingInputOptions}
            selectedOption={formData.carParking}
            optionsInterface={{ isObj: false }}
            required
            buttonCls="border-[#D9D9D9] md:w-[270px] w-[300px]  border-[1px] pl-[45%]"
            labelCls="font-medium md:text-[14px] text-[12px]"
          />
        </div>

        {/* Car Parking */}
        <div className="flex flex-col gap-[16px]"></div>

        {/* Get Estimated Cost */}
        <div>
          <Button
            className="bg-[#3586FF] md:py-[6px] py-[4px] w-full md:text-[14px] text-[12px] rounded-[6px] text-white font-bold"
            onClick={() => handleSubmit(false)}
          >
            Get estimated cost
          </Button>
        </div>

        {/* Estimated Cost and More Info */}
        <div className="flex md:flex-row md:justify-between md:mt-4 flex-col gap-3 md:gap-0">
          <div className="flex flex-col md:flex-row md:items-end md:gap-4 gap-2 w-full">
            <p className="md:text-[16px] text-[13px] font-medium leading-[23px] text-[#081221]">
              Estimated Cost:
            </p>
            <div className="text-center flex">
              {estimatedCost && (
                <>
                  <p className="md:text-[16px] text-[12px] font-medium leading-[23px] text-[#3586FF] border-black border-b">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(estimatedCost)}
                  </p>
                  <PriceBreakdownTooltip
                    packageData={packageDetails[activeTab]}
                    formData={formData}
                    estimatedCost={estimatedCost}
                  />
                </>
              )}
            </div>
          </div>
          <Link
            href="/"
            className="md:text-[14px] text-[12px] underline font-medium leading-[23px] text-[#3586FF] text-nowrap"
          >
            Know more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CalculatorInputs;
