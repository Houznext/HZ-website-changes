import React, { useState } from "react";
import useCustomBuilderStore, {
  SizeWithUnit,
} from "@/src/stores/custom-builder";
import CustomInput from "@/src/common/FormElements/CustomInput";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import Button from "@/src/common/Button";
import SearchComponent from "@/src/common/SearchSelect";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";
import { TotalFloorsRequired } from "../../../helper";
import FloorDetails from "../../FloorDetails";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import { FaBuilding } from "react-icons/fa";
import { SketchPicker } from "react-color";
import Modal from "@/src/common/Modal";
import { IoClose } from "react-icons/io5";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { validateCustomerOnboarding } from "../../CustomerOnBoardingvalidations";

interface ColorScheme {
  label: string;
  color: string;
}

const InteriorInfo = () => {
  const {
    custom_builder_id,
    customerOnboarding,
    updateInteriorInformation,
    interiorInformationErrors,
    updateInteriorInfoErrors,
    clearInteriorInfoErrors,
  } = useCustomBuilderStore();
  const { propertyInformation } = customerOnboarding;
  const { interior_info } = propertyInformation;
  const [isLoading, setIsLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<null | number>(null);
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    label: "",
    color: "",
  });
  const [openModal, setOpenModal] = useState(false);

  const isEditing = Boolean(propertyInformation?.id);

  const validateFields = () => {
    const newErrors: any = {};
    if (!interior_info.project_scope?.trim()) {
      newErrors.project_scope = "Project Scope is required.";
    }
    if (!interior_info.total_area) {
      newErrors.total_area = "Total Area is required.";
    } else {
      const { total_area } = interior_info;

      // if (area_unit === "sq.yd" && total_area? > 2000) {
      //   newErrors.total_area = "Total area cannot exceed 2000 sq.yd.";
      // } else if (area_unit === "sq.ft" && total_area > 18000) {
      //   newErrors.total_area = "Total area cannot exceed 18,000 sq.ft.";
      // } else if (area_unit === "ac" && total_area > 0.5) {
      //   newErrors.total_area = "Total area cannot exceed 0.5 acres.";
      // } else if (area_unit === "sq.m" && total_area > 1670) {
      //   newErrors.total_area = "Total area cannot exceed 1,670 sq.m.";
      // } else if (area_unit === "ha" && total_area > 0.2) {
      //   newErrors.total_area = "Total area cannot exceed 0.2 hectares.";
      // }
    }
    if (!interior_info.style_preference) {
      newErrors.style_preference = "Style preference is required.";
    }

    if (!interior_info.color_scheme) {
      newErrors.color_scheme = "Color scheme is required.";
    }

    if (!interior_info.budget) {
      newErrors.budget = "Budget is required.";
    }

    if (!interior_info.special_requirements) {
      newErrors.special_requirements = "Special requirements is required.";
    }

    if (!interior_info.reference_images) {
      newErrors.reference_images = "Reference images is required.";
    }

    updateInteriorInfoErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChange = (
    name: string,
    value: any,
    nestedKey?: keyof SizeWithUnit
  ) => {
    if (name === "total_area" && nestedKey) {
      const current: SizeWithUnit = interior_info?.total_area ?? {
        size: 0,
        unit: "sq.ft",
      };
      updateInteriorInformation({
        total_area: {
          ...current,
          [nestedKey]: value,
        },
      });
    } else if (name === "total_area") {
      // when user types in size
      updateInteriorInformation({
        total_area: {
          ...interior_info?.total_area,
          size: value,
        },
      });
    } else {
      updateInteriorInformation({ [name]: value });
    }

    if (interiorInformationErrors?.[name]) {
      const updatedErrors = { ...interiorInformationErrors };
      delete updatedErrors[name];
      updateInteriorInfoErrors(updatedErrors);
    }
  };

  // const handleInputChange = (name: string, value: any, nestedKey?: keyof SizeWithUnit) => {
  //   if (name === "total_area" && nestedKey) {
  //     const current: SizeWithUnit = interior_info?.total_area ?? { size: 0, unit: "sq.ft" };

  //     updateInteriorInformation({
  //       total_area: {
  //         ...current,
  //         [nestedKey]: value,
  //       },
  //     });
  //   } else {
  //     updateInteriorInformation({ [name]: value });
  //   }
  //   if (interiorInformationErrors?.[name]) {
  //     const updatedErrors = { ...interiorInformationErrors };
  //     delete updatedErrors[name];
  //     updateInteriorInfoErrors(updatedErrors);
  //   }
  // };

  const handleColorChange = (name: string, value: string) => {
    setColorScheme((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSave = () => {
    if (colorScheme?.color?.length === 0 || colorScheme.label?.length === 0) {
      toast.error("Please provide valid details");
      return;
    }

    let newArray = [...interior_info?.color_scheme];
    if (editIdx !== null) {
      newArray[editIdx] = colorScheme;
    } else {
      newArray.push(colorScheme);
    }
    updateInteriorInformation({ color_scheme: newArray });
    setColorScheme({ label: "", color: "" });
    setOpenModal(false);
    setEditIdx(null);
  };

  const handleColorEdit = (idx: number) => {
    setColorScheme(interior_info.color_scheme[idx]);
    setOpenModal(true);
    setEditIdx(idx);
  };

  const handleColorDelete = (idx: number) => {
    const newArray = [...interior_info.color_scheme];
    newArray.splice(idx, 1);
    updateInteriorInformation({ color_scheme: newArray });
  };

  const handlePropSave = async () => {
    clearInteriorInfoErrors();

    const errors = validateCustomerOnboarding(customerOnboarding);

    if (Object.keys(errors.interiorErrors).length > 0) {
      updateInteriorInfoErrors(errors.interiorErrors as Record<string, string>);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        propertyName: propertyInformation?.propertyName,
        construction_type: propertyInformation?.construction_type,
        property_type: propertyInformation?.property_type,
        construction_scope:
          propertyInformation?.construction_scope?.toLowerCase(),
        houseConstructionInfo: null,
        interiorInfo: {
          project_scope: interior_info?.project_scope,
          total_area: interior_info?.total_area,

          style_preference: interior_info?.style_preference,
          color_scheme: interior_info?.color_scheme,
          totalFloors: interior_info?.totalFloors,
          budget: interior_info?.budget,
          special_requirements: interior_info?.special_requirements,
          reference_images: interior_info?.reference_images,
          additional_details: interior_info?.additional_details,
          additionOptions: interior_info?.additionOptions,
        },
      };

      if (isEditing) {
        const response = await apiClient.patch(
          `${apiClient.URLS.custom_property}/${propertyInformation?.id}`,
          {
            ...payload,
          },
          true
        );
        if (response.status === 200) {
          toast.success("Interior information updated successfully");
          clearInteriorInfoErrors();
        }
      } else {
        const response = await apiClient.post(
          `${apiClient.URLS.custom_property}/${custom_builder_id}`,
          {
            ...payload,
          },
          true
        );
        if (response.status === 201) {
          toast.success("Interior information saved successfully");
          clearInteriorInfoErrors();
        }
      }
    } catch (error) {
      toast.error("Error saving interior info");
      console.error("InteriorInfo save error:", error);
    } finally {
      setIsLoading(false);
    }
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
      const visibleCount =
        (propertyInformation.interior_info?.totalFloors ?? 0) + 1;

      const usable = (interior_info.floors || []).slice(0, visibleCount);

      const payload = {
        floors: usable
          .filter(
            (f) =>
              (f.portions ?? 0) > 0 ||
              (Array.isArray(f.type_of_portions) &&
                f.type_of_portions.length > 0) ||
              (Array.isArray(f.ground_floor_details) &&
                f.ground_floor_details.length > 0)
          )
          .map((f, idx) => ({
            // floor: generateFloorDetails(f.floor),
            floor: idx,
            ground_floor_details: f.ground_floor_details || [],
            portions: f.portions || 0,
            type_of_portions: Array.isArray(f.type_of_portions)
              ? f.type_of_portions
              : f.type_of_portions
                ? [f.type_of_portions]
                : [],
            portionDetails: (f.portionDetails || []).map((d) => ({
              portionType: d.portionType,
              bedrooms: d.bedrooms || 0,
              bathrooms: d.bathrooms || 0,
              balconies: d.balconies || 0,
              indian_bathroom_required: !!d.indian_bathroom_required,
              additional_rooms: d.additional_rooms || [],
            })),
          })),
      };

      try {
        const response = await apiClient.patch(
          `${apiClient.URLS.custom_property}/${custom_builder_id}/floors`,
          payload,
          true
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
      <div className="flex flex-col">
        <div>
          <div className="flex md:flex-row  flex-col md:gap-3 gap-2 w-full mb-6">
            <CustomInput
              label="Total Area"
              labelCls="text-black text-[14px] font-medium mb-3"
              name="total_area"
              placeholder="Total area"
              value={interior_info?.total_area?.size}
              onChange={(e) => handleInputChange("total_area", +e.target.value)}
              required
              errorMsg={interiorInformationErrors?.total_area}
              type="number"
              className=" md:px-2 px-2  py-[2px] md:rounded-md font-regular rounded-[4px] md:text-[14px] text-[12px]"
              unitsDropdown={{
                options: ["sq.yd", "sq.ft", "ac", "sq.m", "ha"],
                value: interior_info?.total_area?.unit,
                onChange: (value) =>
                  handleInputChange("total_area", value, "unit"),
              }}
              rootCls="mb-4 max-w-[420px]"
            />
            <SearchComponent
              label="Total number of Floors"
              labelCls="text-black md:text-[14px] text-[12px] font-medium mb-2"
              placeholder="Search Total Floors..."
              value={interior_info?.totalFloors}
              onChange={(val: { label: string; value: any }) => {
                handleInputChange("totalFloors", val.value);
                handleInputChange("total_floors", val.value);
              }}
              options={TotalFloorsRequired}
              errorMsg={interiorInformationErrors?.totalFloors}
              rootClassName="border-gray-300 max-w-[420px] min-w-[420px] "
              inputClassName="text-gray-500 md:py-[2px] placeholder:text-[13px]"
              dropdownCls="bg-gray-50 text-[14px] text-gray-700"
              iconClassName="text-red-500"
              showDeleteIcon={true}
              required
            />
          </div>
          <div className="flex md:flex-row flex-col gap-10 w-full mb-6 ">
            <CustomInput
              label="Style Preference (Modern, Minimalist, Traditional, etc.)"
              labelCls="text-black text-[14px] font-medium mb-3"
              name="style_preference"
              value={interior_info?.style_preference}
              onChange={(e) =>
                handleInputChange("style_preference", e.target.value)
              }
              placeholder="Modern, Minimalist, Traditional, etc."
              type="text"
              className="w-full px-[2px]"
              rootCls="mb-4 max-w-[420px]"
              errorMsg={interiorInformationErrors.style_preference}
              required
            />
            <CustomInput
              label="Budget"
              labelCls="text-black text-[14px] font-medium"
              name="budget"
              value={
                interior_info?.budget !== null ? interior_info?.budget : ""
              }
              onChange={(e) => handleInputChange("budget", +e.target.value)}
              required
              type="number"
              placeholder="Budget"
              className="w-full p-[2px]"
              rootCls="mb-4 max-w-[420px]"
              errorMsg={interiorInformationErrors.budget}
            />
          </div>

          <div className="flex md:flex-row flex-col gap-10 w-full mb-6 ">
            <CustomInput
              label="Project Scope (e.g. “Living room + kitchen renovation”)"
              labelCls="text-black text-[14px] font-medium"
              name="project_scope"
              value={interior_info?.project_scope}
              onChange={(e) =>
                handleInputChange("project_scope", e.target.value)
              }
              required
              type="text"
              placeholder="e.g. “Living room + kitchen renovation”"
              className="w-full  p-[2px] "
              rootCls="mb-4 max-w-[420px]"
              errorMsg={interiorInformationErrors.project_scope}
            />
            <CustomInput
              label="Special Requirements (eco-friendly, child-safe, etc.)"
              labelCls="text-black text-[14px] font-medium "
              name="special_requirements"
              value={interior_info?.special_requirements}
              onChange={(e) =>
                handleInputChange("special_requirements", e.target.value)
              }
              type="text"
              placeholder="eco-friendly, child-safe, etc."
              className="w-full p-[2px]"
              rootCls="mb-4 max-w-[420px]"
              errorMsg={interiorInformationErrors.special_requirements}
            />
          </div>
          <div className="w-full flex md:flex-row flex-col items-start md:gap-10 gap-5 mb-6">
            {/* Reference images */}
            <div className="md:basis-[60%] w-full">
              <ImageFileUploader
                name="Reference images"
                type="file"
                folderName="customBuilder/propimages"
                label="  Reference images"
                labelCls="text-black text-[14px] font-medium mb-4 block"
                onFileChange={(data) => {
                  handleInputChange("reference_images", data);
                }}
                initialFileUrl={interior_info?.reference_images}
              />
            </div>
            {/* Color scheme */}
            <div className="w-full h-[180px] basis-[40%] flex flex-col">
              <label className="text-black text-[14px] font-medium mb-4 block ">
                Color Scheme
              </label>
              <div className="w-full h-36 py-1 flex flex-col rounded-[6px] bg-white shadow-md  ">
                <div className="flex items-center justify-between px-4 py-2 ">
                  <p className="text-black text-[14px] font-medium ">
                    Colors
                  </p>
                  <Button
                    className="h-[30px] w-[30px] rounded-full font-medium bg-[#3B82F6]/10 flex justify-center items-center"
                    onClick={() => {
                      setOpenModal(true);
                    }}
                    size="sm"
                  >
                    <MdAdd className="h-5 w-5 text-[#3B82F6]" />
                  </Button>
                </div>
                {interior_info?.color_scheme?.length !== 0 ? (
                  <div className="w-full flex flex-col gap-2 items-center px-4 overflow-y-auto mb-2 over">
                    {interior_info?.color_scheme?.map((item, index) => (
                      <div
                        className="w-full grid grid-cols-3 items-center border-[2px] border-gray-200 py-2 px-2 rounded-[6px]"
                        key={index}
                      >
                        <p className="text-[14px] font-medium">
                          {item?.label}
                        </p>
                        <div
                          className="w-[100px] h-[25px] rounded-[6px]"
                          style={{ backgroundColor: item?.color }}
                        ></div>
                        <div className="flex justify-end px-2 gap-2">
                          <MdDelete
                            className="w-4 h-5 text-[#3B82F6] cursor-pointer"
                            onClick={() => handleColorDelete(index)}
                          />
                          <MdEdit
                            className="w-4 h-5 text-[#3B82F6] cursor-pointer"
                            onClick={() => handleColorEdit(index)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-[16px] text-center font-medium">
                    No colors added
                  </p>
                )}
              </div>
              <Modal
                isOpen={openModal}
                closeModal={() => setOpenModal(false)}
                className="max-w-[320px] max-h-[700px] relative"
                isCloseRequired={false}
              >
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-400 hover:text-gray-500 absolute top-2 right-2"
                >
                  <IoClose className="h-6 w-6 text-[#3B82F6]" />
                </button>
                <div className="flex flex-col gap-2 items-center">
                  <div className="w-full">
                    <CustomInput
                      label="Place"
                      labelCls="text-black text-[14px] font-medium mb-3"
                      name="place"
                      value={colorScheme?.label}
                      onChange={(e) =>
                        handleColorChange("label", e.target.value)
                      }
                      type="text"
                      placeholder="Kitchen, cupboard, etc."
                      className="w-full p-[6px]"
                      rootCls="mb-4"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-black text-[14px] font-medium mb-2 block">
                      Color Scheme
                    </label>
                    <SketchPicker
                      color={colorScheme?.color}
                      onChangeComplete={(color) =>
                        handleColorChange("color", color.hex)
                      }
                      className="bg-transparent shadow-none "
                    />
                  </div>
                  <div className="w-full flex justify-between mt-3">
                    <Button
                      className=" px-[15px] py-[7px] border-[#3B82F6] text-white bg-gray-300 rounded-md text-[16px]"
                      onClick={() => setOpenModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className=" px-[20px] py-[7px] bg-[#3B82F6] text-white rounded-md text-[16px]"
                      onClick={handleColorSave}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          </div>

          <CustomInput
            label="Additional Details"
            labelCls="text-black text-[14px] font-medium mb-3"
            name="additional_details"
            placeholder="Additional details"
            value={interior_info?.additional_details}
            onChange={(e) =>
              handleInputChange("additional_details", e.target.value)
            }
            type="textarea"
            className="w-full p-[12px]"
            rootCls="mb-4"
            errorMsg={interiorInformationErrors.additional_details}
          />
        </div>
        {/* Submit button */}
        <div className="flex justify-end my-6 ">
          <Button
            className="px-5 md:py-[6px] py-1 text-[12px] md:text-[14px] bg-[#3B82F6] text-white font-medium  md:rounded-[8px] rounded-[6px]"
            onClick={handlePropSave}
          >
            Save Details
          </Button>
        </div>
      </div>
      {/* Floors info */}
      <div className="w-full shadow-custom px-5 py-6 mt-6">
        <div className="font-medium text-[18px] flex flex-row gap-2 mb-4">
          <FaBuilding className="text-[#3586FF] " />
          <p className="font-bold md:text-[16px] text-[14px] text-[#3586FF] ">
            {" "}
            Floor Information
          </p>
        </div>
        <div>
          <div>
            <FloorDetails />
          </div>
          <div className="flex justify-end mt-3">
            <Button
              onClick={submitFloorDetails}
              className="cursor-pointer px-5 md:py-[6px] py-1 text-[12px] md:text-[14px] font-medium text-white bg-[#3B82F6] max-w-[200px] rounded-md"
            >
              Save Floors
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteriorInfo;
