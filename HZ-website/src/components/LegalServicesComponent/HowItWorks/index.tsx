import React from "react";
import Image from "next/image";
export interface IHowitWorksprops {
  heading: string;
  icon: string;
  listItems: Array<{
    id: number;
    title: string;
    description: string;
    iconurl: string;
  }>;
}

export default function HowItWorks({
  heading,
  icon,
  listItems,
}: IHowitWorksprops) {
  return (
    <>
      <div className="max-w-[1392px] min-h-[345px] mx-auto flex flex-col items-center gap-y-[48px]">
        <h2 className="max-w-[168px] min-h-[34px] text-[#000000] text-left font-bold text-[24px] leading-[34.2px]">
          {heading}
        </h2>
        <div className="w-full min-h-[169px] flex flex-wrap items-center justify-center  mx-auto  gap-y-[24px] text-center md:mx-auto gap-x-[14px]">
          {listItems.map((item, index) => (
            <React.Fragment
              key={`item-${item.iconurl}-${item.title}-${item.description}-${index}`}
            >
              <div className="max-w-[273px] min-h-[263px] flex flex-col items-center gap-y-[24px]justify-center w-full  sm:w-1/1 md:w-1/2 lg:w-1/3 xl:w-1/3 shadow-custom  bg-[#FFFFFF] rounded-[16px] ">
                <Image
                  src={item.iconurl}
                  alt={item.title}
                  width={112}
                  height={112}

                  className="pt-[20px] object-cover"
                />
                <h1 className="max-w-[252px] min-h-[29px] font-medium text-[16px] leading-[28.5px] text-[#000000] text-left pt-[10px]">
                  {item.title}
                </h1>
                <h2 className="max-w-[305px] text-center font-regular text-[#7B7C83] md:text-[12px] text-[10px] leading-[25px]  tracking-3p pt-[10px]">
                  {item.description}
                </h2>
              </div>

              {index < listItems.length - 1 && (
                <div className="px-[6px] hidden md:block  ">
                  <Image
                    src={icon}
                    objectFit="cover"
                    alt="arrow"
                    width={118}
                    height={5}
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
