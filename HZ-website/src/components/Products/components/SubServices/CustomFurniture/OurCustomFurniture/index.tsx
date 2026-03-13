import React from "react";
import Image from "next/image";
export interface IOurCustomFurnitureprops {
  heading: string;
  listItems: Array<{
    image: string;
    id: number;
  }>;
  dataItems: Array<{
    id: number;
    title: string;
    image: string;
    price: string;
    price2: string;
    priceimage: string;
  }>;
}

export default function OurCustomFurniture({
  heading,
  listItems,
  dataItems,
}: IOurCustomFurnitureprops) {
  return (
    <>
      <div className="w-full md:max-w-[1392px] md:min-h-[417px] mx-auto flex flex-col items-center max-w-[430px] min-h-[742px]   ">
        <div className="text-center mb-8 ml-4">
          <h1 className="md:max-w-[510px] md:h-[36px] max-w-[398px] min-h-[58px] mx-auto text-center font-medium md:text-[25px] text-[20px] md:leading-[35.62px]  leading-[28.5px] text-[#000000] ">
            {heading}
          </h1>
        </div>
        <div className="hidden md:flex  items-center  justify-center flex-wrap gap-[15px] mt-[4%] ">
          {listItems.map((item, index) => {
            return (
              <div key={item.id} className="sm:p-2 md:p-0">
                <Image
                  src={item.image}
                  width={686}
                  height={317}
                  alt="customfurniture"
                  className="sm:px-[3%] md:px-0 object-cover"
                />
              </div>
            );
          })}
        </div>
        <div className=" md:hidden flex flex-col items-center gap-y-[32px] ">
          <div className="max-w-[430px] h-[111px] border-[1px] border-[#3586FF] border-b-transparent border-r-transparent flex flex-col items-center justify-center border-l-transparent ">
            <div className="max-w-[430px] w-full h-[88px] bg-[#3586FF] flex items-center gap-x-[32px] justify-center px-10">
              <div className="max-w-[147px] min-h-[23px]">
                <h1 className="text-[#FFFFFF] font-medium text-[16px] leading-[22.8px]">
                  Houznext Model
                </h1>
              </div>
              <div className="max-w-[27px] min-h-[34px]">
                <h2 className="text-[#FFFFFF] font-bold text-[24px] leading-[34.2px]">
                  vs
                </h2>
              </div>
              <div className="max-w-[114px] min-h-[23px]">
                <h1 className="text-[#373333] font-medium text-[16px] leading-[22.8px]">
                  Market Model
                </h1>
              </div>
            </div>
            <div className="w-0 h-0 border-l-[42px] border-r-[42px] border-b-[47px] border-transparent border-b-[#3586FF] rotate-180 ml-[12px]"></div>
          </div>
          <div className="max-w-[378px] min-h-[506px] flex flex-col items-center justify-center gap-y-[50px] ">
            {dataItems.map((item, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-center gap-x-[86px] gap-y-[42px] mx-auto max-w-full"
                >
                  <div className="flex flex-col items-center gap-y-[8px]">
                    <div className="relative w-[64px] h-[64px]">
                      <Image
                        src={item.image}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 64px, 64px"
                        alt={item.title}
                      />
                    </div>
                    <div className="max-w-[110px] min-h-[23px]">
                      <h1 className="font-regular text-[#000000] text-[16px] leading-[22.8px]">
                        {item.title}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {item.price ? (
                      <div className="max-w-[45px] min-h-[23px]">
                        <h1 className="text-[#3586FF] font-medium text-[16px] leading-[22.8px]">
                          {item.price}
                        </h1>
                      </div>
                    ) : (
                      item.priceimage && (
                        <div className="relative w-[54px] h-[54px] ml-[10px]">
                          <Image
                            src={item.priceimage}
                            fill
                            alt=""
                            sizes="(max-width: 768px) 54px, 54px"
                            className="object-contain"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <div className="max-w-[55px] min-h-[23px]">
                    <h1 className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                      {item.price2}
                    </h1>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
