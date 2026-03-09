import React from "react";
import Image from "next/image";

export interface ICustomFurnitureProcessprops {
  heading: string;
  arrowicon: string;

  listItems: Array<{
    id: number;
    title: string;
    image: string;
    description: string;
  }>;
}

export default function CustomFurnitureProcess({
  heading,
  arrowicon,
  listItems,
}: ICustomFurnitureProcessprops) {
  return (
    <>
      <div className="md:max-w-[1315px] md:min-h-[433px] max-w-[398px] min-h-[681px] flex flex-col items-center justify-center gap-y-[64px] text-center mx-auto">
        <h1 className="md:max-w-[440px] md:h-[36px] max-w-[352px] h-[29px] font-bold md:text-[25px] text-[20px] md:leading-[35.62px] leading-[28.5px] text-center ">
          {heading}
        </h1>

        <div className="hidden max-w-[1315px] min-h-[333px] md:flex items-center flex-wrap   justify-center text-center mx-auto  lg:gap-x-[14px]  gap-4 ">
          {listItems.map((item, index) => (
            <React.Fragment
              key={`item-${item.image}-${item.title}-${item.description}-${index}`}
            >
              <div className="md:max-w-[209px] md:min-h-[333px] max-w-[398px]  min-h-[131px] flex md:flex-col flex-row items-center justify-center w-full gap-y-[20px] sm:w-1/1 md:w-1/2 lg:w-1/4 xl:w-1/4">
                <div className="flex flex-col items-center gap-y-[16px]">
                  <div className="relative md:w-[180px] md:h-[180px] w-[92px] h-[92px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 92px, 180px"
                    />
                  </div>
                  <h1 className="md:max-w-[159px] md:min-h-[29px] max-w-[125px] min-h-[23px] font-medium md:text-[20px] text-[16px] md:leading-[28.5px] leading-[22.8px]text-left text-[#000000]">
                    {item.title}
                  </h1>
                </div>

                <h2 className="hidden md:block text-center md:max-w-[289px] md:min-h-[84px] max-w-[209px] min-h-[84px] font-regular md:text-[16px] text-[13px] leading-[28px] text-[#3D3D3D]">
                  {item.description}
                </h2>
              </div>

              {index < listItems.length - 1 && (
                <div className="   mb-[13%] flex items-center  ">
                  <div className="relative md:w-[107px] md:h-[20px] w-[42px] h-[10px] ">
                    <Image
                      src={arrowicon}
                      alt="Arrow Icon"
                      fill
                      sizes="(max-width: 768px) 42px, 107px"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
              <p className="block md:hidden text-center md:max-w-[289px] md:min-h-[84px] max-w-[209px] min-h-[84px] font-regular md:text-[16px] text-[13px] leading-[28px] text-[#3D3D3D]">
                {item.description}
              </p>
            </React.Fragment>
          ))}
        </div>
        <div className="md:hidden max-w-full h-full flex flex-col  items-center gap-y-[32px]">
          {listItems.map((item, index) => (
            <React.Fragment
              key={`item-${item.image}-${item.title}-${item.description}-${index}`}
            >
              <div className=" max-w-[398px]  min-h-[131px] flex   items-center justify-center  gap-x-[10px] ">
                <div className="flex flex-col items-center gap-y-[16px] max-w-[125px] min-h-[131px]">
                  <div className="relative  w-[92px] h-[92px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="92px"
                    />
                  </div>
                  <h1 className=" max-w-[125px] min-h-[23px] font-medium md:text-[20px] text-[16px] md:leading-[28.5px] leading-[22.8px] text-left text-[#000000]">
                    {item.title}
                  </h1>
                </div>

                <div className="    flex items-center mt-[10px] ">
                  <div className="relative  w-[42px] h-[10px] ">
                    <Image
                      src={arrowicon}
                      alt="Arrow Icon"
                      fill
                      sizes="42px"
                      className="object-contain"
                    />
                  </div>
                </div>

                <p className="  md:max-w-[289px] md:min-h-[84px] max-w-[209px] min-h-[84px] font-regular md:text-[16px] text-[13px] leading-[28px] text-[#3D3D3D] text-center">
                  {item.description}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
