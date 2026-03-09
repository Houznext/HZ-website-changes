import React from "react";
import Image from "next/image";
export interface IFurnitureCustomizationprops {
  heading: string;
  subheading: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
    width: string;
  }>;
}

export default function FurnitureCustomization({
  heading,
  subheading,
  listItems,
}: IFurnitureCustomizationprops) {
  return (
    <>
      <div className=" w-full md:max-w-[1292px] max-w-[398px]  mx-auto">
        {" "}
        {/* Adjusted margin for better spacing */}
        <div className="  flex flex-col items-center  gap-y-[16px] sm:mt-[0px] mb-7">
          <h1 className="md:min-h-[36px] min-h-[23px] font-medium md:text-[25px] text-[20px] text-center  md:leading-[35.62px] leading-[28.5px] text-[#000000] ">
            {heading}
          </h1>

          <h2 className="font-regular text-[16px]  md:leading-[30px] leading-[35px] text-center text-[#7B7C83]">
            {subheading}
          </h2>
        </div>
        <div className="mx-auto max-w-[1076px] min-h-[565] mt-[64px]">
          <div className="rounded-[8px] bg-[#F9F9F9] flex flex-wrap items-center justify-center gap-y-[39px]">
            {listItems.map((item, index) => (
              <div
                key={`item-${item.image}-${item.title}-${index}`}
                className="md:max-w-full w-[96px] sm:w-1/2 md:w-1/3 lg:w-1/4 p-4 flex flex-col items-center gap-y-[16px]"
              >
                <Image
                  src={item.image}
                  width={215}
                  height={178}
                  alt={item.title}
                  className="object-cover"
                />
                <h1
                  className={` ${item.width} h-[19px] font-medium text-[13px] text-center leading-[18.52px] text-[#5F5F5F]`}
                >
                  {item.title}
                </h1>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
