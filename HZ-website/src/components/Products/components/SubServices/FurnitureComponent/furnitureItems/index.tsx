import { useRouter } from "next/router";
import BreadCrumb from "../../../BreadCrumb";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import GoogleAdSense from "@/components/GoogleAdSense";
import { useCompareStore } from "@/store/useCompareStore";
import { ArrowRight, Share2, Download, X } from "lucide-react";
import Button from "@/common/Button";
import { mapElectronicsListItem } from "@/utils/electronicsMapper";
import {
  ELECTRONICS_CATEGORIES,
  getElectronicsCategoryForApi,
} from "@/constants/electronicsCategories";

interface IItemsSectionProps {
  category: string;
  items: any[];
  isLoading: boolean;
}

// Dynamic imports at module level - stable references prevent remounts and duplicate itemsclick calls
const FurnitureItemsSection = dynamic(
  () => import("./ItemsSection").then((mod) => mod.default as React.ComponentType<IItemsSectionProps>)
);
const HomeDecorItemsSection = dynamic(
  () =>
    import(
      "@/components/Products/components/SubServices/HomeDecorComponent/HomeDecorItems/ItemsSection"
    ).then((mod) => mod.default as React.ComponentType<IItemsSectionProps>)
);
const ElectronicsItemsSection = dynamic(
  () =>
    import(
      "@/components/Products/components/ElectronicsComponent/ElectronicItems/ItemsSection"
    ).then((mod) => mod.default as React.ComponentType<IItemsSectionProps>)
);

