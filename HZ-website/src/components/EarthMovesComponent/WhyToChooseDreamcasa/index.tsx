import React from "react";
import Image from "next/image";
export interface IWhyToChooseDreamcasaprops {
  heading: string;
  icon: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
    number: string;
  }>;
}

export default function WhyToChooseDreamcasa({
  heading,
  icon,
  listItems,
}: IWhyToChooseDreamcasaprops) {
  return (
    <>
      <div className="max-w-[1440px] min-h-[421px] flex flex-col items-center mx-auto gap-y-[48px]">
        <div className="max-w-[418px] min-h-[34px]">
          <h1 className="font-bold text-[#3E6196] text-[24px] leading-[34.2px] text-left">
            {heading.toUpperCase()}
          </h1>
        </div>
        <div className="w-full min-h-[339px] bg-[#5095FC12] flex flex-wrap items-center justify-center gap-x-[36px] mx-auto">
          {listItems.map((item, index) => (
            <React.Fragment
              key={`item-${item.image}-${item.title}-${item.number}-${index}`}
            >
              <div className="max-w-[204px] min-h-[275px] flex flex-col items-start gap-y-[16px] w-full  sm:w-1/1 md:w-1/2 lg:w-1/3 xl:w-1/4 ">
                <div className="max-w-[81px] min-h-[91px] flex flex-col items-start gap-y-[2px]">
                  <div className="max-w-[96px] min-h-[91px]">
                    <h1 className="font-bold text-[#000000] text-[64px] text-left leading-[91.2px]">
                      {item.number}
                    </h1>
                  </div>
                  <div className="w-[47px] h-[3px] bg-[#3586FF]"></div>
                </div>
                <div className="max-w-[146px] min-h-[29px] ">
                  <h2 className="text-[#000000] text-left font-medium text-[20px] leading-[28.5px]">
                    {item.title}
                  </h2>
                </div>
                <div className="relative w-[204px] h-[115px] rounded-[4px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    objectFit="cover"
                    layout="fill"
                  />
                </div>
              </div>
              {index < listItems.length - 1 && (
                <div className=" px-[4px] pt-[150px] hidden  md:block  ">
                  <Image
                    src={icon}
                    objectFit="cover"
                    alt="arrow"
                    width={103}
                    height={2}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
