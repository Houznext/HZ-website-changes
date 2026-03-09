import React, { useState } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SearchComponent from "@/src/common/SearchSelect";
import CustomRadio from "@/src/common/FormElements/CustomRadio";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import { safetyOptions, switchBrands, wireBrands } from "../../helper";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";

const ElectricCityLines = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const electricCityData = customerOnboarding.servicesRequired.serviceDetails
    .electricity || {
    typeOfWork: "",
    wiringType: "",
    wireBrand: "",
    switchBrand: "",
    totalPowerPoints: null,
    totalLights: null,
    totalFans: null,
    safetyEquipment: [],
    additionalRequirement: "",
  };
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(electricCityData?.id);

  const errors = serviceErrors["electricity"] || {};
  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("electricity", { [name]: value });
    clearFieldError(name);
  };

  const handleSafetyEquipmentChange = (selectedValues: string[]) => {
    updateServiceDetails("electricity", { safetyEquipment: selectedValues });
    clearFieldError("safetyEquipment");
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

    if (!electricCityData.typeOfWork)
      newErrors.typeOfWork = "Type of work is required.";
    if (!electricCityData.wiringType)
      newErrors.wiringType = "Wiring type is required.";
    if (!electricCityData.wireBrand)
      newErrors.wireBrand = "Wire brand is required.";
    if (!electricCityData.switchBrand)
      newErrors.switchBrand = "Switch brand is required.";
    if (!electricCityData.totalPowerPoints)
      newErrors.totalPowerPoints = "Power points count is required.";
    if (!electricCityData.totalLights)
      newErrors.totalLights = "Total lights count is required.";
    if (!electricCityData.totalFans)
      newErrors.totalFans = "Total ceiling fans count is required.";
    if (electricCityData.safetyEquipment.length === 0) {
      newErrors.safetyEquipment = "Select at least one safety equipment.";
    }

    updateServiceErrors("electricity", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!validateFields()) {
      return;
    } else {
      const payload = {
        typeOfWork: electricCityData.typeOfWork,
        wiringType: electricCityData.wiringType,
        wireBrand: electricCityData.wireBrand,
        switchBrand: electricCityData.switchBrand,
        totalPowerPoints: electricCityData.totalPowerPoints,
        totalLights: electricCityData.totalLights,
        totalFans: electricCityData.totalFans,
        safetyEquipment: electricCityData.safetyEquipment,
        additionalRequirement: electricCityData.additionalRequirement,
      };
      try {
        if (isEditing) {
          const response = await apiClient.put(
            `${apiClient.URLS.electricity}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 200) {
            setIsLoading(false);
            toast.success("Electricity service updated successfully");
            clearServiceErrors("electricity");
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.electricity}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 201) {
            setIsLoading(false);
            toast.success("Electricity service created successfully");
            clearServiceErrors("electricity");
            updateServiceDetails("electricity", response.body);
          }
        }
      } catch (error) {
        console.log("error", error);
        toast.error("Error occured while creating service type");
        setIsLoading(false);
      }
    }
  };
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="rounded-md shadow-custom border md:px-10 px-3 md:py-8 py-2">
       <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Electricity Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <CustomRadio
          label="Type of Electrical Work"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          options={[
            { label: "New Installation", value: "new_installation" },
            { label: "Repairs", value: "repairs" },
            { label: "Replacement", value: "replacement" },
            { label: "Wiring Upgrades", value: "wiring_upgrades" },
          ]}
          rootCls="md:mb-4 mb-2"
          name="typeOfWork"
          value={electricCityData.typeOfWork}
          errorMsg={errors?.typeOfWork}
          onChange={(value) => handleInputChange("typeOfWork", value)}
        />

        <CustomRadio
          label="Electrical Wiring Type"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          options={[
            { label: "Concealed Wiring", value: "concealed" },
            { label: "Surface Wiring", value: "surface" },
          ]}
          name="wiringType"
          value={electricCityData?.wiringType}
          errorMsg={errors?.wiringType}
          onChange={(value) => handleInputChange("wiringType", value)}
        />

        <div className="flex md:flex-row flex-col md:gap-5 gap-2 mt-5">
          <div className="w-full">
            <SearchComponent
              label="Preferred Wire Brand"
              labelCls="md:text-[14px] text-[12px]  font-medium md:mb-2 mb-1"
              name="wireBrand"
              inputClassName="md:py-[6px] py-[3px]"
              placeholder="Select Wire Brand..."
              value={electricCityData?.wireBrand}
              onChange={(value) => handleInputChange("wireBrand", value.value)}
              options={wireBrands}
              errorMsg={errors?.wireBrand}
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Preferred Switch Brand"
              labelCls="md:text-[14px] text-[12px]  font-medium md:mb-2 mb-1"
              name="switchBrand"
              inputClassName="md:py-[6px] py-[3px]"
              placeholder="Select Switch Brand..."
              value={electricCityData?.switchBrand}
              onChange={(value) =>
                handleInputChange("switchBrand", value.value)
              }
              options={switchBrands}
              errorMsg={errors?.switchBrand}
            />
          </div>
        </div>

        <div className="flex md:flex-row flex-col md:gap-4 gap-2 mt-5">
          <CustomInput
            name="totalPowerPoints"
            type="number"
            labelCls="md:text-[14px] text-[12px]  font-medium md:mb-2 mb-1"
            value={electricCityData.totalPowerPoints || null}
            onChange={(e) =>
              handleInputChange("totalPowerPoints", +e.target.value)
            }
            label="Number of Power Points"
            className="md:py-1 py-[3px]"
            errorMsg={errors?.totalPowerPoints}
          />
          <CustomInput
            name="totalLights"
            type="number"
            labelCls="md:text-[14px] text-[12px]  font-medium md:mb-2 mb-1"
            value={electricCityData.totalLights || null}
            onChange={(e) => handleInputChange("totalLights", +e.target.value)}
            label="Number of Lights"
            className="md:py-1 py-[3px]"
            errorMsg={errors?.totalLights}
          />
          <CustomInput
            name="totalFans"
            type="number"
            labelCls="md:text-[14px] text-[12px]  font-medium md:mb-2 mb-1"
            value={electricCityData.totalFans || null}
            onChange={(e) => handleInputChange("totalFans", +e.target.value)}
            label="Number of Ceiling Fans"
            className="md:py-1 py-[3px]"
            errorMsg={errors?.totalFans}
          />
        </div>
        <MultiCheckbox
          label="Safety Equipment"
          options={safetyOptions}
          selectedValues={electricCityData.safetyEquipment}
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium my-3"
          ClassName="h-5 w-5"
          onChange={(value) => handleSafetyEquipmentChange(value)}
        />

        <CustomInput
          name="additionalRequirement"
          type="text"
          className="md:py-[6px] py-[3px]"
          labelCls="md:text-[14px] text-[12px]  font-medium md:mb-2 mb-1"
          value={electricCityData.additionalRequirement || ""}
          onChange={(e) =>
            handleInputChange("additionalRequirement", e.target.value)
          }
          label="Additional Requirements (optional)"
        />
      </div>
      <div className="flex justify-end mt-3">
        <Button
          onClick={handleSave}
          className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[16px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
        >
          Save Details
        </Button>
      </div>
    </div>
  );
};

export default ElectricCityLines;
