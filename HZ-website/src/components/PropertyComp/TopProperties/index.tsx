import React from "react";
import Image from "next/image";
import Button from "@/common/Button";
import RupeesIcon, { WallpaperIcon } from "../Icons";
import { CiLocationOn } from "react-icons/ci";
import { FaRulerCombined, FaRupeeSign } from "react-icons/fa";
import {useRouter} from 'next/router';
import { Router } from "lucide-react";

const TopProperties = (props: any) => {
  const { key, image, projectName, location, area, price, city, link, id } =
    props;
    const router=useRouter()
  return (
    <div
      className="relative md:max-w-[320px] max-w-[170px]  flex flex-col md:gap-2 justify-center md:p-4 p-2  shadow-custom gap-1 md:ml-0 ml-1"
      key={key}
    >
      <div className="md:h-[197px] h-[100px] md:w-full  w-[153px] relative ">
        <Image
  src={image || "/images/default.jpg"}
          alt="top_properties"
          layout="fill"
          objectFit="cover"
          className="absolute rounded-[10px]"
        />
      </div>
      <h1 className="font-medium  md:text-[18px] text-[12px]   ">
        {projectName}
      </h1>
      <div className="flex items-center gap-1">
        {" "}
        <CiLocationOn className="md:text-[12px] text-[10px] " />{" "}
        <h2 className="font-medium md:text-[14px] text-[12px] text-[#7B7C83] leading-6">
          {location},{city}
        </h2>
      </div>

      <p className="h-[2px] w-[inherit] my-[10px] bg-[#E9E9E9]"></p>
      <div className="flex md:flex-row flex-col justify-between">
        <div className="flex md:flex-col flex-row md:gap-1 gap-1 md:mb-3 mb-2">
          <div>
            <FaRulerCombined className="md:text-[12px] text-[12px]"/>
          </div>
          <p className="text-[#7B7C83] text-nowrap md:text-[12px] text-[12px]">
            {area}
          </p>
        </div>
        <div className="flex md:flex-col flex-row md:gap-1 gap-1">
          <div>
             <FaRupeeSign  className="md:text-[12px] text-[12px]"/>
          </div>
          <p className="text-[#7B7C83] text-nowrap md:text-[12px] text-[12px]">
            {price}
          </p>
        </div>
      </div>
      <Button
        className="bg-[#3586FF] text-white font-medium text-nowrap md:py-[10px] py-[8px] md:text-[12px] text-[10px] md:px-[67px] px-[10px] rounded-[6px]" onClick={()=>router.push(link)}
        
      >
        GET MORE DETAILS
      </Button>
    </div>
  );
};

export default TopProperties;
