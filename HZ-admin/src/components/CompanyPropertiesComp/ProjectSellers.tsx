import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import React, { useState } from "react";
import ProjectSellerForm from "./ProjectSellerForm";
import {
  SellerDetails,
  useCompanyPropertyStore,
} from "@/src/stores/companyproperty";
import { LuPhone, LuUser } from "react-icons/lu";
import { FaRegEnvelope } from "react-icons/fa";
import { BiRupee } from "react-icons/bi";
import Image from "next/image";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { IoMdMore } from "react-icons/io";
import Modal from "@/src/common/Modal";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";

const ProjectSellers = () => {
  const { projects, projectDetails, selectedProjectIndex, removeSeller } =
    useCompanyPropertyStore();
  const [opendrawer, setOpendrawer] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event, index: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSellerIndex(index);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // const [selectedSellerIndex, setSelectedSellerIndex] = useState<number>(null);
  const [selectedSellerIndex, setSelectedSellerIndex] = useState<number | null>(
    null,
  );

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // const project = projects[selectedProjectIndex];
  // const project =
  //   selectedProjectIndex !== null && projects?.length > 0
  //     ? projects[selectedProjectIndex]
  //     : null;
  const project =
  selectedProjectIndex !== null && projects?.length > 0
    ? { ...projects[selectedProjectIndex], sellers: projects[selectedProjectIndex]?.sellers ?? [] }
    : null;


  const handleEdit = () => {
    setOpendrawer(true);
  };

  const handleDelete = async () => {
    try {
      const sellerEmail = project.sellers[selectedSellerIndex]?.email;

      const response = await apiClient.delete(
        `${apiClient.URLS.company_Onboarding}/projects/delete-seller?projectId=${project.id}&email=${sellerEmail}`,{},
        true,
      );
      removeSeller(selectedProjectIndex, selectedSellerIndex);
      toast.success("Seller deleted successfully");
      setOpenDeleteModal(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete the seller");
    }
  };

  return (
    <div className="md:px-5 px-3 md:py-5 py-3 rounded-md shadow-custom">
      <div className="w-full flex justify-between items-start border-b pb-3">
        <p className="md:text-[18px] text-[16px] text-nowrap  font-medium text-[#3586FF] ">
          Project sellers
        </p>
        <Button
          className="md:text-[14px] text-[12px] font-medium  bg-[#5297ff] text-white px-3 py-2 rounded-md"
          onClick={() => {
            setOpendrawer(true);
            setSelectedSellerIndex(null);
          }}
        >
          + Add Project seller
        </Button>
      </div>

      <div className="w-full flex flex-col items-center mt-[48px] overflow-y-auto">
        {project?.sellers?.length > 0 ? (
          project?.sellers?.map((seller: SellerDetails, index: number) => {
            return (
              <div
                className="relative overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 w-full p-4 cursor-pointer"
                key={index}
              >
                <div className="flex md:flex-row flex-col gap-x-[48px] gap-y-[24px]">
                  <div className="md:w-[20%] w-[100%]">
                    <div className="flex flex-col items-center justify-center">
                      {/* <Image
                        src={seller.profile}
                        alt="profile pic"
                        height={150}
                        width={150}
                        className="rounded-[8px] object-cover"
                      /> */}
                      {seller?.profile ? (
                        <Image
                          src={seller.profile}
                          alt="profile pic"
                          height={150}
                          width={150}
                          className="rounded-[8px] object-cover"
                        />
                      ) : (
                        <Image
                          src="/images/default-avatar.png"
                          width={100}
                          height={100}
                          alt="Default"
                        />
                      )}
                    </div>
                  </div>

                  {/* Seller Details */}
                  <div className="w-[70%] flex flex-col gap-y-[8px] justify-evenly items-start">
                    <div className="md:col-span-9 grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <LuUser className="h-5 w-5" />
                          <span className="font-medium md:text-[16px] text-[12px]">
                            Name
                          </span>
                        </div>
                        <p className="text-base font-semibold text-gray-900  md:text-[16px] text-[12px]">
                          {seller.firstName} {seller.lastName}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FaRegEnvelope className="h-5 w-5" />
                          <span className="font-medium">Email</span>
                        </div>
                        <p className="text-base font-medium text-gray-900 break-all">
                          {seller.email}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <LuPhone className="h-5 w-5" />
                          <span className="font-medium">Phone</span>
                        </div>
                        <p className="text-base font-medium text-gray-900">
                          {seller.phone}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <BiRupee className="h-5 w-5" />
                          <span className="font-medium">Price range</span>
                        </div>
                        <p className="text-base font-medium text-gray-900">
                          {seller.priceRange}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Menu list for edit and delete */}
                <div className="absolute top-1 right-1">
                  {/* dropdown */}
                  <IconButton
                    id="More-button"
                    onClick={(event) => handleClick(event, index)}
                  >
                    <IoMdMore />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                  >
                    {/* <MenuItem
                      onClick={() => {
                        handleEdit();
                        handleClose();
                      }}
                      className="text-black font-medium text-[14px]"
                    >
                      Edit
                    </MenuItem> */}
                    <MenuItem
                      onClick={() => {
                        setSelectedSellerIndex(index);
                        setOpendrawer(true);
                        handleClose();
                      }}
                    >
                      Edit
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        handleClose();
                        setOpenDeleteModal(true);
                      }}
                      className="text-black font-medium text-[14px]"
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-[18px] font-medium text-gray-500">
            No sellers Assigned
          </p>
        )}
      </div>

      {opendrawer && (
        <div className="w-full">
          <Drawer
            open={opendrawer}
            handleDrawerToggle={() => setOpendrawer(false)}
            closeIconCls="text-black"
            openVariant="right"
            panelCls="w-[90%] sm:w-[95%] lg:w-[calc(100%-190px)] shadow-xl"
            overLayCls="bg-gray-700 bg-opacity-40"
          >
            <div className="flex flex-row justify-between items-center">
              <ProjectSellerForm
                setOpendrawer={setOpendrawer}
                selectedSellerIndex={selectedSellerIndex}
                setSelectedSellerIndex={setSelectedSellerIndex}
              />
            </div>
          </Drawer>
        </div>
      )}

      <Modal
        isOpen={openDeleteModal}
        closeModal={() => setOpenDeleteModal(false)}
        title=""
        isCloseRequired={false}
        className="max-w-[400px] max-h-[300px]  relative"
      >
        <div className=" z-20 relative pt-5">
          <button
            onClick={() => setOpenDeleteModal(false)}
            className="text-gray-400 hover:text-gray-500 absolute top-[-10px] right-[-10px]"
          >
            <IoClose className="h-6 w-6 text-[#3B82F6]" />
          </button>

          <p className="md:text-[18px] text-[14px] font-medium text-black mb-7">
            Are you sure you want to delete the seller from this project?
          </p>
          <div className=" flex justify-between items-center">
            <Button
              className="h-[50px] w-[60px] md:w-[150px] rounded-md  bg-gray-100 border-[2px] border-[#3B82F6]   font-medium text-black"
              onClick={() => setOpenDeleteModal(false)}
              size="sm"
            >
              Cancel
            </Button>

            <Button
              className="h-[50px] w-[60px] md:w-[150px] rounded-md bg-[#3B82F6]  text-white font-medium"
              onClick={() => handleDelete()}
              size="sm"
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectSellers;
