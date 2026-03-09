import React, { useState, useEffect, useRef } from "react";
import BreadCrumb from "../../BreadCrumb";
import { useRouter } from "next/router";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import ItemsSection from "./ItemsSection";
import { mapElectronicsListItem } from "@/utils/electronicsMapper";
import {
  ELECTRONICS_CATEGORIES,
  type ElectronicsCategoryItem,
  getElectronicsCategoryForApi,
} from "@/constants/electronicsCategories";

export default function ElectronicItems() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState<ElectronicsCategoryItem>(ELECTRONICS_CATEGORIES[0]);

  const categoryParam = router.query.category as string;
  const lastFetchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
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
    const cat = param ?? "";
    const fetchKey = `electronics|${cat}`;
    if (lastFetchedKeyRef.current === fetchKey) return;
    lastFetchedKeyRef.current = fetchKey;
    fetchItems(cat);
  }, [categoryParam, router.isReady]);

  const fetchItems = async (category: string) => {
    try {
      const params: Record<string, string | number | string[] | undefined> = {
        page: 1,
        limit: 12,
      };
      const categoriesForApi = getElectronicsCategoryForApi(category);
      if (categoriesForApi?.length) {
        params.categories = categoriesForApi;
      }
      const res = await apiClient.get(apiClient.URLS.electronics, params, true);
      const rawData = res?.body?.data ?? [];
      setItems(
        Array.isArray(rawData)
          ? rawData.map((row: any) => mapElectronicsListItem(row))
          : []
      );
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [...ELECTRONICS_CATEGORIES];

  return (
    <>
      <div>
        <ul className="flex items-center md:flex-nowrap flex-wrap  justify-around px-8 py-4 mt-4 cursor-pointer md:text-gray-600 font-regular text-[16px] border-b-[1px] border-slate-200 gap-y-[16px] md:max-w-[1492px] md:min-h-[27px] sm:max-w-[398px] sm:min-h-[149px]">
          {categories.map((category) => (
            <li
              key={category.id}
              onClick={() =>
                router.push(
                  `/services/electronics/electronics-shop?category=${category.category}`
                )
              }
              className={` md:border-none border-[1px] border-[#5F5F5F] md:px-[0px] md:py-[0px] md:rounded-[0px] rounded-[4px] py-[4px] px-[16px] md:ml-[0] ml-[8px] md:bg-transparent  ${category.id === selectedCategory.id
                ? "text-[#3586FF] bg-[#FFFFFF]"
                : "text-[#5F5F5F] bg-[#ECECEC]"
                }
               hover:text-[#3586FF] `}
            >
              {category.name}
            </li>
          ))}
        </ul>

        <div className="absolute hidden h-auto text-sm lg:block">
          <BreadCrumb
            steps={[
              { label: "Our Services", link: "/services/custom-builder" },
              {
                label: "Electronics",
                link: "/services/electronics",
              },
              {
                label: "Electronics-shop",
                link: "/services/electronics/electronics-shop",
              },
              ...(selectedCategory
                ? [
                  {
                    label: selectedCategory.name,
                    link: `/services/custom-builder/electronics/electronics-shop?category=${selectedCategory.category}`,
                  },
                ]
                : []),
            ]}
            currentStep={selectedCategory.name || "Electronics Shop"}
          />
        </div>

        <ItemsSection
          category={selectedCategory.name}
          items={items}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
