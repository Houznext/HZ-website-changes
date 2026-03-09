import React, { useState, useEffect } from "react";
import { HomeMini } from "@mui/icons-material";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import CustomDate from "@/src/common/FormElements/CustomDate";
import ImageUploader from "@/src/common/DragImageInput";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import { FaTag, FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { ProductOfferType, PRODUCT_OFFER_TYPE_OPTIONS } from "@/src/constants/productOfferTypes";
interface ValidationErrors {
  name?: string;
  price?: string;
  prodDetails?: string;
  discount?: string;
  productQuantity?: string;
  images?: string;
  design?: string;
  color?: string;
  deliveryTime?: string;
  assembly?: string;
  warranty?: string;
  brand?: string;
  deliveryLocations?: string;
  [key: string]: string | undefined;
}

export interface HomeDecorOffer {
  type: string;
  title: string;
  description?: string;
  code?: string;
  validFrom?: string;
  validTo?: string;
}

interface HomeDecorData {
  id?: number;
  name: string;
  price: number;
  prodDetails: string;
  currentPrice?: number;
  discount: number;
  category: HomeDecorsCategory;
  images: string[];
  design: string;
  color: string;
  shape: string;
  productQuantity: string;
  otherProperties: Record<string, any>;
  deliveryTime: string;
  assembly: string;
  customizeOptions: boolean;
  warranty: string;
  brand: string;
  deliveryLocations: string;
  currencyCode?: string;
  taxPercentage?: number;
  hsnCode?: string;
  gstInclusive?: boolean;
  offers?: HomeDecorOffer[];
  applicableCouponCodes?: string[];
  returnPolicy?: string;
  isCODAvailable?: boolean;
  shippingDetails?: { weight?: number; dimensions?: string };
  metaTitle?: string;
  metaDescription?: string;
  searchTags?: string[];
}
export enum HomeDecorsCategory {
  // Furniture and Storage
  NewArrivals = "New Arrivals",
  WallShelves = "Wall Shelves",
  Baskets = "Baskets",

  // Decorative Items
  PhotoFrame = "Photo Frame",
  WallMirrors = "Wall Mirrors",
  WallartAndPaintings = "Wall Art and Paintings",
  Figurines = "Figurines",
  Miniatures = "Miniatures",

  // Plants and Gardening
  PotsAndPlants = "Pots and Plants",
  ArtificalPlantsAndFlowers = "Artificial Plants and Flowers",
  PlantStand = "Plant Stand",
  HangingPlanters = "Hanging Planters",
  Gardening = "Gardening",

  // Festive and Seasonal
  FestiveDecor = "Festive Decor",
  Candles = "Candles",
  DecorGiftSets = "Decor Gift Sets",

  // Dining and Tableware
  Tableware = "Tableware",
  DinnerSet = "Dinner Set",
  CoffeeMugs = "Coffee Mugs",
  ServingTrays = "Serving Trays",
  Teapots = "Teapots",
  Glassware = "Glassware",

  // Miscellaneous
  Clocks = "Clocks",
  HomeTemples = "Home Temples",
  Trays = "Trays",
  HomeFragrances = "Home Fragrances",
  FlowerPotAndVases = "Flower Pot and Vases",
  Vases = "Vases",
  WallHanging = "Wall Hanging",
  WallpapersAndDecals = "Wallpapers and Decals",
  Fountains = "Fountains",
  KeyHolder = "Key Holder",
  OutdoorDecors = "Outdoor Decors",
}
const defaultHomeDecor = {
  id: undefined,
  name: "",
  price: 0,
  prodDetails: "",
  currentPrice: 0,
  discount: 0,
  category: HomeDecorsCategory.Candles,
  images: [],
  design: "",
  color: "",
  shape: "",
  productQuantity: "",
  otherProperties: {},
  deliveryTime: "",
  assembly: "",
  customizeOptions: false,
  warranty: "",
  brand: "",
  deliveryLocations: "",
  currencyCode: "INR",
  taxPercentage: 0,
  gstInclusive: false,
  offers: [],
  applicableCouponCodes: [],
  isCODAvailable: false,
};

export default function HomeDecorForm({
  categoryAttributes,
  handleDrawerClose,

  handleUpload,
  handleSubmit,

  getDefaultValuesForCategory,
  selectedHomeDecor,
  setSelectedHomeDecor,
}) {
  const selectedCategory =
    selectedHomeDecor.category || Object.values(HomeDecorsCategory)[0];
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOfferIndex, setEditingOfferIndex] = useState<number | null>(null);
  const [currentOffer, setCurrentOffer] = useState<HomeDecorOffer>({
    type: ProductOfferType.BANK,
    title: "",
    description: "",
    code: "",
    validFrom: "",
    validTo: "",
  });
  const [offerModalError, setOfferModalError] = useState("");

  const normalizeOfferType = (t: string | undefined): string => {
    if (!t?.trim()) return ProductOfferType.BANK;
    const lower = t.trim().toLowerCase();
    const match = PRODUCT_OFFER_TYPE_OPTIONS.find((o) => o.toLowerCase() === lower);
    return match ?? t.trim();
  };

  const openAddOfferModal = () => {
    setCurrentOffer({ type: ProductOfferType.BANK, title: "", description: "", code: "", validFrom: "", validTo: "" });
    setEditingOfferIndex(null);
    setOfferModalError("");
    setOfferModalOpen(true);
  };

  const openEditOfferModal = (idx: number) => {
    const offers = selectedHomeDecor.offers ?? [];
    if (offers[idx]) {
      setCurrentOffer({
        type: normalizeOfferType(offers[idx].type) || ProductOfferType.BANK,
        title: offers[idx].title || "",
        description: offers[idx].description || "",
        code: offers[idx].code || "",
        validFrom: offers[idx].validFrom || "",
        validTo: offers[idx].validTo || "",
      });
      setEditingOfferIndex(idx);
      setOfferModalError("");
      setOfferModalOpen(true);
    }
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setEditingOfferIndex(null);
    setOfferModalError("");
  };

  const saveOfferFromModal = () => {
    if (!currentOffer.type?.trim()) {
      setOfferModalError("Offer type is required");
      return;
    }
    if (!currentOffer.title?.trim()) {
      setOfferModalError("Offer title is required");
      return;
    }
    const offerToSave = {
      type: currentOffer.type.trim(),
      title: currentOffer.title.trim(),
      description: currentOffer.description?.trim(),
      code: currentOffer.code?.trim(),
      validFrom: currentOffer.validFrom?.trim(),
      validTo: currentOffer.validTo?.trim(),
    };
    setSelectedHomeDecor((prev) => {
      const offers = [...(prev.offers ?? [])];
      if (editingOfferIndex !== null) {
        offers[editingOfferIndex] = offerToSave;
      } else {
        offers.push(offerToSave);
      }
      return { ...prev, offers };
    });
    closeOfferModal();
  };

  const removeOffer = (idx: number) => {
    setSelectedHomeDecor((prev) => ({
      ...prev,
      offers: (prev.offers ?? []).filter((_, i) => i !== idx),
    }));
  };

  const getOfferStatus = (offer: HomeDecorOffer) => {
    if (!offer.validFrom && !offer.validTo) return "no_dates";
    const now = Date.now();
    const from = offer.validFrom ? new Date(offer.validFrom).getTime() : 0;
    const to = offer.validTo ? new Date(offer.validTo).getTime() : 0;
    if (offer.validTo && to < now) return "expired";
    if (offer.validFrom && from > now) return "upcoming";
    return "active";
  };

  const dynamicFields = categoryAttributes[selectedCategory] || [];
  useEffect(() => {
    if (selectedHomeDecor && selectedHomeDecor.id) {
      setSelectedHomeDecor({
        ...selectedHomeDecor,
      });
    }
  }, [selectedHomeDecor?.id]);
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!selectedHomeDecor.name.trim()) {
      newErrors.name = "Name is required";
    } else if (selectedHomeDecor.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    if (selectedHomeDecor.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (selectedHomeDecor.discount < 0) {
      newErrors.discount = "Discount cannot be negative";
    } else if (selectedHomeDecor.discount > 100) {
      newErrors.discount = "Discount cannot exceed 100%";
    }

    if (!selectedHomeDecor.prodDetails.trim()) {
      newErrors.prodDetails = "Product details are required";
    }

    if (!selectedHomeDecor.deliveryTime.trim()) {
      newErrors.deliveryTime = "Delivery time is required";
    }

    if (!selectedHomeDecor.assembly.trim()) {
      newErrors.assembly = "Assembly information is required";
    }

    if (!selectedHomeDecor.warranty.trim()) {
      newErrors.warranty = "Warranty information is required";
    }

    if (!selectedHomeDecor.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!selectedHomeDecor.deliveryLocations.trim()) {
      newErrors.deliveryLocations = "Delivery locations are required";
    }

    if (!selectedHomeDecor.productQuantity) {
      newErrors.productQuantity = "Product quantity is required";
    } else if (parseInt(selectedHomeDecor.productQuantity) < 0) {
      newErrors.productQuantity = "Product quantity cannot be negative";
    }

    

    if (!selectedHomeDecor.design.trim()) {
      newErrors.design = "Design is required";
    }

    if (!selectedHomeDecor.color.trim()) {
      newErrors.color = "Color is required";
    }

    const categoryFields = categoryAttributes[selectedHomeDecor.category] || [];

    categoryFields.forEach((field) => {
      const value = selectedHomeDecor.otherProperties[field.name];
      if (!value && value !== 0) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.type === "number" && value <= 0) {
        newErrors[field.name] = `${field.label} should be more than 0`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (name: string, value: any) => {
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "category") {
      setSelectedHomeDecor((currProp) => ({
        ...currProp,
        category: value,
        otherProperties: getDefaultValuesForCategory(value),
      }));
    } else if (
      categoryAttributes[selectedHomeDecor.category]?.some(
        (field) => field.name === name
      )
    ) {
      setSelectedHomeDecor((currProp) => {
        return {
          ...currProp,
          otherProperties: {
            ...currProp.otherProperties,
            [name]: value,
          },
        };
      });
    } else if (name === "customizeOptions") {
      setSelectedHomeDecor((currProp) => ({
        ...currProp,
        customizeOptions: value === "Yes",
      }));
    } else if (name === "gstInclusive" || name === "isCODAvailable") {
      setSelectedHomeDecor((currProp) => ({
        ...currProp,
        [name]: value === "Yes",
      }));
    } else {
      setSelectedHomeDecor((currProp) => ({
        ...currProp,
        [name]: value,
      }));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-3 items-center md:text-[20px] text-[16px]">
          <h1 className="text-gray-700 text-xl md:text-2xl md:pl-10 font-bold">
            Add Home Decors
          </h1>
          <HomeMini className="text-[20px]" />
        </div>
        <div>
          <div className="text-red-500 font-regular text-[12px] mb-10 md:pl-10">
            {" "}
            All are required fields
          </div>
          <form className=" flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">
                  Basic Information
                </h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                  <CustomInput
                    name="name"
                    id="name"
                    placeholder="Enter product name"
                    value={selectedHomeDecor?.name ?? ""}
                    label="Name"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.name}
                    errorCls={errors.name ? "border-red-500" : ""}
                  />
                  <CustomInput
                    name="prodDetails"
                    id="prodDetails"
                    placeholder="Enter product description"
                    value={selectedHomeDecor.prodDetails}
                    label="Product Description"
                    labelCls="font-medium label-text"
                    className="px-2 "
                    type="textarea"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.prodDetails}
                    errorCls={errors.prodDetails ? "border-red-500" : ""}
                  />
                  <SingleSelect
                    name="category"
                    label="Category"
                    type="single-select"
                    labelCls="font-medium label-text"
                    handleChange={handleFormChange}
                    optionsInterface={{ isObj: false }}
                    options={Object.values(HomeDecorsCategory).sort()}
                    selectedOption={selectedHomeDecor.category}
                  />
                  <CustomInput
                    name="brand"
                    id="brand"
                    placeholder="Enter brand name"
                    value={selectedHomeDecor.brand}
                    label="Brand"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.brand}
                    errorCls={errors.brand ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">
                  Pricing & GST
                </h2>
                <p className="sublabel-text text-gray-400 md:px-10">**Price and discount are stored; selling price and tax are calculated when displaying and at order time.</p>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 md:px-10 gap-y-5 gap-x-5">
                  <CustomInput
                    name="price" id="price" placeholder="Enter MRP" value={selectedHomeDecor.price} label="Price (MRP) " labelCls="font-medium label-text" className="px-2" type="number" onChange={(e: any) => handleFormChange(e?.target?.name ?? "", e.target.value !== "" ? parseFloat(e?.target?.value) : 0)} errorMsg={errors.price} errorCls={errors.price ? "border-red-500" : ""} />
                  <CustomInput
                    name="discount"
                    id="discount"
                    placeholder="0"
                    value={selectedHomeDecor.discount}
                    label="Discount %" labelCls="font-medium label-text" className="px-2" type="number" onChange={(e: any) => handleFormChange(e?.target?.name ?? "", e.target.value !== "" ? parseFloat(e?.target?.value) : 0)} errorMsg={errors.discount} errorCls={errors.discount ? "border-red-500" : ""} />
                  <CustomInput name="currencyCode" id="currencyCode" placeholder="INR" value={selectedHomeDecor.currencyCode ?? "INR"} label="Currency" labelCls="font-medium label-text" className="px-2" type="text" onChange={(e: any) => handleFormChange("currencyCode", e?.target?.value ?? "")} />
                  <CustomInput name="taxPercentage" id="taxPercentage" placeholder="18" value={selectedHomeDecor.taxPercentage ?? ""} label="Tax (GST) %" labelCls="font-medium label-text" className="px-2" type="number" onChange={(e: any) => handleFormChange("taxPercentage", e.target.value !== "" ? parseFloat(e.target.value) : undefined)} />
                  <CustomInput name="hsnCode" id="hsnCode" placeholder="e.g. 9403" value={selectedHomeDecor.hsnCode ?? ""} label="HSN Code" labelCls="font-medium label-text" className="px-2" type="text" onChange={(e: any) => handleFormChange("hsnCode", e?.target?.value ?? "")} />
                  <SingleSelect name="gstInclusive" label="GST inclusive" labelCls="font-medium label-text" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedHomeDecor.gstInclusive ? "Yes" : "No"} />
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">Return policy & delivery</h2>
                <p className="sublabel-text text-gray-600 md:px-10 ">Coupons can be applied at checkout even when payment is Cash on Delivery.</p>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 md:px-10 gap-y-5 gap-x-5">
                  <div className="md:col-span-2">
                    <CustomInput name="returnPolicy" id="returnPolicy" placeholder="e.g. 7 days return for defects" value={selectedHomeDecor.returnPolicy ?? ""} label="Return policy" labelCls="font-medium label-text" type="textarea" className="px-2 md:py-1 py-[3px]" onChange={(e: any) => handleFormChange("returnPolicy", e?.target?.value ?? "")} />
                  </div>
                  <SingleSelect name="isCODAvailable" label="COD available" labelCls="font-medium label-text" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedHomeDecor.isCODAvailable ? "Yes" : "No"} />
                  <CustomInput name="shippingWeight" id="shippingWeight" placeholder="kg" value={selectedHomeDecor.shippingDetails?.weight ?? ""} label="Shipping weight (kg)" labelCls="font-medium label-text" type="number" onChange={(e: any) => setSelectedHomeDecor((p) => ({ ...p, shippingDetails: { ...p.shippingDetails, weight: e.target.value !== "" ? parseFloat(e.target.value) : undefined, dimensions: p.shippingDetails?.dimensions } }))} />
                  <CustomInput name="shippingDimensions" id="shippingDimensions" placeholder="e.g. 30 x 20 cm" value={selectedHomeDecor.shippingDetails?.dimensions ?? ""} label="Shipping dimensions" labelCls="font-medium label-text" type="text" onChange={(e: any) => setSelectedHomeDecor((p) => ({ ...p, shippingDetails: { ...p.shippingDetails, weight: p.shippingDetails?.weight, dimensions: e.target.value || undefined } }))} />
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">Offers & Coupons</h2>
                <div className="w-full md:px-10 space-y-3">
                  {(selectedHomeDecor.offers ?? []).map((offer, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded border flex justify-between items-center">
                      <span className="font-medium text-sm">{offer.type} – {offer.title}</span>
                      <div className="flex gap-2">
                        <button type="button" className="p-1.5 hover:bg-blue-100 text-blue-600 rounded" onClick={() => openEditOfferModal(idx)}><FaEdit className="text-sm" /></button>
                        <button type="button" className="p-1.5 hover:bg-red-100 text-red-600 rounded" onClick={() => removeOffer(idx)}><MdDelete /></button>
                      </div>
                    </div>
                  ))}
                  <Button type="button" className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2" onClick={openAddOfferModal}><FaTag className="text-sm" /> Add Offer</Button>
                  <CustomInput name="applicableCouponCodes" id="applicableCouponCodes" label="Applicable coupon codes (comma-separated)" labelCls="font-medium label-text" placeholder="SAVE10, WELCOME20" type="text" value={(selectedHomeDecor.applicableCouponCodes ?? []).join(", ")} onChange={(e: any) => { const raw = e?.target?.value ?? ""; setSelectedHomeDecor((p) => ({ ...p, applicableCouponCodes: raw.split(",").map((s: string) => s.trim()).filter(Boolean) })); }} />
                </div>
                <Modal isOpen={offerModalOpen} closeModal={closeOfferModal} title={editingOfferIndex !== null ? "Edit Offer" : "Add Offer"} className="max-w-lg">
                  <div className="space-y-3 p-2">
                    {offerModalError && <p className="text-red-500 text-sm">{offerModalError}</p>}
                    <SingleSelect name="modal_offer_type" label="Type *" labelCls="font-medium mb-2" type="single-select" optionsInterface={{ isObj: false }} options={PRODUCT_OFFER_TYPE_OPTIONS} selectedOption={currentOffer.type || ""} handleChange={(_n, value) => setCurrentOffer((p) => ({ ...p, type: value as string }))} placeholder="Select type" />
                    <CustomInput name="modal_offer_title" id="modal_offer_title" label="Title *" labelCls="font-medium mb-2" placeholder="e.g. 10% off" type="text" value={currentOffer.title || ""} onChange={(e: any) => setCurrentOffer((p) => ({ ...p, title: e.target.value }))} />
                    <CustomInput name="modal_offer_description" id="modal_offer_description" label="Description (optional)" labelCls="font-medium mb-2" type="text" value={currentOffer.description || ""} onChange={(e: any) => setCurrentOffer((p) => ({ ...p, description: e.target.value }))} />
                    <CustomInput name="modal_offer_code" id="modal_offer_code" label="Coupon code (optional)" labelCls="font-medium mb-2" type="text" value={currentOffer.code || ""} onChange={(e: any) => setCurrentOffer((p) => ({ ...p, code: e.target.value }))} />
                    <CustomDate type="date" label="Valid From" labelCls="font-medium mb-2" value={currentOffer.validFrom || ""} onChange={(e: any) => setCurrentOffer((p) => ({ ...p, validFrom: e.target.value }))} placeholder="Start" className="px-2 py-1" name="modal_offer_validFrom" />
                    <CustomDate type="date" label="Valid To" labelCls="font-medium mb-2" value={currentOffer.validTo || ""} onChange={(e: any) => setCurrentOffer((p) => ({ ...p, validTo: e.target.value }))} placeholder="End" className="px-2 py-1" name="modal_offer_validTo" />
                    <div className="flex gap-2 pt-2">
                      <Button type="button" className="px-2 py-1.5 bg-gray-200 rounded" onClick={closeOfferModal}>Cancel</Button>
                      <Button type="button" className="px-2 py-1.5 bg-blue-500 text-white rounded" onClick={saveOfferFromModal}>{editingOfferIndex !== null ? "Save" : "Add Offer"}</Button>
                    </div>
                  </div>
                </Modal>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">SEO (optional)</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 md:px-10 gap-y-5 gap-x-5">
                  <CustomInput name="metaTitle" id="metaTitle" placeholder="Page title for search" value={selectedHomeDecor.metaTitle ?? ""} label="Meta title" labelCls="font-medium label-text" type="text" onChange={(e: any) => handleFormChange("metaTitle", e?.target?.value ?? "")} />
                  <div className="md:col-span-2">
                    <CustomInput name="metaDescription" id="metaDescription" placeholder="Short description for search" value={selectedHomeDecor.metaDescription ?? ""} label="Meta description" labelCls="font-medium label-text" type="textarea" onChange={(e: any) => handleFormChange("metaDescription", e?.target?.value ?? "")} />
                  </div>
                  <div className="md:col-span-2">
                    <CustomInput name="searchTags" id="searchTags" placeholder="vase, ceramic, decor" value={(selectedHomeDecor.searchTags ?? []).join(", ")} label="Search tags (comma-separated)" labelCls="font-medium label-text" type="text" onChange={(e: any) => { const raw = e?.target?.value ?? ""; setSelectedHomeDecor((p) => ({ ...p, searchTags: raw.split(",").map((s: string) => s.trim()).filter(Boolean) })); }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">
                  Appearance
                </h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                  <CustomInput
                    name="color"
                    id="color"
                    placeholder="Enter color"
                    value={selectedHomeDecor.color}
                    label="Color"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "color",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.color}
                    errorCls={errors.color ? "border-red-500" : ""}
                  />
                  <CustomInput
                    name="design"
                    id="design"
                    placeholder="Enter design details"
                    value={selectedHomeDecor.design}
                    label="Design"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.design}
                    errorCls={errors.design ? "border-red-500" : ""}
                  />
                  {dynamicFields.map((field) => {
                    const fieldError = errors[field.name];

                    if (field.type === "single-select" && field.options) {
                      return (
                        <SingleSelect
                          key={field.name}
                          name={field.name}
                          label={field.label}
                          type="single-select"
                          labelCls="font-medium label-text mb-2"
                          optionsInterface={{ isObj: false }}
                          options={field.options}
                          selectedOption={
                            selectedHomeDecor.otherProperties?.[field.name] ||
                            field.options[0]
                          }
                          handleChange={(name, value) =>
                            handleFormChange(name, value)
                          }
                          errorMsg={fieldError}
                          errorCls={fieldError ? "border-red-500" : ""}
                        />
                      );
                    } else {
                      return (
                        <CustomInput
                          key={field.name}
                          name={field.name}
                          id={field.name}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          label={field.label}
                          type={field.type as "text" | "number"}
                          value={
                            selectedHomeDecor.otherProperties?.[field.name] ??
                            ""
                          }
                          onChange={(e: any) => {
                            handleFormChange(
                              e?.target?.name ?? "",
                              e.target.value !== ""
                                ? parseFloat(e?.target?.value)
                                : 0
                            );
                          }}
                          errorMsg={fieldError}
                          errorCls={fieldError ? "border-red-500" : ""}
                        />
                      );
                    }
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">
                  Stock & Availability
                </h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                  <CustomInput
                    name="productQuantity"
                    id="productQuantity"
                    placeholder="Enter quantity available"
                    value={selectedHomeDecor.productQuantity}
                    label="Product Quantity"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="number"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e.target.value !== "" ? parseInt(e?.target?.value) : 0
                      )
                    }
                    errorMsg={errors.productQuantity}
                    errorCls={errors.productQuantity ? "border-red-500" : ""}
                  />
                  <CustomInput
                    name="assembly"
                    id="assembly"
                    placeholder="Enter assembly details"
                    value={selectedHomeDecor.assembly}
                    label="Assembly"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.assembly}
                    errorCls={errors.assembly ? "border-red-500" : ""}
                  />
                  <SingleSelect
                    name="customizeOptions"
                    label="Customize Options"
                    labelCls="font-medium label-text"
                    type="single-select"
                    handleChange={handleFormChange}
                    optionsInterface={{ isObj: false }}
                    options={["Yes", "No"]}
                    selectedOption={
                      selectedHomeDecor.customizeOptions ? "Yes" : "No"
                    }
                  />
                  <CustomInput
                    name="warranty"
                    id="warranty"
                    placeholder="Enter warranty information"
                    value={selectedHomeDecor.warranty}
                    label="Warranty"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.warranty}
                    errorCls={errors.warranty ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">
                  Delivery Information
                </h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                  <CustomInput
                    name="deliveryTime"
                    id="deliveryTime"
                    placeholder="Enter delivery time"
                    labelCls="font-medium label-text"
                    className="px-2"
                    value={selectedHomeDecor.deliveryTime}
                    label="Delivery Time"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.deliveryTime}
                    errorCls={errors.deliveryTime ? "border-red-500" : ""}
                  />
                  <CustomInput
                    name="deliveryLocations"
                    id="deliveryLocations"
                    placeholder="Enter delivery locations"
                    value={selectedHomeDecor.deliveryLocations}
                    label="Delivery Locations"
                    labelCls="font-medium label-text"
                    className="px-2"
                    type="text"
                    onChange={(e: any) =>
                      handleFormChange(
                        e?.target?.name ?? "",
                        e?.target?.value ?? ""
                      )
                    }
                    errorMsg={errors.deliveryLocations}
                    errorCls={errors.deliveryLocations ? "border-red-500" : ""}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-5 border-2 shadow border-gray-200 md:p-5 p-2 rounded-md">
                <h2 className="font-medium subheading-text text-[#3586FF] ">
                  Media
                </h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2  md:px-10 gap-y-5 gap-x-5">
                  <ImageUploader
                    name="images"
                    label="Product Images"
                    type="images"
                    folderName='homedecors'
                    outerCls="md:col-span-2 place-self-center w-full mt-10"
                    initialUrls={selectedHomeDecor.images}
                    onFilesChange={(files: string[]) => handleUpload(files)}
                    errorMsg={errors.images}
                    errorCls={errors.images ? "border-red-500" : ""}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between mt-10 md:px-10 mb-5">
              <Button
                key={"closeButton"}
                className="md:py-[6px] py-1 md:px-[28px] px-[16px] rounded-md border-2 label-text font-medium border-[#3B82F6]"
                onClick={handleDrawerClose}
              >
                Close
              </Button>

              <Button
                key={"submitButton"}
                className="md:py-[6px] py-1 md:px-[28px] px-[16px] rounded-md border-2 label-text font-medium bg-[#3B82F6] text-white"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
