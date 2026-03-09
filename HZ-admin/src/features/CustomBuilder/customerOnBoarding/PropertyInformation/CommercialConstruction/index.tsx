import React, { useMemo, useState } from "react";
import CustomInput from "@/src/common/FormElements/CustomInput";
import useCustomBuilderStore, { SizeWithUnit } from "@/src/stores/custom-builder";
import SearchComponent from "@/src/common/SearchSelect";
import Button from "@/src/common/Button";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import { FaBuilding } from "react-icons/fa";
import Loader from "@/src/common/Loader";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import {
  AdjacentRoads,
  generateDirectionCombinations,
  LandFacing,
  TotalFloorsRequired,
  commercialAddOptions,
} from "../../../helper";

const areaUnits = ["sq.ft", "sq.yd", "sq.m", "ac", "ha"];
const heightUnits = ["ft", "m"];

const CommercialConstruction = () => {
  const {
    customerOnboarding,
    updateCommercialConstructionInfo,
    custom_builder_id,
    updatePropertyInformation,
    propertyInformationErrors,
  } = useCustomBuilderStore();

  const { propertyInformation } = customerOnboarding;
  const info = propertyInformation?.commercial_construction_info;
  const isEditing = Boolean(propertyInformation?.id);
  const [isLoading, setIsLoading] = useState(false);

  const landFacingOptions = useMemo(() => {
    const roads = info?.adjacent_roads;
    if (!roads) return LandFacing;
    const combinations = generateDirectionCombinations(roads);
    return combinations?.map((combo: string[]) => ({
      label: combo.join("&"),
      value: combo.join("-").toLowerCase(),
    })) || [];
  }, [info?.adjacent_roads]);

  const handleSizeChange = (
    field: string,
    key: "size" | "unit",
    value: string | number
  ) => {
    const current = (info?.[field] as SizeWithUnit) || { size: 0, unit: "sq.ft" };
    updateCommercialConstructionInfo({
      [field]: { ...current, [key]: key === "size" ? Number(value) : value },
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        construction_type: propertyInformation.construction_type,
        propertyName: propertyInformation.propertyName,
        property_type: propertyInformation.property_type,
        commercial_property_type: propertyInformation.commercial_property_type,
        construction_scope: propertyInformation.construction_scope?.toLowerCase(),
        commercialConstructionInfo: info,
      };

      const response = isEditing
        ? await apiClient.patch(
          `${apiClient.URLS.custom_property}/${propertyInformation?.id}`,
          payload,
          true
        )
        : await apiClient.post(
          `${apiClient.URLS.custom_property}/${custom_builder_id}`,
          payload,
          true
        );

      if (response.status === 200 || response.status === 201) {
        const data = response.body;
        updatePropertyInformation({ id: data.id });
        toast.success(
          isEditing ? "Updated successfully" : "Saved successfully"
        );
      }
    } catch (error) {
      console.error("Error saving commercial property:", error);
      toast.error("Error saving property");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex md:flex-row flex-col md:gap-3 gap-1">
        <CustomInput
          label="Total Area"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
          name="total_area"
          placeholder="Enter total area"
          value={info?.total_area?.size || ""}
          onChange={(e) => handleSizeChange("total_area", "size", e.target.value)}
          required
          type="number"
          className="w-full p-[0.5px] text-[12px] md:text-[14px]"
          unitsDropdown={{
            options: areaUnits,
            value: info?.total_area?.unit || "sq.ft",
            onChange: (value) => handleSizeChange("total_area", "unit", value),
          }}
          maxLength={5}
          rootCls="md:mb-4 mb-2 max-w-[420px]"
        />
        <CustomInput
          label="Length"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
          name="length"
          placeholder="Enter length"
          value={info?.length?.size || ""}
          onChange={(e) => handleSizeChange("length", "size", e.target.value)}
          type="number"
          className="w-full p-[0.5px] text-[12px] md:text-[14px]"
          unitsDropdown={{
            options: areaUnits,
            value: info?.length?.unit || "sq.ft",
            onChange: (value) => handleSizeChange("length", "unit", value),
          }}
          maxLength={5}
          rootCls="md:mb-4 mb-2 max-w-[420px]"
        />
        <CustomInput
          label="Width"
          labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
          name="width"
          placeholder="Enter width"
          value={info?.width?.size || ""}
          onChange={(e) => handleSizeChange("width", "size", e.target.value)}
          type="number"
          className="w-full p-[0.5px] text-[12px] md:text-[14px]"
          unitsDropdown={{
            options: areaUnits,
            value: info?.width?.unit || "sq.ft",
            onChange: (value) => handleSizeChange("width", "unit", value),
          }}
          maxLength={5}
          rootCls="md:mb-4 mb-2 max-w-[420px]"
        />
      </div>

      <div className="flex md:flex-row flex-col items-center justify-center md:gap-10 gap-2 w-full md:my-6 my-1">
        <div className="w-full max-w-[420px]">
          <CustomInput
            label="Building Height"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
            name="height"
            placeholder="Enter height"
            value={info?.height?.size || ""}
            onChange={(e) => handleSizeChange("height", "size", e.target.value)}
            type="number"
            className="w-full p-[0.5px] text-[12px] md:text-[14px]"
            unitsDropdown={{
              options: heightUnits,
              value: info?.height?.unit || "ft",
              onChange: (value) => handleSizeChange("height", "unit", value),
            }}
            maxLength={5}
          />
        </div>
        <div className="w-full">
          <SearchComponent
            label="Adjacent Roads"
            labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
            options={AdjacentRoads}
            onChange={(v) =>
              updateCommercialConstructionInfo({
                adjacent_roads: Number(v.value),
                land_facing: "",
              })
            }
            value={info?.adjacent_roads}
          />
        </div>
        <div className="w-full">
          <SearchComponent
            key={`comm-land-facing-${info?.adjacent_roads ?? "none"}`}
            label="Land Facing"
            labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
            options={landFacingOptions}
            onChange={(v) =>
              updateCommercialConstructionInfo({ land_facing: String(v.value) })
            }
            value={info?.land_facing}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
        <SearchComponent
          label="Total Floors"
          required
          labelCls="text-[12px] md:text-[14px] font-medium text-black"
          options={[...TotalFloorsRequired, { label: "6+ floors", value: 6 }]}
          onChange={(v) =>
            updateCommercialConstructionInfo({
              total_floors: Number(v.value),
            })
          }
          value={info?.total_floors}
          errorMsg={propertyInformationErrors?.total_floors}
        />
        <CustomInput
          label="Basement Floors"
          type="number"
          labelCls="text-[12px] md:text-[14px] font-medium text-black"
          className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
          placeholder="0"
          value={info?.basement_floors || ""}
          onChange={(e) =>
            updateCommercialConstructionInfo({
              basement_floors: Number(e.target.value),
            })
          }
          name="basement_floors"
        />
        <CustomInput
          label="Parking Floors"
          type="number"
          labelCls="text-[12px] md:text-[14px] font-medium text-black"
          className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
          placeholder="0"
          value={info?.parking_floors || ""}
          onChange={(e) =>
            updateCommercialConstructionInfo({
              parking_floors: Number(e.target.value),
            })
          }
          name="parking_floors"
        />
        <CustomInput
          label="Parking Capacity"
          type="number"
          labelCls="text-[12px] md:text-[14px] font-medium text-black"
          className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
          placeholder="0"
          value={info?.parking_capacity || ""}
          onChange={(e) =>
            updateCommercialConstructionInfo({
              parking_capacity: Number(e.target.value),
            })
          }
          name="parking_capacity"
        />
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-[14px] font-semibold text-gray-700 mb-3">
          Infrastructure Requirements
        </p>
        <div className="grid md:grid-cols-3 grid-cols-2 gap-3">
          {[
            { key: "elevator_required", label: "Elevator / Lift" },
            { key: "central_ac_required", label: "Central AC / HVAC" },
            { key: "fire_safety_required", label: "Fire Safety System" },
            { key: "parking_required", label: "Parking Facility" },
            { key: "generator_backup_required", label: "Generator Backup" },
            { key: "water_treatment_required", label: "Water Treatment Plant" },
            { key: "sewage_treatment_required", label: "Sewage Treatment Plant" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-gray-600"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#3586FF] rounded"
                checked={!!info?.[key]}
                onChange={() =>
                  updateCommercialConstructionInfo({ [key]: !info?.[key] })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {info?.elevator_required && (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <CustomInput
            label="Number of Elevators"
            type="number"
            labelCls="text-[12px] md:text-[14px] font-medium text-black"
            className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
            placeholder="Enter number"
            value={info?.number_of_elevators || ""}
            onChange={(e) =>
              updateCommercialConstructionInfo({
                number_of_elevators: Number(e.target.value),
              })
            }
            name="number_of_elevators"
          />
        </div>
      )}

      {info?.generator_backup_required && (
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <CustomInput
            label="Generator Capacity (KVA)"
            type="number"
            labelCls="text-[12px] md:text-[14px] font-medium text-black"
            className="md:px-2 px-2 py-[2px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
            placeholder="Enter capacity in KVA"
            value={info?.generator_capacity_kva || ""}
            onChange={(e) =>
              updateCommercialConstructionInfo({
                generator_capacity_kva: Number(e.target.value),
              })
            }
            name="generator_capacity_kva"
          />
        </div>
      )}

      <div>
        <MultiCheckbox
          label="Additional Features"
          options={commercialAddOptions}
          selectedValues={info?.additionOptions || []}
          labelCls="text-black md:text-[14px] text-[12px] font-medium my-2"
          ClassName="md:h-5 h-3 md:w-5 w-3"
          onChange={(values: string[]) =>
            updateCommercialConstructionInfo({ additionOptions: values })
          }
        />
      </div>

      <div>
        <label className="text-[12px] md:text-[14px] font-medium text-black">
          Property Images
        </label>
        <ImageFileUploader
          initialFileUrl={info?.propertyImages || []}
          folderName="customBuilder/propimages"
          onFileChange={(urls: string[]) =>
            updateCommercialConstructionInfo({
              propertyImages: [...(info?.propertyImages || []), ...urls],
            })
          }
          type="file"
        />
      </div>

      <CustomInput
        label="Additional Requirements (Optional)"
        type="text"
        labelCls="text-[12px] md:text-[14px] font-medium text-black"
        className="md:px-2 px-2 py-[6px] md:rounded-md rounded-[4px] md:text-[14px] text-[12px]"
        placeholder="Any other requirements..."
        value={info?.additional_details || ""}
        onChange={(e) =>
          updateCommercialConstructionInfo({
            additional_details: e.target.value,
          })
        }
        name="additional_details"
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="md:px-5 md:py-1 px-3 py-1 font-medium bg-[#3B82F6] text-white rounded-[6px]"
        >
          {isEditing ? "Update Property" : "Save Property"}
        </Button>
      </div>
    </div>
  );
};

export default CommercialConstruction;
