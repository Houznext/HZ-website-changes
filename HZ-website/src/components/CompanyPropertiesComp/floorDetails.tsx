import React, { useState } from "react";
import Button from "@/common/Button";
import FileInput from "@/common/FileInput";
import CustomInput from "@/common/FormElements/CustomInput";
import Modal from "@/common/Modal";
import SelectBtnGrp from "@/common/SelectBtnGrp";
import FloatingDatePicker from "@/common/FormElements/FloatingDateInput";
import { FaCalendarAlt } from "react-icons/fa";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import { bhkArray } from "../Property/PropertyDetails/PropertyHelpers";

import toast from "react-hot-toast";
import ImageUploader from "@/common/FormElements/DragImageInput";
import { propertyTypeEnum } from "../Property/PropertyDetails/PropertyHelpers";
import {

  validateUnitData,
  unitIconMap,
  labelMap,
} from "./projecthelper";
import { FaEdit, FaTrash } from "react-icons/fa";
import CustomDate from "@/common/FormElements/CustomDate";

// ---------- Interfaces ----------
type AllowedUnits =
  | "sq.ft"
  | "sq.yard"
  | "sq.meter"
  | "acre"
  | "cent"
  | "marla"
  | "";

interface SizeWithUnit {
  size: number | null;
  unit: AllowedUnits | "";
}

interface FlooringPlan {
  floorplan: string;
  BuiltupArea: SizeWithUnit;
  TotalPrice: number | null;
  pricePerSft: number | null;
  emiStartsAt: number | null;
}

interface UnitType {
  BHK?: string;
  unitName?: string;
  flatSize?: SizeWithUnit;
  plotSize: SizeWithUnit;
  flooringPlans: FlooringPlan[];
}

const emptyUnit: UnitType = {
  unitName: "",
  BHK: "",
  flatSize: { size: null, unit: "" },
  plotSize: { size: null, unit: "" },
  flooringPlans: [
    {
      floorplan: "",
      BuiltupArea: { size: null, unit: "" },
      TotalPrice: null,
      pricePerSft: null,
      emiStartsAt: null,
    },
  ],
};

