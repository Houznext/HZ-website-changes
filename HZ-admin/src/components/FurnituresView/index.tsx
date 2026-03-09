import React, { useCallback, useEffect, useState, useMemo } from "react";
import Button from "@/src/common/Button";
import Drawer from "@/src/common/Drawer";
import CustomInput from "@/src/common/FormElements/CustomInput";
import SingleSelect, {
} from "@/src/common/FormElements/SingleSelect";
import CustomDate from "@/src/common/FormElements/CustomDate";
import Modal from "@/src/common/Modal";
import {
  FaCouch,
  FaThLarge,
  FaThList,
  FaDownload,
  FaUpload,
  FaEdit,
  FaTrash,
  FaEye,
  FaStar,
  FaTag,
  FaBox,
  FaChartLine,
} from "react-icons/fa";
import {
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdInventory,
  MdDelete,
} from "react-icons/md";
import { FiSliders, FiFilter } from "react-icons/fi";
import Image from "next/image";
import apiClient from "@/src/utils/apiClient";
import { uploadFile } from "@/src/utils/uploadFile";
import { useRouter } from "next/router";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { ProductOfferType, PRODUCT_OFFER_TYPE_OPTIONS } from "@/src/constants/productOfferTypes";
import Loader from "@/src/common/Loader";
import toast from "react-hot-toast";
import { FaDatabase } from "react-icons/fa";

// ==================== ENUMS & TYPES ====================
export enum Category {
  Sofas = "Sofas",
  Chairs = "Chairs",
  Tables = "Tables",
  Beds = "Beds",
  Wardrobes = "Wardrobes",
  StudyRooms = "Study Rooms",
  DiningTables = "Dining Tables",
}
export enum SofaSubCategory {
  Recliner = "Recliner",
  Sectional = "Sectional",
  LShaped = "L-Shaped",
  SofaBed = "Sofa Bed",
}

export enum BedSubCategory {
  Platform = "Platform",
  Storage = "Storage",
  Bunk = "Bunk",
  Hydraulic = "Hydraulic",
}

export enum ChairSubCategory {
  Office = "Office Chair",
  Dining = "Dining Chair",
  Lounge = "Lounge Chair",
  Accent = "Accent Chair",
}

export enum TableSubCategory {
  Coffee = "Coffee Table",
  Side = "Side Table",
  Center = "Center Table",
  Console = "Console Table",
}

export enum WardrobeSubCategory {
  TwoDoor = "2 Door",
  ThreeDoor = "3 Door",
  Sliding = "Sliding",
}

export enum StudyRoomSubCategory {
  StudyTable = "Study Table",
  StudySet = "Study Set",
}

export enum DiningTableSubCategory {
  FourSeater = "4 Seater",
  SixSeater = "6 Seater",
  EightSeater = "8 Seater",
}

export const subCategoryMap: Record<Category, string[]> = {
  [Category.Sofas]: Object.values(SofaSubCategory),
  [Category.Beds]: Object.values(BedSubCategory),
  [Category.Chairs]: Object.values(ChairSubCategory),
  [Category.Tables]: Object.values(TableSubCategory),
  [Category.Wardrobes]: Object.values(WardrobeSubCategory),
  [Category.StudyRooms]: Object.values(StudyRoomSubCategory),
  [Category.DiningTables]: Object.values(DiningTableSubCategory),
};

export enum FurnitureStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
}

export enum PriceRange {
  Under20000 = "under_20000",
  Between20000And29999 = "20000_29999",
  Between30000And39999 = "30000_39999",
  Between40000And49999 = "40000_49999",
  Above50000 = "above_50000",
}

export enum SortOption {
  Latest = "latest",
  PriceLowHigh = "price_low_high",
  PriceHighLow = "price_high_low",
  Popularity = "popularity",
  NameAZ = "name_az",
  NameZA = "name_za",
}

interface FurnitureVariant {
  id?: number;
  sku: string;
  colorName?: string;
  colorHex?: string;
  material?: string;
  finish?: string;
  sizeLabel?: string;
  widthCm?: number;
  depthCm?: number;
  heightCm?: number;
  weightKg?: number;
  maxLoadKg?: number;
  stockQty: number;
  reservedQty?: number;
  mrp: number;
  sellingPrice: number;
  discountPercent?: number;
  isDefault?: boolean;
  isActive?: boolean;
  attributes?: Record<string, any>;
  images?: { url: string; alt?: string }[];
}

interface FurnitureImage {
  id?: number;
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  colorHex?: string;
  angle?: string;
  viewType?: string;
}

/** Product-level offer with optional validity window */
export interface FurnitureOffer {
  type: string;
  title: string;
  description?: string;
  code?: string;
  validFrom?: string; // ISO date YYYY-MM-DD
  validTo?: string;
}

interface FurnitureData {
  id?: number;
  name: string;
  slug: string;
  category: Category;
  subCategory?: string;
  description?: string;
  highlights?: string;
  brand?: string;
  tags?: string[];
  status?: FurnitureStatus;
  isFeatured?: boolean;
  isCustomizable?: boolean;
  customizationDescription?: string;
  deliveryTime?: string;
  warranty?: string;
  assembly?: string;
  returnPolicy?: string;
  offers?: FurnitureOffer[];
  applicableCouponCodes?: string[];
  currencyCode?: string;
  taxPercentage?: number;
  hsnCode?: string;
  gstInclusive?: boolean;
  isCODAvailable?: boolean;
  deliveryLocations?: string;
  shippingDetails?: { weight?: number; dimensions?: string };
  metaTitle?: string;
  metaDescription?: string;
  searchTags?: string[];
  otherProperties?: Record<string, any>;
  sellerId?: number;
  variants: FurnitureVariant[];
  images?: FurnitureImage[];
  baseMrp?: number;
  baseSellingPrice?: number;
  baseDiscountPercent?: number;
  ratingCount?: number;
  averageRating?: number;
  createdDate?: Date;
  updatedDate?: Date;
}

interface FilterState {
  category?: Category;
  brand?: string;
  priceRange?: PriceRange;
  color?: string;
  material?: string;
  sort?: SortOption;
  q?: string;
  status?: FurnitureStatus;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

// ==================== CATEGORY ATTRIBUTES ====================
type FieldType = "text" | "number" | "single-select";

interface CategoryField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
}

const categoryAttributes: Record<Category, CategoryField[]> = {
  [Category.Sofas]: [
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["L-Shaped", "Straight", "Corner", "Sectional"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Leather", "Fabric", "Velvet", "Microfiber"],
    },
    { name: "seatingCapacity", label: "Seating Capacity", type: "number" },
  ],
  [Category.Beds]: [
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Single", "Queen", "King", "Super King"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Upholstered", "Engineered Wood"],
    },
  ],
  [Category.Tables]: [
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Rectangle", "Square", "Oval"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Glass", "Metal", "Marble"],
    },
    { name: "height", label: "Height (cm)", type: "number" },
    { name: "length", label: "Length (cm)", type: "number" },
    { name: "width", label: "Width (cm)", type: "number" },
  ],
  [Category.Chairs]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Plastic", "Fabric", "Leather"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Dining", "Office", "Lounge", "Accent"],
    },
  ],
  [Category.Wardrobes]: [
    {
      name: "doorType",
      label: "Door Type",
      type: "single-select",
      options: ["Sliding", "Hinged", "Bi-fold"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Plywood", "Metal", "Engineered Wood"],
    },
    { name: "numberOfDoors", label: "Number of Doors", type: "number" },
  ],
  [Category.StudyRooms]: [
    {
      name: "deskMaterial",
      label: "Desk Material",
      type: "single-select",
      options: ["Wood", "Metal", "Glass", "Engineered Wood"],
    },
    {
      name: "hasBookshelf",
      label: "Has Bookshelf",
      type: "single-select",
      options: ["Yes", "No"],
    },
  ],
  [Category.DiningTables]: [
    { name: "seatingCapacity", label: "Seating Capacity", type: "number" },
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Rectangle", "Square", "Oval"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Glass", "Marble", "Engineered Wood"],
    },
  ],
};

