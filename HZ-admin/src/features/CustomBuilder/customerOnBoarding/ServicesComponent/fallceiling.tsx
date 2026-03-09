import CustomInput from "@/src/common/FormElements/CustomInput";
import SearchComponent from "@/src/common/SearchSelect";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import React from "react";
import {
  ceilingDesigns,
  ceilingMaterials,
  finishOptions,
  lightingOptions,
  roomTypes,
} from "../../helper";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import CustomRadio from "@/src/common/FormElements/CustomRadio";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";

const FallCeiling = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();

  const fallCeilingData = customerOnboarding.servicesRequired.serviceDetails
    .fallCeiling || {
    numberOfRooms: null,
    ceilingMaterial: "",
    ceilingDesign: "",
    lightingOptions: [],
    ceilingFinish: "",
    roomType: "",
    totalArea: null,
    additionalRequirement: "",
  };

  const errors = serviceErrors["fallCeiling"] || {};

  const isEditing = Boolean(fallCeilingData?.id);

  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("fallCeiling", { [name]: value });
    clearFieldError(name);
  };

  const handleMultiCheckboxChange = (name: string, values: string[]) => {
    updateServiceDetails("fallCeiling", { [name]: values });
    clearFieldError(name);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("electricity", updatedErrors);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fallCeilingData.numberOfRooms)
      newErrors.numberOfRooms = "Number of rooms is required.";
    if (!fallCeilingData.ceilingMaterial)
      newErrors.ceilingMaterial = "Ceiling material is required.";
    if (!fallCeilingData.ceilingDesign)
      newErrors.ceilingDesign = "Ceiling design is required.";
    if (!fallCeilingData.ceilingFinish)
      newErrors.ceilingFinish = "Ceiling finish is required.";
    if (!fallCeilingData.roomType)
      newErrors.roomType = "Room type is required.";
    if (!fallCeilingData.totalArea)
      newErrors.totalArea = "Total area is required.";

    updateServiceErrors("fallCeiling", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    } else {
      const payload = {
        numberOfRooms: fallCeilingData.numberOfRooms,
        ceilingMaterial: fallCeilingData.ceilingMaterial,
        ceilingDesign: fallCeilingData.ceilingDesign,
        lightingOptions: fallCeilingData.lightingOptions,
        ceilingFinish: fallCeilingData.ceilingFinish,
        roomType: fallCeilingData.roomType,
        totalArea: fallCeilingData.totalArea,
        additionalRequirement: fallCeilingData.additionalRequirement,
      };
      try {
        if (isEditing) {
          const response = await apiClient.put(
            `${apiClient.URLS.fall_ceiling}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 200) {
            toast.success("Fall ceiling service updated successfully");
            clearServiceErrors("fallCeiling");
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.fall_ceiling}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 201) {
            toast.success("Fall ceiling service saved successfully");
            updateServiceDetails("fallCeiling", response.body);
            clearServiceErrors("fallCeiling");
          }
        }
      } catch (error) {
        toast.error("Fail to save fall ceiling service");
        console.log("error occured while creating service type", error);
      }
    }
  };

  return (
    <div className="rounded-md shadow-custom  border md:px-10 px-3 md:py-8 py-2">
       <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Fall Ceiling Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <div className="flex md:flex-row flex-col md:gap-5 gap-3">
          <CustomInput
            name="numberOfRooms"
            type="number"
            value={fallCeilingData.numberOfRooms || null}
            onChange={(e) =>
              handleInputChange("numberOfRooms", +e.target.value)
            }
            label="Number of Rooms"
            className="py-[5px]"
            errorMsg={errors?.numberOfRooms}
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
          />
          <CustomInput
            name="totalArea"
            type="number"
            value={fallCeilingData.totalArea || null}
            onChange={(e) => handleInputChange("totalArea", +e.target.value)}
            label="Total Area to Cover (Sq.ft)"
            className="md:py-[5px] py-[3px]"
            errorMsg={errors?.totalArea}
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
          />
        </div>

        <div className="flex md:flex-row flex-col md:gap-5 gap-3">
          <div className="w-full">
            <SearchComponent
              label="Material for Fall Ceiling"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
              name="ceilingMaterial"
              inputClassName="md:py-[6px] py-[3px]"
              placeholder="Select Material..."
              value={fallCeilingData.ceilingMaterial}
              errorMsg={errors?.ceilingMaterial}
              onChange={(value) =>
                handleInputChange("ceilingMaterial", value.value)
              }
              options={ceilingMaterials}
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Fall Ceiling Design"
              name="ceilingDesign"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
              inputClassName="md:py-[6px] py-[3px]"
              placeholder="Select Design..."
              value={fallCeilingData.ceilingDesign}
              errorMsg={errors?.ceilingDesign}
              onChange={(value) =>
                handleInputChange("ceilingDesign", value.value)
              }
              options={ceilingDesigns}
            />
          </div>
        </div>

        <MultiCheckbox
          label="Lighting Preferences"
          options={lightingOptions}
          selectedValues={fallCeilingData.lightingOptions}
          labelCls="text-black md:text-[14px] text-[12px] font-medium my-2 md:mb-2 mb-1"
          ClassName="h-5 w-5"
          onChange={(values) =>
            handleMultiCheckboxChange("lightingOptions", values)
          }
        />

        <CustomRadio
          label="Ceiling Finish"
          labelCls="text-black md:text-[14px] text-[12px] font-medium my-2 md:mb-2 mb-1"
          options={finishOptions}
          name="ceilingFinish"
          value={fallCeilingData.ceilingFinish}
          errorMsg={errors?.ceilingFinish}
          onChange={(value) => handleInputChange("ceilingFinish", value)}
        />

        <div className="max-w-[520px]">
          <SearchComponent
            label="Room Type"
            name="roomType"
            labelCls="text-black md:text-[14px] text-[12px] font-medium my-2 md:mb-2 mb-1"
            inputClassName="md:py-[6px] py-[3px]"
            placeholder="Select Room Type..."
            value={fallCeilingData.roomType}
            errorMsg={errors?.roomType}
            onChange={(value) => handleInputChange("roomType", value.value)}
            options={roomTypes}
          />
        </div>

        <div className="flex flex-row gap-5">
          <CustomInput
            name="additionalRequirement"
            type="textarea"
            value={fallCeilingData.additionalRequirement || ""}
            onChange={(e) =>
              handleInputChange("additionalRequirement", e.target.value)
            }
            label="Additional Requirements (optional)"
            className="md:py-[10px] py-[5px] md:px-[10px] px-[5px] md:text-[14px] text-[12px]"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-2"
          />
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <Button
          onClick={handleSave}
          className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
        >
          Save Details
        </Button>
      </div>
    </div>
  );
};

export default FallCeiling;
