import React from "react";
import Image from "next/image";
import { LuStar } from "react-icons/lu";
import Link from "next/link";
import Button from "@/common/Button";
export interface ServicesSectionProps {
  sections: Array<{
    heading: string;
    btntext: string;
    btn1: string;
    btn2: string;
    listitems: Array<{
      id: number;
      heading: string;
      time: string;
      price: string;
      cancelprice: string;
      rating: string;
      save: string;
      image: string;
    }>;
  }>;
  cartsection: Array<{
    image: string;
    text: string;
    dataItems: Array<{
      id: number;
      icon: string;
      title: string;
      description: string;
    }>;
  }>;
}

export default function ServicesSection({
  sections,
  cartsection,
}: ServicesSectionProps) {
  return (
    <>
      <div className="flex  gap-x-[35px] mx-auto md:px-10 px-3">
        <div className="flex flex-col items-center gap-y-[48px]">
          {sections.map((section, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-[30px] md:max-w-[921px]  max-w-[380px] w-full"
            >
              <div className="max-w-[186px] min-h-[34px]">
                <h1 className="text-[#000000]  text-[24px] leading-[34.2px] font-bold ">
                  {section.heading}
                </h1>
              </div>
              <div className="flex flex-col items-center gap-y-[20px] w-full min-h-[304px]">
                {section.listitems.map((item, index) => {
                  return (
                    <div className="flex items-center md:flex-row flex-col-reverse gap-y-[10px] justify-between px-6 py-6  w-full  border-[1px] border-[#C3C3C3] rounded-[8px] bg-[#FFFFFF] shadow-custom">
                      <div className="flex flex-col gap-y-[16px] px-3">
                        <div className="flex items-center gap-x-[16px] max-w-[413px] min-h-[29px]">
                          <div className="max-w-[326px] min-h-[29px]">
                            <h2 className="text-[#000000] text-center  text-[20px] font-medium leading-[28.5px]">
                              {item.heading}
                            </h2>
                          </div>
                          <div className="max-w-[71px] min-h-[19px]">
                            <h1 className="text-[#000000] text-center  text-[13px] font-regular leading-[18.52px]">
                              ({item.time})
                            </h1>
                          </div>
                        </div>
                        <div className="w-[347px] border-[1px] border-[#DEDEDE]"></div>
                        <div className="flex flex-col gap-y-[12px]">
                          <div className="flex items-center gap-x-[16px]">
                            <div className=" max-w-[123px] min-h-[23px] text-[16px] leading-[22.8px] text-center gap-2">
                              <span className="font-regular text-[#000000]">
                                Price:
                              </span>
                              <span className="font-medium text-green-500">
                                {item.price}
                              </span>
                            </div>
                            <div className="max-w-[47px] min-[23px] flex items-center gap-1">
                              <span>
                                <LuStar
                                  className="text-[16px] text-[#F8B84E] "
                                  style={{
                                    fill: "#F8B84E",
                                  }}
                                />
                              </span>
                              <span className="text-[#4B4B4B]  max-w-[27px] min-[23px] text-center  text-[16px] font-medium leading-[22.8px]">
                                {item.rating}
                              </span>
                            </div>
                          </div>
                          <div className="max-w-[75px] min-[23px]">
                            <h1 className="text-[#FE2323]  text-[16px] leading-[22.8px] font-regular line-through text-center">
                              {item.cancelprice}
                            </h1>
                          </div>
                          <div className="max-w-[158px] min-[23px] text-centertext-[16px] leading-[22.8px]">
                            <span className="font-regular text-[#000000]">
                              (You save 
                            </span>{" "}
                            <span className="font-medium text-[#000000]">
                              {item.save})
                            </span>
                          </div>
                          <div className="max-w-[101px] min-[23px]">
                            <Link
                              href=""
                              className="text-[#3586FF] text-center  text-[16px] font-medium leading-[22.8px]"
                            >
                              {section.btntext}
                            </Link>
                          </div>
                          <div className="w-full flex items-center gap-x-[24px] mx-auto">
                            <Button className=" border-[1px] rounded-[8px] border-[#3586FF]  px-8 py-3 text-[#000000] text-center bg-[#FFFFFF]  text-[16px] font-medium leading-[22.8px]">
                              {section.btn1}
                            </Button>
                            <Button className=" border-[1px] rounded-[8px] border-[#3586FF]  px-8 py-3 text-[#FFFFFF] text-center bg-[#3586FF]  text-[16px] font-medium leading-[22.8px]">
                              {section.btn2}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="relative md:w-[426px] w-[360px] h-[256px] rounded-[8px]">
                        <Image
                          src={item.image}
                          alt={item.heading}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="md:flex hidden max-w-[451px]  right-16 w-full flex-col items-center gap-y-[24px] pt-[60px]">
          {cartsection.map((section, index) => (
            <>
              <div className="w-full min-h-[187px] flex items-center justify-center border-[1px] border-[#C3C3C3] rounded-[8px] shadow-custom">
                <div className="flex flex-col items-center gap-y-[4px]">
                  <div className="relative w-[100px] h-[100px]">
                    <Image
                      src={section.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="max-w-[175px] min-h-[23px]">
                    <h1 className="text-[#555555]  text-[16px] leading-[22.8px] font-regular text-center">
                      {section.text}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="w-full min-h-[258px] flex flex-col gap-y-[24px] border-[1px] border-[#C3C3C3] rounded-[8px] px-8 py-4 shadow-custom">
                {section.dataItems.map((item, index) => (
                  <div className="flex items-center gap-x-[16px] max-w-[263px] min-h-[54px] rounded-[8px]">
                    <div className="relative w-[54px] h-[54px] rounded-[8px] bg-[#D5D5D533]">
                      <Image
                        src={item.icon}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-y-[2px]">
                      <h1 className="text-[#000000]    text-[16px] font-medium leading-[22.8px]">
                        {item.title}
                      </h1>
                      <h1 className="text-[#9C9C9C]    text-[16px] font-regular leading-[22.8px]">
                        {item.description}
                      </h1>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
