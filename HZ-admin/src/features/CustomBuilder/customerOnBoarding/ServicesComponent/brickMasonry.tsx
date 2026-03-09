import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomRadio from "@/src/common/FormElements/CustomRadio";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import React, { useState } from "react";
import {
  brickTypes,
  cementBrands,
  plasteringOptions,
  railingMaterials,
} from "../../helper";
import SearchComponent from "@/src/common/SearchSelect";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";

const BrickMasonry = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const masonryData = customerOnboarding.servicesRequired.serviceDetails
    .brickMasonry || {
    typeOfWork: "",
    brickType: "",
    brickQuality: "",
    cementBrand: "",
    cementType: "",
    plasteringRequired: false,
    plasteringType: [],
    basementRequired: false,
    basementArea: null,
    basementHeight: null,
    railingMaterial: "",
    railingType: "",
    totalArea: null,
    structureType: "",
    elevationDetails: "",
    additionalRequirement: "",
  };
  const errors = serviceErrors["brickMasonry"] || {};

  const isEditing = Boolean(masonryData?.id);

  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("brickMasonry", { [name]: value });
    clearFieldError(name);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("brickMasonry", updatedErrors);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!masonryData.typeOfWork)
      newErrors.typeOfWork = "Type of work is required.";
    if (!masonryData.brickType) newErrors.brickType = "Brick type is required.";
    if (!masonryData.brickQuality)
      newErrors.brickQuality = "Brick quality is required.";
    if (!masonryData.cementBrand)
      newErrors.cementBrand = "Cement brand is required.";
    if (!masonryData.cementType)
      newErrors.cementType = "Cement type is required.";
    if (!masonryData.totalArea) newErrors.totalArea = "Total area is required.";
    if (!masonryData.structureType)
      newErrors.structureType = "Structure type is required.";
    if (!masonryData.elevationDetails)
      newErrors.elevationDetails = "Elevation details is required.";
    if (!masonryData.railingMaterial)
      newErrors.railingMaterial = "railingMaterial is required.";
    if (!masonryData.railingType)
      newErrors.railingType = "railingType is required.";

    if (masonryData.basementRequired) {
      if (!masonryData.basementArea)
        newErrors.basementArea = "Basement area is required.";
      if (!masonryData.basementHeight)
        newErrors.basementHeight = "Basement height is required.";
    }

    if (
      masonryData.plasteringRequired &&
      masonryData.plasteringType.length === 0
    ) {
      newErrors.plasteringType = "Select at least one plastering type.";
    }

    updateServiceErrors("brickMasonry", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log("errors", errors);
    if (!validateFields()) {
      return;
    } else {
      const payload = {
        typeOfWork: masonryData.typeOfWork,
        brickType: masonryData.brickType,
        brickQuality: masonryData.brickQuality,
        cementBrand: masonryData.cementBrand,
        cementType: masonryData.cementType,
        plasteringRequired: masonryData.plasteringRequired,
        plasteringType: masonryData.plasteringType,
        basementRequired: masonryData.basementRequired,
        basementArea: masonryData.basementArea,
        basementHeight: masonryData.basementHeight,
        railingMaterial: masonryData.railingMaterial,
        railingType: masonryData.railingType,
        totalArea: masonryData.totalArea,
        structureType: masonryData.structureType,
        elevationDetails: masonryData.elevationDetails,
        additionalRequirement: masonryData.additionalRequirement,
      };
      try {
        if (isEditing) {
          const response = await apiClient.patch(
            `${apiClient.URLS.brick_masonry}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 200) {
            toast.success("Brick masonry service updated successfully");
            clearFieldError("brickMasonry");
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.brick_masonry}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 201) {
            toast.success("Brick masonry service added successfully");
            updateServiceDetails("brickMasonry", response.body);
            clearFieldError("brickMasonry");
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    }
  };

  const handleMultiCheckboxChange = (name: string, values: string[]) => {
    updateServiceDetails("brickMasonry", { [name]: values });
  };
  return (
    <div className="rounded-md shadow-custom border md:px-10 px-3 md:py-8 py-2">
       <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Brick Masonry Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <CustomRadio
          label="Type of Masonry Work"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-2"
          options={[
            { label: "New Construction", value: "new_construction" },
            { label: "Repairs", value: "repairs" },
            { label: "Renovation", value: "renovation" },
          ]}
          name="typeOfWork"
          value={masonryData.typeOfWork}
          errorMsg={errors?.typeOfWork}
          onChange={(value) => handleInputChange("typeOfWork", value)}
        />

        <div className="flex md:flex-row flex-col md:w-[70%] md:gap-4 gap-2">
          <div className="w-full">
            <SearchComponent
              label="Brick Type"
              errorMsg={errors?.brickType}
              name="brickType"
              labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-3 "
              placeholder="Select Brick Type..."
              value={masonryData?.brickType}
              inputClassName="px-2 py-[3px]"
              onChange={(value) => handleInputChange("brickType", value.value)}
              options={brickTypes}
              required
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Cement Brand"
              name="cementBrand"
              labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-3 "
              placeholder="Select Cement Brand..."
              inputClassName="px-2 py-[3px]"
              value={masonryData?.cementBrand}
              errorMsg={errors?.cementBrand}
              onChange={(value) =>
                handleInputChange("cementBrand", value.value)
              }
              options={cementBrands}
              required
            />
          </div>
        </div>
        <div className="flex flex-col md:w-[80%] md:gap-4 gap-2">
          <CustomRadio
            label="Is Basement Required?"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-2"
            options={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
            name="basementRequired"
            value={masonryData?.basementRequired}
            onChange={(value) => handleInputChange("basementRequired", value)}
            errorMsg={errors?.basementRequired}
          />
          {masonryData.basementRequired && (
            <div className="flex md:flex-row flex-col md:gap-4 gap-2">
              <CustomInput
                name="basementArea"
                type="number"
                value={masonryData?.basementArea || null}
                className=" py-[3px]"
                labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
                onChange={(e) =>
                  handleInputChange("basementArea", +e.target.value)
                }
                label="Basement Area (Sq.ft)"
                errorMsg={errors?.basementArea}
              />
              <CustomInput
                name="basementHeight"
                type="number"
                value={masonryData?.basementHeight || null}
                className=" py-[3px]"
                labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
                onChange={(e) =>
                  handleInputChange("basementHeight", +e.target.value)
                }
                label="Basement Height (Ft)"
                errorMsg={errors?.basementHeight}
              />
            </div>
          )}
        </div>
        <div className="flex md:flex-row flex-col my-5">
          <CustomRadio
            label="Brick Quality"
            options={[
              { label: "First Class", value: "first_class" },
              { label: "Second Class", value: "second_class" },
            ]}
            name="brickQuality"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            value={masonryData.brickQuality}
            onChange={(value) => handleInputChange("brickQuality", value)}
            errorMsg={errors?.brickQuality}
          />
          <CustomRadio
            label="Type of Cement"
            options={[
              { label: "OPC (Ordinary Portland Cement)", value: "opc" },
              { label: "PPC (Portland Pozzolana Cement)", value: "ppc" },
            ]}
            name="cementType"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            value={masonryData.cementType}
            onChange={(value) => handleInputChange("cementType", value)}
            errorMsg={errors?.cementType}
          />
        </div>
        <div className="flex flex-col">
          <CustomRadio
            label="Is Plastering Required?"
            options={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
            errorMsg={errors?.plasteringRequired}
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            name="plasteringRequired"
            value={masonryData?.plasteringRequired}
            onChange={(value) => handleInputChange("plasteringRequired", value)}
          />
          <div className="md:mt-4 mt-2">
            {masonryData.plasteringRequired && (
              <MultiCheckbox
                label="Plastering Type"
                labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
                options={plasteringOptions}
                selectedValues={masonryData.plasteringType}
                onChange={(values) =>
                  handleMultiCheckboxChange("plasteringType", values)
                }
              />
            )}
          </div>
        </div>

        <div className="flex md:flex-row flex-col md:gap-5 gap-3 md:w-[80%] ">
          <CustomInput
            name="totalArea"
            type="number"
            value={masonryData.totalArea || null}
            onChange={(e) => handleInputChange("totalArea", +e.target.value)}
            label="Total Area (Sq.ft)"
            placeholder="Total Area (Sq.ft)"
            className=" py-[3px]"
            errorMsg={errors?.totalArea}
            required
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          />

          <CustomInput
            name="structureType"
            type="text"
            value={masonryData.structureType || ""}
            onChange={(e) => handleInputChange("structureType", e.target.value)}
            label="Structure Type (e.g., Walls, Compound Wall, Foundation)"
            placeholder="Structure Type"
            className=" py-[3px]"
            errorMsg={errors?.structureType}
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          />
        </div>
        <div className="flex md:flex-row flex-col md:w-[80%] md:gap-5 gap-2">
          <div className="w-full">
            <SearchComponent
              label="Railing Material"
              placeholder="Select Railing Material..."
              inputClassName=" py-[3px]"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              value={masonryData.railingMaterial}
              onChange={(value) =>
                handleInputChange("railingMaterial", value.value)
              }
              options={railingMaterials}
              required
              errorMsg={errors?.railingMaterial}
            />
          </div>
          <CustomInput
            name="railingType"
            type="text"
            placeholder="Select Railing Type..."
            className=" py-[3px]"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            value={masonryData.railingType || ""}
            onChange={(e) => handleInputChange("railingType", e.target.value)}
            required
            label="Railing Type (e.g., Balcony, Staircase)"
            errorMsg={errors?.railingType}
          />
        </div>

        <div className="flex flex-col md:gap-3 gap-2">
          <div>
            <CustomInput
              name="elevationDetails"
              label="Elevation Details"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              type="textarea"
              className="md:py-[10px] py-[5px] md:px-3 px-2 md:text-[14px] text-[12px]"
              placeholder="Enter the Elavtion Details"
              value={masonryData.elevationDetails || ""}
              onChange={(e) =>
                handleInputChange("elevationDetails", e.target.value)
              }
              errorMsg={errors?.elevationDetails}
            />
          </div>
          <div>
            <CustomInput
              name="additionalRequirement"
              labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              type="textarea"
              className="md:py-[10px] py-[5px] md:px-2 px-1 md:text-[14px] text-[12px]"
              value={masonryData.additionalRequirement || ""}
              onChange={(e) =>
                handleInputChange("additionalRequirement", e.target.value)
              }
              label="Additional Requirements (optional)"
              placeholder="Enter Additional Requirements (optional)"
            />
          </div>
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

export default BrickMasonry;
