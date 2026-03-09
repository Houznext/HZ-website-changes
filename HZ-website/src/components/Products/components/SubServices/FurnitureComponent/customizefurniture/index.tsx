import React from "react";
import Image from "next/image";
import { AnyCnameRecord } from "dns";
import { useRouter } from "next/router";
import Button from "@/common/Button";
export interface ICustomizeFurnituresDataprops {
  image: string;
}

const CustomizeFurniture = ({ image }: ICustomizeFurnituresDataprops) => {
  const router = useRouter();
  return (
    <div className="w-full mx-auto">
      <div className="md:max-w-[90%] md:min-h-[361px] mx-auto w-full max-w-[430px] min-h-[245px] relative  border border-solid border-[#FFFFFF] ">
        <Image
          src={image}
          fill
          alt="customizefurniture"
          className="w-full h-full"
          unoptimized
        />

        <div className="absolute inset-0 bg-[#000000] md-bg-opacity-40 bg-opacity-45 z-10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center md:gap-y-[4px] z-20 gap-y-[4px]">
          <div className="md:mb-4 mb-2 max-w-[470px] h-[53px] flex flex-col  md:gap-y-[6px] gap-y-[4px] sm:gap-[9px] mx-auto">
            <h1 className="md:max-w-[470px] md:h-[44px] max-w-[3030px] min-h-[29px] font-bold md:text-[31px] text-[20px]  md:leading-[44.17px] text-white leading-[28.5px]">
              Choose your Dream Furniture
            </h1>
            <div className="max-w-[175px] border-[3px] border-[#FFFFFF] text-center w-full mx-auto"></div>
          </div>

          <h2
            className="mb-4 md:max-w-[307px] md:h-[36px] max-w-[197px] h-[23px] font-medium md:text-[25px]  text-[16px] md:leading-[35.62px] leading-[22.8px]
text-left text-[#FFFFFF]"
          >
            with 45+ Custom Colors
          </h2>

          <div className="mb-4 flex gap-1">
            <div className="md:w-[36px] md:h-[36px] w-[24px] h-[24px] rounded-full bg-[#F76F44]"></div>
            <div className="md:w-[36px] md:h-[36px] w-[24px] h-[24px] rounded-full bg-[#55BDDD]"></div>
            <div className="md:w-[36px] md:h-[36px] w-[24px] h-[24px] rounded-full bg-[#BF8DDE]"></div>
          </div>

          <div className="flex flex-col items-start md:max-w-[226px] md:h-[42px] max-w-[244px] h-[45px] mt-[5%] relative">
            <Button
              className=" md:min-h-[38px] w-[244px] h-[41px]  py-[12px]  bg-[#3E8AFB] text-[#FFFFFF]  text-[12px]  font-bold md:leading-[14.4px] leading-[17.1px] tracking-[.16em]  hover:scale-105 transform duration-300 flex items-center justify-center z-10 relative "
              onClick={() => {
                router.push(
                  "/services//furnitures/custom-furnitures"
                );
              }}
            >
              {"Customize Furniture".toUpperCase()}
            </Button>

            <div className="md:w-[240px] md:h-[40px] w-[244px] h-[41px] border-[1px] border-solid border-[#FFFFFF]  absolute top-1 left-1 "></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeFurniture;
