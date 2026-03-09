import React from "react";
import Image from "next/image";
export interface IReferStepProps {
  heading: string;

  listItems: Array<{
    id: number;
    title: string;
    description: string;
    iconurl: string;
  }>;
}

export default function Refersteps({ heading, listItems }: IReferStepProps) {
  return (
    <>
      <div className="flex flex-col md:gap-20  items-center gap-y-[12px] mx-auto px-5">
        <h1 className=" text-[#000000] text-left font-bold md:text-[25px] text-[18px] leading-[34.2px]">
          {heading}
        </h1>
        <div className="w-full grid md:grid-cols-4 grid-cols-1  mx-auto  gap-y-[10px] text-center md:mx-auto gap-x-[8px]">
          {listItems.map((item, index) => (
            <div key={index}>
              <div className="relative max-w-[320px] min-h-[90px] bg-white rounded-lg shadow-lg flex items-center px-6 gap-5 border-l-4 border-blue-400 border-1 ">
                <div className="w-[60px] h-[60px] bg-blue-100 rounded-full px-2 flex items-center ">
                  <div className="relative w-[35px] h-[35px]">
                    <Image
                      src={item.iconurl}
                      alt="icon"
                      className="object-cover"
                      fill
                      priority
                    />
                  </div>
                </div>

                <div className="flex flex-col items-start gap-y-1">
                  <h1 className="font-bold text-gray-900 text-[16px] leading-5">
                    {item.title}
                  </h1>
                  <h2 className="font-regular text-start text-gray-600 text-[12px] leading-4">
                    {item.description}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
