import Image from "next/image";
import React from "react";

export interface ICommonTheWayWeWorkProps {
  heading: string;
  subHeading: string;
  steps: Array<{
    stepIcon: string;
    stepname: string;
  }>;
}

function CommonTheWayWeWork({
  heading,
  subHeading,
  steps,
}: ICommonTheWayWeWorkProps) {
  return (
    <div>
      <h1 className="px-3 text-center font-medium text-[19px] md:text-[24px] md:leading-[34.2px] mb-4">
        {heading}
      </h1>
      <h2 className="px-3 text-center font-regular text-[16px] md:text-[20px] md:leading-[28.5px] mb-10 md:mb-16">
        {subHeading}
      </h2>
      <div className="flex justify-center items-center md:gap-x-[88px] gap-x-[45px] gap-y-[30px] flex-wrap">
        {steps.map((step, index) => {
          return (
            <div
              key={`${step.stepIcon}-${step.stepname}-${index}`}
              className="flex flex-col items-center gap-y-4"
            >
              <div className="w-[140px] h-[140px] rounded-full border border-[#000000] md:p-[15px] p-[10px] relative">
                <span className="text-xl z-10 absolute top-[50%] right-0 translate-y-[-50%] translate-x-[50%] leading-[28.5px] h-[30px] w-[30px] flex justify-center items-center rounded-full bg-[#3586FF] text-[#FFFFFF]">
                  {index + 1}
                </span>
                <div className="w-full h-full flex items-center justify-center rounded-full bg-[#E2ECFA] ">
                  <Image src={step.stepIcon} alt="" width={40} height={40} />
                </div>
              </div>
              <span className="md:text-[20px] text-[16px] md:leading-[28.5px] leading-[22.8px] text-[#000000]">
                {step.stepname}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommonTheWayWeWork;
