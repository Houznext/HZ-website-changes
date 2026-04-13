import React from "react";
import Image from "next/image";
export interface IReferringusProps {
  heading: string;
  image: string;

  listItems: Array<{
    id: number;
    title: string;
    description: string;
    iconurl: string;
  }>;
}

export default function RefferingUs({
  heading,
  image,
  listItems,
}: IReferringusProps) {
  return (
    <>
      <div className="flex flex-col md:gap-20 items-center gap-y-[10px] mx-auto px-5">
        <h1 className=" text-[#000000] text-left font-bold md:text-[25px] text-[18px] leading-[34.2px]">
          {heading}
        </h1>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-8 px-1">
          <div className="relative w-full md:block hidden">
            <div className="relative h-full w-[450px]">
              <Image
                src={image}
                alt="referus"
                fill
                className="object-cover md:rounded-[10px] rounded-[4px]"
              />
            </div>
          </div>
          <div className="w-full flex flex-col items-start  mx-auto  gap-y-[8px] text-center md:mx-auto gap-x-[8px]">
            {listItems.map((item, index) => (
              <div key={index}>
                <div className="relative max-w-[390px] min-h-[90px] bg-white rounded-lg shadow-lg flex items-center px-6 py-2 gap-5 border-l-4 border-[#e7d534] border-1 ">
                  <div className="relative w-[40px] h-[40px]">
                    <Image
                      src={item.iconurl}
                      alt="icon"
                      className="object-cover"
                      fill
                      priority
                    />
                  </div>

                  <div className="flex flex-col items-start gap-y-1">
                    <h1 className="font-medium text-gray-900 md:text-[18px] text-[14px] leading-5">
                      {item.title}
                    </h1>
                    <h2 className="font-regular text-start text-gray-600 md:text-[14px] text-[12px] leading-4">
                      {item.description}
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
