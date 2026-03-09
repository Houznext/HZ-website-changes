import React, { useState, useEffect, useRef } from "react";
import BreadCrumb from "../../../BreadCrumb";
import { useRouter } from "next/router";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import ItemsSection from "./ItemsSection";

export default function HomeDecorItems() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState({
    id: 1,
    name: "New Arrivals",
    category: "new-arrivals",
  });

  const categoryParam = router.query.category as string;
  const lastFetchedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const category = categories.find((cat) => cat.category === categoryParam);
    if (category) {
      setSelectedCategory(category);
    }
    const cat = categoryParam || "";
    const fetchKey = `homedecor|${cat}`;
    if (lastFetchedKeyRef.current === fetchKey) return;
    lastFetchedKeyRef.current = fetchKey;
    fetchItems(cat);
  }, [categoryParam, router.isReady]);


  const fetchItems = async (category: string) => {
    try {
      const res = await apiClient.get(apiClient.URLS.homeDecor, {
        category,
      });


      setItems(res?.body?.data ?? []);
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 1, name: 'New Arrivals', category: 'New Arrivals' },
    { id: 2, name: 'Wall Shelves', category: 'Wall Shelves' },
    { id: 3, name: 'Pots and Plants', category: 'Pots and Plants' },
    { id: 4, name: 'Baskets', category: 'Baskets' },
    { id: 5, name: 'Photo Frames', category: 'Photo Frame' },
    { id: 6, name: 'Tableware', category: 'Tableware' },
    { id: 7, name: 'Wall Mirrors', category: 'Wall Mirrors' },
    { id: 8, name: 'Wallpapers & Decals', category: 'Wallpapers and Decals' },
    { id: 9, name: 'Clocks', category: 'Clocks' },
    { id: 10, name: 'Home Temples', category: 'Home Temples' },
    {
      id: 11,
      name: 'Wall Art & Paintings',
      category: 'Wall Art and Paintings',
    },
    { id: 12, name: 'Figurines', category: 'Figurines' },
    { id: 13, name: 'Trays', category: 'Trays' },
  ];

  return (
    <>
      <div>
        <ul className="flex items-center md:flex-nowrap flex-wrap  justify-around px-8 py-4 mt-4 cursor-pointer md:text-gray-600 font-regular text-[16px] border-b-[1px] border-slate-200 gap-y-[16px] md:max-w-[1492px] md:min-h-[27px] sm:max-w-[398px] sm:min-h-[149px]">
          {categories.map((category) => (
            <li
              key={category.id}
              onClick={() =>
                router.push(
                  `/services/custom-builder/homedecor/homedecor-shop?category=${category.category}`
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
                label: "Home Decor",
                link: "/services/custom-builder/homedecor",
              },
              {
                label: "Home Decor-shop",
                link: "/services/custom-builder/homedecor/homedecor-shop",
              },
              ...(selectedCategory
                ? [
                  {
                    label: selectedCategory.name,
                    link: `/services/custom-builder/homedecor/homedecor-shop?category=${selectedCategory.category}`,
                  },
                ]
                : []),
            ]}
            currentStep={selectedCategory.name || "Furniture Shop"}
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
