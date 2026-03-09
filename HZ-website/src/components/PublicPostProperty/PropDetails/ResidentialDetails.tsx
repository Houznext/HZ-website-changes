import FloatingInput from "@/common/FormElements/FloatingInput";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, {
  ResidentialAttributes,
  SizeWithUnit,
} from "@/store/postproperty";
import React from "react";
import { bhkArray, propertyTypeEnum, BHK } from "../PropertyHelpers";
import {
  facingTypes,
  LookingType,
} from "@/components/Property/PropertyDetails/PropertyHelpers";
import SingleSelect from "@/common/FormElements/SingleSelect";
import ResidentialFurnishingDetails from "./ResidentialFurnishingDetails";
import CustomInput from "@/common/FormElements/CustomInput";
import toast from "react-hot-toast";
import { useEffect } from "react";

const ResidentialDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const basicDetails = usePostPropertyStore(
    (state) => state.getProperty().basicDetails
  );

  const property = usePostPropertyStore((state) => state.getProperty());
  const { errors } = usePostPropertyStore();

  const handleChange = (
    key: keyof ResidentialAttributes,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    const prevAttributes: Partial<ResidentialAttributes> =
      propertyDetails?.residentialAttributes ?? {};
    if (key === "totalFloors") {
      if (typeof value === "number" && value > 999) {
        // toast.error('TotalFloors cannot exceed 999')
        value = 999;
      }
    }
    if (key === "bathrooms") {
      if (typeof value === "number" && value > 999) {
        // toast.error("Number of bathrooms cannot exceed 999");
        value = 999;
      }
    }
    if (key === "balcony") {
      if (typeof value === "number" && value > 999) {
        // toast.error("Number of bathrooms cannot exceed 999");
        value = 999;
      }
    }

    const sizeDefault =
      key === "floorArea" || key === "buildupArea"
        ? { size: 0, unit: "sq.ft" as const }
        : {};

    const updatedResidentialAttributes = {
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
      residentialAttributes: updatedResidentialAttributes,
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
    const prev: Partial<ResidentialAttributes> =
      propertyDetails?.residentialAttributes ?? {};
    const updates: Partial<ResidentialAttributes> = {};

    const needsCurrentFloor =
      propertyDetails?.propertyType === propertyTypeEnum.Apartment ||
      propertyDetails?.propertyType === propertyTypeEnum.IndependentFloor;

    if (
      needsCurrentFloor &&
      (prev.currentFloor === undefined || prev.currentFloor === null)
    ) {
      updates.currentFloor = 1;
    }
    if (!prev.floorArea?.unit) {
      updates.floorArea = { ...(prev.floorArea ?? { size: 0 }), unit: "sq.ft" } as SizeWithUnit;
    }
    if (!prev.buildupArea?.unit) {
      updates.buildupArea = { ...(prev.buildupArea ?? { size: 0 }), unit: "sq.ft" } as SizeWithUnit;
    }

    if (Object.keys(updates).length > 0) {
      const updatedPropertyDetails = {
        ...propertyDetails,
        residentialAttributes: { ...prev, ...updates },
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
    <div className="flex flex-col gap-3">
      <SelectBtnGrp
        options={filteredBhkArray}
        label="No of BHK"
        labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
        className="gap-2 flex flex-wrap"
        btnClass="text-[12px] font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
        onSelectChange={(value) => handleChange("bhk", value)}
        slant={false}
        required
        defaultValue={propertyDetails?.residentialAttributes?.bhk}
        error={errors?.bhk}
      />

      <SelectBtnGrp
        options={facingTypes}
        label="Facing"
        labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
        className="gap-2 flex flex-wrap max-w-[500px]"
        btnClass="text-[12px] font-medium rounded-lg px-3 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
        onSelectChange={(value) => handleChange("facing", value)}
        slant={false}
        required
        defaultValue={propertyDetails?.residentialAttributes?.facing}
        error={errors?.facing}
      />

      <CustomInput
        label="Floor Area"
        type="number"
        className="text-sm"
        placeholder="Enter floor area"
        labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
        value={propertyDetails?.residentialAttributes?.floorArea?.size || ""}
        name="floorArea"
        rootCls="max-w-[350px]"
        onChange={(e) => handleChange("floorArea", +e.target.value, "size")}
        unitsDropdown={{
          value: propertyDetails?.residentialAttributes?.floorArea?.unit || "sq.ft",
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("floorArea", val, "unit"),
        }}
        required
        maxLength={8}
        errorMsg={errors?.floorArea}
      />

      <CustomInput
        label="Build Up Area"
        type="number"
        labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
        className="text-sm"
        placeholder="Enter build up area"
        rootCls="max-w-[350px]"
        value={propertyDetails?.residentialAttributes?.buildupArea?.size || ""}
        name="buildupArea"
        onChange={(e) => handleChange("buildupArea", +e.target.value, "size")}
        required
        unitsDropdown={{
          value: propertyDetails?.residentialAttributes?.buildupArea?.unit || "sq.ft",
          options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
          onChange: (val: any) => handleChange("buildupArea", val, "unit"),
        }}
        maxLength={8}
        errorMsg={errors?.buildUpArea}
      />

      <div className="grid grid-cols-2 gap-3 max-w-[350px]">
        <CustomInput
          label="No of Bathrooms"
          placeholder="Bathrooms"
          type="number"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
          className="text-sm"
          value={propertyDetails?.residentialAttributes?.bathrooms || ""}
          name="bathrooms"
          onChange={(e) => handleChange("bathrooms", +e.target.value)}
          required
          maxLength={2}
          errorMsg={errors?.bathrooms}
        />

        <CustomInput
          label="No of Balcony"
          placeholder="Balconies"
          type="number"
          labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
          className="text-sm"
          value={propertyDetails?.residentialAttributes?.balcony || ""}
          name="balcony"
          onChange={(e) => handleChange("balcony", +e.target.value)}
          required
          maxLength={2}
          errorMsg={errors?.balcony}
        />
      </div>
      <ResidentialFurnishingDetails />

      {basicDetails?.lookingType === LookingType.Sell ||
        basicDetails?.lookingType === LookingType.Rent ? (
        <>
          <div>
            <p className="text-[14px] md:text-[15px] font-semibold text-[#3586FF] mb-3 mt-2">
              Floor Details
            </p>
            <div className="flex flex-row items-start justify-start gap-3">
              <div>
                {propertyDetails?.propertyType &&
                  [
                    propertyTypeEnum.Apartment,
                    propertyTypeEnum.IndependentFloor,
                    propertyTypeEnum.IndependentHouse,
                    propertyTypeEnum.Villa,
                  ].includes(
                    propertyDetails.propertyType as propertyTypeEnum
                  ) && (
                    <CustomInput
                      type="number"
                      label="Total Floors"
                      required
                      labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium"
                      placeholder="Total floors"
                      className="text-sm"
                      rootCls="w-[140px]"
                      value={propertyDetails?.residentialAttributes?.totalFloors || ""}
                      name="totalFloors"
                      onChange={(e) =>
                        handleChange("totalFloors", +e.target.value)
                      }
                      errorMsg={errors?.totalFloors}
                    />
                  )}
              </div>
              <div>
                {propertyDetails?.propertyType &&
                  [
                    propertyTypeEnum.Apartment,
                    propertyTypeEnum.IndependentFloor,
                  ].includes(
                    propertyDetails.propertyType as propertyTypeEnum
                  ) && (
                    <SingleSelect
                      label="Your floor"
                      labelCls=" md:text-[14px] text-[13px] font-medium text-black mb-1"
                      type="single-select"
                      buttonCls=" px-[40px] w-full py-[10px] border-b-[6px] border-gray-200 rounded-md mb-3"
                      name="currentFloor"
                      options={Array.from(
                        {
                          length:
                            (propertyDetails?.residentialAttributes
                              ?.totalFloors ?? 4) + 1,
                        },
                        (_, index) => {
                          const floorLabel =
                            index === 0
                              ? "Ground"
                              : `${index}${getFloorSuffix(index)}`;
                          return {
                            id: index,
                            floor: floorLabel,
                          };
                        }
                      )}
                      rootCls="w-[160px]"
                      handleChange={(name, value) =>
                        handleChange(
                          name as keyof ResidentialAttributes,
                          value.id
                        )
                      }
                      openButtonCls="bg-gray-100 text-black"
                      optionCls="text-[14px] hover:bg-[#3586FF] hober:text-white  font-regular text-black"
                      selectedOption={
                        typeof propertyDetails?.residentialAttributes
                          ?.currentFloor === "number"
                          ? propertyDetails.residentialAttributes
                            .currentFloor === 0
                            ? { floor: "Ground", id: 0 }
                            : {
                              id: propertyDetails.residentialAttributes
                                .currentFloor,
                              floor: `${propertyDetails.residentialAttributes
                                  .currentFloor
                                }${getFloorSuffix(
                                  propertyDetails.residentialAttributes
                                    .currentFloor
                                )}`,
                            }
                          : { floor: "1st", id: 1 }
                      }
                      optionsInterface={{ isObj: true, displayKey: "floor" }}
                      errorMsg={errors?.yourFloor}
                    />
                  )}
              </div>
            </div>
          </div>

          <div className="py-1">
            <p className="text-[14px] md:text-[15px] font-semibold text-[#3586FF] mb-3 mt-2">
              Parking
            </p>
            <div className="space-y-3">
              <SelectBtnGrp
                label="Two wheeler parking available?"
                options={["Yes", "No"]}
                btnClass="text-[12px] font-medium px-4 py-2 rounded-lg border border-slate-200 hover:border-[#3586FF] transition-colors"
                labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
                onSelectChange={(value) =>
                  handleChange("parking2w", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.residentialAttributes?.parking2w
                    ? "Yes"
                    : "No"
                }
              />
              <SelectBtnGrp
                label="Four wheeler parking available?"
                options={["Yes", "No"]}
                btnClass="text-[12px] font-medium px-4 py-2 rounded-lg border border-slate-200 hover:border-[#3586FF] transition-colors"
                labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
                onSelectChange={(value) =>
                  handleChange("parking4w", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.residentialAttributes?.parking4w
                    ? "Yes"
                    : "No"
                }
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ResidentialDetails;
