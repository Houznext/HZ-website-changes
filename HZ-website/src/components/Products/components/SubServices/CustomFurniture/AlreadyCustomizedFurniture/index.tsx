import React from "react";
import Image from "next/image";
export interface IAlreadyCustomizedFurnitureprops {
  heading: string;
  listItems: Array<{
    id: number;
    image: string;
    width: number;
  }>;
}

export default function AlreadyCustomizedFurniture({
  heading,
  listItems,
}: IAlreadyCustomizedFurnitureprops) {
  return (
    <>
      <div className="flex flex-col items-center pt-[5%] gap-y-[64px] ">
        <div className="  text-center mb-8 ">
          <h1 className=" text-[#000000] w-[373px] h-[36px] font-medium md:text-[25px] text-[20px] md:leading-[35.62px] leading-[28.5px]">
            {heading}
          </h1>
        </div>
        <div className="  mx-auto flex flex-wrap  items-center justify-center md:gap-x-[20px]  md:gap-y-[34px] gap-x-[7px] gap-y-[24px] ">
          {listItems.map((card, index) => {
            return (
              <div
                key={`item-${card.image}-${index}`}
                className=" md:w-1/2 sm:w-1/3   lg:w-1/3 xl:w-1/4 md:max-w-full flex flex-col   items-center"
              >
                <Image
                  src={card.image}
                  alt="customized"
                  className="object-cover md:w-[451px] md:h-[251px] w-[128px] h-[75px] rounded-[8px] cursor-pointer"
                  width={451}
                  height={251}
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
