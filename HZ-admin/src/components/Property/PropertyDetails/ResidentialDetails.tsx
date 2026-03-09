import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import usePostPropertyStore, {
  ResidentialAttributes,
  SizeWithUnit,
} from "@/src/stores/postproperty";
import { useEffect, useState } from "react";
import {
  BHK,
  bhkArray,
  facingTypes,
  LookingType,
  propertyTypeEnum,
} from "./PropertyHelpers";
import FloatingInput from "@/src/common/FloatingInput";
import ResidentialFurnishingDetails from "./ResidentialFurnishingDetails";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import CustomInput from "@/src/common/FormElements/CustomInput";

const ResidentialDetails = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails,
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails,
  );
  const basicDetails = usePostPropertyStore(
    (state) => state.getProperty().basicDetails,
  );

  const property = usePostPropertyStore((state) => state.getProperty());

  const handleChange = (
    key: keyof ResidentialAttributes,
    value: any,
    nestedKey?: keyof SizeWithUnit,
  ) => {
    const prevAttributes: Partial<ResidentialAttributes> =
      propertyDetails?.residentialAttributes ?? {};

    const updatedResidentialAttributes = {
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
    if (
      propertyDetails?.residentialAttributes?.currentFloor === undefined ||
      propertyDetails?.residentialAttributes?.currentFloor === null
    ) {
      handleChange("currentFloor", 1);
    }
  }, []);

  const filteredBhkArray =
    propertyDetails?.propertyType === propertyTypeEnum.Villa ||
    propertyDetails?.propertyType === propertyTypeEnum.IndependentHouse
      ? bhkArray.filter((b) => b !== BHK.RK)
      : bhkArray;
  return (
    <div>
      <SelectBtnGrp
        options={filteredBhkArray}
        label="No of BHK"
        labelCls="label-text font-medium text-black "
        className="gap-2 md:mb-1 mb-0 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[18px]  px-[14px] shadow-custom md:py-[8px] py-[6px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("bhk", value)}
        slant={false}
        defaultValue={propertyDetails?.residentialAttributes?.bhk}
        error={errors.propertyDetails.residentialAttributes?.bhk}
      />

      <SelectBtnGrp
        options={facingTypes}
        label="Facing"
        labelCls="label-text font-medium text-black "
        className="gap-2 md:mb-1 mb-0 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[18px]  px-[14px] shadow-custom md:py-[8px] py-[6px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("facing", value)}
        slant={false}
        defaultValue={propertyDetails?.residentialAttributes?.facing}
        error={errors.propertyDetails.residentialAttributes?.facing}
      />
      <div className="flex flex-col gap-4 max-w-[500px]">
        <CustomInput
          label="Floor Area"
          type="number"
          placeholder="Enter floor area"
          className="px-2 "
          labelCls="label-text font-medium text-black"
          value={
            propertyDetails?.residentialAttributes?.floorArea?.size || null
          }
          name="floorArea"
          onChange={(e) => handleChange("floorArea", +e.target.value, "size")}
          unitsDropdown={{
            value: propertyDetails?.residentialAttributes?.floorArea?.unit,
            options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
            onChange: (val: any) => handleChange("floorArea", val, "unit"),
          }}
          required
          errorMsg={errors?.floorArea}
        />

        <CustomInput
          label="Build up area"
          type="number"
          labelCls="label-text font-medium text-black"
          className="px-2"
          placeholder="Enter build up area"
          value={
            propertyDetails?.residentialAttributes?.buildupArea?.size || null
          }
          name="buildUpArea"
          onChange={(e) => handleChange("buildupArea", +e.target.value, "size")}
          required
          unitsDropdown={{
            value:
              propertyDetails?.residentialAttributes?.buildupArea?.unit || null,
            options: ["sq.ft", "sq.yard", "sq.meter", "acre", "cent", "marla"],
            onChange: (val: any) => handleChange("buildupArea", val, "unit"),
          }}
          errorMsg={errors?.buildUpArea}
        />

        <div className="flex flex-row md:gap-3 gap-2">
          <CustomInput
            label="No of bathrooms"
            placeholder="Enter no of bathrooms"
            type="number"
            labelCls="label-text font-medium text-black"
            className="px-2"
            value={propertyDetails?.residentialAttributes?.bathrooms || null}
            name="bathrooms"
            onChange={(e) => handleChange("bathrooms", +e.target.value)}
            required
            errorMsg={errors?.bathrooms}
          />

          <CustomInput
            label="No of balcony"
            placeholder="Enter no of Balcony's"
            type="number"
            labelCls="label-text font-medium text-black"
            className="px-2"
            value={propertyDetails?.residentialAttributes?.balcony || null}
            name="balcony"
            onChange={(e) => handleChange("balcony", +e.target.value)}
            required
            errorMsg={errors?.balcony}
          />
        </div>
      </div>

      <ResidentialFurnishingDetails errors={errors} setErrors={setErrors} />

      {basicDetails?.lookingType === LookingType.Sell ||
      basicDetails?.lookingType === LookingType.Rent ? (
        <>
          <div>
            <p className="sub-heading font-bold mt-5 mb-5 text-[#3586FF] ">
              Floor Details :
            </p>
            <div className="flex  flex-row md:items-start items-center md:justify-normal justify-between md:gap-2 gap-5">
            
              {propertyDetails?.propertyType &&
                [
                  propertyTypeEnum.Apartment,
                  propertyTypeEnum.IndependentFloor,
                  propertyTypeEnum.IndependentHouse,
                  propertyTypeEnum.Villa,
                ].includes(propertyDetails.propertyType as propertyTypeEnum) && (
                  <CustomInput
                    type="number"
                    label="Total Floors"
                    required
                    placeholder="Enter total floors"
                    labelCls="text-sm text-slate-700 font-medium"
                    value={propertyDetails?.residentialAttributes?.totalFloors || null}
                    name="totalFloors"
                    rootCls="max-w-[180px]"
                    className="px-3 py-2 rounded-lg border-slate-200 focus:border-[#3586FF] transition-colors"
                    onChange={(e) => handleChange("totalFloors", +e.target.value)}
                    errorMsg={errors?.totalFloors}
                  />
                )}
              {propertyDetails?.propertyType &&
                [
                  propertyTypeEnum.Apartment,
                  propertyTypeEnum.IndependentFloor,
                ].includes(propertyDetails.propertyType as propertyTypeEnum) && (
                  <SingleSelect
                    label="Your Floor"
                    labelCls="text-sm text-slate-700 font-medium mb-1"
                    type="single-select"
                    buttonCls="px-4 w-full py-2 border border-slate-200 rounded-lg"
                    name="currentFloor"
                    options={Array.from(
  {
    length: propertyDetails?.residentialAttributes?.totalFloors || 4,
  },
  (_, index) => {
    if (index === 0) {
      return { id: 0, floor: "Ground" };
    }

    const floorNum = index;
    return {
      id: floorNum,
      floor: `${floorNum}${getFloorSuffix(floorNum)}`,
    };
  }
)}

                    handleChange={(name, value) =>
                      handleChange(name as keyof ResidentialAttributes, value.id )
                    }
                    openButtonCls="bg-slate-50 text-slate-800"
                    optionCls="text-sm hover:bg-blue-50 text-slate-700"
                    rootCls="w-[150px]"
                    selectedOption={
                      propertyDetails?.residentialAttributes?.currentFloor === 0
                        ? { floor: "Ground", id: 1 }
                        : {
                            floor: `${propertyDetails?.residentialAttributes?.currentFloor || 0 + 1}th`,
                            id: propertyDetails?.residentialAttributes?.currentFloor || 0 + 1,
                          }
                    }
                    optionsInterface={{ isObj: true, displayKey: "floor" }}
                    errorMsg={errors?.yourFloor}
                  />
                )}
            </div>
           
          </div>

          <div className="py-3">
            <p className="btn-text mb-2 mt-2 font-medium text-[#5297FF]">
              Parking
            </p>
            <div className="">
              <SelectBtnGrp
                label="Is Two wheeler parking available?"
                options={["Yes", "No"]}
                btnClass="md:text-[12px] text-[13px] font-medium px-3 md:py-[6px] py-[6px]  rounded-md"
                labelCls="label-text font-medium text-black "
                onSelectChange={(value) =>
                  handleChange("parking2w", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.residentialAttributes?.parking2w
                    ? "Yes"
                    : "No"
                }
                error={errors.propertyDetails.residentialAttributes?.parking2w}
              />
              <SelectBtnGrp
                label="is Four wheeler parking available?"
                options={["Yes", "No"]}
                btnClass="md:text-[12px] text-[13px] font-medium px-3 md:py-[6px] py-[6px]  rounded-md"
                labelCls="label-text font-medium text-black "
                onSelectChange={(value) =>
                  handleChange("parking4w", value === "Yes" ? true : false)
                }
                className="flex gap-2"
                defaultValue={
                  propertyDetails?.residentialAttributes?.parking4w
                    ? "Yes"
                    : "No"
                }
                error={errors.propertyDetails.residentialAttributes?.parking4w}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ResidentialDetails;
