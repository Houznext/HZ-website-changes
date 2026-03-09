import Button from "@/src/common/Button";
import React, { useEffect, useState } from "react";
import Table from "./tableComponent";
import { useCompanyPropertyStore } from "@/src/stores/companyproperty";
import { EditIcon } from "@/src/common/Icons";
import toast from "react-hot-toast";
import FloatingInput from "@/src/common/FloatingInput";
import Modal from "@/src/common/Modal";
import apiClient from "@/src/utils/apiClient";
import { IoClose } from "react-icons/io5";
import CustomInput from "@/src/common/FormElements/CustomInput";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import { LuTrash2, LuMoreVertical, LuTrophy } from "react-icons/lu";
import { FaEdit, FaTrash } from "react-icons/fa"

const CompanyAward = () => {
  const {
    companyDetails,
    companyId,
    modalState,
    setModalState,
    errors,
    setErrors,
    setCompanyDetails,
  } = useCompanyPropertyStore();

  const [newAward, setNewAward] = useState({
    awardTitle: "",
    awardCategory: "",
    issuingOrganization: "",
    yearReceived: null,
    description: "",
  });
  const { hasPermission, permissions } = usePermissionStore((state) => state);

  const [editaddIndex, setAddEditIndex] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [awardIndex, setAwardIndex] = useState<number | null>(null);
  const validateCompanyAward = (): boolean => {
    const newErrors: any = {};
    if (!newAward.awardTitle) {
      newErrors.awardTitle = "awardTitle is required";
    }
    if (!newAward.awardCategory) {
      newErrors.awardCategory = "awardCategory is required";
    }
    if (!newAward.issuingOrganization) {
      newErrors.issuingOrganization = " issuingOrganization is required";
    }
    if (!newAward.yearReceived) {
      newErrors.yearReceived = "  yearReceived is required";
    }
    if (!newAward.description) {
      newErrors.description = "description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditAward = (index: number) => {
    setAddEditIndex(index);
    setNewAward(companyDetails.awards[index]);
    setModalState({ awards: true });
  };

  const handleDeleteAward = (index: number) => {
    setOpenDeleteModal(true);
    setAwardIndex(index);
  };

  const handleDelete = async () => {
    if (!companyId) {
      toast.error("Please create a company first.");
      return;
    }

    const awardId = companyDetails.awards[awardIndex].id;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.company_awards}/${companyId}/${awardId}`,{}, true
      );
      if (res.status === 200) {
        const updatedAwards = companyDetails.awards.filter(
          (_, i) => i !== awardIndex
        );
        setCompanyDetails({ awards: updatedAwards });
        setOpenDeleteModal(false);
        setAwardIndex(null);
        toast.success("Award deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting award:", error);
      toast.error("Failed to delete award.");
    }
  };

  const handleAwardChange = (name: string, value: any) => {
    setNewAward((prev) => ({
      ...prev,
      [name]:
        name === "yearReceived" ? (value ? parseInt(value, 10) : "") : value,
    }));
  };

  const handleAwardSubmit = async () => {
    if (!companyId) {
      toast.error("Please create a company first.");
      return;
    }
    if (!validateCompanyAward()) {
      return;
    }

    try {
      let updatedAwards = [...companyDetails.awards];
      let res;

      if (editaddIndex !== null) {
        const awardId = updatedAwards[editaddIndex].id;
        res = await apiClient.patch(
          `${apiClient.URLS.company_awards}/${companyId}/${awardId}`,
          newAward, true
        );
        // updatedAwards[editaddIndex] = res.data;
        const updated = res.body ?? res.data ?? res; 
updatedAwards[editaddIndex] = updated;

        toast.success("Award updated successfully!");
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.company_awards}/${companyId}`,
          newAward, true
        );
        // updatedAwards.push(res.data);
       updatedAwards.push(res.body ?? res.data ?? res);

        toast.success("Award added successfully!");
      }

      setCompanyDetails({
        ...companyDetails,
        // awards: updatedAwards,
         awards: [...updatedAwards],
      });
      setNewAward({
        awardTitle: "",
        awardCategory: "",
        issuingOrganization: "",
        yearReceived: null,
        description: "",
      });
      setAddEditIndex(null);
      toast.success("Award added successfully!");
      setModalState({ awards: false });
    } catch (error) {
      console.error("Error submitting award:", error);
      toast.error("Failed to save award.");
    }
  };

  const renderAwardsModal = () => {
    return (
      <Modal
        isOpen={modalState.awards}
        closeModal={() => {
          setModalState({ awards: false });
          setNewAward({
            awardTitle: "",
            awardCategory: "",
            issuingOrganization: "",
            yearReceived: null,
            description: "",
          });
          setAddEditIndex(null);
        }}
        title={`${editaddIndex !== null ? "Edit" : "Add"} Award & Achievement`}
        titleCls="sub-heading font-semibold text-[#3586FF] text-center mb-4"
        isCloseRequired={false}
        className="md:max-w-[600px] max-w-[340px] rounded-xl"
      >
        <div className="flex flex-col gap-4 justify-center items-center max-w-[520px] mx-auto px-2">
          <CustomInput
            name="awardTitle"
            label="Award Title"
            type="text"
            placeholder="Enter Award Title"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            labelCls="label-text text-gray-700 font-medium"
            value={newAward?.awardTitle}
            required
            onChange={(e) => handleAwardChange("awardTitle", e.target.value)}
            errorMsg={errors.awardTitle}
          />
          <CustomInput
            name="awardCategory"
            label="Award Category"
            type="text"
            placeholder="Enter Award Category"
            labelCls="label-text text-gray-700 font-medium"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            value={newAward?.awardCategory}
            required
            onChange={(e) => handleAwardChange("awardCategory", e.target.value)}
            errorMsg={errors.awardCategory}
          />
          <CustomInput
            name="issuingOrganization"
            label="Issuing Organization"
            type="text"
            placeholder="Enter Issuing Organization"
            labelCls="label-text text-gray-700 font-medium"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            value={newAward?.issuingOrganization}
            onChange={(e) =>
              handleAwardChange("issuingOrganization", e.target.value)
            }
            required
            errorMsg={errors.issuingOrganization}
          />
          <CustomInput
            name="yearReceived"
            label="Year Received"
            type="number"
            value={newAward?.yearReceived}
            placeholder="Enter Year Received"
            labelCls="label-text text-gray-700 font-medium"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            onChange={(e) => handleAwardChange("yearReceived", e.target.value)}
            required
            errorMsg={errors.yearReceived}
          />
          <CustomInput
            name="description"
            label="Description"
            type="text"
            placeholder="Enter Description"
            labelCls="label-text text-gray-700 font-medium"
            className="w-full px-3  rounded-lg border-gray-200 focus:border-[#3586FF] focus:ring-1 focus:ring-[#3586FF] transition-all sublabel-text"
            value={newAward.description}
            onChange={(e) => handleAwardChange("description", e.target.value)}
            errorMsg={errors.description}
          />
          <div className="flex justify-end gap-3 mt-4 w-full">
            <Button
              onClick={() => setModalState({ awards: false })}
              className="px-5 py-2.5 btn-text bg-gray-100 hover:bg-gray-200 font-semibold text-gray-700 rounded-lg transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAwardSubmit}
              className="px-6 py-2.5 bg-[#3586FF] hover:bg-[#2563eb] btn-text font-semibold text-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              {editaddIndex !== null ? "Update" : "Add"} Award
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-[#3586FF]/5 to-transparent border-b border-gray-100">
        <div className="hidden md:block">
          <h3 className="sub-heading font-semibold text-[#3586FF]">
            Achievements & Awards
          </h3>
          <p className="sublabel-text text-gray-500 mt-0.5">
            Showcase your company's achievements and recognitions.
          </p>
        </div>
        <CustomTooltip
          label="Access Restricted Contact Admin"
          position="bottom"
          tooltipBg="bg-black/60 backdrop-blur-md"
          tooltipTextColor="text-white py-2 px-4 font-medium"
          labelCls="sublabel-text font-medium"
          showTooltip={!hasPermission("company", "create")}
        >
          <Button
            disabled={!hasPermission("company", "create")}
            className="bg-[#3586FF] hover:bg-[#2563eb] text-white btn-text font-semibold px-5 md:py-2 py-1 rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => setModalState({ ...modalState, awards: true })}
          >
            + Add Achievement
          </Button>
        </CustomTooltip>
        {renderAwardsModal()}
      </div>

      {/* Table */}
      <div className="p-5">
        <div className="overflow-auto rounded-lg border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 sticky top-0 z-10">
              <tr>
                {[
                  "Title",
                  "Category",
                  "Year Received",
                  "Issuing Organization",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="label-text text-center font-semibold text-gray-600 px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {companyDetails?.awards?.map((award: any, index: number) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/40 transition-colors"
                >
                  {[award?.awardTitle, award?.awardCategory, award?.yearReceived, award?.issuingOrganization].map((val, i) => (
                    <td
                      key={i}
                      className="px-4 py-3 sublabel-text font-medium text-center text-gray-700 max-w-[200px]"
                      title={val || ""}
                    >
                      <span className="block truncate">{val || "—"}</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <CustomTooltip
                        label="Access Restricted Contact Admin"
                        position="bottom"
                        tooltipBg="bg-black/60 backdrop-blur-md"
                        tooltipTextColor="text-white py-2 px-4 font-medium"
                        labelCls="sublabel-text font-medium"
                        showTooltip={!hasPermission("company", "edit")}
                      >
                        <Button
                          disabled={!hasPermission("company", "edit")}
                          onClick={() => handleEditAward(index)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#3586FF] sublabel-text font-medium transition-all"
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
                        showTooltip={!hasPermission("company", "delete")}
                      >
                        <Button
                          disabled={!hasPermission("company", "delete")}
                          onClick={() => handleDeleteAward(index)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 sublabel-text font-medium transition-all"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </CustomTooltip>
                    </div>
                  </td>
                </tr>
              ))}

              {(!companyDetails?.awards || companyDetails.awards.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <LuTrophy className="w-8 h-8 text-gray-300" />
                      <p className="sublabel-text text-gray-500">No awards added yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[450px] max-w-[340px] rounded-xl"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-red-50 text-red-500 rounded-full p-4">
            <LuTrash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            Confirm Deletion
          </h3>
          <p className="sublabel-text text-gray-500 text-center leading-relaxed">
            Are you sure you want to delete this award? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 mt-2 w-full">
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 py-2.5 btn-text font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
              onClick={() => handleDelete()}
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

export default CompanyAward;
