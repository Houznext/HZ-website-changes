import React from "react";
import Image from "next/image";
export interface IHomeLoanBankingprops {
  heading: string;
  listItems: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
    interest: string;
  }>;
}

export default function HomeLoanBanking({
  heading,
  listItems,
}: IHomeLoanBankingprops) {
  return (
    <>
      <div className="max-w-[1392px] min-h-[428px] mx-auto flex flex-col items-center gap-y-[64px]">
        <div>
          <h1
            className="max-w-[358px] min-h-[34px] font-bold text-[24px] leading-[34.2px] text-left
        text-[#000000]"
          >
            {heading}
          </h1>
        </div>
        <div className="flex flex-wrap items-center  justify-center max-w-[1392px] min-h-[428px] gap-x-[18px] gap-y-[32px] ">
          {listItems.map((item, index) => {
            return (
              <div
                className="max-w-[334px] min-h-[149px]  sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 flex items-center  bg-[#FFFFFF] shadow-custom gap-x-[32px] rounded-[8px]"
                key={index}
              >
                <div className="px-[20px] relative w-[101px] min-h-[95px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    objectFit="cover"
                    className="absolute "
                    width={101}
                    height={95}
                  />
                </div>
                <div className="flex flex-col items-start gap-y-[8px]">
                  <h1 className="max-w-[183px] min-h-[29px] font-bold text-[20px] lading-[28.5px] text-center text-[#000000]">
                    {item.title}
                  </h1>
                  <h2 className="max-w-[141px] min-h-[23px] font-regular text-[16px] text-left leading-[22.8px] text-[#686565]">
                    {item.interest}
                  </h2>
                  <div className="max-w-[169px] min-h-[23px] font-regular text-left text-[#686565] text-[16px] leading-[22.8px]">
                    {item.description}
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
