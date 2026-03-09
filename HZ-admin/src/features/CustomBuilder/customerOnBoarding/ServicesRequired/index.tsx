import React, { useState, useMemo } from "react";
import { SearchIcon } from "../../Icons";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import {
  restrictedServiceCategories,
  serviceCategories,
  commercialServiceCategories,
  commercialInteriorServiceCategories,
  ServiceTypes,
} from "../../helper";
import { FaTools } from "react-icons/fa";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import CustomInput from "@/src/common/FormElements/CustomInput";
import MultiCheckbox from "@/src/common/FormElements/MultiCheckbox";
import Button from "@/src/common/Button";
import DocumentDrafting from "../ServicesComponent/documentDrafting";
import BrickMasonry from "../ServicesComponent/brickMasonry";
import ElectricCityLines from "../ServicesComponent/electricCityLines";
import Painting from "../ServicesComponent/painting";
import Flooring from "../ServicesComponent/flooring";
import Borewells from "../ServicesComponent/borewells";
import Plumbing from "../ServicesComponent/plumbing";
import FallCeiling from "../ServicesComponent/fallceiling";
import Centring from "../ServicesComponent/centring";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Interior from "../ServicesComponent/interior";
import CommercialServiceForm from "../ServicesComponent/commercialService";
import CityPackage from "./CityPackage";
import Modal from "@/src/common/Modal";

