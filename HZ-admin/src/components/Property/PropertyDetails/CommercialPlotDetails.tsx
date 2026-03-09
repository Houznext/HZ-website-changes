import React, { useState } from "react";
import usePostPropertyStore, {
  CommercialAttributes,
} from "@/src/stores/postproperty";
import MultiCheckbox from "@/src/common/MultiCheckbox";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import {
  CommercialPlotOwnerShipTypeOptions,
  SuitableForOfficePlotOptions,
} from "./PropertyHelpers";
import { initialErrorState } from "../PropertyForm";

const CommercialPlotDetails = ({
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

  const handleChange = (key: keyof CommercialAttributes, value: any) => {
    setErrors(initialErrorState);
    const updatedPropertyDetails = {
      ...propertyDetails,
      commercialAttributes: {
        ...propertyDetails?.commercialAttributes,
        [key]: value,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  return (
    <>
      <MultiCheckbox
        label="Select what your property is suitable for"
        labelCls="label-text font-medium text-black "
        options={SuitableForOfficePlotOptions}
        selectedValues={propertyDetails?.commercialAttributes?.suitableFor}
        ClassName="md:h-5 h-3 md:w-5 w-3 "
        onChange={(selectedValues) =>
          handleChange("suitableFor", selectedValues)
        }
        error={errors.propertyDetails.commercialAttributes?.suitableFor}
      />

      <SelectBtnGrp
        options={CommercialPlotOwnerShipTypeOptions}
        label="Ownership Type"
        labelCls="label-text font-medium text-black "
        className="gap-2 mb-2 flex overflow-hidden"
        btnClass="md:text-[12px] text-[13px] font-medium text-gray-600 rounded-md md:px-[18px]  px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200 md:text-nowrap text-nowrap"
        onSelectChange={(value) => handleChange("ownership", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.ownership}
        error={errors.propertyDetails.commercialAttributes?.ownership}
      />
    </>
  );
};

export default CommercialPlotDetails;
