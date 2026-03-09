import React, { useEffect, useState } from "react";
import {
  LookingType,
  LookingTypeEnum,
  OwnerType,
  PurposeType,
} from "../PropertyDetails/PropertyHelpers";
import usePostPropertyStore, {
  propertyInitialState,
} from "@/store/postproperty";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import CustomInput from "@/common/FormElements/CustomInput";

const BasicDetails = () => {
  const ownerType = Object.values(OwnerType);
  const lookingType = Object.values(LookingType);
  const lookingTypeEnum = Object.values(LookingTypeEnum);
  const purposeOptions = Object.values(PurposeType);
  const [error, setError] = useState("");

  const setBasicDetails = usePostPropertyStore(
    (state) => state.setBasicDetails
  );
  const property = usePostPropertyStore((state) => state.getProperty());
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const currentStep = usePostPropertyStore((state) => state.currentStep);
  const basicDetails = usePostPropertyStore((state) => state.basicDetails);

  useEffect(() => {
    console.log(basicDetails);
  }, [basicDetails]);

  const handleInputChange = (key: string, value: any) => {
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
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Owner Type */}
        <div>
          <SelectBtnGrp
            options={ownerType}
            label="I am a Property"
            labelCls="text-sm text-slate-700 font-medium mb-2"
            btnClass="text-xs font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
            className="flex flex-wrap gap-2"
            onSelectChange={(value) => handleInputChange("ownerType", value)}
            defaultValue={basicDetails?.ownerType}
          />
        </div>

        {/* Purpose */}
        <div>
          <SelectBtnGrp
            options={purposeOptions}
            label="Purpose"
            labelCls="text-sm text-slate-700 font-medium mb-2"
            btnClass="text-xs font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
            className="flex flex-wrap gap-2"
            onSelectChange={(value) => handleInputChange("purpose", value)}
            defaultValue={basicDetails?.purpose}
          />
        </div>

        {/* Looking Type */}
        <div>
          <SelectBtnGrp
            options={basicDetails?.purpose === PurposeType.Residential ? lookingType : lookingTypeEnum}
            label="I am Looking to"
            labelCls="text-sm text-slate-700 font-medium mb-2"
            btnClass="text-xs font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors whitespace-nowrap"
            className="flex flex-wrap gap-2"
            onSelectChange={(value) => handleInputChange("lookingType", value)}
            defaultValue={basicDetails?.lookingType}
          />
        </div>

        {/* Contact Info */}
        <div>
          <CustomInput
            label={basicDetails?.phone ? "Phone Number" : "Email"}
            labelCls="text-sm text-slate-700 font-medium"
            className="md:px-3 px-2 rounded-lg border-slate-200 focus:border-[#3586FF] transition-colors"
            rootCls="max-w-[350px]"
            type={basicDetails?.phone ? "number" : "text"}
            required
            value={basicDetails?.phone || basicDetails?.email}
            onChange={(e) =>
              handleInputChange(
                basicDetails?.phone ? "phone" : "email",
                e.target.value
              )
            }
          />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default BasicDetails;
