import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaEdit, FaPlus, FaBox, FaStar, FaChartLine, FaDatabase } from "react-icons/fa";
import Image from "next/image";
import apiClient from "@/src/utils/apiClient";
import HomeDecorForm from "./HomeDecorForm";
import { HomeMini } from "@mui/icons-material";
import Drawer from "@/src/common/Drawer";
import Button from "@/src/common/Button";
import Loader from "../SpinLoader";
import { CgTrash } from "react-icons/cg";
import { Pagination } from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";
import ReusableSearchFilter from "@/src/common/SearchFilter";
import { FiSliders } from "react-icons/fi";
import { FaThLarge, FaThList } from "react-icons/fa";
import { MdCheckCircle, MdCancel, MdInventory } from "react-icons/md";

export interface TableColumn {
  label: string;
  key: string;
  status: boolean;
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

type FieldType = "text" | "number" | "single-select";

interface CategoryField {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
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
  rating: number;
  otherProperties: Record<string, any>;
  deliveryTime: string;
  assembly: string;
  customizeOptions: boolean;
  warranty: string;
  brand: string;
  deliveryLocations: string;
  slug?: string;
  isFeatured?: boolean;
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

interface ValidationErrors {
  name?: string;
  price?: string;
  prodDetails?: string;
  discount?: string;
  productQuantity?: string;
  rating?: string;
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

const categoryAttributes: Record<HomeDecorsCategory, CategoryField[]> = {
  [HomeDecorsCategory.WallShelves]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Rustic"],
    },
  ],

  [HomeDecorsCategory.Baskets]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wicker", "Plastic", "Fabric"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Oval", "Rectangle"],
    },
  ],

  [HomeDecorsCategory.Figurines]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Ceramic", "Glass", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "theme",
      label: "Theme",
      type: "single-select",
      options: ["Animal", "Human", "Fantasy"],
    },
  ],

  [HomeDecorsCategory.PotsAndPlants]: [
    {
      name: "plantType",
      label: "Plant Type",
      type: "single-select",
      options: ["Flowering", "Succulent", "Herb"],
    },
    {
      name: "potMaterial",
      label: "Pot Material",
      type: "single-select",
      options: ["Ceramic", "Plastic", "Wood"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.ArtificalPlantsAndFlowers]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Plastic", "Fabric", "Paper"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "color",
      label: "Color",
      type: "single-select",
      options: ["Red", "Pink", "Yellow", "Green"],
    },
  ],

  [HomeDecorsCategory.Tableware]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Ceramic", "Glass", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "pattern",
      label: "Pattern",
      type: "single-select",
      options: ["Solid", "Striped", "Floral"],
    },
  ],

  [HomeDecorsCategory.DinnerSet]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Ceramic", "Glass", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "pattern",
      label: "Pattern",
      type: "single-select",
      options: ["Solid", "Striped", "Floral"],
    },
  ],

  [HomeDecorsCategory.CoffeeMugs]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Ceramic", "Glass", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "design",
      label: "Design",
      type: "single-select",
      options: ["Solid", "Patterned", "Quote"],
    },
  ],

  [HomeDecorsCategory.ServingTrays]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Glass"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Oval", "Rectangle"],
    },
  ],

  [HomeDecorsCategory.Teapots]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Ceramic", "Glass", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.Glassware]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Glass", "Crystal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.Clocks]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Wall Clock", "Table Clock", "Floor Clock"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.HomeTemples]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Stone"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.Trays]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Wood", "Metal", "Glass"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Oval", "Rectangle"],
    },
  ],

  [HomeDecorsCategory.HomeFragrances]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Candles", "Essential Oils", "Room Sprays"],
    },
    {
      name: "fragrance",
      label: "Fragrance",
      type: "single-select",
      options: ["Lavender", "Vanilla", "Jasmine"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.FlowerPotAndVases]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Ceramic", "Glass", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.OutdoorDecors]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Garden Statues", "Outdoor Lighting", "Planters"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.KeyHolder]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.Fountains]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Tabletop", "Floor", "Wall"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Stone"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.Gardening]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Seeds", "Tools", "Supplies"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.FestiveDecor]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Christmas", "Halloween", "Thanksgiving"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.DecorGiftSets]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Candle", "Vase", "Picture Frame"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Glass"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.HangingPlanters]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.PlantStand]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.WallartAndPaintings]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Canvas", "Wood", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Abstract"],
    },
  ],

  [HomeDecorsCategory.PhotoFrame]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Plastic"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.NewArrivals]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Home Decor", "Furniture", "Lighting"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Glass"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.WallMirrors]: [
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Oval", "Rectangle"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "frame",
      label: "Frame",
      type: "single-select",
      options: ["Wood", "Metal", "Plastic"],
    },
  ],

  [HomeDecorsCategory.Miniatures]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Figurines", "Ornaments", "Collectibles"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Metal", "Wood", "Glass"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.Candles]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Pillar", "Taper", "Tea Light"],
    },
    {
      name: "fragrance",
      label: "Fragrance",
      type: "single-select",
      options: ["Lavender", "Vanilla", "Jasmine"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
  ],

  [HomeDecorsCategory.Vases]: [
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Glass", "Ceramic", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "shape",
      label: "Shape",
      type: "single-select",
      options: ["Round", "Oval", "Rectangle"],
    },
    {
      name: "style",
      label: "Style",
      type: "single-select",
      options: ["Modern", "Traditional", "Vintage"],
    },
  ],

  [HomeDecorsCategory.WallHanging]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Tapestry", "Wall Art", "Macrame"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Fabric", "Wood", "Metal"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "color",
      label: "Color",
      type: "single-select",
      options: ["Red", "Blue", "Green", "Yellow"],
    },
  ],

  [HomeDecorsCategory.WallpapersAndDecals]: [
    {
      name: "type",
      label: "Type",
      type: "single-select",
      options: ["Wallpaper", "Wall Decal", "Sticker"],
    },
    {
      name: "material",
      label: "Material",
      type: "single-select",
      options: ["Paper", "Vinyl", "Fabric"],
    },
    {
      name: "size",
      label: "Size",
      type: "single-select",
      options: ["Small", "Medium", "Large"],
    },
    {
      name: "pattern",
      label: "Pattern",
      type: "single-select",
      options: ["Stripes", "Polka Dots", "Floral"],
    },
  ],
};

