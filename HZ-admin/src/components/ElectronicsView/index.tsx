import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Drawer from "@/src/common/Drawer";
import Button from "@/src/common/Button";
import Loader from "@/src/common/Loader";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import apiClient from "@/src/utils/apiClient";
import { HomeMini } from "@mui/icons-material";
import Image from "next/image";
import CustomInput from "@/src/common/FormElements/CustomInput";
import CustomDate from "@/src/common/FormElements/CustomDate";
import SingleSelect from "@/src/common/FormElements/SingleSelect";
import Modal from "@/src/common/Modal";
import { signOut, useSession } from "next-auth/react";
import { Pagination, Slider } from "@mui/material";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import { CgTrash } from "react-icons/cg";
import { FaEdit, FaBox, FaStar, FaChartLine, FaDownload, FaUpload, FaThLarge, FaThList, FaTag, FaDatabase } from "react-icons/fa";
import { MdClose, MdDelete, MdCheckCircle, MdCancel, MdInventory } from "react-icons/md";
import { FiSliders } from "react-icons/fi";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { uploadFile } from "@/src/utils/uploadFile";
import { ProductOfferType, PRODUCT_OFFER_TYPE_OPTIONS } from "@/src/constants/productOfferTypes";

export enum electronicscategory {
  KITCHEN_APPLIANCES = "Kitchen Appliances",
  ENTERTAINMENT = "Entertainment",
  SMART_HOME = "Smart Home & Automation",
  CLEANING_LAUNDRY = "Cleaning & Laundry",
  CLIMATE_CONTROL = "Climate Control",
  LIGHTING_POWER = "Lighting & Power Solutions",
}
interface CategoryField {
  name: string;
  label: string;
  type: string;
  options?: string[];
}
export interface ElectronicsOffer {
  type: string;
  title: string;
  description?: string;
  code?: string;
  validFrom?: string;
  validTo?: string;
}

interface ElectronicsVariant {
  id?: string;
  sku: string;
  color?: string;
  sizeLabel?: string;
  originalPrice: number;
  discount: number;
  stockQuantity: number;
  isDefault?: boolean;
  isActive?: boolean;
  images?: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }[];
}

interface ElectronicsImage {
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

interface ElectronicsData {
  id?: string | number;
  name: string;
  slug?: string;
  isFeatured?: boolean;
  baseOriginalPrice?: number;
  originalPrice?: number;
  price?: number;
  baseDiscount?: number;
  discount?: number;
  currencyCode: string;
  taxPercentage: number;
  hsnCode?: string;
  gstInclusive?: boolean;
  offers?: ElectronicsOffer[];
  applicableCouponCodes?: string[];
  prodDetails: string;
  category: electronicscategory;
  images: (string | ElectronicsImage)[];
  variants: ElectronicsVariant[];
  brand: string;
  modelNumber: string;
  warranty: string;
  energyRating?: string;
  stockQuantity?: number;
  stockAlertThreshold: number;
  deliveryTime: string;
  installationRequired: boolean;
  smartFeatures: boolean;
  installationGuide?: string;
  powerConsumption?: string;
  technicalSpecifications: Record<string, any>;
  returnPolicy?: string;
  isPublished: boolean;
  isCODAvailable: boolean;
  metaTitle?: string;
  metaDescription?: string;
  deliveryLocations: string;
  shippingDetails?: { weight: number; dimensions: string };
  searchTags?: string[];
}

interface ValidationErrors {
  name: string;
  originalPrice: string;
  price: string;
  discount: string;
  currencyCode: string;
  taxPercentage: string;
  SKU: string;
  prodDetails: string;

  images: string;
  brand: string;
  modelNumber: string;
  warranty: string;
  energyRating?: string;
  color?: string;
  stockQuantity: string;
  stockAlertThreshold: string;
  deliveryTime: string;

  installationGuide?: string;
  powerConsumption?: string;

  returnPolicy?: string;

  metaTitle?: string;
  metaDescription?: string;
  deliveryLocations: string;

  [key: string]: string | undefined;
}
const categoryAttributes: Record<electronicscategory, CategoryField[]> = {
  [electronicscategory.KITCHEN_APPLIANCES]: [
    {
      name: "applianceType",
      label: "Appliance Type",
      type: "single-select",
      options: ["Blender", "Microwave", "Toaster", "Coffee Maker"],
    },

    {
      name: "capacity",
      label: "Capacity",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],
  [electronicscategory.ENTERTAINMENT]: [
    {
      name: "deviceType",
      label: "Device Type",
      type: "single-select",
      options: ["TV", "Speaker", "Gaming Console", "Home Theater", "Projector"],
    },

    {
      name: "screenSize",
      label: "Screen Size (For TVs & Projectors)",
      type: "single-select",
      options: [
        "32 inches",
        "40 inches",
        "50 inches",
        "65 inches",
        "75 inches",
      ],
    },

    {
      name: "resolution",
      label: "Resolution (For TVs & Projectors)",

      type: "single-select",
      options: ["HD (720p)", "Full HD (1080p)", "4K", "8K"],
    },
  ],
  [electronicscategory.SMART_HOME]: [
    {
      name: "deviceType",
      label: "Device Type",
      type: "single-select",
      options: [
        "Smart Speaker",
        "Smart Light",
        "Smart Lock",
        "Security Camera",
        "Smart Plug",
        "Smart Doorbell",
      ],
    },
    {
      name: "connectivity",
      label: "Connectivity",
      type: "multi-select",
      options: ["Wi-Fi", "Bluetooth", "Zigbee", "Z-Wave", "Ethernet"],
    },
  ],

  [electronicscategory.CLEANING_LAUNDRY]: [
    {
      name: "applianceType",
      label: "Appliance Type",
      type: "single-select",
      options: [
        "Washing Machine",
        "Vacuum Cleaner",
        "Dishwasher",
        "Clothes Dryer",
      ],
    },
    {
      name: "motorType",
      label: "Motor Type",
      type: "single-select",
      options: ["Inverter", "Direct Drive", "Belt Drive"],
    },
  ],
  [electronicscategory.CLIMATE_CONTROL]: [
    {
      name: "applianceType",
      label: "Appliance Type",
      type: "single-select",
      options: [
        "Air Conditioner",
        "Heater",
        "Humidifier",
        "Dehumidifier",
        "Air Purifier",
        "Fan",
      ],
    },
    {
      name: "airFlowModes",
      label: "Air Flow Modes",
      type: "multi-select",
      options: ["Auto", "Turbo", "Sleep", "Eco", "Dehumidification"],
    },
  ],
  [electronicscategory.LIGHTING_POWER]: [
    {
      name: "productType",
      label: "Product Type",
      type: "single-select",
      options: [
        "LED Bulb",
        "Smart Light",
        "Tube Light",
        "Ceiling Light",
        "Power Strip",
        "Surge Protector",
      ],
    },
    {
      name: "colorTemperature",
      label: "Color Temperature (K)",
      type: "single-select",
      options: ["Warm White (2700K)", "Cool White (4000K)", "Daylight (6500K)"],
    },
  ],
};
const getDefaultValuesForCategory = (category: electronicscategory) => {
  const categoryFields = categoryAttributes[category] || [];
  const defaultValues: Record<string, any> = {};

  categoryFields.forEach((field) => {
    if (
      field.type === "single-select" &&
      field.options &&
      field.options.length > 0
    ) {
      defaultValues[field.name] = field.options[0];
    } else if (field.type === "number") {
      defaultValues[field.name] = 0;
    }
  });

  return defaultValues;
};
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const defaultElectronic: ElectronicsData = {
  id: undefined,
  name: "",
  slug: "",
  isFeatured: false,
  baseOriginalPrice: 0,
  originalPrice: 0,
  price: 0,
  baseDiscount: 0,
  discount: 0,
  currencyCode: "INR",
  taxPercentage: 18,
  hsnCode: "",
  gstInclusive: false,
  offers: [],
  applicableCouponCodes: [],
  prodDetails: "",
  category: electronicscategory.ENTERTAINMENT,
  technicalSpecifications: getDefaultValuesForCategory(
    electronicscategory.ENTERTAINMENT
  ),
  images: [],
  variants: [],
  brand: "",
  modelNumber: "",
  warranty: "",
  energyRating: "",
  stockQuantity: 0,
  stockAlertThreshold: 10,
  deliveryTime: "",
  installationRequired: false,
  smartFeatures: false,
  installationGuide: "",
  powerConsumption: "",
  returnPolicy: "",
  isPublished: false,
  isCODAvailable: false,
  metaTitle: "",
  metaDescription: "",
  deliveryLocations: "",
  shippingDetails: { weight: 0, dimensions: "" },
  searchTags: [],
};
export enum SortOption {
  PRICE_ASC = "PRICE_ASC",
  PRICE_DESC = "PRICE_DESC",
  NEWEST = "NEWEST",
  OLDEST = "OLDEST",
}
const initialFilters = {
  categories: [],
  sort: SortOption.NEWEST,
  minPrice: 0,
  maxPrice: 5000,
  discount: 0,
  page: 1,
};

export default function ElectronicsView() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>(
    {} as ValidationErrors
  );
  const [electronics, setElectronics] = useState<ElectronicsData[]>([]);
  const { hasPermission, permissions, activeBranchId } = usePermissionStore((state) => state);

  const [categories, setCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [filters, setFilters] = useState(initialFilters);
  const [priceRange, setPriceRange] = useState([
    filters.minPrice,
    Math.ceil(maxPrice),
  ]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ [key: string]: any }>();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedElectronics, setSelectedElectronics] =
    useState<ElectronicsData>(defaultElectronic);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOfferIndex, setEditingOfferIndex] = useState<number | null>(null);
  const [currentVariant, setCurrentVariant] = useState<ElectronicsVariant>({
    sku: "",
    originalPrice: 0,
    discount: 0,
    stockQuantity: 0,
    isActive: true,
    isDefault: false,
    images: [],
  });
  const [currentOffer, setCurrentOffer] = useState<ElectronicsOffer>({
    type: "bank",
    title: "",
    validFrom: "",
    validTo: "",
  });
  const [offerModalError, setOfferModalError] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const sellingPrice = (item: ElectronicsData) => {
    const price = item.baseOriginalPrice ?? item.originalPrice ?? 0;
    const disc = item.baseDiscount ?? item.discount ?? 0;
    return price * (1 - disc / 100);
  };

