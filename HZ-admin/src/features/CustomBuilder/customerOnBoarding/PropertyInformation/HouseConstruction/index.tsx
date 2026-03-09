import React, { useEffect, useMemo, useState } from "react";
import { CautionIcon } from "../../../Icons";
import {
  Addoptions,
  AdjacentRoads,
  generateDirectionCombinations,
  LandFacing,
  TotalFloorsRequired,
} from "../../../helper";
import CustomInput from "@/src/common/FormElements/CustomInput";
import useCustomBuilderStore, { SizeWithUnit } from "@/src/stores/custom-builder";
import SearchComponent from "@/src/common/SearchSelect";
import Button from "@/src/common/Button";

import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import { FaBuilding } from "react-icons/fa";
import Loader from "@/src/common/Loader";
import FloorDetails from "../../FloorDetails";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import { validateCustomerOnboarding } from "../../CustomerOnBoardingvalidations";

const HouseConstruction = () => {
  const {
    customerOnboarding,
    updatePropertyInformation,
    updatePropertyInfoErrors,
    custom_builder_id,
    clearPropertyInfoErrors,
    propertyInformationErrors,
    updateHouseConstructionInfo,
    updateHouseConstructionErrors,
    houseConstructionInfoErrors,
    clearHouseConstructionErrors,
  } = useCustomBuilderStore();
  const [searchValue, setSearchValue] = useState("");
  const { propertyInformation } = customerOnboarding;
  const { house_construction_info } = propertyInformation;
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = Boolean(propertyInformation?.id);

  const landFacingOptions = useMemo(() => {
    const roads = house_construction_info?.adjacent_roads;
    if (!roads) return [];
    const combinations = generateDirectionCombinations(roads);
    return combinations?.map((combo: string[]) => ({
      label: combo.join("&"),
      value: combo.join("-").toLowerCase(),
    })) || [];
  }, [house_construction_info?.adjacent_roads]);

  const gateSideOptions = useMemo(() => {
    const facing = house_construction_info?.land_facing;
    if (!facing) return [];
    const sides = facing.split("-");
    return sides.map((side: string) => ({
      label: `Gate on ${side.charAt(0).toUpperCase() + side.slice(1)}`,
      value: side.toLowerCase(),
    }));
  }, [house_construction_info?.land_facing]);

  const handleReset = () => {
    setSearchValue("");
    updateHouseConstructionInfo({ adjacent_roads: null, land_facing: "", gate_side: "" });
  };

  const validateFields = () => {
    const propertyErrors: { [key: string]: string } = {};
    const houseErrors: { [key: string]: string } = {};
    if (!propertyInformation?.construction_type)
      propertyErrors.construction_type = "Construction Type is required.";
    if (!propertyInformation?.property_type)
      propertyErrors.property_type = "Property Type is required.";
    if (!propertyInformation?.construction_scope)
      propertyErrors.construction_scope = "Construction Scope is required.";

    if (!house_construction_info?.total_area)
      houseErrors.total_area = "Total area is required.";
    if (!house_construction_info?.adjacent_roads)
      houseErrors.adjacent_roads = "Adjacent Roads is required.";
    if (!house_construction_info?.land_facing)
      houseErrors.land_facing = "Land Facing is required.";
    if (!house_construction_info?.gate_side)
      houseErrors.gate_side = "Gate Side is required.";
    if (!house_construction_info?.staircase_gate)
      houseErrors.staircase_gate = "Staircase Gate is required.";
    if (house_construction_info?.total_floors === null || house_construction_info?.total_floors === undefined)
      houseErrors.total_floors = "Total Floors is required.";
    return (
      Object.keys(propertyErrors).length === 0 &&
      Object.keys(houseErrors).length === 0
    );
  };
  // const validateHouseConstruction = (propertyInformation: any) => {
  //   const houseConstructionErrors: Record<string, string> = {};

  //   if (propertyInformation.construction_scope === "House") {
  //     const houseInfo = propertyInformation.house_construction_info;

  //     if (!houseInfo?.total_area) {
  //       houseConstructionErrors.total_area = "Total area is required.";
  //     } else {
  //       const { area_unit, total_area } = houseInfo;

  //       if (area_unit === "sq.yd" && total_area > 2000) {
  //         houseConstructionErrors.total_area =
  //           "Total area cannot exceed 2000 sq.yd.";
  //       } else if (area_unit === "sq.ft" && total_area > 18000) {
  //         houseConstructionErrors.total_area =
  //           "Total area cannot exceed 18,000 sq.ft.";
  //       } else if (area_unit === "ac" && total_area > 0.5) {
  //         houseConstructionErrors.total_area =
  //           "Total area cannot exceed 0.5 acres.";
  //       } else if (area_unit === "sq.m" && total_area > 1670) {
  //         houseConstructionErrors.total_area =
  //           "Total area cannot exceed 1,670 sq.m.";
  //       } else if (area_unit === "ha" && total_area > 0.2) {
  //         houseConstructionErrors.total_area =
  //           "Total area cannot exceed 0.2 hectares.";
  //       }
  //     }

  //     if (!houseInfo?.adjacent_roads)
  //       houseConstructionErrors.adjacent_roads = "Adjacent Roads is required.";
  //     if (!houseInfo?.land_facing)
  //       houseConstructionErrors.land_facing = "Land Facing is required.";
  //     if (!houseInfo?.gate_side)
  //       houseConstructionErrors.gate_side = "Gate Side is required.";
  //     if (!houseInfo?.staircase_gate)
  //       houseConstructionErrors.staircase_gate = "Staircase Gate is required.";
  //     if (!houseInfo?.total_floors)
  //       houseConstructionErrors.total_floors = "Total floors is required.";
  //   }

  //   return houseConstructionErrors;
  // };

  const validateField = (field: string, value: any) => {
    const tempState = {
      ...customerOnboarding,
      propertyInformation: {
        ...customerOnboarding.propertyInformation,
        house_construction_info: {
          ...customerOnboarding.propertyInformation.house_construction_info,
          [field]: value,
        },
      },
    };

    const errors = validateCustomerOnboarding(tempState);

    clearErrors(field);

    if (errors.houseConstructionErrors?.[field]) {
      updateHouseConstructionErrors({
        ...houseConstructionInfoErrors,
        [field]: errors.houseConstructionErrors[field],
      });
    }
  };

  const handlePropSave = async () => {
    clearHouseConstructionErrors();
    const errors = validateCustomerOnboarding(customerOnboarding);
    updatePropertyInfoErrors(errors.propertyErrors);
    updateHouseConstructionErrors(errors.houseConstructionErrors);
    if (
      Object.keys(errors.propertyErrors).length > 0 ||
      Object.keys(errors.houseConstructionErrors).length > 0 ||
      Object.keys(errors.interiorErrors).length > 0
    ) {
      return;
    }

    const payload = {
      propertyName: propertyInformation?.propertyName,
      construction_type: propertyInformation?.construction_type,
      property_type: propertyInformation?.property_type,
      construction_scope:
        propertyInformation?.construction_scope?.toLowerCase(),
      houseConstructionInfo: {
        total_area: house_construction_info?.total_area,
        adjacent_roads: house_construction_info?.adjacent_roads,
        land_facing: house_construction_info?.land_facing,
        length: house_construction_info?.length,
        width: house_construction_info?.width,
        total_floors: house_construction_info?.total_floors,
        gate_side: house_construction_info?.gate_side,
        additionOptions: house_construction_info?.additionOptions,
        staircase_gate: house_construction_info?.staircase_gate,
        propertyImages: house_construction_info?.propertyImages,
        additional_details: house_construction_info?.additional_details,
      },
      interiorInfo: null,
    };

    setIsLoading(true);
    try {
      if (isEditing) {
        const response = await apiClient.patch(
          `${apiClient.URLS.custom_property}/${propertyInformation?.id}`,
          {
            ...payload,
          }, true
        );
        if (response.status === 200) {
          setIsLoading(false);
          toast.success("Property details updated successfully");
          clearPropertyInfoErrors();
          // clearHouseConstructionErrors();
        }
      } else {
        const response = await apiClient.post(
          `${apiClient.URLS.custom_property}/${custom_builder_id}`,
          {
            ...payload,
          }, true
        );
        if (response.status === 201) {
          setIsLoading(false);
          toast.success("Property details saved successfully");
          clearPropertyInfoErrors();
          // clearHouseConstructionErrors();
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log("error occured while saving property details", error);
      toast.error("Something went wrong");
    }
  };

  const handleInputChage = (
    key: keyof typeof house_construction_info,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    const prev = house_construction_info ?? {};

    const update: Record<string, any> = {
      [key]: nestedKey
        ? { ...((prev[key] as SizeWithUnit) ?? {}), [nestedKey]: value }
        : value,
    };

    if (key === "adjacent_roads") {
      update.land_facing = "";
      update.gate_side = "";
    }

    if (key === "land_facing") {
      update.gate_side = "";
    }

    if (key === "total_floors") {
      const newCount = Number(value) || 0;
      const existingFloors = (prev as any).floors || [];
      const requiredLength = newCount === 0 ? 1 : newCount + 1;
      update.floors = Array.from({ length: requiredLength }, (_, i) =>
        existingFloors[i] ?? {
          floor: i === 0 ? "Ground Floor" : `${i} Floor`,
          portions: 0,
          type_of_portions: [],
          portionDetails: [],
          ground_floor_details: [],
        }
      );
    }

    updateHouseConstructionInfo(update);
    clearErrors(key as string);
  };

  const clearErrors = (name: string) => {
    const updatedErrors = { ...propertyInformationErrors };
    delete updatedErrors[name];
    updateHouseConstructionErrors({ ...updatedErrors });
  };

  const generateFloorDetails = (floors: any) => {
    switch (floors) {
      case "Ground Floor":
        return 0;
      case "1 Floor":
        return 1;
      case "2 Floor":
        return 2;
      case "3 Floor":
        return 3;
      case "4 Floor":
        return 4;
      case "5 Floor":
    }
  };

  const submitFloorDetails = async () => {
    if (!validateFields()) {
      return;
    } else {
      const payload = {
        floors: house_construction_info.floors.map((floor) => ({
          floor: generateFloorDetails(floor.floor),
          ground_floor_details: floor.ground_floor_details || [],
          portions: floor.portions || 0,
          type_of_portions: Array.isArray(floor.type_of_portions)
            ? floor.type_of_portions
            : [floor.type_of_portions],
          portionDetails: floor.portionDetails.map((details) => ({
            portionType: details.portionType,
            bedrooms: details.bedrooms || 0,
            bathrooms: details.bathrooms || 0,
            balconies: details.balconies || 0,
            indian_bathroom_required: details.indian_bathroom_required || false,
            additional_rooms: details.additional_rooms || [],
          })),
        })),
      };
      try {
        const response = await apiClient.patch(
          `${apiClient.URLS.custom_property}/${custom_builder_id}/floors`,
          payload, true
        );
        if (response.status == 200) {
          setIsLoading(false);
          toast.success("Floor details saved successfully");
        }
      } catch (error) {
        console.log("error occured", error);
        toast.error("error occured in floor details");
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return <Loader />;
  }


  return (
    <>
      <div>
        <div className="flex md:flex-row flex-col md:gap-3 gap-1">
          <CustomInput
            label="Total Area"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
            name="total_area"
            placeholder="Enter total area"
            value={house_construction_info?.total_area?.size || null}
            onChange={(e) => handleInputChage("total_area", +e.target.value, "size")}
            required
            errorMsg={houseConstructionInfoErrors?.total_area}
            type="number"
            className="w-full  p-[0.5px] text-[12px] md:text-[14px]"
            unitsDropdown={{
              options: ["sq.yd", "sq.ft", "ac", "sq.m", "ha"],
              value: house_construction_info?.total_area?.unit,
              onChange: (value) => handleInputChage("total_area", value, "unit"),
            }}
            maxLength={5}
            rootCls="md:mb-4 mb-2 max-w-[420px]"
          />
          <CustomInput
            label="Land Length"
            labelCls="text-black md:text-[14px] text-[12px]  font-medium md:mb-3 mb-1"
            name="length"
            placeholder="Enter land length"
            value={house_construction_info?.length?.size || null}
            onChange={(e) => handleInputChage("length", +e.target.value, "size")}
            required
            errorMsg={houseConstructionInfoErrors?.length}
            type="number"
            className="w-full  p-[0.5px] text-[12px] md:text-[14px]"
            unitsDropdown={{
              options: ["sq.yd", "sq.ft", "ac", "sq.m", "ha"],
              value: house_construction_info?.length?.unit,
              onChange: (value) => handleInputChage("length", value, "unit"),
            }}
            maxLength={5}
            rootCls="md:mb-4 mb-2 max-w-[420px]"
          />
          <CustomInput
            label="Land Width"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
            name="width"
            placeholder="Enter land width"
            value={house_construction_info?.width?.size || null}
            onChange={(e) => handleInputChage("width", +e.target.value, "size")}
            required
            errorMsg={houseConstructionInfoErrors?.width}
            type="number"
            className="w-full  p-[0.5px] text-[12px] md:text-[14px]"
            unitsDropdown={{
              options: ["sq.yd", "sq.ft", "ac", "sq.m", "ha"],
              value: house_construction_info?.width?.unit,
              onChange: (value) => handleInputChage("width", value, "unit"),
            }}
            maxLength={5}
            rootCls="md:mb-4 mb-2 max-w-[420px]"
          />
        </div>
        <div className="flex md:flex-row flex-col items-center justify-center md:gap-10 gap-2 w-full md:my-6 my-1 ">
          <div className="w-full">
            <SearchComponent
              label="Adjacent Roads"
              name="adjacent_roads"
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
              placeholder="Adjacent roads search..."
              value={house_construction_info?.adjacent_roads}
              onChange={(val: { label: string; value: any }) =>
                handleInputChage("adjacent_roads", val.value)
              }
              onReset={handleReset}
              options={AdjacentRoads}
              errorMsg={houseConstructionInfoErrors?.adjacent_roads}
              rootClassName="border-gray-300 "
              inputClassName=" py-[0.5px]   placeholder:text-[12px] "
              dropdownCls="bg-gray-50"
              iconClassName="text-red-500"
              showDeleteIcon={true}
              required
            />
          </div>
          <div className="w-full">
            <SearchComponent
              key={`land-facing-${house_construction_info?.adjacent_roads ?? "none"}`}
              label="Land Facing"
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
              placeholder="Land facing search..."
              value={house_construction_info?.land_facing}
              onChange={(val: { label: string; value: any }) =>
                handleInputChage("land_facing", val.value)
              }
              options={landFacingOptions}
              errorMsg={houseConstructionInfoErrors?.land_facing}
              inputClassName="  py-[0.5px]  placeholder:text-[12px]"
              dropdownCls="bg-gray-100"
              iconClassName="text-red-500"
              showDeleteIcon={true}
              required
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Total Number of Floors"
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
              placeholder="Search Total Floors..."
              value={house_construction_info?.total_floors}
              onChange={(val: { label: string; value: any }) =>
                handleInputChage("total_floors", val.value)
              }
              options={TotalFloorsRequired}
              errorMsg={houseConstructionInfoErrors?.total_floors}
              rootClassName="border-gray-300"
              inputClassName="  py-[0.5px]  placeholder:text-[12px]"
              dropdownCls="bg-gray-50 "
              iconClassName="text-red-500"
              showDeleteIcon={true}
              required
            />
          </div>
        </div>
        <div className="flex md:flex-row flex-col md:gap-5 gap-2 md:max-w-[1200px] md:mb-4">
          <div className="w-full">
            <SearchComponent
              key={`gate-side-${house_construction_info?.land_facing ?? "none"}`}
              label="Prior Gate Side"
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
              placeholder="Search Gate Side..."
              value={house_construction_info?.gate_side}
              onChange={(val: { label: string; value: any }) =>
                handleInputChage("gate_side", val.value)
              }
              options={gateSideOptions}
              errorMsg={houseConstructionInfoErrors?.gate_side}
              rootClassName="border-gray-300"
              inputClassName="  py-[0.5px] md:placeholder:text-[] placeholder:text-[12px] "
              dropdownCls="bg-gray-50 "
              iconClassName="text-red-500"
              showDeleteIcon={true}
              required
            />
          </div>
          <div className="w-full">
            <SearchComponent
              label="Prior Staircase Side"
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
              placeholder="Search Staircase Side..."
              value={house_construction_info?.staircase_gate}
              onChange={(value) =>
                updateHouseConstructionInfo({ staircase_gate: value.value })
              }
              onReset={handleReset}
              options={LandFacing.slice(0, 4)}
              errorMsg={houseConstructionInfoErrors?.staircase_gate}
              rootClassName="border-gray-300 "
              inputClassName="  py-[0.5px] md:placeholder:text-[] placeholder:text-[12px] "
              dropdownCls="bg-gray-50 "
              iconClassName="text-red-500"
              showDeleteIcon={true}
              required
            />
          </div>
        </div>
        <div>
          <MultiCheckbox
            label="Additional Details"
            options={Addoptions}
            selectedValues={house_construction_info?.additionOptions}
            labelCls="text-black md:text-[14px] text-[12px] font-medium my-3"
            ClassName="md:h-5 h-3 md:w-5 w-3 "
            onChange={(value) =>
              updateHouseConstructionInfo({ additionOptions: value })
            }
          />
        </div>
        <div className="md:mt-6 mt-3">
          <ImageFileUploader
            name="propertyImages"
            type="file"
            folderName="customBuilder/propimages"
            label="Property images"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-4 mb-1 block"
            onFileChange={(data) => {
              updateHouseConstructionInfo({ propertyImages: data });
            }}
            initialFileUrl={house_construction_info?.propertyImages}
          />
        </div>
        <div className="md:mt-6 mt-3">
          <CustomInput
            label="Additional requirement of the customer (optional)"
            labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-1"
            name="additional_details"
            placeholder="Enter additional requirement of the customer (optional)"
            className="md:py-[10px] py-[3px] px-3 text-[12px] md:text-[14px] md:placeholder:text-[13px] placeholder:text-[12px]"
            errorMsg={houseConstructionInfoErrors?.additional_details}
            value={house_construction_info?.additional_details}
            onChange={(e) =>
              updateHouseConstructionInfo({
                additional_details: e.target.value,
              })
            }
            type="textarea"
          />
        </div>
        <div className="flex justify-end my-6 ">
          <Button
            className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
            onClick={handlePropSave}
          >
            Save Details
          </Button>
        </div>
      </div>
      <div className="w-full shadow-custom border md:px-5 px-3 md:py-6 py-4 md:mt-6 mt-3">
        <div className="font-medium md:text-[18px] px-[] flex flex-row gap-2 mb-4">
          <FaBuilding className="text-[#3586FF] " />
          <p className="font-medium md:text-[16px] text-[14px] text-[#3586FF] ">
            Floor Information
          </p>
        </div>
        <div>
          <div>
            <FloorDetails />
          </div>
          <div className="flex justify-end md:mt-3 mt-1">
            <Button
              onClick={submitFloorDetails}
              className="md:px-5 px-3 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
            >
              Save Floors
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HouseConstruction;
