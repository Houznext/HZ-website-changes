import SearchComponent from "@/src/common/SearchSelect";
import React, { useState } from "react";
import { houseConstructionDocuments } from "../../helper";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";

const DocumentDrafting = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const documentDraftingData = customerOnboarding.servicesRequired
    .serviceDetails.document_drafting || {
    documentType: "",
    additionalRequirement: "",
  };

  const isEditing = Boolean(documentDraftingData?.id);

  const errors = serviceErrors["document_drafting"] || {};

  const handleInputChange = (name: string, value: string) => {
    updateServiceDetails("document_drafting", { [name]: value });
  };
  const handleSearchChange = (value: string) => {
    updateServiceDetails("document_drafting", { documentType: value });
    clearFieldError("documentType");
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("document_drafting", updatedErrors);
    }
  };
  const validateFields = () => {
    const newErrors: { documentType?: string } = {};
    if (!documentDraftingData.documentType.trim()) {
      newErrors.documentType = "Combination Types is required";
    }
    updateServiceErrors("document_drafting", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }

    try {
      if (isEditing) {
        const payload = {
          combinationTypes: documentDraftingData.documentType,
          additionalRequirement: documentDraftingData.additionalRequirement,
        };
        const response = await apiClient.put(
          `${apiClient.URLS.document_drafting}/${custom_builder_id}`,
          { ...payload },true
        );
        if (response.status == 200) {
          toast.success("Document drafting updated successfully");
          clearServiceErrors("document_drafting");
        }
      } else {
        const payload = {
          combinationTypes: documentDraftingData.documentType,
          additionalRequirement: documentDraftingData.additionalRequirement,
        };
        const response = await apiClient.post(
          `${apiClient.URLS.document_drafting}/${custom_builder_id}`,
          { ...payload },true
        );
        if (response.status == 201) {
          toast.success("Document drafting created successfully");
          updateServiceDetails("document_drafting", response.body);
          clearServiceErrors("document_drafting");
        }
      }
    } catch (error) {
      console.log("error occured while creating service type", error);
      toast.error("Error occured while creating service type");
    }
  };
  return (
    <div className="rounded-md shadow-custom  border md:px-10 px-3 md:py-8 py-2">
       <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Document Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <SearchComponent
          label="Document Types"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          placeholder="Search No. of portions..."
          name="documentType"
          value={documentDraftingData.documentType}
          onChange={(val: { label: string; value: any }) =>
            handleInputChange("documentType", val.value)
          }
          onReset={() => handleSearchChange("")}
          options={houseConstructionDocuments}
          errorMsg={errors.documentType}
          required
          rootClassName="bg-white max-w-[450px] "
          inputClassName="text-gray-500  py-[3px] placeholder:text-[12px] "
          dropdownCls="bg-gray-50 max-w-[450px] "
          iconClassName="text-red-500"
          showDeleteIcon={true}
        />
        <CustomInput
          name={"additionalRequirement"}
          type={"textarea"}
          value={documentDraftingData?.additionalRequirement}
          onChange={(e) =>
            handleInputChange("additionalRequirement", e.target.value)
          }
          placeholder="Enter additional requirement of the customer (optional)"
          className="md:py-[8px] py-[4px] md:px-3 px-2 md:text-[14px] text-[12px] bg-white"
          label={"Additional requirement of the customer (optional)"}
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-3"
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
export default DocumentDrafting;