  const getTotalStock = (item: ElectronicsData) => {
    if (item.variants?.length) {
      return item.variants.reduce((s, v) => s + (v.stockQuantity ?? 0), 0);
    }
    return item.stockQuantity ?? 0;
  };

  const getFirstImageUrl = (item: ElectronicsData): string => {
    const imgs = item.images ?? [];
    if (imgs.length > 0) {
      const first = imgs[0];
      return typeof first === "string" ? first : (first as ElectronicsImage).url;
    }
    const v = item.variants?.[0];
    const vImgs = v?.images ?? [];
    if (vImgs.length > 0) {
      const vi = vImgs[0];
      return typeof vi === "string" ? vi : vi.url;
    }
    return "";
  };

  const handleDrawerClose = () => {
    setOpenModal(false);
    setSelectedElectronics(defaultElectronic);
    setCurrentVariant({ sku: "", originalPrice: 0, discount: 0, stockQuantity: 0, isActive: true, isDefault: false, images: [] });
    setErrors({} as ValidationErrors);
    setOfferModalOpen(false);
  };

  const getOfferStatus = (offer: ElectronicsOffer): "active" | "expired" | "upcoming" | "no_dates" => {
    if (!offer.validFrom && !offer.validTo) return "no_dates";
    const now = new Date().getTime();
    const from = offer.validFrom ? new Date(offer.validFrom).getTime() : 0;
    const to = offer.validTo ? new Date(offer.validTo).getTime() : Number.POSITIVE_INFINITY;
    if (from && to && to < from) return "no_dates";
    if (offer.validTo && to < now) return "expired";
    if (offer.validFrom && from > now) return "upcoming";
    return "active";
  };

  const openAddOfferModal = () => {
    setCurrentOffer({ type: ProductOfferType.BANK, title: "", description: "", code: "", validFrom: "", validTo: "" });
    setEditingOfferIndex(null);
    setOfferModalError("");
    setOfferModalOpen(true);
  };

  const normalizeOfferType = (t: string | undefined): string => {
    if (!t?.trim()) return ProductOfferType.BANK;
    const lower = t.trim().toLowerCase();
    const match = PRODUCT_OFFER_TYPE_OPTIONS.find((o) => o.toLowerCase() === lower);
    return match ?? t.trim();
  };

  const openEditOfferModal = (index: number) => {
    const offers = selectedElectronics.offers ?? [];
    if (offers[index]) {
      setCurrentOffer({
        type: normalizeOfferType(offers[index].type) || ProductOfferType.BANK,
        title: offers[index].title || "",
        description: offers[index].description || "",
        code: offers[index].code || "",
        validFrom: offers[index].validFrom || "",
        validTo: offers[index].validTo || "",
      });
      setEditingOfferIndex(index);
      setOfferModalError("");
      setOfferModalOpen(true);
    }
  };

  const closeOfferModal = () => {
    setOfferModalOpen(false);
    setEditingOfferIndex(null);
    setOfferModalError("");
  };

  const validateOfferModal = (): boolean => {
    if (!currentOffer.type?.trim()) {
      setOfferModalError("Offer type is required");
      return false;
    }
    if (!currentOffer.title?.trim()) {
      setOfferModalError("Offer title is required");
      return false;
    }
    if (currentOffer.validFrom && currentOffer.validTo) {
      const from = new Date(currentOffer.validFrom).getTime();
      const to = new Date(currentOffer.validTo).getTime();
      if (Number.isNaN(from) || Number.isNaN(to)) {
        setOfferModalError("Valid From and Valid To must be valid dates");
        return false;
      }
      if (to < from) {
        setOfferModalError("Valid To must be on or after Valid From");
        return false;
      }
    } else if ((currentOffer.validFrom && !currentOffer.validTo) || (!currentOffer.validFrom && currentOffer.validTo)) {
      setOfferModalError("Set both Valid From and Valid To, or leave both empty");
      return false;
    }
    setOfferModalError("");
    return true;
  };

