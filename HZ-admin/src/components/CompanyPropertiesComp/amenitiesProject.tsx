import React, { useState } from "react";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import { amenitiesData } from "./projecthelper";
import Modal from "@/src/common/Modal";
import Button from "@/src/common/Button";

const ProjectAmenities = () => {
  const {
    projects,
    errors,
    projectDetails,
    setProjectDetails,
    selectedProjectIndex,
    updateProject,
  } = useCompanyPropertyStore();
  const [amenitiesModal, setAmenitiesModal] = useState(false);
  const project =
    selectedProjectIndex !== null
      ? projects[selectedProjectIndex]
      : projectDetails;

  const toggleAmenity = (amenityName: string) => {
    if (!project) return;

    const currentAmenities = project?.ProjectAmenities || [];
    const updatedAmenities = currentAmenities.includes(amenityName)
      ? currentAmenities.filter((item) => item !== amenityName)
      : [...currentAmenities, amenityName];

    if (selectedProjectIndex !== null) {
      updateProject(selectedProjectIndex, {
        ...project,
        ProjectAmenities: updatedAmenities,
      });
    } else {
      setProjectDetails({
        ...project,
        ProjectAmenities: updatedAmenities,
      });
    }
  };

  return (
    <div className="md:px-5 px-3 md:py-5 py-3 rounded-md shadow-custom">
      <p className="md:text-[20px] text-[16px] font-medium text-[#3586FF] ">
        Project Amenities
      </p>
      <div className="w-full flex justify-end">
        <Button
          className="md:text-[14px] text-[12px] font-medium  bg-[#5297ff] text-white px-3 py-2 rounded-md"
          onClick={() => {
            setAmenitiesModal(true);
          }}
        >
          + Add Project Amenities
        </Button>
      </div>
      <div>
        <div className="mt-5">
          {project?.ProjectAmenities?.length > 0 ? (
            <div className="flex flex-wrap gap-4 mb-5">
              {project.ProjectAmenities.map((selectedAmenity) => {
                const amenity = amenitiesData.find(
                  (item) => item.name === selectedAmenity
                );
                return (
                  <div
                    key={selectedAmenity}
                    className="flex flex-col  md:max-w-[120px] max-w-[80px] items-center justify-center w-full  md:p-3 p-2 border rounded-lg bg-blue-50 text-[#3586FF] "
                  >
                    <div className="md:text-3xl text-[16px]">
                      {amenity?.icon}
                    </div>
                    <p className="mt-2 text-center text-wrap md:text-sm text-[10px] font-medium">
                      {amenity?.name}
                    </p>
                  </div>
                );
              })}
              {errors?.ProjectAmenities && <p>{errors.ProjectAmenities}</p>}
            </div>
          ) : (
            <p className="text-gray-500  text-center font-medium md:text-[18px] text-[16px]">
              No amenities selected.
            </p>
          )}
        </div>
        {amenitiesModal && (
          <Modal
            isOpen={amenitiesModal}
            closeModal={() => setAmenitiesModal(false)}
            className="lg:max-w-[40%] max-w-[80%] py-10 rounded-md"
            isCloseRequired={false}
            rootCls="!z-[99999] !w-full"
          >
            <div className="flex flex-col gap-3">
              <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <p className="font-medium md:text-[16px] text-[12px] text-[#3586FF] ">
                    Select Amenities
                  </p>
                  <span className="text-[#3586FF]  bg-white border border-blue-200 rounded-full px-3 py-1 text-[10px] font-medium">
                    {project?.ProjectAmenities?.length || 0} selected
                  </span>
                </div>
              </div>
              <div className="flex flex-row flex-wrap  gap-4">
                {amenitiesData.map((item) => (
                  <div
                    key={item.name}
                    className={`flex flex-col items-center justify-center md:w-[120px] w-[80px] md:h-28 h-20 md:px-3 md:py-3 px-8 py-2 border rounded-lg cursor-pointer ${
                      project?.ProjectAmenities?.includes(item.name)
                        ? "bg-[#5297ff] text-white"
                        : "hover:text-gray-500"
                    }`}
                    onClick={() => toggleAmenity(item.name)}
                  >
                    <div className="md:text-3xl text-[12px] ">{item.icon}</div>
                    <p className="mt-2 text-center md:text-sm  text-[10px] text-wrap font-medium">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-row justify-between items-center">
                <Button
                  className="bg-gray-400 text-white px-5 py-2 rounded-md"
                  onClick={() => setAmenitiesModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#5297ff] text-white px-5 py-2 rounded-md"
                  onClick={() => setAmenitiesModal(false)}
                >
                  Save
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ProjectAmenities;
