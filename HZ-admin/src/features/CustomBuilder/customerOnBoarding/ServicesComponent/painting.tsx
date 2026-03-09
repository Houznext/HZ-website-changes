import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomRadio from "@/src/common/FormElements/CustomRadio";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import React, { useState } from "react";
import { paintBrands, surfacePreparationOptions } from "../../helper";
import SearchComponent from "@/src/common/SearchSelect";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import { clear } from "console";
import Loader from "@/src/common/Loader";

const Painting = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const paintingData = customerOnboarding.servicesRequired.serviceDetails
    .painting || {
    typeOfWork: "",
    paintType: "",
    paintBrand: "",
    totalArea: null,
    numberOfCoats: null,
    surfacePreparation: [],
    roomCount: null,
    surfaceType: "",
    finishType: "",
    additionalRequirement: "",
  };

  const errors = serviceErrors["painting"] || {};
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(paintingData?.id);

  const handleSurfacePreparationChange = (selectedValues: string[]) => {
    updateServiceDetails("painting", { surfacePreparation: selectedValues });
    clearFieldError("surfacePreparation");
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("painting", updatedErrors);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("painting", { [name]: value });
    clearFieldError(name);
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!paintingData.typeOfWork)
      newErrors.typeOfWork = "Type of work is required.";
    if (!paintingData.surfacePreparation.length)
      newErrors.surfacePreparation = "Select at least one surface preparation.";
    if (!paintingData.paintType)
      newErrors.paintType = "Type of paint is required.";
    if (!paintingData.paintBrand)
      newErrors.paintBrand = "Paint brand is required.";
    if (!paintingData.totalArea)
      newErrors.totalArea = "Total area to paint is required.";
    if (!paintingData.numberOfCoats)
      newErrors.numberOfCoats = "Number of coats is required.";
    if (!paintingData.roomCount)
      newErrors.roomCount = "Number of rooms is required.";
    if (!paintingData.surfaceType)
      newErrors.surfaceType = "Surface type is required.";
    if (!paintingData.finishType)
      newErrors.finishType = "Finish type is required.";

    updateServiceErrors("painting", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!validateFields()) {
      return;
    } else {
      try {
        const payload = {
          typeOfWork: paintingData.typeOfWork,
          surfacePreparation: paintingData.surfacePreparation,
          paintType: paintingData.paintType,
          paintBrand: paintingData.paintBrand,
          totalArea: paintingData.totalArea,
          numberOfCoats: paintingData.numberOfCoats,
          roomCount: paintingData.roomCount,
          surfaceType: paintingData.surfaceType,
          finishType: paintingData.finishType,
          additionalRequirement: paintingData.additionalRequirement,
        };

        if (isEditing) {
          const response = await apiClient.put(
            `${apiClient.URLS.painting}/${custom_builder_id}`,
            { ...payload },true
          );
          if (response.status === 200) {
            toast.success("Painting service saved successfully");
            clearServiceErrors("painting");
            setIsLoading(false);
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.painting}/${custom_builder_id}`,
            { ...payload },true
          );
          if (response.status === 201) {
            toast.success("Painting service updated successfully");
            updateServiceDetails("interiorService", response.body);
            clearServiceErrors("painting");
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
        toast.error("Error occured while saving service details");
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
      <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Painting Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <CustomRadio
          label="Type of Painting Work"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          options={[
            { label: "New Painting", value: "new" },
            { label: "Repainting", value: "repainting" },
            { label: "Touch-up", value: "touchup" },
          ]}
          name="typeOfWork"
          value={paintingData.typeOfWork}
          onChange={(value) => handleInputChange("typeOfWork", value)}
          errorMsg={errors?.typeOfWork}
          required
        />

        <MultiCheckbox
          label="Surface Preparation"
          options={surfacePreparationOptions}
          selectedValues={paintingData.surfacePreparation}
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium my-3"
          ClassName="h-5 w-5"
          onChange={(value) => handleSurfacePreparationChange(value)}
        />

        <div className="flex md:flex-row flex-col md:gap-5 gap-2">
          <div className="w-full">
            <CustomInput
              name="paintType"
              type="text"
              className=" py-[3px]"
              value={paintingData.paintType || ""}
              onChange={(e) => handleInputChange("paintType", e.target.value)}
              label="Type of Paint (e.g., Emulsion, Distemper, Texture)"
              errorMsg={errors?.paintType}
              labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Paint Brand"
              name="paintBrand"
              placeholder="Select Paint Brand..."
              labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              value={paintingData.paintBrand}
              inputClassName="text-black  py-[3px] placeholder:text-[12px]"
              onChange={(value) => handleInputChange("paintBrand", value.value)}
              options={paintBrands}
              errorMsg={errors?.paintBrand}
              required
            />
          </div>
        </div>

        <div className="flex md:flex-row flex-col md:gap-5 gap-2 md:max-w-[1200px] ">
          <CustomInput
            name="totalArea"
            type="number"
            value={paintingData.totalArea || null}
            onChange={(e) => handleInputChange("totalArea", +e.target.value)}
            label="Total Area to Paint (Sq.ft)"
            className=" py-[3px]"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            required
            errorMsg={errors?.totalArea}
          />
          <CustomInput
            name="numberOfCoats"
            type="number"
            value={paintingData.numberOfCoats || ""}
            className=" py-[3px]"
            onChange={(e) =>
              handleInputChange("numberOfCoats", +e.target.value)
            }
            placeholder="Enter Number of Coats"
            label="Number of Coats"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            required
            errorMsg={errors?.numberOfCoats}
          />
        </div>

        <div className="flex md:flex-row flex-col md:gap-5 gap-2 md:max-w-[1200px]">
          <CustomInput
            name="roomCount"
            type="number"
            value={paintingData.roomCount || ""}
            onChange={(e) => handleInputChange("roomCount", +e.target.value)}
            label="Number of Rooms"
            className=" py-[3px]"
            placeholder="Enter Number of Rooms"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            required
            errorMsg={errors?.roomCount}
          />
          <CustomInput
            name="surfaceType"
            type="text"
            value={paintingData.surfaceType || ""}
            onChange={(e) => handleInputChange("surfaceType", e.target.value)}
            label="Surface Type (e.g., Ceiling, Doors, Windows)"
            placeholder="Enter Surface Type"
            className=" py-[3px]"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            required
            errorMsg={errors?.surfaceType}
          />
        </div>
        <CustomRadio
          label="Finish Type"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          options={[
            { label: "Matte", value: "matte" },
            { label: "Glossy", value: "glossy" },
            { label: "Satin", value: "satin" },
            { label: "Semi-Gloss", value: "semi-gloss" },
          ]}
          name="finishType"
          value={paintingData.finishType}
          onChange={(value) => handleInputChange("finishType", value)}
          errorMsg={errors?.finishType}
          required
        />
        <CustomInput
          name="additionalRequirement"
          type="text"
          value={paintingData.additionalRequirement || ""}
          onChange={(e) =>
            handleInputChange("additionalRequirement", e.target.value)
          }
          label="Additional Requirements (optional)"
          className=" py-[3px]"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
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

export default Painting;
