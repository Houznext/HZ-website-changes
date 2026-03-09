import React from "react";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import Button from "@/common/Button";
import Drawer from "@/common/Drawer";
import ConstructionStatus from "./construction-status";
import AboutProjectDetails from "./aboutProject";
import ProjectAmenities from "./amenitiesProject";
import CompanyBasicDetails from "./companyBasicDetails";
import CompanyFloorDetails from "./floorDetails";
import CompanyBrouchers from "./companyBrouchers";
import toast from "react-hot-toast";
import apiClient from "@/utils/apiClient";
import { validateProjectErrors } from "./projecthelper";
import ProjectLocation from "./projectLocations";
import CompanyMedia from "./companyMedia";
import _, { min } from "lodash";
import Loader from "@/components/Loader";
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

  const getChangedFields = (
    original: any,
    updated: any
  ): Record<string, any> => {
    return _.reduce(
      updated,
      (result: Record<string, any>, value, key) => {
        if (!_.isEqual(value, original[key])) {
          result[key] = value;
        }
        return result;
      },
      {} as Record<string, any>
    );
  };

  const handleProjectSubmit = async () => {
    const validationErrors = validateProjectErrors({ project, setErrors });

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill in the required fields.");
      return;
    }

    const changedFields = getChangedFields(originalProjectDetails, project);

    const payload = {
      id: project?.id,
      Name: project?.Name,
      Description: project?.Description,
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
        subLocality: project?.location?.subLocality || null,
        landmark: project?.location?.landmark || null,
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
      },
      propertyType: {
        typeName: project?.propertyType?.typeName,
        description: project?.propertyType?.description || "",
        additionalAttributes: project?.propertyType?.additionalAttributes || "",
        units:
          project?.propertyType?.units?.map((unit) => ({
            BHK: unit.BHK || "",
            plotSize: ["Plot", "AgriculturalLand"].includes(
              project?.propertyType?.typeName ?? ""
            )
              ? {
                size: unit.plotSize?.size ?? 0,
                unit: unit.plotSize?.unit ?? "sq.ft",
              }
              : undefined, // omit instead of sending null
            flatSize: !["Plot", "AgriculturalLand"].includes(
              project?.propertyType?.typeName ?? ""
            )
              ? {
                size: unit.flatSize?.size ?? 0,
                unit: unit.flatSize?.unit ?? "sq.ft",
              }
              : undefined,
            flooringPlans:
              unit.flooringPlans?.map((floor) => {
                const flooringPlanObj: any = {
                  floorplan: floor.floorplan || "",
                  TotalPrice: floor.TotalPrice || 0,
                  pricePerSft: floor.pricePerSft || 0,
                  emiStartsAt: Number(floor.emiStartsAt) || 0,
                };

                if (
                  !["Plot", "AgriculturalLand"].includes(
                    project?.propertyType?.typeName ?? ""
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
    setLoading(true);
    try {
      if (selectedProjectIndex !== null && project?.id) {
        const response = await apiClient.patch(
          `${apiClient.URLS.companyonboarding}/projects/${project?.id}`,
          changedFields
        );
        if (response.status === 200) {
          updateProject(selectedProjectIndex, response.body);
          setLoading(false);
          toast.success("Project updated successfully");
        }
      } else {
        const response = await apiClient.post(
          `${apiClient.URLS.companyonboarding}/${companyId}/projects`,
          payload
        );
        if (response.status === 201) {
          addProject(response.body);
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
        panelCls="w-[100%] sm:w-[95%] lg:w-[calc(100%-190px)] shadow-xl "
      >
        <div className="relative w-full h-full flex flex-col max-w-[1440px] gap-3 md:ml-[0px] ml-[10px] ">
          <p className="md:text-[20px]  font-medium text-[#3586FF] md:px-10 md:py-[10px] px-4 py-2 text-[12px] ">
            Add Project Details of a Company
          </p>
          <section className="md:px-5 px-3 py-5 rounded-md shadow-custom mb-10 bg-gray-100">
            <div className="bg-white shadow-custom rounded-md ">
              <CompanyBasicDetails />
            </div>
            <div className="bg-white shadow-custom rounded-md px-5 py-5 mb-5">
              <ProjectLocation />
            </div>
            <div className="bg-white shadow-custom rounded-md p-5 mb-5">
              <p className="md:text-[18px] text-[16px] font-medium text-[#3586FF]">
                Units
              </p>
              <CompanyFloorDetails />
            </div>

            <div className="bg-white shadow-custom rounded-md mt-6">
              <ConstructionStatus />
            </div>
          </section>
          <section className="px-5 py-5 rounded-md shadow-custom mb-10 bg-gray-100">
            <div className="bg-white shadow-custom rounded-md px-5 py-5 mb-4">
              <CompanyMedia />
            </div>
            <div className="bg-white shadow-custom rounded-md px-5 py-5">
              <CompanyBrouchers />
            </div>
            <div className="flex flex-col gap-3 mt-4 bg-white shadow-custom rounded-md">
              <AboutProjectDetails />
            </div>
            <div className="bg-white shadow-custom rounded-md mt-10">
              <ProjectAmenities />
            </div>

            {/* <div className="bg-white shadow-custom rounded-md mt-10">
              <ProjectSellers />
            </div> */}
            <div className="bg-white shadow-custom rounded-md mt-10">
              <ProjectFAQs />
            </div>
          </section>

          <section className="mb-10 md:px-4 px-6">
            <div className="flex flex-row justify-between items-center">
              <Button
                onClick={handleDrawerClose}
                className="mt-5 md:px-10 md:py-[10px] px-5 py-[6px] md:text-[16px] text-[14px] border-[#3586FF] border-[1px] text-black hover:bg-blue-200 hover:text-white rounded-md font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProjectSubmit}
                className="mt-5 md:px-10 md:py-[10px] bg-[#3586FF] px-5 py-[6px] md:text-[16px] text-[14px] text-white rounded-md font-medium"
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