// ==================== HELPER FUNCTIONS ====================
const getDefaultValuesForCategory = (category: Category) => {
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

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Sort filters data
const sortFiltersData = [
  { id: "latest", label: "Latest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "price_low_high", label: "Price: Low to High" },
  { id: "price_high_low", label: "Price: High to Low" },
  { id: "name_az", label: "Name: A to Z" },
  { id: "name_za", label: "Name: Z to A" },
  { id: "popularity", label: "Most Popular" },
  { id: "custom", label: "Custom Date Range" },
];

// ==================== MAIN COMPONENT ====================
const FurnitureManagementPortal = () => {
  const router = useRouter();
  const { hasPermission, activeBranchId } = usePermissionStore((state) => state);

  // ==================== STATE ====================
  const [isSeeding, setIsSeeding] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedFurniture, setSelectedFurniture] =
    useState<FurnitureData | null>(null);

  const [allData, setAllData] = useState<FurnitureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [globalStats, setGlobalStats] = useState<{
    totalProducts: number;
    totalStock: number;
    activeProducts: number;
    outOfStock: number;
    featuredCount: number;
    avgPrice: number;
  } | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState("latest");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 12,
  });

  // Form state
  const [formData, setFormData] = useState<FurnitureData>({
    name: "",
    slug: "",
    category: Category.Sofas,
    variants: [],
    images: [],
    offers: [],
    applicableCouponCodes: [],
    otherProperties: getDefaultValuesForCategory(Category.Sofas),
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const [currentVariant, setCurrentVariant] = useState<FurnitureVariant>({
    sku: "",
    stockQty: 0,
    mrp: 0,
    sellingPrice: 0,
    isActive: true,
    isDefault: false,
    images: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Offer modal (add/edit)
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOfferIndex, setEditingOfferIndex] = useState<number | null>(null);
  const [currentOffer, setCurrentOffer] = useState<FurnitureOffer>({
    type: ProductOfferType.BANK,
    title: "",
    validFrom: "",
    validTo: "",
  });
  const [offerModalError, setOfferModalError] = useState<string>("");

  // ==================== COMPUTED DATA ====================
  // Prepare filter options for ReusableSearchFilter
  const categoryData = useMemo(
    () => Object.values(Category).map((cat) => ({ role: cat })),
    []
  );

  const statusData = useMemo(
    () =>
      Object.values(FurnitureStatus).map((status) => ({
        leadstatus:
          status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
      })),
    []
  );

  const priceRangeData = useMemo(
    () => [
      { pricerange: "Under ₹20,000", value: PriceRange.Under20000 },
      {
        pricerange: "₹20,000 - ₹29,999",
        value: PriceRange.Between20000And29999,
      },
      {
        pricerange: "₹30,000 - ₹39,999",
        value: PriceRange.Between30000And39999,
      },
      {
        pricerange: "₹40,000 - ₹49,999",
        value: PriceRange.Between40000And49999,
      },
      { pricerange: "Above ₹50,000", value: PriceRange.Above50000 },
    ],
    []
  );

  const brandData = useMemo(() => {
    const uniqueBrands = [
      ...new Set(allData.map((item) => item.brand).filter(Boolean)),
    ];
    return uniqueBrands.map((brand) => ({ brand }));
  }, [allData]);

  const featuredData = useMemo(
    () => [{ featured: "Featured Only" }, { featured: "Not Featured" }],
    []
  );

  // Statistics (prefer global stats from API, fallback to current page)
  const statistics = useMemo(() => {
    if (globalStats) {
      return {
        totalProducts: globalStats.totalProducts ?? totalCount,
        totalStock: globalStats.totalStock ?? 0,
        activeProducts: globalStats.activeProducts ?? 0,
        outOfStock: globalStats.outOfStock ?? 0,
        featuredCount: globalStats.featuredCount ?? 0,
        avgPrice: Math.round(globalStats.avgPrice ?? 0),
      };
    }

    const totalStock = allData.reduce(
      (sum, item) =>
        sum +
        (item.variants?.reduce((vSum, v) => vSum + (v.stockQty || 0), 0) || 0),
      0
    );
    const activeProducts = allData.filter(
      (item) => item.status === FurnitureStatus.ACTIVE
    ).length;
    const outOfStock = allData.filter(
      (item) => item.status === FurnitureStatus.OUT_OF_STOCK
    ).length;
    const featuredCount = allData.filter((item) => item.isFeatured).length;
    const pageCount = allData.length;
    const avgPrice =
      pageCount > 0
        ? allData.reduce((sum, item) => sum + (item.baseSellingPrice || 0), 0) /
        pageCount
        : 0;

    return {
      totalProducts: totalCount,
      totalStock,
      activeProducts,
      outOfStock,
      featuredCount,
      avgPrice: Math.round(avgPrice),
    };
  }, [allData, totalCount, globalStats]);

  // ==================== API CALLS ====================
  const fetchFurniture = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Apply search query
      if (searchQuery) {
        params.append("q", searchQuery);
      }

      // Apply selected filters from ReusableSearchFilter
      if (
        selectedFilters.categoryData &&
        selectedFilters.categoryData.length > 0
      ) {
        params.append("category", selectedFilters.categoryData[0]);
      }

      if (selectedFilters.leaddata && selectedFilters.leaddata.length > 0) {
        const statusValue = selectedFilters.leaddata[0]
          .toLowerCase()
          .replace(/ /g, "_");
        params.append("status", statusValue);
      }

      if (
        selectedFilters.priceRangeData &&
        selectedFilters.priceRangeData.length > 0
      ) {
        const priceRange = priceRangeData.find(
          (pr) => pr.pricerange === selectedFilters.priceRangeData[0]
        );
        if (priceRange) {
          params.append("priceRange", priceRange.value);
        }
      }

      if (selectedFilters.brandData && selectedFilters.brandData.length > 0) {
        params.append("brand", selectedFilters.brandData[0]);
      }

      if (
        selectedFilters.featuredData &&
        selectedFilters.featuredData.length > 0
      ) {
        params.append(
          "isFeatured",
          selectedFilters.featuredData[0] === "Featured Only" ? "true" : "false"
        );
      }

      // Apply sort
      if (selectedDateFilter && selectedDateFilter !== "custom") {
        params.append("sort", selectedDateFilter);
      }

      // Apply custom date range
      if (
        selectedDateFilter === "custom" &&
        customRange.startDate &&
        customRange.endDate
      ) {
        params.append("startDate", customRange.startDate);
        params.append("endDate", customRange.endDate);
      }

      // Pagination
      params.append("page", String(filters.page));
      params.append("limit", String(filters.limit));

      const response = await apiClient.get(
        apiClient.URLS.furniture,
        Object.fromEntries(params)
      );

      const body: any = response?.body ?? response;
      const data: any = body?.data ?? body;
      const total: number =
        typeof body?.total === "number"
          ? body.total
          : Array.isArray(data)
          ? data.length
          : 0;

      if (body?.stats && typeof body.stats === "object") {
        setGlobalStats({
          totalProducts: body.stats.totalProducts ?? total,
          totalStock: body.stats.totalStock ?? 0,
          activeProducts: body.stats.activeProducts ?? 0,
          outOfStock: body.stats.outOfStock ?? 0,
          featuredCount: body.stats.featuredCount ?? 0,
          avgPrice: body.stats.avgPrice ?? 0,
        });
      } else {
        setGlobalStats(null);
      }

      setAllData(Array.isArray(data) ? data : []);
      setTotalCount(total);
    } catch (error) {
      console.error("Failed to fetch furniture:", error);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedFilters,
    selectedDateFilter,
    customRange,
    filters.page,
    filters.limit,
    priceRangeData,
  ]);

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  const handleSeedFurniture = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const res = await apiClient.post(apiClient.URLS.furnitureSeed, {}, true);
      const { created, failed } = res.body;
      toast.success(`Seeded ${created} furniture items${failed ? ` (${failed} failed)` : ""}`);
      fetchFurniture();
    } catch (err: any) {
      toast.error(err?.body?.message || "Failed to seed furniture");
    } finally {
      setIsSeeding(false);
    }
  };

  const createFurniture = async (data: FurnitureData) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        apiClient.URLS.furniture,
        data,
        true
      );
      setAllData((prev) => [response.body, ...prev]);
      setOpenDrawer(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create furniture:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFurniture = async (id: number, data: FurnitureData) => {
    try {
      setLoading(true);
      const response = await apiClient.put(
        `${apiClient.URLS.furniture}/${id}`,
        data,
        true
      );
      setAllData((prev) =>
        prev.map((item) => (item.id === id ? response.body : item))
      );
      setOpenDrawer(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update furniture:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFurniture = async (id:any) => {
    try {
      setLoading(true);
      await apiClient.delete(`${apiClient.URLS.furniture}/${id}`, {}, true);
      setAllData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete furniture:", error);
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} selected items?`)) return;

    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedItems).map((id) =>
          apiClient.delete(`${apiClient.URLS.furniture}/${id}`, true)
        )
      );
      setAllData((prev) => prev.filter((item) => !selectedItems.has(item.id!)));
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FORM HANDLERS ====================
  const handleFormChange = (name: string, value: any) => {
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    } else if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        otherProperties: getDefaultValuesForCategory(value),
      }));
    } else if (name === "gstInclusive" || name === "isCODAvailable") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "Yes",
      }));
    } else if (
      categoryAttributes[formData.category]?.some(
        (field) => field.name === name
      )
    ) {
      setFormData((prev) => ({
        ...prev,
        otherProperties: {
          ...prev.otherProperties,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVariantChange = (name: string, value: any) => {
    setCurrentVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addVariant = () => {
    if (
      !currentVariant.sku ||
      currentVariant.mrp <= 0 ||
      currentVariant.sellingPrice <= 0
    ) {
      alert("Please fill all required variant fields");
      return;
    }

    const discountPercent =
      currentVariant.mrp > 0
        ? ((currentVariant.mrp - currentVariant.sellingPrice) /
          currentVariant.mrp) *
        100
        : 0;

    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          ...currentVariant,
          discountPercent: Number(discountPercent.toFixed(2)),
        },
      ],
    }));

    setCurrentVariant({
      sku: "",
      stockQty: 0,
      mrp: 0,
      sellingPrice: 0,
      isActive: true,
      isDefault: false,
      images: [],
    });
  };

  const handleVariantImageUpload = async (files: File[], target: "current" | number) => {
    const uploadResults: { url: string; alt?: string; sortOrder?: number; isPrimary?: boolean }[] = [];
    for (const file of files) {
      const fileURL = await uploadFile(file, "furniture");
      if (fileURL) {
        uploadResults.push({
          url: fileURL,
          alt: formData.name,
          sortOrder: 0,
          isPrimary: false,
        });
      }
    }
    if (target === "current") {
      const prevImages = currentVariant.images || [];
      setCurrentVariant((prev) => ({
        ...prev,
        images: [...prevImages, ...uploadResults].map((img, i) => ({
          ...img,
          isPrimary: i === 0,
          sortOrder: i,
        })),
      }));
    } else {
      setFormData((prev) => {
        const variants = [...prev.variants];
        const v = variants[target];
        if (!v) return prev;
        const prevImages = v.images || [];
        const newImages = [...prevImages, ...uploadResults].map((img, i) => ({
          ...img,
          isPrimary: i === 0,
          sortOrder: i,
        }));
        variants[target] = { ...v, images: newImages };
        return { ...prev, variants };
      });
    }
  };

  const removeVariantImage = (target: "current" | number, imgIdx: number) => {
    if (target === "current") {
      setCurrentVariant((prev) => {
        const imgs = (prev.images || []).filter((_, i) => i !== imgIdx);
        return { ...prev, images: imgs.map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i })) };
      });
    } else {
      setFormData((prev) => {
        const variants = [...prev.variants];
        const v = variants[target];
        if (!v?.images) return prev;
        const imgs = v.images.filter((_, i) => i !== imgIdx);
        variants[target] = { ...v, images: imgs.map((img, i) => ({ ...img, isPrimary: i === 0, sortOrder: i })) };
        return { ...prev, variants };
      });
    }
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  if(loading) {
    return (
      <div className="fixed inset-0 z-[9999] backdrop-blur-sm bg-white/50 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  const handleImageUpload = async (files: File[]) => {
    const uploadResults: FurnitureImage[] = [];

    for (const file of files) {
      const fileURL = await uploadFile(file, "furniture");
      if (fileURL) {
        uploadResults.push({
          url: fileURL,
          alt: formData.name,
          isPrimary: formData.images?.length === 0,
        });
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...uploadResults],
    }));
  };
  const handleDelete = () => {
    if (selectedDeleteId) {
      deleteFurniture(selectedDeleteId);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setFormData((prev) => {
      const imgs = [...(prev.images || [])];
      const newIndex = direction === "left" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= imgs.length) return prev;
      [imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]];
      return { ...prev, images: imgs };
    });
  };

  const getOfferStatus = (offer: FurnitureOffer): "active" | "expired" | "upcoming" | "no_dates" => {
    if (!offer.validFrom && !offer.validTo) return "no_dates";
    const now = new Date().getTime();
    const from = offer.validFrom ? new Date(offer.validFrom).getTime() : 0;
    const to = offer.validTo ? new Date(offer.validTo).getTime() : Number.POSITIVE_INFINITY;
    if (from && to && to < from) return "no_dates";
    if (offer.validTo && to < now) return "expired";
    if (offer.validFrom && from > now) return "upcoming";
    return "active";
  };

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

  const openEditOfferModal = (index: number) => {
    const offers = formData.offers || [];
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
    const offerToSave: FurnitureOffer = {
      type: currentOffer.type?.trim() || "",
      title: currentOffer.title?.trim() || "",
      description: currentOffer.description?.trim() || undefined,
      code: currentOffer.code?.trim() || undefined,
      validFrom: currentOffer.validFrom?.trim() || undefined,
      validTo: currentOffer.validTo?.trim() || undefined,
    };
    setFormData((prev) => {
      const offers = [...(prev.offers || [])];
      if (editingOfferIndex !== null) {
        offers[editingOfferIndex] = offerToSave;
      } else {
        offers.push(offerToSave);
      }
      return { ...prev, offers };
    });
    setErrors((prev) => ({ ...prev, offers: undefined }));
    closeOfferModal();
  };

  const removeOffer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      offers: (prev.offers || []).filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({ ...prev, [`offer_${index}`]: undefined, offers: undefined }));
  };

  const updateOffer = (index: number, field: keyof FurnitureOffer, value: string) => {
    setFormData((prev) => {
      const offers = [...(prev.offers || [])];
      if (!offers[index]) return prev;
      offers[index] = { ...offers[index], [field]: value || undefined };
      return { ...prev, offers };
    });
    setErrors((prev) => ({ ...prev, [`offer_${index}`]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (formData.variants.length === 0)
      newErrors.variants = "At least one variant is required";

    const offers = formData.offers || [];
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
        newErrors[`offer_${i}`] = "Set both Valid From and Valid To, or leave both empty for always valid";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (drawerMode === "edit" && selectedFurniture?.id) {
      await updateFurniture(selectedFurniture.id, formData);
    } else {
      await createFurniture(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      category: Category.Sofas,
      variants: [],
      images: [],
      offers: [],
      applicableCouponCodes: [],
      otherProperties: getDefaultValuesForCategory(Category.Sofas),
    });
    setCurrentVariant({
      sku: "",
      stockQty: 0,
      mrp: 0,
      sellingPrice: 0,
      isActive: true,
      isDefault: false,
      images: [],
    });
    setErrors({});
    setSelectedFurniture(null);
  };

  const openCreateDrawer = () => {
    resetForm();
    setDrawerMode("create");
    setOpenDrawer(true);
  };

  const openEditDrawer = (furniture: FurnitureData) => {
    setFormData(furniture);
    setSelectedFurniture(furniture);
    setDrawerMode("edit");
    setOpenDrawer(true);
  };

  const openViewDrawer = (furniture: FurnitureData) => {
    setSelectedFurniture(furniture);
    setDrawerMode("view");
    setOpenDrawer(true);
  };

  const applyFilter = () => {
    setIsOpen(false);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  // ==================== SELECTION HANDLERS ====================
  const handleSelectAll = () => {
    if (selectedItems.size === allData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(
        new Set(allData.map((item) => item.id!).filter(Boolean))
      );
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // ==================== PAGINATION ====================
  const totalPages = Math.ceil(totalCount / filters.limit);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==================== DYNAMIC FIELDS ====================
  const getDynamicFields = () => {
    const categoryFields = categoryAttributes[formData.category] || [];

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
              formData.otherProperties?.[field.name] || field.options[0]
            }
            errorMsg={fieldError}
            errorCls={fieldError ? "border-red-500" : ""}
          />
        );
      } else {
        return (
          <CustomInput
            key={idx}
            name={field.name}
            id={field.name}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            label={field.label}
            labelCls="font-medium label-text mb-2"
            type={field.type as "text" | "number"}
            value={formData.otherProperties?.[field.name] || ""}
            onChange={(e: any) => {
              handleFormChange(
                e?.target?.name ?? "",
                field.type === "number"
                  ? parseFloat(e?.target?.value) || 0
                  : e?.target?.value
              );
            }}
            errorMsg={fieldError}
            errorCls={fieldError ? "border-red-500" : ""}
          />
        );
      }
    });
  };

  // ==================== RENDER STATUS BADGE ====================
  const renderStatusBadge = (status?: FurnitureStatus) => {
    switch (status) {
      case FurnitureStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
            <MdCheckCircle />
            Active
          </span>
        );
      case FurnitureStatus.OUT_OF_STOCK:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
            <MdCancel />
            Out of Stock
          </span>
        );
      case FurnitureStatus.INACTIVE:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">
            <MdPending />
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
            <MdPending />
            Draft
          </span>
        );
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen w-full bg-gray-50 md:p-6 p-3">
      <div className="bg-white min-w-full rounded-lg shadow-sm md:p-6 p-4 mb-6">
        <div className="flex md:flex-row flex-col justify-between md:items-center items-start mb-6 gap-4">
          <div>
            <h1 className="md:text-3xl text-xl font-bold text-gray-800 flex items-center gap-3">
              <FaCouch className="text-[#3586FF] " />
              Furniture Management
            </h1>
            <p className="md:label-text text-xs text-gray-500 mt-1">
              Manage your furniture catalog with variants, pricing, and
              inventory
            </p>
          </div>

          <div className="flex gap-2 md:gap-3 flex-wrap">
            <Button
              className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 md:label-text text-xs font-medium"
              onClick={() => {
                /* Export logic */
              }}
            >
              <FaDownload className="text-xs" />
              <span className="hidden md:inline">Export</span>
            </Button>

            <Button
              className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 md:label-text text-xs font-medium"
              onClick={() => {
                /* Import logic */
              }}
            >
              <FaUpload className="text-xs" />
              <span className="hidden md:inline">Import</span>
            </Button>

            <Button
              className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 md:label-text text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSeedFurniture}
              disabled={isSeeding}
            >
              <FaDatabase className={`text-xs ${isSeeding ? "animate-pulse" : ""}`} />
              <span className="hidden md:inline">{isSeeding ? "Seeding..." : "Seed Data"}</span>
            </Button>

            <CustomTooltip
              label="Access Restricted - Contact Admin"
              position="bottom"
              showTooltip={!hasPermission("furniture", "create")}
            >
              <Button
                className="md:px-6 px-4 md:py-2 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed md:label-text text-xs"
                onClick={openCreateDrawer}
              >
                + Add New
              </Button>
            </CustomTooltip>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <FaBox className="text-blue-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.totalProducts}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Total Products
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <MdCheckCircle className="text-green-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.activeProducts}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Active
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <MdInventory className="text-purple-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.totalStock}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Total Stock
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 md:p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <MdCancel className="text-red-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.outOfStock}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Out of Stock
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 md:p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <FaStar className="text-yellow-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.featuredCount}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Featured
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 md:p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <FaChartLine className="text-indigo-600 md:text-2xl sub-heading" />
            </div>
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              ₹{statistics.avgPrice.toLocaleString()}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Avg Price
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex md:flex-row flex-col gap-3 md:items-center items-stretch">
          <div className="flex-1">
            <ReusableSearchFilter
              searchText={searchQuery}
              placeholder="Search by name, brand, category..."
              className=""
              onSearchChange={setSearchQuery}
              filters={[
                {
                  groupLabel: "Category",
                  key: "categoryData",
                  options: categoryData.map((item) => ({
                    id: String(item.role),
                    label: String(item.role),
                  })),
                },
                {
                  groupLabel: "Status",
                  key: "leaddata",
                  options: statusData.map((item) => ({
                    id: String(item.leadstatus),
                    label: item.leadstatus,
                  })),
                },
                {
                  groupLabel: "Price Range",
                  key: "priceRangeData",
                  options: priceRangeData.map((item) => ({
                    id: item.value,
                    label: item.pricerange,
                  })),
                },
                {
                  groupLabel: "Brand",
                  key: "brandData",
                  options: brandData.map((item) => ({
                    id: String(item.brand),
                    label: String(item.brand),
                  })),
                },
                {
                  groupLabel: "Featured",
                  key: "featuredData",
                  options: featuredData.map((item) => ({
                    id: String(item.featured),
                    label: item.featured,
                  })),
                },
              ]}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
              rootCls="md:mb-0"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative flex gap-2">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:label-text text-xs text-nowrap md:py-[6px] py-[5px] md:px-4 px-3 rounded-lg focus:outline-none hover:bg-gray-50"
            >
              <FiSliders className="text-gray-500" />
              <span className="hidden md:inline">Sort By</span>
            </Button>

            {/* View Toggle */}
            <Button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="flex items-center text-gray-600 gap-2 bg-white border font-medium border-gray-300 md:label-text text-xs md:py-[6px] py-[5px] md:px-4 px-3 rounded-lg focus:outline-none hover:bg-gray-50"
            >
              {viewMode === "grid" ? <FaThList /> : <FaThLarge />}
              <span className="hidden md:inline">
                {viewMode === "grid" ? "List" : "Grid"}
              </span>
            </Button>

            {isOpen && (
              <div className="absolute top-full right-0 md:w-[250px] w-[200px] mt-2 bg-white border border-gray-300 shadow-lg rounded-lg z-[99] md:label-text text-xs">
                <ul className="py-2">
                  {sortFiltersData.map((filter) => (
                    <li
                      key={filter.id}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        id={filter.id}
                        name="dateFilter"
                        checked={selectedDateFilter === filter.id}
                        onChange={() => setSelectedDateFilter(filter.id)}
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor={filter.id}
                        className="font-medium cursor-pointer flex-1"
                      >
                        {filter.label}
                      </label>
                    </li>
                  ))}
                  {selectedDateFilter === "custom" && (
                    <li className="px-4 py-2 border-t border-gray-200">
                      <CustomDate
                        type="date"
                        label="Start Date"
                        labelCls="md:label-text text-xs mt-2 font-medium"
                        value={customRange.startDate}
                        onChange={(e) =>
                          setCustomRange({
                            ...customRange,
                            startDate: e.target.value,
                          })
                        }
                        placeholder="Start Date"
                        className="px-3 py-1.5"
                        name="startDate"
                      />

                      <CustomDate
                        type="date"
                        label="End Date"
                        labelCls="md:label-text text-xs mt-2 font-medium"
                        value={customRange.endDate}
                        onChange={(e) =>
                          setCustomRange({
                            ...customRange,
                            endDate: e.target.value,
                          })
                        }
                        placeholder="End Date"
                        className="px-3 py-1.5"
                        name="endDate"
                      />
                    </li>
                  )}
                </ul>
                <div className="flex justify-end px-4 py-2 gap-2 border-t border-gray-200">
                  <Button
                    className="py-1.5 px-3 rounded-md border border-gray-300 md:label-text text-xs font-medium hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="py-1.5 px-3 rounded-md bg-blue-500 hover:bg-blue-600 md:label-text text-xs font-medium text-white"
                    onClick={applyFilter}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
            <span className="md:label-text text-xs font-medium text-blue-700">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                className="md:px-4 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white md:label-text text-xs font-medium"
                onClick={bulkDelete}
              >
                Delete Selected
              </Button>
              <Button
                className="md:px-4 px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 md:label-text text-xs font-medium"
                onClick={() => setSelectedItems(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Data Display Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {allData.length === 0 ? (
          <div className="md:p-12 p-8 text-center text-gray-500">
            <FaCouch className="mx-auto md:text-6xl text-4xl text-gray-300 mb-4" />
            <p className="md:sub-heading text-base font-medium">
              No furniture found
            </p>
            <p className="md:label-text text-xs mt-1">
              Try adjusting your filters or add a new item
            </p>
          </div>
        ) : viewMode === "list" ? (
          // List View
          <>
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50 hidden md:block">
              <div className="grid grid-cols-12 gap-4 p-4 label-text font-medium text-gray-600">
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.size === allData.length &&
                      allData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#3586FF]  focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Price</div>
                <div className="col-span-1">Stock</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {allData.map((item) => (
                <div
                  key={item.id}
                  className="grid md:grid-cols-12 grid-cols-1 gap-4 md:p-4 p-3 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Mobile: Select + Image + Info */}
                  <div className="md:hidden flex gap-3 items-start">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id!)}
                      onChange={() => handleSelectItem(item.id!)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-[#3586FF]  focus:ring-blue-500"
                    />
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaCouch className="text-2xl text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 label-text">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.brand || "No brand"} • {item.category}
                      </p>
                      <p className="font-medium text-gray-900 label-text mt-1">
                        ₹{item.baseSellingPrice?.toLocaleString()}
                        {item.baseMrp &&
                          item.baseMrp > item.baseSellingPrice! && (
                            <span className="text-xs text-gray-400 line-through ml-2">
                              ₹{item.baseMrp.toLocaleString()}
                            </span>
                          )}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {renderStatusBadge(item.status)}
                        {item.isFeatured && (
                          <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block md:col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id!)}
                      onChange={() => handleSelectItem(item.id!)}
                      className="w-4 h-4 rounded border-gray-300 text-[#3586FF]  focus:ring-blue-500"
                    />
                  </div>

                  <div className="hidden md:flex md:col-span-3 gap-3 items-center">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <Image
                          src={item.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaCouch className="text-2xl text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.brand || "No brand"}
                      </p>
                      {item.isFeatured && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                      {item.category}
                    </span>
                    {item.subCategory && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.subCategory}
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block md:col-span-2">
                    <p className="font-medium text-gray-900">
                      ₹{item.baseSellingPrice?.toLocaleString()}
                    </p>
                    {item.baseMrp && item.baseMrp > item.baseSellingPrice! && (
                      <>
                        <p className="text-xs text-gray-400 line-through">
                          ₹{item.baseMrp.toLocaleString()}
                        </p>
                        <span className="text-xs text-green-600 font-medium">
                          {item.baseDiscountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="hidden md:block md:col-span-1">
                    <p className="label-text font-medium text-gray-900">
                      {item.variants?.reduce(
                        (sum, v) => sum + (v.stockQty || 0),
                        0
                      ) || 0}
                    </p>
                    <p className="text-xs text-gray-500">units</p>
                  </div>

                  <div className="hidden md:block md:col-span-1">
                    {renderStatusBadge(item.status)}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex md:justify-end justify-start gap-2 md:mt-0 mt-3">
                    <CustomTooltip label="View Details" position="top">
                      <Button
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        onClick={() => openViewDrawer(item)}
                      >
                        <FaEye className="md:sub-heading text-base" />
                      </Button>
                    </CustomTooltip>

                    <CustomTooltip
                      label={
                        hasPermission("furniture", "edit")
                          ? "Edit"
                          : "Access Restricted"
                      }
                      position="top"
                    >
                      <Button
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => openEditDrawer(item)}
                        disabled={!hasPermission("furniture", "edit")}
                      >
                        <FaEdit className="md:sub-heading text-base" />
                      </Button>
                    </CustomTooltip>

                    <CustomTooltip
                      label={
                        hasPermission("furniture", "delete")
                          ? "Delete"
                          : "Access Restricted"
                      }
                      position="top"
                    >
                      <Button
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                          setSelectedDeleteId(item.id!);
                          setOpenDeleteModal(true);
                        }}
                      disabled={!hasPermission("furniture", "delete")}
                      >
                        <FaTrash className="md:sub-heading text-base" />
                      </Button>
                    </CustomTooltip>

                    <Button
                      className="md:px-3 px-2 md:py-1.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white md:text-xs text-[10px] font-medium"
                      onClick={() =>
                        router.push(`/furnitures/${item.id}/itemanalytics`)
                      }
                    >
                      Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:p-6 p-4">
            {allData.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  {item.images && item.images.length > 0 ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaCouch className="text-5xl text-gray-300" />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => openViewDrawer(item)}
                    >
                      <FaEye className="text-gray-700" />
                    </button>
                    <button
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                      onClick={() => openEditDrawer(item)}
                      disabled={!hasPermission("furniture", "edit")}
                    >
                      <FaEdit className="text-blue-600" />
                    </button>
                    <button
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                      onClick={() => deleteFurniture(item.id!)}
                      disabled={!hasPermission("furniture", "delete")}
                    >
                      <FaTrash className="text-red-600" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-2">
                    {item.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium">
                        ⭐ Featured
                      </span>
                    )}
                    {item.baseDiscountPercent &&
                      item.baseDiscountPercent > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium">
                          {item.baseDiscountPercent}% OFF
                        </span>
                      )}
                  </div>

                  {/* Checkbox */}
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id!)}
                      onChange={() => handleSelectItem(item.id!)}
                      className="w-5 h-5 rounded border-gray-300 text-[#3586FF]  focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {item.brand || "No brand"}
                  </p>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="sub-heading font-bold text-gray-900">
                      ₹{item.baseSellingPrice?.toLocaleString()}
                    </span>
                    {item.baseMrp && item.baseMrp > item.baseSellingPrice! && (
                      <span className="label-text text-gray-400 line-through">
                        ₹{item.baseMrp.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MdInventory />
                      <span>
                        {item.variants?.reduce(
                          (sum, v) => sum + (v.stockQty || 0),
                          0
                        ) || 0}{" "}
                        units
                      </span>
                    </div>
                    {renderStatusBadge(item.status)}
                  </div>

                  <Button
                    className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white label-text font-medium"
                    onClick={() =>
                      router.push(`/furniture/${item.id}/analytics`)
                    }
                  >
                    View Analytics
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Modal
          isOpen={openDeleteModal}
          closeModal={() => setOpenDeleteModal(false)}
          title=""
          className="md:max-w-[500px] max-w-[330px]"
          rootCls="flex items-center justify-center z-[9999]"
          isCloseRequired={false}
        >
          <div className="md:p-6 p-3 z-20 ">
            <div className="flex justify-between items-center md:mb-4 mb-2">
              <h3 className="md:text-[20px] text-center w-full text-[14px] font-medium text-gray-900">
                Confirm Deletion
              </h3>
            </div>

            <p className="md:label-text text-center text-[12px] text-gray-500 mb-4">
              Are you sure you want to delete this furniture item? This action
              cannot be undone.
            </p>

            <div className="md:mt-6 mt-3 flex justify-between md:space-x-3 space-x-1">
              <Button
                className="md:px-[28px] px-[14px] md:text-[16px] text-[12px] md:py-3 py-1 rounded-md border-2 bg-gray-100 hover:bg-gray-200 font-medium text-gray-700"
                onClick={() => setOpenDeleteModal(false)}
              >
                Cancel
              </Button>

              <Button
                className="md:px-[28px] px-[14px] md:py-3 py-1 md:text-[16px] text-[12px] rounded-md border-2 bg-red-600 text-white"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4 py-3 flex md:flex-row flex-col md:items-center items-stretch justify-between gap-3">
            <div className="md:label-text text-xs text-gray-500 text-center md:text-left">
              Showing {(filters.page - 1) * filters.limit + 1} to{" "}
              {Math.min(filters.page * filters.limit, totalCount)} of{" "}
              {totalCount} results
            </div>

            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                className="md:px-3 px-2 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 md:label-text text-xs"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, idx) => {
                const page = idx + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= filters.page - 1 && page <= filters.page + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      className={`md:px-3 px-2 py-1 rounded-lg border md:label-text text-xs ${page === filters.page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === filters.page - 2 ||
                  page === filters.page + 2
                ) {
                  return (
                    <span key={page} className="px-2">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <Button
                className="md:px-3 px-2 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 md:label-text text-xs"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {openDrawer && (
        <Drawer
          open={openDrawer}
          handleDrawerToggle={() => {
            setOpenDrawer(false);
            resetForm();
          }}
          closeIconCls="text-gray-700 hover:text-gray-900"
          openVariant="right"
          panelCls="w-full md:w-[900px] shadow-2xl"
          overLayCls="bg-black/30 backdrop-blur-sm"
        >
          <div className="h-full flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <FaCouch className="text-[#3586FF] " />
                {drawerMode === "create"
                  ? "Add New Furniture"
                  : drawerMode === "edit"
                    ? "Edit Furniture"
                    : "View Furniture Details"}
              </h2>
              {drawerMode !== "view" && (
                <p className="md:text-[12px] text-[10px] text-gray-500 mt-1">
                  Fill in the details below. All fields marked with * are
                  required.
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {drawerMode === "view" ? (
                <div className="space-y-6">
                  {selectedFurniture?.images &&
                    selectedFurniture.images.length > 0 && (
                      <div>
                        <h3 className="sub-heading font-medium mb-3">
                          Product Images
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedFurniture.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                            >
                              <Image
                                src={img.url}
                                alt={img.alt || ""}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block label-text font-medium text-gray-600 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900 label-text">{selectedFurniture?.name}</p>
                    </div>
                    <div>
                      <label className="block label-text font-medium text-gray-600 mb-1">
                        Category
                      </label>
                      <p className="text-gray-900 label-text">
                        {selectedFurniture?.category}
                      </p>
                    </div>
                    <div>
                      <label className="block label-text font-medium text-gray-600 mb-1">
                        Brand
                      </label>
                      <p className="text-gray-900 label-text">
                        {selectedFurniture?.brand || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block label-text font-medium text-gray-600 mb-1">
                        Status
                      </label>
                      <p className="text-gray-900 label-text">
                        {selectedFurniture?.status}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedFurniture?.description && (
                    <div>
                      <label className="block label-text font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <p className="text-gray-900 label-text">
                        {selectedFurniture.description}
                      </p>
                    </div>
                  )}

                  {/* Offers & Coupons (view) */}
                  {((selectedFurniture?.offers && selectedFurniture.offers.length > 0) ||
                    (selectedFurniture?.applicableCouponCodes && selectedFurniture.applicableCouponCodes.length > 0)) && (
                    <div>
                      <h3 className="sub-heading font-medium mb-3">Offers & Coupons</h3>
                      {selectedFurniture?.offers && selectedFurniture.offers.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {selectedFurniture.offers.map((offer, idx) => {
                            const status = getOfferStatus(offer);
                            return (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900 label-text">
                                      {offer.type} — {offer.title}
                                    </p>
                                    {offer.description && (
                                      <p className="text-gray-600 label-text text-sm mt-1">{offer.description}</p>
                                    )}
                                    {offer.code && (
                                      <p className="text-blue-600 label-text text-sm mt-1">Code: {offer.code}</p>
                                    )}
                                    {(offer.validFrom || offer.validTo) && (
                                      <p className="text-gray-500 text-xs mt-1">
                                        {offer.validFrom || "—"} to {offer.validTo || "—"}
                                      </p>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : status === "expired"
                                          ? "bg-red-100 text-red-800"
                                          : status === "upcoming"
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {status === "no_dates" ? "Always valid" : status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {selectedFurniture?.applicableCouponCodes && selectedFurniture.applicableCouponCodes.length > 0 && (
                        <div>
                          <label className="block label-text font-medium text-gray-600 mb-1">
                            Applicable coupon codes
                          </label>
                          <p className="text-gray-900 label-text">
                            {selectedFurniture.applicableCouponCodes.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Variants */}
                  <div>
                    <h3 className="sub-heading font-medium mb-3">
                      Variants
                    </h3>
                    <div className="space-y-3">
                      {selectedFurniture?.variants.map((variant, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-3 label-text">
                            <div>
                              <span className="text-gray-600 label-text">SKU:</span>
                              <p className="font-medium label-text">
                                {variant.sku}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 label-text">MRP:</span>
                              <p className="font-medium label-text">
                                ₹{variant.mrp}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 label-text">
                                Selling Price:
                              </span>
                              <p className="font-medium label-text">
                                ₹{variant.sellingPrice}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 label-text">Stock:</span>
                              <p className="font-medium label-text">
                                {variant.stockQty} units
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <p className="font-medium">
                                {variant.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Create/Edit Mode
                <form className="space-y-6 z-[9999]">
                  {/* Basic Information */}
                  <div>
                    <h3 className="sub-heading text-[#3586FF]  font-medium mb-4 pb-2 border-b">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <CustomInput
                          name="name"
                          id="name"
                          label="Product Name "
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter product name"
                          type="text"
                          value={formData.name}
                          onChange={(e: any) =>
                            handleFormChange("name", e.target.value)
                          }
                          errorMsg={errors.name}
                          errorCls={errors.name ? "border-red-500" : ""}
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <CustomInput
                          name="slug"
                          id="slug"
                          label="Slug (URL-friendly name) *"
                          labelCls="font-medium label-text mb-2"
                          placeholder="auto-generated-slug"
                          type="text"
                          value={formData.slug}
                          onChange={(e: any) =>
                            handleFormChange("slug", e.target.value)
                          }
                          errorMsg={errors.slug}
                          errorCls={errors.slug ? "border-red-500" : ""}
                        />
                      </div>

                      <div>
                        <SingleSelect
                          name="category"
                          label="Category "
                          required
                          labelCls="font-medium label-text mb-2"
                          type="single-select"
                          handleChange={handleFormChange}
                          optionsInterface={{ isObj: false }}
                          options={Object.values(Category)}
                          selectedOption={formData.category}

                        />
                      </div>
                      <div>
                        {formData.category &&
                          subCategoryMap[formData.category] &&
                          subCategoryMap[formData.category].length > 0 ? (
                          <SingleSelect
                            name="subCategory"
                            label="Sub Category"
                            required
                            labelCls="font-medium label-text mb-2"
                            type="single-select"
                            handleChange={handleFormChange}
                            optionsInterface={{ isObj: false }}
                            options={subCategoryMap[formData.category]}
                            selectedOption={formData.subCategory}

                          />
                        ) : (
                          <CustomInput
                            name="subCategory"
                            id="subCategory"
                            label="Sub Category"
                            labelCls="font-medium label-text mb-2"
                            placeholder="Enter sub category"
                            type="text"
                            value={formData.subCategory || ""}
                            onChange={(e: any) =>
                              handleFormChange("subCategory", e.target.value)
                            }
                            required
                          />
                        )}
                      </div>

                      <CustomInput
                        name="brand"
                        id="brand"
                        label="Brand"
                        labelCls="font-medium label-text mb-2"
                        placeholder="Enter brand name"
                        type="text"
                        value={formData.brand || ""}
                        onChange={(e: any) =>
                          handleFormChange("brand", e.target.value)
                        }
                        required
                      />
                      <div className="flex flex-col md:gap-y-[2px] gap-y-[1px]">
                        <SingleSelect
                          name="status"
                          label="Status"
                          labelCls="font-medium label-text mb-2"
                          type="single-select"
                          handleChange={handleFormChange}
                          optionsInterface={{ isObj: false }}
                          options={Object.values(FurnitureStatus)}
                          selectedOption={
                            formData.status || FurnitureStatus.DRAFT
                          }
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <CustomInput
                          name="description"
                          id="description"
                          label="Description"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter product description"
                          type="textarea"
                          value={formData.description || ""}
                          onChange={(e: any) =>
                            handleFormChange("description", e.target.value)
                          }
                          className="px-2 py-2"
                          required
                        />
                      </div>

                      <CustomInput
                        name="warranty"
                        id="warranty"
                        label="Warranty"
                        labelCls="font-medium label-text mb-2"
                        placeholder="e.g., 2 years"
                        type="text"
                        value={formData.warranty || ""}
                        onChange={(e: any) =>
                          handleFormChange("warranty", e.target.value)
                        }
                      />

                      <CustomInput
                        name="deliveryTime"
                        id="deliveryTime"
                        label="Delivery Time"
                        labelCls="font-medium label-text mb-2"
                        placeholder="e.g., 5-7 business days"
                        type="text"
                        value={formData.deliveryTime || ""}
                        onChange={(e: any) =>
                          handleFormChange("deliveryTime", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Pricing & GST (product-level; variant prices in Variants section below) */}
                  <div>
                    <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">
                      Pricing & GST
                    </h3>
                    <p className="label-text text-gray-600 mb-3">
                      Currency and tax apply to all variants. Base price is derived from the default/cheapest variant.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomInput
                        name="currencyCode"
                        id="currencyCode"
                        label="Currency"
                        labelCls="font-medium label-text mb-2"
                        placeholder="INR"
                        type="text"
                        value={formData.currencyCode || "INR"}
                        onChange={(e: any) =>
                          handleFormChange("currencyCode", e.target.value)
                        }
                      />
                      <CustomInput
                        name="taxPercentage"
                        id="taxPercentage"
                        label="Tax (GST) %"
                        labelCls="font-medium label-text mb-2"
                        placeholder="18"
                        type="number"
                        value={formData.taxPercentage ?? ""}
                        onChange={(e: any) =>
                          handleFormChange(
                            "taxPercentage",
                            e.target.value !== ""
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                      />
                      <CustomInput
                        name="hsnCode"
                        id="hsnCode"
                        label="HSN Code"
                        labelCls="font-medium label-text mb-2"
                        placeholder="e.g. 9403"
                        type="text"
                        value={formData.hsnCode || ""}
                        onChange={(e: any) =>
                          handleFormChange("hsnCode", e.target.value)
                        }
                      />
                      <SingleSelect
                        name="gstInclusive"
                        label="GST inclusive price"
                        labelCls="font-medium label-text mb-2"
                        type="single-select"
                        handleChange={handleFormChange}
                        optionsInterface={{ isObj: false }}
                        options={["Yes", "No"]}
                        selectedOption={formData.gstInclusive ? "Yes" : "No"}
                      />
                    </div>
                  </div>

                  {/* Return policy & delivery (COD, locations, shipping) */}
                  <div>
                    <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">
                      Return policy & delivery
                    </h3>
                    <p className="label-text text-gray-600 mb-3">
                      Return policy text and whether COD is available. Coupons can be applied at checkout even when payment is Cash on Delivery.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <CustomInput
                          name="returnPolicy"
                          id="returnPolicy"
                          label="Return policy"
                          labelCls="font-medium label-text mb-2"
                          placeholder="e.g. 7 days return for manufacturing defects; no return for customised items"
                          type="textarea"
                          value={formData.returnPolicy || ""}
                          onChange={(e: any) =>
                            handleFormChange("returnPolicy", e.target.value)
                          }
                          className="px-2 py-2"
                        />
                      </div>
                      <SingleSelect
                        name="isCODAvailable"
                        label="Cash on delivery (COD) available"
                        labelCls="font-medium label-text mb-2"
                        type="single-select"
                        handleChange={handleFormChange}
                        optionsInterface={{ isObj: false }}
                        options={["Yes", "No"]}
                        selectedOption={formData.isCODAvailable ? "Yes" : "No"}
                      />
                      <CustomInput
                        name="deliveryLocations"
                        id="deliveryLocations"
                        label="Delivery locations"
                        labelCls="font-medium label-text mb-2"
                        placeholder="e.g. All India (serviceable pincodes)"
                        type="text"
                        value={formData.deliveryLocations || ""}
                        onChange={(e: any) =>
                          handleFormChange("deliveryLocations", e.target.value)
                        }
                      />
                      <CustomInput
                        name="shippingWeight"
                        id="shippingWeight"
                        label="Shipping weight (kg)"
                        labelCls="font-medium label-text mb-2"
                        placeholder="Optional"
                        type="number"
                        value={
                          formData.shippingDetails?.weight ?? ""
                        }
                        onChange={(e: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            shippingDetails: {
                              ...prev.shippingDetails,
                              weight:
                                e.target.value !== ""
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              dimensions: prev.shippingDetails?.dimensions,
                            },
                          }))
                        }
                      />
                      <CustomInput
                        name="shippingDimensions"
                        id="shippingDimensions"
                        label="Shipping dimensions"
                        labelCls="font-medium label-text mb-2"
                        placeholder="e.g. 120 x 80 x 90 cm"
                        type="text"
                        value={formData.shippingDetails?.dimensions || ""}
                        onChange={(e: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            shippingDetails: {
                              ...prev.shippingDetails,
                              weight: prev.shippingDetails?.weight,
                              dimensions: e.target.value || undefined,
                            },
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Offers & Coupons */}
                  <div>
                    <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">
                      Offers & Coupons
                    </h3>
                    <p className="label-text text-gray-600 mb-3">
                      Add product-level offers with optional validity. If both Valid From and Valid To are set, the offer is shown only in that period.
                    </p>

                    {(formData.offers || []).map((offer, idx) => (
                      <div
                        key={idx}
                        className="p-4 mb-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium label-text text-gray-700">Offer {idx + 1}: {offer.type} – {offer.title}</span>
                          <div className="flex gap-2">
                            <button
                              
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              onClick={() => openEditOfferModal(idx)}
                              title="Edit offer"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              onClick={() => removeOffer(idx)}
                              title="Remove offer"
                            >
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
                        {errors[`offer_${idx}`] && (
                          <p className="text-red-500 label-text mt-2">{errors[`offer_${idx}`]}</p>
                        )}
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

                    <Button
                      
                      className="w-full md:w-auto px-4 py-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                      onClick={openAddOfferModal}
                    >
                      <FaTag className="text-sm" /> Add Offer
                    </Button>

                    {/* Add/Edit Offer Modal */}
                    <Modal
                      isOpen={offerModalOpen}
                      closeModal={closeOfferModal}
                      title={editingOfferIndex !== null ? "Edit Offer" : "Add Offer"}
                      isCloseRequired={false}
                      className="max-w-lg"
                    >
                      <div className="space-y-3">
                        {offerModalError && (
                          <p className="text-red-500 label-text">{offerModalError}</p>
                        )}
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
                          id="modal_offer_code"
                          label="Coupon code (optional)"
                          labelCls="font-medium label-text mb-2"
                          placeholder="e.g. SAVE10"
                          type="text"
                          value={currentOffer.code || ""}
                          onChange={(e: any) => setCurrentOffer((p) => ({ ...p, code: e.target.value }))}
                        />
                        <CustomDate
                          type="date"
                          label="Valid From (optional)"
                          labelCls="font-medium label-text mb-2"
                          value={currentOffer.validFrom || ""}
                          onChange={(e: any) => setCurrentOffer((p) => ({ ...p, validFrom: e.target.value }))}
                          placeholder="Start date"
                          className="px-3"
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
                          name="modal_offer_validTo"
                        />
                        <div className="flex gap-2 mt-4">
                          <Button
                            
                            className="px-4 py-2 bg-gray-200 btn-text !font-medium hover:bg-gray-300 rounded-lg"
                            onClick={closeOfferModal}
                          >
                            Cancel
                          </Button>
                          <Button
                            
                            className="px-4 py-2 bg-blue-500 btn-text !font-medium hover:bg-blue-600 text-white rounded-lg"
                            onClick={saveOfferFromModal}
                          >
                            {editingOfferIndex !== null ? "Save" : "Add Offer"}
                          </Button>
                        </div>
                      </div>
                    </Modal>

                    <div className="mt-4">
                      <CustomInput
                        name="applicableCouponCodes"
                        id="applicableCouponCodes"
                        label="Applicable coupon codes (comma-separated)"
                        labelCls="font-medium label-text mb-2"
                        placeholder="SAVE10, WELCOME20, FURNITURE5"
                        type="text"
                        value={(formData.applicableCouponCodes || []).join(", ")}
                        onChange={(e: any) => {
                          const raw = e?.target?.value ?? "";
                          const codes = raw.split(",").map((s: string) => s.trim()).filter(Boolean);
                          setFormData((prev) => ({ ...prev, applicableCouponCodes: codes }));
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        List coupon codes that customers can use for this product (including when paying by COD). Used for display and checkout validation.
                      </p>
                    </div>
                  </div>

                  {/* SEO (optional) */}
                  <div>
                    <h3 className="sub-heading text-[#3586FF] font-medium mb-4 pb-2 border-b">
                      SEO (optional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomInput
                        name="metaTitle"
                        id="metaTitle"
                        label="Meta title"
                        labelCls="font-medium label-text mb-2"
                        placeholder="Product page title for search"
                        type="text"
                        value={formData.metaTitle || ""}
                        onChange={(e: any) =>
                          handleFormChange("metaTitle", e.target.value)
                        }
                      />
                      <div className="md:col-span-2">
                        <CustomInput
                          name="metaDescription"
                          id="metaDescription"
                          label="Meta description"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Short description for search results"
                          type="textarea"
                          value={formData.metaDescription || ""}
                          onChange={(e: any) =>
                            handleFormChange("metaDescription", e.target.value)
                          }
                          className="px-2 py-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <CustomInput
                          name="searchTags"
                          id="searchTags"
                          label="Search tags (comma-separated)"
                          labelCls="font-medium label-text mb-2"
                          placeholder="sofa, sectional, living room"
                          type="text"
                          value={(formData.searchTags || []).join(", ")}
                          onChange={(e: any) => {
                            const raw = e?.target?.value ?? "";
                            const tags = raw.split(",").map((s: string) => s.trim()).filter(Boolean);
                            setFormData((prev) => ({ ...prev, searchTags: tags }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="sub-heading text-[#3586FF]  font-medium mb-4 pb-2 border-b">
                          {formData.category} Specifications
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {getDynamicFields()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="sub-heading text-[#3586FF]  font-medium mb-4 pb-2 border-b">
                      Product Variants
                    </h3>

                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="label-text text-[#3586FF]   font-medium mb-3">
                        Add New Variant
                      </p>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <CustomInput
                          name="sku"
                          id="sku"
                          label="SKU"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter SKU"
                          type="text"
                          value={currentVariant.sku}
                          onChange={(e: any) =>
                            handleVariantChange("sku", e.target.value)
                          }
                          required
                        />

                        <CustomInput
                          name="mrp"
                          id="mrp"
                          label="MRP"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter MRP"
                          type="number"
                          value={currentVariant.mrp}
                          onChange={(e: any) =>
                            handleVariantChange(
                              "mrp",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />

                        <CustomInput
                          name="sellingPrice"
                          id="sellingPrice"
                          label="Selling Price"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter selling price"
                          type="number"
                          value={currentVariant.sellingPrice}
                          onChange={(e: any) =>
                            handleVariantChange(
                              "sellingPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />

                        <CustomInput
                          name="stockQty"
                          id="stockQty"
                          label="Stock Quantity"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter stock quantity"
                          type="number"
                          value={currentVariant.stockQty}
                          onChange={(e: any) =>
                            handleVariantChange(
                              "stockQty",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                        />

                        <CustomInput
                          name="colorName"
                          id="colorName"
                          label="Color Name"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter color name"
                          type="text"
                          value={currentVariant.colorName || ""}
                          onChange={(e: any) =>
                            handleVariantChange("colorName", e.target.value)
                          }
                        />

                        <CustomInput
                          name="material"
                          id="material"
                          label="Material"
                          labelCls="font-medium label-text mb-2"
                          placeholder="Enter material"
                          type="text"
                          value={currentVariant.material || ""}
                          onChange={(e: any) =>
                            handleVariantChange("material", e.target.value)
                          }
                        />
                      </div>

                      <div className="mt-3">
                        <p className="label-text font-medium text-gray-600 mb-2">Variant Images (shown when this SKU is selected)</p>
                        <label className="block w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors">
                          <FaUpload className="mx-auto text-xl text-gray-400 mb-1" />
                          <p className="text-sm text-gray-600">Upload images for this variant</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleVariantImageUpload(files, "current");
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {(currentVariant.images?.length ?? 0) > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {currentVariant.images!.map((img, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 border">
                                <Image src={img.url} alt={img.alt || ""} width={64} height={64} className="object-cover w-full h-full" />
                                <button  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl" onClick={() => removeVariantImage("current", idx)}><MdClose className="text-xs" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        
                        className="w-full px-4 py-2 font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg mt-4"
                        onClick={addVariant}
                      >
                        + Add Variant
                      </Button>
                    </div>

                    {/* Existing Variants */}
                    {formData.variants.length > 0 && (
                      <div className="space-y-3">
                        <p className="label-text font-medium text-gray-600">
                          Added Variants ({formData.variants.length})
                        </p>
                        {formData.variants.map((variant, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 grid grid-cols-3 gap-3 label-text">
                                <div>
                                  <span className="text-gray-600">SKU:</span>
                                  <p className="font-medium">
                                    {variant.sku}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">MRP:</span>
                                  <p className="font-medium">
                                    ₹{variant.mrp}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Selling Price:
                                  </span>
                                  <p className="font-medium">
                                    ₹{variant.sellingPrice}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Stock:</span>
                                  <p className="font-medium">
                                    {variant.stockQty} units
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    Discount:
                                  </span>
                                  <p className="font-medium text-green-600">
                                    {variant.discountPercent}%
                                  </p>
                                </div>
                                {(variant.colorName || variant.material) && (
                                  <div>
                                    <span className="text-gray-600">Color/Material:</span>
                                    <p className="font-medium">
                                      {[variant.colorName, variant.material].filter(Boolean).join(" / ")}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <button
                                
                                className="ml-2 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                onClick={() => removeVariant(idx)}
                              >
                                <MdDelete />
                              </button>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-500 mb-2">Variant images</p>
                              <div className="flex gap-2 items-center flex-wrap">
                                {(variant.images ?? []).map((img, imgIdx) => (
                                  <div key={imgIdx} className="relative w-14 h-14 rounded overflow-hidden bg-gray-100 border shrink-0">
                                    <Image src={img.url} alt={img.alt || ""} width={56} height={56} className="object-cover w-full h-full" />
                                    <button  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl text-[10px]" onClick={() => removeVariantImage(idx, imgIdx)}><MdClose /></button>
                                  </div>
                                ))}
                                <label className="w-14 h-14 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 shrink-0">
                                  <FaUpload className="text-gray-400 text-lg" />
                                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); handleVariantImageUpload(files, idx); e.target.value = ""; }} />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.variants && (
                      <p className="text-red-500 label-text mt-2">
                        {errors.variants}
                      </p>
                    )}
                  </div>

                  {/* Images Section */}
                  <div>
                    <h3 className="sub-heading font-medium mb-4 pb-2 border-b">
                      Product Images
                    </h3>

                    {/* Image Upload */}
                    <div className="mb-4">
                      <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors">
                        <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                        <p className="label-text text-gray-600">
                          Click to upload images
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            handleImageUpload(files);
                          }}
                        />
                      </label>
                    </div>

                    {/* Image carousel – reorder, set primary, optional angle for 360-style */}
                    {formData.images && formData.images.length > 0 && (
                      <div>
                        <p className="label-text text-gray-600 mb-2">
                          Drag order: first image is the main/carousel lead. Set one as primary for listing.
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {formData.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="relative flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-gray-100 group border-2 border-transparent hover:border-blue-300"
                            >
                              <Image
                                src={img.url}
                                alt={img.alt || ""}
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                <div className="flex gap-1">
                                  <button
                                    
                                    className="p-1.5 bg-white rounded shadow text-gray-700 disabled:opacity-50"
                                    onClick={() => moveImage(idx, "left")}
                                    disabled={idx === 0}
                                    title="Move left"
                                  >
                                    ←
                                  </button>
                                  <button
                                    
                                    className="p-1.5 bg-white rounded shadow text-gray-700 disabled:opacity-50"
                                    onClick={() => moveImage(idx, "right")}
                                    disabled={idx === formData.images!.length - 1}
                                    title="Move right"
                                  >
                                    →
                                  </button>
                                </div>
                                <button
                                  
                                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                  onClick={() => setPrimaryImage(idx)}
                                >
                                  {img.isPrimary ? "Primary" : "Set primary"}
                                </button>
                                <button
                                  
                                  className="p-1 bg-red-500 text-white rounded-full"
                                  onClick={() => removeImage(idx)}
                                  title="Remove"
                                >
                                  <MdClose className="text-sm" />
                                </button>
                              </div>
                              {img.isPrimary && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[10px] rounded">
                                  Primary
                                </span>
                              )}
                              <span className="absolute top-1 right-1 text-[10px] font-medium text-white bg-black/60 px-1 rounded">
                                {idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer */}
            {drawerMode !== "view" && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                <Button
                  className="px-6 py-1 rounded-lg border btn-text  border-gray-300 font-medium bg-white hover:bg-gray-50"
                  onClick={() => {
                    setOpenDrawer(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="px-6 py-1 rounded-lg btn-text bg-blue-500 hover:bg-blue-600 font-medium text-white"
                  onClick={handleSubmit}
                >
                  {drawerMode === "edit"
                    ? "Update Furniture"
                    : "Create Furniture"}
                </Button>
              </div>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default FurnitureManagementPortal;
