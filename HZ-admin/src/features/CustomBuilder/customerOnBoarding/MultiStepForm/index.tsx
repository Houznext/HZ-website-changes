import React, { useEffect, useState } from "react";
import ContactDetails from "../ContactDetails";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import PropertyInfo from "../PropertyInformation";
import ServicesRequired from "../ServicesRequired";
import Button from "@/src/common/Button";
import SummaryDetails from "../SummaryDetails";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import Loader from "@/src/common/Loader";
import Modal from "@/src/common/Modal";
import { useRouter } from "next/router";

const MultiStepForm = () => {
  const {
    onboardingSteps: steps,
    setOnboardingSteps,
    contactErrors,
    propertyInformationErrors,
    updateContactDetails,
    updatePropertyInformation,
    updateaddressDetails,
    custom_builder_id,
    updateFloorDetails,
    updateServicesRequired,
    updateCommercialConstructionInfo,
  } = useCustomBuilderStore();
  const [isLoading, setIsLoading] = useState(false);
  const [succesModal, setSuccessModal] = useState(false);
  const router = useRouter();
  const rendersteps = () => {
    if (steps === 0) {
      return <ContactDetails />;
    }
    if (steps === 1) {
      return <PropertyInfo />;
    }
    if (steps === 2) {
      return <ServicesRequired />;
    }
    if (steps == 3) {
      return <SummaryDetails />;
    }
  };
  const handleBack = () => {
    setOnboardingSteps(steps - 1);
  };
  const handleContinue = () => {
    if (steps == 0) {
      if (Object.keys(contactErrors).length === 0) {
        setOnboardingSteps(steps + 1);
      }
    } else if (steps == 1) {
      if (Object.keys(propertyInformationErrors).length == 0) {
        setOnboardingSteps(steps + 1);
      }
    } else if (steps == 2) {
      if (Object.keys(propertyInformationErrors).length == 0) {
        setOnboardingSteps(steps + 1);
      }
    } else if (steps === 3) {
      setSuccessModal(true);
    }
  };

  const fetchDetails = async () => {
    if (!custom_builder_id) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}`,{},true
      );
      console.log(" response", response);
      if (response.status === 200) {
        const data = response?.body?.customer;
        const locations = response?.body?.location;
        const contactdetails = {
          id: data?.id,
          first_name: data?.firstName,
          last_name: data?.lastName,
          mobile: data?.phone,
          email: data?.email,
          password: data?.password,
          confirmPassword: data?.password,
        };
        const addressDetails = {
          id: locations?.id,
          city: locations?.city,
          state: locations?.state,
          locality: locations?.locality,
          zipCode: locations?.zipCode,
          address_line_1: locations?.address_line_1,
          address_line_2: locations?.address_line_2,
        };
        updateaddressDetails(addressDetails);
        updateContactDetails(contactdetails);

        // Property information

        const propertyInformation = response.body?.propertyInformation;

        const isCommercial = propertyInformation?.construction_type === "Commercial";

        if (propertyInformation.construction_scope === "house") {
          if (isCommercial && propertyInformation?.commercial_construction_info) {
            const propertydetails = {
              id: propertyInformation?.id,
              construction_type: propertyInformation?.construction_type,
              propertyName: propertyInformation?.propertyName,
              property_type: propertyInformation?.property_type,
              commercial_property_type: propertyInformation?.commercial_property_type,
              construction_scope:
                propertyInformation?.construction_scope[0]?.toUpperCase() +
                propertyInformation?.construction_scope.slice(1),
              commercial_construction_info:
                propertyInformation?.commercial_construction_info,
            };
            updatePropertyInformation(propertydetails);
          } else {
            const propertydetails = {
              id: propertyInformation?.id,
              construction_type: propertyInformation?.construction_type,
              propertyName: propertyInformation?.propertyName,
              property_type: propertyInformation?.property_type,
              construction_scope:
                propertyInformation?.construction_scope[0]?.toUpperCase() +
                propertyInformation?.construction_scope.slice(1),
              interior_info: propertyInformation?.interior_info,
              house_construction_info: {
                total_area:
                  propertyInformation?.house_construction_info?.total_area,
                length: propertyInformation?.house_construction_info?.length,
                width: propertyInformation?.house_construction_info?.width,
                adjacent_roads:
                  propertyInformation?.house_construction_info?.adjacent_roads,
                land_facing:
                  propertyInformation?.house_construction_info?.land_facing,
                total_floors:
                  propertyInformation?.house_construction_info?.total_floors,
                gate_side:
                  propertyInformation?.house_construction_info?.gate_side,
                additionOptions:
                  propertyInformation?.house_construction_info?.additionOptions ||
                  [],
                staircase_gate:
                  propertyInformation?.house_construction_info?.staircase_gate,
                propertyImages:
                  propertyInformation?.house_construction_info?.propertyImages,
                additional_details:
                  propertyInformation?.house_construction_info
                    ?.additional_details,
                floors: [],
              },
            };

            updatePropertyInformation(propertydetails);

            const floors = propertyInformation?.house_construction_info?.floors;

            floors?.map((item, index) => {
              updateFloorDetails(index, {
                floor: item?.floor,
                portionDetails: item?.portionDetails,
                portions: item?.portions,
                ground_floor_details: item?.ground_floor_details,
                type_of_portions: item?.type_of_portions,
              });
            });
          }
        } else {
          const propertydetails = {
            id: propertyInformation?.id,
            construction_type: propertyInformation?.construction_type,
            property_type: propertyInformation?.property_type,
            construction_scope:
              propertyInformation?.construction_scope[0]?.toUpperCase() +
              propertyInformation?.construction_scope.slice(1),
            interior_info: {
              total_area: propertyInformation?.interior_info?.total_area,
              project_scope: propertyInformation?.interior_info?.project_scope,
              total_floors: propertyInformation?.interior_info?.totalFloors,
               totalFloors: propertyInformation?.interior_info?.totalFloors,
              style_preference:
                propertyInformation?.interior_info?.style_preference,
              color_scheme:
                propertyInformation?.interior_info?.color_scheme || [],
              budget: propertyInformation?.interior_info?.budget,
              special_requirements:
                propertyInformation?.interior_info?.special_requirements,
              reference_images:
                propertyInformation?.interior_info?.reference_images,
              additional_details:
                propertyInformation?.interior_info?.additional_details,
              floors: [],
              additionOptions:
                propertyInformation?.interior_info?.additionOptions || [],
            },
          };
          updatePropertyInformation(propertydetails);

          const floors = propertyInformation?.interior_info?.floors;

          floors?.map((item, index) => {
            updateFloorDetails(index, {
              floor: item?.floor,
              portionDetails: item?.portionDetails,
              portions: item?.portions,
              ground_floor_details: item?.ground_floor_details,
              type_of_portions: item?.type_of_portions,
            });
          });
        }

        const apiData = response?.body?.servicesRequired;

        const commercialDetails = apiData?.commercialServiceDetails || {};
        const servicesRequired = {
          id: apiData?.id,
          serviceType: apiData?.serviceType,
          selectedServices: apiData?.selectedServices ?? [],
          package: {
            city: apiData?.package?.city || addressDetails.city || null,
            state: apiData?.package?.state || addressDetails.state || null,
            packageSelected: apiData?.package?.packageSelected || null,
          },
          serviceDetails: {
            borewells: apiData?.borewells,
            document_drafting: apiData?.documentDrafting
              ? {
                id: apiData.documentDrafting.id,
                documentType: apiData?.documentDrafting.combinationTypes,
                additionalRequirement:
                  apiData?.documentDrafting.additionalRequirement,
              }
              : null,
            centring: apiData?.centring,
            flooring: apiData?.flooring,
            plumbing: apiData?.plumbing,
            painting: apiData?.painting,
            electricity: apiData?.electricity,
            fallCeiling: apiData?.fallCeiling,
            brickMasonry: apiData?.brickMasonry,
            interiorService: apiData?.interiorService,
            hvac: commercialDetails?.hvac || null,
            fire_safety: commercialDetails?.fire_safety || null,
            elevator: commercialDetails?.elevator || null,
            glazing_facade: commercialDetails?.glazing_facade || null,
            parking_infra: commercialDetails?.parking_infra || null,
            signage: commercialDetails?.signage || null,
          },
        };

        updateServicesRequired(servicesRequired);

        setIsLoading(false);
        toast.success("Details fetched successfully");
      }
    } catch (error) {
      console.log("error occured while fetching details", error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (custom_builder_id) {
      fetchDetails();
    }
  }, [custom_builder_id]);

  const handleSubmit = () => {
    router.push("/custom-builder");
    setSuccessModal(true);
  };

  const renderModal = () => {
    return (
      <Modal isOpen={succesModal} closeModal={() => setSuccessModal(false)} isCloseRequired={false}>
        <div className="flex flex-col items-center w-full">
          <h1 className="md:text-3xl text-[18px] font-bold mb-4">Success</h1>
          <p className="md:text-lg text-[14px] font-semibold mb-4">
            Your form has been submitted successfully.
          </p>
          <div className="flex items-center justify-between w-full">
            <Button
              className="border-[1px] border-gray-300 text-[#3586FF]  px-4 py-2 rounded-md"
              onClick={() => setSuccessModal(false)}
            >
              Close
            </Button>
            <Button
              className="bg-[#5297ff] text-white px-4 py-2 rounded-md"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      {renderModal()}
      <div>
        {rendersteps()}
      </div>
      <div>
        <div className="flex justify-between w-full mt-4 px-1 ">
          <div>
            {steps > 0 && (
              <Button
                onClick={handleBack}
                className="md:px-5 px-3 md:py-1 py-1 label-text  bg-[#3B82F6] text-white font-medium rounded-[6px]"
              >
                Back
              </Button>
            )}
          </div>
          <div>
            <Button
              onClick={handleContinue}
              className="md:px-5 px-3 md:py-[6px] py-1 label-text bg-[#3B82F6] text-white font-medium rounded-[6px]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepForm;
