import CustomRadio from "@/src/common/FormElements/CustomRadio";
import SearchComponent from "@/src/common/SearchSelect";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import React from "react";
import { fixtureBrands, pipeBrands, pipeMaterials } from "../../helper";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Button from "@/src/common/Button";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";

const Plumbing = () => {
  const {
    updateServiceDetails,
    customerOnboarding,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();
  const plumbingData = customerOnboarding.servicesRequired.serviceDetails
    .plumbing || {
    typeOfWork: "",
    pipeMaterial: "",
    pipeBrand: "",
    fixtureBrand: "",
    totalBathrooms: null,
    indianBathrooms: null,
    westernBathrooms: null,
    totalKitchens: null,
    waterSource: "",
    pipeThickness: null,
    additionalRequirement: "",
    isDrainageRequired: false,
  };

  const [isLoading, setIsLoading] = React.useState(false);
  const errors = serviceErrors["plumbing"] || {};

  const isEditing = Boolean(plumbingData?.id);

  const handleInputChange = (name: string, value: any) => {
    updateServiceDetails("plumbing", { [name]: value });
    clearFieldError(name);
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      updateServiceErrors("plumbing", updatedErrors);
    }
  };

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};

    if (!plumbingData.typeOfWork)
      newErrors.typeOfWork = "Type of plumbing work is required.";
    if (!plumbingData.pipeMaterial)
      newErrors.pipeMaterial = "Pipe material is required.";
    if (!plumbingData.pipeBrand)
      newErrors.pipeBrand = "Pipe brand is required.";
    if (!plumbingData.fixtureBrand)
      newErrors.fixtureBrand = "Fixture brand is required.";
    if (plumbingData.totalBathrooms === null || plumbingData.totalBathrooms < 0)
      newErrors.totalBathrooms = "Number of bathrooms is required.";
    if (plumbingData.totalKitchens === null || plumbingData.totalKitchens < 0)
      newErrors.totalKitchens = "Number of kitchens is required.";
    if (
      plumbingData.indianBathrooms === null ||
      plumbingData.indianBathrooms < 0
    )
      newErrors.indianBathrooms =
        "Number of Indian-style bathrooms is required.";
    if (
      plumbingData.westernBathrooms === null ||
      plumbingData.westernBathrooms < 0
    )
      newErrors.westernBathrooms =
        "Number of Western-style bathrooms is required.";
    if (!plumbingData.waterSource)
      newErrors.waterSource = "Water source is required.";

    updateServiceErrors("plumbing", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!validateFields()) {
      return;
    } else {
      try {
        const payload = {
          typeOfWork: plumbingData.typeOfWork,
          pipeMaterial: plumbingData.pipeMaterial,
          pipeBrand: plumbingData.pipeBrand,
          fixtureBrand: plumbingData.fixtureBrand,
          totalBathrooms: plumbingData.totalBathrooms,
          indianBathrooms: plumbingData.indianBathrooms,
          westernBathrooms: plumbingData.westernBathrooms,
          totalKitchens: plumbingData.totalKitchens,
          waterSource: plumbingData.waterSource,
          pipeThickness: plumbingData.pipeThickness,
          additionalRequirement: plumbingData.additionalRequirement || "",
          isDrainageRequired: plumbingData.isDrainageRequired || false,
        };

        if (isEditing) {
          const response = await apiClient.put(
            `${apiClient.URLS.plumbing}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 200) {
            clearServiceErrors("plumbing");
            setIsLoading(false);
            toast.success("Plumbing service updated successfully");
          }
        } else {
          const response = await apiClient.post(
            `${apiClient.URLS.plumbing}/${custom_builder_id}`,
            {
              ...payload,
            },true
          );
          if (response.status === 201) {
            clearServiceErrors("plumbing");
            updateServiceDetails("interiorService", response.body);
            setIsLoading(false);
            toast.success("Plumbing service created successfully");
          }
        }
      } catch (e) {
        console.log(e);
        setIsLoading(false);
        toast.error("Error occured while creating service type");
      }
    }
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="rounded-md shadow-custom  border md:px-10 px-3 md:py-8 py-2">
      <p className="text-[#5292ff] font-medium mb-4  md:text-[16px] text-[12px]">Plumbing Details :</p>
      <div className="flex flex-col md:gap-4 gap-2">
        <CustomRadio
          label="Type of Plumbing Work"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
          options={[
            { label: "New Installation", value: "new_installation" },
            { label: "Repairs", value: "repairs" },
            { label: "Replacement", value: "replacement" },
          ]}
          name="typeOfWork"
          value={plumbingData.typeOfWork}
          onChange={(value) => handleInputChange("typeOfWork", value)}
          required
        />
        <div className="flex md:flex-row flex-col md:gap-5 gap-3 md:mt-4 mt-2 md:max-w-[1200px]">
          <div className="w-full">
            <SearchComponent
              label="Pipe Material"
              labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              name="pipeMaterial"
              placeholder="Select Pipe Material..."
              value={plumbingData.pipeMaterial}
              onChange={(value) =>
                handleInputChange("pipeMaterial", value.value)
              }
              options={pipeMaterials}
              inputClassName="py-1"
              rootClassName="bg-white"
              required
              errorMsg={errors?.pipeMaterial}
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Pipe Brand"
              labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
              name="pipeBrand"
              placeholder="Select Pipe Brand..."
              value={plumbingData.pipeBrand}
              onChange={(value) => handleInputChange("pipeBrand", value.value)}
              options={pipeBrands}
              inputClassName=" py-1"
              required
              errorMsg={errors?.pipeBrand}
              rootClassName="bg-white"
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Fixture Brand (Taps, Faucets)"
              labelCls="text-[black] text-[14px] font-medium mb-3"
              name="fixtureBrand"
              placeholder="Select Fixture Brand..."
              value={plumbingData.fixtureBrand}
              onChange={(value) =>
                handleInputChange("fixtureBrand", value.value)
              }
              options={fixtureBrands}
              inputClassName=" py-1"
              required
              errorMsg={errors?.fixtureBrand}
              rootClassName="bg-white"
            />
          </div>
        </div>
        <div className="flex md:flex-row flex-col md:gap-5 gap-2 md:max-w-[1200px]">
          <CustomInput
            name="totalBathrooms"
            type="number"
            className="py-[6px]"
            value={plumbingData.totalBathrooms || ""}
            onChange={(e) =>
              handleInputChange("totalBathrooms", +e.target.value)
            }
            label="Number of Bathrooms"
            placeholder="Enter number of bathrooms"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            required
            errorMsg={errors?.totalBathrooms}
          />
          <CustomInput
            name="totalKitchens"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            type="number"
            value={plumbingData.totalKitchens || ""}
            className="md:py-[6px] py-[3px]"
            onChange={(e) =>
              handleInputChange("totalKitchens", +e.target.value)
            }
            label="Number of Kitchens"
            placeholder="Enter number of kitchens"
            required
            errorMsg={errors?.totalKitchens}
          />
        </div>
        <div className="flex md:flex-row flex-col md:gap-5 gap-2 md:max-w-[1200px]">
          <CustomInput
            name="indianBathrooms"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            type="number"
            className="md:py-[6px] py-[3px]"
            value={plumbingData.indianBathrooms || ""}
            onChange={(e) =>
              handleInputChange("indianBathrooms", +e.target.value)
            }
            placeholder="Enter number of Indian-style bathrooms"
            label="Number of Indian-style Bathrooms"
            required
            errorMsg={errors?.indianBathrooms}
          />
          <CustomInput
            name="westernBathrooms"
            labelCls="text-[black] md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
            type="number"
            className="md:py-[6px] py-[3px]"
            value={plumbingData.westernBathrooms || ""}
            onChange={(e) =>
              handleInputChange("westernBathrooms", +e.target.value)
            }
            placeholder="Enter number of Western-style bathrooms"
            label="Number of Western-style Bathrooms"
            required
            errorMsg={errors?.westernBathrooms}
          />
        </div>
        <div className="flex md:flex-row flex-col md:gap-5 gap-3 md:max-w-[1200px]">
          <CustomRadio
            label="Water Source"
            labelCls="md:text-[14px] text-[12px] font-medium"
            options={[
              { label: "Municipal Connection", value: "municipal" },
              { label: "Borewell", value: "borewell" },
              { label: "Overhead Tank", value: "tank" },
            ]}
            name="waterSource"
            value={plumbingData.waterSource}
            onChange={(value) => handleInputChange("waterSource", value)}
            required
          />
          <CustomInput
            name={"pipeThickness"}
            type={"number"}
            className="md:px-5 px-3  py-1"
            label="Pipe Thickness"
            value={plumbingData.pipeThickness || null}
            labelCls="md:text-[14px] text-[12px] font-medium"
            placeholder="Enter pipe thickness"
            onChange={(e) =>
              handleInputChange("pipeThickness", +e.target.value)
            }
            required
          />
        </div>
      </div>
      <div className="flex justify-end mt-4">
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
export default Plumbing;
