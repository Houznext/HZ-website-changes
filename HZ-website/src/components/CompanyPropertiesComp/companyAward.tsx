import Button from "@/common/Button";
import React, { useEffect, useState } from "react";
import Table from "./tableComponent";
import { useCompanyPropertyStore } from "@/store/companyproperty";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
// import FloatingInput from "@/common/FloatingInput";
import Modal from "@/common/Modal";
import apiClient from "@/utils/apiClient";
import { IoClose } from "react-icons/io5";
import CustomInput from "@/common/FormElements/CustomInput";

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
    if (awardIndex === null) return;

    const awardId = companyDetails.awards[awardIndex].id;
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.companyonboarding}/${companyId}/${awardId}`
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
          newAward
        );
        updatedAwards[editaddIndex] = res.data;
        toast.success("Award updated successfully!");
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.company_awards}/${companyId}`,
          newAward
        );
        updatedAwards.push(res.data);
        toast.success("Award added successfully!");
      }

      setCompanyDetails({
        ...companyDetails,
        awards: updatedAwards,
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
  console.log(companyDetails?.awards)

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
        titleCls="mb-[40px] md:text-[24px] text-[16px] font-medium text-center"
        isCloseRequired={false}
        className="md:max-w-[800px] max-w-[300px]"
      >
        <div className="flex flex-col gap-6 justify-center items-center max-w-[500px] mx-auto">
          <CustomInput
            name="awardTitle"
            label="Award Title"
            type="text"
            placeholder="Enter Award Title"
            className="px-2 py-[6px] text-[14px] placeholder:text-[12px]"
            labelCls="md:text-[14px] text-[12px] font-medium "
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
            labelCls="md:text-[14px] text-[12px] font-medium "
            className="px-2 py-[6px] text-[14px] placeholder:text-[12px]"
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
            labelCls="md:text-[14px] text-[12px] font-medium "
            className="px-2 py-[6px] text-[14px] placeholder:text-[12px]"
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
            placeholder="Enter Year Received"
            labelCls="md:text-[14px] text-[12px] font-medium "
            className="px-2 py-[6px] text-[14px] placeholder:text-[12px]"
            onChange={(e) => handleAwardChange("yearReceived", e.target.value)}
            required
            errorMsg={errors.yearReceived}
          />
          <CustomInput
            name="description"
            label="Description"
            type="text"
            placeholder="Enter Description"
            labelCls="md:text-[14px] text-[12px] font-medium "
            className="px-2 py-[6px] text-[14px] placeholder:text-[12px]"
            value={newAward.description}
            onChange={(e) => handleAwardChange("description", e.target.value)}
            errorMsg={errors.description}
          />
          <div className="flex justify-end gap-3 mt-3">
            <Button
              onClick={() => setModalState({ awards: false })}
              className="px-5 py-2 bg-gray-300 text-black btn-text rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAwardSubmit}
              className="px-6 py-2 bg-[#3586FF] text-white btn-text rounded-md"
            >
              {editaddIndex !== null ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="shadow-custom px-5 py-4 rounded-md bg-white">
      <div className="flex justify-end">
        <Button
          className=" bg-[#3B82F6] md:px-10 md:py-[10px] px-4 py-2 text-[12px] md:text-[16px] text-white rounded-md font-medium"
          onClick={() => setModalState({ ...modalState, awards: true })}
        >
          + Add Achievements & Rewards
        </Button>
        {renderAwardsModal()}
      </div>

      <div className="mt-5 mb-5">
        <h3 className="md:text-lg text-[16px] font-medium mb-3">
          Achievements List
        </h3>
        <Table
          headers={[
            "Title",
            "Category",
            "Year Received",
            "Issuing Organization",
            "Actions",
          ]}
          data={companyDetails?.awards}
          renderRow={(award, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 md:text-[14px]  text-[10px] px-4 py-2">
                {award?.awardTitle}
              </td>
              <td className="border border-gray-300 md:text-[14px]  text-[10px] px-4 py-2">
                {award?.awardCategory}
              </td>
              <td className="border border-gray-300 md:text-[14px]  text-[10px] px-4 py-2">
                {award?.yearReceived}
              </td>
              <td className="border border-gray-300 md:text-[14px]  text-[10px] px-4 py-2">
                {award?.issuingOrganization}
              </td>
              <td className="border border-gray-300 md:text-[14px]  text-[10px] px-4 py-2 text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => handleEditAward(index)}
                    className="px-3 py-1 bg-[#3586FF] flex gap-[6px] items-center text-white rounded-md hover:bg-blue-700"
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAward(index)}
                    className="px-3 py-[6px] bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        className="md:max-w-[500px] max-w-[330px]"
        rootCls="flex items-center justify-center z-[9999]"
        isCloseRequired={false}
      >
        <div className="p-6 z-20 ">
          <div className="flex justify-between items-center mb-4">
            <h3 className="md:text-[20px] text-center w-full text-[14px]  font-medium text-gray-900">
              Confirm Deletion
            </h3>
          </div>
          <p className="md:text-sm text-center text-[12px] text-gray-500 mb-4">
            Are you sure you want to delete this address? This action cannot be
            undone.
          </p>
          <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
            <Button
              className="md:h-[50px] h-[35px] md:px-[28px] px-[14px] md:text-[16px] text-[12px] rounded-md border-2 bg-gray-100 hover:bg-gray-200  font-medium text-gray-700"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>

            <Button
              className="h-[50px] px-[28px] rounded-md border-2 bg-red-600 text-white"
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
