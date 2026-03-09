import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import React, { useEffect, useState } from "react";
import {
  CommercialPropertyTypeEnum,
  OfficeLocationHub,
  OtherLocationHub,
  OwnershipType,
  propertyTypeEnum,
  SuitableForOfficePlotEnum,
  SuitableForOfficePlotOptions,
  SuitableForShowRoomAndShopEnum,
  SuitableForShowRoomAndShopOptions,
} from "./PropertyHelpers/index";
import CustomInput from "@/src/common/FormElements/CustomInput";
import FloatingInput from "@/src/common/FloatingInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import CommercialFacilites from "./CommercialFacilites";
import MultiCheckbox from "@/src/common/MultiCheckbox";
import usePostPropertyStore, {
  CommercialAttributes,
} from "@/src/stores/postproperty";
import { initialErrorState } from "../PropertyForm";
import { SizeWithUnit } from "@/src/stores/companyproperty";

const CommercialPropertyDetails = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );

  const property = usePostPropertyStore((state) => state.getProperty());

  const handleChange = (
    key: keyof CommercialAttributes,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    const prevAttributes: Partial<CommercialAttributes> =
      propertyDetails?.commercialAttributes ?? {};

    const updatedCommercialAttributes = {
      ...prevAttributes,
      [key]: nestedKey
        ? {
            ...((prevAttributes[key] as SizeWithUnit) ?? {}),
            [nestedKey]: value,
          }
        : value,
    };

    const updatedPropertyDetails = {
      ...propertyDetails,
      commercialAttributes: updatedCommercialAttributes,
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
  if (
    propertyDetails?.commercialAttributes?.currentFloor === undefined ||
    propertyDetails?.commercialAttributes?.currentFloor === null
  ) {
    handleChange("currentFloor", 1);
  }
}, []);


  return (
    <>
      <MultiCheckbox
        options={
          propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE ||
          propertyDetails?.propertyType === CommercialPropertyTypeEnum.PLOT
            ? SuitableForOfficePlotOptions
            : SuitableForShowRoomAndShopOptions
        }
        label="Select what your property is suitable for"
        onChange={(selectedValues) =>
          handleChange("suitableFor", selectedValues)
        }
        selectedValues={propertyDetails?.commercialAttributes?.suitableFor}
        error={errors.propertyDetails.commercialAttributes?.suitableFor}
        labelCls="label-text font-medium text-black "
      />

      <SelectBtnGrp
        options={
          propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE
            ? OfficeLocationHub
            : OtherLocationHub
        }
        label="Location hub"
        labelCls="label-text font-medium text-black "
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("locationHub", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.locationHub}
        error={errors.propertyDetails.commercialAttributes?.locationHub}
      />

      <SelectBtnGrp
        options={OwnershipType}
        label="Ownership Type"
        labelCls="label-text font-medium text-black "
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("ownership", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.ownership}
        error={errors.propertyDetails.commercialAttributes?.ownership}
      />

      <CustomInput
        label="Built up area (in Sq.ft)"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.commercialAttributes?.builtUpArea?.size}
        name="builtUpArea"
        onChange={(e) => handleChange("builtUpArea", +e.target.value, "size")}
        errorMsg={errors.propertyDetails.commercialAttributes?.builtUpArea}
        unitsDropdown={{
          value: propertyDetails?.commercialAttributes?.builtUpArea?.unit,
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("builtUpArea", val, "unit"),
        }}
      />

      <div>
        <p className="btn-text font-medium mt-5 mb-5 text-black">
          Floor Details
        </p>
        <div className="flex md:gap-2 gap-1">
          <div>
            <CustomInput
              type="number"
              label="Total Floors"
              className="px-2 md:py-[4px] py-1"
              labelCls="label-text font-medium text-black "
              placeholder="Enter total floors"
              value={propertyDetails?.commercialAttributes?.totalFloors}
              name="totalFloors"
              onChange={(e) => handleChange("totalFloors", +e.target.value)}
              errorMsg={
                errors.propertyDetails.commercialAttributes?.totalFloors
              }
            />
          </div>
          <div>
            <SingleSelect
              label="Your floor"
              labelCls="label-text font-medium text-black "
              type="single-select"
              buttonCls=" md:px-[40px] px-[25px] md:py-[10px] py-[5px] border-b-[6px] border-gray-200 rounded-md mb-3"
              name="currentFloor"
              options={Array.from(
  {
    length: propertyDetails?.commercialAttributes?.totalFloors || 4,
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

              handleChange={(name, value) =>
                handleChange(name as keyof CommercialAttributes, value.id)
              }
              openButtonCls="bg-gray-100 text-black"
              optionCls="md:text-[14px] text-[10px] hover:bg-[#3586FF] hober:text-white  font-regular text-black"
             selectedOption={
  typeof propertyDetails?.commercialAttributes?.currentFloor === "number"
    ? propertyDetails.commercialAttributes.currentFloor === 0
      ? { floor: "Ground", id: 0 }
      : {
          id: propertyDetails.commercialAttributes.currentFloor,
          floor: `${propertyDetails.commercialAttributes.currentFloor}${getFloorSuffix(
            propertyDetails.commercialAttributes.currentFloor
          )}`,
        }
    : { floor: "1st", id: 1 }
}

              optionsInterface={{ isObj: true, displayKey: "floor" }}
              errorMsg={
                errors.propertyDetails.commercialAttributes?.currentFloor
              }
            />
          </div>
        </div>
      </div>

      <div className="py-3">
        <p className="btn-txt text-[#5297ff] mb-4 mt-4 font-medium">
          Parking
        </p>
        <div className="">
          <CustomInput
            label="No of 2 wheelers parking can accomodate?"
            type="number"
            labelCls="label-text font-medium text-black "
            value={propertyDetails?.commercialAttributes?.twoWheelerParking}
            name="twoWheelerParking"
            onChange={(e) => handleChange("twoWheelerParking", +e.target.value)}
            errorMsg={
              errors.propertyDetails.commercialAttributes?.twoWheelerParking
            }
          />

          <CustomInput
            label="No of 4 wheelers parking can accomodate?"
            type="number"
            labelCls="label-text font-medium text-black "
            value={propertyDetails?.commercialAttributes?.fourWheelerParking}
            name="fourWheelerParking"
            onChange={(e) =>
              handleChange("fourWheelerParking", +e.target.value)
            }
            errorMsg={
              errors.propertyDetails.commercialAttributes?.fourWheelerParking
            }
          />
        </div>
      </div>

      {propertyDetails?.propertyType ===
        CommercialPropertyTypeEnum.SHOW_ROOM && (
        <div className="py-3">
          <p className="btn-txt text-[#5297ff] md:mb-4 mb-3 md:mt-4 mt-3 font-medium">
            Entrance Area
          </p>
          <div className="">
            <CustomInput
              label="Entrance Width (in Sq.ft)"
              type="number"
              labelCls="label-text font-medium text-black "
              value={
                propertyDetails?.commercialAttributes?.entranceAreaWidth
                  ?.size || null
              }
              name="entranceAreaWidth"
              onChange={(e) =>
                handleChange("entranceAreaWidth", +e.target.value, "size")
              }
              unitsDropdown={{
                value:
                  propertyDetails?.commercialAttributes?.entranceAreaWidth
                    ?.unit || "sq.ft",
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val) =>
                  handleChange("entranceAreaWidth", val, "unit"),
              }}
              errorMsg={
                errors.propertyDetails.commercialAttributes?.entranceAreaWidth
              }
            />
            <CustomInput
              label="Entrance Height (in Sq.ft)"
              type="number"
              labelCls="label-text font-medium text-black "
              value={
                propertyDetails?.commercialAttributes?.entranceAreaHeight
                  ?.size || null
              }
              unitsDropdown={{
                value:
                  propertyDetails?.commercialAttributes?.entranceAreaHeight
                    ?.unit || "sq.ft",
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val) =>
                  handleChange("entranceAreaHeight", val, "unit"),
              }}
              name="entranceAreaHeight"
              onChange={(e) =>
                handleChange("entranceAreaHeight", +e.target.value)
              }
              errorMsg={
                errors.propertyDetails.commercialAttributes?.entranceAreaHeight
              }
            />
          </div>
        </div>
      )}

      <div className="py-3">
        <p className="btn-txt text-[#52897ff] md:mb-4 mb-2 md:mt-4 mt-2 font-medium">
          Lifts and stair cases
        </p>
        <div className="">
          <CustomInput
            label="No of stair cases"
            type="number"
            labelCls="label-text font-medium text-black "
            value={propertyDetails?.commercialAttributes?.staircases}
            name="staircases"
            onChange={(e) => handleChange("staircases", +e.target.value)}
            errorMsg={errors.propertyDetails.commercialAttributes?.staircases}
          />

          <CustomInput
            label="No of passenger lifts"
            type="number"
            labelCls="label-text font-medium text-black "
            value={propertyDetails?.commercialAttributes?.passengerLifts}
            name="passengerLifts"
            onChange={(e) => handleChange("passengerLifts", +e.target.value)}
            errorMsg={
              errors.propertyDetails.commercialAttributes?.passengerLifts
            }
          />
        </div>
      </div>

      {(propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE ||
        propertyDetails?.propertyType ===
          CommercialPropertyTypeEnum.SHOW_ROOM) && (
        <div className="py-3">
          <p className="btn-txt text-[#5297ff] md:mb-4 mb-2 md:mt-4  mt-2 font-medium">
            Facilites
          </p>
          <div className="">
            <CommercialFacilites errors={errors} setErrors={setErrors} />
          </div>
        </div>
      )}
    </>
  );
};

export default CommercialPropertyDetails;
