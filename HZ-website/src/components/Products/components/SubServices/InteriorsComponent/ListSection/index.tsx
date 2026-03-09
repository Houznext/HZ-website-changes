import SectionSkeleton from "@/common/Skeleton";
import { RightArrowWhite } from "@/components/Icons";
import { useStrapiInteriorStore } from "@/store/strapiInteriorsData";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export interface IListSectionProps {
  heading: string;
  subHeading: string;
  list: Array<{
    imageUrl: string;
    label: string;
  }>;
}

function ListSection({ heading, subHeading, list }: IListSectionProps) {
  const router = useRouter();
  const { loading } = useStrapiInteriorStore();

  const renderImageItem = (imageUrl: string, label: string, index: number) => {
    const isLargeImage = index % 4 === 0;

    const handleRoute = (label: string) => {
      const formattedLabel = label.toLowerCase().replace(/\s+/g, "-");
      router.push(`/interiors/${formattedLabel}`);
    };

    return (
      <div
        key={index}
        className={clsx(
          "flex flex-col   items-center justify-center cursor-pointer group",
          isLargeImage
            ? "w-full md:max-w-[370px] max-w-[100px] md:h-[188px] h-[100px] "
            : "md:w-[370px] w-[100px] md:h-[188px] h-[100px] "
        )}
        onClick={() => handleRoute(label)}
      >
        <div className="relative w-full h-full overflow-hidden md:rounded-[10px] rounded-[6px]">
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="transition-transform duration-300 ease-in-out group-hover:scale-105 object-cover"
          />
          <div className="absolute bottom-2 right-2 text-transparent px-2 py-2 rounded-md flex flex-row gap-1 items-center transition-opacity duration-300 ease-in-out group-hover:opacity-100 opacity-0">
            <p className="text-white text-[14px] md:font-medium font-regular hidden md:block">
              <span>View Details</span>
            </p>
            <div className="hidden md:block w-4 h-4">
              <RightArrowWhite />
            </div>
          </div>
        </div>
        <p
          className={clsx(
            "md:text-[15px] text-[12px] font-medium text-start text-[#7B7C83] md:mt-3 mt-2",
            index === 0 ? "font-bold" : "font-normal"
          )}
        >
          {label}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-centers">
      <h1 className="font-bold md:text-[24px] text-[18px] mb-3">
        {heading}
      </h1>
      <h2 className="font-medium text-[#7B7C83] subheading-text md:mb-[30px] mb-[20px]">
        {subHeading}
      </h2>

      {loading ? (
        <SectionSkeleton type={"listSectionSkeleton"} />
      ) : (
        <div className="md:flex flex-wrap gap-y-10 gap-x-5 items-center justify-center hidden">
          {list.map(({ imageUrl, label }, index) =>
            renderImageItem(imageUrl, label, index)
          )}
        </div>
      )}

      <div className="md:hidden grid grid-cols-3 gap-4 max-w-[386px] mx-auto gap-x-[12px] gap-y-[18px] w-full cursor-pointer pl-4">
        {list.map(({ imageUrl, label }, index) =>
          renderImageItem(imageUrl, label, index)
        )}
      </div>
    </div>
  );
}

export default ListSection;
