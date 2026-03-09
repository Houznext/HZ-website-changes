import SelectBtnGrp from "@/common/SelectBtnGrp";
import React, { useState } from "react";
import {
  CommercialPropertyTypeEnum,
  OfficeLocationHub,
  OtherLocationHub,
  OwnershipType,
  SuitableForOfficePlotOptions,
  SuitableForShowRoomAndShopOptions,
} from "./PropertyHelpers/index";
import CustomInput from "@/common/FormElements/CustomInput";
import FloatingInput from "@/common/FormElements/FloatingInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import CommercialFacilites from "./CommercialFacilites";
import MultiCheckbox from "@/common/MultiCheckbox";
import usePostPropertyStore, {
  CommercialAttributes,
  SizeWithUnit,
} from "@/store/postproperty";

const CommercialPropertyDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );

  const property = usePostPropertyStore((state) => state.getProperty());

  const [error, setError] = useState<{ [key: string]: string }>({});

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
        labelCls="text-black md:text-[14px] text-[13px] font-medium mt-3 mb-1"
        onChange={(selectedValues) =>
          handleChange("suitableFor", selectedValues)
        }
        selectedValues={propertyDetails?.commercialAttributes?.suitableFor}
      />

      <SelectBtnGrp
        options={
          propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE
            ? OfficeLocationHub
            : OtherLocationHub
        }
        label="Location hub"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mb-2 mt-1"
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("locationHub", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.locationHub}
        error={error.locationHub}
      />

      <SelectBtnGrp
        options={OwnershipType}
        label="Ownership Type"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mb-2 mt-1"
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("ownership", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.ownership}
        error={error.ownership}
      />

      <CustomInput
        label="Built up Area"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium text-black"
        className="px-2 "
        value={propertyDetails?.commercialAttributes?.builtUpArea?.size}
        name="builtUpArea"
        placeholder="Enter built up area"
        onChange={(e) => handleChange("builtUpArea", +e.target.value, "size")}
        unitsDropdown={{
          value: propertyDetails?.commercialAttributes?.builtUpArea?.unit || "sq.ft",
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("builtUpArea", val, "unit"),
        }}
        errorMsg={error.builtUpArea}
      />

      <div>
        <p className="btn-text font-medium mt-2 mb-1 text-[#3586FF]">
          Floor Details
        </p>
        <div className="flex flex-row  items-center justify-start gap-3">
          <div>
            <CustomInput
              type="number"
              label="Total Floors"
              className="px-2 md:py-[4px] py-1"
              labelCls="md:text-[14px] text-[13px] font-medium text-black"
              placeholder="Enter total floors"
              value={propertyDetails?.commercialAttributes?.totalFloors || ""}
              name="totalFloors"
              onChange={(e) => handleChange("totalFloors", +e.target.value)}
              errorMsg={error.totalFloors}
            />
          </div>
          <div>
            <SingleSelect
              label="Your floor"
              labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
              type="single-select"
              buttonCls=" px-[70px] max-md:px-[50px] md:py-[6px] py-[12px] border-b-[6px] border-gray-200 rounded-md mb-3"
              name="currentFloor"
              options={Array.from(
                {
                  length:
                    propertyDetails?.commercialAttributes?.totalFloors || 4,
                },
                (_, index) => ({
                  id: index + 1,
                  floor:
                    index === 0
                      ? "Ground"
                      : index === 1
                        ? "1st"
                        : `${index + 1}th`,
                })
              )}
              handleChange={(name, value) =>
                handleChange(name as keyof CommercialAttributes, value.id - 1)
              }
              openButtonCls="bg-gray-100 text-black"
              optionCls="text-[14px] hover:bg-[#3586FF] hober:text-white  font-regular text-black"
              selectedOption={
                propertyDetails?.commercialAttributes?.currentFloor === 0
                  ? { floor: "Ground", id: 1 }
                  : {
                    floor: `${propertyDetails?.commercialAttributes?.currentFloor ||
                      0 + 1
                      }th`,
                    id:
                      propertyDetails?.commercialAttributes?.currentFloor ||
                      0 + 1,
                  }
              }
              optionsInterface={{ isObj: true, displayKey: "floor" }}
              errorMsg={error.currentFloor}
            />
          </div>
        </div>
      </div>

      <div className="py-3">
        <p className="md:text-[16px]  text-[14px] mb-2 mt-2 font-medium text-[#3586FF]">
          Parking
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <CustomInput
            label="No of 2 wheelers parking can accomodate?"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            className="px-2 md:py-[4px] py-1"
            type="number"
            value={propertyDetails?.commercialAttributes?.twoWheelerParking || ""}
            name="twoWheelerParking"
            onChange={(e) => handleChange("twoWheelerParking", +e.target.value)}
            errorMsg={error.twoWheelerParking}
            required
          />

          <CustomInput
            label="No of 4 wheelers parking can accomodate?"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            className="px-2 md:py-[4px] py-1"
            type="number"
            value={propertyDetails?.commercialAttributes?.fourWheelerParking || ""}
            name="fourWheelerParking"
            onChange={(e) =>
              handleChange("fourWheelerParking", +e.target.value)
            }
            errorMsg={error.fourWheelerParking}
            required
          />
        </div>
      </div>

      {propertyDetails?.propertyType ===
        CommercialPropertyTypeEnum.SHOW_ROOM && (
          <div className="py-3">
            <p className="md:text-[16px] text-[14px] mb-2 mt-2 font-medium text-[#3586FF]">
              Entrance Area
            </p>
            <div className="">
              <CustomInput
                label="Entrance Width (in Sq.ft)"
                type="number"
                labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
                className="px-2 md:py-[6px] py-[4px]"
                value={
                  propertyDetails?.commercialAttributes?.entranceAreaWidth
                    ?.size || ""
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
                errorMsg={error.entranceAreaWidth}
              />
              <CustomInput
                label="Entrance Height (in Sq.ft)"
                labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
                type="number"
                className="px-2 md:py-[6px] py-[4px]"
                value={
                  propertyDetails?.commercialAttributes?.entranceAreaHeight
                    ?.size || ""
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
                  handleChange("entranceAreaHeight", +e.target.value, "size")
                }
                errorMsg={error.entranceAreaHeight}
              />
            </div>
          </div>
        )}

      <div className="py-2">
        <p className="md:text-[16px] text-[14px] mb-2 mt-2 font-medium text-[#3586FF]">
          Lifts and Stair cases
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <CustomInput
            label="No of stair cases"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            placeholder="No of stair cases"
            type="number"
            className="px-2 md:py-[4px] py-1"
            value={propertyDetails?.commercialAttributes?.staircases || ""}
            name="staircases"
            onChange={(e) => handleChange("staircases", +e.target.value)}
            errorMsg={error.staircases}
          />

          <CustomInput
            label="No of passenger lifts"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            placeholder="No of passenger lifts"
            type="number"
            className="px-2 md:py-[4px] py-1"
            value={propertyDetails?.commercialAttributes?.passengerLifts || ""}
            name="passengerLifts"
            onChange={(e) => handleChange("passengerLifts", +e.target.value)}
            errorMsg={error.passengerLifts}
          />
        </div>
      </div>

      {(propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE ||
        propertyDetails?.propertyType ===
        CommercialPropertyTypeEnum.SHOW_ROOM) && (
          <div className="py-3">
            <p className="md:text-[16px] text-[14px] mb-2 mt-2 font-medium text-[#3586FF]">
              Facilites
            </p>
            <div className="">
              <CommercialFacilites />
            </div>
          </div>
        )}
    </>
  );
};

export default CommercialPropertyDetails;