  const saveOfferFromModal = () => {
    if (!validateOfferModal()) return;
    const offerToSave: ElectronicsOffer = {
      type: currentOffer.type?.trim() || "",
      title: currentOffer.title?.trim() || "",
      description: currentOffer.description?.trim() || undefined,
      code: currentOffer.code?.trim() || undefined,
      validFrom: currentOffer.validFrom?.trim() || undefined,
      validTo: currentOffer.validTo?.trim() || undefined,
    };
    setSelectedElectronics((prev) => {
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

  const removeOffer = (index: number) => {
    setSelectedElectronics((prev) => ({
      ...prev,
      offers: (prev.offers ?? []).filter((_, i) => i !== index),
    }));
  };

  const fetchElectronics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
        minPrice: filters.minPrice ?? 0,
        maxPrice: filters.maxPrice ?? 1000000,
      };
      if (searchQuery) params.search = searchQuery;
      const catSelected = selectedFilters.categoryData && Object.keys(selectedFilters.categoryData).find((k) => selectedFilters.categoryData[k]);
      if (catSelected) params.categories = [catSelected];
      const statusSelected = selectedFilters.leaddata && Object.keys(selectedFilters.leaddata).find((k) => selectedFilters.leaddata[k]);
      if (statusSelected) params.isPublished = statusSelected === "Published";
      const prSelected = selectedFilters.priceRangeData && Object.keys(selectedFilters.priceRangeData).find((k) => selectedFilters.priceRangeData[k]);
      if (prSelected) {
        if (prSelected === "under_10k") { params.maxPrice = 10000; params.minPrice = 0; }
        else if (prSelected === "10k_25k") { params.minPrice = 10000; params.maxPrice = 25000; }
        else if (prSelected === "25k_50k") { params.minPrice = 25000; params.maxPrice = 50000; }
        else if (prSelected === "above_50k") { params.minPrice = 50000; params.maxPrice = 1000000; }
      }
      const brandSelected = selectedFilters.brandData && Object.keys(selectedFilters.brandData).find((k) => selectedFilters.brandData[k]);
      if (brandSelected) params.brand = [brandSelected];
      const featSelected = selectedFilters.featuredData && Object.keys(selectedFilters.featuredData).find((k) => selectedFilters.featuredData[k]);
      if (featSelected) params.isFeatured = featSelected === "Featured Only";
      const response = await apiClient.get(apiClient.URLS.electronics, params);
      const body = response.body || response;
      const { allCategories, maximumPrice, data, totalPages, currentPage, total } = body;
      setCategories(allCategories || []);
      const normalized = (data || []).map((d: any) => ({
        ...d,
        variants: d.variants ?? [],
        images: d.images ?? [],
      }));
      setElectronics(normalized);
      setTotalCount(total ?? data?.length ?? 0);
      const maxP = Math.ceil(maximumPrice || 0);
      setMaxPrice(maxP);
      setPriceRange([0, maxP]);
      setFilters((prev) => ({ ...prev, maxPrice: maxP }));
      setPagination({ currentPage: currentPage ?? 1, totalPages: totalPages ?? 1 });
    } catch (error) {
      console.error("Error fetching electronics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedFilters, filters.sort, filters.minPrice, filters.maxPrice, filters.page]);

  useEffect(() => {
    const handleUserSession = async () => {
      if (status === "loading") {
        return;
      }
      if (status === "authenticated" && session?.user) {
        setUser(session.user);
      } else {
        toast.error("session expired, please login again");
        await signOut();
      }
    };
    handleUserSession();
  }, [status]);

  useEffect(() => {
    if (user?.id === undefined) return;
    fetchElectronics();
  }, [fetchElectronics, user?.id]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [selectedFilters]);
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {} as ValidationErrors;

    if (!selectedElectronics.name.trim()) {
      newErrors.name = "Name is required";
    } else if (selectedElectronics.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    const variants = selectedElectronics.variants ?? [];
    if (variants.length === 0) {
      newErrors.variants = "At least one product variant is required";
    } else {
      variants.forEach((v, i) => {
        if (!v.sku?.trim()) newErrors[`variant_${i}_sku`] = `Variant ${i + 1}: SKU is required`;
        if (v.originalPrice <= 0) newErrors[`variant_${i}_originalPrice`] = `Variant ${i + 1}: Original price must be > 0`;
        if (v.discount < 0 || v.discount > 100) newErrors[`variant_${i}_discount`] = `Variant ${i + 1}: Discount must be 0-100`;
        if (typeof v.stockQuantity !== "number" || v.stockQuantity < 0) newErrors[`variant_${i}_stockQuantity`] = `Variant ${i + 1}: Stock quantity must be >= 0`;
      });
    }

    if (!selectedElectronics.prodDetails.trim()) {
      newErrors.prodDetails = "Product details are required";
    }

    if (!selectedElectronics.deliveryTime.trim()) {
      newErrors.deliveryTime = "Delivery time is required";
    }

    if (!selectedElectronics.warranty.trim()) {
      newErrors.warranty = "Warranty information is required";
    }

    if (!selectedElectronics.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!selectedElectronics.deliveryLocations.trim()) {
      newErrors.deliveryLocations = "Delivery locations are required";
    }

    
    if (!selectedElectronics.modelNumber.trim()) {
      newErrors.modelNumber = "Model number is required";
    }

    if (!selectedElectronics.currencyCode?.trim()) {
      newErrors.currencyCode = "Currency code is required (e.g. INR)";
    }

    if (selectedElectronics.taxPercentage < 0) {
      newErrors.taxPercentage = " taxPercentage cannot be negative";
    } else if (selectedElectronics.taxPercentage > 100) {
      newErrors.taxPercentage = " taxPercentage cannot exceed 100%";
    }
    if (!selectedElectronics.stockAlertThreshold) {
      newErrors.stockAlertThreshold = "hold is required";
    }

    const categoryFields =
      categoryAttributes[selectedElectronics.category] || [];

    categoryFields.forEach((field) => {
      const value = selectedElectronics.technicalSpecifications[field.name];
      if (!value && value !== 0) {
        newErrors[field.name] = `${field.label} is required`; // Store errors for dynamic fields
      } else if (field.type === "number" && value <= 0) {
        newErrors[field.name] = `${field.label} should be more than 0`; // Number-specific validation
      }
    });

    const offers = selectedElectronics.offers ?? [];
    offers.forEach((offer, i) => {
      if (!offer.type?.trim()) newErrors[`offer_${i}`] = "Offer type is required";
      else if (!offer.title?.trim()) newErrors[`offer_${i}`] = "Offer title is required";
      else if (offer.validFrom && offer.validTo) {
        const from = new Date(offer.validFrom).getTime();
        const to = new Date(offer.validTo).getTime();
        if (Number.isNaN(from) || Number.isNaN(to))
          newErrors[`offer_${i}`] = "Valid From and Valid To must be valid dates";
        else if (to < from)
          newErrors[`offer_${i}`] = "Valid To must be on or after Valid From";
      } else if ((offer.validFrom && !offer.validTo) || (!offer.validFrom && offer.validTo)) {
        newErrors[`offer_${i}`] = "Set both Valid From and Valid To, or leave both empty";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const updateElectronic = async (
    id: string | number,
    electronicArg: ElectronicsData
  ) => {
    const patchPayload = {
      ...electronicArg,
      slug: electronicArg.slug || generateSlug(electronicArg.name),
      isFeatured: electronicArg.isFeatured ?? false,
      hsnCode: electronicArg.hsnCode ?? "",
      gstInclusive: electronicArg.gstInclusive ?? false,
      offers: electronicArg.offers ?? [],
      applicableCouponCodes: electronicArg.applicableCouponCodes ?? [],
      variants: toVariantDtos(electronicArg.variants),
      images: toImageDtos(electronicArg.images),
    };
    try {
      const res = await apiClient.patch(
        `${apiClient.URLS.electronics}/${String(id)}`,
        patchPayload,
        true
      );
      if (res.status === 200) {
        const updated = res.body ?? electronicArg;
        const bp = updated.baseOriginalPrice ?? updated.originalPrice ?? 0;
        const bd = updated.baseDiscount ?? updated.discount ?? 0;
        setElectronics((prevData) =>
          prevData.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                ...updated,
                variants: updated.variants ?? item.variants ?? [],
                images: updated.images ?? item.images ?? [],
              };
            }
            return item;
          })
        );
        const sellingPrice = bp * (1 - bd / 100);
        setMaxPrice((prev) => (prev > sellingPrice ? prev : Math.ceil(sellingPrice)));
        toast.success("Updated successfully");
      } else {
        console.error("Failed to update Electronic with status", res);
        toast.error("Failed to update Electronic");
      }
    } catch (error) {
      console.error("Failed to updateElectronic ", error);
      toast.error("Failed to update Electronic");
    }
  };
  const toImageDtos = (imgs: (string | ElectronicsImage)[] | undefined) =>
    (imgs ?? []).map((img) => (typeof img === "string" ? { url: img } : { url: img.url, alt: img.alt, sortOrder: img.sortOrder, isPrimary: img.isPrimary }));

  const toVariantDtos = (variants: ElectronicsVariant[] | undefined) =>
    (variants ?? []).map((v) => ({
      sku: v.sku,
      color: v.color,
      sizeLabel: v.sizeLabel,
      originalPrice: v.originalPrice,
      discount: v.discount ?? 0,
      stockQuantity: v.stockQuantity ?? 0,
      isDefault: v.isDefault ?? false,
      isActive: v.isActive ?? true,
      images: toImageDtos(v.images),
    }));

  const handleSeedElectronics = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const res = await apiClient.post(apiClient.URLS.electronicsSeed, {}, true);
      const { created, failed } = res.body;
      toast.success(`Seeded ${created} electronics${failed ? ` (${failed} failed)` : ""}`);
      fetchElectronics();
    } catch (err: any) {
      toast.error(err?.body?.message || "Failed to seed electronics");
    } finally {
      setIsSeeding(false);
    }
  };

  const createElectronic = async (electronic: ElectronicsData) => {
    const payload = {
      name: electronic.name,
      slug: electronic.slug || generateSlug(electronic.name),
      isFeatured: electronic.isFeatured ?? false,
      currencyCode: electronic.currencyCode || "INR",
      taxPercentage: electronic.taxPercentage ?? 0,
      hsnCode: electronic.hsnCode ?? "",
      gstInclusive: electronic.gstInclusive ?? false,
      offers: electronic.offers ?? [],
      applicableCouponCodes: electronic.applicableCouponCodes ?? [],
      prodDetails: electronic.prodDetails,
      category: electronic.category,
      variants: toVariantDtos(electronic.variants),
      images: toImageDtos(electronic.images),
      modelNumber: electronic.modelNumber,
      energyRating: electronic.energyRating ?? "",
      stockAlertThreshold: electronic.stockAlertThreshold ?? 10,
      installationRequired: electronic.installationRequired ?? false,
      smartFeatures: electronic.smartFeatures ?? false,
      isPublished: electronic.isPublished ?? false,
      isCODAvailable: electronic.isCODAvailable ?? false,
      deliveryTime: electronic.deliveryTime,
      installationGuide: electronic.installationGuide ?? "",
      powerConsumption: electronic.powerConsumption ?? "",
      returnPolicy: electronic.returnPolicy ?? "",
      metaTitle: electronic.metaTitle ?? "",
      metaDescription: electronic.metaDescription ?? "",
      deliveryLocations: electronic.deliveryLocations,
      technicalSpecifications: electronic.technicalSpecifications ?? {},
      warranty: electronic.warranty,
      brand: electronic.brand,
      shippingDetails: electronic.shippingDetails ?? { weight: 0, dimensions: "" },
      searchTags: electronic.searchTags ?? [],
      createdById: user.id,
    };
    try {
      const res = await apiClient.post(apiClient.URLS.electronics, payload, true);
      setElectronics([
        ...electronics,
        {
          ...res.body,
        },
      ]);

      setCategories((prevCategories) => {
        return [...new Set([...prevCategories, electronic.category])];
      });

      const bp = res.body?.baseOriginalPrice ?? res.body?.originalPrice ?? 0;
      const bd = res.body?.baseDiscount ?? res.body?.discount ?? 0;
      const sellingPrice = bp * (1 - bd / 100);
      setMaxPrice((prev) => (prev > sellingPrice ? prev : Math.ceil(sellingPrice)));
      toast.success("Product created successfully");
      fetchElectronics();
    } catch (error) {
      console.error("Failed to create electronic", error);
      toast.error("Failed to create product");
    }
  };
  const handleEdit = (electronic: ElectronicsData) => {
    setOpenModal(true);
    setSelectedElectronics(electronic);
  };
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchElectronics();
  };
  const deleteElectronic = async (id: string | number) => {
    try {
      const res = await apiClient.delete(`${apiClient.URLS.electronics}/${String(id)}`, true);
      if (res.status === 200) {
        setElectronics((prevData) => prevData.filter((item) => item.id !== id));
        toast.success("Deleted successfully");
      } else {
        console.error("Failed to delete electronics", res);
        toast.error("Failed to delete electronics");
      }
    } catch (error) {
      console.error("Failed to delete electronics", error);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (selectedElectronics.id) {
        await updateElectronic(selectedElectronics.id, selectedElectronics);
      } else {
        await createElectronic(selectedElectronics);
      }
      setOpenModal(false);
    } else {
      console.log("Form validation failed", errors);
    }
  };

