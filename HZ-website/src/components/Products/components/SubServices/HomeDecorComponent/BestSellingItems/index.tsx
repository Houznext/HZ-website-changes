import React, { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
export interface IBestSellingItemsprops {
  heading: string;
  listItems: Array<{
    id: number;
    image: string;
    title: string;
    subtitle: string;
  }>;
}

export default function BestSellingItems({
  heading,
  listItems,
}: IBestSellingItemsprops) {
  const sliderRef = useRef<any>(null);
  const gotoNext = () => {
    sliderRef.current?.slickNext();
  };
  const gotoPrev = () => {
    sliderRef.current?.slickPrev();
  };
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: true,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    },

    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "41px" : "12px",
          height: "12px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          transition: "all 0.3s ease-in-out",
          margin: "-10px 4px",
          display: "inline-block",
        }}
      />
    ),

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
         
        },
      },
    ],
  };
  return (
    <>
      <div className="md:max-w-[1392px] max-w-[375px] min-h-[364px] flex flex-col items-center mx-auto gap-y-[40px]">
        <div className="max-w-[490px] min-h-[36px] ">
          <h1 className="font-bold text-[#212227] text-[25px] leading-[35.62px] text-center">
            {heading}
          </h1>
        </div>
        <div className="hidden md:flex flex-wrap items-center mx-auto gap-x-[19px] gap-y-[20px] max-w-[1392px] min-h-[288px]">
          {listItems.map((item, index) => {
            return (
              <div key={item.title ?? index} className="max-w-[451px] min-h-[288px] w-full rounded-[8px] bg-black bg-opacity-30 z-10  relative overflow-hidden">
                <div className="relative w-[451px] h-[288px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="absolute top-0 left-0 w-full h-full z-0 object-cover"
                    unoptimized
                  />
                </div>

                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>

                <div className="absolute inset-0 flex flex-col justify-end items-start p-4 gap-y-[8px] z-20">
                  <div className="flex flex-col items-start gap-y-[2px]">
                    <div className="max-w-[233px] min-h-[29px]">
                      {" "}
                      <h1 className="text-[#F9F9F9] font-bold text-[20px] leading-[28.5px]">
                        {item.title}
                      </h1>
                    </div>
                    <div className="max-w-[86px] min-h-[23px]">
                      <h2 className="text-[#F9F9F9] font-medium text-[16px] leading-[22.8px]">
                        {item.subtitle}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-col items-start max-w-[133px] h-[42px]  relative cursor-pointer ">
                    <Button className="max-w-[129px] min-h-[38px] px-[24px] py-[12px]  font-Lato text-[12px] font-[700] leading-[14.4px] tracking-[.16em] bg-[#3E8AFB] flex items-center justify-center z-10 relative  text-[#F9F9F9] hover:scale-105">
                      Shop Now
                    </Button>
                    <div className="w-[129px] h-[38px] border border-[#F9F9F9] absolute top-1 left-0 "></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="block md:hidden max-w-[370px] relative w-full min-h-[243px]">
          <Slider ref={sliderRef} {...sliderSettings}>
            {listItems.map((item, index) => {
              return (
                <div key={item.title ?? index} className="max-w-[350px] min-h-[243px] w-full rounded-[8px] bg-black bg-opacity-30 z-10  relative overflow-hidden ml-2">
                  <div className="relative w-[350px] h-[260px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="absolute top-0 left-0 w-full h-full z-0 object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>

                  <div className="absolute inset-0 flex flex-col justify-end items-start p-4 gap-y-[8px] z-20">
                    <div className="flex flex-col items-start gap-y-[2px]">
                      <div className="max-w-[233px] min-h-[29px]">
                        {" "}
                        <h1 className="text-[#F9F9F9] font-bold text-[20px] leading-[28.5px]">
                          {item.title}
                        </h1>
                      </div>
                      <div className="max-w-[86px] min-h-[23px]">
                        <h2 className="text-[#F9F9F9] font-medium text-[16px] leading-[22.8px]">
                          {item.subtitle}
                        </h2>
                      </div>
                    </div>
                    <div className="flex flex-col items-start max-w-[133px] h-[42px]  relative cursor-pointer ">
                      <Button className="max-w-[129px] min-h-[38px] px-[24px] py-[12px]  font-Lato text-[12px] font-[700] leading-[14.4px] tracking-[.16em] bg-[#3E8AFB] flex items-center justify-center z-10 relative  text-[#F9F9F9]hover:scale-105 transform duration-300">
                        Shop Now
                      </Button>
                      <div className="w-[129px] h-[38px] border border-[#F9F9F9] absolute top-1 left-0 "></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
    </>
  );
}
