import React from "react";
import Image from "next/image";
export interface IWhyChooseUSprops {
  heading: string;
  subheading: string;
  bgurl: string;
  listItems: Array<{
    id: number;
    title: string;
    description: string;
    iconurl: string;
  }>;
  images: Array<{
    id: number;
    image: string;
    radius: string;
  }>;
  listitems: Array<{
    id: number;
    number: string;
    title: string;
    iconurl: string;
  }>;
}

export default function WhyChooseUs({
  heading,
  subheading,
  bgurl,
  listItems,
  listitems,
  images,
}: IWhyChooseUSprops) {
  const midIndex = Math.ceil(listItems.length / 2);
  const firstHalf = listItems.slice(0, midIndex);
  const secondHalf = listItems.slice(midIndex);

  return (
    <>
      <div className="max-w-[1440px] min-h-[661px] flex flex-col items-center mx-auto gap-y-[48px]">
        <div className="flex flex-col items-center gap-y-[8px]">
          <div className="max-w-[196px] min-h-[34px]">
            <h1 className="text-[#3E6196] text-left font-bold text-[24px] leading-[34.2px]">
              {heading}
            </h1>
          </div>
          <div className="max-w-[326px] min-h-[23px]">
            <h2 className="text-[#1C2436] text-left font-regular text-[16px] leading-[22.8px]">
              {subheading}
            </h2>
          </div>
        </div>
        <div className="flex flex-col items-center max-w-[1440px] w-full">
          <div className="w-full min-h-[410px] flex flex-col items-center  bg-[#CFE2FF] mx-auto px-[80px] ">
            <div className="flex items-center flex-wrap gap-x-[48px] pt-[48px] gap-y-[48px]">
              <div className="flex flex-col items-center gap-y-[40px]">
                {firstHalf.map((item, index) => {
                  return (
                    <div className="flex items-start max-w-[353px] min-h-[129px] gap-x-[16px]">
                      <div className="relative w-[52px] h-[52px]">
                        <Image
                          src={item.iconurl}
                          alt={item.title}
                          objectFit="cover"
                          layout="fill"
                        />
                      </div>
                      <div className="flex flex-col items-start max-w-[285px] min-h-[129px]">
                        <div className="max-w-[257px] min-h-[29px]">
                          <h1 className="text-[#212227] text-left font-medium text-[20px] leading-[28.5px]">
                            {item.title}
                          </h1>
                        </div>
                        <div className="max-w-[285px] min-h-[84px]">
                          <h1 className="text-[#4B4C4F] text-left font-regular text-[16px] leading-[28px] tracking-2p">
                            {item.description}
                          </h1>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-2   max-w-[344px] min-h-[238px]">
                {images.map((item, index) => {
                  return (
                    <div
                      className={`relative w-[168px] h-[115px] overflow-hidden rounded-${item.radius} `}
                    >
                      <Image
                        src={item.image}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-y-[40px]">
                {secondHalf.map((item, index) => {
                  return (
                    <div className="flex items-start max-w-[353px] min-h-[129px] gap-x-[16px]">
                      <div className="relative w-[52px] h-[52px]">
                        <Image
                          src={item.iconurl}
                          alt={item.title}
                          objectFit="cover"
                          layout="fill"
                        />
                      </div>
                      <div className="flex flex-col items-start max-w-[285px] min-h-[129px]">
                        <div className="max-w-[257px] min-h-[29px]">
                          <h1 className="text-[#212227] text-left font-medium text-[20px] leading-[28.5px]">
                            {item.title}
                          </h1>
                        </div>
                        <div className="max-w-[285px] min-h-[84px]">
                          <h1 className="text-[#4B4C4F] text-left font-regular text-[16px] leading-[28px] tracking-2p">
                            {item.description}
                          </h1>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="max-w-[1440px] w-full min-h-[138px] flex items-center justify-center relative bg-black bg-opacity-[0.50] mx-auto  ">
            <Image
              src={bgurl}
              layout="fill"
              alt=""
              objectFit="cover"
              className="absolute z-0"
            />
            <div className="relative z-10 w-full min-h-[58px] flex flex-wrap items-center flex-col lg:flex-row justify-center   gap-x-[9px] gap-y-4 mx-auto ml-[30px] ">
              {listitems.map((item, index) => (
                <React.Fragment
                  key={`item-${item.iconurl}-${item.title}-${item.number}-${index}`}
                >
                  <div className=" sm:w-full md:w-1/2 lg:w-1/4 flex items-center justify-center gap-x-3 min-h-[58px] max-w-[336px] flex-1">
                    <div className="relative w-[40px] h-[40px] ">
                      <Image
                        src={item.iconurl}
                        alt={item.title}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-y-[3px] max-w-[106px] min-h-[58px]">
                      <div className="max-w-[64px] min-h-[34px]">
                        <h1 className="text-left text-[#FFFFFF] font-bold text-[24px] leading-[34.2px]">
                          {item.number}
                        </h1>
                      </div>
                      <div className="w-auto md:w-[288px] min-h-[23px]">
                        <h1 className="text-[#FFFFFF] font-medium text-[16px] text-left leading-[22.8px]">
                          {item.title}
                        </h1>
                      </div>
                    </div>
                  </div>
                  {index < listitems.length - 1 && (
                    <div className="hidden lg:block w-[58px] border-[1px] border-[#E7E5E5] rotate-90 mx-2 "></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
