import React from "react";
import Image from "next/image";
export interface IServicesBetterThanOthersProps {
  heading: string;
  title1: string;
  title2: string;
  closeIcon: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
  }>;
  otherslistItems: Array<{
    id: number;
    title: string;
  }>;
}

export default function ServicesBetterThanOthers({
  heading,
  title1,
  title2,
  listItems,
  otherslistItems,
  closeIcon,
}: IServicesBetterThanOthersProps) {
  return (
    <>
      <div className="max-w-[824px] min-h-[537px] flex flex-col gap-y-[32px]">
        <div className="max-w-[451px] min-h-[29px] md:text-left text-center">
          <h1 className="text-[#000000] font-bold md:text-[20px] text-[16px] leading-[22.5px] md:leading-[28.5px]">
            {heading}
          </h1>
        </div>
        <div className="max-w-[776px] min-h-[428px] flex items-center justify-center flex-wrap gap-x-[66px] gap-y-[60px] w-full">
          <div className="flex flex-col items-center gap-y-[47px]">
            <div className="max-w-[115px] min-h-[29px]">
              <h1 className="text-[#3586FF] font-bold md:text-[20px] text-[16px] leading-[22.5px] md:leading-[28.5px]">
                {title1}
              </h1>
            </div>
            <div className="max-w-[309px] min-h-[352px] flex flex-col items-start gap-y-[48px]">
              {listItems.map((item, index) => {
                return (
                  <div className="max-w-[309px] min-h-[32px] flex items-center gap-x-[16px]" key={index} >
                    <div className="relative md:w-[32px] w-[22px] md:h-[32px] h-[22px]">
                      <Image
                        src={item.image}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="max-w-[261px] min-h-[23px]">
                      <h1 className="text-[#3586FF] font-medium md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-nowrap">
                        {item.title}
                      </h1>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center mt-[90px] ">
            <div className="w-[0.5px] border-[1px] border-[#DDDDDD] h-[352px] "></div>
          </div>
          <div className="flex flex-col items-center gap-y-[47px]">
            <div className="max-w-[70px] min-h-[29px]">
              <h2 className="text-[#7B7C83] font-bold md:text-[20px] text-[16px] leading-[22.5px] md:leading-[28.5px]">
                {title2}
              </h2>
            </div>
            <div className="max-w-[309px] min-h-[352px] flex flex-col items-start gap-y-[48px]">
              {otherslistItems.map((item, index) => {
                return (
                  <div className="max-w-[309px] min-h-[32px] flex items-center gap-x-[16px]" key={index}  >
                    <div className="relative md:w-[32px] w-[22px] md:h-[32px] h-[22px]">
                      <Image
                        src={closeIcon}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="max-w-[287px] min-h-[23px]">
                      <h1 className="text-[#7B7C83] font-regular md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-nowrap">
                        {item.title}
                      </h1>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
