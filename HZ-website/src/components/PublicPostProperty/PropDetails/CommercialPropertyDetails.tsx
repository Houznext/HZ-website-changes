import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, {
  CommercialAttributes,
  SizeWithUnit,
} from "@/store/postproperty";
import React, { useState } from "react";
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
} from "../PropertyHelpers";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import CommercialFacilites from "./CommercialFacilites";
import MultiCheckbox from "@/common/MultiCheckbox";
import { useEffect } from "react";

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
    if (key === "totalFloors") {
      if (typeof value === "number" && value > 999) {
        // toast.error('TotalFloors cannot exceed 999')
        value = 999;
      }
    }

    const sizeDefault =
      key === "builtUpArea" || key === "entranceAreaWidth" || key === "entranceAreaHeight"        ? { size: 0, unit: "sq.ft" as const }
        : {};

    const updatedCommercialAttributes = {
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
    const prev: Partial<CommercialAttributes> =
      propertyDetails?.commercialAttributes ?? {};
    const updates: Partial<CommercialAttributes> = {};

    if (prev.currentFloor === undefined || prev.currentFloor === null) {
      updates.currentFloor = 1;
    }
    if (!prev.builtUpArea?.unit) {
      updates.builtUpArea = { ...(prev.builtUpArea ?? { size: 0 }), unit: "sq.ft" } as SizeWithUnit;
    }

    if (Object.keys(updates).length > 0) {
      const updatedPropertyDetails = {
        ...propertyDetails,
        commercialAttributes: { ...prev, ...updates },
      };
      setPropertyDetails({
        ...property,
        propertyDetails: updatedPropertyDetails,
      });
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
        labelCls="text-black md:text-[14px] text-[13px] font-medium mt-3 mb-1"
        onChange={(selectedValues) =>
          handleChange("suitableFor", selectedValues)
        }
        selectedValues={propertyDetails?.commercialAttributes?.suitableFor}
        required
      />

      <SelectBtnGrp
        options={
          propertyDetails?.propertyType === CommercialPropertyTypeEnum.OFFICE
            ? OfficeLocationHub
            : OtherLocationHub
        }
        label="Location hub"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mb-2 mt-1"
        className="gap-2 mb-4"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("locationHub", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.locationHub}
        error={error.locationHub}
        required
      />

      <SelectBtnGrp
        options={OwnershipType}
        label="Ownership Type"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
        className="gap-2 mb-4 flex flex-wrap"
        btnClass="md:text-[12px] text-[11px]  font-medium rounded-md md:px-[18px] px-[14px] md:py-[6px] py-[4px] shadow-custom  border-[1px] border-gray-200 text-nowrap"
        onSelectChange={(value) => handleChange("ownership", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.ownership}
        error={error.ownership}
        required
      />

      <CustomInput
        label="Built up Area"
        type="number"
        labelCls="md:text-[14px] text-[13px] font-medium text-black"
        className="px-2 "
        placeholder="Enter built up area"
        value={propertyDetails?.commercialAttributes?.builtUpArea?.size || ""}
        name="builtUpArea"
        onChange={(e) => handleChange("builtUpArea", +e.target.value, "size")}
        unitsDropdown={{
          value: propertyDetails?.commercialAttributes?.builtUpArea?.unit || "sq.ft",
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("builtUpArea", val, "unit"),
        }}
        errorMsg={error?.builtUpArea}
        required
      />

      <div>
        <p className="md:text-[16px]  text-[14px] font-medium mt-3 mb-1 text-[#3586FF]">
          Floor Details:
        </p>
        <div className="flex flex-row  items-center justify-start gap-3">
          <CustomInput
            type="number"
            label="Total Floors"
            placeholder="Enter total floors"
            required
            className="px-2 "
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            value={propertyDetails?.commercialAttributes?.totalFloors || ""}
            name="totalFloors"
            onChange={(e) => handleChange("totalFloors", +e.target.value)}
            errorMsg={error.totalFloors}
          />
          <SingleSelect
            label="Your floor"
            labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
            type="single-select"
            buttonCls=" px-[70px] max-md:px-[50px] md:py-[6px] py-[12px] border-b-[6px] border-gray-200 rounded-md mb-3"
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
            optionCls="text-[14px] hover:bg-[#3586FF] hober:text-white  font-regular text-black"
            selectedOption={
              typeof propertyDetails?.commercialAttributes?.currentFloor ===
                "number"
                ? propertyDetails.commercialAttributes.currentFloor === 0
                  ? { floor: "Ground", id: 0 }
                  : {
                    id: propertyDetails.commercialAttributes.currentFloor,
                    floor: `${propertyDetails.commercialAttributes.currentFloor
                      }${getFloorSuffix(
                        propertyDetails.commercialAttributes.currentFloor
                      )}`,
                  }
                : { floor: "1st", id: 1 }
            }
            optionsInterface={{ isObj: true, displayKey: "floor" }}
            errorMsg={error.currentFloor}
          />
        </div>
      </div>

      <div className="md:py-2 ">
        <p className="md:text-[16px]  text-[14px] mb-2 mt-2 font-medium text-[#3586FF]">
          Parking
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <CustomInput
            label="No of 2 wheelers parking ?"
            placeholder="Enter no of 2 wheelers parking "
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            className="px-2 "
            type="number"
            value={propertyDetails?.commercialAttributes?.twoWheelerParking || ""}
            name="twoWheelerParking"
            onChange={(e) => handleChange("twoWheelerParking", +e.target.value)}
            errorMsg={error.twoWheelerParking}
            required
          />

          <CustomInput
            label="No of 4 wheelers parking ?"
            placeholder="Enter no of 4 wheelers parking can accomodate"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            className="px-2 "
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
                value={propertyDetails?.commercialAttributes?.entranceAreaWidth?.size || ""}
                name="entranceAreaWidth"
                // onChange={(e) =>
                //   handleChange("entranceAreaWidth", +e.target.value)
                // }
                onChange={(e) => {
                  const size = Number(e.target.value);
                  handleChange(
                    "entranceAreaWidth",
                    isNaN(size) ? null : { size, unit: "sq.ft" }
                  );
                }}
                errorMsg={error.entranceAreaWidth}
                required
                labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
              />
              <CustomInput
                label="Entrance Height (in Sq.ft)"
                type="number"
                labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
                value={propertyDetails?.commercialAttributes?.entranceAreaHeight?.size || ''}
                name="entranceAreaHeight"
                // onChange={(e) =>
                //   handleChange("entranceAreaHeight", +e.target.value)
                // }
                onChange={(e) => {
                  const size = Number(e.target.value);
                  handleChange(
                    "entranceAreaHeight",
                    isNaN(size) ? null : { size, unit: "sq.ft" }
                  );
                }}
                errorMsg={error.entranceAreaHeight}
                required
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
            label="No of Stair cases"
            type="number"
            className="px-2 "
            placeholder="Enter no of stair cases"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            value={propertyDetails?.commercialAttributes?.staircases || ""}
            name="staircases"
            onChange={(e) => handleChange("staircases", +e.target.value)}
            errorMsg={error.staircases}
          />

          <CustomInput
            label="No of Passenger lifts"
            type="number"
            placeholder="Enter no of passenger lifts"
            labelCls="md:text-[14px] text-[13px] font-medium text-black"
            className="px-2 "
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