// ---------- Component ----------
const CompanyFloorDetails = () => {
  const {
    projects,
    projectDetails,
    errors,
    selectedProjectIndex,
    updateUnit,
    addUnit,
    removeUnit,
    setProjectDetails,
    setErrors,
  } = useCompanyPropertyStore();

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [unitData, setUnitData] = useState<UnitType>(emptyUnit);
  const project =
    selectedProjectIndex !== null
      ? projects[selectedProjectIndex]
      : projectDetails;
  const units = project?.propertyType?.units || [];

  const openAddUnitModal = () => {
    setUnitData(emptyUnit);
    setEditIndex(null);
    setIsUnitModalOpen(true);
  };

  const openEditUnitModal = (index: number) => {
    if (!project?.propertyType) return;

    const unit = project.propertyType.units[index];

    setUnitData({
      ...unit,
      flatSize: unit?.flatSize ?? { size: null, unit: "" },
      plotSize: unit?.plotSize ?? { size: null, unit: "" },
      flooringPlans:
        unit?.flooringPlans?.map((floor) => ({
          ...floor,
          BuiltupArea: floor?.BuiltupArea ?? { size: 0, unit: "sq.ft" },
        })) ?? [],
    });

    setEditIndex(index);
    setIsUnitModalOpen(true);
  };

  const closeUnitModal = () => {
    setIsUnitModalOpen(false);
    setUnitData(emptyUnit);
    setEditIndex(null);
  };

  const handleUnitChange = (
    name: keyof UnitType,
    value: string | number,
    fieldType?: "size" | "unit"
  ) => {
    if (name === "flatSize" || name === "plotSize") {
      setUnitData((prev) => ({
        ...prev,
        [name]: {
          ...(prev[name] || {}),
          [fieldType || "size"]: value,
        },
      }));
    } else {
      setUnitData((prev) => ({
        ...prev,
        [name]: value as any,
      }));
    }
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFloorPlanChange = (
    name: keyof FlooringPlan | "BuiltupArea",
    value: any,
    fieldType: "size" | "unit" = "size"
  ) => {
    if (name === "BuiltupArea") {
      setUnitData((prev) => {
        const prevBuiltup = prev.flooringPlans[0]?.BuiltupArea || {
          size: null,
          unit: "",
        };
        const updatedBuiltup: SizeWithUnit = {
          size: fieldType === "size" ? (value as number) : prevBuiltup.size,
          unit:
            fieldType === "unit" ? (value as AllowedUnits) : prevBuiltup.unit,
        };

        return {
          ...prev,
          flooringPlans: [
            {
              ...prev.flooringPlans[0],
              BuiltupArea: updatedBuiltup,
            },
          ],
        };
      });
    } else {
      setUnitData((prev) => ({
        ...prev,
        flooringPlans: [
          {
            ...prev.flooringPlans[0],
            [name]: value,
          },
        ],
      }));
    }
  };

  const saveUnit = () => {
    const errorMessage = validateUnitData(
      unitData,
      project?.propertyType?.typeName ?? ' '
    );
    if (!errorMessage) {
      toast.error("errorMessage");
      return;
    }

    const updatedProject = {
      ...project,
      propertyType: {
        ...project?.propertyType,
        units: project?.propertyType?.units
          ? [...project.propertyType.units]
          : [],
      },
    };

    if (selectedProjectIndex !== null) {
      if (editIndex !== null) {
        updateUnit(selectedProjectIndex, editIndex, unitData);
      } else {
        addUnit(selectedProjectIndex, unitData);
      }
    } else {
      const newUnits =
        editIndex !== null && updatedProject.propertyType?.units
          ? updatedProject.propertyType.units.map((unit, idx) =>
            idx === editIndex ? unitData : unit
          )
          : [...(updatedProject.propertyType?.units || []), unitData];

      setProjectDetails({
        ...updatedProject,
        propertyType: {
          ...updatedProject.propertyType,
          description: updatedProject.propertyType?.description ?? "",
          additionalAttributes:
            updatedProject.propertyType?.additionalAttributes ?? null,
          units: newUnits,
        },
      });
    }

    closeUnitModal();
  };

  const deleteUnit = (index: number) => {
    if (!project?.propertyType) return;

    if (selectedProjectIndex !== null) {
      removeUnit(selectedProjectIndex, index);
    } else {
      setProjectDetails({
        ...project,
        propertyType: {
          ...project.propertyType,
          units: project.propertyType.units.filter((_, idx) => idx !== index),
        },
      });
    }
  };
  console.log("units", units);

  return (
    <div className="px-5 py-5 shadow-custom rounded-md mb-5 md:mt-2 mt-1 w-full">
      <h3 className="md:text-[18px] text-[14px] font-medium text-[#3586FF] mb-3">
        Unit Details
      </h3>

      {units.length > 0 && (
        <div className="flex md:gap-2 gap-1  mb-4">
          {units.map((unit, index) => (
            <Button
              key={index}
              className={`px-4 py-2 md:text-lg text-[14px] font-medium ${selectedUnitIndex === index
                ? "border-[1px] border-[#3586FF] bg-[#3586FF] text-white rounded-[4px]"
                : "text-gray-600 border-[1px] shadow-xl  border-gray-300 rounded-[4px]"
                }`}
              onClick={() => setSelectedUnitIndex(index)}
            >
              {unit?.BHK || unit?.unitName}
            </Button>
          ))}
        </div>
      )}
      <div>
        {units.length > 0 ? (
          <div className="border rounded-md p-4 mt-3 shadow-custom">
            <div>
              {/* <div className="md:text-[16px] text-[12px]">
                {Object.entries(units[selectedUnitIndex])
                  .filter(([key, value]) => {
                    if (key === "flooringPlans") return false;
                    if (value === null || value === undefined) return false;
                    if (typeof value === "string" && value.trim() === "")
                      return false;
                    if (typeof value === "object") {
                      // handle structured fields like { size, unit }
                      if (value?.size === null || value?.size === undefined)
                        return false;
                    }
                    return true;
                  })
                  .map(([key, value]) => (
                    <p key={key} className="flex flex-row gap-2 mb-2">
                      <span className="md:text-[16px] text-[12px] text-gray-600 font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </span>
                      <span className="md:text-[16px] text-[12px] font-medium">
                        {typeof value === "string" || typeof value === "number"
                          ? value
                          : `${value?.size ?? ""} ${value?.unit ?? ""}`}
                      </span>
                    </p>
                  ))}
              </div> */}
              <div className="flex gap-2 items-end justify-end">
                <Button
                  className="bg-[#3586FF] text-white px-5 md:py-2 py-1 text-nowrap md:text-[16px] text-[12px] rounded-md"
                  onClick={() => openEditUnitModal(selectedUnitIndex)}
                >
                  Edit
                </Button>
                <Button
                  className="bg-red-500 text-white px-5 md:py-2 py-1 rounded-md text-nowrap md:text-[16px] text-[12px]"
                  onClick={() => deleteUnit(selectedUnitIndex)}
                >
                  Delete
                </Button>
              </div>
            </div>

            {units[selectedUnitIndex].flooringPlans?.length > 0 && (
              <div className="mt-4 bg-gray-50 p-1 rounded-md shadow-custom">
                <h4 className="md:text-[16px] text-[14px] font-medium text-[#3586FF] mb-2">
                  Flooring Plan
                </h4>

                <div className="grid md:grid-cols-3 grid-cols-2 md:gap-4 gap-2">
                  {[
                    ...Object.entries(units[selectedUnitIndex]).filter(
                      ([key, value]) => {
                        if (key === "flooringPlans") return false;
                        if (value === null || value === undefined) return false;
                        if (typeof value === "string" && value.trim() === "")
                          return false;
                        if (typeof value === "object") {
                          if (value?.size === null || value?.size === undefined)
                            return false;
                        }
                        return true;
                      }
                    ),

                    ...units[selectedUnitIndex].flooringPlans?.flatMap(
                      (floor) =>
                        Object.entries(floor).filter(
                          ([key, value]) =>
                            key !== "id" &&
                            value !== null &&
                            value !== undefined &&
                            !(typeof value === "string" && value.trim() === "")
                        ) || []
                    ),
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="text-[14px] font-medium flex flex-col items-start gap-1"
                    >
                      <div className="flex items-center md:gap-2 gap-1">
                        <span className="md:text-[16px] text-[12px] text-[#3586FF] font-medium">
                          {unitIconMap[key]}
                        </span>
                        <span className="md:text-[16px] text-[12px] text-[#3586FF] font-medium">
                          {labelMap[key] ||
                            key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </div>

                      {key === "floorplan" ? (
                        Array.isArray(value) && value.length > 0 ? (
                          <div className="flex gap-2">
                            {value.map((url: string, i: number) =>
                              url.endsWith(".pdf") ? (
                                <iframe
                                  key={i}
                                  src={url}
                                  title={`Floor Plan PDF ${i}`}
                                  className="md:w-[100px] w-[60px] md:h-[100px] h-[60px] rounded-md border"
                                />
                              ) : (
                                <img
                                  key={i}
                                  src={url}
                                  alt={`Floor Plan ${i}`}
                                  className="md:w-[100px] w-[60px] md:h-[100px] h-[60px] object-cover rounded-md border"
                                />
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No floorplan uploaded
                          </span>
                        )
                      ) : key === "emiStartsAt" ? (
                        <span className="md:text-[14px] text-[10px] font-medium">
                          {new Date(value).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="md:text-[14px] text-[10px] font-medium text-wrap">
                          {typeof value === "string" ||
                            typeof value === "number"
                            ? value
                            : `${value?.size ?? ""} ${value?.unit ?? ""}`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No units added yet.</p>
        )}
      </div>

      <div className="flex justify-end px-5 py-3">
        <Button
          className="bg-[#3586FF] text-white text-[12px] md:text-[14px] font-medium px-3 py-2 rounded-md"
          onClick={openAddUnitModal}
        >
          + Add Unit
        </Button>
      </div>

      {isUnitModalOpen && (
        <Modal
          isOpen={isUnitModalOpen}
          closeModal={closeUnitModal}
          className="max-w-[600px]  px-10 py-8 rounded-md md:rounded-lg bg-gray-100 "
          rootCls="z-[99999]"
          isCloseRequired={false}
        >
          <h2 className="text-[20px] font-medium text-[#3586FF] mb-4">
            {editIndex !== null ? "Edit Unit" : "Add New Unit"}
          </h2>

          {project?.propertyType?.typeName !==
            (propertyTypeEnum.Plot || propertyTypeEnum.AgriculturalLand) ? (
            <SelectBtnGrp
              options={bhkArray}
              label="No of BHK"
              labelCls="md:text-[16px] text-[12px] font-medium text-black mb-3"
              className="gap-2 mb-4 overflow-auto"
              btnClass="md:text-[16px] text-[13px] font-medium rounded-md md:px-[21px] px-[10px] shadow-custom md:py-[10px] py-[6px] border-[1px] border-gray-200"
              onSelectChange={(value: any) => handleUnitChange("BHK", value)}
              slant={false}
              defaultValue={unitData?.BHK}
              error={errors?.BHK}
            />
          ) : (
            <CustomInput
              name="unitName"
              label="Unit Name"
              labelCls="md:text-[14px] text-[12px] font-medium"
              placeholder="e.g., East-facing 30x40"
              className="mb-4 px-2 py-1"
              type="text"
              onChange={(e) => handleUnitChange("unitName", e.target.value)}
              value={unitData.unitName || ""}
              errorMsg={errors?.unitName}
            />
          )}

          {/* Flat & Plot Size */}
          <div className="flex flex-col gap-3">
            {project?.propertyType?.typeName !==
              (propertyTypeEnum.Plot || propertyTypeEnum.AgriculturalLand) && (
                <CustomInput
                  name="flatSize"
                  label="Flat Size"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  placeholder="Enter Flat Size"
                  type="number"
                  className="px-2 py-1"
                  onChange={(e) =>
                    handleUnitChange("flatSize", +e.target.value, "size")
                  }
                  value={unitData?.flatSize?.size || ""}
                  unitsDropdown={{
                    value: unitData?.flatSize?.unit,
                    options: [
                      "sq.ft",
                      "sq.yard",
                      "sq.meter",
                      "acre",
                      "cent",
                      "marla",
                    ],
                    onChange: (val) => handleUnitChange("flatSize", val, "unit"),
                  }}
                  errorMsg={errors?.flatSize}
                  required
                />
              )}
            <CustomInput
              name="plotSize"
              label="Plot Size"
              labelCls="md:text-[14px] text-[12px] font-medium"
              placeholder="Enter Plot  Size"
              type="number"
              className="px-2 py-1 "
              onChange={(e) =>
                handleUnitChange("plotSize", +e.target.value, "size")
              }
              value={unitData.plotSize?.size || ""}
              unitsDropdown={{
                value: unitData.plotSize?.unit,
                options: [
                  "sq.ft",
                  "sq.yard",
                  "sq.meter",
                  "acre",
                  "cent",
                  "marla",
                ],
                onChange: (val) => handleUnitChange("plotSize", val, "unit"),
              }}
              errorMsg={errors?.plotSize}
              required
            />
          </div>

          {/* Flooring Plan */}
          <div className="px-4 py-3  md:py-6 md:px-5 shadow-custom rounded-md mt-4 bg-white">
            <h3 className="md:text-[18px] text-[16px] font-medium text-[#3586FF] mb-3">
              {project?.propertyType?.typeName !==
                (propertyTypeEnum.Plot || propertyTypeEnum.AgriculturalLand)
                ? "Flooring Plan Details"
                : "Land Plot Dimensions"}
            </h3>
            <div className="flex flex-col gap-3">
              <div className="max-h-[270px] overflow-auto">
                <ImageUploader
                  name="floorplan"
                  label="Floor Plan"
                  labelCls="md:text-[14px] text-[12px] font-medium text-black"
                  type="file"
                  folderName="company-project/floorplans"
                  onFilesChange={(url) =>
                    handleFloorPlanChange("floorplan", url)
                  }
                  errorMsg={errors?.floorplan}
                  initialImageUrls={unitData.flooringPlans[0]?.floorplan}
                  required
                />
              </div>
              {project?.propertyType?.typeName !==
                (propertyTypeEnum.Plot ||
                  propertyTypeEnum.AgriculturalLand) && (
                  <CustomInput
                    name="BuiltupArea"
                    label="Built-up Area"
                    className="px-1 py-1"
                    labelCls="md:text-[14px] text-[12px] font-medium"
                    placeholder="Enter Built-up Area"
                    type="number"
                    onChange={(e) =>
                      handleFloorPlanChange(
                        "BuiltupArea",
                        +e.target.value,
                        "size"
                      )
                    }
                    value={unitData.flooringPlans[0]?.BuiltupArea?.size || ""}
                    unitsDropdown={{
                      value: unitData.flooringPlans[0]?.BuiltupArea?.unit,
                      options: [
                        "sq.ft",
                        "sq.yard",
                        "sq.meter",
                        "acre",
                        "cent",
                        "marla",
                      ],
                      onChange: (val) =>
                        handleFloorPlanChange("BuiltupArea", val, "unit"),
                    }}
                    errorMsg={errors?.BuiltupArea}
                    required
                  />
                )}
              <CustomInput
                name="TotalPrice"
                label="Total Price in (Rs.)"
                type="number"
                className="px-1 py-1"
                placeholder="Enter Total Price"
                labelCls="md:text-[14px] text-[12px] font-medium"
                onChange={(e) =>
                  handleFloorPlanChange("TotalPrice", +e.target.value)
                }
                value={unitData.flooringPlans[0]?.TotalPrice || ""}
                errorMsg={errors?.TotalPrice}
                required
              />
              <CustomInput
                name="pricePerSft"
                label="Price per Sq. Ft."
                className="px-1 py-1"
                labelCls="md:text-[14px] text-[12px] font-medium"
                placeholder="Enter Price per Sq. Ft."
                type="number"
                onChange={(e) =>
                  handleFloorPlanChange("pricePerSft", +e.target.value)
                }
                value={unitData.flooringPlans[0]?.pricePerSft || ""}
                errorMsg={errors?.pricePerSft}
                required
              />
              <div className="mt-4">
                <CustomDate
                  name="emiStartsAt"
                  label="EMI Starts At"
                  labelCls="md:text-[14px] text-[12px] font-medium"
                  onChange={(e: any) =>
                    handleFloorPlanChange(
                      "emiStartsAt",
                      new Date(e.target.value).getTime()
                    )
                  }
                  value={unitData.flooringPlans[0]?.emiStartsAt || ""}
                  errorMsg={errors?.emiStartsAt}
                  rightIcon={<FaCalendarAlt />}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-10">
            <Button
              className="bg-gray-500 text-white px-4 py-2 md:text-[16px] text-[12px]  rounded-md"
              onClick={closeUnitModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#3586FF] text-white font-medium md:text-[16px] text-[12px] px-4 py-2 rounded-md"
              onClick={saveUnit}
            >
              {editIndex !== null ? "Update Unit" : "Add Unit"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CompanyFloorDetails;
