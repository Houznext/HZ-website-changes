import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Button from "@/common/Button";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import Image from "next/image";
import { FiHome } from "react-icons/fi";
import { FaCity, FaBuilding, FaBed, FaCouch } from "react-icons/fa";
import { MdBusiness, MdSquareFoot, MdWeekend } from "react-icons/md";
import { GiResize } from "react-icons/gi";
import { useRouter } from "next/router";

const ProjectList = () => {
  const {
    projects,
    selectProjectForEditing,
    deleteProject,
    setModalState,
    companyId,
    setOriginalProjectDetails,
  } = useCompanyPropertyStore();
  const router = useRouter();


  return (
    <div className="w-full  md:px-0 px-1  py-4">
      {projects.length > 0 ? (
        <div className="flex flex-col md:gap-5 gap-3">
          {projects.map((project, index) => (
            <div
              key={index}
              className="flex md:flex-row flex-col md:flex-wrap lg:flex-nowrap items-center justify-between  bg-white shadow-custom  py-5 px-6 rounded-md gap-8"
            >
              <div className="flex md:flex-row flex-col  md:flex-wrap lg:flex-nowrap items-center gap-y-3">
                <div className=" relative md:w-[180px] w-[230px] md:h-[150px] h-[120px] flex items-center gap-3">
                  <Image
                    src={
                      project.mediaDetails.propertyImages[0] ||
                      "/images/TopProperties/property4.png"
                    }
                    alt={project.Name}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 md:grid-cols-4  md:gap-10 gap-4 md:ml-[30px] ml-0">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <p>
                          <FiHome className="md:text-[16px] text-[12px] font-medium text-gray-900" />
                        </p>
                        <p className="md:text-[16px] text-[12px] font-medium text-gray-500">
                          ProjectName
                        </p>
                      </div>

                      <div className="md:text-[16px] text-[10px] font-medium text-gray-900">
                        {project.Name}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <p>
                          <FaCity className="md:text-[16px] text-[12px] font-medium text-gray-900" />
                        </p>
                        <p className=" md:text-[16px] text-[12px] font-medium text-gray-500">
                          City
                        </p>
                      </div>

                      <div className="md:text-[16px] text-[10px] font-medium text-gray-900">
                        {project.location.city}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <p>
                          <FaBuilding className="md:text-[16px] text-[12px] font-medium text-gray-900" />
                        </p>
                        <p className=" md:text-[16px] text-[12px] font-medium text-gray-500">
                          Property Type
                        </p>
                      </div>

                      <div className="md:text-[16px] text-[10px] font-medium text-gray-900">
                        {project?.propertyType?.typeName}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <p>
                          <MdSquareFoot className="md:text-[16px] text-[12px] font-medium text-gray-900" />
                        </p>
                        <p className=" md:text-[16px] text-[12px] font-medium text-gray-500">
                          Build-up Area
                        </p>
                      </div>

                      <div className="md:text-[16px] text-[10px] font-medium text-gray-900">
                        {project.ProjectArea?.size} {project.ProjectArea?.unit}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <p>
                          <FaBed className="md:text-[16px] text-[12px] font-medium text-gray-900" />
                        </p>
                        <p className=" md:text-[16px] text-[12px] font-medium text-gray-500">
                          BHK
                        </p>
                      </div>

                      <div className="md:text-[16px] text-[10px] font-medium text-gray-900">
                        {project?.propertyType?.units?.[0]?.BHK}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center md:gap-2 gap-1">
                        <p>
                          <GiResize className="md:text-[16px] text-[12px] font-medium text-gray-900" />
                        </p>
                        <p className=" md:text-[16px] text-[12px] font-medium text-gray-500">
                          Project Size
                        </p>
                      </div>

                      <div className="md:text-[16px] text-[10px] font-medium text-gray-900">
                        {project.ProjectSize?.size} {project.ProjectSize?.unit}
                      </div>
                    </div>
                  </div>
                  <div className="max-w-[20%] flex items-center justify-center w-full">
                    <Button
                      className="md:px-5 px-3 md:py-2 py-1 rounded-[4px] md:text-[14px] text-[12px] font-medium text-nowrap text-white bg-[#3586FF]"
                      onClick={() => router.push(`/user/company-property/${companyId}/edit/${project?.id}/leads`)}
                    >
                      View Leads
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex  md:text-[16px] text-[12px] md:ml-0 ml-7  items-center justify-center gap-x-[16px] gap-y-[8px] ">
                <Button
                  onClick={() => {
                    selectProjectForEditing(index);
                    setModalState({ property: true });
                    setOriginalProjectDetails({ ...projects[index] });
                  }}
                  className="md:px-5 px-3 py-2 bg-[#3586FF] text-white hover:bg-blue-700 rounded-md flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </Button>
                <Button
                  onClick={() => deleteProject(index)}
                  className="md:px-5 px-3 py-2 bg-red-500 text-white rounded-md flex items-center gap-2"
                >
                  <FaTrash /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[20px] text-center font-semibold text-[#3586FF]">
          No Projects Added
        </p>
      )}
    </div>
  );
};

export default ProjectList;
