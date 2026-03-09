import React from "react";
import Image from "next/image";
export interface IOurWorkingProcessProps {
  heading: string;
  subheading: string;
  arrowicon: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
  }>;
}

export default function OurWorkingProcess({
  heading,
  subheading,
  arrowicon,
  listItems,
}: IOurWorkingProcessProps) {
  return (
    <>
      <div className="max-w-[824px] min-h-[302px] flex flex-col md:items-start items-center rounded-[8px] bg-[#FFFFFF] gap-y-[32px]">
        <div className="flex flex-col gap-y-[8px]">
          <div className="max-w-[219px] min-h-[29px]">
            <h1 className="text-[#000000] font-bold md:text-[20px] text-[16px] md:leading-[28.5px] leading-[22.5px]">
              {heading}
            </h1>
          </div>
          <div className="max-w-[223px] min-h-[23px]">
            <h2 className="text-[#677079] font-regular md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-center">
              {subheading}
            </h2>
          </div>
        </div>
        <div className="max-w-[776px] min-h-[162px] w-full flex items-center justify-center gap-x-[28px] flex-wrap ">
          {listItems.map((item, index) => (
            <React.Fragment key={`item-${item.title}-${item.image}-${index}`}>
              <div className="max-w-[100px] h-[162px] flex flex-col items-center gap-y-[16px] justify-center w-full  sm:w-1/1 md:w-1/2 lg:w-1/4 xl:w-1/4 ">
                <div className="md:w-[100px] md:h-[100px] w-[80px] h-[80px] border-[2px] border-[#3586FF] border-dashed rounded-full flex items-center justify-center">
                  <div className="relative md:w-[60px] w-[50px] h-[50px] md:h-[60px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="max-w-[103px] min-h-[46px]">
                  <h1 className="text-[#41608F] font-medium md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-center">
                    {item.title}
                  </h1>
                </div>
              </div>
              {index < listItems.length - 1 && (
                <div className="  hidden  md:block  ">
                  <Image
                    src={arrowicon}
                    objectFit="cover"
                    alt="arrow"
                    width={64}
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
