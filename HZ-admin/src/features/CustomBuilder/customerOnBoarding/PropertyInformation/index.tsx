import React, { useEffect, useState } from "react";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import Loader from "@/src/common/Loader";
import InteriorInfo from "./Interior-info";
import HouseConstruction from "./HouseConstruction";
import CommercialConstruction from "./CommercialConstruction";
import Modal from "@/src/common/Modal";
import { IoClose } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";
import Button from "@/src/common/Button";
import { useRouter } from "next/router";
import { MdAddHome, MdApartment, MdStorefront, MdLocalHotel, MdLocalHospital } from "react-icons/md";
import { FaHome, FaBuilding, FaCouch, FaHouseUser, FaHardHat } from "react-icons/fa";
import { HiOfficeBuilding } from "react-icons/hi";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { validateCustomerOnboarding } from "../CustomerOnBoardingvalidations";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";

const constructionTypeOptions = [
  { name: "Residential", icon: <FaHome className="text-[20px]" /> },
  { name: "Commercial", icon: <FaBuilding className="text-[20px]" /> },
];

const propertyTypeOptions = [
  { name: "Apartment", icon: <MdApartment className="text-[20px]" /> },
  { name: "Villas", icon: <FaHouseUser className="text-[20px]" /> },
  { name: "Independent House", icon: <FaHome className="text-[20px]" /> },
];

const commercialTypeOptions = [
  { name: "Showroom", icon: <MdStorefront className="text-[20px]" /> },
  { name: "Hotel", icon: <MdLocalHotel className="text-[20px]" /> },
  { name: "Hospital", icon: <MdLocalHospital className="text-[20px]" /> },
  { name: "Commercial Building", icon: <HiOfficeBuilding className="text-[20px]" /> },
];

const constructionScopeOptions = [
  { name: "House", label: "Construction", icon: <FaHardHat className="text-[20px]" /> },
  { name: "Interior", label: "Interiors", icon: <FaCouch className="text-[20px]" /> },
];

type PendingChange = {
  field: "construction_type" | "construction_scope";
  value: string;
};

const EMPTY_HOUSE_INFO = {
  total_area: null,
  adjacent_roads: null,
  length: null,
  width: null,
  land_facing: "",
  total_floors: null,
  gate_side: "",
  additional_details: "",
  staircase_gate: "",
  propertyImages: [],
  additionOptions: [],
  floors: [],
};

const EMPTY_INTERIOR_INFO = {
  project_scope: "",
  style_preference: "",
  color_scheme: [],
  budget: null,
  total_area: null,
  total_floors: null,
  totalFloors: null,
  special_requirements: "",
  reference_images: [],
  additional_details: "",
  additionOptions: [],
  floors: [],
};

const EMPTY_COMMERCIAL_INFO = {
  commercial_type: "",
  total_area: null,
  total_floors: null,
  basement_floors: null,
  parking_floors: null,
  land_facing: "",
  gate_side: "",
  length: null,
  width: null,
  height: null,
  adjacent_roads: null,
  elevator_required: false,
  number_of_elevators: null,
  central_ac_required: false,
  fire_safety_required: false,
  parking_required: false,
  parking_capacity: null,
  generator_backup_required: false,
  generator_capacity_kva: null,
  water_treatment_required: false,
  sewage_treatment_required: false,
  propertyImages: [],
  additionOptions: [],
  additional_details: "",
  zoning_info: null,
};

const EMPTY_SERVICES = {
  selectedServices: [],
  serviceDetails: {
    borewells: null,
    document_drafting: null,
    centring: null,
    flooring: null,
    plumbing: null,
    painting: null,
    electricity: null,
    fallCeiling: null,
    brickMasonry: null,
    interiorService: null,
    hvac: null,
    fire_safety: null,
    elevator: null,
    glazing_facade: null,
    parking_infra: null,
    signage: null,
  },
};

const MODAL_CONFIG = {
  construction_type: {
    title: "Change Construction Type?",
    message:
      "This will permanently clear all property type details, construction information, and selected services from both the form and the server.",
    items: [
      "Property type / Commercial type selection",
      "All construction details (dimensions, floors, etc.)",
      "All selected services and their configurations",
      "Previously saved data on the server will also be reset",
    ],
  },
  construction_scope: {
    title: "Change Construction Scope?",
    message:
      "This will permanently clear all construction details for the current scope from both the form and the server.",
    items: [
      "All construction details (dimensions, floors, etc.)",
      "Property images and additional options",
      "Previously saved data on the server will also be reset",
    ],
  },
};

