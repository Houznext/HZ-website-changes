import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomRadio from "@/src/common/FormElements/CustomRadio";
import SearchComponent from "@/src/common/SearchSelect";
import React, { useState } from "react";
import { casingOptions, pumpBrands } from "../../helper";
import { CautionIcon } from "../../Icons";
import Button from "@/src/common/Button";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import CustomCheckbox from "@/src/common/FormElements/CheckBoxInput";

const Borewells = () => {
  const [unit, setUnit] = useState("feet");
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const borewellsData = customerOnboarding.servicesRequired.serviceDetails
    .borewells || {
    recommendedDepth: null,
    borewellDiameter: null,
    hydroSurvey: false,
    casingType: "Steel",
    drillingType: "Percussion drilling",
    casingDepth: "",
    pumpBrand: "",
    additionalRequirement: "",
  };

  const isEditing = Boolean(borewellsData?.id);

  const errors = serviceErrors["borewells"] || {};
  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("borewells", { [name]: value });
    clearFieldError(name);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("borewells", updatedErrors);
    }
  };

  const handleCustomRadioChange = (name: string, value: string) => {
    updateServiceDetails("borewells", { [name]: value });
    clearFieldError(name);
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!borewellsData.recommendedDepth) {
      newErrors.recommendedDepth = "Recommended depth is required";
    }
    if (!borewellsData.borewellDiameter) {
      newErrors.borewellDiameter = "Borewell diameter is required";
    }
    if (!borewellsData.casingDepth.trim()) {
      newErrors.casingDepth = "Casing depth is required";
    }
    if (!borewellsData.pumpBrand.trim()) {
      newErrors.pumpBrand = "Pump brand is required";
    }
    updateServiceErrors("borewells", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      clearServiceErrors("borewells");
    }
    try {
      if (isEditing) {
        const payload = {
          recommendedDepth: borewellsData?.recommendedDepth,
          borewellDiameter:Number(borewellsData?.borewellDiameter)|| 0,
          hydroSurvey: borewellsData?.hydroSurvey || false,
          casingType: borewellsData?.casingType,
          drillingType: borewellsData?.drillingType,
          casingDepth: borewellsData?.casingDepth,
          pumpBrand: borewellsData?.pumpBrand,
          additionalRequirement: borewellsData?.additionalRequirement,
        };

        const response = await apiClient.put(
          `${apiClient.URLS.borewell}/${custom_builder_id}`,
          {
            ...payload,
          },true
        );
        if (response.status == 200) {
          toast.success("Borewells service updated successfully");
          clearServiceErrors("borewells");
        }
      } else {
        const payload = {
          recommendedDepth: borewellsData?.recommendedDepth,
          borewellDiameter: borewellsData?.borewellDiameter,
          hydroSurvey: borewellsData?.hydroSurvey || false,
          casingType: borewellsData?.casingType,
          drillingType: borewellsData?.drillingType,
          casingDepth: borewellsData?.casingDepth,
          pumpBrand: borewellsData?.pumpBrand,
          additionalRequirement: borewellsData?.additionalRequirement,
        };

        const response = await apiClient.post(
          `${apiClient.URLS.borewell}/${custom_builder_id}`,
          {
            ...payload,
          },true
        );
        if (response.status == 201) {
          toast.success("Borewells service created successfully");
          clearServiceErrors("borewells");
        }
      }
    } catch (error) {
      console.log("error occured while posting borewell ", error);
      toast.error("Error occured while posting borewell");
    }
  };

  return (
    <div className="rounded-md shadow-custom border md:px-10 px-3 md:py-8 py-2">
       <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Borewell Details :</p>
      <div className="flex md:flex-row flex-col md:gap-4  gap-1 items-center ">
        <CustomInput
          label="Recommended depth"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
          name="recommendedDepth"
          value={borewellsData.recommendedDepth}
          onChange={(e) =>
            handleInputChange("recommendedDepth", +e.target.value)
          }
          placeholder="Enter recommended depth"
          required
          unitsDropdown={{
            options: ["Sq.yards", "Sq.ft", "Acres"],
            value: unit,
            onChange: (value) => setUnit(value),
          }}
          errorMsg={errors.recommendedDepth}
          type="number"
          className="w-full  p-[3px]"
          rootCls="md:mb-4 mb-2 max-w-[420px]"
        />
        <CustomInput
          label="Diameter of the borewell"
          labelCls="text-[black] text-[14px] font-medium md:mb-3 mb-1"
          name="borewellDiameter"
          value={borewellsData.borewellDiameter}
          onChange={(e) =>
            handleInputChange("borewellDiameter", +e.target.value)
          }
          placeholder="Enter borewell diameter"
          required
          unitsDropdown={{
            options: ["Sq.yards", "Sq.ft", "Acres"],
            value: unit,
            onChange: (value) => setUnit(value),
          }}
          errorMsg={errors.borewellDiameter}
          type="number"
          className="w-full  p-[3px]"
          rootCls="md:mb-4 mb-2 max-w-[420px]"
        />
      </div>
      <div className="w-10 ">
        <CustomCheckbox
          label="Hydrogeological survey required"
          labelCls="text-[black] md:text-[14px] text-[12px] text-nowrap font-medium "
          name={"hydroSurvey"}
          checked={borewellsData.hydroSurvey}
          errorMsg={errors.hydroSurvey}
          onChange={() =>
            handleInputChange("hydroSurvey", !borewellsData.hydroSurvey)
          }
          className="!w-10 !h-10 "
        />
      </div>
      <div className=" flex md:flex-row flex-col md:mt-5 mt-2">
        <CustomRadio
          label="Type of casing"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium "
          options={[
            { label: "PVC", value: "PVC" },
            { label: "Steel", value: "Steel" },
          ]}
          errorMsg={errors.casingType}
          name="casingType"
          value={borewellsData.casingType}
          onChange={(value) => handleCustomRadioChange("casingType", value)}
          required
        />
        <CustomRadio
          label="Recommended drilling technology"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium "
          options={[
            { label: "Rotary drilling", value: "rotary" },
            { label: "Percussion drilling", value: "percussion" },
          ]}
          name="drillingType"
          value={borewellsData.drillingType}
          onChange={(value) => handleCustomRadioChange("drillingType", value)}
          required
        />
      </div>
      <div className="max-w-[420px] md:mt-5 mt-3">
        <SearchComponent
          label="Casing Depth"
          name="casingDepth"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-2"
          placeholder="Select casing depth..."
          value={borewellsData.casingDepth}
          inputClassName="py-[3px] placeholder:text-[12px] "
          errorMsg={errors.casingDepth}
          onChange={(value) =>
            handleCustomRadioChange("casingDepth", value.value)
          }
          rootClassName="bg-white border border-solid border-[#C7C2C2] rounded-[6px]" 
          options={casingOptions}
        />
      </div>
      <div className="max-w-[420px] md:mt-5 mt-3">
        <SearchComponent
          label="Pump Brand"
          name="pumpBrand"
          labelCls="text-[black] md:text-[14px] text-[12px] font-medium mb-2"
          placeholder="Select pump brand..."
          inputClassName=" py-[3px] placeholder:text-[12px]"
          value={borewellsData.pumpBrand}
          errorMsg={errors.pumpBrand}
          onChange={(value) =>
            handleCustomRadioChange("pumpBrand", value.value)
          }
          rootClassName="bg-white border border-solid border-[#C7C2C2] rounded-[6px]"
          options={pumpBrands}
        />
      </div>
      <div>
        <CustomInput
          label={"Additional requirement of the customer (optional)"}
          labelCls="md:mt-5 mt-3 text-[black] md:text-[14px] text-[12px] font-medium"
          type={"text"}
          name={"additionalRequirement"}
          value={borewellsData.additionalRequirement}
          className="md:py-2 py-1"
          onChange={(e) =>
            handleInputChange("additionalRequirement", e.target.value)
          }
          placeholder="Enter additional requirement of the customer"
          required={false}
          rootCls="md:mb-4 mb-2"
        />
      </div>
      <div className="flex justify-end">
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

export default Borewells;
