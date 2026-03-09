import Button from "@/common/Button";
import Image from "next/image";
import React from "react";

interface IHomeSectionProps {
  itemsArray: Array<{
    id: number;
    name: string;
    price?: number;
    image?: string;
    images?: Array<{ url: string }>;
    dateAdded?: string;
    material?: string;
    discount?: number;
    category: string;
  }>;
  category: string;
}

const getImageSrc = (image?: string) => {
  if (image && !image.startsWith("http") && !image.startsWith("/")) {
    return `/${image}`;
  }
  return (
    image || "/images/custombuilder/subservices/furnitures/touch-and-feel.png"
  );
};

const HomeSection = ({ category, itemsArray }: IHomeSectionProps) => {
  return (
    <div className="flex flex-col items-center px-2 py-1 md:p-5 m-auto border-b-[1px] border-slate-200">
      <p className="font-bold md:text-xl text-[18px] p-3">
        {category
          ?.split("-")
          .map((string) => string.charAt(0).toUpperCase() + string.slice(1))
          .join(" ") || "New Arrivals"}
      </p>
      <ul className="flex justify-between items-center mx-auto gap-2 md:gap-10 ">
        {itemsArray
          .filter((a) => a.category.toLowerCase() === category?.toLowerCase())
          .sort(
            (a, b) =>
              Date.parse(a.dateAdded || "0") - Date.parse(b.dateAdded || "0")
          )
          .slice(0, 2)
          .map((item) => {
            const primaryImageUrl =
              item.images?.[0]?.url ?? (item.image as string | undefined);
            const imageSrc = getImageSrc(primaryImageUrl);
            return (
              <li
                key={item.id}
                className="p-3 rounded-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] mx-auto cursor-pointer md:bg-transparent bg-[#ECF3FE]"
              >
                <div className="relative md:w-[250px] md:h-[100px] w-[180px] h-[80px]   ">
                  <Image
                    src={imageSrc}
                    alt={item.name ?? ""}
                    fill
                    className=" object-cover rounded-sm"
                    unoptimized
                  />
                </div>

                <p className="text-center font-medium md:mt-3 mt-1 md:text-[14px] text-[10px]">{item.name}</p>

                <Button
                  href=""
                  className="w-full mx-auto btn-txt font-medium bg-[#3586FF] rounded-md md:mt-3 mt-1 md:py-2 py-1 text-white"
                >
                  Shop now
                </Button>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default HomeSection;
