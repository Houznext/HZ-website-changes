import React from "react";
import Image from "next/image";
import Button from "@/common/Button";
export interface BookNowProps {
  listItems: Array<{
    id: number;
    name: string;
    description: string;
    image: string;
  }>;
}

export default function BookNowSection({ listItems }: BookNowProps) {
  return (
    <>
      <div className="max-w-[1392px] w-full min-h-[272px] flex flex-wrap lg:flex-nowrap justify-center items-center gap-x-[30px] gap-y-[20px] mx-auto rounded-[8px]">
        {listItems.map((item, index) => {
          return (
            <div
              className={`xl:w-1/3 lg:w-1/3 md:w-1/1 sm:w-1/1  rounded-[8px] w-full md:max-w-[451px] min-h-[272px]  max-w-[390px] flex items-center gap-x-[10px] ${
                index % 2 === 0
                  ? "bg-gradient-to-r from-[#5192EF] to-[#3586FF]"
                  : "bg-[#ABCDFF]"
              }`}
            >
              <div className="flex flex-col  gap-y-[40px] px-5 mb-[30px]">
                <div
                  className={`flex flex-col  gap-y-[8px] ${
                    index % 2 === 0 ? "text-[#FFFFFF]" : "text-[#212227]"
                  }`}
                >
                  <div className="mb-[10px]">
                    <h1 className="font-medium text-[25px] leading-[35.62px] italic ">
                      {item.name}
                    </h1>
                  </div>
                  <div className=" w-full max-w-[232px] min-h-[58px]">
                    <h2 className="font-regular text-[20px] leading-[28.5px] ">
                      {item.description}
                    </h2>
                  </div>
                </div>
                <div className="max-w-[137px] min-h-[42px] relative cursor-pointer">
                  <Button
                    className={`max-w-[132px] min-h-[38px] px-[24px]  py-[12px] text-[12px] font-Lato-Bold leading-[14.4px] tracking-[0.16em] ${
                      index % 2 === 0
                        ? "bg-[#FFFFFF] text-[#3E8AFB]"
                        : "bg-[#3E8AFB] text-[#FFFFFF]"
                    }`}
                  >
                    Book now
                  </Button>
                  <div
                    className={` max-w-[121px] min-h-[38px] w-full h-full border-[1px] border-solid  absolute top-1 left-1 ${
                      index % 2 === 0 ? "border-[#FFFFFF]" : "border-[#3E8AFB]"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="relative w-[385px] h-[343px] rounded-[8px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-[8px]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
