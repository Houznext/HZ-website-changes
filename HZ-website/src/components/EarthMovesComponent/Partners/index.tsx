import React from "react";
import Image from "next/image";
export interface IPartnersprops {
  heading: string;
  subheading: string;
  image: string;
}

export default function Partners({
  heading,
  subheading,
  image,
}: IPartnersprops) {
  return (
    <>
      <div className="max-w-[798px] min-h-[433px] flex flex-col items-center mx-auto gap-y-[48px] ">
        <div className="flex flex-col items-center gap-y-[8px]">
          <div className="max-w-[104.93px] min-h-[34px]">
            <h1 className="text-[#3E6196] text-left font-bold text-[24px] leading-[34.2px]">
              {heading}
            </h1>
          </div>
          <div className="max-w-[160.9px] min-h-[23px]">
            <h2 className="text-[#1C2436] text-center font-regular text-[16px] leading-[22.8px]">
              {subheading}
            </h2>
          </div>
        </div>
        <div className="relative w-full max-w-[798px] h-[320px]   ">
          <Image src={image} alt="" layout="fill" objectFit="contain" />
        </div>
      </div>
    </>
  );
}
