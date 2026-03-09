import React, { useState } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SearchComponent from "@/src/common/SearchSelect";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import Button from "@/src/common/Button";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import { cementBrands, centringMaterials, steelBrands } from "../../helper";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";

const Centring = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const centringData = customerOnboarding.servicesRequired.serviceDetails
    .centring || {
    steelBrand: "",
    cementBrand: "",
    centringMaterial: "",
    totalArea: null,
    additionalRequirement: "",
    isScaffoldingRequired: false,
  };

  const isEditing = Boolean(centringData?.id);

  const errors = serviceErrors["centring"] || {};
  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("centring", { [name]: value });
    clearFieldError(name);
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!centringData.steelBrand)
      newErrors.steelBrand = "Steel brand is required.";
    if (!centringData.cementBrand)
      newErrors.cementBrand = "Cement brand is required.";
    if (!centringData.centringMaterial)
      newErrors.centringMaterial = "Centring material is required.";
    if (!centringData.totalArea)
      newErrors.totalArea = "Total area is required.";

    updateServiceErrors("centring", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    } else {
      const payload = {
        steelBrand: centringData.steelBrand,
        centringMaterial: centringData.centringMaterial,
        additionalRequirement: centringData.additionalRequirement,
        cementBrand: centringData.cementBrand,
        isScaffoldingRequired: centringData.isScaffoldingRequired || false,
        totalArea: Number(centringData.totalArea),
      };
      try {
        if (isEditing) {
          const response = await apiClient.put(
            `${apiClient.URLS.centring}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status == 200) {
            toast.success("Centring service updated successfully");
            clearServiceErrors("centring");
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.centring}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status == 201) {
            toast.success("Centring service created successfully");
            updateServiceDetails("centring", response?.body);
            clearServiceErrors("centring");
          }
        }
      } catch (error) {
        console.log("error occured while posting centring", error);
        toast.error("Error occured while posting centring");
      }
    }
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("centring", updatedErrors);
    }
  };

  return (
    <div className="rounded-md shadow-custom  border md:px-10 px-3 md:py-8 py-2">
      <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Centring Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <SearchComponent
          label="Steel Brand"
          name="steelBrand"
          labelCls="text-black md:text-[14px] text-[12px] font-medium mb-3"
          placeholder="Select Steel Brand..."
          value={centringData.steelBrand}
          onChange={(value) => handleInputChange("steelBrand", value.value)}
          options={steelBrands}
          errorMsg={errors?.steelBrand}
          rootClassName="border-gray-300 max-w-[450px]"
          inputClassName="text-gray-500  py-[3px] placeholder:text-[12px]"
          dropdownCls="bg-gray-50 max-w-[450px]"
          showDeleteIcon={true}
        />

        <SearchComponent
          label="Cement Brand"
          name="cementBrand"
          labelCls="text-black  md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
          placeholder="Select Cement Brand..."
          value={centringData.cementBrand}
          onChange={(value) => handleInputChange("cementBrand", value.value)}
          options={cementBrands}
          errorMsg={errors?.cementBrand}
          rootClassName="border-gray-300 max-w-[450px]"
          inputClassName="text-gray-500  py-[3px] placeholder:text-[12px]"
          dropdownCls="bg-gray-50 max-w-[450px]"
          showDeleteIcon={true}
        />

        <SearchComponent
          label="Centring Material"
          name="centringMaterial"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
          placeholder="Select Centring Material..."
          value={centringData.centringMaterial}
          onChange={(value) =>
            handleInputChange("centringMaterial", value.value)
          }
          options={centringMaterials}
          errorMsg={errors?.centringMaterial}
          rootClassName="border-gray-300 max-w-[450px]"
          inputClassName="text-gray-500  py-[3px] placeholder:text-[12px]"
          dropdownCls="bg-gray-50 max-w-[450px]"
          showDeleteIcon={true}
        />

        <div className="max-w-[650px]">
          <CustomInput
            name="totalArea"
            type="number"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
            value={centringData.totalArea || ""}
            onChange={(e) => handleInputChange("totalArea", e.target.value)}
            className="py-[6px]"
            errorMsg={errors?.totalArea}
            label="Total Area to Cover (Sq.ft)"
            placeholder="Enter Total Area to Cover (Sq.ft)"
            required
          />
        </div>

        <div>
          <CustomInput
            name="additionalRequirement"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
            type="textarea"
            value={centringData.additionalRequirement || ""}
            onChange={(e) =>
              handleInputChange("additionalRequirement", e.target.value)
            }
            className="py-[10px] px-5 text-[14px]"
            label="Additional requirement of the customer (optional)"
          />
        </div>

        <CheckboxInput
          label="Is Scaffolding Required?"
          labelCls="text-black md:text-[14px] text-[12px] font-regular "
          name="isScaffoldingRequired"
          checked={centringData.isScaffoldingRequired}
          onChange={() =>
            handleInputChange(
              "isScaffoldingRequired",
              !centringData.isScaffoldingRequired
            )
          }
          className="w-5 h-5"
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

export default Centring;
