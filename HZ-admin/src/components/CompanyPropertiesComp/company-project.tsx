import React from "react";
import { normalizeProject, useCompanyPropertyStore } from "@/src/stores/companyproperty";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import ConstructionStatus from "./construction-status";
import AboutProjectDetails from "./aboutProject";
import ProjectAmenities from "./amenitiesProject";
import CompanyBasicDetails from "./companyBasicDetails";
import CompanyFloorDetails from "./floorDetails";
import CompanyBrouchers from "./companyBrouchers";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import { validateProjectErrors } from "./projecthelper";
import ProjectLocation from "./projectLocations";
import CompanyMedia from "./companyMedia";
import _, { min } from "lodash";
import Loader from "@/src/common/Loader";
import ProjectSellers from "./ProjectSellers";
import ProjectFAQs from "./faqs";
const CompanyProjects = () => {
  const {
    companyId,
    selectedProjectIndex,
    updateProject,
    setErrors,
    projects,
    projectDetails,
    modalState,
    setModalState,
    addProject,
    resetSelectedProject,
    setOriginalProjectDetails,
    originalProjectDetails,
  } = useCompanyPropertyStore();

  const project =
    selectedProjectIndex !== null
      ? projects[selectedProjectIndex]
      : projectDetails;
  const [loading, setLoading] = React.useState(false);

  const handleDrawerClose = () => {
    setModalState({ property: false });
    resetSelectedProject();
  };

  const getChangedFields = (original: any, updated: any) => {
    return _.reduce(
      updated,
      (result, value, key) => {
        if (!_.isEqual(value, original[key])) {
          result[key] = value;
        }
        return result;
      },
      {}
    );
  };
  const mergeUnitsIntoResponse = (serverProject: any, localProject: any, existingProject: any) => {
  return {
     ...existingProject,   
    ...serverProject,
     sellers: Array.isArray(serverProject?.sellers)
      ? serverProject.sellers
      : (existingProject?.sellers ?? []),
    propertyType: {
      ...(serverProject?.propertyType || {}),
      units: localProject?.propertyType?.units || [],
    },
  };
};


  const handleProjectSubmit = async () => {
    const validationErrors = validateProjectErrors({ project, setErrors });

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill in the required fields.");
      return;
    }

    const payload = {
      Name: project?.Name,
      Description: project?.Description,
      isBrokerage: project?.isBrokerage ?? true,
      ProjectArea: {
        size: project?.ProjectArea?.size ?? 0,
        unit: project?.ProjectArea?.unit ?? "sq.ft",
      },
      ProjectSize: {
        size: project?.ProjectSize?.size ?? 0,
        unit: project?.ProjectSize?.unit ?? "sq.ft",
      },
      MinSize: {
        size: project?.MinSize?.size ?? 0,
        unit: project?.MinSize?.unit ?? "sq.ft",
      },
      minPrice: project?.minPrice,
      maxPrice: project?.maxPrice,
      MaxSize: {
        size: project?.MaxSize?.size ?? 0,
        unit: project?.MaxSize?.unit ?? "sq.ft",
      },
      Specifications: project?.Specifications,
      Highlights: project?.Highlights,
      AboutProject: project?.AboutProject,
      ProjectAmenities: project?.ProjectAmenities,
      Brochure: project?.Brochure || [],
      faqs: project?.faqs || [],
      location: {
        city: project?.location?.city || "",
        state: project?.location?.state || "",
        street: project?.location?.street || "",
        locality: project?.location?.locality || "",
        subLocality: project?.location?.subLocality || "",
        landmark: project?.location?.landmark || "",
        latitude: String(project?.location?.latitude || ""),
        longitude: String(project?.location?.longitude || ""),
        place_id: String(project?.location?.place_id || ""),
        zipCode: project?.location?.zipCode || "",
        country: "India",
      },

      mediaDetails: project?.mediaDetails || {
        propertyImages: [],
        propertyVideo: [],
      },
      constructionStatus: project?.constructionStatus || {
        status: "",
        possessionBy: null,
        ageOfProperty: null,
        possessionYears: null,
        launchedDate: null,
      },
      propertyType: {
        typeName: project?.propertyType?.typeName,
        description: project?.propertyType?.description || "",
        additionalAttributes: project?.propertyType?.additionalAttributes || "",
        units:
          project?.propertyType?.units?.map((unit) => ({
            id: unit.id,
            BHK: unit.BHK || "",
            plotSize: ["Plot", "AgriculturalLand"].includes(
              project?.propertyType?.typeName
            )
              ? {
                  size: unit.plotSize?.size ?? 0,
                  unit: unit.plotSize?.unit ?? "sq.ft",
                }
              : undefined, // omit instead of sending null
            flatSize: !["Plot", "AgriculturalLand"].includes(
              project?.propertyType?.typeName
            )
              ? {
                  size: unit.flatSize?.size ?? 0,
                  unit: unit.flatSize?.unit ?? "sq.ft",
                }
              : undefined,
            flooringPlans:
              unit.flooringPlans?.map((floor) => {
                const flooringPlanObj: any = {
                  id: floor.id,
                  // floorplan: floor.floorplan || "",
                  floorplan: Array.isArray(floor.floorplan) ? floor.floorplan : [],

                  TotalPrice: Number(floor.TotalPrice) || 0,
                  pricePerSft: Number(floor.pricePerSft) || 0,
                  emiStartsAt: floor.emiStartsAt
                    ? Number(floor.emiStartsAt)
                    : null,
                };

                if (
                  !["Plot", "AgriculturalLand"].includes(
                    project?.propertyType?.typeName
                  )
                ) {
                  flooringPlanObj.BuiltupArea = {
                    size: floor.BuiltupArea?.size ?? 0,
                    unit: floor.BuiltupArea?.unit ?? "sq.ft",
                  };
                }

                return flooringPlanObj;
              }) || [],
          })) || [],
      },
    };
    const changedFields = payload;
    setLoading(true);
    try {
      if (selectedProjectIndex !== null && project?.id) {
        const response = await apiClient.patch(
          `${apiClient.URLS.company_Onboarding}/projects/${project?.id}`,
          changedFields,
          true
        );
        if (response.status === 200) {
          // updateProject(selectedProjectIndex, response.body);
          // updateProject(selectedProjectIndex, normalizeProject(response.body));
           const existing = projects[selectedProjectIndex]; 
           const merged = mergeUnitsIntoResponse(response.body, project,existing);
  updateProject(selectedProjectIndex, merged);

          setLoading(false);
          toast.success("Project updated successfully");
        }
      } else {
        const response = await apiClient.post(
          `${apiClient.URLS.company_Onboarding}/${companyId}/projects`,
          payload,
          true
        );
        if (response.status === 201) {
          // addProject(response.body);
          // addProject(normalizeProject(response.body));
           const merged = mergeUnitsIntoResponse(response.body, project, project);
  addProject(merged);

          setLoading(false);
          toast.success("Project added successfully");
        }
      }
      handleDrawerClose();
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading(false);
      toast.error("Error occurred while submitting the project");
    }
  };
  if (loading) {
    return (
      <div className="w-full">
        <Loader />
      </div>
    );
  }
  return (
    <div className="flex w-full  rounded-md">
      <Drawer
        open={modalState.property}
        handleDrawerToggle={handleDrawerClose}
        panelCls="w-[100%] sm:w-[95%] lg:w-[calc(100%-340px)] shadow-xl "
      >
        <div className="relative w-full h-full flex flex-col max-w-[1440px] gap-3 px-1 md:px-6 md:ml-[0px] ml-[10px] ">
          <p className="md:text-[20px]  font-medium text-[#3586FF]  md:px-10 md:py-[10px] px-4 py-2 text-[12px] ">
            Add Project Details of a Company
          </p>
          <section className="md:px-5 px-2 py-5  md:space-y-6 space-y-3 rounded-md shadow-custom mb-10 bg-gray-100">
            <div className="bg-white shadow-custom rounded-md ">
              <CompanyBasicDetails />
            </div>
            <div className="bg-white shadow-custom rounded-md md:px-5 px-3 md:py-5 py-3 ">
              <ProjectLocation />
            </div>
            <div className="bg-white shadow-custom rounded-md md:p-5 p-3 ">
              <p className="md:text-[18px] text-[16px] font-medium text-[#3586FF] ">
                Units
              </p>
              <CompanyFloorDetails />
            </div>

            <div className="bg-white shadow-custom rounded-md ">
              <ConstructionStatus />
            </div>
          </section>
          <section className="md:px-5 px-3 md:py-5 py-3 md:space-y-6 space-y-3 rounded-md shadow-custom mb-10 bg-gray-100">
            <div className="bg-white shadow-custom rounded-md px-5 py-5 ">
              <CompanyMedia />
            </div>
            <div className="bg-white shadow-custom rounded-md md:px-5 px-3 md:py-5 py-3">
              <CompanyBrouchers />
            </div>
            <div className="flex flex-col gap-3 md:mt-4 mt-2 bg-white shadow-custom rounded-md">
              <AboutProjectDetails />
            </div>
            <div className="bg-white shadow-custom rounded-md ">
              <ProjectAmenities />
            </div>

            <div className="bg-white shadow-custom rounded-md ">
              <ProjectSellers />
            </div>
            <div className="bg-white shadow-custom rounded-md ">
              <ProjectFAQs />
            </div>
          </section>

          <section className="sticky bottom-0 bg-white border-t border-gray-200  md:py-3 py-1 shadow-inner mb-10 md:px-4 px-2">
            <div className="flex flex-row justify-between items-center">
              <Button
                onClick={handleDrawerClose}
                className="mt-5 md:py-[6px] py-1 md:px-4 px-2 btn-text border-[#5297ff] border-[1px] text-black hover:bg-blue-200 hover:text-white rounded-md font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProjectSubmit}
                className="mt-5 md:py-[6px] py-1 md:px-4 px-2  bg-[#5297ff] btn-text text-white rounded-md font-medium"
              >
                Submit
              </Button>
            </div>
          </section>
        </div>
      </Drawer>
    </div>
  );
};

export default CompanyProjects;