const PropertyInfo = () => {
  const {
    customerOnboarding,
    updatePropertyInformation,
    updatePropertyInfoErrors,
    updateServicesRequired,
    propertyInformationErrors,
    setCustomBuilderID,
  } = useCustomBuilderStore();
  const { propertyInformation } = customerOnboarding;
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.userId) {
      const userId = router.query.userId as string;
      if (userId) setCustomBuilderID(userId);
    }
  }, [router.isReady, router.query.userId]);

  const construction_scope = propertyInformation?.construction_scope;
  const construction_type = propertyInformation?.construction_type;

  const handleInputChange = (name: string, value: string | number) => {
    updatePropertyInformation({ [name]: value });
    clearErrors(name);
  };

  const clearErrors = (name: string) => {
    if (propertyInformationErrors[name]) {
      const updatedErrors = { ...propertyInformationErrors };
      delete updatedErrors[name];
      updatePropertyInfoErrors(updatedErrors);
    }
  };

  const getOptionValue = (
    val: string | { name: string }
  ): string => (typeof val === "object" ? val.name : val);

  const handleConstructionTypeSelect = (val: string | { name: string }) => {
    const newType = getOptionValue(val);
    if (newType === construction_type) return;
    if (!construction_type) {
      handleInputChange("construction_type", newType);
      return;
    }
    setPendingChange({ field: "construction_type", value: newType });
  };

  const handleScopeSelect = (val: string | { name: string }) => {
    const newScope = getOptionValue(val);
    if (newScope === construction_scope) return;
    setPendingChange({ field: "construction_scope", value: newScope });
  };

  const confirmChange = async () => {
    if (!pendingChange) return;
    setIsSwitching(true);

    const propertyId = propertyInformation?.id;
    const isAlreadySaved = Boolean(propertyId);

    if (pendingChange.field === "construction_type") {
      const newType = pendingChange.value;
      const newScope = construction_scope || "House";

      updatePropertyInformation({
        construction_type: newType,
        property_type: "",
        commercial_property_type: "",
        house_construction_info: { ...EMPTY_HOUSE_INFO } as any,
        commercial_construction_info: { ...EMPTY_COMMERCIAL_INFO } as any,
        interior_info:
          newScope === "Interior"
            ? propertyInformation.interior_info
            : ({ ...EMPTY_INTERIOR_INFO } as any),
      });
      updateServicesRequired(EMPTY_SERVICES as any);

      if (isAlreadySaved) {
        try {
          await apiClient.patch(
            `${apiClient.URLS.custom_property}/${propertyId}`,
            {
              construction_type: newType,
              propertyName: propertyInformation.propertyName,
              property_type: "",
              commercial_property_type: "",
              construction_scope: newScope.toLowerCase(),
              houseConstructionInfo: null,
              commercialConstructionInfo: null,
              interiorInfo: newScope === "Interior" ? undefined : null,
            },
            true
          );
          toast.success("Construction type updated");
        } catch (err) {
          console.error("Failed to update construction type on server:", err);
          toast.error("Local changes saved. Server update failed — save again to sync.");
        }
      }
    }

    if (pendingChange.field === "construction_scope") {
      const newScope = pendingChange.value as "House" | "Interior";
      const isCommercial = construction_type === "Commercial";

      if (newScope === "Interior") {
        updatePropertyInformation({
          construction_scope: "Interior",
          house_construction_info: { ...EMPTY_HOUSE_INFO } as any,
          commercial_construction_info: { ...EMPTY_COMMERCIAL_INFO } as any,
          interior_info: { ...EMPTY_INTERIOR_INFO } as any,
        });
      } else {
        updatePropertyInformation({
          construction_scope: "House",
          interior_info: { ...EMPTY_INTERIOR_INFO } as any,
          house_construction_info: { ...EMPTY_HOUSE_INFO } as any,
          commercial_construction_info: { ...EMPTY_COMMERCIAL_INFO } as any,
        });
      }

      if (isAlreadySaved) {
        try {
          await apiClient.patch(
            `${apiClient.URLS.custom_property}/${propertyId}`,
            {
              construction_type: construction_type,
              propertyName: propertyInformation.propertyName,
              property_type: propertyInformation.property_type,
              commercial_property_type: propertyInformation.commercial_property_type,
              construction_scope: newScope.toLowerCase(),
              houseConstructionInfo: null,
              commercialConstructionInfo: null,
              interiorInfo: null,
            },
            true
          );
          toast.success("Construction scope updated");
        } catch (err) {
          console.error("Failed to update construction scope on server:", err);
          toast.error("Local changes saved. Server update failed — save again to sync.");
        }
      }
    }

    setIsSwitching(false);
    setPendingChange(null);
  };

  const modalConfig = pendingChange
    ? MODAL_CONFIG[pendingChange.field]
    : null;

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col md:gap-4 gap-2">
      <div className="w-full shadow-custom border rounded-md bg-white md:px-10 px-3 md:py-8 py-4">
        <div className="font-bold md:text-[18px] text-[16px] flex flex-row gap-2 md:mb-4 mb-2">
          <MdAddHome className="text-[#3586FF]" />
          <p className="text-[14px] md:text-[18px] text-[#3586FF]">
            Property Information
          </p>
        </div>

        <div className="max-w-[360px] mb-4">
          <CustomInput
            label="Property Name"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            placeholder="Enter Property Name"
            className="md:px-2 px-2 py-[2px] md:rounded-md font-regular rounded-[4px] md:text-[14px] text-[12px]"
            onChange={(e) => handleInputChange("propertyName", e.target.value)}
            type="text"
            name="propertyName"
            required={true}
            value={propertyInformation?.propertyName}
            errorMsg={propertyInformationErrors?.propertyName}
          />
        </div>

        <div>
          <SelectBtnGrp
            options={constructionTypeOptions}
            label="Construction Type"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            required
            defaultValue={construction_type}
            btnClass="mb-4 md:px-5 px-3 md:py-3 py-2 md:rounded-lg rounded-md font-medium md:text-[14px] text-[12px]"
            error={propertyInformationErrors?.construction_type}
            className="flex flex-row gap-3"
            onSelectChange={handleConstructionTypeSelect}
          />

          {construction_type === "Residential" && (
            <SelectBtnGrp
              options={propertyTypeOptions}
              label="Property Type"
              labelCls="md:text-[14px] text-[12px] font-medium text-black"
              required
              error={propertyInformationErrors?.property_type}
              defaultValue={propertyInformation?.property_type}
              onSelectChange={(val) =>
                handleInputChange("property_type", getOptionValue(val as any))
              }
              btnClass="mb-4 md:px-5 px-3 md:py-3 py-2 md:rounded-lg rounded-md font-medium md:text-[14px] text-[12px]"
              className="flex flex-row md:gap-3 gap-2"
            />
          )}

          {construction_type === "Commercial" && (
            <SelectBtnGrp
              options={commercialTypeOptions}
              label="Commercial Type"
              labelCls="md:text-[14px] text-[12px] font-medium text-black"
              required
              error={propertyInformationErrors?.commercial_property_type}
              defaultValue={propertyInformation?.commercial_property_type}
              onSelectChange={(val) =>
                handleInputChange(
                  "commercial_property_type",
                  getOptionValue(val as any)
                )
              }
              btnClass="mb-4 md:px-5 px-3 md:py-3 py-2 md:rounded-lg rounded-md font-medium md:text-[14px] text-[12px]"
              className="flex flex-row md:gap-3 gap-2 flex-wrap"
            />
          )}

          <SelectBtnGrp
            options={constructionScopeOptions}
            label="Construction Scope"
            labelCls="md:text-[14px] text-[12px] font-medium text-black"
            required
            error={propertyInformationErrors?.construction_scope}
            defaultValue={construction_scope}
            onSelectChange={handleScopeSelect}
            btnClass="mb-4 md:px-5 px-3 md:py-3 py-2 md:rounded-lg rounded-md font-medium md:text-[14px] text-[12px]"
            className="flex flex-row md:gap-3 gap-2"
          />

          {construction_scope === "House" &&
            construction_type !== "Commercial" && <HouseConstruction />}
          {construction_scope === "House" &&
            construction_type === "Commercial" && <CommercialConstruction />}
          {construction_scope === "Interior" && <InteriorInfo />}
        </div>
      </div>

      <Modal
        isOpen={!!pendingChange}
        closeModal={() => setPendingChange(null)}
        className="md:max-w-[420px] max-w-[310px] max-h-[450px] md:ml-0 ml-3 relative"
        isCloseRequired={false}
      >
        {modalConfig && (
          <div className="z-20 relative">
            <Button
              onClick={() => setPendingChange(null)}
              className="text-gray-400 hover:text-gray-500 absolute -top-5 right-0"
            >
              <IoClose className="md:h-6 h-5 md:w-6 w-5 text-[#3B82F6] bg-gray-300 rounded-md" />
            </Button>

            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <IoWarningOutline className="text-amber-500 text-xl" />
              </div>
              <p className="md:text-[15px] text-[13px] font-semibold text-gray-800 text-center">
                {modalConfig.title}
              </p>
            </div>

            <p className="md:text-[13px] text-[11px] text-gray-600 text-center mb-3">
              {modalConfig.message}
            </p>

            <ul className="mb-5 space-y-1.5 px-2">
              {modalConfig.items.map((item, i) => (
                <li
                  key={i}
                  className="md:text-[12px] text-[10px] text-gray-500 flex items-start gap-2"
                >
                  <span className="text-red-400 mt-0.5">&#x2022;</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center px-3">
              <Button
                className="md:px-[14px] px-[8px] md:py-[6px] py-1 text-[12px] md:text-[14px] rounded-md border-gray-300 border text-gray-700 font-medium hover:bg-gray-50"
                onClick={() => setPendingChange(null)}
                disabled={isSwitching}
              >
                Cancel
              </Button>
              <Button
                className="md:px-[12px] px-[6px] md:py-[6px] py-1 text-[12px] md:text-[14px] rounded-md bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50"
                onClick={confirmChange}
                disabled={isSwitching}
              >
                {isSwitching ? "Updating..." : "Yes, Change"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PropertyInfo;