  const handleVariantChange = (name: string, value: any) => {
    setCurrentVariant((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    if (!currentVariant.sku || currentVariant.originalPrice <= 0) {
      toast.error("Please fill SKU and Original Price");
      return;
    }
    setSelectedElectronics((prev) => ({
      ...prev,
      variants: [...(prev.variants ?? []), { ...currentVariant }],
    }));
    setCurrentVariant({ sku: "", originalPrice: 0, discount: 0, stockQuantity: 0, color: "", isActive: true, isDefault: false, images: [] });
  };

  const removeVariant = (idx: number) => {
    setSelectedElectronics((prev) => ({
      ...prev,
      variants: (prev.variants ?? []).filter((_, i) => i !== idx),
    }));
  };

  const handleVariantImageUpload = async (files: File[], target: "current" | number) => {
    const results: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }[] = [];
    for (const file of files) {
      const url = await uploadFile(file, "electronics");
      if (url) results.push({ url, alt: selectedElectronics.name, sortOrder: 0, isPrimary: false });
    }
    if (target === "current") {
      const prev = currentVariant.images ?? [];
      setCurrentVariant((p) => ({ ...p, images: [...prev, ...results].map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i })) }));
    } else {
      setSelectedElectronics((prev) => {
        const v = [...(prev.variants ?? [])];
        const existing = v[target]?.images ?? [];
        v[target] = { ...v[target], images: [...existing, ...results].map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i })) };
        return { ...prev, variants: v };
      });
    }
  };

  const removeVariantImage = (target: "current" | number, imgIdx: number) => {
    if (target === "current") {
      setCurrentVariant((p) => {
        const imgs = (p.images ?? []).filter((_, i) => i !== imgIdx);
        return { ...p, images: imgs.map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i })) };
      });
    } else {
      setSelectedElectronics((prev) => {
        const v = [...(prev.variants ?? [])];
        const imgs = (v[target]?.images ?? []).filter((_, i) => i !== imgIdx);
        v[target] = { ...v[target], images: imgs.map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i })) };
        return { ...prev, variants: v };
      });
    }
  };

  const handleUpload = (files: string[]) => {
    setSelectedElectronics((prev) => ({ ...prev, images: (files ?? []).map((url) => (typeof url === "string" ? { url } : url)) }));
  };

  const handleImageUpload = async (files: File[]) => {
    const results: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }[] = [];
    for (const file of files) {
      const url = await uploadFile(file, "electronics");
      if (url) results.push({ url, alt: selectedElectronics.name, sortOrder: 0, isPrimary: false });
    }
    if (results.length) {
      const prev = (selectedElectronics.images ?? []).map((img) => (typeof img === "string" ? { url: img } : img));
      const combined = [...prev, ...results].map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i }));
      setSelectedElectronics((prev) => ({ ...prev, images: combined }));
    }
  };

  const removeImage = (index: number) => {
    setSelectedElectronics((prev) => ({
      ...prev,
      images: (prev.images ?? []).filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setSelectedElectronics((prev) => {
      const imgs = (prev.images ?? []).map((img) => (typeof img === "string" ? { url: img } : img));
      const newIndex = direction === "left" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= imgs.length) return prev;
      [imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]];
      const reordered = imgs.map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i }));
      return { ...prev, images: reordered };
    });
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setSelectedElectronics((prev) => {
      const imgs = (prev.images ?? []).map((img) => (typeof img === "string" ? { url: img } : img));
      const [item] = imgs.splice(index, 1);
      imgs.unshift(item);
      const reordered = imgs.map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i }));
      return { ...prev, images: reordered };
    });
  };

  const handleFormChange = (name: string, value: any) => {
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "name") {
      setSelectedElectronics((currProp) => ({
        ...currProp,
        name: value,
        slug: generateSlug(value),
      }));
      return;
    }
    if (name === "category") {
      setSelectedElectronics((currProp) => ({
        ...currProp,
        category: value,
        technicalSpecifications: getDefaultValuesForCategory(value),
      }));
    } else if (
      categoryAttributes[selectedElectronics.category]?.some(
        (field) => field.name === name
      )
    ) {
      setSelectedElectronics((currProp) => {
        return {
          ...currProp,
          technicalSpecifications: {
            ...currProp.technicalSpecifications,
            [name]: value,
          },
        };
      });
    } else if (name === "installationRequired") {
      setSelectedElectronics((currProp) => {
        return {
          ...currProp,
          installationRequired: value === "Yes" ? true : false,
        };
      });
    } else if (name === "isPublished") {
      setSelectedElectronics((currProp) => {
        return {
          ...currProp,
          isPublished: value === "Yes" ? true : false,
        };
      });
    } else if (name === "isCODAvailable") {
      setSelectedElectronics((currProp) => {
        return {
          ...currProp,
          isCODAvailable: value === "Yes" ? true : false,
        };
      });
    } else if (name === "smartFeatures") {
      setSelectedElectronics((currProp) => ({
        ...currProp,
        smartFeatures: value === "Yes" ? true : false,
      }));
    } else if (name === "isFeatured") {
      setSelectedElectronics((currProp) => ({
        ...currProp,
        isFeatured: value === "Yes" ? true : false,
      }));
    } else if (name === "gstInclusive") {
      setSelectedElectronics((currProp) => ({
        ...currProp,
        gstInclusive: value === "Yes" ? true : false,
      }));
    } else {
      setSelectedElectronics((currProp) => ({
        ...currProp,
        [name]: value,
      }));
    }
  };

  const statistics = useMemo(() => {
    const totalStock = electronics.reduce((sum, item) => sum + getTotalStock(item), 0);
    const activeCount = electronics.filter((item) => item.isPublished).length;
    const outOfStock = electronics.filter((item) => getTotalStock(item) === 0).length;
    const featuredCount = electronics.filter((item) => item.isFeatured).length;
    const avgPrice =
      electronics.length > 0
        ? electronics.reduce((sum, item) => sum + sellingPrice(item), 0) / electronics.length
        : 0;
    return {
      totalProducts: totalCount,
      totalStock,
      activeCount,
      outOfStock,
      featuredCount,
      avgPrice: Math.round(avgPrice),
    };
  }, [electronics, totalCount]);

  const categoryFilterOptions = useMemo(
    () => Object.values(electronicscategory).map((c) => ({ id: c, label: c })),
    []
  );
  const statusFilterOptions = useMemo(
    () => [
      { id: "Published", label: "Published" },
      { id: "Draft", label: "Draft" },
    ],
    []
  );
  const priceRangeFilterOptions = useMemo(
    () => [
      { id: "under_10k", label: "Under ₹10,000" },
      { id: "10k_25k", label: "₹10,000 - ₹25,000" },
      { id: "25k_50k", label: "₹25,000 - ₹50,000" },
      { id: "above_50k", label: "Above ₹50,000" },
    ],
    []
  );
  const brandFilterOptions = useMemo(
    () => [...new Set(electronics.map((e) => e.brand).filter(Boolean))].map((b) => ({ id: b, label: b })),
    [electronics]
  );
  const featuredFilterOptions = useMemo(
    () => [
      { id: "Featured Only", label: "Featured Only" },
      { id: "Not Featured", label: "Not Featured" },
    ],
    []
  );

  const getDynamicFields = () => {
    const categoryFields =
      categoryAttributes[selectedElectronics.category] || [];
    return categoryFields.map((field, idx) => {
      const fieldError = errors[field.name];
      if (field.type === "single-select" && field.options) {
        return (
          <SingleSelect
            key={idx}
            name={field.name}
            label={field.label}
            type="single-select"
            labelCls="font-medium label-text mb-2"
            handleChange={handleFormChange}
            optionsInterface={{ isObj: false }}
            options={field.options}
            selectedOption={
              selectedElectronics?.technicalSpecifications?.[field.name] ?? field.options?.[0]
            }
            errorMsg={fieldError}
            errorCls={fieldError ? "border-red-500" : ""}
          />
        );
      }
      return (
        <CustomInput
          key={idx}
          name={field.name}
          id={field.name}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          label={field.label}
          labelCls="font-medium label-text mb-2"
          type={field.type as "text" | "number"}
          value={selectedElectronics?.technicalSpecifications?.[field.name] ?? ""}
          onChange={(e: any) =>
            handleFormChange(
              e?.target?.name ?? "",
              field.type === "number" ? (e.target.value !== "" ? parseFloat(e.target.value) : 0) : e?.target?.value
            )
          }
          errorMsg={fieldError}
          errorCls={fieldError ? "border-red-500" : ""}
        />
      );
    });
  };

  const getImageSrcForm = (urlOrObj: string | ElectronicsImage) => {
    const url = typeof urlOrObj === "string" ? urlOrObj : urlOrObj?.url;
    if (url && (url.startsWith("http") || url.startsWith("/"))) return url;
    return "/images/buy_home.webp";
  };

  const getImageSrc = (image: string | undefined) => {
    if (image && (image.startsWith("http") || image.startsWith("/"))) {
      return image;
    }

    return "/images/buy_home.webp";
  };
  const handleSortChange = (sortValue: SortOption) => {
    setFilters((prev) => ({ ...prev, sort: sortValue, page: 1 }));
  };

  const handlePageChange = (_e: any, value: number) => {
    setFilters((prev) => ({ ...prev, page: value }));
  };
  const totalPages = Math.max(1, pagination.totalPages);
  const asPath = router.asPath;
  const actualroute = asPath.split("/")[1];

  return (
    <>
      <div className="min-h-screen w-full bg-gray-50 md:p-6 p-3">
        {isLoading && (
          <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-white/50 flex justify-center items-center">
            <Loader />
          </div>
        )}

        <div className="bg-white min-w-full rounded-lg shadow-sm md:p-6 p-4 mb-6">
          <div className="flex md:flex-row flex-col justify-between md:items-center items-start mb-6 gap-4">
            <div>
              <h1 className="md:text-3xl text-xl font-bold text-gray-800 flex items-center gap-3">
                <HomeMini className="text-[#3586FF]" />
                Electronics Management
              </h1>
              <p className="md:label-text text-xs text-gray-500 mt-1">
                Manage your electronics catalog with pricing, offers, GST, and inventory
              </p>
            </div>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              <Button className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 md:label-text text-xs font-medium">
                <FaDownload className="text-xs" /> <span className="hidden md:inline">Export</span>
              </Button>
              <Button className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 md:label-text text-xs font-medium">
                <FaUpload className="text-xs" /> <span className="hidden md:inline">Import</span>
              </Button>
              <Button
                className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 md:label-text text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSeedElectronics}
                disabled={isSeeding}
              >
                <FaDatabase className={`text-xs ${isSeeding ? "animate-pulse" : ""}`} />
                <span className="hidden md:inline">{isSeeding ? "Seeding..." : "Seed Data"}</span>
              </Button>
              <CustomTooltip label="Access Restricted - Contact Admin" position="bottom" showTooltip={!hasPermission("electronics", "create")}>
                <Button
                  className="md:px-6 px-4 md:py-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed md:label-text text-xs"
                  onClick={() => { setOpenModal(true); setSelectedElectronics(defaultElectronic); setCurrentVariant({ sku: "", originalPrice: 0, discount: 0, stockQuantity: 0, isActive: true, isDefault: false, images: [] }); setErrors({} as ValidationErrors); }}
                >
                  + Add New
                </Button>
              </CustomTooltip>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-4 rounded-lg border border-blue-200">
              <FaBox className="text-blue-600 md:text-2xl sub-heading mb-2" />
              <p className="md:text-2xl sub-heading font-bold text-gray-800">{statistics.totalProducts}</p>
              <p className="md:text-xs text-[10px] text-gray-600 font-medium">Total Products</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-4 rounded-lg border border-green-200">
              <MdCheckCircle className="text-green-600 md:text-2xl sub-heading mb-2" />
              <p className="md:text-2xl sub-heading font-bold text-gray-800">{statistics.activeCount}</p>
              <p className="md:text-xs text-[10px] text-gray-600 font-medium">Active</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4 rounded-lg border border-purple-200">
              <MdInventory className="text-purple-600 md:text-2xl sub-heading mb-2" />
              <p className="md:text-2xl sub-heading font-bold text-gray-800">{statistics.totalStock}</p>
              <p className="md:text-xs text-[10px] text-gray-600 font-medium">Total Stock</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 md:p-4 rounded-lg border border-red-200">
              <MdCancel className="text-red-600 md:text-2xl sub-heading mb-2" />
              <p className="md:text-2xl sub-heading font-bold text-gray-800">{statistics.outOfStock}</p>
              <p className="md:text-xs text-[10px] text-gray-600 font-medium">Out of Stock</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 md:p-4 rounded-lg border border-yellow-200">
              <FaStar className="text-yellow-600 md:text-2xl sub-heading mb-2" />
              <p className="md:text-2xl sub-heading font-bold text-gray-800">{statistics.featuredCount}</p>
              <p className="md:text-xs text-[10px] text-gray-600 font-medium">Featured</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 md:p-4 rounded-lg border border-indigo-200">
              <FaChartLine className="text-indigo-600 md:text-2xl sub-heading mb-2" />
              <p className="md:text-2xl sub-heading font-bold text-gray-800">₹{statistics.avgPrice.toLocaleString()}</p>
              <p className="md:text-xs text-[10px] text-gray-600 font-medium">Avg Price</p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="flex md:flex-row flex-col gap-3 md:items-center items-stretch">
            <div className="flex-1">
              <ReusableSearchFilter
                searchText={searchQuery}
                placeholder="Search by name, brand, category..."
                className=""
                onSearchChange={setSearchQuery}
                filters={[
                  { groupLabel: "Category", key: "categoryData", options: categoryFilterOptions },
                  { groupLabel: "Status", key: "leaddata", options: statusFilterOptions },
                  { groupLabel: "Price Range", key: "priceRangeData", options: priceRangeFilterOptions },
                  { groupLabel: "Brand", key: "brandData", options: brandFilterOptions },
                  { groupLabel: "Featured", key: "featuredData", options: featuredFilterOptions },
                ]}
                selectedFilters={selectedFilters}
                onFilterChange={setSelectedFilters}
                rootCls="md:mb-0"
              />
            </div>
            <div className="flex gap-2">
              <FiSliders className="text-gray-500 self-center" />
              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 md:label-text text-xs"
              >
                {Object.values(SortOption).map((opt) => (
                  <option key={opt} value={opt}>{opt.replace(/_/g, " ")}</option>
                ))}
              </select>
              <Button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:label-text text-xs md:py-[6px] py-[5px] md:px-4 px-3 rounded-lg"
              >
                {viewMode === "grid" ? <FaThList /> : <FaThLarge />}
                <span className="hidden md:inline">{viewMode === "grid" ? "List" : "Grid"}</span>
              </Button>
            </div>
          </div>

          {/* List / Grid */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
            {electronics.length === 0 ? (
              <div className="md:p-12 p-8 text-center text-gray-500">
                <HomeMini className="mx-auto md:text-6xl text-4xl text-gray-300 mb-4" />
                <p className="md:sub-heading text-base font-medium">No electronics found</p>
                <p className="md:label-text text-xs mt-1">Try adjusting your filters or add a new item</p>
              </div>
            ) : viewMode === "list" ? (
              <>
                <div className="border-b border-gray-200 bg-gray-50 hidden md:grid grid-cols-12 gap-4 p-4 label-text font-medium text-gray-600">
                  <div className="col-span-3">Product</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-1">Stock</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {electronics.map((electronic) => (
                    <div key={String(electronic.id)} className="grid md:grid-cols-12 gap-4 md:p-4 p-3 hover:bg-gray-50 items-center">
                      <div className="md:col-span-3 flex gap-3 items-center">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {getFirstImageUrl(electronic) ? (
                            <Image src={getImageSrc(getFirstImageUrl(electronic))} alt={electronic.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><HomeMini className="text-2xl text-gray-300" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{electronic.name}</p>
                          <p className="text-xs text-gray-500">{electronic.brand}</p>
                          {electronic.isFeatured && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">⭐ Featured</span>}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{electronic.category}</span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-medium">₹{Math.round(sellingPrice(electronic)).toLocaleString()}</p>
                        {((electronic.baseDiscount ?? electronic.discount) ?? 0) > 0 && <span className="text-xs text-green-600">{electronic.baseDiscount ?? electronic.discount}% OFF</span>}
                      </div>
                      <div className="md:col-span-1 label-text">{getTotalStock(electronic)}</div>
                      <div className="md:col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${electronic.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {electronic.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-2">
                        <Button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" onClick={() => handleEdit(electronic)} disabled={!hasPermission("electronics", "edit")}>
                          <FaEdit className="md:sub-heading text-base" />
                        </Button>
                        <Button className="p-2 rounded-lg hover:bg-red-50 text-red-600" onClick={() => deleteElectronic(electronic.id)} disabled={!hasPermission("electronics", "delete")}>
                          <CgTrash className="md:sub-heading text-base" />
                        </Button>
                        <Button className="md:px-3 px-2 md:py-1.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white md:text-xs text-[10px] font-medium" onClick={() => router.push(`/${actualroute}/${electronic.id}/itemanalytics`)}>
                          Analytics
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:p-6 p-4">
                {electronics.map((electronic) => (
                  <div key={String(electronic.id)} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square bg-gray-100">
                      {getFirstImageUrl(electronic) ? (
                        <Image src={getImageSrc(getFirstImageUrl(electronic))} alt={electronic.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><HomeMini className="text-5xl text-gray-300" /></div>
                      )}
                      {electronic.isFeatured && <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium">⭐ Featured</span>}
                    </div>
                    <div className="p-4">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">{electronic.category}</span>
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{electronic.name}</h3>
                      <p className="text-xs text-gray-500 mb-3">{electronic.brand}</p>
                      <p className="sub-heading font-bold text-gray-900 mb-3">₹{Math.round(sellingPrice(electronic)).toLocaleString()}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-600">Stock: {getTotalStock(electronic)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${electronic.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{electronic.isPublished ? "Published" : "Draft"}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white label-text font-medium" onClick={() => handleEdit(electronic)} disabled={!hasPermission("electronics", "edit")}>Edit</Button>
                        <Button className="py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50" onClick={() => deleteElectronic(electronic.id)} disabled={!hasPermission("electronics", "delete")}>Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-4 py-3 flex md:flex-row flex-col md:items-center justify-between gap-3">
                <div className="md:label-text text-xs text-gray-500">
                  Showing {(filters.page - 1) * 12 + 1} to {Math.min(filters.page * 12, totalCount)} of {totalCount}
                </div>
                <Pagination count={totalPages} page={pagination.currentPage} onChange={handlePageChange} variant="outlined" shape="rounded" />
              </div>
            )}
          </div>
        </div>
      </div>

      {openModal && (
        <Drawer
          open={openModal}
          handleDrawerToggle={handleDrawerClose}
          closeIconCls="text-gray-700 hover:text-gray-900"
          openVariant="right"
          panelCls="w-full md:w-[900px] shadow-2xl"
          overLayCls="bg-black/30 backdrop-blur-sm"
        >
          <div className="h-full flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <HomeMini className="text-[#3586FF]" />
                {selectedElectronics.id ? "Edit Electronics" : "Add New Electronics"}
              </h2>
              <p className="md:text-[12px] text-[10px] text-gray-500 mt-1">
                Fill in the details below. All fields marked with * are required.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">Basic Information :</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <CustomInput name="name" id="name" label="Product Name *" labelCls="font-medium label-text mb-2" placeholder="Enter product name" type="text" value={selectedElectronics.name} onChange={(e: any) => handleFormChange("name", e.target.value)} errorMsg={errors.name} errorCls={errors.name ? "border-red-500" : ""} required />
                    </div>
                    <div className="col-span-2">
                      <CustomInput name="slug" id="slug" label="Slug (URL-friendly)" labelCls="font-medium label-text mb-2" placeholder="auto-generated" type="text" value={selectedElectronics.slug ?? ""} onChange={(e: any) => handleFormChange("slug", e.target.value)} className="bg-gray-50" />
                    </div>
                    <SingleSelect name="category" label="Category *" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={Object.values(electronicscategory).sort()} selectedOption={selectedElectronics.category} required />
                    <SingleSelect name="isFeatured" label="Featured" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedElectronics.isFeatured ? "Yes" : "No"} />
                    <CustomInput name="brand" id="brand" label="Brand *" labelCls="font-medium label-text mb-2" placeholder="Enter brand" type="text" value={selectedElectronics.brand} onChange={(e: any) => handleFormChange("brand", e.target.value)} errorMsg={errors.brand} errorCls={errors.brand ? "border-red-500" : ""} required />
                    <CustomInput name="modelNumber" id="modelNumber" label="Model Number *" labelCls="font-medium label-text mb-2" placeholder="Enter model number" type="text" value={selectedElectronics.modelNumber} onChange={(e: any) => handleFormChange("modelNumber", e.target.value)} errorMsg={errors.modelNumber} errorCls={errors.modelNumber ? "border-red-500" : ""} required />
                    <div className="col-span-2">
                      <CustomInput name="prodDetails" id="prodDetails" label="Product Description *" labelCls="font-medium label-text mb-2" placeholder="Enter product description" type="textarea" value={selectedElectronics.prodDetails} onChange={(e: any) => handleFormChange("prodDetails", e.target.value)} errorMsg={errors.prodDetails} errorCls={errors.prodDetails ? "border-red-500" : ""} required />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">Pricing & GST</h3>
                  <p className="label-text text-gray-600 mb-3">Base price and discount are computed from product variants below.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput name="currencyCode" id="currencyCode" label="Currency *" labelCls="font-medium label-text mb-2" placeholder="INR" type="text" value={selectedElectronics.currencyCode} onChange={(e: any) => handleFormChange("currencyCode", e.target.value)} errorMsg={errors.currencyCode} errorCls={errors.currencyCode ? "border-red-500" : ""} required />
                    <CustomInput name="taxPercentage" id="taxPercentage" label="Tax (GST) %" labelCls="font-medium label-text mb-2" placeholder="18" type="number" value={selectedElectronics.taxPercentage} onChange={(e: any) => handleFormChange("taxPercentage", e.target.value !== "" ? parseFloat(e.target.value) : 0)} errorMsg={errors.taxPercentage} errorCls={errors.taxPercentage ? "border-red-500" : ""} />
                    <CustomInput name="hsnCode" id="hsnCode" label="HSN Code" labelCls="font-medium label-text mb-2" placeholder="e.g. 8517" type="text" value={selectedElectronics.hsnCode ?? ""} onChange={(e: any) => handleFormChange("hsnCode", e.target.value)} />
                    <SingleSelect name="gstInclusive" label="GST Inclusive" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedElectronics.gstInclusive ? "Yes" : "No"} />
                  </div>
                </div>

                {/* Offers & Coupons */}
                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">Offers & Coupons</h3>
                  <p className="label-text text-gray-600 mb-3">
                    Add product-level offers with optional validity. If both Valid From and Valid To are set, the offer is shown only in that period.
                  </p>
                  {(selectedElectronics.offers ?? []).map((offer, idx) => (
                    <div key={idx} className="p-4 mb-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium label-text text-gray-700">Offer {idx + 1}: {offer.type} – {offer.title}</span>
                        <div className="flex gap-2">
                          <button type="button" className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" onClick={() => openEditOfferModal(idx)} title="Edit offer">
                            <FaEdit className="text-sm" />
                          </button>
                          <button type="button" className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors" onClick={() => removeOffer(idx)} title="Remove offer">
                            <MdDelete className="text-lg" />
                          </button>
                        </div>
                      </div>
                      {(offer.description || offer.code || offer.validFrom || offer.validTo) && (
                        <div className="label-text text-gray-600 space-y-1">
                          {offer.description && <p>Description: {offer.description}</p>}
                          {offer.code && <p>Code: {offer.code}</p>}
                          {(offer.validFrom || offer.validTo) && (
                            <p>Valid: {offer.validFrom || "—"} to {offer.validTo || "—"}</p>
                          )}
                        </div>
                      )}
                      {errors[`offer_${idx}`] && <p className="text-red-500 label-text mt-2">{errors[`offer_${idx}`]}</p>}
                      {offer.validFrom || offer.validTo ? (
                        <p className="label-text text-gray-500 mt-2">
                          Status:{" "}
                          <span
                            className={
                              getOfferStatus(offer) === "active"
                                ? "text-green-600 font-medium"
                                : getOfferStatus(offer) === "expired"
                                  ? "text-red-600 font-medium"
                                  : getOfferStatus(offer) === "upcoming"
                                    ? "text-amber-600 font-medium"
                                    : "text-gray-600"
                            }
                          >
                            {getOfferStatus(offer) === "no_dates"
                              ? "Invalid dates"
                              : getOfferStatus(offer).charAt(0).toUpperCase() + getOfferStatus(offer).slice(1)}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                  <Button type="button" className="w-full md:w-auto px-4 py-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2" onClick={openAddOfferModal}>
                    <FaTag className="text-sm" /> Add Offer
                  </Button>
                  <Modal isOpen={offerModalOpen} closeModal={closeOfferModal} title={editingOfferIndex !== null ? "Edit Offer" : "Add Offer"} isCloseRequired={false} className="max-w-lg">
                    <div className="space-y-3">
                      {offerModalError && <p className="text-red-500 label-text">{offerModalError}</p>}
                      <SingleSelect
                        name="modal_offer_type"
                        label="Type *"
                        labelCls="font-medium label-text mb-2"
                        type="single-select"
                        optionsInterface={{ isObj: false }}
                        options={PRODUCT_OFFER_TYPE_OPTIONS}
                        selectedOption={currentOffer.type || ""}
                        handleChange={(_name, value) => setCurrentOffer((p) => ({ ...p, type: value as string }))}
                        placeholder="Select offer type"
                      />
                      <CustomInput
                        name="modal_offer_title"
                        id="modal_offer_title"
                        label="Title *"
                        labelCls="font-medium label-text mb-2"
                        placeholder="e.g. 10% off with Bank X"
                        type="text"
                        value={currentOffer.title || ""}
                        onChange={(e: any) => setCurrentOffer((p) => ({ ...p, title: e.target.value }))}
                      />
                      <CustomInput
                        name="modal_offer_description"
                        id="modal_offer_description"
                        label="Description (optional)"
                        labelCls="font-medium label-text mb-2"
                        placeholder="Optional details"
                        type="text"
                        value={currentOffer.description || ""}
                        onChange={(e: any) => setCurrentOffer((p) => ({ ...p, description: e.target.value }))}
                      />
                      <CustomInput
                        name="modal_offer_code"
                        id="modal_offer_code" label="Coupon code (optional)"
                        labelCls="font-medium label-text mb-2" placeholder="e.g. SAVE10"
                        type="text" value={currentOffer.code || ""}
                        onChange={(e: any) => setCurrentOffer((p) => ({ ...p, code: e.target.value }))}
                      />

                      <CustomDate
                        type="date"
                        label="Valid From (optional)"
                        labelCls="font-medium label-text mb-2"
                        value={currentOffer.validFrom || ""}
                        onChange={(e: any) => setCurrentOffer((p) => ({ ...p, validFrom: e.target.value }))}
                        placeholder="Start date" className="px-3"
                        name="modal_offer_validFrom"
                      />

                      <CustomDate
                        type="date"
                        label="Valid To (optional)"
                        labelCls="font-medium label-text mb-2"
                        value={currentOffer.validTo || ""}
                        onChange={(e: any) => setCurrentOffer((p) => ({ ...p, validTo: e.target.value }))}
                        placeholder="End date"
                        className="px-3"
                        name="modal_offer_validTo" />
                      <div className="flex gap-2 mt-4">
                        <Button className="px-4 py-2 btn-text !font-medium bg-gray-200 hover:bg-gray-300 rounded-lg" onClick={closeOfferModal}>Cancel</Button>
                        <Button className="px-4 py-2 btn-text !font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg" onClick={saveOfferFromModal}>{editingOfferIndex !== null ? "Save" : "Add Offer"}</Button>
                      </div>
                    </div>
                  </Modal>
                  <div className="mt-4">
                    <CustomInput name="applicableCouponCodes" id="applicableCouponCodes" label="Applicable Coupon Codes (comma-separated)" labelCls="font-medium label-text mb-2" placeholder="SAVE10, WELCOME20" type="text" value={(selectedElectronics.applicableCouponCodes ?? []).join(", ")} onChange={(e: any) => { const raw = e?.target?.value ?? ""; setSelectedElectronics((prev) => ({ ...prev, applicableCouponCodes: raw.split(",").map((s: string) => s.trim()).filter(Boolean) })); }} />
                  </div>
                </div>

                {/* Category Specifications */}
                {categoryAttributes[selectedElectronics.category]?.length > 0 && (
                  <div>
                    <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">{selectedElectronics.category} Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">{getDynamicFields()}</div>
                  </div>
                )}

                {/* Product Variants */}
                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">Product Variants</h3>
                  {errors.variants && <p className="text-red-500 label-text mb-2">{errors.variants}</p>}
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <p className="label-text text-[#3586FF] font-medium mb-3">Add New Variant</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <CustomInput name="variant_sku" id="variant_sku" label="SKU" labelCls="font-medium label-text mb-2" placeholder="Enter SKU" type="text" value={currentVariant.sku} onChange={(e: any) => handleVariantChange("sku", e.target.value)} required />
                      <CustomInput name="variant_originalPrice" id="variant_originalPrice" label="MRP" labelCls="font-medium label-text mb-2" placeholder="Enter MRP" type="number" value={currentVariant.originalPrice || ""} onChange={(e: any) => handleVariantChange("originalPrice", parseFloat(e.target.value) || 0)} required />
                      <CustomInput name="variant_discount" id="variant_discount" label="Discount (%)" labelCls="font-medium label-text mb-2" placeholder="0" type="number" value={currentVariant.discount ?? ""} onChange={(e: any) => handleVariantChange("discount", parseFloat(e.target.value) || 0)} />
                      <CustomInput name="variant_stockQuantity" id="variant_stockQuantity" label="Stock Quantity" labelCls="font-medium label-text mb-2" placeholder="0" type="number" value={currentVariant.stockQuantity ?? ""} onChange={(e: any) => handleVariantChange("stockQuantity", parseInt(e.target.value, 10) || 0)} required />
                      <CustomInput name="variant_color" id="variant_color" label="Color" labelCls="font-medium label-text mb-2" placeholder="Optional" type="text" value={currentVariant.color ?? ""} onChange={(e: any) => handleVariantChange("color", e.target.value)} />
                      <CustomInput name="variant_sizeLabel" id="variant_sizeLabel" label="Size" labelCls="font-medium label-text mb-2" placeholder="Optional" type="text" value={currentVariant.sizeLabel ?? ""} onChange={(e: any) => handleVariantChange("sizeLabel", e.target.value)} />
                    </div>
                    <div className="mt-3">
                      <p className="label-text font-medium text-gray-600 mb-2">Variant Images (shown when this SKU is selected)</p>
                      <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors">
                        <FaUpload className="mx-auto text-xl text-gray-400 mb-1" />
                        <p className="text-sm text-gray-600">Upload images for this variant</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); handleVariantImageUpload(files, "current"); e.target.value = ""; }} />
                      </label>
                      {(currentVariant.images?.length ?? 0) > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {currentVariant.images!.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 border">
                              <Image src={typeof img === "string" ? img : img.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                              <button className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl" onClick={() => removeVariantImage("current", idx)}><MdClose className="text-xs" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button className="w-full px-4 py-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-4" onClick={addVariant}>+ Add Variant</Button>
                  </div>
                  {(selectedElectronics.variants?.length ?? 0) > 0 && (
                    <div className="space-y-3">
                      <p className="label-text font-medium text-gray-600">Added Variants ({selectedElectronics.variants!.length})</p>
                      {selectedElectronics.variants!.map((variant, idx) => (
                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 label-text">
                              <div><span className="text-gray-600">SKU:</span><p className="font-medium">{variant.sku}</p></div>
                              <div><span className="text-gray-600">MRP:</span><p className="font-medium">₹{variant.originalPrice}</p></div>
                              <div><span className="text-gray-600">Discount:</span><p className="font-medium text-green-600">{variant.discount ?? 0}%</p></div>
                              <div><span className="text-gray-600">Stock:</span><p className="font-medium">{variant.stockQuantity ?? 0} units</p></div>
                              {variant.color && <div><span className="text-gray-600">Color:</span><p className="font-medium">{variant.color}</p></div>}
                              {variant.sizeLabel && <div><span className="text-gray-600">Size:</span><p className="font-medium">{variant.sizeLabel}</p></div>}
                            </div>
                            <button type="button" className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" onClick={() => removeVariant(idx)} title="Remove variant"><MdDelete className="text-lg" /></button>
                          </div>
                          <div className="mt-2 flex gap-2 items-center flex-wrap">
                            <label className="px-2 py-1 border border-gray-300 rounded cursor-pointer text-xs hover:bg-gray-50">+ Add images
                              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); handleVariantImageUpload(files, idx); e.target.value = ""; }} />
                            </label>
                            {(variant.images?.length ?? 0) > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {variant.images!.map((img, imgIdx) => (
                                  <div key={imgIdx} className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 border">
                                    <Image src={typeof img === "string" ? img : img.url} alt="" width={48} height={48} className="object-cover w-full h-full" />
                                    <button className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl text-[10px]" onClick={() => removeVariantImage(idx, imgIdx)}><MdClose /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Inventory & Delivery */}
                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">Inventory & Delivery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput name="stockAlertThreshold" id="stockAlertThreshold" label="Stock Alert Threshold" labelCls="font-medium label-text mb-2" placeholder="10" type="number" value={selectedElectronics.stockAlertThreshold} onChange={(e: any) => handleFormChange("stockAlertThreshold", e.target.value !== "" ? parseFloat(e.target.value) : 0)} errorMsg={errors.stockAlertThreshold} errorCls={errors.stockAlertThreshold ? "border-red-500" : ""} />
                    <CustomInput name="deliveryTime" id="deliveryTime" label="Delivery Time *" labelCls="font-medium label-text mb-2" placeholder="e.g. 5-7 days" type="text" value={selectedElectronics.deliveryTime} onChange={(e: any) => handleFormChange("deliveryTime", e.target.value)} errorMsg={errors.deliveryTime} errorCls={errors.deliveryTime ? "border-red-500" : ""} required />
                    <CustomInput name="deliveryLocations" id="deliveryLocations" label="Delivery Locations " labelCls="font-medium label-text mb-2" placeholder="e.g. All India" type="text" value={selectedElectronics.deliveryLocations} onChange={(e: any) => handleFormChange("deliveryLocations", e.target.value)} errorMsg={errors.deliveryLocations} errorCls={errors.deliveryLocations ? "border-red-500" : ""} required />
                    <CustomInput name="warranty" id="warranty" label="Warranty " labelCls="font-medium label-text mb-2" placeholder="e.g. 1 year" type="text" value={selectedElectronics.warranty} onChange={(e: any) => handleFormChange("warranty", e.target.value)} errorMsg={errors.warranty} errorCls={errors.warranty ? "border-red-500" : ""} required />
                    <SingleSelect name="isPublished" label="Published" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedElectronics.isPublished ? "Yes" : "No"} />
                    <SingleSelect name="isCODAvailable" label="COD Available" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedElectronics.isCODAvailable ? "Yes" : "No"} />
                    <CustomInput name="energyRating" id="energyRating" label="Energy Rating" labelCls="font-medium label-text mb-2" placeholder="Optional" type="text" value={selectedElectronics.energyRating ?? ""} onChange={(e: any) => handleFormChange("energyRating", e.target.value)} />
                    <SingleSelect name="installationRequired" label="Installation Required" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedElectronics.installationRequired ? "Yes" : "No"} />
                    <CustomInput name="installationGuide" id="installationGuide" label="Installation Guide" labelCls="font-medium label-text mb-2" placeholder="Optional" type="text" value={selectedElectronics.installationGuide ?? ""} onChange={(e: any) => handleFormChange("installationGuide", e.target.value)} />
                    <SingleSelect name="smartFeatures" label="Smart Features" labelCls="font-medium label-text mb-2" type="single-select" handleChange={handleFormChange} optionsInterface={{ isObj: false }} options={["Yes", "No"]} selectedOption={selectedElectronics.smartFeatures ? "Yes" : "No"} />
                    <CustomInput name="powerConsumption" id="powerConsumption" label="Power Consumption" labelCls="font-medium label-text mb-2" placeholder="Optional" type="text" value={selectedElectronics.powerConsumption ?? ""} onChange={(e: any) => handleFormChange("powerConsumption", e.target.value)} />
                    <div className="col-span-2">
                      <CustomInput name="returnPolicy" id="returnPolicy" label="Return Policy" labelCls="font-medium label-text mb-2" placeholder="Optional" type="textarea" value={selectedElectronics.returnPolicy ?? ""} onChange={(e: any) => handleFormChange("returnPolicy", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Product Images */}
                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">Product Images</h3>
                  <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
                    <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="label-text text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); handleImageUpload(files); }} />
                  </label>
                  {(selectedElectronics.images?.length ?? 0) > 0 && (
                    <div className="mt-4">
                      <p className="label-text text-gray-600 mb-2">First image is primary. Reorder with arrows.</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {selectedElectronics.images!.map((url, idx) => (
                          <div key={idx} className="relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-gray-100 group border-2 border-transparent hover:border-blue-300">
                            <Image src={getImageSrcForm(url)} alt="" width={112} height={112} className="object-cover w-full h-full" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                              <div className="flex gap-1">
                                <button type="button" className="p-1.5 bg-white rounded shadow text-gray-700 disabled:opacity-50" onClick={() => moveImage(idx, "left")} disabled={idx === 0} title="Move left">←</button>
                                <button type="button" className="p-1.5 bg-white rounded shadow text-gray-700 disabled:opacity-50" onClick={() => moveImage(idx, "right")} disabled={idx === selectedElectronics.images!.length - 1} title="Move right">→</button>
                              </div>
                              <button type="button" className="px-2 py-1 bg-blue-500 text-white text-xs rounded" onClick={() => setPrimaryImage(idx)}>{idx === 0 ? "Primary" : "Set primary"}</button>
                              <button type="button" className="p-1 bg-red-500 text-white rounded-full" onClick={() => removeImage(idx)} title="Remove"><MdClose className="text-sm" /></button>
                            </div>
                            {idx === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded">Primary</span>}
                            <span className="absolute top-1 right-1 text-[10px] font-medium text-white bg-black/60 px-1 rounded">{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SEO */}
                <div>
                  <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">SEO (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomInput name="metaTitle" id="metaTitle" label="Meta Title" labelCls="font-medium label-text mb-2" placeholder="Optional" type="text" value={selectedElectronics.metaTitle ?? ""} onChange={(e: any) => handleFormChange("metaTitle", e.target.value)} />
                    <CustomInput name="metaDescription" id="metaDescription" label="Meta Description" labelCls="font-medium label-text mb-2" placeholder="Optional" type="textarea" value={selectedElectronics.metaDescription ?? ""} onChange={(e: any) => handleFormChange("metaDescription", e.target.value)} />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
              <Button className="px-6 py-1 btn-text rounded-lg border border-gray-300 font-medium bg-white hover:bg-gray-50" onClick={handleDrawerClose}>Cancel</Button>
              <Button className="px-6 py-1 rounded-lg btn-text bg-blue-500 hover:bg-blue-600 font-medium text-white" onClick={(e: any) => { e.preventDefault(); handleSubmit(e); }}>{selectedElectronics.id ? "Update" : "Create"} Electronics</Button>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
}
