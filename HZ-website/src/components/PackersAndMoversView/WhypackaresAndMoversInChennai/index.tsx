import React from "react";
import Image from "next/image";
export interface IWhyPackersAndMoversProps {
  heading: string;
  arrowicon: string;
  listItems: Array<{
    id: number;
    image: string;
    title: string;
    description: string;
  }>;
}

export default function WhyPackersAndMoversInChennai({
  heading,
  arrowicon,
  listItems,
}: IWhyPackersAndMoversProps) {
  return (
    <>
      <div className="flex flex-col md:items-start items-center max-w-[824px] min-h-[601px] bg-[#FFFFFF] rounded-[8px] gap-y-[32px]">
        <div className="max-w-[510px] min-h-[29px] md:text-left text-center">
          <h1 className="text-[#000000] font-bold md:text-[20px] text-[16px] leading-[22.5px] md:leading-[28.5px]">
            {heading}
          </h1>
        </div>
        <div className="flex flex-col items-start gap-y-[8px]">
          {listItems.map((item, index) => (
            <React.Fragment
              key={`item-${item.title}-${item.image}-${item.description}-${index}`}
            >
              <div className="flex items-center gap-x-[16px] max-w-[547px] min-h-[60px]">
                <div className="md:w-[60px] md:h-[60px] w-[50px] h-[50px] bg-[#D4E5FE] rounded-full flex items-center justify-center">
                  <div className="relative md:w-[30px] w-[20px] h-[20px] md:h-[30px]">
                    <Image
                      src={item.image}
                      alt=""
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start gap-y-[4px]">
                  <div className="max-w-[198px] min-h-[23px]">
                    <h1 className="text-[#41608F] font-bold md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px]">
                      {item.title}
                    </h1>
                  </div>
                  <div className="max-w-[471px] min-h-[23px]">
                    <h2 className="text-[#000000] font-regular text-[13px] md:leading-[23px] text-center leading-[18.52px]">
                      {item.description}
                    </h2>
                  </div>
                </div>
              </div>
              {index < listItems.length - 1 && (
                <div className="  md:ml-[25px] ml-[15px] ">
                  <Image
                    src={arrowicon}
                    objectFit="cover"
                    alt="arrow"
                    width={12}
                    height={32}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
