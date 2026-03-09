import Button from "@/src/common/Button";
import SearchComponent from "@/src/common/SearchSelect";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  generatePortionCombinations,
  getDynamicFloorPortionoptions,
  getMaxBedrooms,
  GroundfloorOptions,
  portionOptions,
} from "../../helper";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import { FaHome } from "react-icons/fa";
import { MdMeetingRoom, MdBathtub, MdBalcony } from "react-icons/md";

const FloorDetails = () => {
  const { customerOnboarding, updateFloorDetails } = useCustomBuilderStore();
  const { propertyInformation } = customerOnboarding;
  const [activeTab, setActiveTab] = useState(0);

  const dataSource =
    propertyInformation.construction_scope === "House"
      ? propertyInformation?.house_construction_info
      : propertyInformation?.interior_info;

  const totalFloors = dataSource?.total_floors ?? 0;

  const floors = useMemo(
    () =>
      Array.from({ length: totalFloors === 0 ? 1 : totalFloors + 1 }, (_, i) => ({
        label: i === 0 ? "Ground Floor" : `Floor ${i}`,
        value: i,
      })),
    [totalFloors]
  );

  const currentFloor = dataSource?.floors?.[activeTab];
  const numPortions = currentFloor?.portions || 0;
  const portionTypes = ["1BHK", "2BHK", "3BHK", "4BHK"];
  const portionCombinations = useMemo(
    () => generatePortionCombinations(numPortions, portionTypes),
    [numPortions]
  );

  const portions: string[] = currentFloor?.type_of_portions || [];

  const handlePortionsChange = useCallback(
    (value: { label: string; value: any }) => {
      const newCount = value.value;
      updateFloorDetails(activeTab, {
        portions: newCount,
        type_of_portions: [],
        portionDetails: [],
      });
    },
    [activeTab, updateFloorDetails]
  );

  const handlePortionSelect = useCallback(
    (value: { label: string; value: any }) => {
      const selected = value.value.split(" & ");
      const updatedPortionDetails = selected.map((portionType: string) => ({
        portionType,
        bedrooms: 0,
        bathrooms: 0,
        balconies: 0,
        additional_rooms: [],
        indian_bathroom_required: false,
      }));
      updateFloorDetails(activeTab, {
        type_of_portions: selected,
        portionDetails: updatedPortionDetails,
      });
    },
    [activeTab, updateFloorDetails]
  );

  const handleDetailChange = useCallback(
    (
      portionIndex: number,
      field: "bedrooms" | "bathrooms" | "balconies",
      value: number
    ) => {
      const updatedPortionDetails = [
        ...(currentFloor?.portionDetails || []),
      ];
      updatedPortionDetails[portionIndex] = {
        ...updatedPortionDetails[portionIndex],
        [field]: value,
      };
      updateFloorDetails(activeTab, { portionDetails: updatedPortionDetails });
    },
    [activeTab, currentFloor?.portionDetails, updateFloorDetails]
  );

  const handleReset = useCallback(
    (name: string) => {
      if (name === "portions") {
        updateFloorDetails(activeTab, {
          portions: 0,
          type_of_portions: [],
          portionDetails: [],
        });
      } else {
        updateFloorDetails(activeTab, { [name]: [] });
      }
    },
    [activeTab, updateFloorDetails]
  );

  return (
    <div className="md:p-3 p-1">
      {/* Floor Tabs */}
      <div className="flex gap-2 md:mb-5 mb-3 overflow-x-auto pb-1">
        {floors.map((floor, index) => {
          const floorData = dataSource?.floors?.[index];
          const hasData = floorData?.portions > 0 || (floorData?.type_of_portions?.length ?? 0) > 0;
          return (
            <button
              key={index}
              type="button"
              className={`shrink-0 flex items-center gap-1.5 md:px-4 px-2.5 md:py-2 py-1.5 md:text-[13px] text-[11px] font-medium border rounded-lg transition-all ${
                activeTab === index
                  ? "bg-[#3586FF] text-white border-[#3586FF] shadow-sm"
                  : hasData
                    ? "bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
              onClick={() => setActiveTab(index)}
            >
              {hasData && activeTab !== index && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
              {floor.label}
            </button>
          );
        })}
      </div>

      {/* Portions + Room Combo */}
      <div className="grid md:grid-cols-2 grid-cols-1 md:gap-6 gap-3 mb-4">
        <SearchComponent
          label="Number of Portions"
          labelCls="text-gray-800 md:text-[13px] text-[12px] font-medium mb-1"
          placeholder="Select portions..."
          value={numPortions > 0 ? numPortions.toString() : ""}
          onChange={handlePortionsChange}
          onReset={() => handleReset("portions")}
          options={portionOptions}
          rootClassName="border-gray-300"
          inputClassName="text-gray-600 py-[2px] placeholder:text-[12px]"
          dropdownCls="bg-gray-50"
          showDeleteIcon
          required
        />

        {numPortions > 0 && (
          <SearchComponent
            key={`combo-${numPortions}`}
            label="Room Combination"
            labelCls="text-gray-800 md:text-[13px] text-[12px] font-medium mb-1"
            placeholder="Select room combination..."
            value={portions.length > 0 ? portions.join(" & ") : ""}
            onChange={handlePortionSelect}
            onReset={() => handleReset("type_of_portions")}
            options={portionCombinations.map((combo) => ({
              label: combo,
              value: combo,
            }))}
            rootClassName="border-gray-300"
            inputClassName="text-gray-600 py-[2px] placeholder:text-[12px]"
            dropdownCls="bg-gray-50"
            showDeleteIcon
            required
          />
        )}
      </div>

      {/* Ground Floor Options */}
      {activeTab === 0 && (
        <div className="mb-4">
          <MultiCheckbox
            options={GroundfloorOptions}
            selectedValues={dataSource?.floors?.[0]?.ground_floor_details || []}
            labelCls="!text-gray-800 md:text-[13px] text-[12px] font-medium my-2"
            ClassName="md:h-5 h-3 md:w-5 w-3"
            onChange={(selectedValues) =>
              updateFloorDetails(activeTab, {
                ground_floor_details: selectedValues,
              })
            }
          />
        </div>
      )}

      {/* Portion Detail Cards */}
      {portions.length > 0 && (
        <div className="space-y-4 mt-2">
          {portions.map((portion, index) => {
            const trimmed = portion.replace(/\s/g, "");
            const dynamicOptions = getDynamicFloorPortionoptions(trimmed);
            const maxBedrooms = getMaxBedrooms(trimmed);
            const detail = currentFloor?.portionDetails?.[index];

            return (
              <div
                key={`${portion}-${index}`}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center gap-2">
                  <FaHome className="text-[#3586FF] text-sm" />
                  <h4 className="text-[13px] font-semibold text-gray-800">
                    Portion {index + 1}: {portion}
                  </h4>
                </div>

                <div className="p-4 space-y-4">
                  {/* Room Types */}
                  <MultiCheckbox
                    label={`Room types in ${portion}`}
                    labelCls="text-gray-700 md:text-[13px] text-[11px] font-medium mb-1"
                    options={dynamicOptions || []}
                    selectedValues={detail?.additional_rooms || []}
                    ClassName="md:h-4 h-3 md:w-4 w-3"
                    onChange={(selectedValues) => {
                      const updated = [...(currentFloor?.portionDetails || [])];
                      updated[index] = { ...updated[index], additional_rooms: selectedValues };
                      updateFloorDetails(activeTab, { portionDetails: updated });
                    }}
                  />

                  {/* Bedrooms / Bathrooms / Balconies */}
                  <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
                    <div>
                      <SearchComponent
                        label="Bedrooms"
                        labelCls="text-gray-700 md:text-[12px] text-[11px] font-medium mb-1"
                        value={detail?.bedrooms || ""}
                        onChange={(val) =>
                          handleDetailChange(index, "bedrooms", parseInt(val.value))
                        }
                        options={[...Array(maxBedrooms)].map((_, i) => ({
                          label: `${i + 1} Bedroom${i > 0 ? "s" : ""}`,
                          value: i + 1,
                        }))}
                        rootClassName="border-gray-200"
                        inputClassName="text-gray-600 py-[1px] placeholder:text-[11px]"
                        dropdownCls="bg-gray-50 text-[12px]"
                      />
                    </div>
                    <div>
                      <SearchComponent
                        label="Bathrooms"
                        labelCls="text-gray-700 md:text-[12px] text-[11px] font-medium mb-1"
                        value={detail?.bathrooms || ""}
                        onChange={(val) =>
                          handleDetailChange(index, "bathrooms", parseInt(val.value))
                        }
                        options={[...Array(5)].map((_, i) => ({
                          label: `${i + 1} Bathroom${i > 0 ? "s" : ""}`,
                          value: i + 1,
                        }))}
                        rootClassName="border-gray-200"
                        inputClassName="text-gray-600 py-[1px] placeholder:text-[11px]"
                        dropdownCls="bg-gray-50 text-[12px]"
                      />
                    </div>
                    <div>
                      <SearchComponent
                        label="Balconies"
                        labelCls="text-gray-700 md:text-[12px] text-[11px] font-medium mb-1"
                        value={detail?.balconies || ""}
                        onChange={(val) =>
                          handleDetailChange(index, "balconies", parseInt(val.value))
                        }
                        options={[...Array(maxBedrooms)].map((_, i) => ({
                          label: `${i + 1} Balcon${i > 0 ? "ies" : "y"}`,
                          value: i + 1,
                        }))}
                        rootClassName="border-gray-200"
                        inputClassName="text-gray-600 py-[1px] placeholder:text-[11px]"
                        dropdownCls="bg-gray-50 text-[12px]"
                      />
                    </div>
                  </div>

                  {/* Indian Bathroom */}
                  <MultiCheckbox
                    options={[{ label: "Indian Bathroom Required", value: "indian_bathroom" }]}
                    selectedValues={detail?.indian_bathroom_required ? ["indian_bathroom"] : []}
                    ClassName="md:h-4 h-3 md:w-4 w-3"
                    labelCls="text-gray-700 md:text-[12px] text-[11px] font-medium"
                    onChange={(selectedValues) => {
                      const updated = [...(currentFloor?.portionDetails || [])];
                      updated[index] = {
                        ...updated[index],
                        indian_bathroom_required: selectedValues.includes("indian_bathroom"),
                      };
                      updateFloorDetails(activeTab, { portionDetails: updated });
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {numPortions === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
          <MdMeetingRoom className="text-gray-300 text-4xl mx-auto mb-2" />
          <p className="text-[13px] text-gray-500 font-medium">
            Select number of portions to configure floor details
          </p>
        </div>
      )}
    </div>
  );
};

export default FloorDetails;
