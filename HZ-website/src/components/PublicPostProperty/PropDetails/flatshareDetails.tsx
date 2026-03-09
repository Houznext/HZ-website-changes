import React, { useState } from "react";
import CustomInput from "@/common/FormElements/CustomInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, {
  FlatshareAttributes,
  SizeWithUnit,
} from "@/store/postproperty";
import {
  lookingForOptions,
  occupanyStatusOptions,
  waterAvailabilityOptions,
} from "@/store/propertyStore";
import { bhkArray, propertyTypeEnum, BHK } from "../PropertyHelpers";
import SingleSelect from "@/common/FormElements/SingleSelect";
import toast from "react-hot-toast";
import { facingTypes } from "@/components/Property/PropertyDetails/PropertyHelpers";
import { useEffect } from "react";
import ResidentialFurnishingDetails from "./ResidentialFurnishingDetails";

const FlatshareDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const { errors } = usePostPropertyStore();
  const handleChange = (
    key: keyof FlatshareAttributes,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    const prevAttributes: Partial<FlatshareAttributes> =
      propertyDetails?.flatshareAttributes ?? {};

    if (key === "bathroom") {
      if (typeof value === "number" && value > 999) {
        // toast.error("Number of bathrooms cannot exceed 999");
        value = 999;
      }
    }
    if (key === "balcony") {
      if (typeof value === "number" && value > 999) {
        // toast.error('Number of Balconies cannot exceed 999')
        value = 999;
      }
    }
    if (key === "totalFloors") {
      if (typeof value === "number" && value > 999) {
        // toast.error('TotalFloors cannot exceed 999')
        value = 999;
      }
    }

    const sizeDefault =
      key === "floorArea" ? { size: 0, unit: "sq.ft" as const } : {};

    const updatedAttributes = {
      ...prevAttributes,
      [key]: nestedKey
        ? {
            ...sizeDefault,
            ...((prevAttributes[key] as SizeWithUnit) ?? {}),
            [nestedKey]: value,
          }
        : value,
    };

    const updatedPropertyDetails = {
      ...propertyDetails,
      flatshareAttributes: updatedAttributes,
    };

    setPropertyDetails({
      ...property,
      propertyDetails: updatedPropertyDetails,
    });
  };

  const getFloorSuffix = (floorNumber: number) => {
    if (floorNumber === 1) return "st";
    if (floorNumber === 2) return "nd";
    if (floorNumber === 3) return "rd";
    return "th";
  };
  useEffect(() => {
    const prev: Partial<FlatshareAttributes> =
      propertyDetails?.flatshareAttributes ?? {};
    const updates: Partial<FlatshareAttributes> = {};

    if (prev.currentFloor === undefined || prev.currentFloor === null) {
      updates.currentFloor = 1;
    }
    if (!prev.floorArea?.unit) {
      updates.floorArea = { ...(prev.floorArea ?? { size: 0 }), unit: "sq.ft" } as SizeWithUnit;
    }

    if (Object.keys(updates).length > 0) {
      const updatedPropertyDetails = {
        ...propertyDetails,
        flatshareAttributes: { ...prev, ...updates },
      };
      setPropertyDetails({
        ...property,
        propertyDetails: updatedPropertyDetails,
      });
    }
  }, []);
  const filteredBhkArray =
    propertyDetails?.propertyType === propertyTypeEnum.Villa ||
    propertyDetails?.propertyType === propertyTypeEnum.IndependentHouse
      ? bhkArray.filter((b) => b !== BHK.RK)
      : bhkArray;

  return (
    <>
      <div className="gap-2 flex flex-col">
        <SelectBtnGrp
          options={lookingForOptions}
          label="Looking For"
          labelCls="md:text-[14px] text-[13px] font-medium text-black md:mb-2"
          required
          className="gap-2   md:max-w-[400px] lg:max-w-[700px] flex-wrap min-w-[1500px]:max-w-[700px]"
          btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[16px]  px-[12px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
          onSelectChange={(value) => handleChange("lookingFor", value)}
          defaultValue={propertyDetails?.flatshareAttributes?.lookingFor}
        />
        <SelectBtnGrp
          options={occupanyStatusOptions}
          label="Occupancy Type"
          labelCls="md:text-[14px] text-[13px] font-medium text-black md:mb-2"
          required
          className="gap-2 md:max-w-[400px] flex-wrap"
          btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[16px] px-[12px] shadow-custom py-[8px] border border-gray-200"
          onSelectChange={(value) => handleChange("occupancy", value)}
          defaultValue={propertyDetails?.flatshareAttributes?.occupancy}
        />

        <SelectBtnGrp
          options={waterAvailabilityOptions}
          label="Water Availability"
          labelCls="md:text-[14px] text-[13px] font-medium text-black md:mb-2"
          required
          className="gap-2 md:max-w-[400px] flex-wrap"
          btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[16px] px-[12px] shadow-custom py-[8px] border border-gray-200"
          onSelectChange={(value) => handleChange("waterAvailability", value)}
          defaultValue={propertyDetails?.flatshareAttributes?.waterAvailability}
        />
      </div>
      <div className="flex flex-col gap-3">
        <SelectBtnGrp
          // options={bhkArray}
          options={filteredBhkArray}
          label="No of BHK"
          labelCls="md:text-[14px] text-[13px] font-medium text-black md:mb-1"
          className="md:gap-2 gap-x-2 gap-y-1   md:max-w-[400px] lg:max-w-[700px] flex-wrap min-w-[1500px]:max-w-[700px]"
          btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[21px]  px-[16px] shadow-custom md:py-[10px] py-[8px] border-[1px] border-gray-200"
          onSelectChange={(value) => handleChange("bhk", value)}
          defaultValue={propertyDetails?.flatshareAttributes?.bhk}
        />
        <SelectBtnGrp
          options={facingTypes}
          label="Facing"
          labelCls="md:text-[14px] text-[13px] font-medium text-black md:mb-2"
          required
          className="md:gap-2 gap-x-2 gap-y-1 md:max-w-[400px] lg:max-w-[700px] flex-wrap min-w-[1500px]:max-w-[700px]"
          btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[21px]  px-[18px] shadow-custom md:py-[10px] py-[8px] border-[1px] border-gray-200"
          onSelectChange={(value) => handleChange("facing", value)}
          defaultValue={propertyDetails?.flatshareAttributes?.facing}
        />
        <CustomInput
          label="Floor Area"
          type="number"
          className="px-2 "
          placeholder="Enter floor area"
          labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
          value={propertyDetails?.flatshareAttributes?.floorArea?.size || null}
          onChange={(e) => handleChange("floorArea", +e.target.value, "size")}
          unitsDropdown={{
            value: propertyDetails?.flatshareAttributes?.floorArea?.unit || "sq.ft",
            options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
            onChange: (val) => handleChange("floorArea", val, "unit"),
          }}
          required
        />

        <div className="flex gap-3">
          <CustomInput
            label="Bathrooms"
            type="number"
            className="px-2"
            placeholder="Enter bathrooms"
            labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
            value={propertyDetails?.flatshareAttributes?.bathroom || null}
            onChange={(e) => handleChange("bathroom", +e.target.value)}
            max={999}
            maxLength={2}
            required
          />
          <CustomInput
            label="Balcony"
            type="number"
            placeholder="Enter balcony"
            className="px-2"
            labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
            value={propertyDetails?.flatshareAttributes?.balcony || null}
            onChange={(e) => handleChange("balcony", +e.target.value)}
            maxLength={2}
            required
          />
        </div>
        <div></div>
        <div className="flex gap-3">
          {propertyDetails?.propertyType &&
            (propertyDetails?.propertyType === propertyTypeEnum.Apartment ||
              propertyDetails?.propertyType ===
                propertyTypeEnum.IndependentFloor ||
              propertyDetails?.propertyType ===
                propertyTypeEnum.IndependentHouse ||
              propertyDetails?.propertyType === propertyTypeEnum.Villa) && (
              <div className="w-full">
                <CustomInput
                  label="Total Floors"
                  type="number"
                  required
                  labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
                  placeholder="Enter total floors"
                  className="px-2"
                  value={
                    propertyDetails?.flatshareAttributes?.totalFloors || null
                  }
                  onChange={(e) => handleChange("totalFloors", +e.target.value)}
                />
              </div>
            )}

          {propertyDetails?.propertyType &&
            (propertyDetails?.propertyType === propertyTypeEnum.Apartment ||
              propertyDetails?.propertyType ===
                propertyTypeEnum.IndependentFloor) && (
              <div className="w-full">
                <SingleSelect
                  label="Your floor"
                  name="currentFloor"
                  labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
                  options={Array.from(
                    {
                      length:
                        propertyDetails?.flatshareAttributes?.totalFloors || 4,
                    },
                    (_, index) => {
                      const floorNumber = index;
                      const floorLabel =
                        floorNumber === 0
                          ? "Ground"
                          : `${floorNumber}${getFloorSuffix(floorNumber)}`;

                      return {
                        id: floorNumber,
                        floor: floorLabel,
                      };
                    }
                  )}
                  required
                  buttonCls="md:text-[12px] text-[10px] font-medium  rounded-md md:px-[21px]  px-[16px] shadow-custom md:py-[9px] py-[8px] border-[1px] border-gray-200"
                  handleChange={(name, value) =>
                    handleChange(name as keyof FlatshareAttributes, value.id)
                  }
                  selectedOption={
                    typeof propertyDetails?.flatshareAttributes
                      ?.currentFloor === "number"
                      ? propertyDetails.flatshareAttributes.currentFloor === 0
                        ? { floor: "Ground", id: 0 }
                        : {
                            id: propertyDetails.flatshareAttributes
                              .currentFloor,
                            floor: `${
                              propertyDetails.flatshareAttributes.currentFloor
                            }${getFloorSuffix(
                              propertyDetails.flatshareAttributes.currentFloor
                            )}`,
                          }
                      : { floor: "1st", id: 1 }
                  }
                  optionsInterface={{ isObj: true, displayKey: "floor" }}
                  type={"single-select"}
                />
              </div>
            )}
        </div>
        <SelectBtnGrp
          label="Two wheeler parking available?"
          options={["Yes", "No"]}
          btnClass="md:text-[14px] text-[13px] font-medium md:px-3 px-3 md:py-2 py-[6px]  rounded-md"
          labelCls="md:text-[14px] text-[13px] font-medium text-black "
          onSelectChange={(val) => handleChange("parking2w", val === "Yes")}
          className="flex gap-2 "
          required
          defaultValue={
            propertyDetails?.flatshareAttributes?.parking2w ? "Yes" : "No"
          }
        />
        <SelectBtnGrp
          label="Four wheeler parking available?"
          options={["Yes", "No"]}
          btnClass="md:text-[14px] text-[13px] font-medium md:px-3 px-3 md:py-2 py-[6px]  rounded-md"
          labelCls="md:text-[14px] text-[13px] font-medium text-black "
          onSelectChange={(val) => handleChange("parking4w", val === "Yes")}
          className="flex gap-2"
          required
          defaultValue={
            propertyDetails?.flatshareAttributes?.parking4w ? "Yes" : "No"
          }
        />
      </div>
    </>
  );
};

export default FlatshareDetails;
