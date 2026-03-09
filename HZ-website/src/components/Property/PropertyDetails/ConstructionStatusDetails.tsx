import React from "react";
import {
  ConstructionStatusOptions,
  ConstructionStatusEnum,
} from "./PropertyHelpers";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, { ConstructionStatus } from "@/store/postproperty";
import FloatingInput from "@/common/FormElements/FloatingInput";
import FloatingDatePicker from "@/common/FormElements/FloatingDateInput";
import { FaCalendarAlt } from "react-icons/fa";
import YearSelect from "@/common/YearSelect";
import CustomDate from "@/common/FormElements/CustomDate";

const ConstructionStatusDetails = ({ error }: any) => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.propertyDetails,
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails,
  );

  const handleChange = (key: keyof ConstructionStatus, value: any) => {
    const updatedPropertyDetails = {
      ...propertyDetails,
      constructionStatus: {
        ...propertyDetails?.constructionStatus,
        [key]: value,
      },
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <SelectBtnGrp
        options={ConstructionStatusOptions}
        label="Construction status"
        labelCls="md:text-[14px] text-[13px] font-medium text-black mb-1"
        className="gap-2 md:mb-2  mb-2 flex overflow-auto"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[16px] shadow-custom px-[16px] md:py-[8px] py-[8px] border-[1px] border-gray-200 text-nowrap "
        onSelectChange={(value) => handleChange("status", value)}
        slant={false}
        defaultValue={propertyDetails?.constructionStatus?.status}
        error={error.status}
      />
      {propertyDetails?.constructionStatus?.status ===
      ConstructionStatusEnum.UnderConstruction ? (
        <CustomDate
          label="Possession By"
          labelCls="md:text-[14px] text-[13px] text-black font-medium"
          name="possessionBy"
          className="py-0 "
          rootCls="max-w-[360px] w-full"
          value={propertyDetails?.constructionStatus?.possessionBy ?? ""}
          onChange={(e: any) => handleChange("possessionBy", e.target.value)}
          required
          rightIcon={<FaCalendarAlt />}
          errorMsg={error.possessionBy}
        />
      ) : (
        <div className="flex flex-row gap-3 items-center">
          <YearSelect
            label="Age of Property in Years"
            labelCls="md:text-[14px] text-[13px] text-black font-medium"
            className="py-1 "
            rootCls="max-w-[360px] w-full"
            isAgeSelect={true}
            type="number"
            value={propertyDetails?.constructionStatus?.ageOfProperty ?? ""}
            name="ageOfProperty"
            onChange={(value: any) => handleChange("ageOfProperty", value)}
            required
            errorMsg={error.ageOfProperty}
          />
          <YearSelect
            label="Possession years"
            className="px-2 md:py-1 py-0"
            labelCls="md:text-[14px] text-[13px] text-black font-medium mb-1"
            type="number"
            value={propertyDetails?.constructionStatus?.possessionYears || null}
            name="possessionYears"
            onChange={(value: any) => handleChange("possessionYears", value)}
            required
            errorMsg={error.possessionYears}
          />
        </div>
      )}
    </div>
  );
};

export default ConstructionStatusDetails;
