import React from "react";
import {
  ConstructionStatusOptions,
  ConstructionStatusEnum,
} from "./PropertyHelpers";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import usePostPropertyStore, {
  ConstructionStatus,
} from "@/src/stores/postproperty";
import FloatingInput from "@/src/common/FloatingInput";
import FloatingDatePicker from "@/src/common/FloatingDateInput";
import { FaCalendarAlt } from "react-icons/fa";
import { initialErrorState } from "../PropertyForm";
import CustomInput from "@/src/common/FormElements/CustomInput";
import YearSelect from "@/src/common/FormElements/YearSelect";
import CustomDate from "@/src/common/FormElements/CustomDate";

const ConstructionStatusDetails = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.propertyDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );

  const handleChange = (key: keyof ConstructionStatus, value: any) => {
    setErrors(initialErrorState);
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
    <>
      <div className="flex flex-col gap-3">
        <SelectBtnGrp
          options={ConstructionStatusOptions}
          label="Constuction status"
          labelCls="label-text font-medium text-black mb-2"
          className="gap-2 md:mb-2  mb-2 flex overflow-auto"
          btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[16px] shadow-custom px-[16px] md:py-[8px] py-[8px] border-[1px] border-gray-200 text-nowrap "
          onSelectChange={(value) => handleChange("status", value)}
          slant={false}
          defaultValue={propertyDetails?.constructionStatus?.status}
          error={errors.propertyDetails.constructionStatus?.status}
        />
        {propertyDetails?.constructionStatus?.status ===
        ConstructionStatusEnum.UnderConstruction ? (
          
          <CustomDate
          label="Possession By"
          labelCls="md:text-[14px] text-[13px] text-black font-medium"
          name="possessionBy"
          className="py-0 "
          rootCls="max-w-[360px] w-full"
          type="date"
          // value={propertyDetails?.constructionStatus?.possessionBy || ""}
          value={
  propertyDetails?.constructionStatus?.possessionBy
    ? new Date(
        propertyDetails.constructionStatus.possessionBy
      )
        .toISOString()
        .split("T")[0]
    : ""
}

          onChange={(e) => handleChange("possessionBy", e.target.value)}

          required
          rightIcon={<FaCalendarAlt />}
          errorMsg={errors.propertyDetails.constructionStatus?.possessionBy}
        />
        ) : (
          <div className="flex flex-col gap-2 max-w-[400px]">
            <YearSelect
              label="Age of Property in Years"
              labelCls=" label-text- text-black font-medium"
              className="py-1 "
              rootCls="max-w-[360px] w-full"
              type="number"
              value={propertyDetails?.constructionStatus?.ageOfProperty || null}
              name="ageOfProperty"
              onChange={(value: any) => handleChange("ageOfProperty", value)}
              required
              errorMsg={
                errors.propertyDetails.constructionStatus?.ageOfProperty
              }
            />
            <YearSelect
              label="Possession years"
              className="px-2 md:py-1 py-0"
              labelCls=" label-text- text-black font-medium"
              type="number"
              value={
                propertyDetails?.constructionStatus?.possessionYears || null
              }
              name="possessionYears"
              onChange={(value: any) => handleChange("possessionYears", value)}
              required
              errorMsg={
                errors.propertyDetails.constructionStatus?.possessionYears
              }
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ConstructionStatusDetails;
