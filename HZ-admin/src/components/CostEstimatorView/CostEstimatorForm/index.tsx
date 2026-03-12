import Button from "@/src/common/Button";
import CustomDate from "@/src/common/FormElements/CustomDate";
import CustomInput from "@/src/common/FormElements/CustomInput";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import Modal from "@/src/common/Modal";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import apiClient from "@/src/utils/apiClient";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import { ConstEstimationTable } from "../../CostEstimatorDetailsView/ConstEstimationTable";
import { bhkArray } from "../../Property/PropertyDetails/PropertyHelpers";
import { CgSpinner } from "react-icons/cg";
import { useRouter } from "next/router";
import { FiUser, FiHome, FiMapPin, FiPlus, FiX, FiSave, FiFileText, FiPercent, FiLayers } from "react-icons/fi";

import {
  CEformProps,
  CEformValues,
  validateFormValues,
  validateItemInformation,
} from "../helper";
import FileInput from "@/src/common/FileInput";
import { ProfileIcon } from "@/src/common/Icons";

const CostEstimatorForm = ({
  closeDrawer,
  editingEstimation,
  setCostEstimators,
  fetchDetails,
  setEditingEstimation,
  userId,
  category: categoryProp,
  onSuccessRefetch,
}: CEformProps) => {
  const [errors, setErrors] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<CEformValues>({
    userId,
    firstname: "",
    lastname: "",
    email: "",
    phone: null,
    date: "",
    property_type: null,
    property_name: "",
    designerName: "",
    bhk: null,
    subTotal: 0,
    discount: 0,
    details: "",
    floor_plan: "",
    property_image: "",
    itemGroups: [],
    location: {
      city: "",
      locality: "",
      sub_locality: "",
      landmark: "",
      pincode: "",
      state: "",
      address_line_1: "",
    },
  });
  const [sectionTitle, setSectionTitle] = useState("");
  const [currentSection, setCurrentSection] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );

  const [isEditingSection, setIsEditingSection] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(
    null
  );

  const [itemInformation, setItemInformation] = useState({
    id: null,
    item_name: "",
    description: "",
    quantity: null,
    unit_price: null,
    amount: null,
    area: null,
  });
  const [details, setDetails] = useState<any>(undefined);
  const [discountInput, setDiscountInput] = useState<number>(
    formValues.discount || 0
  );
  const router = useRouter();
  const activetab = router.query;

  const [error, setError] = useState<any>({});

  const [locationDetails, setLocationDetails] = useState({
    city: "",
    locality: "",
    sub_locality: "",
    landmark: "",
    pincode: "",
    state: "",
    address_line_1: "",
  });

  const [openAddItemModal, setOpenAddItemModal] = useState(false);
  const [addInfoModal, setAddInfoModal] = useState(false);
  const [OpenAddsectionModal, setOpenAddsectionModal] = useState(false);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const toDecimalString = (value: any) =>
    value === null || value === undefined ? "0" : String(value);

