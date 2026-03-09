import React from "react";
import Image from 'next/image'
export interface ChooseServicesProps {
  heading: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
  }>;
}

export default function ChooseServices({
  heading,
  listItems,
}: ChooseServicesProps) {
  return (
    <>
      <div className="max-w-[1391px]  w-full min-h-[474px]  px-10 py-8 rounded-[8px] flex flex-col gap-y-[32px] mx-auto bg-[#EDF4FF]">
        <div className="max-w-[320px] min-h-[29px] "><h2 className="text-[#000000] font-medium text-[20px] leading-[28.5px] text-center">{heading}</h2></div>
        <div className="flex items-center md:justify-start justify-center gap-x-[48px] gap-y-[48px] flex-wrap mx-auto ">
            {listItems.map((item,index)=>{
                return(
                    <div className="max-w-[100px] min-h-[131px] flex flex-col items-center gap-y-[6px] rounded-[4px] xl:w-1/9 lg:w-1/9 md:w-1/6 sm:w-1/4 ">
                        
                        <div className="relative w-[100px] h-[100px] rounded-[4px] ">
                            <Image src={item.image} alt={item.title} fill className="object-cover"/> 
                        </div>
                        <div className=" w-[128px]  min-h-[46px] ">  <h1 className="text-[#000000] font-medium text-[16px] leading-[22.8px] text-center w-full">{item.title}</h1></div>

                    </div>
                )
            })}
        </div>
      </div>
    </>
  );
}
