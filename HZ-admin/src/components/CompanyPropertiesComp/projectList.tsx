import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Button from "@/src/common/Button";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import Image from "next/image";
import { FiHome } from "react-icons/fi";
import { FaCity, FaBuilding, FaBed, FaCouch } from "react-icons/fa";
import { MdBusiness, MdDelete, MdSquareFoot, MdWeekend } from "react-icons/md";
import { GiResize } from "react-icons/gi";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import Modal from "@/src/common/Modal";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";


const ProjectList = () => {
  const {
    projects,
    selectProjectForEditing,
    deleteProject,
    setModalState,
    setOriginalProjectDetails,
    deleteProjectById
  } = useCompanyPropertyStore();
  const { hasPermission } = usePermissionStore((state) => state);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setDeleteModal(true);
  };

 const handleDeleteConfirm = async () => {
  if (deleteIndex === null) return;

  const project = projects[deleteIndex];
  const projectId = project?.id;

  if (!projectId) {
    toast.error("Project ID not found");
    return;
  }

  setLoading(true);
  try {
    // ✅ 1) delete in backend
    const res = await apiClient.delete(
      `${apiClient.URLS.company_Onboarding}/projects/${projectId}`,
      {},
      true
    );

    // ✅ 2) remove from zustand (UI update)
    deleteProjectById(projectId);

    toast.success("Project deleted successfully");
    setDeleteModal(false);
    setDeleteIndex(null);
  } catch (err: any) {
    console.error(err);
    toast.error(err?.message || "Failed to delete project");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full py-6">
      {projects.length > 0 ? (
        <div className="flex flex-col gap-4">
          {projects.map((project, index) => (
            <div
              key={index}
              className="flex flex-col lg:flex-row items-start lg:items-center justify-between 
                         bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md 
                         transition-all duration-300 p-5 md:p-6 gap-5"
            >
              <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap items-start gap-5 w-full lg:w-auto">
                {/* Project Image */}
                <div className="relative w-[180px] md:w-[160px] lg:w-[180px] h-[100px] md:h-[110px] rounded-xl overflow-hidden border border-gray-100">
                  <Image
                    src={
                      project.mediaDetails.propertyImages[0] ||
                      "/images/TopProperties/property4.png"
                    }
                    alt={project.Name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Project Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 md:ml-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <FiHome className="text-[#3586FF] w-4 h-4" />
                      <p className="sublabel-text text-gray-500 font-medium">
                        Project Name
                      </p>
                    </div>
                    <p className="label-text text-gray-800 font-semibold">
                      {project.Name}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <FaCity className="text-[#3586FF] w-4 h-4" />
                      <p className="sublabel-text text-gray-500 font-medium">
                        City
                      </p>
                    </div>
                    <p className="label-text text-gray-800 font-medium">
                      {project.location.city}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <FaBuilding className="text-[#3586FF] w-4 h-4" />
                      <p className="sublabel-text text-gray-500 font-medium">
                        Property Type
                      </p>
                    </div>
                    <p className="label-text text-gray-800 font-medium">
                      {project.propertyType.typeName}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <MdSquareFoot className="text-[#3586FF] w-4 h-4" />
                      <p className="sublabel-text text-gray-500 font-medium">
                        Build-up Area
                      </p>
                    </div>
                    <p className="label-text text-gray-800 font-medium">
                      {project.ProjectArea?.size} {project.ProjectArea?.unit}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <FaBed className="text-[#3586FF] w-4 h-4" />
                      <p className="sublabel-text text-gray-500 font-medium">
                        BHK
                      </p>
                    </div>
                    <p className="label-text text-gray-800 font-medium">
                      {project.propertyType.units?.[0]?.BHK || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <GiResize className="text-[#3586FF] w-4 h-4" />
                      <p className="sublabel-text text-gray-500 font-medium">
                        Project Size
                      </p>
                    </div>
                    <p className="label-text text-gray-800 font-medium">
                      {project.ProjectSize?.size} {project.ProjectSize?.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 w-full lg:w-auto">
                <CustomTooltip
                  label="Access Restricted Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="sublabel-text font-medium"
                  showTooltip={!hasPermission("project", "edit")}
                >
                  <Button
                    onClick={() => {
                      selectProjectForEditing(index);
                      setModalState({ property: true });
                      setOriginalProjectDetails({ ...projects[index] });
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#3586FF] btn-text font-medium transition-all"
                  >
                    <FaEdit className="w-3.5 h-3.5" /> Edit
                  </Button>
                </CustomTooltip>

                <CustomTooltip
                  label="Access Restricted Contact Admin"
                  position="bottom"
                  tooltipBg="bg-black/60 backdrop-blur-md"
                  tooltipTextColor="text-white py-2 px-4 font-medium"
                  labelCls="sublabel-text font-medium"
                  // showTooltip={!hasPermission("project", "delete")}
                >
                  <Button
                    // onClick={() => deleteProject(index)}
                     onClick={() => handleDeleteClick(index)}
                    // disabled={!hasPermission("project", "delete")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 btn-text font-medium transition-all"
                  >
                    <FaTrash className="w-3.5 h-3.5" /> Delete
                  </Button>
                </CustomTooltip>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <div className="bg-blue-50 rounded-full p-5 mb-4">
            <FiHome className="text-[#3586FF] w-8 h-8" />
          </div>
          <p className="text-lg font-semibold text-gray-700 text-center">
            No Projects Added Yet
          </p>
          <p className="sublabel-text text-gray-500 text-center max-w-md mt-1">
            Get started by adding your first project to showcase your properties.
          </p>
        </div>
      )}
      <Modal
        isOpen={deleteModal}
        closeModal={() => setDeleteModal(false)}
        className="md:max-w-[480px] max-w-[340px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-red-50 text-red-500 rounded-full p-4">
            <MdDelete size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">Confirm Delete</h3>
          <p className="sublabel-text text-gray-500 text-center leading-relaxed">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-2 w-full">
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              onClick={() => setDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2 transition-all"
              onClick={handleDeleteConfirm}
              size="sm"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;