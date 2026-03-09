import React from "react";
import {
  LookingType,
  OwnerType,
  PurposeType,
} from "../PropertyDetails/PropertyHelpers";
import usePostPropertyStore, {
  propertyInitialState,
} from "@/src/stores/postproperty";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import { initialErrorState } from "../PropertyForm";
import CustomInput from "@/src/common/FormElements/CustomInput";

const BasicDetails = ({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const ownerType = Object.values(OwnerType);
  const lookingType = Object.values(LookingType);
  const purposeOptions = Object.values(PurposeType);

  const setBasicDetails = usePostPropertyStore(
    (state) => state.setBasicDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const currentStep = usePostPropertyStore((state) => state.currentStep);
  const basicDetails = usePostPropertyStore((state) => state.basicDetails);

  const handleInputChange = (key: string, value: any) => {
    setErrors(initialErrorState);
    if (
      (key === "purpose" && basicDetails?.purpose) ||
      (key === "lookingType" && basicDetails?.lookingType)
    ) {
      setProperty({
        ...propertyInitialState,
        basicDetails: {
          ...basicDetails,
          [key]: value,
        },
        propertyId: property.propertyId,
      });
      return;
    }

    const updatedBasicDetails = {
      ...basicDetails,
      [key]: value,
    };

    setBasicDetails({
      ...property,
      currentStep: currentStep,
      basicDetails: updatedBasicDetails,
    });
  };

  return (
    <div className="w-full max-w-[820px] md:space-y-3 space-y-2 p-2 md:p-4">
      <SelectBtnGrp
        label={"I am a property"}
        options={ownerType}
        labelCls="label-text text-gray-700"
        btnClass="btn-text rounded-lg px-5 py-1 shadow-sm border-gray-200 hover:border-[#3586FF] transition-all"
        className="flex flex-wrap gap-3"
        onSelectChange={(value) => handleInputChange("ownerType", value)}
        defaultValue={basicDetails?.ownerType}
        error={errors?.basicDetails?.ownerType}
      />

      <SelectBtnGrp
        label={"Purpose"}
        labelCls="label-text text-gray-700"
        options={purposeOptions}
        btnClass="btn-text rounded-lg px-5 py-1 shadow-sm border-gray-200 hover:border-[#3586FF] transition-all"
        className="flex flex-wrap gap-3"
        onSelectChange={(value) => handleInputChange("purpose", value)}
        defaultValue={basicDetails?.purpose}
        error={errors?.basicDetails?.purpose}
      />

      <SelectBtnGrp
        label={"Looking for"}
        labelCls="label-text text-gray-700"
        options={lookingType}
        btnClass="btn-text rounded-lg px-5 py-1 shadow-sm border-gray-200 hover:border-[#3586FF] transition-all whitespace-nowrap"
        className="flex flex-wrap gap-3"
        onSelectChange={(value) => handleInputChange("lookingType", value)}
        defaultValue={basicDetails?.lookingType}
        error={errors?.basicDetails?.lookingType}
      />

      <div className="pt-2">
        <CustomInput
          label={basicDetails?.phone ? "Phone Number" : "Email"}
          labelCls="label-text text-gray-700"
          className="px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all"
          rootCls="max-w-[420px]"
          placeholder="Enter your phone number or email"
          type={basicDetails?.phone ? "number" : "text"}
          value={basicDetails?.phone || basicDetails?.email || null}
          onChange={(e) =>
            handleInputChange(
              basicDetails?.phone ? "phone" : "email",
              e.target.value
            )
          }
          errorMsg={errors?.basicDetails?.phone || errors?.basicDetails?.email}
          name={"phone"}
        />
      </div>
    </div>
  );
};

export default BasicDetails;
