import React from "react";
import {
  ConstructionStatusOptions,
  ConstructionStatusEnum,
} from "../PropertyHelpers";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import usePostPropertyStore, { ConstructionStatus } from "@/store/postproperty";
import { useEffect } from "react";
import FloatingInput from "@/common/FormElements/FloatingInput";
import FloatingDatePicker from "@/common/FormElements/FloatingDateInput";
import { FaCalendarAlt } from "react-icons/fa";
import YearSelect from "@/common/YearSelect";
import CustomDate from "@/common/FormElements/CustomDate";

const ConstructionStatusDetails = () => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.propertyDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const { errors, setErrors } = usePostPropertyStore();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, []);

  const handleChange = (key: keyof ConstructionStatus, value: any) => {
    let updatedStatus = {
      ...propertyDetails?.constructionStatus,
      [key]: value,
    };

    if (key === "status") {
      if (value === ConstructionStatusEnum.UnderConstruction) {
        updatedStatus.ageOfProperty = null;
        updatedStatus.possessionYears = null;
      } else {
        updatedStatus.possessionBy = null;
      }
      const { possessionYears, ageOfProperty, possessionBy, ...rest } = errors;
      setErrors(rest);
    }

    const updatedPropertyDetails = {
      ...propertyDetails,
      constructionStatus: updatedStatus,
    };

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  return (
    <>
      <SelectBtnGrp
        options={ConstructionStatusOptions}
        label="Construction status"
        labelCls="label-text font-medium text-black mb-1"
        className="gap-2 mb-4 flex flex-wrap"
        btnClass="md:text-[12px] text-[13px] font-medium rounded-md md:px-[16px] shadow-custom px-[16px] md:py-[8px] py-[8px] border-[1px] border-gray-200 text-nowrap "
        onSelectChange={(value) => handleChange("status", value)}
        slant={false}
        defaultValue={propertyDetails?.constructionStatus?.status}
        error={errors?.status}
      />
      {propertyDetails?.constructionStatus?.status ===
      ConstructionStatusEnum.UnderConstruction ? (
        <CustomDate
          label="Possession By"
          labelCls=" font-medium label-text"
          name="possessionBy"
          className="py-0 label-text"
          rootCls="max-w-[360px] w-full"
          value={propertyDetails?.constructionStatus?.possessionBy || ""}
          onChange={(e) => handleChange("possessionBy", e.target.value)}
          required
          rightIcon={<FaCalendarAlt />}
          errorMsg={errors?.possessionBy}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 items-start">
          <YearSelect
            label="Age of Property in Years"
            className="px-2 md:py-1 py-0 w-full"
            labelCls="font-medium mb-1"
            value={propertyDetails?.constructionStatus?.ageOfProperty || null}
            name="ageOfProperty"
            onChange={(value: any) => handleChange("ageOfProperty", value)}
            required
            errorMsg={errors?.ageOfProperty}
            isAgeSelect
          />

          <YearSelect
            label="Possession years"
            className="px-2 md:py-1 py-0 w-full"
            labelCls="font-medium mb-1"
            value={propertyDetails?.constructionStatus?.possessionYears || null}
            name="possessionYears"
            onChange={(value: any) => handleChange("possessionYears", value)}
            required
            errorMsg={errors?.possessionYears}
            endYear={new Date().getFullYear() + 10}
          />
        </div>
      )}
    </>
  );
};

export default ConstructionStatusDetails;