useEffect(() => {
    if (editingEstimation) {
      const itemGroups = editingEstimation.itemGroups?.length
        ? editingEstimation.itemGroups.map((group, index) => ({
            ...group,
            order: group.order ?? index,
          }))
        : [];
      setFormValues({
        userId: editingEstimation.userId,
        firstname: editingEstimation.firstname,
        designerName: editingEstimation?.designerName,
        lastname: editingEstimation.lastname,
        email: editingEstimation.email,
        phone: editingEstimation.phone,
        property_type: editingEstimation.property_type,
        property_name: editingEstimation.property_name,
        bhk: editingEstimation.bhk,
        floor_plan: editingEstimation.floor_plan,
        property_image: editingEstimation.property_image,
        date: editingEstimation?.date
          ? new Date(editingEstimation.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        subTotal: editingEstimation?.subTotal || 0,
        details: editingEstimation?.details,
        itemGroups,
        location: editingEstimation.location,
        discount: editingEstimation.discount,
      });
      setLocationDetails({ ...editingEstimation.location });
      setDetails(editingEstimation?.details);
    } else if (userId) {
      // Reset form when opening for new estimation
      const emptyLocation = {
        city: "",
        locality: "",
        sub_locality: "",
        landmark: "",
        pincode: "",
        state: "",
        address_line_1: "",
      };
      setFormValues({
        userId,
        firstname: "",
        lastname: "",
        email: "",
        phone: null,
        date: new Date().toISOString().split("T")[0],
        property_type: null,
        property_name: "",
        designerName: "",
        bhk: null,
        subTotal: 0,
        discount: 0,
        details: "",
        floor_plan: "",
        property_image: "",
        itemGroups: [],
        location: emptyLocation,
      });
      setLocationDetails(emptyLocation);
      setDetails(undefined);
    }
  }, [editingEstimation, userId]);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      location: { ...locationDetails },
    }));
  }, [locationDetails]);

  // ---------------Validation functions-------------
  const validate = () => {
    const errors = validateFormValues(formValues);
    setError(errors);
    return Object.keys(errors).length === 0;
  };
  const validateItem = () => {
    const errors = validateItemInformation(itemInformation);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --------------------On change functions -------------------

  const handleFormChange = (name: string, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (name: string, value: string) => {
    setLocationDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (name: string, value: string) => {
    setItemInformation((prev) => {
      const updatedItem = {
        ...prev,
        [name]:
          ["quantity", "unit_price", "area"].includes(name) && value !== ""
            ? parseFloat(value)
            : value,
      };

      const { quantity = 1, unit_price = 1, area = 1 } = updatedItem;

      updatedItem.amount =
        parseFloat(quantity as any) *
        parseFloat(unit_price as any) *
        parseFloat(area as any);

      return updatedItem;
    });
  };
  const addSection = async () => {
    console.log("Section Title", formValues.itemGroups.length);
    if (!sectionTitle.trim()) {
      toast.error("Please enter a valid section title");
      return;
    }

    if (!editingEstimation) {
      toast.error("Please save the estimation details first to add sections");
      return;
    }

    let updatedFormData;

    if (isEditingSection && editingSectionIndex !== null) {
      console.log(
        "Adding new section with order:",
        formValues.itemGroups.length
      );

      updatedFormData = {
        ...formValues,
        itemGroups: formValues.itemGroups?.map((group, index) =>
          index === editingSectionIndex
            ? { ...group, title: sectionTitle }
            : group
        ),
      };
    } else {
      console.log("Section ", formValues.itemGroups.length);
      const newSection = {
        title: sectionTitle,
        items: [],
        order: formValues.itemGroups.length,
      };
      updatedFormData = {
        ...formValues,
        itemGroups: [...(formValues.itemGroups || []), newSection],
      };
    }

    updatedFormData.subTotal = updatedFormData.itemGroups?.reduce(
      (total, group) =>
        total +
        group.items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      0
    );
    console.log("updatedFormData", updatedFormData);

    setFormValues(updatedFormData);

    if (setCostEstimators) {
      setCostEstimators((prev) =>
        prev.map((estimation) =>
          estimation.id === editingEstimation.id
            ? { id: editingEstimation.id, ...updatedFormData }
            : estimation
        )
      );
    }

    setCurrentSection(sectionTitle);
    setSectionTitle("");
    setIsEditingSection(false);
    setEditingSectionIndex(null);
    setOpenAddsectionModal(false);

    const payload = {
      ...updatedFormData,
      phone: Number(updatedFormData.phone),
      discount: toDecimalString(updatedFormData.discount),
    };

    try {
      const response = await apiClient.put(
        `${apiClient.URLS.cost_estimator}/${editingEstimation.id}`,
        payload,
        true
      );
      if (response.status === 200) {
        toast.success(
          isEditingSection
            ? "Section updated successfully"
            : "Section added successfully"
        );
      }
      if (fetchDetails) {
        fetchDetails();
      }
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error(
        `Failed to ${isEditingSection ? "update" : "save"} the section`
      );
    }
  };

  // -------Add, remove and edit item functions------------------
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const addItem = async () => {
    if (!validateItem()) return;

    if (!editingEstimation) {
      toast.error("Please save the estimation details first to add items");
      return;
    }

    if (!formValues.itemGroups || formValues?.itemGroups?.length === 0) {
      toast.error("Please add a section first before adding items");
      setOpenAddsectionModal(true);
      return;
    }

    if (currentSectionIndex === null || currentSectionIndex === undefined) {
      toast.error("Please select a valid section to add items to");
      return;
    }
    setLoading(true);

    const updatedItemGroups = [...formValues.itemGroups];
    const targetGroup = updatedItemGroups[currentSectionIndex];

    if (!targetGroup) {
      toast.error("Selected section not found");
      setLoading(false);
      return;
    }

    const itemWithId = {
      ...itemInformation,
      id: itemInformation.id || Date.now(),
    };

    const updatedItems =
      isEditing && editingItemId !== null
        ? targetGroup.items.map((item) =>
          item.id === editingItemId ? itemWithId : item
        )
        : [...targetGroup.items, itemWithId];

    updatedItemGroups[currentSectionIndex] = {
      ...targetGroup,
      items: updatedItems,
    };

    const newSubTotal = updatedItemGroups.reduce((total, group) => {
      return (
        total +
        group.items.reduce((groupTotal, item) => {
          return groupTotal + Number(item.amount || 0);
        }, 0)
      );
    }, 0);

    const updatedFormData = {
      ...formValues,
      itemGroups: updatedItemGroups,
      subTotal: newSubTotal,
    };

    setFormValues(updatedFormData);

    if (setCostEstimators) {
      setCostEstimators((prev) =>
        prev.map((estimation) =>
          estimation.id === editingEstimation.id
            ? { id: editingEstimation.id, ...updatedFormData }
            : estimation
        )
      );
    }

    const payLoad = {
      ...updatedFormData,
      phone: Number(updatedFormData.phone),
      itemGroups: updatedFormData.itemGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          id: item.id || Date.now(),
        })),
      })),
      discount: toDecimalString(updatedFormData.discount),
    };

    try {
      const response = await apiClient.put(
        `${apiClient.URLS.cost_estimator}/${editingEstimation.id}`,
        payLoad,
        true
      );

      if (response.status === 200) {
        toast.success(
          isEditing ? "Item updated successfully" : "Item added successfully"
        );
        setItemInformation({
          id: null,
          item_name: "",
          description: "",
          quantity: null,
          unit_price: null,
          amount: null,
          area: null,
        });
        setIsEditing(false);

        if (fetchDetails) fetchDetails();
        closeAddItemModal();
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to save the item details");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id: number) => {
    const updatedItemGroups = formValues.itemGroups.map((group) => {
      const updatedItems = group.items.filter((item) => item.id !== id);
      return {
        ...group,
        items: updatedItems,
      };
    });
    const newSubTotal = updatedItemGroups.reduce((total, group) => {
      return (
        total +
        group.items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      );
    }, 0);

    setFormValues((prev) => ({
      ...prev,
      itemGroups: updatedItemGroups,
      subTotal: newSubTotal,
    }));
  };

  const removeSection = (index: number) => {
    const updatedItemGroups = [...formValues.itemGroups];
    updatedItemGroups.splice(index, 1);

    const reorderedItemGroups = updatedItemGroups.map((group, idx) => ({
      ...group,
      order: idx,
    }));

    const newSubTotal = reorderedItemGroups.reduce((total, group) => {
      return (
        total +
        group.items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      );
    }, 0);

    setFormValues((prev) => ({
      ...prev,
      itemGroups: reorderedItemGroups,
      subTotal: newSubTotal,
    }));
  };

  const EditDetails = () => {
    setAddInfoModal(true);
  };

  const editItem = (itemIndex: number, sectionIndex: number) => {
    const group = formValues.itemGroups[sectionIndex];
    const item = group.items[itemIndex];
    console.log("group", group, item);

    if (item) {
      setItemInformation({
        ...item,
        id: item.id || Date.now(),
      });
      setIsEditing(true);
      setCurrentSectionIndex(sectionIndex);
      setEditingItemId(item.id);
    } else {
      console.error("Item not found with ID:", itemIndex);
      toast.error("Item not found");
    }
  };

  const editSection = (index: number) => {
    const sectionToEdit = formValues.itemGroups?.[index];
    if (sectionToEdit) {
      setSectionTitle(sectionToEdit.title);
      setIsEditingSection(true);
      setEditingSectionIndex(index);
      setOpenAddsectionModal(true);
    } else {
      toast.error("Section not found");
    }
  };
  const convertToOrderedList = (text: string = ""): string => {
    if (text?.trim().startsWith("<ol")) return text;

    const lines = text
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (!Array.isArray(lines) || lines.length === 0) return "";

    return `<ol style="list-style-type: decimal;">${lines
      .map((line) => `<li>${line}</li>`)
      .join("")}</ol>`;
  };

  const formatted = convertToOrderedList(details);

  // ---------------- Submit functions ----------------

  const handleSubmit = async () => {
    if (!validate()) return;
    if (loading) return;
    setLoading(true);

    try {
      let response: any = null;

      const payLoad = {
        ...formValues,
        phone: Number(formValues.phone),
        subTotal: Number(formValues.subTotal),
        details,
        discount: toDecimalString(formValues.discount),
        category: categoryProp ?? (activetab?.category as string) ?? "Interior",
      };

      if (editingEstimation) {
        response = await apiClient.put(
          `${apiClient.URLS.cost_estimator}/${editingEstimation.id}`,
          payLoad,
          true
        );
      } else {
        response = await apiClient.post(
          apiClient.URLS.cost_estimator,
          payLoad,
          true
        );
      }

      if (response.status === 201) {
        setEditingEstimation?.(response.body);
        onSuccessRefetch?.();
        toast.success("Successfully created estimation details");
      } else if (response.status === 200) {
        toast.success("Successfully updated estimation details");
        if (fetchDetails) {
          fetchDetails();
        }
      }
    } catch (error: any) {
      console.error("Error saving estimation:", error);
      const message =
        error?.body?.message ||
        error?.message ||
        "Failed to save the details";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const saveDetails = async () => {
    if (details?.length === 0 || !editingEstimation?.id) return;

    try {
      const formatted = convertToOrderedList(details);
      setAddInfoModal(false);
      setFormValues((prev) => {
        return {
          ...prev,
          details: formatted,
        };
      });

      await apiClient.put(
        `${apiClient.URLS.cost_estimator}/${editingEstimation.id}`,
        { details: formatted },
        true
      );

      toast.success("Successfully saved details");

      if (fetchDetails) {
        fetchDetails();
      }
    } catch (error) {
      console.error("Error saving details:", error);
      toast.error("Failed to save the details");
    }
  };
  const saveDiscount = async () => {
    const estimationId = editingEstimation?.id;
    if (!estimationId) return;

    try {
      const numericDiscount = Number(discountInput) || 0;
      await apiClient.put(
        `${apiClient.URLS.cost_estimator}/${estimationId}`,
        {
          discount: numericDiscount.toString(),
        },
        true
      );

      setFormValues((prev) => ({ ...prev, discount: numericDiscount }));
      setOpenDiscountModal(false);
      toast.success("Successfully saved discount");

      fetchDetails?.();
    } catch (error) {
      console.error("Error saving discount:", error);
      toast.error("Failed to save the discount");
    }
  };

  const closeAddItemModal = () => {
    setOpenAddItemModal(false);
    setItemInformation({
      id: null,
      item_name: "",
      description: "",
      quantity: null,
      unit_price: null,
      amount: null,
      area: null,
    });

    setIsEditing(false);
    setEditingItemId(null);
    setCurrentSectionIndex(null);
  };

  const openItemModal = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setOpenAddItemModal(true);
  };
  const AddsectionModal = () => {
    setOpenAddsectionModal(true);
  };

  const proprtyTypes = ["Apartment", "Villas", "Independent House"];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 border-b border-slate-100 px-6 py-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white grid place-items-center shadow-lg shadow-blue-500/30">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                {editingEstimation ? "Edit Estimation" : "New Estimation"}
              </h1>
              {editingEstimation && (
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                  Customer: <span className="font-medium text-slate-700">{editingEstimation?.firstname} {editingEstimation?.lastname}</span>
                  <ProfileIcon />
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="w-full flex flex-col gap-6">
          {/* User Info Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">User Information</h2>
                  <p className="text-xs text-slate-500">Customer and designer details</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <CustomInput
                  type="text"
                  label="First Name"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={formValues.firstname}
                  onChange={(e) =>
                    handleFormChange(e.target.name, e.target.value)
                  }
                  required
                  placeholder="Enter first name"
                  errorMsg={error?.firstname}
                  name="firstname"
                />
                <CustomInput
                  type="text"
                  label="Last Name"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={formValues.lastname}
                  onChange={(e) =>
                    handleFormChange(e.target.name, e.target.value)
                  }
                  required
                  placeholder="Enter last name"
                  errorMsg={error?.lastname}
                  name="lastname"
                />
                <CustomInput
                  type="text"
                  rootCls="w-full"
                  label="Designer Name"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={formValues.designerName}
                  onChange={(e) =>
                    handleFormChange("designerName", e.target.value)
                  }
                  required
                  placeholder="Designer name"
                  errorMsg={error?.designerName}
                  name="designerName"
                />
                <CustomInput
                  label="Email"
                  type="email"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={formValues.email}
                  onChange={(e) =>
                    handleFormChange(e.target.name, e.target.value)
                  }
                  required
                  placeholder="Enter email"
                  errorMsg={error?.email}
                  name="email"
                />
                <CustomInput
                  label="Phone Number"
                  type="number"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={formValues.phone}
                  onChange={(e) =>
                    handleFormChange(e.target.name, +e.target.value)
                  }
                  required
                  placeholder="Phone number"
                  errorMsg={error?.phone}
                  name="phone"
                />
                <CustomDate
                  label="Date of Estimation"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={formValues.date}
                  onChange={(e) =>
                    handleFormChange(e.target.name, e.target.value)
                  }
                  placeholder="Date of estimation"
                  errorMsg={error?.date}
                  name="date"
                />
              </div>
            </div>
          </div>

          {/* Property Details Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FiHome className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Property Details</h2>
                  <p className="text-xs text-slate-500">Property information and type</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <CustomInput
                  type="text"
                  label="Property Name"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  rootCls="md:max-w-none"
                  value={formValues.property_name}
                  onChange={(e) =>
                    handleFormChange(e.target.name, e.target.value)
                  }
                  required
                  placeholder="Property name"
                  name="property_name"
                />

                <div className="min-w-0">
                  <SelectBtnGrp
                    options={proprtyTypes}
                    label="Property Type"
                    labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    // labelCls="mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide"
                    className="md:gap-2 gap-1 md:flex-nowrap flex-wrap"
                    btnClass="text-[13px] font-medium rounded-lg px-3 py-2 border-2 border-slate-200 hover:border-blue-300 transition-all"
                    onSelectChange={(v) =>
                      handleFormChange("property_type", v as string)
                    }
                    slant={false}
                    defaultValue={formValues.property_type}
                  />
                </div>

                <div className="min-w-0">
                  <SelectBtnGrp
                    options={bhkArray}
                    label="No of BHK"
                    labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                    // labelCls="mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide"
                    className="md:gap-2 gap-1 md:flex-nowrap flex-wrap"
                    btnClass="text-[13px] font-medium rounded-lg px-3 py-2 border-2 border-slate-200 hover:border-blue-300 transition-all"
                    onSelectChange={(v) => handleFormChange("bhk", v as string)}
                    slant={false}
                    defaultValue={formValues.bhk}
                  />
                </div>
              </div>

              {/* File Inputs */}
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <FileInput
                  name="Floor plan"
                  type="file"
                  label="Floor Plan"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  initialFileUrl={formValues.floor_plan}
                  folderName="cost-estimator"
                  onFileChange={(url) => handleFormChange("floor_plan", url)}
                />
                <FileInput
                  name="Property image"
                  type="file"
                  label="Property Image"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  initialFileUrl={formValues.property_image}
                  folderName="cost-estimator"
                  onFileChange={(url) =>
                    handleFormChange("property_image", url)
                  }
                />
              </div>
            </div>
          </div>

          {/* Location Details Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FiMapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">Location Details</h2>
                  <p className="text-xs text-slate-500">Property address and location</p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <CustomInput
                  type="text"
                  label="City"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={locationDetails.city}
                  onChange={(e) =>
                    handleLocationChange(e.target.name, e.target.value)
                  }
                  placeholder="City"
                  errorMsg={error?.location?.city}
                  name="city"
                  required
                />

                <CustomInput
                  type="text"
                  label="State"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={locationDetails.state}
                  onChange={(e) =>
                    handleLocationChange(e.target.name, e.target.value)
                  }
                  placeholder="State"
                  errorMsg={error?.location?.state}
                  name="state"
                  required
                />

                <CustomInput
                  type="text"
                  label="Locality"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={locationDetails.locality}
                  onChange={(e) =>
                    handleLocationChange(e.target.name, e.target.value)
                  }
                  placeholder="Locality"
                  errorMsg={error?.location?.locality}
                  name="locality"
                  required
                />

                <CustomInput
                  type="text"
                  label="Pincode"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={locationDetails.pincode}
                  onChange={(e) =>
                    handleLocationChange(e.target.name, e.target.value)
                  }
                  placeholder="Pincode"
                  errorMsg={error?.location?.pincode}
                  name="pincode"
                  required
                />

                <CustomInput
                  type="text"
                  label="Sub Locality"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={locationDetails.sub_locality}
                  onChange={(e) =>
                    handleLocationChange(e.target.name, e.target.value)
                  }
                  placeholder="Sub locality"
                  errorMsg={error?.location?.sub_locality}
                  name="sub_locality"
                />

                <CustomInput
                  type="text"
                  label="Landmark"
                  labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                  value={locationDetails.landmark}
                  onChange={(e) =>
                    handleLocationChange(e.target.name, e.target.value)
                  }
                  placeholder="Landmark"
                  errorMsg={error?.location?.landmark}
                  name="landmark"
                />
              </div>

              <CustomInput
                type="textarea"
                label="Full Address"
                labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
                value={locationDetails.address_line_1}
                onChange={(e) =>
                  handleLocationChange(e.target.name, e.target.value)
                }
                placeholder="Enter complete address"
                errorMsg={error?.location?.address_line_1}
                name="address_line_1"
              />
            </div>
          </div>

          {/* Action Buttons for Items */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
              onClick={() => setOpenAddsectionModal(true)}
            >
              <FiLayers className="w-4 h-4" />
              Add Section
            </Button>
            <Button
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
              onClick={() => setAddInfoModal(true)}
            >
              <FiFileText className="w-4 h-4" />
              Add Details
            </Button>
            <Button
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
              onClick={() => {
                setDiscountInput(formValues.discount);
                setOpenDiscountModal(true);
              }}
            >
              <FiPercent className="w-4 h-4" />
              Set Discount
            </Button>
          </div>

          {/* Estimation Table */}
          {formValues?.itemGroups?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <ConstEstimationTable
                costEstimation={formValues}
                isInForm={true}
                editItem={editItem}
                deleteItem={removeItem}
                removeSection={removeSection}
                handleSubmit={handleSubmit}
                openModal={openItemModal}
                openSectionModal={AddsectionModal}
                editSection={editSection}
              />
            </div>
          )}

          {/* Details Section */}
          {formValues?.details?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">Additional Details</h2>
                    <p className="text-xs text-slate-500">Extra information and notes</p>
                  </div>
                </div>
                <Button
                  onClick={EditDetails}
                  className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
                >
                  <MdEdit className="w-4 h-4" /> Edit
                </Button>
              </div>
              <div className="p-5">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formValues?.details,
                  }}
                  className=" max-w-none text-slate-700 leading-[22.8px] text-[14px] font-medium"
                />
              </div>
            </div>
          )}

          {/* Totals Summary */}
          {formValues?.itemGroups?.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl px-6 py-4  shadow-xl">
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center justify-between w-full max-w-xs">
                  <span className="text-slate-400 text-sm label-text">Subtotal</span>
                  <span className="text-white font-semibold text-lg">₹ {Number(formValues?.subTotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between w-full max-w-xs">
                  <span className="text-emerald-400 text-sm label-text">Discount</span>
                  <span className="text-emerald-400 font-semibold text-lg">- ₹ {Number(formValues?.discount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px w-full max-w-xs bg-slate-600 my-1" />
                <div className="flex items-center justify-between w-full max-w-xs">
                  <span className="text-white font-bold text-lg label-text">Grand Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    ₹ {(Number(formValues?.subTotal || 0) - Number(formValues?.discount || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-5 flex items-center justify-between">
        <p className="text-xs text-slate-400 hidden md:block">
          {editingEstimation ? "Changes will be saved immediately" : "Fill all required fields to create estimation"}
        </p>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all duration-200"
            onClick={closeDrawer}
          >
            Close
          </Button>
          <Button
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 active:scale-[.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <CgSpinner className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                {editingEstimation ? "Update" : "Save"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Add Section Modal */}
      <Modal
        isOpen={OpenAddsectionModal}
        closeModal={() => setOpenAddsectionModal(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[500px] w-[340px] md:ml-[0px] ml-[10px] rounded-2xl"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiLayers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{isEditingSection ? "Edit Section" : "Add New Section"}</h3>
              <p className="text-xs text-slate-500">Create a category for your items</p>
            </div>
          </div>
          <CustomInput
            name="title"
            label="Section Title"
            placeholder="Enter section name"
            labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
            onChange={(e) => setSectionTitle(e.target.value)}
            type="text"
            required
            value={sectionTitle}
            errorMsg={errors?.item_name}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all"
              onClick={() => {
                setSectionTitle("");
                setOpenAddsectionModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center gap-2"
              onClick={addSection}
            >
              <FiPlus className="w-4 h-4" />
              {isEditingSection ? "Update" : "Add"} Section
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={openAddItemModal}
        closeModal={closeAddItemModal}
        title=""
        isCloseRequired={false}
        className="md:w-[700px] w-[360px] md:ml-[0px] ml-[10px] rounded-2xl"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FiPlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{isEditing ? "Edit Item" : "Add New Item"}</h3>
              <p className="text-xs text-slate-500">Add item details to the section</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              name="item_name"
              label="Item Name"
              placeholder="Enter item name"
              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
              onChange={(e) => handleItemChange("item_name", e.target.value)}
              type="text"
              required
              value={itemInformation?.item_name}
              errorMsg={errors?.item_name}
            />
            <CustomInput
              name="quantity"
              label="Quantity"
              placeholder="Enter quantity"
              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
              onChange={(e) => handleItemChange("quantity", e.target.value)}
              type="number"
              required
              value={itemInformation?.quantity || null}
              errorMsg={errors?.quantity}
            />
          </div>

          <CustomInput
            name="description"
            label="Item Description"
            labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
            placeholder="Enter a detailed description of the item"
            onChange={(e) => handleItemChange("description", e.target.value)}
            type="textarea"
            required
            value={itemInformation?.description}
            errorMsg={errors?.description}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              name="area"
              label="Area (sft/Box)"
              placeholder="Enter area"
              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
              onChange={(e) => handleItemChange("area", e.target.value)}
              type="number"
              required
              value={itemInformation?.area || null}
            />
            <CustomInput
              name="unit_price"
              label="Unit/Box Price (₹)"
              labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
              placeholder="Enter unit price"
              onChange={(e) => handleItemChange("unit_price", e.target.value)}
              type="number"
              required
              value={itemInformation?.unit_price || null}
              errorMsg={errors?.unit_price}
            />
          </div>

          {/* Calculated Amount Preview */}
          {(itemInformation?.amount ?? 0) > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-slate-600">Calculated Amount</span>
              <span className="text-lg font-bold text-slate-800">₹ {itemInformation.amount?.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all"
              onClick={closeAddItemModal}
            >
              Cancel
            </Button>
            <Button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              onClick={addItem}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CgSpinner className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  {isEditing ? "Update" : "Add"} Item
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Details Modal */}
      <Modal
        isOpen={addInfoModal}
        closeModal={() => setAddInfoModal(false)}
        title=""
        rootCls="w-full overflow-y-auto z-[99999]"
        isCloseRequired={false}
        className="md:max-w-[800px] max-w-[360px] md:ml-[0px] ml-[10px] rounded-2xl"
      >
        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Add Extra Details</h3>
              <p className="text-xs text-slate-500">Add notes or additional information</p>
            </div>
          </div>

          <RichTextEditor
            type="richtext"
            key="details"
            value={details}
            className="min-h-[200px]"
            onChange={(e) => setDetails(e)}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all"
              onClick={() => {
                setDetails(" ");
                setAddInfoModal(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all flex items-center gap-2"
              onClick={saveDetails}
            >
              <FiSave className="w-4 h-4" />
              Save Details
            </Button>
          </div>
        </div>
      </Modal>

      {/* Discount Modal */}
      <Modal
        isOpen={openDiscountModal}
        closeModal={() => setOpenDiscountModal(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[450px] w-[340px] md:ml-[0px] ml-[10px] rounded-2xl"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiPercent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Set Discount</h3>
              <p className="text-xs text-slate-500">Apply discount to the total</p>
            </div>
          </div>

          <CustomInput
            name="discount"
            label="Discount Amount (₹)"
            labelCls=" font-medium label-text leading-[22.8px] text-[#000000]"
            placeholder="Enter discount amount"
            type="number"
            value={discountInput}
            onChange={(e) => setDiscountInput(Number(+e.target.value || 0))}
          />

          {/* Preview */}
          {formValues?.subTotal > 0 ? (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">₹ {formValues.subTotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-500">Discount</span>
                <span className="text-purple-500">- ₹ {discountInput?.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Final Total</span>
                <span className="text-slate-800">₹ {(formValues.subTotal - discountInput)?.toLocaleString()}</span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all"
              onClick={() => setOpenDiscountModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all flex items-center gap-2"
              onClick={saveDiscount}
            >
              <FiSave className="w-4 h-4" />
              Save Discount
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CostEstimatorForm;
