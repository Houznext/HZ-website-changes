import React from "react";
import Image from "next/image";
export interface IServicesWeOffersprops {
  heading: string;
  listItems: Array<{
    id: number;
    image: string;
    title: string;
    discount: string;
  }>;
}

export default function ServicesWeOffers({
  heading,
  listItems,
}: IServicesWeOffersprops) {
  return (
    <>
      <div className="flex flex-col gap-y-[32px] max-w-[824px] md:items-start items-center min-h-[300px] bg-[#FFFFFF] rounded-[8px]">
        <div className="max-w-[199px] min-h-[29px] md:text-left text-center">
          <h1 className="font-bold text-[#000000] text-[20px] leading-[28.5px] ">
            {heading}
          </h1>
        </div>
        <div className="max-w-[776px] min-h-[191px] w-full flex items-center flex-wrap gap-x-[48px] gap-y-[40px]">
          {listItems.map((item, index) => {
            return (
              <div
                className="max-w-[158px] min-h-[191px] w-full  sm:w-1/1 md:w-1/2 lg:w-1/4 xl:w-1/4 bg-[#FFFFFF] rounded-[8px] border-[1px] border-[#D0D0D0] flex flex-col items-center gap-y-[18px]"
                key={index}
              >
                <div className="w-full flex justify-start">
                  <div className="w-[84px] min-h-[30px] bg-[#3586FF] flex items-center justify-center rounded-tl-[8px] rounded-br-[8px] ">
                    <h1 className=" w-[68px] h-[14px] font-medium text-[10px] leading-[14.25px] text-[#FFFFFF]">
                      {item.discount}
                    </h1>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-y-[8px] max-w-[138px] min-h-[95px]">
                  <div className="relative w-[64px] h-[64px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="max-w-[128px] min-h-[23px]">
                    <h2 className="text-[#41608F] font-medium text-[16px] leading-[22.8px]">
                      {item.title}
                    </h2>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
