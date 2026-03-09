import React, { useState } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SearchComponent from "@/src/common/SearchSelect";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import Button from "@/src/common/Button";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import {
  finishTypes,
  flooringMaterials,
  installationTypes,
} from "../../helper";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";

const Flooring = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();

  const flooringData = customerOnboarding.servicesRequired.serviceDetails
    .flooring || {
    flooringMaterial: "",
    totalArea: "",
    finishType: "",
    materialThickness: "",
    installationType: "",
    isSkirtingRequired: false,
    additionalRequirement: "",
  };

  const errors = serviceErrors["flooring"] || {};
  const [isLoading, setIsLoading] = useState(false);

  const isEditing =
    flooringData && "id" in flooringData ? Boolean(flooringData.id) : false;

  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("flooring", { [name]: value });
    clearFieldError(name);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("flooring", updatedErrors);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!flooringData.totalArea)
      newErrors.totalArea = "Total flooring area is required.";
    if (!flooringData.flooringMaterial)
      newErrors.flooringMaterial = "Flooring material is required.";
    if (!flooringData.finishType)
      newErrors.finishType = "Finish type is required.";
    if (!flooringData.materialThickness)
      newErrors.materialThickness = "Material thickness is required.";
    if (!flooringData.installationType)
      newErrors.installationType = "Installation type is required.";

    updateServiceErrors("flooring", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!validateFields()) {
      return;
    } else {
      const payload = {
        flooringMaterial: flooringData.flooringMaterial,
        totalArea: flooringData.totalArea,
        finishType: flooringData.finishType,
        materialThickness: flooringData.materialThickness,
        installationType: flooringData.installationType,
        isSkirtingRequired: flooringData.isSkirtingRequired || false,
        additionalRequirement: flooringData.additionalRequirement,
      };
      try {
        if (isEditing) {
          const response = await apiClient.put(
            `${apiClient.URLS.flooring}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 200) {
            toast.success("Flooring service updated successfully");
            clearServiceErrors("flooring");
            setIsLoading(false);
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.flooring}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 201) {
            toast.success("Flooring service saved successfully");
            updateServiceDetails("flooring", response.body);
            clearServiceErrors("flooring");
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.log("error occured while creating service type", error);
        toast.error("Error occured while creating service type");
        setIsLoading(false);
      }
    }
  };
  if (isLoading)
    return (
      <div>
        <Loader />
      </div>
    );
  return (
    <div className="rounded-md shadow-custom  border md:px-10 px-3 md:py-8 py-2">
      <div className="flex flex-col md:gap-4 gap-2">
        <CustomInput
          name="totalArea"
          type="number"
          value={flooringData.totalArea || null}
          onChange={(e) => handleInputChange("totalArea", +e.target.value)}
          className="md:py-[4px] py-[2px]"
          rootCls="max-w-[450px]"
          label="Total Flooring Area (Sq.ft)"
          placeholder="Enter Flooring Area"
          labelCls="text-black  md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          errorMsg={errors?.totalArea}
        />

        <div className="flex md:flex-row flex-col md:gap-5 gap-3 w-full md:max-w-[1100px]">
          <div className="w-full">
            <SearchComponent
              label="Finish Type"
              name="finishType"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              placeholder="Select Finish Type..."
              value={flooringData.finishType}
              onChange={(value) => handleInputChange("finishType", value.value)}
              options={finishTypes}
              rootClassName=" bg-white"
              inputClassName="text-gray-500  py-[3px] placeholder:text-[12px]"
              dropdownCls="bg-gray-50"
              showDeleteIcon={true}
              
              errorMsg={errors?.finishType}
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Flooring Material"
              name="flooringMaterial"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              placeholder="Select Flooring Material..."
              value={flooringData.flooringMaterial}
              onChange={(value) =>
                handleInputChange("flooringMaterial", value.value)
              }
              options={flooringMaterials}
              rootClassName=" bg-white"
              inputClassName="text-gray-500  py-[3px] placeholder:text-[12px]"
              dropdownCls="bg-gray-50"
              showDeleteIcon={true}
              errorMsg={errors?.flooringMaterial}
            />
          </div>
        </div>

        <CustomInput
          name="materialThickness"
          labelCls="text-black md:text-[14px] text-[12px] font-medium"
          type="number"
          rootCls="max-w-[450px]"
          value={flooringData.materialThickness || null}
          onChange={(e) =>
            handleInputChange("materialThickness", +e.target.value)
          }
          className=" py-[3px]"
          placeholder="Enter Material Thickness"
          label="Thickness of Material (mm)"
          errorMsg={errors?.materialThickness}
        />

        <SearchComponent
          label="Installation Type"
          name="installationType"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          placeholder="Select Installation Type..."
          value={flooringData.installationType}
          onChange={(value) =>
            handleInputChange("installationType", value.value)
          }
          options={installationTypes}
          rootClassName=" bg-white max-w-[450px]"
          inputClassName="text-gray-500  py-[3px] placeholder:text-[12px]"
          dropdownCls="bg-gray-50 max-w-[450px]"
          showDeleteIcon={true}
          errorMsg={errors?.installationType}
        />

        <CheckboxInput
          label="Is Skirting Required?"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium"
          name="isSkirtingRequired"
          checked={flooringData.isSkirtingRequired}
          onChange={() =>
            handleInputChange(
              "isSkirtingRequired",
              !flooringData.isSkirtingRequired
            )
          }
          className="w-5 h-5"
        />

        <CustomInput
          name="additionalRequirement"
          type="textarea"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          value={flooringData.additionalRequirement || ""}
          onChange={(e) =>
            handleInputChange("additionalRequirement", e.target.value)
          }
          className=" py-[3px] md:px-[10px] px-[5px]"
          label="Additional requirement of the customer (optional)"
          placeholder="Enter additional requirement of the customer (optional)"
        />
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

export default Flooring;