const ProductListItems = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const categoryParam = router.query.category as string;
  const lastFetchedKeyRef = useRef<string | null>(null);

  const { items: compareItems, clear, remove } = useCompareStore();

  const { category } = router.query;

  const { query, asPath } = router;
  const pathParts = asPath.split("/");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const actualRoute = pathParts[2];

  const ItemsSection =
    actualRoute === "furnitures"
      ? FurnitureItemsSection
      : actualRoute === "homedecor"
        ? HomeDecorItemsSection
        : actualRoute === "electronics"
          ? ElectronicsItemsSection
          : FurnitureItemsSection;

  const actualRouteshop = actualRoute ? `${actualRoute}-shop` : "";

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    router.push(
      `/services/${actualRoute}/${actualRouteshop}?category=${category.category}`
    );
  };

  const [selectedCategory, setSelectedCategory] = useState({
    id: 1,
    name: "New Arrivals",
    category: "New Arrivals",
  });

  const categories =
    actualRoute === "furnitures"
      ? [
        { id: 1, name: "New Arrivals", category: "New Arrivals" },
        { id: 2, name: "Sofas", category: "Sofas" },
        { id: 3, name: "Living room", category: "Living room" },
        { id: 4, name: "Dining Tables", category: "Dining Tables" },
        { id: 5, name: "Beds", category: "Beds" },
        { id: 6, name: "Study & Office", category: "Study & Office" },
        { id: 7, name: "Storage", category: "Storage" },
        { id: 8, name: "Custom Furniture", category: "Custom Furniture" },
        { id: 9, name: "Tables", category: "Tables" },
        { id: 10, name: "Chairs", category: "Chairs" },
        { id: 11, name: "TV Units", category: "TV Units" },
        { id: 12, name: "Wardrobes", category: "Wardrobes" },
      ]
      : actualRoute === "homedecor"
        ? [
          { id: 1, name: "New Arrivals", category: "New Arrivals" },
          { id: 2, name: "Wall Shelves", category: "Wall Shelves" },
          { id: 3, name: "Baskets", category: "Baskets" },
          { id: 4, name: "Photo Frame", category: "Photo Frame" },
          { id: 5, name: "Wall Mirrors", category: "Wall Mirrors" },
          { id: 6, name: "Wall Art and Paintings", category: "Wall Art and Paintings" },
          { id: 7, name: "Figurines", category: "Figurines" },
          { id: 8, name: "Miniatures", category: "Miniatures" },
          { id: 9, name: "Pots and Plants", category: "Pots and Plants" },
          { id: 10, name: "Artificial Plants and Flowers", category: "Artificial Plants and Flowers" },
          { id: 11, name: "Plant Stand", category: "Plant Stand" },
          { id: 12, name: "Hanging Planters", category: "Hanging Planters" },
          { id: 13, name: "Gardening", category: "Gardening" },
          { id: 14, name: "Festive Decor", category: "Festive Decor" },
          { id: 15, name: "Candles", category: "Candles" },
          { id: 16, name: "Decor Gift Sets", category: "Decor Gift Sets" },
          { id: 17, name: "Tableware", category: "Tableware" },
          { id: 18, name: "Dinner Set", category: "Dinner Set" },
          { id: 19, name: "Coffee Mugs", category: "Coffee Mugs" },
          { id: 20, name: "Serving Trays", category: "Serving Trays" },
          { id: 21, name: "Teapots", category: "Teapots" },
          { id: 22, name: "Glassware", category: "Glassware" },
          { id: 23, name: "Clocks", category: "Clocks" },
          { id: 24, name: "Home Temples", category: "Home Temples" },
          { id: 25, name: "Trays", category: "Trays" },
          { id: 26, name: "Home Fragrances", category: "Home Fragrances" },
          { id: 27, name: "Flower Pot and Vases", category: "Flower Pot and Vases" },
          { id: 28, name: "Vases", category: "Vases" },
          { id: 29, name: "Wall Hanging", category: "Wall Hanging" },
          { id: 30, name: "Wallpapers and Decals", category: "Wallpapers and Decals" },
          { id: 31, name: "Fountains", category: "Fountains" },
          { id: 32, name: "Key Holder", category: "Key Holder" },
          { id: 33, name: "Outdoor Decors", category: "Outdoor Decors" },
        ]
        : actualRoute === "electronics"
          ? [...ELECTRONICS_CATEGORIES]
          : [];
  const sharedCompared = () => {
    const ids = items.map((i) => i.id).join(",");
    const url = `${window.location.origin}/compare?ids=${ids}`;
    navigator.clipboard.writeText(url);
    toast.success("Compare link copied to clipboard!");
  };


  const exportComparedCSV = () => {
    const csv = [
      ["Name", "Price", "Brand"],
      ...items.map((i) => [i.name, i.baseSellingPrice, i.brand]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "compare.csv";
    a.click();
    toast.success("CSV downloaded!");
  };

  useEffect(() => {
    if (!router.isReady) return;
    let cat: string;
    if (actualRoute === "electronics") {
      const param = categoryParam?.trim();
      const category =
        !param || param === ""
          ? ELECTRONICS_CATEGORIES[0]
          : ELECTRONICS_CATEGORIES.find(
              (c) =>
                c.category === param ||
                c.category.toLowerCase() === param?.toLowerCase()
            );
      if (category) setSelectedCategory(category);
      cat = param ?? "";
    } else if (actualRoute === "furnitures" || actualRoute === "homedecor") {
      const param = categoryParam?.trim();
      const defaultCategory = categories[0]; // "New Arrivals"
      const category = param
        ? categories.find(
            (c) =>
              c.category === param ||
              c.category.toLowerCase() === param?.toLowerCase()
          )
        : defaultCategory;
      if (category) setSelectedCategory(category);
      cat = param && category ? category.category : (defaultCategory?.category ?? "New Arrivals");
    } else {
      cat = categoryParam || "";
    }
    const fetchKey = `${actualRoute}|${cat}`;
    if (lastFetchedKeyRef.current === fetchKey) return;
    lastFetchedKeyRef.current = fetchKey;
    fetchItems(cat);
  }, [categoryParam, router.isReady, actualRoute]);

  const fetchItems = async (category: string): Promise<void> => {
    try {
      let res;

      if (actualRoute === "furnitures") {
        const furnitureCategory = (category?.trim()) ? category.trim() : "New Arrivals";
        res = await apiClient.get(apiClient.URLS.furniture, { category: furnitureCategory }, true);
        const body: any = res?.body ?? res;
        const data: any = body?.data ?? body;
        setItems(Array.isArray(data) ? data : []);
      } else if (actualRoute === "homedecor") {
        const homeDecorCategory = (category?.trim()) ? category.trim() : "New Arrivals";
        const params: Record<string, string | number | undefined> = {
          page: 1,
          categories: homeDecorCategory,
        };
        res = await apiClient.get(apiClient.URLS.homeDecor, params, true);
        const rawData = res?.body?.data || [];
        setItems(
          rawData.map((row: any) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            baseSellingPrice: row.currentPrice ?? row.price,
            baseMrp: row.price,
            baseDiscountPercent: row.discount ?? 0,
            images: (row.images || []).map((url: string, i: number) => ({
              id: i + 1,
              url,
              alt: null,
              sortOrder: i,
              isPrimary: i === 0,
              colorHex: null,
              angle: null,
              viewType: null,
            })),
            otherProperties: {
              ...(row.otherProperties || {}),
              material: row.otherProperties?.style ?? row.design ?? "",
            },
            brand: row.brand,
            warranty: row.warranty,
            createdDate: row.createdDate,
            deliveryTime: row.deliveryTime,
            assembly: row.assembly,
          }))
        );
      } else if (actualRoute === "electronics") {
        const params: Record<string, string | number | string[] | undefined> = {
          page: 1,
          limit: 12,
        };
        const categoriesForApi = getElectronicsCategoryForApi(category ?? "New Arrivals");
        if (categoriesForApi?.length) {
          params.categories = categoriesForApi;
        }
        res = await apiClient.get(apiClient.URLS.electronics, params, true);
        const rawData = res?.body?.data ?? [];
        setItems(
          Array.isArray(rawData)
            ? rawData.map((row: any) => mapElectronicsListItem(row))
            : []
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = () => {
    if (!router.isReady) return;

    const { categorys, categoryShop } = router.query;

    router.push(
      `/services/${categorys}/${actualRoute}-shop/compare`
    );
  };



  return (
    <div>
      <div className="hidden lg:flex items-start justify-start bg-white border-b border-gray-200">
        <div className="flex items-start justify-start">
          <BreadCrumb
            className="text-[10px] "
            steps={[
              { label: "Our Services", link: "/services/custom-builder" },
              {
                label: `${actualRoute}`,
                link: `/services/${actualRoute}`,
              },
              {
                label: `${actualRoute}-shop`,
                link: `/services/${actualRoute}/${actualRoute}-shop`,
              },
              ...(selectedCategory
                ? [
                  {
                    label: selectedCategory.name,
                    link: `/services/${actualRoute}/${actualRoute}-shop?category=${selectedCategory.category}`,
                  },
                ]
                : []),
            ]}
            currentStep={selectedCategory.name || "Shop"}
          />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10">
          {/* Desktop Categories - Horizontal Scroll */}
          <div className="hidden md:block overflow-x-auto scrollbar-hide">
            <ul className="flex items-center gap-1 py-2 min-w-max">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`
                      relative px-5 py-1 md:py-1.5 rounded-lg font-medium text-sm
                      transition-all duration-200 ease-in-out whitespace-nowrap
                      ${category.id === selectedCategory.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                      }
                    `}
                  >
                    {category.name}
                    {category.id === selectedCategory.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Categories - Chip Style */}
          <div className="md:hidden overflow-x-auto scrollbar-hide md:py-3 py-[5px]">
            <div className="flex gap-2 min-w-max px-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    px-4 md:py-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                    transition-all duration-200 border
                    ${category.id === selectedCategory.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-3 w-full">
        <div className="md:w-[85%] w-full">
          <ItemsSection
            category={selectedCategory.name}
            items={items}
            isLoading={isLoading}
          />
        </div>
        <div className="md:w-[15%]  hidden  md:block">
          <GoogleAdSense />
        </div>
      </div>
      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-4">


            <div className="flex items-center gap-3 ">
              {compareItems.map((item) => (
                <div
                  key={item.id}
                  className="relative flex items-center gap-2 bg-gray-50 border rounded-lg px-2 py-1 min-w-[180px]"
                >

                  <Button
                    onClick={() => remove(item.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                    aria-label="Remove item"
                  >
                    <X size={12} />
                  </Button>

                  <img
                    src={item.images?.[0]?.url || "/placeholder.png"}
                    alt={item.name}
                    className="w-10 h-10 rounded-md object-cover border"
                  />

                  <p className="text-xs font-medium text-[#5297ff] line-clamp-2">{item.name}</p>
                  <p className="text-xs font-regular text-gray-700">₹{item.baseSellingPrice}</p>
                </div>
              ))}
            </div>


            <div className="ml-auto flex items-center gap-2 shrink-0 font-medium">
              <Button
                onClick={clear}
                className="border border-[#5297ff] bg-white btn-txt rounded text-gray-700 font-medium 
          px-3 py-1 md:py-1"
              >
                Clear
              </Button>

              <Button
                onClick={sharedCompared}
                className="border border-[#5297ff] bg-white btn-txt rounded text-gray-700 font-medium 
          px-3 py-1 md:py-2"
              >
                <Share2 className="w-3.5 h-3.5" />
              </Button>

              <Button
                onClick={exportComparedCSV}
                className="border-[#5297ff] border bg-white rounded btn-txt text-gray-700 font-medium 
          px-3 py-1 md:py-2"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>

              <Button
                onClick={handleCompare}
                className="bg-[#3586FF] text-white px-5 md:py-2 py-1 btn-txt font-Gordita-Medium flex items-center gap-2 rounded-lg shadow-md hover:bg-blue-700"
              >
                Compare
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProductListItems;