const ServicesRequired = () => {
  const {
    customerOnboarding,
    updateServicesRequired,
    custom_builder_id,
    clearServiceDetails,
  } = useCustomBuilderStore();

  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState<string | null>(null);
  const [nextSelectedServices, setNextSelectedServices] = useState<string[]>([]);

  const { servicesRequired, propertyInformation } = customerOnboarding;
  const { serviceType, selectedServices } = servicesRequired;
  const isEditing = Boolean(servicesRequired?.id);

  const handleSearchChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const handleDropdownSelect = (selectedValue: string) => {
    if (!selectedServices.includes(selectedValue)) {
      const updatedServices = [...selectedServices, selectedValue];
      updateServicesRequired({ selectedServices: updatedServices });
      setSearchValue("");
    }
  };

  const deleteServiceDetails = async (serviceKey: string) => {
    const serviceDetail = customerOnboarding.servicesRequired.serviceDetails[serviceKey];

    try {
      if (serviceDetail && serviceDetail.id) {
        const response = await apiClient.delete(`${apiClient.URLS[serviceKey]}/${custom_builder_id}`,true);
        if (response.status === 200) {
          toast.success("Service removed successfully");
        }
      } else {
        // If not saved, no need to call API
        toast.success("Service removed successfully");
      }
      clearServiceDetails(serviceKey);
    } catch (error) {
      console.error("Error deleting service", error);
      toast.error("Failed to remove service");
    }
  };


  const handleDelete = async () => {
    if (!serviceToRemove) return;

    await deleteServiceDetails(serviceToRemove);
    updateServicesRequired({ selectedServices: nextSelectedServices });

    if (activeTab === serviceToRemove) {
      setActiveTab("");
    }

    setServiceToRemove(null);
    setNextSelectedServices([]);
    setOpenDeleteModal(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        serviceType: servicesRequired.serviceType,
        selectedServices: servicesRequired.selectedServices,
        package: servicesRequired.package,
      };

      const response = isEditing
        ? await apiClient.patch(`${apiClient.URLS.cb_services}/${servicesRequired?.id}`, payload,true)
        : await apiClient.post(`${apiClient.URLS.cb_services}/${custom_builder_id}`, payload,true);

      if (response.status === 200 || response.status === 201) {
        toast.success(isEditing ? "Service updated successfully" : "Service saved successfully");
      }
    } catch (error) {
      console.log("Error occurred while saving service", error);
      toast.error("Error occurred while saving service");
    }
  };

  const isCommercial = propertyInformation?.construction_type === "Commercial";
  const isInterior = propertyInformation?.construction_scope === "Interior";

  const availableServices = useMemo(() => {
    if (isCommercial) {
      return isInterior
        ? commercialInteriorServiceCategories
        : commercialServiceCategories;
    }
    return isInterior ? restrictedServiceCategories : serviceCategories;
  }, [isCommercial, isInterior]);

  const filteredServices = availableServices.filter((service) =>
    service.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleServiceChange = (value: string[]) => {
    const removedServices = selectedServices?.filter((s) => !value.includes(s));

    if (removedServices?.length > 0) {
      const serviceKey = removedServices[0];
      const serviceDetail = customerOnboarding.servicesRequired.serviceDetails[serviceKey];

      if (serviceDetail || serviceDetail?.id) {
        setServiceToRemove(serviceKey);
        setNextSelectedServices(value);
        setOpenDeleteModal(true);
      } else {
        // No saved data → remove directly without modal
        updateServicesRequired({ selectedServices: value });
        clearServiceDetails(serviceKey);
        if (activeTab === serviceKey) {
          setActiveTab("");
        }
      }
    } else {
      updateServicesRequired({ selectedServices: value });
    }
  };


  return (
    <div className="flex flex-col shadow-custom rounded-md border md:px-10 px-3 md:py-8 py-5 md:gap-4 gap-2">
      <div className="font-medium md:text-[18px] text-[14px] flex flex-row md:gap-2 gap-1 mb-2 md:mb-4">
        <FaTools className="text-[#3586FF] " />
        <p className="font-medium md:text-[16px] text-[14px] text-[#3586FF] ">
          Services required
        </p>
      </div>

      <SelectBtnGrp
        options={ServiceTypes}
        label="Services Type"
        labelCls="md:text-[14px] text-[12px] font-medium text-black"
        required
        defaultValue={servicesRequired?.serviceType}
        btnClass="md:mb-4 mb-2 md:px-5 px-3 md:py-1 py-1 rounded-md"
        className="flex flex-row gap-1 font-medium md:text-[14px] text-[12px] !text-[#636B70]"
        onSelectChange={(value: "Packages" | "Customized") =>
          updateServicesRequired({ serviceType: value })
        }
      />

      <div className="md:mb-10 mb-5">
        {serviceType === "Customized" ? (
          <>
            <div className="relative">
              <CustomInput
                label="Services Categories"
                type="text"
                leftIcon={<SearchIcon />}
                labelCls="text-black md:text-[14px] text-[12px] font-medium md:mb-3 mb-2"
                value={searchValue}
                placeholder="Enter services categories"
                rootCls="md:max-w-[520px] max-w-[250px]"
                className="py-1"
                onChange={handleSearchChange}
                name="total_area"
              />
              {searchValue && (
                <ul className="border absolute top-[70px] rounded-md md:max-w-[520px] max-w-[250px] bg-white shadow-md md:mt-2 mt-1">
                  {filteredServices.map((service) => (
                    <li
                      key={service.value}
                      onClick={() => handleDropdownSelect(service.value)}
                      className="md:px-4 px-2 md:py-2 py-1 cursor-pointer hover:bg-gray-100"
                    >
                      {service.label}
                    </li>
                  ))}
                  {filteredServices.length === 0 && (
                    <li className="md:px-4 px-2 md:py-2 py-1 text-gray-500">
                      No services found
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="mt-10">
              <MultiCheckbox
                label="Select Services You Need"
                options={availableServices}
                selectedValues={selectedServices}
                labelCls="text-black md:text-[16px] text-[12px] font-medium my-3"
                ClassName="md:h-5 h-3 md:w-5 w-3"
                onChange={handleServiceChange}
              />
            </div>

            <div className="w-full flex items-center justify-end py-5">
              <Button
                onClick={handleSave}
                className="md:px-5 md:py-1 px-3 py-1 font-medium btn-txt bg-[#3B82F6] text-white rounded-[6px]"
              >
                Save service
              </Button>
            </div>

            <div className="md:mb-10 mb-5 md:mt-6 mt-3 ml-3 w-full overflow-x-auto">
              <div className="flex flex-row md:gap-2 gap-1 mb-3">
                {selectedServices?.map((service) => (
                  <Button
                    key={service}
                    onClick={() => setActiveTab(service)}
                    className={`md:px-4 py-1 px-3 md:py-2 max-md:text-nowrap rounded-md text-[14px] md:text-[16px] font-medium ${activeTab === service
                      ? "bg-[#3586FF] text-white"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {service.charAt(0).toUpperCase() +
                      service.slice(1).split("_").join(" ")}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              {activeTab === "document_drafting" && <DocumentDrafting />}
              {activeTab === "borewells" && <Borewells />}
              {activeTab === "centring" && <Centring />}
              {activeTab === "brick_masonry" && <BrickMasonry />}
              {activeTab === "electricity" && <ElectricCityLines />}
              {activeTab === "painting" && <Painting />}
              {activeTab === "Flooring" && <Flooring />}
              {activeTab === "plumbing" && <Plumbing />}
              {activeTab === "fall_ceiling" && <FallCeiling />}
              {activeTab === "interior_service" && <Interior />}
              {activeTab === "hvac" && (
                <CommercialServiceForm serviceKey="hvac" title="HVAC Systems" />
              )}
              {activeTab === "fire_safety" && (
                <CommercialServiceForm serviceKey="fire_safety" title="Fire Safety Systems" />
              )}
              {activeTab === "elevator" && (
                <CommercialServiceForm serviceKey="elevator" title="Elevator Installation" />
              )}
              {activeTab === "glazing_facade" && (
                <CommercialServiceForm serviceKey="glazing_facade" title="Glazing & Facade" />
              )}
              {activeTab === "parking_infra" && (
                <CommercialServiceForm serviceKey="parking_infra" title="Parking Infrastructure" />
              )}
              {activeTab === "signage" && (
                <CommercialServiceForm serviceKey="signage" title="Signage & Branding" />
              )}
            </div>
          </>
        ) : (
          <CityPackage handleSave={handleSave} />
        )}
      </div>

      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[330px]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 z-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="md:text-[20px] text-center w-full text-[16px] font-bold text-gray-900">
              Confirm Deletion
            </h3>
          </div>
          <p className="md:text-sm text-center mx-auto max-w-[300px] text-[12px] text-gray-500 mb-4">
            Are you sure you want to remove this service? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-center space-x-3 ">
            <Button
              className="md:h-[40px] h-[35px] md:px-[28px] font-medium px-[14px] md:text-[16px] text-[12px] rounded-md border-2 bg-gray-100 hover:bg-gray-200  text-gray-700"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>

            <Button
              className="h-[40px] md:px-[28px] px-[14px] md:text-[16px] text-[12px] rounded-md font-medium border-2 bg-red-600 text-white"
              onClick={handleDelete}
              size="sm"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServicesRequired;
