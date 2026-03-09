import { useEffect, useMemo, useState, useRef } from "react";
// import Item from "./item";
import Button from "@/common/Button";
import Loader from "@/components/Loader";
import { twMerge } from "tailwind-merge";
import { DropDown } from "@/common/PopOver";

import CustomInput from "@/common/FormElements/CustomInput";
import { eventNames } from "process";
import Modal from "@/common/Modal";
import { ChevronDownIcon, X } from "lucide-react";
import { Dialog, Menu } from "@headlessui/react";
import { useRouter } from "next/router";
interface FurnitureImage {
  id: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  colorHex: string | null;
  angle: string | null;
  viewType: string | null;
}

export interface IItemsSectionProps {
  items: {
    id: number;
    category: string;
    subCategory?: string;
    description?: string;
    highlights?: string;
    brand?: string;
    tags?: string[];
    name: string;
    isFeatured?: boolean;
    isCustomizable?: boolean;
    customizationDescription?: string;
    deliveryTime?: string;
    warranty?: string;
    assembly?: string;
    returnPolicy?: string;

    sellerId?: number;

    baseMrp?: number;
    power?: number;
    baseSellingPrice?: number;
    baseDiscountPercent?: number;
    ratingCount?: number;
    averageRating?: number;
    createdDate?: string;

    updatedDate?: Date;
    images: FurnitureImage[];
    otherProperties?: {
      [key: string]: string;
    };
  }[];
  category: string;
  isLoading: boolean;
  onFilterChange: (filteredItems: any[]) => void;
  path: string;
  /** When "drawer", filter panel with left categories / right options. When "sortDrawer", only sort options (Myntra-style SORT BY sheet). */
  variant?: "sidebar" | "drawer" | "sortDrawer";
  /** Called when sort drawer should close (e.g. after user selects a sort option). */
  onClose?: () => void;
}
const categoriesList = [
  "Storage Water Heaters",
  "Steam Irons",
  "Instant Water Heaters",
  "Geysers",
  "Immersion Rods",
  "Radiators",
];
const ItemsFilterBar = ({
  items,
  category,
  isLoading,
  onFilterChange,
  path,
  variant = "sidebar",
  onClose,
}: IItemsSectionProps) => {
  const initialSortBy =
    path === "homedecor"
      ? "recommended"
      : path === "electronics"
        ? "Popularity"
        : "default";
  const [sortBy, setSortBy] = useState(initialSortBy);

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, Infinity]);
  const [customPrice, setCustomPrice] = useState({ min: "", max: "" });
  const [discountFilter, setDiscountFilter] = useState(0);
  const [isWarrenty, setisWarrenty] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [categories, setcategories] = useState<string[]>([]);
  const [isPowerChecked, setisPowerchecked] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  type DrawerSection = "sort" | "material" | "price" | "discount" | "warranty" | "categories" | "brand" | "power";
  const [drawerSection, setDrawerSection] = useState<DrawerSection>(path === "electronics" ? "categories" : "material");
  const materials = useMemo(() => {
    const allMaterials = items.flatMap((item) =>
      item.otherProperties?.material ? [item.otherProperties.material] : []
    );
    return Array.from(new Set(allMaterials)); // Unique materials
  }, [items]);
  const brands = useMemo(() => {
    const allBrands = items.flatMap((item) => (item.brand ? [item.brand] : []));
    return Array.from(new Set(allBrands));
  }, [items]);

  // Sorting handler
  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(e.target.value);
  };
  const handleWarrentychecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setisWarrenty(e.target.checked);
    }
  };
  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedBrands([...selectedBrands, value]);
    } else {
      setSelectedBrands(selectedBrands.filter((brand) => brand !== value));
    }
  };
  const handlepowerchecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setisPowerchecked(e.target.checked);
    }
  };

  // Material checkbox handler
  const handleMaterialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedMaterials([...selectedMaterials, value]);
    } else {
      setSelectedMaterials(
        selectedMaterials.filter((material) => material !== value)
      );
    }
  };

  // Price filter handler (predefined ranges)
  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  // Custom price input handler
  const handleCustomPriceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomPrice({
      ...customPrice,
      [name]: value,
    });
  };

  // Discount handler
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountFilter(+e.target.value);
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      setcategories([...categories, value]);
    } else {
      setcategories(categories.filter((category) => category !== value));
    }
  };

  const handleReset = () => {
    setSelectedMaterials([]);
    setPriceRange([0, Infinity]);
    setCustomPrice({ min: "", max: "" });
    setDiscountFilter(0);
    setSortBy(initialSortBy);
    setisWarrenty(false);
    setSelectedBrands([]);
    setisPowerchecked(false);
  };

  // Filter logic
  useEffect(() => {
    const filtered = items
      .filter((item) =>
        selectedMaterials.length
          ? selectedMaterials.includes(item?.otherProperties?.material ?? "")
          : true
      )
      .filter((item) =>
        selectedBrands.length ? selectedBrands.includes(item.brand ?? "") : true
      )
      .filter((item) =>
        categories.length
          ? categories.includes(item.otherProperties?.categories ?? "")
          : true
      )
      .filter((item) => {
        if (isWarrenty) {
          return item.warranty == "12 months" || item.warranty == "1 year";
        }
        return true;
      })
      .filter((item) => {
        if (isPowerChecked) {
          return Number(item.power) >= 750;
        }
        return true;
      })

      .filter((item) => {
        const minPrice = customPrice.min
          ? parseInt(customPrice.min, 10)
          : priceRange[0];
        const maxPrice = customPrice.max
          ? parseInt(customPrice.max, 10)
          : priceRange[1];
        const sellingPrice =
          item?.baseSellingPrice ??
          (item?.baseMrp != null && (item?.baseDiscountPercent ?? 0) > 0
            ? Math.round(
                (item.baseMrp as number) *
                  (1 - (item.baseDiscountPercent ?? 0) / 100)
              )
            : item?.baseMrp ?? 0);
        return sellingPrice >= minPrice && sellingPrice <= maxPrice;
      })
      .filter(
        (item) => discountFilter === 0 || (item.baseDiscountPercent ?? 0) >= 20
      )
      .sort((a, b) => {
        const sellingPriceA =
          (a.baseSellingPrice ?? 0) ||
          (a.baseMrp != null && (a.baseDiscountPercent ?? 0) > 0
            ? Math.round(
                (a.baseMrp as number) * (1 - (a.baseDiscountPercent ?? 0) / 100)
              )
            : a.baseMrp ?? 0);
        const sellingPriceB =
          (b.baseSellingPrice ?? 0) ||
          (b.baseMrp != null && (b.baseDiscountPercent ?? 0) > 0
            ? Math.round(
                (b.baseMrp as number) * (1 - (b.baseDiscountPercent ?? 0) / 100)
              )
            : b.baseMrp ?? 0);
        if (sortBy === "price-low-high") return sellingPriceA - sellingPriceB;
        if (sortBy === "price-high-low") return sellingPriceB - sellingPriceA;
        if (sortBy === "latest")
          return (
            Date.parse(b?.createdDate ?? "") - Date.parse(a?.createdDate ?? "")
          );
        if (sortBy === "discount")
          return (b.baseDiscountPercent ?? 0) - (a.baseDiscountPercent ?? 0);
        if (sortBy === "All Products" || sortBy === "recommended") return 0;
        return 0;
      });

    onFilterChange(filtered);
  }, [
    items,
    sortBy,
    selectedMaterials,
    priceRange,
    customPrice,
    discountFilter,
    onFilterChange,
  ]);
  const priceFilters: Record<
    string,
    { label: string; value: [number, number] }[]
  > = {
    furnitures: [
      { label: "Under ₹19,999", value: [0, 19999] },
      { label: "₹20,000 - ₹29,999", value: [20000, 29999] },
      { label: "₹30,000 - ₹39,999", value: [30000, 39999] },
      { label: "₹40,000 - ₹49,999", value: [40000, 49999] },
      { label: "Above ₹50,000", value: [50000, Infinity] },
    ],
    homedecor: [
      { label: "Under ₹19,999", value: [0, 19999] },
      { label: "₹20,000 - ₹29,999", value: [20000, 29999] },
      { label: "₹30,000 - ₹39,999", value: [30000, 39999] },
      { label: "₹40,000 - ₹49,999", value: [40000, 49999] },
      { label: "₹50,000 - ₹59,999", value: [50000, 59999] },
      { label: "Above ₹60,000", value: [60000, Infinity] },
    ],
    electronics: [
      { label: "Under ₹19,000", value: [0, 19000] },
      { label: "₹20,000 - ₹29,999", value: [20000, 29999] },
      { label: "₹30,000 - ₹39,999", value: [30000, 39999] },
      { label: "₹40,000 - 50,000", value: [40000, 49999] },
      { label: "₹50,000 - ₹59,999", value: [50000, 60000] },
      { label: "Above ₹60,000", value: [60000, Infinity] },
    ],
  };
  const sortfilters: Record<string, { label: string; value: string }[]> = {
    furnitures: [
      { label: "Default Sorting", value: "default" },
      { label: "Sort by Popularity", value: "popularity" },
      { label: "Sort by Latest", value: "latest" },
      {
        label: "Sort by Price (Low - High)",
        value: "price-low-high",
      },
      {
        label: "Sort by Price (High - Low)",
        value: "price-high-low",
      },
    ],
    homedecor: [
      { label: " Recommended", value: "recommended" },
      {
        label: " Sort by Price (Low - High)",
        value: "price-low-high",
      },
      {
        label: "Sort by Price (High - Low)",
        value: "price-high-low",
      },
      {
        label: " Sort by Latest",
        value: "latest",
      },
      {
        label: "Sort by Discount",
        value: "discount",
      },
    ],
    electronics: [
      { label: "Popularity", value: "Popularity" },
      {
        label: "  Sort by Price (Low - High)",
        value: "price-low-high",
      },
      {
        label: " Sort by Price (High - Low)",
        value: "price-high-low",
      },
      {
        label: " Sort by Discount",
        value: "discount",
      },
      {
        label: " All Products",
        value: "All Products",
      },
    ],
  };

  const router = useRouter();
  const priceOptions = priceFilters[path] || [];
  const sortOptions = sortfilters[path] || [];

  if (variant === "sortDrawer") {
    return (
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide px-4 py-3 border-b border-gray-200">
          Sort by
        </h3>
        <div className="flex flex-col py-2 overflow-y-auto">
          {sortOptions.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                handleSortChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
                onClose?.();
              }}
              className={twMerge(
                "w-full text-left px-4 py-3 text-sm flex items-center gap-3",
                sortBy === value ? "text-[#3586FF] font-medium bg-blue-50" : "text-gray-800 hover:bg-gray-50"
              )}
            >
              {sortBy === value && <span className="w-1.5 h-1.5 rounded-full bg-[#3586FF]" />}
              <span className={sortBy === value ? "font-medium" : ""}>{label.trim()}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "drawer") {
    const drawerSections: { id: DrawerSection; label: string }[] = [
      ...(path === "homedecor" || path === "furnitures" ? [{ id: "material" as const, label: "Material" }] : [{ id: "categories" as const, label: "Product type" }]),
      { id: "price", label: "Price range" },
      { id: "discount", label: "Discount" },
      ...(path === "homedecor" ? [{ id: "warranty" as const, label: "Warranty" }] : []),
      ...(path === "electronics" ? [{ id: "brand" as const, label: "Brand" }, { id: "power" as const, label: "Power" }] : []),
    ];
    const sectionLabels: Record<DrawerSection, string> = {
      sort: "Sort by",
      material: "Choose material",
      categories: "Choose product type",
      price: "Price range",
      discount: "Discount",
      warranty: "Warranty",
      brand: "Choose brand",
      power: "Power",
    };
    const activeLabel = sectionLabels[drawerSection] ?? drawerSection;
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex shrink-0 items-center justify-end px-3 py-2 border-b border-gray-100">
          <Button onClick={handleReset} className="text-sm text-[#3586FF] hover:underline font-medium">
            Reset all
          </Button>
        </div>
        <div className="flex flex-1 min-h-0">
          <nav className="w-[42%] max-w-[152px] shrink-0 border-r border-gray-100 bg-gray-50/80 overflow-y-auto py-0.5">
            {drawerSections.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDrawerSection(id)}
                className={twMerge(
                  "w-full text-left px-2.5 py-2.5 md:px-3 md:py-3.5 text-[13px] font-medium rounded-r-md transition-colors",
                  drawerSection === id
                    ? "bg-white text-[#3586FF] border-l-2 border-[#3586FF] shadow-sm"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                )}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0 overflow-y-auto bg-white">
            <div className="px-3 pt-3 pb-1.5 md:px-4 md:pt-4 md:pb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">{activeLabel}</h4>
            </div>
            <div className="px-3 pb-4 md:px-4 md:pb-6">
              {drawerSection === "material" && (path === "homedecor" || path === "furnitures") && (
                <div className="flex flex-col gap-0.5">
                  {materials.length ? materials.map((material, index) => (
                    <label key={index} className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" value={material} onChange={handleMaterialChange} className="rounded border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                      <span className="text-sm text-gray-800">{material}</span>
                    </label>
                  )) : <p className="text-sm text-gray-400 py-2">No materials available</p>}
                </div>
              )}
              {drawerSection === "categories" && path === "electronics" && (
                <div className="flex flex-col gap-0.5">
                  {categoriesList.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" value={cat} onChange={handleCategoryChange} className="rounded border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                      <span className="text-sm text-gray-800">{cat.trim()}</span>
                    </label>
                  ))}
                </div>
              )}
              {drawerSection === "price" && (
                <div className="flex flex-col gap-1">
                  {priceOptions.map(({ label, value }) => (
                    <label key={label} className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="price" onChange={() => handlePriceChange(value as [number, number])} className="border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                      <span className="text-sm text-gray-800">{label}</span>
                    </label>
                  ))}
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                    <CustomInput className="rounded-lg border-gray-300 text-sm flex-1" type="number" name="min" placeholder="Min ₹" value={customPrice.min} onChange={handleCustomPriceChange} />
                    <CustomInput className="rounded-lg border-gray-300 text-sm flex-1" type="number" name="max" placeholder="Max ₹" value={customPrice.max} onChange={handleCustomPriceChange} />
                  </div>
                </div>
              )}
              {drawerSection === "discount" && (
                <div className="flex flex-col gap-0.5">
                  {[
                    { label: "All discounts", value: 0 },
                    { label: "20% and above", value: 20 },
                  ].map(({ label, value }) => (
                    <label key={value} className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" value={value} checked={discountFilter === value} onChange={handleDiscountChange} className="border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                      <span className="text-sm text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              )}
              {drawerSection === "warranty" && path === "homedecor" && (
                <div className="flex flex-col gap-0.5">
                  <label className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={isWarrenty} onChange={handleWarrentychecked} className="rounded border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                    <span className="text-sm text-gray-800">12 months warranty</span>
                  </label>
                </div>
              )}
              {drawerSection === "brand" && path === "electronics" && (
                <div className="flex flex-col gap-0.5">
                  {brands.length ? brands.map((brand, index) => (
                    <label key={index} className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" value={brand} onChange={handleBrandChange} className="rounded border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                      <span className="text-sm text-gray-800">{brand}</span>
                    </label>
                  )) : <p className="text-sm text-gray-400 py-2">No brands available</p>}
                </div>
              )}
              {drawerSection === "power" && path === "electronics" && (
                <div className="flex flex-col gap-0.5">
                  <label className="flex items-center gap-2 py-2 px-1.5 md:py-2.5 md:px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={isPowerChecked} onChange={handlepowerchecked} className="rounded border-gray-300 text-[#3586FF] focus:ring-[#3586FF]" />
                    <span className="text-sm text-gray-800">750 W & above</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="block md:flex gap-4 md:pt-8 mb-10">
        <div className="md:hidden flex items-center gap-4 ml-[15px] overflow-x-auto  relative   ">
          <div className="relative">
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <Button
                  className={twMerge(
                    "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:md:py-2 py-1 label-text  label-text text-nowrap font-medium hover:bg-gray-300"
                  )}
                >
                  <span className="font-bold">Sort by</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              }
            >
              <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg min-w-[210px]">
                {sortOptions.map(({ label, value }) => (
                  <Button
                    key={value}
                    onClick={() => {
                      const event = new Event("change", {
                        bubbles: true,
                      }) as unknown as React.ChangeEvent<HTMLInputElement>;
                      Object.defineProperty(event, "target", {
                        value: { value },
                        writable: true,
                      });
                      handleSortChange(event);
                    }}
                    className={twMerge(
                      "flex items-center gap-2 text-[10px] cursor-pointer px-2 py-1 rounded-md transition",
                      sortBy === value
                        ? "bg-gray-300 font-regular text-black"
                        : "bg-transparent",
                      "hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="sortBy"
                      value={value}
                      checked={sortBy === value}
                      onChange={handleSortChange}
                      className="hidden"
                    />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </DropDown>
          </div>
          {path === "homedecor" || path === "furnitures" ? (
            <div>
              <DropDown
                gapY={8}
                placement="bottom-start"
                fallBackPlcmnts={["bottom", "bottom-end"]}
                buttonElement={
                  <Button
                    className={twMerge(
                      "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text  text-nowrap font-medium hover:bg-gray-300"
                    )}
                  >
                    <span className="font-medium">Material</span>
                    <ChevronDownIcon className="w-4 h-4 " />
                  </Button>
                }
              >
                <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg min-w-[100px]">
                  {materials.map((material, index) => (
                    <Button
                      key={index}
                      onClick={(e) => {
                        const isChecked = selectedMaterials.includes(material);
                        const event = new Event("change", {
                          bubbles: true,
                        }) as unknown as React.ChangeEvent<HTMLInputElement>;
                        Object.defineProperty(event, "target", {
                          value: { value: material, checked: !isChecked },
                          writable: true,
                        });
                        handleMaterialChange(event);
                      }}
                      className={twMerge(
                        "flex items-center gap-2 text-[10px] cursor-pointer px-2 py-1 rounded-md transition",
                        selectedMaterials.includes(material)
                          ? "bg-gray-300 font-medium text-black"
                          : "bg-transparent"
                      )}
                    >
                      <input
                        type="checkbox"
                        value={material}
                        onChange={handleMaterialChange}
                        checked={selectedMaterials.includes(material)}
                        className="hidden"
                      />
                      <span>{material}</span>
                    </Button>
                  ))}
                </div>
              </DropDown>
            </div>
          ) : (
            <div className="relative w-full max-w-xs">
              <DropDown
                gapY={8}
                placement="bottom-start"
                fallBackPlcmnts={["bottom", "bottom-end"]}
                buttonElement={
                  <Button
                    className={twMerge(
                      "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text  text-nowrap font-medium hover:bg-gray-300"
                    )}
                  >
                    <span className="font-medium">Categories</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </Button>
                }
              >
                <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                  {categoriesList.map((category) => (
                    <Button
                      key={category}
                      onClick={() => {
                        const isChecked = categories.includes(category);
                        const event = new Event("change", {
                          bubbles: true,
                        }) as unknown as React.ChangeEvent<HTMLInputElement>;
                        Object.defineProperty(event, "target", {
                          value: { value: category, checked: !isChecked },
                          writable: true,
                        });
                        handleCategoryChange(event);
                      }}
                      className={twMerge(
                        "flex items-center gap-2 text-[10px] cursor-pointer px-2 py-1 rounded-md transition",
                        categories.includes(category)
                          ? "bg-gray-300 font-medium text-black"
                          : "bg-transparent",
                        ""
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        value={category}
                        onChange={handleCategoryChange}
                        className="hidden"
                      />
                      <span>{category}</span>
                    </Button>
                  ))}
                </div>
              </DropDown>
            </div>
          )}

          <div>
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <Button
                  className={twMerge(
                    "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text  text-nowrap font-medium hover:bg-gray-300"
                  )}
                >
                  <span className="font-medium">Price</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              }
            >
              <div className="px-4 md:py-2 py-1 label-text flex flex-col text-[12px] bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                {priceOptions.map(({ label, value }) => (
                  <Button
                    key={label}
                    onClick={() => handlePriceChange(value as [number, number])}
                    className={twMerge(
                      "cursor-pointer flex items-center gap-2 p-1 rounded-md transition",
                      priceRange &&
                        priceRange[0] === value[0] &&
                        priceRange[1] === value[1]
                        ? "bg-gray-300 font-medium text-black"
                        : "bg-transparent",
                      "hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="price"
                      value={label}
                      checked={
                        priceRange &&
                        priceRange[0] === value[0] &&
                        priceRange[1] === value[1]
                      }
                      onChange={() =>
                        handlePriceChange(value as [number, number])
                      }
                      className="hidden"
                    />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </DropDown>
          </div>
          <div className=" flex w-full gap-2">
            <CustomInput
              className="  rounded-md border-gray-500 text-sm  w-[50px] "
              type="number"
              name="min"
              placeholder="Min"
              value={customPrice.min}
              onChange={handleCustomPriceChange}
            />
            <CustomInput
              className=" rounded-md border-gray-500 text-sm  w-[50px] "
              type="number"
              name="max"
              placeholder="Max"
              value={customPrice.max}
              onChange={handleCustomPriceChange}
            />
          </div>

          <div>
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <Button
                  className={twMerge(
                    "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text  text-nowrap font-medium hover:bg-gray-300"
                  )}
                >
                  <span className="font-medium">Discount</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              }
            >
              <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white text-[12px] border border-gray-200 rounded-lg shadow-lg min-w-[150px]">
                {[
                  { label: "All Discounts", value: 0 },
                  { label: "20% and above", value: 20 },
                ].map(({ label, value }) => (
                  <Button
                    key={value}
                    onClick={() =>
                      handleDiscountChange({
                        target: { value: String(value) },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                    className={twMerge(
                      "cursor-pointer flex items-center gap-2 p-1 rounded transition",
                      discountFilter === value
                        ? "bg-gray-300 font-medium text-black"
                        : "bg-transparent",
                      "hover:bg-gray-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="discount"
                      value={value}
                      checked={discountFilter === value}
                      onChange={handleDiscountChange}
                      className="hidden"
                    />
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </DropDown>
          </div>
          {path === "homedecor" ? (
            <DropDown
              gapY={8}
              placement="bottom-start"
              fallBackPlcmnts={["bottom", "bottom-end"]}
              buttonElement={
                <Button
                  className={twMerge(
                    "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text font-medium  text-nowrap w-full text-left hover:bg-gray-300"
                  )}
                >
                  <span className="font-medium ">
                    Warranty
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              }
            >
              <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg w-[150px]">
                {[{ label: "12 Months", value: "12 Months" }].map((option) => (
                  <Button
                    key={option.value}
                    className={twMerge(
                      "px-2 py-1 font-medium text-left text-[12px] hover:bg-gray-200 rounded-md transition cursor-pointer",
                      isWarrenty
                        ? "bg-gray-300 font-medium text-black"
                        : "bg-transparent"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isWarrenty}
                      onChange={handleWarrentychecked}
                      className="hidden"
                    />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </DropDown>
          ) : path === "electronics" ? (
            <>
              <div>
                <DropDown
                  gapY={8}
                  placement="bottom-start"
                  fallBackPlcmnts={["bottom", "bottom-end"]}
                  buttonElement={
                    <Button
                      className={twMerge(
                        "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text  text-nowrap font-medium hover:bg-gray-300"
                      )}
                    >
                      <span className="font-medium">Brand</span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                  }
                >
                  <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white text-[12px] border border-gray-200 rounded-lg shadow-lg min-w-[150px]">
                    {brands.map((brand, index) => (
                      <Button
                        key={index}
                        onClick={(e) => {
                          const isChecked = selectedBrands.includes(brand);
                          const event = new Event("change", {
                            bubbles: true,
                          }) as unknown as React.ChangeEvent<HTMLInputElement>;
                          Object.defineProperty(event, "target", {
                            value: { value: brand, checked: !isChecked },
                            writable: true,
                          });
                          handleBrandChange(event);
                        }}
                        className={twMerge(
                          "flex items-center gap-2 text-[10px] cursor-pointer px-2 py-1 rounded-md transition",
                          selectedBrands.includes(brand)
                            ? "bg-gray-300 font-medium text-black"
                            : "bg-transparent"
                        )}
                      >
                        <input
                          type="checkbox"
                          value={brand}
                          checked={selectedBrands.includes(brand)}
                          onChange={handleBrandChange}
                          className="hidden"
                        />
                        <span>{brand}</span>
                      </Button>
                    ))}
                  </div>
                </DropDown>
              </div>
              <div className="relative w-full max-w-xs">
                <DropDown
                  gapY={8}
                  placement="bottom-start"
                  fallBackPlcmnts={["bottom", "bottom-end"]}
                  buttonElement={
                    <Button
                      className={twMerge(
                        "flex items-center gap-2 border-[1px] border-gray-500 rounded-[8px] px-4 md:py-2 py-1 label-text font-medium  text-nowrap w-full text-left hover:bg-gray-300"
                      )}
                    >
                      <span className="font-medium ">
                        Power (watts)
                      </span>
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                  }
                >
                  <div className="px-4 md:py-2 py-1 label-text flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg w-[150px]">
                    {[{ label: "750 W & Above (20)", value: "750W" }].map(
                      (option) => (
                        <label
                          key={option.value}
                          className={twMerge(
                            "px-2 py-1 font-medium text-left text-[12px] hover:bg-gray-200 rounded-md transition cursor-pointer flex items-center gap-2",
                            isPowerChecked
                              ? "bg-gray-300 font-medium text-black"
                              : "bg-transparent"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isPowerChecked}
                            onChange={handlepowerchecked}
                            className="hidden"
                          />
                          <span>{option.label}</span>
                        </label>
                      )
                    )}
                  </div>
                </DropDown>
              </div>
            </>
          ) : (
            <></>
          )}
          <p
            className="cursor-pointer font-bold  text-[#3586FF] underline"
            onClick={handleReset}
          >
            Reset
          </p>
        </div>

        <div
          className={`ml-5 w-[280px] rounded-xl bg-white shadow-lg border border-slate-200 
  ${showFilter ? "block absolute z-40" : "hidden"} 
  md:block font-regular`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-[16px] font-bold text-slate-800">
              Filters
            </h3>
            <Button
              onClick={handleReset}
              className="text-sm text-blue-600 btn-txt hover:underline font-medium"
            >
              Reset
            </Button>
          </div>

          <div className="border-[1px]  p-4 border-slate-200 rounded-[8px] px-4 md:py-2 py-1 label-text">
            <label className="flex items-center gap-2 text-[#5297ff] font-medium sub-heading">
              Sort by
            </label>
            <div className="text-xs text-gray-600 flex flex-col gap-2 mt-4">
              {sortOptions.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sortBy"
                    value={value}
                    checked={sortBy === value}
                    onChange={handleSortChange}
                  />
                  <span className="sublabel-text text-black font-regular">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {path === "homedecor" || path === "furnitures" ? (
            <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
              <h2 className="flex items-center gap-2 text-[#5297ff] font-medium sub-heading">
                Material
              </h2>
              <div className="text-xs text-gray-600 flex flex-col gap-2 mt-4">
                {materials.map((material, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={material}
                      onChange={handleMaterialChange}
                      className="rounded-sm focus:ring-0"
                    />
                    <span className="sublabel-text text-black font-regular">{material}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
              <h4 className="flex items-center text-[#5297ff] gap-2 font-medium sub-heading">
                Categories
              </h4>
              <div className="text-xs  flex flex-col label-text text-black gap-y-[15px] mt-4">
                {[
                  "Storage Water Heaters ",
                  "Steam Irons",
                  "Instant Water Heaters",
                  "Geysers ",
                  "Immersion Rods",
                  "Radiators",
                ].map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 label-text text-black"
                  >
                    <input
                      type="checkbox"
                      value={category}
                      onChange={handleCategoryChange}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Material Section */}

          {/* Price Section */}
          <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
            <h4 className="flex items-center gap-2 text-[#5297ff] font-medium sub-heading">
              Price
            </h4>
            <div className="text-xs text-gray-600 flex flex-col gap-2 mt-4">
              {priceOptions.map(({ label, value }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="price"
                    onChange={() =>
                      handlePriceChange(value as [number, number])
                    }
                  />
                  <span className="label-text text-black">{label}</span>
                </label>
              ))}
            </div>
            <div className=" flex w-full gap-4 mt-2">
              <CustomInput
                className="  rounded-md border-gray-500 text-sm  w-[80px] "
                type="number"
                name="min"
                placeholder="Min"
                labelCls="label-text text-black"
                value={customPrice.min}
                onChange={handleCustomPriceChange}
              />
              <CustomInput
                className=" rounded-md border-gray-500 text-sm  w-[80px] "
                type="number"
                name="max"
                placeholder="Max"
                value={customPrice.max}
                labelCls="label-text text-black"
                onChange={handleCustomPriceChange}
              />
            </div>
          </div>

          {/* Discount Section */}
          <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
            <h4 className="flex items-center gap-2  text-[#5297ff] font-medium sub-heading">
              Discount
            </h4>
            <div className="text-xs text-gray-600 flex flex-col gap-2 mt-4">
              {[
                { label: "All Discounts", value: 0 },
                { label: "20% and above", value: 20 },
              ].map(({ label, value }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={value}
                    checked={discountFilter === value}
                    onChange={handleDiscountChange}
                  />
                  <span className="label-text text-black">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {path === "homedecor" ? (
            <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
              <h4 className="flex items-center gap-2 text-[#5297ff] font-medium sub-heading">
                Warrenty
              </h4>
              <div className="text-xs text-gray-600 flex flex-col gap-2 mt-4">
                {[{ label: "12 Months", value: "12 Months" }].map(
                  ({ label, value }) => (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={value}
                        checked={isWarrenty}
                        onChange={handleWarrentychecked}
                        className="rounded-sm focus:ring-0"
                      />
                      <span className="label-text text-black">{label}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          ) : path === "electronics" ? (
            <>
              <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
                <h4 className=" max-w-[81px] text-[#5297ff] font-medium  sub-heading leading-[28.5px]">
                  Brand
                </h4>
                <div className="text-xs text-gray-600 flex flex-col gap-2 mt-4 gap-y-[20px]">
                  {brands.map((brand, index) => (
                    <label key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={brand}
                        onChange={handleBrandChange}
                        className="rounded-sm focus:ring-0"
                      />
                      <span className="label-text text-black">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-[1px] border-slate-200 px-4 md:py-2 py-1 label-text">
                <h4 className="max-w-[136px]  w-full text-[#5297ff] font-medium sub-heading  leading-[28.5px]">
                  Power (watts)
                </h4>
                <div className="text-xs text-gray-600 flex flex-col gap-y-[20px] mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={""}
                      checked={isPowerChecked}
                      onChange={handlepowerchecked}
                      className="rounded-sm focus:ring-0"
                    />
                    <span className="label-text text-black">
                      750 W & Above (20)
                    </span>
                  </label>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
export default ItemsFilterBar;
