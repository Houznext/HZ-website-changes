import Button from "@/src/common/Button";
import CustomDate from "@/src/common/FormElements/CustomDate";
import CustomInput from "@/src/common/FormElements/CustomInput";
import RichTextEditor from "@/src/common/FormElements/RichTextEditor";
import Modal from "@/src/common/Modal";
import SelectBtnGrp from "@/src/common/SelectBtnGrp";
import apiClient from "@/src/utils/apiClient";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdEdit } from "react-icons/md";
import { ConstEstimationTable } from "../../CostEstimatorDetailsView/ConstEstimationTable";
import { bhkArray } from "@/src/utils/propertyHelpers";
import { CgSpinner } from "react-icons/cg";
import { useRouter } from "next/router";
import {
  FiUser,
  FiHome,
  FiMapPin,
  FiPlus,
  FiX,
  FiSave,
  FiFileText,
  FiPercent,
  FiLayers,
  FiDownload,
  FiCheck,
} from "react-icons/fi";

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
    customerMobile: "",
    email: "",
    phone: null,
    date: "",
    property_type: null,
    property_name: "",
    designerName: "",
    bhk: null,
    subTotal: 0,
    discount: 0,
    workType: "",
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
  const [openClosePrompt, setOpenClosePrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [quotationStatus, setQuotationStatus] = useState<
    "draft" | "confirmed" | "revised"
  >("draft");
  const skipDirtyRef = useRef(true);
  const estimationIdRef = useRef<string | number | null>(null);
  const hydratedIdRef = useRef<string | number | null>(null);
  const formValuesRef = useRef(formValues);
  const draftSaveInFlightRef = useRef(false);
  const autoDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // GST state — default 18%, off by default
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const toDecimalString = (value: any) =>
    value === null || value === undefined ? "0" : String(value);

  const markDirty = () => {
    if (!skipDirtyRef.current) setIsDirty(true);
  };

  formValuesRef.current = formValues;

useEffect(() => {
    const incomingId = editingEstimation?.id ?? null;

    // Already hydrated this quotation — don't wipe local edits after silent draft saves.
    if (incomingId && hydratedIdRef.current === incomingId) {
      estimationIdRef.current = incomingId;
      if ((editingEstimation as any)?.status) {
        const s = (editingEstimation as any).status;
        setQuotationStatus(
          s === "draft" ? "draft" : s === "revised" ? "revised" : "confirmed"
        );
      }
      return;
    }

    skipDirtyRef.current = true;
    if (editingEstimation?.id) {
      hydratedIdRef.current = editingEstimation.id;
      estimationIdRef.current = editingEstimation.id;
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
        customerMobile: (editingEstimation as any).customerMobile || "",
        email: editingEstimation.email,
        phone: editingEstimation.phone,
        property_type: editingEstimation.property_type,
        property_name: editingEstimation.property_name,
        bhk: editingEstimation.bhk,
        workType: (editingEstimation as any).workType || "",
        floor_plan: editingEstimation.floor_plan,
        property_image: editingEstimation.property_image,
        date: editingEstimation?.date
          ? new Date(editingEstimation.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        subTotal: editingEstimation?.subTotal || 0,
        details: editingEstimation?.details,
        itemGroups,
        location: editingEstimation.location || {
          city: "",
          locality: "",
          sub_locality: "",
          landmark: "",
          pincode: "",
          state: "",
          address_line_1: "",
        },
        discount: editingEstimation.discount,
      });
      setLocationDetails({
        ...(editingEstimation.location || {
          city: "",
          locality: "",
          sub_locality: "",
          landmark: "",
          pincode: "",
          state: "",
          address_line_1: "",
        }),
      });
      setDetails(editingEstimation?.details);
      setGstEnabled((editingEstimation as any).gstEnabled ?? false);
      setGstPercentage((editingEstimation as any).gstPercentage ?? 18);
      setQuotationStatus(
        (editingEstimation as any).status === "draft"
          ? "draft"
          : (editingEstimation as any).status === "revised"
            ? "revised"
            : "confirmed"
      );
      setIsDirty(false);
    } else if (userId) {
      hydratedIdRef.current = null;
      estimationIdRef.current = null;
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
        customerMobile: "",
        email: "",
        phone: null,
        date: new Date().toISOString().split("T")[0],
        property_type: null,
        property_name: "",
        designerName: "",
        bhk: null,
        subTotal: 0,
        discount: 0,
        workType: "",
        details: "",
        floor_plan: "",
        property_image: "",
        itemGroups: [],
        location: emptyLocation,
      });
      setLocationDetails(emptyLocation);
      setDetails(undefined);
      setGstEnabled(false);
      setGstPercentage(18);
      setQuotationStatus("draft");
      setIsDirty(false);
    }
    const t = setTimeout(() => {
      skipDirtyRef.current = false;
    }, 300);
    return () => clearTimeout(t);
  }, [editingEstimation, userId]);

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      location: { ...locationDetails },
    }));
  }, [locationDetails]);

  useEffect(() => {
    return () => {
      if (autoDraftTimerRef.current) clearTimeout(autoDraftTimerRef.current);
    };
  }, []);

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
    markDirty();
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (name: string, value: string) => {
    markDirty();
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
    if (!sectionTitle.trim()) {
      toast.error("Please enter a valid section title");
      return;
    }

    let updatedFormData;

    if (isEditingSection && editingSectionIndex !== null) {
      updatedFormData = {
        ...formValues,
        itemGroups: formValues.itemGroups?.map((group, index) =>
          index === editingSectionIndex
            ? { ...group, title: sectionTitle }
            : group
        ),
      };
    } else {
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

    markDirty();
    setFormValues(updatedFormData);

    const estId = estimationIdRef.current || editingEstimation?.id;
    if (setCostEstimators && estId) {
      setCostEstimators((prev) =>
        prev.map((estimation) =>
          estimation.id === estId
            ? { id: estId, ...updatedFormData }
            : estimation
        )
      );
    }

    setCurrentSection(sectionTitle);
    setSectionTitle("");
    setIsEditingSection(false);
    setEditingSectionIndex(null);
    setOpenAddsectionModal(false);
    toast.success(
      isEditingSection ? "Section updated" : "Section added"
    );
  };

  // -------Add, remove and edit item functions------------------
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const addItem = async () => {
    if (!validateItem()) return;

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

    markDirty();
    setFormValues(updatedFormData);

    const estId = estimationIdRef.current || editingEstimation?.id;
    if (setCostEstimators && estId) {
      setCostEstimators((prev) =>
        prev.map((estimation) =>
          estimation.id === estId
            ? { id: estId, ...updatedFormData }
            : estimation
        )
      );
    }

    toast.success(isEditing ? "Item updated" : "Item added");
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
    closeAddItemModal();
    setLoading(false);
  };

  const removeItem = (id: number) => {
    markDirty();
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
    markDirty();
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

  // ---------------- Submit / draft / confirm ----------------

  const buildPayload = (
    status: "draft" | "confirmed" | "revised",
    values: typeof formValues = formValues
  ) => {
    const pct = Number(gstPercentage);
    const rawPhone =
      values.phone !== null &&
      values.phone !== undefined &&
      String(values.phone).trim() !== ""
        ? Number(values.phone)
        : undefined;
    const phoneVal = Number.isFinite(rawPhone as number)
      ? (rawPhone as number)
      : undefined;
    return {
      ...values,
      phone: phoneVal,
      property_type: values.property_type || undefined,
      bhk: values.bhk || undefined,
      customerMobile: String(values.customerMobile || ""),
      email: values.email || undefined,
      firstname: values.firstname || "",
      lastname: values.lastname || "",
      subTotal: Number(values.subTotal) || 0,
      details: details ?? values.details,
      discount: toDecimalString(values.discount),
      category: categoryProp ?? (activetab?.category as string) ?? "Interior",
      gstEnabled: Boolean(gstEnabled),
      gstPercentage: Number.isFinite(pct) ? pct : 18,
      status,
      location: {
        city: "",
        locality: "",
        sub_locality: "",
        landmark: "",
        state: "",
        pincode: "",
        address_line_1: "",
        ...(values.location || {}),
      },
      itemGroups: (values.itemGroups || []).map((group, index) => ({
        id: group.id,
        title: group.title,
        order: group.order ?? index,
        items: (group.items || []).map((item) => ({
          id: item.id || undefined,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
          amount: Number(item.amount) || 0,
          area: Number(item.area) || 0,
          item_name: item.item_name || "",
          description: item.description || "",
        })),
      })),
    };
  };

  const hasDraftableContent = (values: typeof formValues) => {
    const loc = values.location || locationDetails;
    return Boolean(
      values.firstname?.trim() ||
        values.lastname?.trim() ||
        values.email?.trim() ||
        values.customerMobile?.trim() ||
        values.phone ||
        values.designerName?.trim() ||
        values.property_name?.trim() ||
        values.bhk ||
        values.property_type ||
        (values.itemGroups && values.itemGroups.length > 0) ||
        loc?.city?.trim() ||
        loc?.locality?.trim() ||
        loc?.address_line_1?.trim() ||
        loc?.pincode?.trim() ||
        (typeof details === "string" && details.trim()) ||
        Number(values.discount) > 0
    );
  };

  const persistQuotation = async (
    status: "draft" | "confirmed" | "revised",
    options?: { silent?: boolean; requireFullValidation?: boolean }
  ): Promise<any | null> => {
    if (options?.requireFullValidation && !validate()) return null;
    if (draftSaveInFlightRef.current && options?.silent) return null;

    draftSaveInFlightRef.current = true;
    if (!options?.silent) setLoading(true);

    try {
      const payLoad = buildPayload(status);
      const estId = estimationIdRef.current || editingEstimation?.id;
      let response: any = null;

      if (estId) {
        response = await apiClient.put(
          `${apiClient.URLS.cost_estimator}/${estId}`,
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

      if (response.status === 201 || response.status === 200) {
        const body = response.body;
        if (body?.id) {
          estimationIdRef.current = body.id;
          hydratedIdRef.current = body.id;
          if (options?.silent) {
            setEditingEstimation?.((prev: any) => ({
              ...(prev || {}),
              ...formValuesRef.current,
              id: body.id,
              quotationNumber: body.quotationNumber,
              status: body.status || status,
              gstEnabled,
              gstPercentage,
              details: details ?? formValuesRef.current.details,
            }));
          } else {
            setEditingEstimation?.(body);
          }
          if (setCostEstimators) {
            setCostEstimators((prev: any[]) => {
              const exists = prev.some((e) => e.id === body.id);
              if (exists) {
                return prev.map((e) =>
                  e.id === body.id ? { ...e, ...body } : e
                );
              }
              return [body, ...prev];
            });
          }
        }
        setQuotationStatus(status);
        setIsDirty(false);
        if (!options?.silent) {
          onSuccessRefetch?.();
          fetchDetails?.();
        }
        return body;
      }
      return null;
    } catch (error: any) {
      console.error("Error saving estimation:", error);
      if (!options?.silent) {
        const message =
          error?.body?.message ||
          error?.message ||
          "Failed to save the details";
        toast.error(
          Array.isArray(message) ? message.join(", ") : String(message)
        );
      }
      return null;
    } finally {
      draftSaveInFlightRef.current = false;
      if (!options?.silent) setLoading(false);
    }
  };

  const saveAsDraft = async (options?: { silent?: boolean; closeAfter?: boolean }) => {
    const saved = await persistQuotation("draft", {
      silent: options?.silent,
      requireFullValidation: false,
    });
    if (saved && !options?.silent) {
      toast.success("Draft saved.");
    }
    if (saved && options?.closeAfter) {
      setOpenClosePrompt(false);
      closeDrawer();
    }
    return Boolean(saved);
  };

  const confirmQuote = async () => {
    if (!validate()) {
      toast.error("Please fill all required fields before confirming.");
      return;
    }
    if (!formValues.itemGroups?.length) {
      toast.error("Add at least one section before confirming.");
      return;
    }
    // Re-confirming an already issued quote marks it as revised.
    const nextStatus =
      quotationStatus === "confirmed" || quotationStatus === "revised"
        ? "revised"
        : "confirmed";
    const saved = await persistQuotation(nextStatus, {
      requireFullValidation: true,
    });
    if (saved) {
      toast.success(
        nextStatus === "revised"
          ? "Quotation revised and saved."
          : "Quotation confirmed. Finance has been notified."
      );
    }
  };

  const handleDownload = async () => {
    if (quotationStatus === "draft") {
      toast.error("Confirm quote first to download the PDF.");
      return;
    }
    const estId = estimationIdRef.current || editingEstimation?.id;
    if (!estId) {
      toast.error("Save and confirm the quote before downloading.");
      return;
    }
    if (isDirty) {
      const nextStatus =
        quotationStatus === "revised" ? "revised" : "confirmed";
      const saved = await persistQuotation(nextStatus, {
        requireFullValidation: true,
      });
      if (!saved) return;
    }
    const category =
      categoryProp ?? (activetab?.category as string) ?? "Interior";
    router.push(`/cost-estimator/${category}/${estId}?download=1`);
  };

  const requestClose = () => {
    if (isDirty || (!estimationIdRef.current && hasDraftableContent(formValues))) {
      setOpenClosePrompt(true);
      return;
    }
    closeDrawer();
  };

  // Auto-save draft when any field has content (mirrors invoice draft flow).
  useEffect(() => {
    if (skipDirtyRef.current) return;
    if (!isDirty) return;
    if (quotationStatus === "confirmed" || quotationStatus === "revised")
      return;
    if (!hasDraftableContent(formValues)) return;
    if (!userId) return;

    if (autoDraftTimerRef.current) clearTimeout(autoDraftTimerRef.current);
    autoDraftTimerRef.current = setTimeout(() => {
      void saveAsDraft({ silent: true });
    }, 900);

    return () => {
      if (autoDraftTimerRef.current) clearTimeout(autoDraftTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formValues,
    details,
    gstEnabled,
    gstPercentage,
    quotationStatus,
    userId,
    isDirty,
  ]);

  const saveDetails = async () => {
    const formattedDetails = convertToOrderedList(details);
    setAddInfoModal(false);
    markDirty();
    setFormValues((prev) => ({
      ...prev,
      details: formattedDetails,
    }));
    setDetails(formattedDetails);

    const estId = estimationIdRef.current || editingEstimation?.id;
    if (!estId) {
      toast.success("Details added — will save with draft");
      return;
    }

    try {
      await apiClient.put(
        `${apiClient.URLS.cost_estimator}/${estId}`,
        { details: formattedDetails, status: quotationStatus },
        true
      );
      toast.success("Successfully saved details");
      fetchDetails?.();
    } catch (error) {
      console.error("Error saving details:", error);
      toast.error("Failed to save the details");
    }
  };

  const saveDiscount = async () => {
    const numericDiscount = Number(discountInput) || 0;
    markDirty();
    setFormValues((prev) => ({ ...prev, discount: numericDiscount }));
    setOpenDiscountModal(false);

    const estimationId = estimationIdRef.current || editingEstimation?.id;
    if (!estimationId) {
      toast.success("Discount applied — will save with draft");
      return;
    }

    try {
      await apiClient.put(
        `${apiClient.URLS.cost_estimator}/${estimationId}`,
        {
          discount: numericDiscount.toString(),
          status: quotationStatus,
        },
        true
      );
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
    <div className="h-full flex flex-col" style={{ background: '#f6f8fa', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(47,128,237,0.1)' }}
          >
            <FiFileText className="w-4 h-4 text-[#2f80ed]" />
          </div>
          <div>
            <h1
              className="text-[15px] font-bold text-gray-800 tracking-tight"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {editingEstimation?.id ? "Edit Quotation" : "New Quotation"}
              <span
                className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold align-middle ${
                  quotationStatus === "confirmed"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : quotationStatus === "revised"
                      ? "bg-violet-50 text-violet-700 border border-violet-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {quotationStatus === "confirmed"
                  ? "Confirmed"
                  : quotationStatus === "revised"
                    ? "Revised"
                    : "Draft"}
              </span>
            </h1>
            {editingEstimation && (
              <p className="text-[11.5px] text-gray-400 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {editingEstimation.firstname} {editingEstimation.lastname}
                {(editingEstimation as any)?.quotationNumber &&
                  ` · QT-${String((editingEstimation as any).quotationNumber).padStart(4, "0")}`}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={requestClose}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center
                     bg-gray-50 hover:bg-red-50 border border-gray-200
                     hover:border-red-200 text-gray-400 hover:text-red-500
                     transition-all duration-150"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* ── Scroll area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* ── User Information ── */}
        <div className="bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3" style={{ background: '#f9fafb' }}>
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(47,128,237,0.1)' }}
            >
              <FiUser className="w-4 h-4 text-[#2f80ed]" />
            </div>
            <div>
              <h2 className="text-[13.5px] font-semibold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>User Information</h2>
              <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>Customer and designer details</p>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-[10px] border border-gray-100 p-4">
                <p className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-[0.06em]">Prepared For</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <CustomInput
                    type="text"
                    label="First Name"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.firstname}
                    onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    required
                    placeholder="Enter first name"
                    errorMsg={error?.firstname}
                    name="firstname"
                  />
                  <CustomInput
                    type="text"
                    label="Last Name"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.lastname}
                    onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    required
                    placeholder="Enter last name"
                    errorMsg={error?.lastname}
                    name="lastname"
                  />
                  <CustomInput
                    label="User Contact"
                    type="text"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.customerMobile}
                    onChange={(e) => handleFormChange(e.target.name, e.target.value.replace(/\D/g, "").slice(0, 15))}
                    required
                    placeholder="User mobile number"
                    errorMsg={error?.customerMobile}
                    name="customerMobile"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-[10px] border border-gray-100 p-4">
                <p className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-[0.06em]">Prepared By</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <CustomInput
                    type="text"
                    rootCls="w-full"
                    label="Designer Name"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.designerName}
                    onChange={(e) => handleFormChange("designerName", e.target.value)}
                    required
                    placeholder="Designer name"
                    errorMsg={error?.designerName}
                    name="designerName"
                  />
                  <CustomInput
                    label="Email"
                    type="email"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.email}
                    onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    required
                    placeholder="Enter email"
                    errorMsg={error?.email}
                    name="email"
                  />
                  <CustomInput
                    label="Phone Number"
                    type="number"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.phone}
                    onChange={(e) => handleFormChange(e.target.name, +e.target.value)}
                    required
                    placeholder="Phone number"
                    errorMsg={error?.phone}
                    name="phone"
                  />
                  <CustomDate
                    label="Date of Estimation"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    value={formValues.date}
                    onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                    placeholder="Date of estimation"
                    errorMsg={error?.date}
                    name="date"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Property Details ── */}
        <div className="bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3" style={{ background: '#f9fafb' }}>
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(47,128,237,0.1)' }}
            >
              <FiHome className="w-4 h-4 text-[#2f80ed]" />
            </div>
            <div>
              <h2 className="text-[13.5px] font-semibold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Property Details</h2>
              <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>Property information and type</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Left card */}
              <div className="bg-gray-50 rounded-[10px] border border-gray-100 p-4 space-y-4">
                <CustomInput
                  type="text"
                  label="Property Name"
                  labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                  rootCls="md:max-w-none"
                  value={formValues.property_name}
                  onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                  required
                  placeholder="Property name"
                  name="property_name"
                />
                <div className="min-w-0">
                  <SelectBtnGrp
                    options={proprtyTypes}
                    label="Property Type"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    className="md:gap-2 gap-1 flex-wrap"
                    btnClass="text-[13px] font-medium rounded-[8px] px-3 py-2
                               border border-gray-200 hover:border-[#2f80ed]
                               hover:bg-blue-50 hover:text-[#2f80ed]
                               transition-all duration-150"
                    onSelectChange={(v) => handleFormChange("property_type", v as string)}
                    slant={false}
                    defaultValue={formValues.property_type}
                  />
                </div>
              </div>

              {/* Right card */}
              <div className="bg-gray-50 rounded-[10px] border border-gray-100 p-4 space-y-4">
                <div className="min-w-0">
                  <SelectBtnGrp
                    options={bhkArray}
                    label="No of BHK"
                    labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                    className="flex flex-wrap gap-2"
                    btnClass="text-[13px] font-medium rounded-[8px] px-3 py-2
                               border border-gray-200 hover:border-[#2f80ed]
                               hover:bg-blue-50 hover:text-[#2f80ed]
                               transition-all duration-150"
                    onSelectChange={(v) => handleFormChange("bhk", v as string)}
                    slant={false}
                    defaultValue={formValues.bhk}
                  />
                </div>
                <div className="md:hidden">
                  <select
                    className="mt-2 w-full rounded-[8px] border border-[#d0d7de] px-3 py-2 text-[13px] text-[#24292f] focus:outline-none focus:ring-2 focus:ring-[#2f80ed]/20 focus:border-[#2f80ed]"
                    value={formValues.bhk || ""}
                    onChange={(e) => handleFormChange("bhk", e.target.value)}
                  >
                    <option value="">Select BHK</option>
                    {bhkArray.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <CustomInput
                  type="text"
                  label="Work Type"
                  labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                  rootCls="md:max-w-none"
                  value={formValues.workType || ""}
                  onChange={(e) => handleFormChange(e.target.name, e.target.value)}
                  placeholder="e.g. Interior Works"
                  name="workType"
                />
              </div>
            </div>

            {/* File inputs */}
            <div className="grid md:grid-cols-2 gap-4 pt-1">
              <FileInput
                name="Floor plan"
                type="file"
                label="Floor Plan"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                initialFileUrl={formValues.floor_plan}
                folderName="cost-estimator"
                onFileChange={(url) => handleFormChange("floor_plan", url)}
              />
              <FileInput
                name="Property image"
                type="file"
                label="Property Image"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                initialFileUrl={formValues.property_image}
                folderName="cost-estimator"
                onFileChange={(url) => handleFormChange("property_image", url)}
              />
            </div>
          </div>
        </div>

        {/* ── Location Details ── */}
        <div className="bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3" style={{ background: '#f9fafb' }}>
            <div
              className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(47,128,237,0.1)' }}
            >
              <FiMapPin className="w-4 h-4 text-[#2f80ed]" />
            </div>
            <div>
              <h2 className="text-[13.5px] font-semibold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Location Details</h2>
              <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>Property address and location</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <CustomInput
                type="text"
                label="City"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                value={locationDetails.city}
                onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
                placeholder="City"
                errorMsg={error?.location?.city}
                name="city"
                required
              />
              <CustomInput
                type="text"
                label="State"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                value={locationDetails.state}
                onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
                placeholder="State"
                errorMsg={error?.location?.state}
                name="state"
                required
              />
              <CustomInput
                type="text"
                label="Locality"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                value={locationDetails.locality}
                onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
                placeholder="Locality"
                errorMsg={error?.location?.locality}
                name="locality"
                required
              />
              <CustomInput
                type="text"
                label="Pincode"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                value={locationDetails.pincode}
                onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
                placeholder="Pincode"
                errorMsg={error?.location?.pincode}
                name="pincode"
                required
              />
              <CustomInput
                type="text"
                label="Sub Locality"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                value={locationDetails.sub_locality}
                onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
                placeholder="Sub locality"
                errorMsg={error?.location?.sub_locality}
                name="sub_locality"
              />
              <CustomInput
                type="text"
                label="Landmark"
                labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
                value={locationDetails.landmark}
                onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
                placeholder="Landmark"
                errorMsg={error?.location?.landmark}
                name="landmark"
              />
            </div>
            <CustomInput
              type="textarea"
              label="Full Address"
              labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
              value={locationDetails.address_line_1}
              onChange={(e) => handleLocationChange(e.target.name, e.target.value)}
              placeholder="Enter complete address"
              errorMsg={error?.location?.address_line_1}
              name="address_line_1"
            />
          </div>
        </div>

        {/* ── Item Groups ── */}
        <div className="bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between" style={{ background: '#f9fafb' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(47,128,237,0.1)' }}
              >
                <FiLayers className="w-4 h-4 text-[#2f80ed]" />
              </div>
              <div>
                <h2 className="text-[13.5px] font-semibold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Item Groups</h2>
                <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Amount = Quantity × Unit Price × Area
                </p>
              </div>
            </div>
            <button
              onClick={AddsectionModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                         border border-gray-200 bg-white hover:bg-gray-50
                         text-gray-600 hover:text-gray-800 text-[12px] font-medium
                         transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <FiPlus className="w-3.5 h-3.5" /> Add Section
            </button>
          </div>
          <div className="p-4">
            {formValues?.itemGroups?.length > 0 ? (
              <ConstEstimationTable
                costEstimation={formValues}
                isInForm={true}
                editItem={editItem}
                deleteItem={removeItem}
                removeSection={removeSection}
                handleSubmit={() => void saveAsDraft()}
                openModal={openItemModal}
                openSectionModal={AddsectionModal}
                editSection={editSection}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-[10px] bg-[#f6f8fa] border border-[#eaeef2] flex items-center justify-center mb-3">
                  <FiLayers className="w-5 h-5 text-[#8c959f]" />
                </div>
                <p className="text-[13px] font-medium text-[#57606a]">No sections yet</p>
                <p className="text-[11.5px] text-[#8c959f] mt-0.5">
                  Click + Add Section to start building this quote
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Details preview ── */}
        {formValues?.details?.length > 0 && (
          <div className="bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between" style={{ background: '#f9fafb' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(47,128,237,0.1)' }}
                >
                  <FiFileText className="w-4 h-4 text-[#2f80ed]" />
                </div>
                <div>
                  <h2 className="text-[13.5px] font-semibold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Additional Details</h2>
                  <p className="text-[11px] text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>Extra information and notes</p>
                </div>
              </div>
              <button
                onClick={EditDetails}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[8px]
                           border border-[#d0d7de] bg-white hover:bg-[#f6f8fa]
                           text-[#57606a] hover:text-[#24292f] text-[12px] font-medium
                           transition-all duration-150"
              >
                <MdEdit className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
            <div className="p-5">
              <div
                dangerouslySetInnerHTML={{ __html: formValues?.details }}
                className="text-[13.5px] text-[#57606a] leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ── Totals summary ── */}
        {formValues?.itemGroups?.length > 0 && (
          <div className="bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="p-5">
              <div className="flex flex-col gap-2">

                {/* GST toggle row */}
                <div className="flex items-center gap-3 pb-3 border-b border-[#eaeef2]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={gstEnabled}
                      onChange={(e) => {
                        markDirty();
                        setGstEnabled(e.target.checked);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-[#2f80ed] accent-[#2f80ed] cursor-pointer"
                    />
                    <span className="text-[13px] font-semibold text-[#24292f]" style={{ fontFamily: "'Inter', sans-serif" }}>
                      Include GST
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={gstPercentage}
                      onChange={(e) => {
                        markDirty();
                        setGstPercentage(Number(e.target.value) || 0);
                      }}
                      className="w-16 px-2 py-1 text-[13px] font-semibold text-[#24292f] border border-[#d0d7de] rounded-[6px] text-right focus:outline-none focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed]"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                    <span className="text-[13px] text-[#8c959f]">%</span>
                  </div>
                  {gstEnabled && (
                    <span className="text-[11px] text-[#8c959f] ml-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
                      GST on after-discount total
                    </span>
                  )}
                </div>

                {/* Amounts */}
                <div className="flex flex-col items-end gap-2 max-w-xs ml-auto w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[12.5px] text-[#8c959f]">Subtotal</span>
                    <span className="text-[14px] font-semibold text-[#24292f] tabular-nums">
                      ₹ {Number(formValues?.subTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {Number(formValues?.discount) > 0 && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[12.5px] text-[#16a34a]">Discount</span>
                      <span className="text-[14px] font-semibold text-[#16a34a] tabular-nums">
                        − ₹ {Number(formValues?.discount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {gstEnabled && (() => {
                    const base = Number(formValues?.subTotal || 0) - Number(formValues?.discount || 0);
                    const gstAmt = base * (gstPercentage / 100);
                    return (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[12.5px] text-[#d97706]">GST ({gstPercentage}%)</span>
                        <span className="text-[14px] font-semibold text-[#d97706] tabular-nums">
                          + ₹ {gstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })()}
                  <div className="h-px w-full bg-[#eaeef2] my-1" />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[13px] font-bold text-[#24292f]">Grand Total</span>
                    <span className="text-[18px] font-bold text-[#2f80ed] tabular-nums">
                      {(() => {
                        const base = Number(formValues?.subTotal || 0) - Number(formValues?.discount || 0);
                        const grand = gstEnabled ? base + base * (gstPercentage / 100) : base;
                        return `₹ ${grand.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky footer actions ── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Add Details */}
          <button
            onClick={EditDetails}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px]
                       border border-gray-200 bg-white hover:bg-gray-50
                       text-gray-600 text-[12.5px] font-medium transition-all"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <FiFileText className="w-3.5 h-3.5" /> Add Details
          </button>

          {/* Discount */}
          <button
            onClick={() => setOpenDiscountModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px]
                       border border-purple-200 bg-purple-50 hover:bg-purple-100
                       text-purple-600 text-[12.5px] font-medium transition-all"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <FiPercent className="w-3.5 h-3.5" />
            Discount
            {Number(formValues.discount) > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                ₹{Number(formValues.discount).toLocaleString("en-IN")}
              </span>
            )}
          </button>
        </div>

        {/* Estimated total */}
        {formValues.subTotal > 0 && (
          <div className="text-center hidden md:block">
            <div className="text-[10.5px] font-medium text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
              {gstEnabled ? `Estimated total (incl. GST ${gstPercentage}%)` : 'Estimated total'}
            </div>
            <div
              className="text-[18px] font-black text-[#2f80ed] tracking-tight tabular-nums"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {(() => {
                const base = (Number(formValues.subTotal) || 0) - (Number(formValues.discount) || 0);
                const grand = gstEnabled ? base + base * (gstPercentage / 100) : base;
                return `₹${grand.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              })()}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => void saveAsDraft()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px]
                       border border-gray-200 bg-white hover:bg-gray-50
                       font-semibold text-gray-700 text-[13px]
                       transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {loading ? (
              <CgSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => void confirmQuote()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px]
                       font-bold text-white text-[13px]
                       shadow-[0_1px_3px_rgba(47,128,237,0.3)]
                       hover:shadow-[0_4px_14px_rgba(47,128,237,0.4)]
                       hover:-translate-y-px active:translate-y-0
                       transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            style={{ background: '#2f80ed', fontFamily: "'Montserrat', sans-serif" }}
          >
            {loading ? (
              <CgSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FiCheck className="w-4 h-4" />
            )}
            Confirm quote
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px]
                       border border-[#d0d7de] bg-[#f6f8fa] hover:bg-white
                       font-semibold text-[#24292f] text-[13px]
                       transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            title={
              quotationStatus === "draft"
                ? "Confirm quote first to download"
                : "Download PDF"
            }
          >
            <FiDownload className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* ── Close prompt: save as draft ── */}
      <Modal
        isOpen={openClosePrompt}
        closeModal={() => setOpenClosePrompt(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[420px] w-[340px] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-4 w-full p-1">
          <div>
            <h3
              className="text-[15px] font-bold text-gray-800"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Save as draft?
            </h3>
            <p className="text-[13px] text-gray-500 mt-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              You have unsaved changes. Save this quotation as a draft, discard changes, or keep editing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setOpenClosePrompt(false)}
              className="px-3 py-2 rounded-[8px] border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => {
                setOpenClosePrompt(false);
                setIsDirty(false);
                closeDrawer();
              }}
              className="px-3 py-2 rounded-[8px] border border-red-200 bg-red-50 text-[13px] font-medium text-red-600 hover:bg-red-100"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void saveAsDraft({ closeAfter: true })}
              className="px-3 py-2 rounded-[8px] bg-[#2f80ed] text-white text-[13px] font-semibold hover:bg-[#1a6dd6] disabled:opacity-60"
            >
              Save as draft
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add Section Modal ── */}
      <Modal
        isOpen={OpenAddsectionModal}
        closeModal={() => setOpenAddsectionModal(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[500px] w-[340px] md:ml-[0px] ml-[10px] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center"
              style={{ background: 'rgba(47,128,237,0.1)' }}
            >
              <FiLayers className="w-4 h-4 text-[#2f80ed]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {isEditingSection ? "Edit Section" : "Add New Section"}
              </h3>
              <p className="text-[11.5px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Create a category for your items</p>
            </div>
          </div>
          <CustomInput
            name="title"
            label="Section Title"
            placeholder="Enter section name"
            labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
            onChange={(e) => setSectionTitle(e.target.value)}
            type="text"
            required
            value={sectionTitle}
            errorMsg={errors?.item_name}
          />
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={() => { setSectionTitle(""); setOpenAddsectionModal(false); }}
              className="px-4 py-2 rounded-[8px] bg-gray-50 hover:bg-gray-100 border border-gray-200
                         text-gray-600 text-[13px] font-medium transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={addSection}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[8px]
                         bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[13px] font-semibold
                         shadow-[0_1px_3px_rgba(47,128,237,0.3)] transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <FiPlus className="w-3.5 h-3.5" />
              {isEditingSection ? "Update" : "Add"} Section
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add Item Modal ── */}
      <Modal
        isOpen={openAddItemModal}
        closeModal={closeAddItemModal}
        title=""
        isCloseRequired={false}
        className="md:w-[700px] w-[360px] md:ml-[0px] ml-[10px] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center"
              style={{ background: 'rgba(47,128,237,0.1)' }}
            >
              <FiPlus className="w-4 h-4 text-[#2f80ed]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {isEditing ? "Edit Item" : "Add New Item"}
              </h3>
              <p className="text-[11.5px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Add item details to the section</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              name="item_name"
              label="Item Name"
              placeholder="Enter item name"
              labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
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
              labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
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
            labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
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
              labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
              onChange={(e) => handleItemChange("area", e.target.value)}
              type="number"
              required
              value={itemInformation?.area || null}
            />
            <CustomInput
              name="unit_price"
              label="Unit/Box Price (₹)"
              labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
              placeholder="Enter unit price"
              onChange={(e) => handleItemChange("unit_price", e.target.value)}
              type="number"
              required
              value={itemInformation?.unit_price || null}
              errorMsg={errors?.unit_price}
            />
          </div>

          {/* Calculated amount preview */}
          {(itemInformation?.amount ?? 0) > 0 && (
            <div className="bg-gray-50 rounded-[10px] border border-gray-100 p-4 flex items-center justify-between">
              <span className="text-[12.5px] text-[#57606a] font-medium">Calculated Amount</span>
              <span className="text-[16px] font-bold text-[#2f80ed] tabular-nums">
                ₹ {itemInformation.amount?.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={closeAddItemModal}
              className="px-4 py-2 rounded-[8px] bg-gray-50 hover:bg-gray-100 border border-gray-200
                         text-gray-600 text-[13px] font-medium transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={addItem}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[8px]
                         bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[13px] font-semibold
                         shadow-[0_1px_3px_rgba(47,128,237,0.3)] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {loading ? (
                <>
                  <CgSpinner className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiPlus className="w-3.5 h-3.5" />
                  {isEditing ? "Update" : "Add"} Item
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add Details Modal ── */}
      <Modal
        isOpen={addInfoModal}
        closeModal={() => setAddInfoModal(false)}
        title=""
        rootCls="w-full overflow-y-auto z-[99999]"
        isCloseRequired={false}
        className="md:max-w-[800px] max-w-[360px] md:ml-[0px] ml-[10px] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center"
              style={{ background: 'rgba(47,128,237,0.1)' }}
            >
              <FiFileText className="w-4 h-4 text-[#2f80ed]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Add Extra Details</h3>
              <p className="text-[11.5px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Add notes or additional information</p>
            </div>
          </div>

          <RichTextEditor
            type="richtext"
            key="details"
            value={details}
            className="min-h-[200px]"
            onChange={(e) => setDetails(e)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={() => { setDetails(" "); setAddInfoModal(false); }}
              className="px-4 py-2 rounded-[8px] bg-gray-50 hover:bg-gray-100 border border-gray-200
                         text-gray-600 text-[13px] font-medium transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={saveDetails}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[8px]
                         bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[13px] font-semibold
                         shadow-[0_1px_3px_rgba(47,128,237,0.3)] transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <FiSave className="w-3.5 h-3.5" />
              Save Details
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Discount Modal ── */}
      <Modal
        isOpen={openDiscountModal}
        closeModal={() => setOpenDiscountModal(false)}
        title=""
        isCloseRequired={false}
        className="md:w-[450px] w-[340px] md:ml-[0px] ml-[10px] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        rootCls="z-[99999]"
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-3 pb-3.5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-[8px] bg-purple-50 flex items-center justify-center">
              <FiPercent className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>Set Discount</h3>
              <p className="text-[11.5px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>Apply discount to the total</p>
            </div>
          </div>

          <CustomInput
            name="discount"
            label="Discount Amount (₹)"
            labelCls="text-[11.5px] font-medium text-gray-500 mb-1"
            placeholder="Enter discount amount"
            type="number"
            value={discountInput}
            onChange={(e) => setDiscountInput(Number(+e.target.value || 0))}
          />

          {/* Preview */}
          {formValues?.subTotal > 0 ? (
            <div className="bg-gray-50 rounded-[10px] border border-gray-100 p-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#8c959f]">Subtotal</span>
                <span className="text-[#57606a] font-medium tabular-nums">
                  ₹ {formValues.subTotal?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[#7c3aed]">Discount</span>
                <span className="text-[#7c3aed] font-medium tabular-nums">
                  − ₹ {discountInput?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-px bg-[#eaeef2] my-1" />
              <div className="flex justify-between">
                <span className="text-[13px] font-semibold text-[#24292f]">Final Total</span>
                <span className="text-[14px] font-bold text-[#2f80ed] tabular-nums">
                  ₹ {(formValues.subTotal - discountInput)?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              onClick={() => setOpenDiscountModal(false)}
              className="px-4 py-2 rounded-[8px] bg-gray-50 hover:bg-gray-100 border border-gray-200
                         text-gray-600 text-[13px] font-medium transition-all"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={saveDiscount}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-[8px]
                         bg-[#2f80ed] hover:bg-[#1a6dd6] text-white text-[13px] font-semibold
                         shadow-[0_1px_3px_rgba(47,128,237,0.3)] transition-all"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <FiSave className="w-3.5 h-3.5" />
              Save Discount
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CostEstimatorForm;
