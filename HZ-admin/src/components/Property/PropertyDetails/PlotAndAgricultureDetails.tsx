import FloatingDatePicker from "@/src/common/FloatingDateInput";
import FloatingInput from "@/src/common/FloatingInput";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import usePostPropertyStore, {
  PlotAttributes,
} from "@/src/stores/postproperty";
import React, { useState } from "react";
import {
  facingTypes,
  PlotAgriculturePosessionTypeEnum,
  PlotAgriculturePossessionStatus,
  propertyTypeEnum,
  transactionTypes,
} from "./PropertyHelpers";
import { FaCalendarAlt } from "react-icons/fa";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { initialErrorState } from "../PropertyForm";

const PlotAndAgricultureDetails = ({
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
  const [optional, setOptional] = useState(false);

  const property = usePostPropertyStore((state) => state.getProperty());

  const handleChange = (key: keyof PlotAttributes, value: any) => {
    setErrors = { initialErrorState };
    const updatedPropertyDetails = {
      ...propertyDetails,
      plotAttributes: {
        ...propertyDetails?.plotAttributes,
        [key]: value,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  const handleDateChange = (key: keyof PlotAttributes, date: Date | null) => {
    const updatedPropertyDetails = {
      ...propertyDetails,
      plotAttributes: {
        ...propertyDetails?.plotAttributes,
        [key]: date,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  return (
    <div>
      <FloatingInput
        label="Plot Area"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.plotAttributes?.plotArea}
        name="plotArea"
        onChange={(e) => handleChange("plotArea", +e.target.value)}
        required
        errorMsg={errors?.propertyDetails.plotAttributes?.plotArea}
      />

      <FloatingInput
        label="Length"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.plotAttributes?.length}
        name="length"
        onChange={(e) => handleChange("length", +e.target.value)}
        required
        errorMsg={errors?.propertyDetails.plotAttributes?.length}
      />

      <FloatingInput
        label="Width"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.plotAttributes?.width}
        name="width"
        onChange={(e) => handleChange("width", +e.target.value)}
        required
        errorMsg={errors?.propertyDetails.plotAttributes?.width}
      />

      <FloatingInput
        label="Width Facing Road"
        type="number"
        labelCls="label-text font-medium text-black "
        value={propertyDetails?.plotAttributes?.widthFacingRoad}
        name="widthFacingRoad"
        onChange={(e) => handleChange("widthFacingRoad", +e.target.value)}
        required
        errorMsg={errors?.propertyDetails.plotAttributes?.widthFacingRoad}
      />

      <SelectBtnGrp
        options={facingTypes}
        label="Facing"
        labelCls="label-text font-medium text-black "
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("facing", value)}
        slant={false}
        defaultValue={propertyDetails?.plotAttributes?.facing}
        error={errors?.propertyDetails.plotAttributes?.facing}
      />

      <SelectBtnGrp
        options={PlotAgriculturePossessionStatus}
        label="Possession Status"
        labelCls="label-text font-medium text-black "
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("possessionStatus", value)}
        slant={false}
        error={errors?.propertyDetails.plotAttributes?.possessionStatus}
      />

      {propertyDetails?.plotAttributes?.possessionStatus ===
        PlotAgriculturePosessionTypeEnum.InFuture && (
        <FloatingDatePicker
          selectedDate={propertyDetails?.plotAttributes?.possessionDate || null}
          onChange={(date: Date | null) =>
            handleDateChange("possessionDate", date)
          }
          label="Possession Date"
          labelCls="label-text font-medium text-black "
          labelouterCls="-left-6"
          outerInptCls="mb-5"
          rightIcon={<FaCalendarAlt />}
          errorMsg={errors?.propertyDetails.plotAttributes?.possessionDate}
        />
      )}

      <SelectBtnGrp
        options={transactionTypes}
        label="Trasaction Type"
        labelCls="label-text font-medium text-black "
        className="gap-2 mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium  rounded-md md:px-[18px] px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200"
        onSelectChange={(value) => handleChange("transactionType", value)}
        slant={false}
        error={errors?.propertyDetails.plotAttributes?.transactionType}
      />

      {optional ? (
        <div>
          <p
            className="text-[16px] font-medium text-[#3586FF]  cursor-pointer"
            onClick={() => setOptional(false)}
          >
            - Hide optional fields
          </p>

          <div>
            <SelectBtnGrp
              label="Does your property have a boundary wall?"
              options={["Yes", "No"]}
              btnClass="md:text-[12px] text-[13px] font-medium md:px-3 px-2 md:py-1 py-1"
              className="md:gap-2 gap-1"
              labelCls="label-text font-medium text-black "
              onSelectChange={(value) =>
                handleChange("boundaryWall", value === "Yes" ? true : false)
              }
            />
            {propertyDetails?.propertyType === propertyTypeEnum.Plot && (
              <CustomInput
                label="No of floors allowed for construction"
                labelCls="label-text font-medium text-black "
                type="number"
                value={propertyDetails?.plotAttributes?.noOfFloorsAllowed}
                name="noOfFloorsAllowed"
                onChange={(e) =>
                  handleChange("noOfFloorsAllowed", +e.target.value)
                }
              />
            )}
          </div>
        </div>
      ) : (
        <p
          className="text-[16px] font-medium text-[#3586FF]  cursor-pointer"
          onClick={() => setOptional(true)}
        >
          + Show optional fields
        </p>
      )}
    </div>
  );
};

export default PlotAndAgricultureDetails;
