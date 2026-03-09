import React, { useState, useEffect, useCallback } from "react";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import ImageFileUploader from "@/src/common/ImageFileUploader";
import Loader from "@/src/components/SpinLoader";
import { usePermissionStore } from "@/src/stores/usePermissions";
import { MdAdd } from "react-icons/md";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import { FaEdit } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { LuCheckCircle, LuCircle } from "react-icons/lu";
import Image from "next/image";
import PaginationControls from "@/src/components/CrmView/pagination";
import { Legend } from "../DayProgress/legend";
import { LuDownload } from "react-icons/lu";
import { CSVLink } from "react-csv";

import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import CustomTooltip from "@/src/common/ToolTip";
import ReusableSearchFilter from "@/src/common/SearchFilter";

const MaterialView = () => {
  const { custom_builder_id, setCustomBuilderID } = useCustomBuilderStore();
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    notes: "",
    images: [] as string[],
    quantity: "",
  });

  const { hasPermission } = usePermissionStore((state) => state);

  const session = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [materialToDelete, setMaterialToDelete] = useState<any | null>(null);
  const [loadingCheckId, setLoadingCheckId] = useState<number | null>(null);

  const categories = [
    { id: 1, category: "CEMENT" },
    { id: 2, category: "STEEL" },
    { id: 3, category: "SAND" },
    { id: 4, category: "WOOD" },
    { id: 5, category: "TILE" },
    { id: 6, category: "ELECTRICAL" },
    { id: 7, category: "PLUMBING" },
    { id: 8, category: "OTHER" },
  ];

  const units = [
    { id: 1, unit: "BAG" },
    { id: 2, unit: "KG" },
    { id: 3, unit: "TON" },
    { id: 4, unit: "CFT" },
    { id: 5, unit: "CUM" },
    { id: 6, unit: "PIECE" },
  ];

  const categoryFilters: FilterOption[] = categories.map((cat) => ({
    id: String(cat.id),
    label: cat.category,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = React.useState(false);
  const [Materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentpage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (router.isReady) {
      const builderIdFromQuery = String(router.query.userId);
      if (builderIdFromQuery) {
        setCustomBuilderID(builderIdFromQuery);
        fetchMaterials();
      }
    }
  }, [router.isReady, custom_builder_id]);
  type FilterOption = {
    id: string;
    label: string;
  };

  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: boolean;
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    key: "category" | "unit",
    selectedOption: { id: number; category?: string; unit?: string },
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: selectedOption?.category || selectedOption?.unit || "",
    }));
  };

  const handleImageUpload = (files: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
    }));
  };

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);
  const categoryLegendData = [
    { colorclass: "bg-gray-200 text-gray-700", label: "CEMENT" },
    { colorclass: "bg-indigo-100 text-indigo-700", label: "STEEL" },
    { colorclass: "bg-yellow-200 text-yellow-800", label: "SAND" },
    { colorclass: "bg-yellow-300 text-yellow-900", label: "WOOD" },
    { colorclass: "bg-purple-200 text-purple-800", label: "TILE" },
    { colorclass: "bg-blue-200 text-blue-800", label: "ELECTRICAL" },
    { colorclass: "bg-green-200 text-green-800", label: "PLUMBING" },
    { colorclass: "bg-gray-100 text-gray-600", label: "OTHER" },
  ];

  const validateMaterialForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Material Name is required";
    }

    if (!formData.category || formData.category.trim() === "") {
      newErrors.category = "Category is required";
    }

    if (!formData.unit || formData.unit.trim() === "") {
      newErrors.unit = "Unit is required";
    }
    if (!formData.quantity || formData?.quantity === "") {
      newErrors.quantity = "Material quantity is required";
    }

    if (!editingMaterial && formData.images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredMaterials = Materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.unit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters =
      Object.values(selectedFilters).every((val) => !val) ||
      selectedFilters[
        categories.find((cat) => cat.category === material.category)?.id || ""
      ] ||
      selectedFilters[material.unit];

    return matchesSearch && matchesFilters;
  });

  const handleMaterialSubmit = async () => {
    if (isSubmitting) return;
    if (!validateMaterialForm()) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        notes: formData.notes,
        images: formData.images,
        quantity: formData.quantity ? Number(formData.quantity) : null,
        uploadedById: user?.id,
      };

      let res;
      if (editingMaterial) {
        res = await apiClient.patch(
          `${apiClient.URLS.custom_builder}/${custom_builder_id}/materials/${editingMaterial.id}`,
          payload,
        );
      } else {
        res = await apiClient.post(
          `${apiClient.URLS.custom_builder}/${custom_builder_id}/materials`,
          payload,
        );
      }
      if (res.status === 200) {
        toast.success(
          editingMaterial
            ? "Material updated successfully!"
            : "Material added successfully!",
        );
      }

      await fetchMaterials();
      setEditingMaterial(null);
      setOpenModal(false);
      setFormData({
        name: "",
        category: "",
        unit: "",
        notes: "",
        images: [],
        quantity: "",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error(
        editingMaterial
          ? "Failed to save material"
          : "failed to Update material",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMaterials = async () => {
    if (!custom_builder_id) {
      console.error("No custom builder ID provided");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}/materials`,
      );
      if (res.status === 200) {
        setMaterials(res.body);
        toast.success("Materials Fetched Sucessfully");
      }
    } catch (error) {
      console.error("error is", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    try {
      const res = await apiClient.delete(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}/materials/${id}`,
      );

      if (res.status === 200) {
        setMaterials((prev) => prev.filter((mat) => mat.id !== id));
        toast.success("Material deleted successfully!");
      } else {
        toast.error("Failed to delete material");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting material");
    }
  };

  const handleEdit = (id: number) => {
    const material = Materials.find((mat) => mat.id === id);
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name || "",
        category: material.category || "",
        unit: material.unit || "",
        notes: material.notes || "",
        images: material.images || [],
        quantity: material.quantity || "",
      });
      setOpenModal(true);
    }
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingMaterial(null);
    setFormData({
      name: "",
      category: "",
      unit: "",
      notes: "",
      images: [],
      quantity: "",
    });
    setErrors({});
  };
  const handleCheck = async (materialId: any) => {
    if (!custom_builder_id) {
      toast.error("Invalid project. Please select a project first.");
      return;
    }

    setLoadingCheckId(materialId);

    setMaterials((prev) =>
      prev.map((mat) =>
        mat.id === materialId
          ? {
              ...mat,
              checkedBy: {
                ...(mat.checkedBy || {}),
                username: user?.username || user?.fullName || "Checked",
              },
              checkedAt: new Date().toISOString(),
            }
          : mat,
      ),
    );

    try {
      const res = await apiClient.post(
        `${apiClient.URLS.custom_builder}/${custom_builder_id}/materials/${materialId}/check`,
        { userId: user?.id },
      );

      if (res.status === 200) {
        const updated = res.body;

        // 3) Replace with real server response data
        setMaterials((prev) =>
          prev.map((mat) =>
            mat.id === materialId
              ? {
                  ...mat,
                  checkedBy: updated.checkedBy,
                  checkedAt: updated.checkedAt,
                }
              : mat,
          ),
        );

        toast.success("Material marked as checked!");
      }
    } catch (err) {
      console.error("Check error:", err);

      await fetchMaterials();
      toast.error("Failed to mark material as checked");
    } finally {
      setLoadingCheckId(null);
    }
  };

  // const handleCheck = async (materialId: number) => {
  //   if (!custom_builder_id ) {
  //     toast.error("Invalid project. Please select a project first.");
  //     return;
  //   }
  //   setLoadingCheckId(materialId);

  //   try {
  //     const res = await apiClient.post(
  //       `${apiClient.URLS.custom_builder}/${custom_builder_id}/materials/${materialId}/check`,
  //       { userId: user?.id }
  //     );

  //     if (res.status === 200) {
  //       const updated = res.body;

  //       setMaterials((prev) =>
  //         prev.map((mat) =>
  //           mat.id === materialId
  //             ? {
  //                 ...mat,
  //                 checkedBy: updated.checkedBy,
  //                 checkedAt: updated.checkedAt,
  //               }
  //             : mat
  //         )
  //       );
  //       await fetchMaterials();

  //       toast.success("Material marked as checked!");
  //     }
  //   } catch (err) {
  //     console.error("Check error:", err);
  //     toast.error("Failed to mark material as checked");
  //   } finally {
  //     setLoadingCheckId(null);
  //   }
  // };

  const paginatedData = filteredMaterials.slice(
    (currentpage - 1) * pageSize,
    currentpage * pageSize,
  );

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const totalPages = Math.ceil(filteredMaterials.length / pageSize);

  const handlePageChange = useCallback(
    (newPage: number) =>
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages))),
    [totalPages],
  );
  const headers = [
    { label: "Id", key: "id" },
    { label: "Name", key: "name" },
    { label: "Category", key: "category" },
    { label: "Unit", key: "unit" },
    { label: "Quantity", key: "quantity" },
    { label: "Notes", key: "notes" },
    { label: "Checked By", key: "checkedBy" },
    { label: "Checked At", key: "checkedAt" },
    { label: "Created At", key: "createdAt" },
    { label: "Images", key: "images" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="md:mt-4 mt-1 w-full overflow-x-hidden">
        <div className="flex md:mb-6 mb-5 justify-between items-center w-full">
          <h1 className="font-bold md:text-2xl text-[18px] text-[#3586FF] ">
            Materials
          </h1>
          <CustomTooltip
            label="Add New Estimation"
            position="bottom"
            tooltipBg="bg-black/60 backdrop-blur-md"
            tooltipTextColor="text-white py-2 px-4 font-medium"
            labelCls="text-[12px] font-medium "
            // showTooltip={!hasPermission("materials", "create")}
          >
            <Button
              onClick={() => setOpenModal(true)}
              disabled={hasPermission("materials", "create")}
              className="mt-auto bg-[#5297ff] text-white   md:text-[16px] text-[12px] md:py-[8px] py-1 md:px-3 px-2 rounded-[10px] font-medium mr-10"
            >
              + Add New
            </Button>
          </CustomTooltip>
        </div>
        <div className="w-full md:px-2 px-1 flex items-center gap-2">
          <ReusableSearchFilter
            searchText={searchQuery}
            placeholder="Search by material name, category and unit"
            onSearchChange={setSearchQuery}
            filters={categoryFilters}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            className="md:py-0.5 py-0.5"
          />
          <div className="md:mb-6 mb-3">
            {Materials?.length > 0 && (
              <CSVLink
                data={Materials}
                headers={headers}
                filename={`Materials.csv`}
                className="w-fit"
              >
                <Button className="md:px-4 px-2 font-medium md:py-1.5 py-1 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg flex items-center gap-2 shadow-sm">
                  <LuDownload className="text-white md:text-[12px] text-[10px]" />
                  <span className="md:text-[12px] text-[10px]">Export</span>
                </Button>
              </CSVLink>
            )}
          </div>
        </div>

        <Modal
          isOpen={openModal}
          closeModal={handleCloseModal}
          className="w-full max-w-[860px] h-full bg-white rounded-lg overflow-hidden flex flex-col"
          rootCls="flex items-center justify-center z-[9999]"
          isCloseRequired={false}
        >
          {isSubmitting && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-50">
              <Loader />
            </div>
          )}

          <div className="flex items-center justify-between md:px-8 px-4 md:py-5 py-4 border-b border-gray-100 bg-white">
            <div>
              <h2 className="heading-text">
                {editingMaterial ? "Edit Material" : "Add Material"}
              </h2>
              <p className="sublabel-text text-gray-500">
                Enter material details and attach images (max 15MB each).
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-auto md:px-8 px-4 md:py-6 py-4 space-y-5">
            <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-5">
              <p className="sub-heading mb-3">Material Details</p>
              <div className="grid md:grid-cols-2 grid-cols-1 md:gap-x-4 md:gap-y-3 gap-2">
                <CustomInput
                  label="Material Name"
                  placeholder="Enter material name"
                  name="name"
                  labelCls="label-text font-medium"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="px-3 md:py-0 py-0.5"
                  errorMsg={errors?.name}
                />
                <div className="flex flex-col md:gap-y-[6px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px] ">
                  <p className="text-[#000000] font-medium label-text leading-[22.8px]">
                    Category
                  </p>

                  <SingleSelect
                    type="single-select"
                    name="category"
                    labelCls="label-text font-medium"
                    options={categories}
                    selectedOption={categories.find(
                      (item) => item.category === formData.category,
                    )}
                    rootCls="border-b-[1px]  md:h-[38px] h-[35px] px-1 py-0 w-full border  border-[#CFCFCF]  rounded-[4px] "
                    buttonCls="border-none"
                    optionsInterface={{
                      isObj: true,
                      displayKey: "category",
                    }}
                    errorMsg={errors?.category}
                    handleChange={(_, value) =>
                      handleSelectChange("category", value)
                    }
                  />
                </div>
                <div className="flex flex-col md:gap-y-[6px] gap-y-[4px] w-full md:max-w-[480px] max-w-[280px]">
                  <p className="text-[#000000] font-medium label-text leading-[22.8px]">
                    Units
                  </p>

                  <SingleSelect
                    type="single-select"
                    name="unit"
                    options={units}
                    labelCls="label-text font-medium"
                    selectedOption={units.find(
                      (item) => item.unit === formData.unit,
                    )}
                    rootCls="border-b-[1px]  md:h-[38px] h-[35px] px-1 py-0 w-full border  border-[#CFCFCF]  rounded-[4px] "
                    buttonCls="border-none"
                    handleChange={(_, value) =>
                      handleSelectChange("unit", value)
                    }
                    errorMsg={errors?.unit}
                    optionsInterface={{
                      isObj: true,
                      displayKey: "unit",
                    }}
                  />
                </div>
                <CustomInput
                  label="Quantity"
                  placeholder="Enter Quantity"
                  name="quantity"
                  labelCls="label-text font-medium"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  className="px-3 md:py-0 py-0.5"
                  errorMsg={errors?.quantity}
                />

                <div className="md:col-span-2 col-span-1">
                  <CustomInput
                    placeholder="Add notes about this material"
                    name="notes"
                    type="textarea"
                    className="w-full border border-gray-300 md:text-[14px] text-[12px] rounded-md md:px-3 px-2 md:py-4  py-3 placeholder:text-[12px] placeholder:font-regular"
                    label="Notes"
                    labelCls="label-text font-medium text-black"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-2 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="sub-heading">Images</p>
                <span className="sublabel-text text-gray-500 md:text-[12px] text-[10px]">
                  Max size 15MB • Formats: PDF, PNG, JPEG
                </span>
              </div>

              <ImageFileUploader
                name="Reference images"
                type="file"
                folderName="customBuilder/materials"
                onFileChange={(data) => handleImageUpload(data)}
                initialFileUrl={formData.images}
                required
                errorMessage={errors?.images}
              />
            </section>
          </div>

          <div className="md:px-8 px-4 md:py-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <p className="sublabel-text text-gray-500">
                You’re adding a <span className="font-medium">Material</span>
              </p>
              <div className="flex gap-2">
                <Button
                  className="bg-gray-100 text-gray-900 border border-gray-300 btn-text md:px-6 px-4 md:py-[6px] py-[3px] rounded-md"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  className="bg-[#3B82F6] text-white btn-text md:px-6 px-4 md:py-[6px] py-[3px] rounded-md disabled:opacity-60"
                  onClick={handleMaterialSubmit}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingMaterial
                      ? "Update"
                      : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        <div className="relative overflow-x-auto md:rounded-[10px] rounded-[4px] shadow-custom mt-2 border md:p-2 p-1 bg-white md:space-y-4 space-y-2">
          {loadingCheckId && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
              <Loader />
            </div>
          )}
          <table className="md:min-w-full min-w-[800px] w-full md:text-[12px] text-[12px] border border-collapse border-gray-300 rounded-[6px] md:rounded-lg bg-white">
            <thead className="bg-gray-100">
              <tr className="bg-gray-200 text-black text-left font-bold">
                {headers.map((header) => (
                  <th
                    key={header.key}
                    className="border border-gray-300 p-2 text-center text-nowrap"
                  >
                    {header.label}
                  </th>
                ))}
                <th className="border  border-gray-300 p-2 text-center text-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((mat, index) => (
                <tr
                  key={mat.id}
                  className="hover:bg-gray-300 hover:border-gray-100 hover:border font-regular transition-colors duration-200"
                >
                  <td className="md:py-1 py-1 md:px-1 px-1 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {index + 1}
                  </td>
                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat.name}
                  </td>
                  <td className="text-center border border-gray-300">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                        mat.category === "CEMENT"
                          ? "bg-gray-200 text-gray-700"
                          : mat.category === "STEEL"
                            ? "bg-indigo-100 text-indigo-700"
                            : mat.category === "SAND"
                              ? "bg-yellow-200 text-yellow-800"
                              : mat.category === "WOOD"
                                ? "bg-yellow-300 text-yellow-900"
                                : mat.category === "TILE"
                                  ? "bg-purple-200 text-purple-800"
                                  : mat.category === "ELECTRICAL"
                                    ? "bg-blue-200 text-blue-800"
                                    : mat.category === "PLUMBING"
                                      ? "bg-green-200 text-green-800"
                                      : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {mat?.category}
                    </span>
                  </td>

                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat?.unit}
                  </td>
                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat?.quantity ?? "-"}
                  </td>
                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat.notes}
                  </td>
                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat.checkedBy ? mat.checkedBy.username : "-"}
                  </td>
                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat.checkedAt
                      ? new Date(mat.checkedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="md:py-2 py-2 md:px-2 px-2 text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {new Date(mat.createdAt).toLocaleDateString()}
                  </td>
                  <td className=" text-center font-medium border border-gray-300 text-nowrap md:text-[10px] text-[10px]">
                    {mat.images?.length > 0 ? (
                      <Button
                        className="text-[#3586FF]  underline md:text-[12px] text-[10px]"
                        onClick={() => {
                          setSelectedImages(mat.images);
                          setMediaModalOpen(true);
                        }}
                      >
                        View Images ({mat.images.length})
                      </Button>
                    ) : (
                      "No Images"
                    )}
                  </td>
                  <td>
                    <div className="flex  items-center justify-center">
                      {/* <CustomTooltip
                        label="Access Restricted Contact Admin"
                        position="bottom"
                        tooltipBg="bg-black/60 backdrop-blur-md"
                        tooltipTextColor="text-white py-2 px-4 font-medium"
                        labelCls="text-[10px] font-medium"
                        showTooltip={!hasPermission("materials", "edit")}
                      > */}
                      <Button
                        disabled={hasPermission("materials", "edit")}
                        className=" md:text-[16px] text-[12px] font-medium  rounded-md px-3 py-1"
                        onClick={() => handleEdit(mat?.id)}
                      >
                        <FaEdit className="text-[#3586FF]  md:text-[16px] text-[12px] cursor-pointer" />
                      </Button>
                      {/* </CustomTooltip> */}
                      <Button
                        className={`px-2 py-1 rounded-md text-white flex items-center gap-1 ${
                          mat.checkedBy
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500"
                        }`}
                        onClick={() => handleCheck(mat.id)}
                        disabled={!!mat.checkedBy || loadingCheckId === mat.id}
                      >
                        {loadingCheckId === mat.id ? (
                          <span className="loader border-2 border-t-white border-green-500 rounded-full w-4 h-4 animate-spin"></span>
                        ) : mat.checkedBy ? (
                          <LuCheckCircle className="text-white md:text-[16px] text-[12px]" />
                        ) : (
                          <LuCircle className="text-white md:text-[16px] text-[12px]" />
                        )}
                      </Button>
                      {/* <CustomTooltip
                        label="Access Restricted Contact Admin"
                        position="bottom"
                        tooltipBg="bg-black/60 backdrop-blur-md"
                        tooltipTextColor="text-white py-2 px-4 font-medium"
                        labelCls="text-[10px] font-medium"
                        showTooltip={!hasPermission("materials", "delete")}
                      > */}
                      <Button
                        //  onClick={() => handleDelete(mat?.id)}
                        onClick={() => setMaterialToDelete(mat)}
                        className="px-3 py-1 text-white rounded"
                        disabled={hasPermission("materials", "delete")}
                      >
                        <LuTrash2 className="md:text-[16px] text-[12px] text-red-500 cursor-pointer" />
                      </Button>
                      {/* </CustomTooltip> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {mediaModalOpen && (
            <Modal
              isOpen={mediaModalOpen}
              closeModal={() => {
                setMediaModalOpen(false);
                setSelectedImages([]);
              }}
              title="Material Images"
              rootCls="z-[99999]"
              titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
              isCloseRequired={true}
              className="md:max-w-[800px] max-w-[320px] w-full"
            >
              <div className="flex flex-wrap items-center justify-center md:gap-3 gap-1 mt-[10px]">
                {selectedImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="md:w-[160px] w-[120px]  md:h-[150px] h-[100px] relative"
                  >
                    <Image
                      src={url}
                      alt={`Material ${idx + 1}`}
                      fill
                      className="w-full h-full object-cover md:rounded-[10px] rounded-[4px]"
                    />
                  </div>
                ))}
              </div>
            </Modal>
          )}
          <div className="flex md:flex-row flex-col items-center justify-between md:mt-0 mt-2 px-2 py-2 ">
            <Legend data={categoryLegendData} />

            {paginatedData.length > pageSize && (
              <PaginationControls
                currentPage={currentpage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
          {materialToDelete && (
            <Modal
              isOpen={!!materialToDelete}
              closeModal={() => setMaterialToDelete(null)}
              rootCls="z-[99999]"
              titleCls="font-medium md:text-[18px] text-[12px] text-center text-[#3586FF] "
              isCloseRequired={false}
              className="md:max-w-[500px] max-w-[270px]"
            >
              <div className="md:p-2 p-1 flex flex-col gap-2 z-20">
                <div className="flex justify-between items-center md:mb-2 mb-1">
                  <h3 className="md:text-[16px] text-center w-full text-[12px] font-medium text-gray-900">
                    Confirm Deletion
                  </h3>
                </div>
                <p className="md:text-[12px] text-center text-[10px] text-gray-500 mb-2">
                  Are you sure you want to delete this material? This action
                  cannot be undone.
                </p>
                <div className="md:mt-2 mt-1 flex items-end justify-end gap-2 md:space-x-3 space-x-1">
                  <Button
                    className="border-2 font-medium md:text-[12px] text-[10px] btn-text border-gray-300 md:px-3 px-2 md:py-1 py-1 rounded-md"
                    onClick={() => setMaterialToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 text-white font-medium md:text-[12px] text-[10px] md:px-3 px-2 md:py-1 py-1 rounded-md"
                    onClick={() => {
                      handleDelete(materialToDelete.id);
                      setMaterialToDelete(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default MaterialView;
