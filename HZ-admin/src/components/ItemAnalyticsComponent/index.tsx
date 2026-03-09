import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import apiClient from "@/src/utils/apiClient";
import { FiStar, FiShoppingCart } from "react-icons/fi";
import { LuCheckCircle } from "react-icons/lu";
import { FaChartBar } from "react-icons/fa";
import Image from "next/image";
import ImageSlider from "@/src/components/ViewAnalyticsComponent/ImageSlider";
export enum HomeDecorsCategory {
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
export enum CategoryType {
  HomeDecor = "home-decors",
  Electronics = "electronics",
  Furnitures = "furnitures",
}
export enum electronicscategory {
  KITCHEN_APPLIANCES = "Kitchen Appliances",
  ENTERTAINMENT = "Entertainment",
  SMART_HOME = "Smart Home & Automation",
  CLEANING_LAUNDRY = "Cleaning & Laundry",
  CLIMATE_CONTROL = "Climate Control",
  LIGHTING_POWER = "Lighting & Power Solutions",
}
export enum FurnitureCategory {
  Sofas = "Sofas",
  Chairs = "Chairs",
  Tables = "Tables",
  Beds = "Beds",
  Wardrobes = "Wardrobes",
  StudyRooms = "Study Rooms",
  DiningTables = "Dining Tables",
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
interface FurnitureData {
  id?: number;
  name: string;
  slug: string;
  category:string;
  subCategory?: string;
  description?: string;
  highlights?: string;
  brand?: string;
  tags?: string[];

  isFeatured?: boolean;
  isCustomizable?: boolean;
  customizationDescription?: string;
  deliveryTime?: string;
  warranty?: string;
  assembly?: string;
  returnPolicy?: string;
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
  color?:string;
  

}
interface HomedecorData {
  id: number;
  name: string;
 baseSellingPrice: number;
 description: string;
  currentPrice: number;
  discount: number;
  category: HomeDecorsCategory;
  images: string[];
  design: string;
  color: string;
  shape: string;
  productQuantity: string;
  ratingCount: number;
  otherProperties: Record<string, any>;
  deliveryTime: string;
  assembly: string;
  customizeOptions: boolean;
  warranty: string;
  brand: string;
  deliveryLocations: string;
}
interface ElectronicsData {
  id: number;
  name: string;
  originalPrice: number;
  baseSellingPrice: number;
  discount: number;
  currencyCode: string;
  taxPercentage: number;
  SKU: string;
description: string;

  category: electronicscategory;
  images: string[];
  brand: string;
  modelNumber: string;
  warranty: string;
  energyRating?: string;
  color?: string;
  stockQuantity: number;
  stockAlertThreshold: number;
  deliveryTime: string;
  installationRequired: boolean;
  smartFeatures: boolean;
  installationGuide?: string;
  powerConsumption?: string;
  technicalSpecifications: Record<string, any>;
  ratingCount: number;

