import Image from "next/image";
import Button from "@/common/Button";
import React, { useRef, useState } from "react";

export const NewlyLaunch = ({ data }: any) => {
  return (
    <>
      <div className="flex relative overflow-x-auto shadow-custom md:flex-row flex-col md:gap-9 gap-3 max-w-full md:max-w-[1200px]  w-full md:min-w-[690px]  rounded-[8px] ">
        <div className="relative h-[164px] md:w-[200px] w-full md:px-0 px-2 md:py-0 py-2">
          <Image
            src={data.imageSrc}
            alt=""
            objectFit="cover"
            layout="fill"
            className="rounded-[8px]"
          />
        </div>
        <div className="flex flex-row md:p-[16px] p-4 justify-between w-full">
          <div className="flex flex-col md:gap-7 gap-4">
            <div>
              <p className="font-medium text-[20px] leading-7">
                {data.title}
              </p>
              <p className="font-regular text-[16px] leading-6 text-[#212227]">
                {data.location}
              </p>
            </div>
            <div className="md:max-w-[154px] max-w-[100px]">
              <p className="font-regular text-[16px] leading-6 text-[#7B7C83]">
                {data.description}
                <span className="font-medium text-[16px] leading-7 text-black">
                  {data.price.slice(0, 8)}
                </span>
                {"   "} onwords
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <p className="max-w-[100px] h-[50px] self-end">{data.marketedBy}</p>
            <Button className="bg-[#3586FF] py-[11px] px-[24px] rounded-[6px] text-white font-bold">
              Contact Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