const getDefaultValuesForCategory = (category: HomeDecorsCategory) => {
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

const defaultHomeDecor: HomeDecorData = {
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
  rating: 0,
  otherProperties: getDefaultValuesForCategory(HomeDecorsCategory.Candles),
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

export enum SortOption {
  Default = "Default",
  Popularity = "Popularity",
  Latest = "Latest",
  PriceLowHigh = "Price Low High",
  PriceHighLow = "Price High Low",
  Discount = "Discount",
  BestSeller = "Best Seller",
}

const PRICE_RANGE_MAP: Record<string, { minPrice: number; maxPrice: number }> = {
  under_1k: { minPrice: 0, maxPrice: 1000 },
  "1k_5k": { minPrice: 1000, maxPrice: 5000 },
  "5k_10k": { minPrice: 5000, maxPrice: 10000 },
  above_10k: { minPrice: 10000, maxPrice: 999999 },
};

const HomeDecorView = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [homeDecors, setHomeDecors] = useState<HomeDecorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedHomeDecor, setSelectedHomeDecor] = useState<HomeDecorData>(defaultHomeDecor);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [filters, setFilters] = useState({ page: 1, limit: 12, sort: SortOption.Default });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [user, setUser] = useState<{ [key: string]: any }>();
  const router = useRouter();
  const { hasPermission, activeBranchId } = usePermissionStore((state) => state);

  const { data: session, status } = useSession();

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

  const buildParams = useCallback(
    (pageOverride?: number) => {
      const params: Record<string, any> = {
        page: pageOverride ?? filters.page,
      };
      if (filters.sort && filters.sort !== SortOption.Default) {
        params.sort = filters.sort;
      }
      if (searchQuery?.trim()) params.search = searchQuery.trim();
      const catObj = selectedFilters.categoryData;
      const catSelected = catObj && typeof catObj === "object" && Object.keys(catObj).filter((k) => catObj[k]);
      if (catSelected?.length) params.categories = catSelected;
      const prObj = selectedFilters.priceRangeData;
      const prKey = prObj && typeof prObj === "object" && Object.keys(prObj).find((k) => prObj[k]);
      if (prKey && PRICE_RANGE_MAP[prKey]) {
        params.minPrice = PRICE_RANGE_MAP[prKey].minPrice;
        params.maxPrice = PRICE_RANGE_MAP[prKey].maxPrice;
      }
      const discObj = selectedFilters.discountData;
      const discKey = discObj && typeof discObj === "object" && Object.keys(discObj).find((k) => discObj[k]);
      if (discKey !== undefined && discKey !== "") params.discount = Number(discKey) || 0;
      return params;
    },
    [filters.page, filters.sort, searchQuery, selectedFilters]
  );

  const fetchHomeDecors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = buildParams();
      const response = await apiClient.get(apiClient.URLS.homeDecor, params);
      const body = response?.body ?? response;
      const data = body.data ?? body;
      const total = body.total ?? data?.length ?? 0;
      const totalPages = Math.max(1, body.totalPages ?? Math.ceil(total / (filters.limit || 12)));
      const currentPage = body.currentPage ?? filters.page;
      setHomeDecors(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setPagination({ currentPage, totalPages });
    } catch (error) {
      console.error("Error fetching home decors", error);
      toast.error("Error loading home decors");
      setHomeDecors([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams, filters.limit, filters.page]);

  useEffect(() => {
    fetchHomeDecors();
  }, [fetchHomeDecors]);

  useEffect(() => {
    if (user?.id === undefined && status === "authenticated") setUser(session?.user);
  }, [status, session?.user]);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handlePageChange = (_e: any, value: number) => {
    setFilters((prev) => ({ ...prev, page: value }));
  };

  const handleSortChange = (sortValue: SortOption) => {
    setFilters((prev) => ({ ...prev, sort: sortValue, page: 1 }));
  };

  const getImageSrc = (image: string | undefined) => {
    if (image && (image.startsWith("http") || image.startsWith("/"))) {
      return image;
    }

    return "/images/buy_home.webp";
  };

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

    if (selectedHomeDecor.rating < 0 || selectedHomeDecor.rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
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
        newErrors[field.name] = `${field.label} is required`; // Store errors for dynamic fields
      } else if (field.type === "number" && value <= 0) {
        newErrors[field.name] = `${field.label} should be more than 0`; // Number-specific validation
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async (files: string[]) => {
    setSelectedHomeDecor((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const deleteDecor = async (id: number) => {
    try {
      const res = await apiClient.delete(`${apiClient.URLS.homeDecor}/${id}`,true);
      if (res.status === 200) {
        setHomeDecors((prevData) => prevData.filter((item) => item.id !== id));
      } else {
        console.error("Failed to delete home decor", res);
      }
    } catch (error) {
      console.error("Failed to delete home decor", error);
    }
  };

  const handleSeedHomeDecor = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const res = await apiClient.post(apiClient.URLS.homeDecorSeed, {}, true);
      const { created, failed } = res.body;
      toast.success(`Seeded ${created} home decor items${failed ? ` (${failed} failed)` : ""}`);
      fetchHomeDecors();
    } catch (err: any) {
      toast.error(err?.body?.message || "Failed to seed home decor");
    } finally {
      setIsSeeding(false);
    }
  };

  const createDecor = async (homeDecor: HomeDecorData) => {
    const payload = {
      name: homeDecor.name,
      price: homeDecor.price,
      prodDetails: homeDecor.prodDetails,
      discount: homeDecor.discount,
      category: homeDecor.category,
      images: homeDecor.images,
      design: homeDecor.design,
      color: homeDecor.color,
      shape: homeDecor.shape,
      productQuantity: homeDecor.productQuantity,
      rating: homeDecor.rating,
      otherProperties: homeDecor.otherProperties,
      deliveryTime: homeDecor.deliveryTime,
      assembly: homeDecor.assembly,
      customizeOptions: homeDecor.customizeOptions,
      warranty: homeDecor.warranty,
      brand: homeDecor.brand,
      deliveryLocations: homeDecor.deliveryLocations,
      createdById: user?.id,
      slug: homeDecor.slug,
      isFeatured: homeDecor.isFeatured,
      currencyCode: homeDecor.currencyCode ?? "INR",
      taxPercentage: homeDecor.taxPercentage ?? 0,
      hsnCode: homeDecor.hsnCode,
      gstInclusive: homeDecor.gstInclusive ?? false,
      offers: homeDecor.offers,
      applicableCouponCodes: homeDecor.applicableCouponCodes,
      returnPolicy: homeDecor.returnPolicy,
      isCODAvailable: homeDecor.isCODAvailable ?? false,
      shippingDetails: homeDecor.shippingDetails,
      metaTitle: homeDecor.metaTitle,
      metaDescription: homeDecor.metaDescription,
      searchTags: homeDecor.searchTags,
    };
    try {
      await apiClient.post(apiClient.URLS.homeDecor, payload, true);
      toast.success("Home decor created");
      fetchHomeDecors();
    } catch (error) {
      console.error("Failed to create home decor", error);
    }
  };

  const handleDrawerClose = () => {
    setOpenModal(false);
    setSelectedHomeDecor(defaultHomeDecor);
    setErrors({});
  };

  const handleEdit = (homeDecor: HomeDecorData) => {
    setOpenModal(true);
    setSelectedHomeDecor(homeDecor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (selectedHomeDecor.id) {
        await updateDecor(selectedHomeDecor.id, selectedHomeDecor);
      } else {
        await createDecor(selectedHomeDecor);
      }
      setOpenModal(false);
    } else {
      console.log("Form validation failed", errors);
    }
  };

  const updateDecor = async (id: number, homeDecorArg: HomeDecorData) => {
    try {
      const { currentPrice, ...sanitizedData } = homeDecorArg;
      const res = await apiClient.patch(
        `${apiClient.URLS.homeDecor}/${id}`,
        sanitizedData,true
      );

      if (res.status === 200) {
        toast.success("Home decor updated");
        fetchHomeDecors();
      } else {
        console.error("Failed to update home decor with status", res);
      }
    } catch (error) {
      console.error("Failed to update home decor", error);
    }
  };

  const asPath = router.asPath;
  const actualroute = asPath.split("/")[1];

  const categoryFilterOptions = useMemo(
    () => Object.values(HomeDecorsCategory).map((c) => ({ id: c, label: c })),
    []
  );
  const priceRangeFilterOptions = useMemo(
    () => [
      { id: "under_1k", label: "Under ₹1,000" },
      { id: "1k_5k", label: "₹1,000 - ₹5,000" },
      { id: "5k_10k", label: "₹5,000 - ₹10,000" },
      { id: "above_10k", label: "Above ₹10,000" },
    ],
    []
  );
  const discountFilterOptions = useMemo(
    () => [10, 20, 30, 40, 50].map((d) => ({ id: String(d), label: `${d}% or more` })),
    []
  );

  const statistics = useMemo(() => {
    const pageCount = homeDecors.length;
    const totalStock = homeDecors.reduce(
      (sum, d) => sum + (Number(d.productQuantity) || 0),
      0
    );
    const outOfStock = homeDecors.filter(
      (d) => (Number(d.productQuantity) || 0) === 0
    ).length;
    // Treat items with stock > 0 as "active"
    const activeProducts = homeDecors.filter(
      (d) => (Number(d.productQuantity) || 0) > 0
    ).length;
    const featuredCount = homeDecors.filter((d) => d.isFeatured).length;
    const avgPrice =
      pageCount > 0
        ? homeDecors.reduce(
            (s, d) => s + (d.currentPrice ?? d.price),
            0,
          ) / pageCount
        : 0;

    return {
      totalProducts: totalCount,
      totalStock,
      activeProducts,
      outOfStock,
      featuredCount,
      avgPrice,
    };
  }, [homeDecors, totalCount]);

  const totalPages = Math.max(1, pagination.totalPages);

  return (
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
              Home Decors
            </h1>
            <p className="md:label-text text-xs text-gray-500 mt-1">
              Manage home decor catalog with pricing, GST, offers, and delivery
            </p>
          </div>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <Button className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 md:label-text text-xs font-medium">
              Export
            </Button>
            <Button
              className="md:px-4 px-3 md:py-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 md:label-text text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSeedHomeDecor}
              disabled={isSeeding}
            >
              <FaDatabase className={`text-xs ${isSeeding ? "animate-pulse" : ""}`} />
              <span className="hidden md:inline">{isSeeding ? "Seeding..." : "Seed Data"}</span>
            </Button>
            <CustomTooltip label="Access Restricted - Contact Admin" position="bottom" showTooltip={!hasPermission("home_decors", "create")}>
              <Button
                className="md:px-6 px-4 md:py-2 py-1.5 rounded-lg bg-[#5297ff] hover:bg-blue-600 text-white font-medium flex items-center gap-2 disabled:opacity-50 md:label-text text-xs"
                onClick={() => { setOpenModal(true); setSelectedHomeDecor(defaultHomeDecor); setErrors({}); }}
                disabled={!hasPermission("home_decors", "create")}
              >
                <FaPlus /> Add New
              </Button>
            </CustomTooltip>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-4 rounded-lg border border-blue-200">
            <FaBox className="text-[#3586FF] md:text-2xl sub-heading mb-2" />
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.totalProducts}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Total Products
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 md:p-4 rounded-lg border border-green-200">
            <MdCheckCircle className="text-green-600 md:text-2xl sub-heading mb-2" />
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.activeProducts}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Active
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4 rounded-lg border border-purple-200">
            <MdInventory className="text-purple-600 md:text-2xl sub-heading mb-2" />
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.totalStock}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Total Stock
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 md:p-4 rounded-lg border border-red-200">
            <MdCancel className="text-red-600 md:text-2xl sub-heading mb-2" />
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.outOfStock}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Out of Stock
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 md:p-4 rounded-lg border border-yellow-200">
            <FaStar className="text-yellow-600 md:text-2xl sub-heading mb-2" />
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              {statistics.featuredCount}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Featured
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 md:p-4 rounded-lg border border-indigo-200">
            <FaChartLine className="text-indigo-600 md:text-2xl sub-heading mb-2" />
            <p className="md:text-2xl sub-heading font-bold text-gray-800">
              ₹{Math.round(statistics.avgPrice).toLocaleString()}
            </p>
            <p className="md:text-xs text-[10px] text-gray-600 font-medium">
              Avg Price
            </p>
          </div>
        </div>

        <div className="flex md:flex-row flex-col gap-3 md:items-center items-stretch">
          <div className="flex-1">
            <ReusableSearchFilter
              searchText={searchQuery}
              placeholder="Search by name, category, brand..."
              onSearchChange={(v) => { setSearchQuery(v); setFilters((p) => ({ ...p, page: 1 })); }}
              filters={[
                { groupLabel: "Category", key: "categoryData", options: categoryFilterOptions },
                { groupLabel: "Price Range", key: "priceRangeData", options: priceRangeFilterOptions },
                { groupLabel: "Min Discount %", key: "discountData", options: discountFilterOptions },
              ]}
              selectedFilters={selectedFilters}
              onFilterChange={(updater) => { setSelectedFilters(updater); setFilters((p) => ({ ...p, page: 1 })); }}
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
          {homeDecors.length === 0 ? (
            <div className="md:p-12 p-8 text-center text-gray-500">
              <FaBox className="mx-auto md:text-6xl text-4xl text-gray-300 mb-4" />
              <p className="md:sub-heading text-base font-medium">No home decors found</p>
              <p className="md:label-text text-xs mt-1">Try adjusting filters or add a new item</p>
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
                {homeDecors.map((decor) => {
                  const stock = Number(decor.productQuantity) || 0;
                  const isInStock = stock > 0;
                  return (
                    <div
                      key={decor.id}
                      className="grid md:grid-cols-12 gap-4 md:p-4 p-3 hover:bg-gray-50 items-center"
                    >
                      <div className="md:col-span-3 flex gap-3 items-center">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={getImageSrc(decor.images?.[0])}
                            alt={decor.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{decor.name}</p>
                          <p className="text-xs text-gray-500">{decor.brand || "—"}</p>
                          {decor.isFeatured && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">⭐ Featured</span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{decor.category ?? "—"}</span>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-medium">₹{(decor.currentPrice ?? decor.price)?.toLocaleString() ?? "—"}</p>
                        {(decor.discount ?? 0) > 0 && (
                          <span className="text-xs text-green-600">{decor.discount}% OFF</span>
                        )}
                      </div>
                      <div className="md:col-span-1 label-text">{stock}</div>
                      <div className="md:col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${isInStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {isInStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <div className="md:col-span-3 flex justify-end gap-2">
                        <CustomTooltip label="Access Restricted" showTooltip={!hasPermission("home_decors", "edit")}>
                          <Button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600" onClick={() => handleEdit(decor)} disabled={!hasPermission("home_decors", "edit")}>
                            <FaEdit className="md:sub-heading text-base" />
                          </Button>
                        </CustomTooltip>
                        <CustomTooltip label="Access Restricted" showTooltip={!hasPermission("home_decors", "delete")}>
                          <Button className="p-2 rounded-lg hover:bg-red-50 text-red-600" onClick={() => deleteDecor(decor.id!)} disabled={!hasPermission("home_decors", "delete")}>
                            <CgTrash className="md:sub-heading text-base" />
                          </Button>
                        </CustomTooltip>
                        <Button className="md:px-3 px-2 md:py-1.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white md:text-xs text-[10px] font-medium" onClick={() => router.push(`/${actualroute}/${decor.id}/itemanalytics`)}>
                          Analytics
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-4 py-3 flex md:flex-row flex-col md:items-center justify-between gap-3">
                  <div className="md:label-text text-xs text-gray-500">
                    Showing {(pagination.currentPage - 1) * filters.limit + 1} to {Math.min(pagination.currentPage * filters.limit, totalCount)} of {totalCount}
                  </div>
                  <Pagination count={totalPages} page={pagination.currentPage} onChange={handlePageChange} variant="outlined" shape="rounded" />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:p-6 p-4">
                {homeDecors.map((decor) => {
                  const stock = Number(decor.productQuantity) || 0;
                  const isInStock = stock > 0;
                  return (
                    <div key={decor.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square bg-gray-100">
                        <Image src={getImageSrc(decor.images?.[0])} alt={decor.name} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                        {decor.isFeatured && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium">⭐ Featured</span>
                        )}
                      </div>
                      <div className="p-4">
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mb-2">{decor.category ?? "—"}</span>
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{decor.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">{decor.brand || "—"}</p>
                        <p className="sub-heading font-bold text-gray-900 mb-3">₹{(decor.currentPrice ?? decor.price)?.toLocaleString() ?? "—"}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-600">Stock: {stock}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${isInStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {isInStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white label-text font-medium" onClick={() => handleEdit(decor)} disabled={!hasPermission("home_decors", "edit")}>Edit</Button>
                          <Button className="py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50" onClick={() => deleteDecor(decor.id!)} disabled={!hasPermission("home_decors", "delete")}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-4 py-3 flex md:flex-row flex-col md:items-center justify-between gap-3">
                  <div className="md:label-text text-xs text-gray-500">
                    Showing {(pagination.currentPage - 1) * filters.limit + 1} to {Math.min(pagination.currentPage * filters.limit, totalCount)} of {totalCount}
                  </div>
                  <Pagination count={totalPages} page={pagination.currentPage} onChange={handlePageChange} variant="outlined" shape="rounded" />
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal/Drawer */}
        {openModal && (
          <Drawer
            open={openModal}
            handleDrawerToggle={handleDrawerClose}
            closeIconCls="text-black"
            openVariant="right"
            panelCls="w-[90%] sm:w-[85%] lg:w-[calc(100%-390px)] shadow-xl"
            overLayCls="bg-gray-700 bg-opacity-40"
          >
            <HomeDecorForm
              categoryAttributes={categoryAttributes}
              handleDrawerClose={handleDrawerClose}
              handleUpload={handleUpload}
              handleSubmit={handleSubmit}
              selectedHomeDecor={selectedHomeDecor}
              getDefaultValuesForCategory={getDefaultValuesForCategory}
              setSelectedHomeDecor={setSelectedHomeDecor}
            />
          </Drawer>
        )}
      </div>
    </div>
  );
};

export default HomeDecorView;
