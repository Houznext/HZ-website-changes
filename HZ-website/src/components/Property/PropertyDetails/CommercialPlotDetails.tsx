import React, { useState } from "react";
import usePostPropertyStore, {
  CommercialAttributes,
} from "@/store/postproperty";
import MultiCheckbox from "@/common/MultiCheckbox";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import {
  CommercialPlotOwnerShipTypeOptions,
  SuitableForOfficePlotOptions,
} from "./PropertyHelpers";

const CommercialPlotDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );

  const property = usePostPropertyStore((state) => state.getProperty());

  const [error, setError] = useState<{ [key: string]: string }>({});

  const handleChange = (key: keyof CommercialAttributes, value: any) => {
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
        labelCls="text-black md:text-[14px] text-[12px] font-medium mt-2 mb-3"
        options={SuitableForOfficePlotOptions}
        selectedValues={propertyDetails?.commercialAttributes?.suitableFor}
        ClassName="h-5 w-5 "
        onChange={(selectedValues) =>
          handleChange("suitableFor", selectedValues)
        }
      />

      <SelectBtnGrp
        options={CommercialPlotOwnerShipTypeOptions}
        label="Ownership Type"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mt-2 mb-3"
        className="gap-2 mb-2 flex overflow-hidden"
        btnClass="md:text-[12px] text-[13px] font-medium text-gray-600 rounded-md md:px-[18px]  px-[14px] shadow-custom md:py-[6px] py-[4px] border-[1px] border-gray-200 md:text-nowrap text-nowrap"
        onSelectChange={(value) => handleChange("ownership", value)}
        slant={false}
        defaultValue={propertyDetails?.commercialAttributes?.ownership}
        error={error.ownership}
      />
    </>
  );
};

export default CommercialPlotDetails;
