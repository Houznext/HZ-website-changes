import React from "react";
import Image from "next/image";
import { FaCity } from "react-icons/fa";

const PopularCity = (props: any) => {
  const { city, count, image } = props;
  return (
    <div className="flex  relative flex-row justify-center items-center md:gap-5  gap-2">
      <div className="md:h-[132px] h-[90px]  md:w-[142px] w-[110px] relative shadow-custom rounded-[10px]">
        <Image
          src={image}
          alt="popular_cities"
          layout="fill"
          objectFit="cover"
          className="rounded-[10px]"
        />
      </div>
      <div>
        <h1 className="md:text-[16px] text-[12px] font-medium md:leading-8 leading-4 mb-2">
          {city}
        </h1>
        <h2 className="md:text-[14px] text-[10px] font-regular md:leading-6 leading-3 text-[#7B7C83]">
          {count}+ Properties
        </h2>
      </div>
    </div>
  );
};

export default PopularCity;
