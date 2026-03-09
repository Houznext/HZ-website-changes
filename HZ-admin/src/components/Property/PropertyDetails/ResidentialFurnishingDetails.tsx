import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import usePostPropertyStore, { Furnishing } from "@/src/stores/postproperty";
import React, { useState } from "react";
import {
  flatFurnishings,
  furnitureTypes,
  furnitureTypesEnum,
  societyAmenities,
} from "./PropertyHelpers";
import { FurnishingItem } from "./PropertyDetails";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";

const ResidentialFurnishingDetails =({
  errors,
  setErrors,
}: {
  errors: any;
  setErrors: any;
}) => {
  const propertyDetails = usePostPropertyStore(
    (state) => state.getProperty().propertyDetails
  );
  const setPropertyDetails = usePostPropertyStore(
    (state) => state.setPropertyDetails
  );
  const property = usePostPropertyStore((state) =>
    state.getProperty().getProperty()
  );
  const [amenitiesModal, setAmenitiesModal] = useState(false);

  const handleChange = (key: keyof Furnishing, value: any) => {
    const updatedPropertyDetails = {
      ...propertyDetails,
      furnishing: {
        ...propertyDetails?.furnishing,
        [key]: value,
      },
    };

    if (key === "furnishedType") {
      if (value === furnitureTypesEnum.Unfurnished) {
        setAmenitiesModal(false);
        updatedPropertyDetails.furnishing.amenities = [];
        updatedPropertyDetails.furnishing.furnishings = [];
      } else if (
        value === furnitureTypesEnum.Furnished ||
        value === furnitureTypesEnum.SemiFurnished
      ) {
        setAmenitiesModal(true);
      }
    }

    setPropertyDetails({
      ...property,
      propertyDetails: { ...updatedPropertyDetails },
    });
  };

  const toggleFurnishing = (item: FurnishingItem) => {
    let updatedFurnishings = [
      ...(propertyDetails?.furnishing?.furnishings || []),
    ];

    if (updatedFurnishings.some((f) => f === item.name)) {
      updatedFurnishings = updatedFurnishings.filter((f) => f !== item.name);
    } else {
      updatedFurnishings = [...updatedFurnishings, item.name];
    }

    handleChange("furnishings", updatedFurnishings);
  };
  

  const isFurnished = (type?: furnitureTypesEnum): boolean => {
    return (
      type === furnitureTypesEnum.Furnished ||
      type === furnitureTypesEnum.SemiFurnished 
    //   ||
    // type === furnitureTypesEnum.Unfurnished
    );
  };

  const toggleAmenity = (item: FurnishingItem) => {
    let updatedAmenities = [...(propertyDetails?.furnishing?.amenities || [])];

    if (updatedAmenities.some((f) => f === item.name)) {
      updatedAmenities = updatedAmenities.filter((f) => f !== item.name);
    } else {
      updatedAmenities = [...updatedAmenities, item.name];
    }

    handleChange("amenities", updatedAmenities);
  };

  const selectedFurnishingsCount = propertyDetails?.furnishing?.furnishings?.length || 0;
  const selectedAmenitiesCount = propertyDetails?.furnishing?.amenities?.length || 0;
  const totalSelected = selectedFurnishingsCount + selectedAmenitiesCount;

  return (
    <>
      <SelectBtnGrp
        options={furnitureTypes}
        label="Furnishing Type"
        required
         defaultValue={propertyDetails?.furnishing?.furnishedType}
        labelCls="text-[13px] md:text-[14px] text-slate-700 font-medium mb-2"
        className="gap-2 flex flex-wrap"
        btnClass="text-[12px] font-medium rounded-lg px-4 py-2 border border-slate-200 hover:border-[#3586FF] transition-colors"
        onSelectChange={(value) =>
          handleChange(
            "furnishedType",
            typeof value === "object" && value && "name" in value
              ? value.name
              : value
          )
        }
        slant={false}
      />
      {isFurnished(propertyDetails?.furnishing?.furnishedType as any) && (
        <div className="mt-3">
          <button
            type="button"
            className="flex items-center gap-2 text-[13px] md:text-[14px] font-medium text-[#3586FF] hover:text-[#2d75e6] transition-colors"
            onClick={() => setAmenitiesModal(true)}
          >
            <span className="w-5 h-5 rounded-full bg-[#3586FF] text-white text-xs flex items-center justify-center">+</span>
            Add Furnishings / Amenities
            {totalSelected > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-[#3586FF] text-xs rounded-full font-semibold">
                {totalSelected} selected
              </span>
            )}
          </button>

          {amenitiesModal && (
            <Modal
              isOpen={amenitiesModal}
              closeModal={() => setAmenitiesModal(false)}
              className="max-w-[95vw] md:max-w-[700px] lg:max-w-[800px] rounded-xl"
              isCloseRequired={true}
              rootCls="z-[9999]"
            >
              <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="mb-5">
                  <h2 className="text-lg md:text-xl font-bold text-[#3586FF]">
                    Select Furnishings & Amenities
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Choose what's available in your property
                  </p>
                </div>

                {/* Flat Furnishings Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm md:text-[15px] font-semibold text-slate-700">
                      Flat Furnishings
                    </h3>
                    {selectedFurnishingsCount > 0 && (
                      <span className="text-xs text-[#3586FF] font-medium">
                        {selectedFurnishingsCount} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 md:gap-2">
                    {flatFurnishings.map((item, index) => {
                      const isSelected = propertyDetails?.furnishing?.furnishings?.some(
                        (f) => f === item.name
                      );
                      return (
                        <div
                          key={index}
                          onClick={() => toggleFurnishing(item)}
                          className={`
                            flex flex-col items-center justify-center p-2 md:px-2.5 rounded-lg cursor-pointer
                            transition-all duration-150 border
                            ${isSelected
                              ? "bg-[#3586FF] border-[#3586FF] text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-[#3586FF] hover:bg-blue-50"
                            }
                          `}
                        >
                          <div className={`text-[12px] md:text-[14px] mb-1 ${isSelected ? "text-white" : "text-slate-600"}`}>
                            {item.icon}
                          </div>
                          <p className="text-[9px] md:text-[10px] font-medium text-center leading-tight">
                            {item.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Society Amenities Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm md:text-[15px] font-semibold text-slate-700">
                      Society Amenities
                    </h3>
                    {selectedAmenitiesCount > 0 && (
                      <span className="text-xs text-[#3586FF] font-medium">
                        {selectedAmenitiesCount} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-1.5 md:gap-2">
                    {societyAmenities.map((item, index) => {
                      const isSelected = propertyDetails?.furnishing?.amenities?.some(
                        (f) => f === item.name
                      );
                      return (
                        <div
                          key={index}
                          onClick={() => toggleAmenity(item)}
                          className={`
                            flex flex-col items-center justify-center p-2 md:p-2.5 rounded-lg cursor-pointer
                            transition-all duration-150 border
                            ${isSelected
                              ? "bg-[#3586FF] border-[#3586FF] text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:border-[#3586FF] hover:bg-blue-50"
                            }
                          `}
                        >
                          <div className={`text-base md:text-lg mb-1 ${isSelected ? "text-white" : "text-slate-600"}`}>
                            {item.icon}
                          </div>
                          <p className="text-[9px] md:text-[10px] font-medium text-center leading-tight">
                            {item.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    className="flex-1 py-2.5 text-[13px] font-medium border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                    onClick={() => setAmenitiesModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 py-2.5 text-[13px] font-medium bg-[#3586FF] hover:bg-[#2d75e6] text-white rounded-lg transition-colors"
                    onClick={() => setAmenitiesModal(false)}
                  >
                    Save ({totalSelected} items)
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}
    </>
  );
};

export default ResidentialFurnishingDetails;
