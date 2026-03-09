import React from "react";
import Image from "next/image";
import Button from "@/common/Button";
export interface ICustomizationprops {
  whatsappicon: string;
  whatsappimage: string;
}

export default function Customization({
  whatsappicon,
  whatsappimage,
}: ICustomizationprops) {
  return (
    <>
      <div className="md:max-w-[1440px] max-w-[430px] min-h-[347px] text-center md:min-h-[372px] bg-[#D2E4FF] w-full flex md:items-center items-center md:justify-around justify-center  gap-x-[126px] sm:justify-around md:gap-[20px] gap-[14px] mt-[8%] mx-auto -z-0  ">
        <div className="md:max-w-[577px] md:h-[279px]  max-w-[398px] min-h-[281px] flex flex-col gap-y-[15px] md:ml-[10px] ml-[20px] ">
          <div className="flex items-center md:gap-[35px] gap-[20px]  md:max-w-[577px] md:h-[194px] max-w-[262px] h-[73px]">
            <div className="md:w-[64px] md:h-[64px] w-[54px] h-[54px] relative">
              <Image
                src={whatsappicon}
                alt="whatapp"
                fill
                sizes="(max-width: 768px) 54px, 64px"
                className="object-contain absolute"
              />
            </div>

            <div className="md:max-w-[239px] md:h-[78px] max-w-[192px] h-[61px] mr-6">
              <h1 className="max-w-[239px] h-[78px] font-regular md:text-[20px] text-[16px]  md:leading-[28.5px] leading-[22.8px] text-left">
                We do a little more than{" "}
                <span className="font-medium md:text-[31px] text-[24px] md:leading-[44.17px] leading-[34.2px] text-left text-[#000000]">
                  Customization{" "}
                </span>
              </h1>
            </div>
          </div>
          <div className=" md:max-w-[234px] max-w-[285px] md:min-h-[4px] min-h-[4px] sm:mt-[40px] md:mt-[10px] bg-[#4CAF50]"></div>
          <div className="p-2 flex  flex-col md:gap-[4px] gap-[2px]">
            <h1 className="md:max-w-[207px] md:h-[36px] max-w-[166px] h-[29px] font-medium md:text-[25px] md:leading-[35.62px] text-[20px] leading-[28.5px] text-left text-[#000000] ">
              +91 9876543211
            </h1>
            <h2 className="md:max-w-[577px] md:h-[29px] max-w-[398px] w-full h-[46px] font-regular lg:text-[20px]  md:leading-[28.5px] text-[16px] leading-[22.8px] md:text-center text-left text-[#5F5F5F] ">
              Share with us your custom furniture designs on WhatsApp
            </h2>
          </div>

          <div className="relative flex flex-col items-start sm:mt-[10%] md:mt-[2px] mt-[40px]">
            <Button className="md:w-[240px] md:h-[41px] w-[244px] h-[45px] bg-[#3E8AFB] text-[#FFFFFF] font-bold text-[12px]  leading-[17.1px] tracking-[.16em] flex items-center justify-center z-10 relative">
              {"Customize Furniture".toUpperCase()}
            </Button>

            <div className="md:w-[240px] md:h-[41px] w-[244px] h-[45px] border border-solid border-[#3E8AFB] absolute top-1 left-1"></div>
          </div>
        </div>
        <div className="z-12  md:translate-x-[0px]  md:translate-y-[0px] translate-y-[80%] translate-x-[-90%] hidden md:block ">
          <div className="relative md:w-[551px] md:h-[372px] w-[163px]  h-[134px]   ">
            <Image
              src={whatsappimage}
              fill
              alt="image.png"
              sizes="(max-width: 768px) 163px, 551px"
              className=" object-cover absolute "
            />
          </div>
        </div>
      </div>
    </>
  );
}