  returnPolicy?: string;
  isPublished: boolean;
  isCODAvailable: boolean;
  metaTitle?: string;
  metaDescription?: string;
  deliveryLocations: string;
}
interface Impressionprops {
  eventName: string;
  itemName: string;
  ItemId: string;
  category: string;
  price: string;
  eventCount: number;
}
type ProductData = HomedecorData | ElectronicsData | FurnitureData;

export default function ItemAnalyticsComponent() {
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [ItemId, setItemid] = useState<string | null>(null);
  const [Items, setItems] = useState<ProductData | null>(null);
  const [Impression, setImpression] = useState<Impressionprops[]>([]);
  const [addtocart, setAddtocart] = useState<Impressionprops[]>([]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { query, asPath } = router;
  const actualRoute = asPath.split("/")[1];

  useEffect(() => {
    if (router.isReady) {
      const pathCategory = asPath.split("/")[1];

      if (Object.values(CategoryType).includes(pathCategory as CategoryType)) {
        setCategory(pathCategory as CategoryType);
      }
      setItemid(router.query.id as string);
    }
  }, [router.isReady, router.pathname, router.query]);
 

  const fetchItemData = useCallback(
    async (itemId: string, category: CategoryType) => {
      if (!itemId || !category) return;
      setLoading(true);
      try {
        let url = "";
        if (category === CategoryType.HomeDecor) {
          url = `${apiClient.URLS.homeDecor}/${itemId}`;
        } else if (category === CategoryType.Electronics) {
          url = `${apiClient.URLS.electronics}/${itemId}`;
        } else if (category === CategoryType.Furnitures) {
          url = `${apiClient.URLS.furniture}/${itemId}`;
        }
        const res = await apiClient.get(url);
        
        setItems(res.body);
      } catch (error) {
        console.error("Error fetching item data:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (ItemId && category) {
      fetchItemData(ItemId, category);
    }
  }, [ItemId, category, fetchItemData]);

  useEffect(() => {
    const Fetchimpression = async () => {
      const response = await fetch("/api/Item_Impression");
      const data = await response.json();
      setImpression(Array.isArray(data) ? data : data.data || []);
    };
    Fetchimpression();
  }, []);
  useEffect(() => {
  const fetchcartdata = async () => {
    const res = await fetch("/api/add_to_cart");
    const resdata = await res.json();
   
    setAddtocart(Array.isArray(resdata) ? resdata : resdata.data || []);
  };
  fetchcartdata();
}, []);

  const getEventcount = (itemName: string) => {
    if (!itemName) return 0;

    const itemImpression = Impression.filter(
      (item) => item.itemName === itemName
    );

    const totalEventCount = itemImpression.reduce(
      (acc, curr) => acc + Number(curr.eventCount || 0),
      0
    );

    return totalEventCount;
  };

  const getcartcount = (itemName: string) => {
    const itemscount = addtocart.filter((item) => item.itemName === itemName);
    const totalcartCount = itemscount.reduce(
      (acc, curr) => acc + Number(curr.eventCount || 0),
      0
    );
    return totalcartCount;
  };
  const getImageSrc = (image: string | undefined) => {
    if (image && (image.startsWith("http") || image.startsWith("/"))) {
      return image;
    }

    return "/images/buy_home.webp";
  };

  return (
    <>
      <div className="w-full border border-[#DBDBDB] rounded-lg px-2 md:px-4 md:py-6 flex flex-col md:gap-8 gap-4">
        <div className=" pb-[24px]">
          <div className="flex flex-col md:flex-row gap-x-[48px] px-2 md:px-0  gap-y-[20px] w-full  h-fit">
            <div className="relative   md:w-[700px] w-[290px] overflow-hidden md:px-0 px-4 md:h-[400px] h-[150px]">
              {/* <ImageSlider images={Items?.images || []} /> */}
              <Image
  src={getImageSrc(
    typeof Items?.images?.[0] === "string"
      ? Items.images[0]
      : Items?.images?.[0]?.url
  )}
  alt=""
  fill
  className="object-cover"
/>

            </div>
            <div>
              <div className="border p-6 rounded-[16px] shadow-custom md:w-[700px] w-[290px] bg-gray-100">
                <h2 className="md:text-[28px] text-[16px] font-bold text-gray-900 mb-2">
                  {Items?.name}
                </h2>

                <p className="text-gray-600 md:text-[16px] text-[12px] font-regular">
                  {Items?.description}
                </p>

                <div className="mt-4 grid grid-cols-2 md:gap-4 gap-2 text-nowrap md:text-[16px] text-[12px]">
                  <p>
                    <strong className="text-gray-800 font-regular">
                      Price:
                    </strong>{" "}
                    <span className="textx-[5297ff] font-semibold">
                      ${Items?.baseSellingPrice}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-800 font-regular">
                      Category:
                    </strong>{" "}
                    <span className="text-gray-700  font-semibold">
                      {Items?.category}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-800">Color:</strong>{" "}
                    <span className="text-gray-700">{(Items?.color??"")}</span>
                  </p>

                  <p>
                    <strong className="text-gray-800 font-regular">
                      Brand:
                    </strong>{" "}
                    <span className="text-gray-700 font-semibold">
                      {Items?.brand}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-800 font-regular">
                      Warranty:
                    </strong>{" "}
                    <span className="text-gray-700 font-semibold">
                      {Items?.warranty}
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-800 font-regular">
                      Rating:
                    </strong>{" "}
                   <span className="text-gray-700 font-semibold">
  { (Items?.ratingCount ??0)}
</span>

                  </p>
                </div>
                {actualRoute === CategoryType.HomeDecor && (
                  <>
                    <p>
                      <strong className="text-gray-800 font-regular  md:text-[16px] text-[12px]">
                        Shape:
                      </strong>{" "}
                      <span className="text-gray-700 font-semibold  md:text-[16px] text-[12px]">
                        {(Items as HomedecorData)?.shape}
                      </span>
                    </p>
                  </>
                )}
                {actualRoute === CategoryType.Electronics && (
                  <>
                    <p>
                      <strong className="text-gray-800 font-regular  md:text-[16px] text-[12px]">
                        Model Number:
                      </strong>{" "}
                      <span className="text-gray-700  md:text-[16px] text-[12px]">
                        {(Items as ElectronicsData)?.modelNumber}
                      </span>
                    </p>
                  </>
                )}
                {actualRoute === CategoryType.Electronics && (
                  <p>
                    <strong className="text-gray-800 font-regular  md:text-[16px] text-[12px]">
                      Energy Rating:
                    </strong>{" "}
                    <span className="text-gray-700 font-semibold  md:text-[16px] text-[12px]">
                      {(Items as ElectronicsData)?.energyRating}
                    </span>
                  </p>
                )}

                {actualRoute === CategoryType.HomeDecor && (
                  <div className="mt-6">
                    <h3 className="font-bold md:text-[24px] text-[16px] text-gray-900">
                      Other Properties:
                    </h3>
                    <ul className=" ml-5 text-gray-700  md:text-[16px] text-[12px] md:gap-y-4 gap-y-2">
                      {(Items as HomedecorData)?.otherProperties &&
                        Object.entries(
                          (Items as HomedecorData).otherProperties
                        ).map(([key, value]) => (
                          <li
                            key={key}
                            className="flex items-center md:gap-3 gap-2 text-gray-800"
                          >
                            <LuCheckCircle className="font-bold md:text-[20px] text-[14px] text-[#3586FF]  " />
                            <strong className="capitalize ">{key}:</strong>{" "}
                            <p className="md:text-[18px] text-[12px] font-medium leading-[22.52px] md:text-nowrap text-wrap">
                              {" "}
                              {value}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {actualRoute === CategoryType.Furnitures && (
                  <div className="mt-6">
                    <h3 className="font-bold md:text-[24px] text-[16px] text-gray-900">
                      Other Properties:
                    </h3>
                    <ul className=" ml-5 text-gray-700  md:text-[16px] text-[12px] gap-y-4">
                      {(Items as FurnitureData)?.otherProperties &&
                        Object.entries(
                          (Items as FurnitureData).otherProperties
                        ).map(([key, value]) => (
                          <li
                            key={key}
                            className="flex items-center md:gap-3 gap-2 text-gray-800"
                          >
                            <LuCheckCircle className="font-bold md:text-[20px] text-[14px] text-[#3586FF]  " />
                            <strong className="capitalize ">{key}:</strong>{" "}
                            <p className="md:text-[18px] text-[12px] font-medium leading-[22.52px] md:text-nowrap text-wrap">
                              {" "}
                              {value}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                {actualRoute === CategoryType.Electronics && (
                  <div className="mt-6">
                    <h3 className="font-bold md:text-[24px] text-[16px] text-gray-900">
                      Technical Specifications:
                    </h3>
                    <ul className=" ml-5 text-gray-700  md:text-[16px] text-[12px] gap-y-4">
                      {(Items as ElectronicsData)?.technicalSpecifications &&
                        Object.entries(
                          (Items as ElectronicsData).technicalSpecifications
                        ).map(([key, value]) => (
                          <li
                            key={key}
                            className="flex items-center md:gap-3 gap-2 text-gray-800"
                          >
                            <LuCheckCircle className="font-bold md:text-[20px] text-[14px] text-[#3586FF]  " />
                            <strong className="capitalize ">{key}:</strong>{" "}
                            <p className="md:text-[18px] text-[12px] font-medium leading-[22.52px] md:text-nowrap text-wrap">
                              {" "}
                              {value}
                            </p>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="md:mt-6 mt-2 md:p-8 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-[16px] shadow-md border border-blue-200 md:w-[60%] w-[90%] flex  md:flex-row flex-col md:items-center items-start md:gap-6 gap-3 mb-[20px]">
          <div className=" flex items-center md:gap-2 gap-1">
            <div className="flex items-center md:gap-x-3 gap-x-1">
              <div className="p-2 bg-[#5297ff] text-white rounded-full">
                <FaChartBar className="md:w-6 w-3 md:h-6 h-3" />
              </div>
              <p className="md:text-[30px] text-[16px] font-medium text-gray-700">
                {" "}
                Impressions :
              </p>
            </div>
            <p className="md:text-[36px] text-[18px] font-medium text-[#3586FF]  mt-2">
              {getEventcount(Items?.name)}
            </p>
          </div>
          <div className=" flex items-center md:gap-2 gap-1">
            <div className="flex items-center md:gap-x-3 gap-x-1">
              <div className="p-2 bg-[#5297ff] text-white rounded-full">
                <FiShoppingCart className="md:w-6 w-3 md:h-6 h-3" />
              </div>
              <p className="md:text-[30px] text-[16px] font-medium text-gray-700">
                {" "}
                Cart count :
              </p>
            </div>
            <p className="md:text-[36px] text-[14px] font-medium text-[#3586FF]  mt-2">
              {getcartcount(Items?.name)}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
