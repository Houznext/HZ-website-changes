import React, { useState } from "react";
import { CautionIcon } from "../../Icons";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomRadio from "@/src/common/FormElements/CustomRadio";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";
import SearchComponent from "@/src/common/SearchSelect";
import Button from "@/src/common/Button";
import useCustomBuilderStore, {
  RoomFeature,
} from "@/src/stores/custom-builder";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import CustomCheckbox from "@/src/common/FormElements/CheckBoxInput";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import {
  bhkArray,
  roomTypes,
} from "@/src/components/Property/PropertyDetails/PropertyHelpers";
import { PlywoodTypes } from "../../helper";
import { MdDelete, MdEdit } from "react-icons/md";
import Modal from "@/src/common/Modal";

const materialPreferenceOptions = [
  { label: "Bamboo", value: "Bamboo" },
  { label: "Vegan Leather", value: "Vegan Leather" },
  { label: "Recycled Wood", value: "Recycled Wood" },
  { label: "Marble", value: "Marble" },
];

const Interior: React.FC = () => {
  const {
    customerOnboarding,
    updateServiceDetails,
    serviceErrors,
    updateServiceErrors,
    clearServiceErrors,
    custom_builder_id,
  } = useCustomBuilderStore();

  // Grab existing interiorService data from the store
  const interiorData = customerOnboarding.servicesRequired.serviceDetails
    .interiorService || {
    id: undefined,
    modularKitchen: false,
    wardrobes: false,
    cabinetry: "",
    furnitureDesign: "",
    wallPaneling: false,
    decorStyle: "",
    soundProofing: false,
    smartHomeFeatures: false,
    storageSolutions: "",
    additionalRequirements: "",
    furnitureLayout: false,
    ecoFriendlyMaterials: false,
    childPetFriendly: false,
    materialPreferences: [],
    bhkType: "",
    rooms: {},
    plywood: "",
    featureBreakDown: [],
  };
  if (!interiorData.rooms) {
    interiorData.rooms = {
      livingRoom: 1,
      kitchen: 1,
      bedroom: 1,
      bathroom: 1,
      dining: 0,
    };
  }
  const [OpenModal, setOpenModal] = useState(false);
  // const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<
    number | null
  >(null);
  const [featureForm, setFeatureForm] = useState<RoomFeature>({
    roomType: "",
    featureType: "",
    area: undefined,
    materialDetails: "",
  });
  const defaultRooms = {
  livingRoom: 1,
  kitchen: 1,
  bedroom: 1,
  bathroom: 1,
  dining: 0,
};


  const handleAddFeatureClick = () => {
    // setModalMode("add");
    setFeatureForm({
      roomType: "",
      featureType: "",
      area: undefined,
      materialDetails: "",
    });
    setOpenModal(true);
  };

  const isEditing = Boolean(interiorData?.id);

  // For error handling
  const errors = serviceErrors["interiorService"] || {};

  const handleInputChange = (fieldName: string, value: any) => {
    updateServiceDetails("interiorService", { [fieldName]: value });
    clearFieldError(fieldName);
  };

  const handleRoomChange = (room, change) => {
    const newRooms = {
      ...interiorData.rooms,
      [room]: Math.max(0, (interiorData.rooms?.[room] || 0) + change),
    };
    handleInputChange("rooms", newRooms);
  };

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      const updated = { ...errors };
      delete updated[fieldName];
      updateServiceErrors("interiorService", updated);
    }
  };

  // Validate required fields
  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    // Example: If you consider "modularKitchen" or "cabinetry" required, add checks
    // if (!interiorData.cabinetry.trim()) {
    //   newErrors.cabinetry = "Cabinetry is required";
    // }
    updateServiceErrors("interiorService", newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateFields()) {
      // If validation fails, do not proceed
      return;
    }

    // Build the payload from interiorData
    const payload = {
      modularKitchen: interiorData.modularKitchen,
      wardrobes: interiorData.wardrobes,
      cabinetry: interiorData.cabinetry,
      furnitureDesign: interiorData.furnitureDesign,
      wallPaneling: interiorData.wallPaneling,
      decorStyle: interiorData.decorStyle,
      soundProofing: interiorData.soundProofing,
      smartHomeFeatures: interiorData.smartHomeFeatures,
      storageSolutions: interiorData.storageSolutions,
      additionalRequirements: interiorData.additionalRequirements,
      furnitureLayout: interiorData.furnitureLayout,
      ecoFriendlyMaterials: interiorData.ecoFriendlyMaterials,
      childPetFriendly: interiorData.childPetFriendly,
      materialPreferences: interiorData.materialPreferences,
      bhkType: interiorData.bhkType,
      rooms: interiorData.rooms,
      plywood: interiorData.plywood,
      featureBreakDown: interiorData.featureBreakDown,
    };

    try {
      if (isEditing) {
        const response = await apiClient.put(
          `${apiClient.URLS.interiorService}/${custom_builder_id}`,
          { ...payload },true
        );
        if (response.status === 200) {
          toast.success("Interior service updated successfully");
          clearServiceErrors("interiorService");
        }
      } else {
        const response = await apiClient.post(
          `${apiClient.URLS.interiorService}/${custom_builder_id}`,
          { ...payload },true
        );
        if (response.status === 201) {
          toast.success("Interior service created successfully");
          updateServiceDetails("interiorService", response.body);
          clearServiceErrors("interiorService");
        }
      }
    } catch (error) {
      console.error("Error saving InteriorService:", error);
      toast.error("Error saving interior service");
    }
  };
  const handleFeatureform = (name: string, value: string) => {
    setFeatureForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleModalSubmit = () => {
    const updated = [...(interiorData.featureBreakDown ?? [])];
    if (selectedFeatureIndex === null) {
      updated.push(featureForm);
    } else if (selectedFeatureIndex !== null) {
      updated[selectedFeatureIndex] = featureForm;
    }
    handleInputChange("featureBreakDown", updated);
    setOpenModal(false);
    setSelectedFeatureIndex(null);
  };

  const CloseModel = () => {
    setOpenModal(false);
  };
  const handleEditFeatureClick = (index: number) => {
    const feature = interiorData.featureBreakDown?.[index];
    setFeatureForm({
      roomType: feature.roomType,
      featureType: feature.featureType,
      area: feature.area,
      materialDetails: feature.materialDetails,
    });
    setSelectedFeatureIndex(index);
    setOpenModal(true);
  };
  const handleDeleteFeature = (index) => {
    const updatedfeatures = interiorData.featureBreakDown.filter(
      (featureForm, i) => i !== index
    );
    handleInputChange("featureBreakDown", updatedfeatures);
    if (selectedFeatureIndex === index) {
      setSelectedFeatureIndex(null);
    }
  };

  return (
    <div className="rounded-md shadow-custom  border md:px-10 px-3 md:py-8 py-2">
      <p className="text-[#3586FF]  font-medium md:text-[18px] text-[14px] mb-3">
        Interiors Details:
      </p>
      <div>
        <SelectBtnGrp
          options={bhkArray}
          label="Select BHK"
          labelCls="md:text-[14px] text-[12px] font-medium text-black"
          required
          className="flex flex-row flex-wrap gap-2"
          onSelectChange={(bhkType) => handleInputChange("bhkType", bhkType)}
          btnClass="mb-4 md:px-4 px-2 md:py-[6px] py-1 md:rounded-md font-medium rounded-[4px] md:text-[14px] text-[12px]"
        />
      </div>
      <div className="mb-6 max-w-[300px]">
        <p className="font-medium text-[#3586FF]  mb-2 md:text-[14px] text-[12px]">
          Select Rooms to Design :
        </p>
        {roomTypes.map((room) => (
          <div
            key={room}
            className="flex  gap-2 items-center justify-between bg-white border rounded-md px-4 py-2 mb-3"
          >
            <span className="text-[14px] font-medium capitalize text-nowrap">
              {room.replace(/([A-Z])/g, " $1")}
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleRoomChange(room, -1)}
                className="h-8 w-8 rounded-full text-[20px] font-bold bg-gray-200"
              >
                -
              </Button>
              <span className="text-[14px] font-medium text-[#3586FF]   w-[20px] text-center">
                {interiorData.rooms[room]}
              </span>
              <Button
                onClick={() => handleRoomChange(room, 1)}
                className="h-8 w-8 rounded-full font-bold bg-gray-200 text-[20px] font-bold"
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="my-6">
        <p className="font-medium mb-3 text-[14px] text-[#3586FF] ">
          Room Feature Breakdown:
        </p>
        {interiorData.featureBreakDown?.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="md:min-w-full min-w-[800px]  w-full md:text-sm text-[12px] border border-collapse border-gray-300 rounded-[6px] md:rounded-lg">
              <thead>
                <tr className=" text-white text-left">
                  <th className="border  border-gray-300 p-2 bg-[#5297ff]">#</th>
                  <th className="border  border-gray-300 text-center p-1 bg-[#5297ff]">
                    Room Type
                  </th>
                  <th className="border  border-gray-300 text-center p-1 bg-[#5297ff]">
                    Feature Type
                  </th>
                  <th className="border  border-gray-300 text-center p-1 bg-[#5297ff]">
                    Area{" "}
                  </th>
                  <th className="border  border-gray-300 text-center p-1 bg-[#5297ff]">
                    Material Details
                  </th>
                  <th className="border  border-gray-300 bg-[#5297ff] text-center p-2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {interiorData.featureBreakDown?.map((feature, idx) => (
                  <>
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 font-regular"
                    >
                      <td className="border p-2">{idx + 1}</td>
                      <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                        {feature.roomType}
                      </td>
                      <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                        {feature.featureType}
                      </td>
                      <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                        {feature.area}
                      </td>
                      <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                        {feature.materialDetails}
                      </td>
                      <td className="md:py-4 py-2 md:px-4 px-2 text-center font-medium border  border-gray-300">
                        {" "}
                        <div className="flex w-full justify-center items-center space-x-5">
                          <Button
                            onClick={() => handleEditFeatureClick(idx)}
                            className="text-[#3586FF] "
                          >
                            <MdEdit className="text-xl" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteFeature(idx)}
                            className="text-red-500"
                          >
                            <MdDelete className="text-red-500 text-xl" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button
          onClick={() => handleAddFeatureClick()}
          className="bg-[#5297ff] md:mt-4  mt-2 font-medium text-white px-4 py-2 rounded text-sm"
        >
          + Add Feature
        </Button>
      </div>
      <Modal
        isOpen={OpenModal}
        closeModal={() => setOpenModal(false)}
        isCloseRequired={false}
        className="md:w-[800px] w-[400px]"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-3 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <CustomInput
              label="Room Type"
              labelCls="text-black  md:text-[14px] text-[12px] font-medium "
              name="roomType"
              value={featureForm.roomType}
              onChange={(e) => handleFeatureform("roomType", e.target.value)}
              placeholder="e.g. Living Room"
              type="text"
              className="px-3 md:py-1 py-[2px]"
              // rootCls="w-full md:max-w-[180px]"
            />

            <CustomInput
              label="Feature Type"
              labelCls="text-black  md:text-[14px] text-[12px] font-medium "
              name="featureType"
              value={featureForm.featureType}
              onChange={(e) => handleFeatureform("featureType", e.target.value)}
              placeholder="e.g. TV Unit"
              type="text"
              className="px-3 md:py-1 py-[2px]"
            />

            <CustomInput
              label="Area (sft)"
              labelCls="text-black  md:text-[14px] text-[12px] font-medium "
              name="area"
              value={featureForm.area}
              onChange={(e) => handleFeatureform("area", e.target.value)}
              placeholder="e.g. 150"
              type="number"
              className="px-3 md:py-1 py-[2px]"
            />

            <CustomInput
              label="Material Details"
              labelCls="text-black  md:text-[14px] text-[12px] font-medium "
              name="materialDetails"
              value={featureForm.materialDetails}
              onChange={(e) =>
                handleFeatureform("materialDetails", e.target.value)
              }
              placeholder="e.g. 18mm BWP + Laminate"
              type="text"
              className="px-3 md:py-1 py-[2px]"
            />
          </div>
          <div className="flex w-full items-center justify-between  mt-4">
            <Button
              className="md:py-3 py-1 px-[28px] md:text-[16px] text-[12px] font-medium rounded-md border-2 border-[#3B82F6]"
              onClick={() => CloseModel()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModalSubmit}
              className="md:py-3 py-[6px] px-[28px] md:text-[16px] text-[12px] font-medium rounded-md border-2 bg-[#3B82F6] text-white"
            >
              {selectedFeatureIndex === null ? "Save" : "Update"}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex md:flex-row flex-col md:gap-10 gap-3 w-full md:mb-6 ">
        <CustomInput
          label="Cabinetry"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
          name="cabinetry"
          value={interiorData.cabinetry ?? ""}
          onChange={(e) => handleInputChange("cabinetry", e.target.value)}
          type="text"
          className="md:p-[6px] p-[3px]"
          placeholder="Enter cabinet details"
          rootCls="md:mb-4 mb-2 w-full"
          // errorMsg={errors.cabinetry} // if you validated this
        />
        <CustomInput
          label="Furniture Design"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
          name="furnitureDesign"
          value={interiorData.furnitureDesign ?? ""}
          onChange={(e) => handleInputChange("furnitureDesign", e.target.value)}
          type="text"
          className="md:p-[6px] p-[3px]"
          placeholder="Enter furniture design details"
          rootCls="md:mb-4 mb-2 w-full"
        />
        <CustomInput
          label="Decor Style"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
          name="decorStyle"
          value={interiorData.decorStyle ?? ""}
          onChange={(e) => handleInputChange("decorStyle", e.target.value)}
          type="text"
          className="md:p-[6px] p-[3px]"
          placeholder="Enter decor style details"
          rootCls="md:mb-4 mb-2 w-full"
        />
      </div>

      <div className="flex md:flex-row flex-col md:gap-10 gap-2 w-full md:my-6 ">
        <div className="w-full">
          <SearchComponent
            label="Plywood Type"
            name="plywood"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
            placeholder="Enter Plywood Type"
            value={interiorData.plywood ?? ""}
            options={PlywoodTypes}
            onChange={(val: { label: string; value: any }) =>
              handleInputChange("plywood", val.value)
            }
            rootClassName="border-gray-300 bg-white "
            inputClassName="text-gray-500 md:py-[6px] py-[2px] md:placeholder:text-[12px] placeholder:text-[12px] "
            dropdownCls="bg-gray-50 font-medium md:text-[14px] text-[12px] border-b border-[1px] border-gray-200 py-2 px-2 "
          />
        </div>
        <div className="w-full">
          <CustomInput
            label="Storage Solutions"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
            name="storageSolutions"
            value={interiorData.storageSolutions ?? ""}
            onChange={(e) =>
              handleInputChange("storageSolutions", e.target.value)
            }
            type="text"
            className="md:p-[6px] p-[3px]"
            placeholder="Enter storage solutions details"
            rootCls="md:mb-4 mb-2 w-full"
          />
        </div>
      </div>
      <div className="flex flex-row md:gap-4 gap-2 items-center justify-start flex-wrap md:mt-6 mt-3  mb-5 md:mb-10 w-full">
        <div className="w-[150px] ">
          <CustomCheckbox
            label="Modular kitchen"
            labelCls="text-[black] text-[12px] font-medium "
            name={"hydroSurvey"}
            checked={interiorData.modularKitchen}
            onChange={() =>
              handleInputChange("modularKitchen", !interiorData.modularKitchen)
            }
            className="w-5 h-5"
          />
        </div>
        <div className="w-[150px]">
          <CustomCheckbox
            label="Built-in Wardrobes"
            labelCls="text-black text-[12px] font-medium"
            name="wardrobes"
            checked={interiorData.wardrobes}
            onChange={() =>
              handleInputChange("wardrobes", !interiorData.wardrobes)
            }
            className="w-5 h-5"
          />
        </div>

        <div className="w-[150px]">
          <CustomCheckbox
            label="Wall Paneling"
            labelCls="text-black text-[12px] font-medium"
            name="wallPaneling"
            checked={interiorData.wallPaneling}
            onChange={() =>
              handleInputChange("wallPaneling", !interiorData.wallPaneling)
            }
            className="w-5 h-5"
          />
        </div>

        <div className="w-[150px]">
          <CustomCheckbox
            label="Sound Proofing"
            labelCls="text-black text-[12px] font-medium"
            name="soundProofing"
            checked={interiorData.soundProofing}
            onChange={() =>
              handleInputChange("soundProofing", !interiorData.soundProofing)
            }
            className="w-5 h-5"
          />
        </div>

        <div className="w-[150px]">
          <CustomCheckbox
            label="Smart Home"
            labelCls="text-black text-[12px] font-medium"
            name="smartHomeFeatures"
            checked={interiorData.smartHomeFeatures}
            onChange={() =>
              handleInputChange(
                "smartHomeFeatures",
                !interiorData.smartHomeFeatures
              )
            }
            className="w-5 h-5"
          />
        </div>
        <div className="w-[150px]">
          <CustomCheckbox
            label="Furniture Layout"
            labelCls="text-black text-[12px] font-medium"
            name="furnitureLayout"
            checked={interiorData.furnitureLayout}
            onChange={() =>
              handleInputChange(
                "furnitureLayout",
                !interiorData.furnitureLayout
              )
            }
            className="w-5 h-5"
          />
        </div>

        <div className="w-[150px]">
          <CustomCheckbox
            label="Eco-friendly"
            labelCls="text-black text-[12px] font-medium"
            name="ecoFriendlyMaterials"
            checked={interiorData.ecoFriendlyMaterials}
            onChange={() =>
              handleInputChange(
                "ecoFriendlyMaterials",
                !interiorData.ecoFriendlyMaterials
              )
            }
            className="w-5 h-5"
          />
        </div>
        <div className="w-[150px]">
          <CustomCheckbox
            label="Child or Pet Friendly"
            labelCls="text-black text-[12px] font-medium"
            name="childPetFriendly"
            checked={interiorData.childPetFriendly}
            onChange={() =>
              handleInputChange(
                "childPetFriendly",
                !interiorData.childPetFriendly
              )
            }
            className="w-5 h-5"
          />
        </div>
      </div>

      <div className="my-6">
        <MultiCheckbox
          label="Material Preferences"
          labelCls="text-black text-[12px] font-medium mb-2"
          options={materialPreferenceOptions}
          selectedValues={interiorData.materialPreferences || []}
          onChange={(selected) =>
            handleInputChange("materialPreferences", selected)
          }
        />
      </div>

      <CustomInput
        label="Additional Requirements (optional) "
        labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-2 mb-1"
        name="additionalRequirements"
        value={interiorData.additionalRequirements ?? ""}
        onChange={(e) =>
          handleInputChange("additionalRequirements", e.target.value)
        }
        type="textarea"
        className="md:p-[12px] p-[6px]"
        rootCls="my-6 w-full"
      />

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
        >
          {isEditing ? "Update Details" : "Save Details"}
        </Button>
      </div>
    </div>
  );
};

export default Interior;
