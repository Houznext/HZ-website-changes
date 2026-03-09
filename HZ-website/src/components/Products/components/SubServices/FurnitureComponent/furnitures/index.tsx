import React, { useRef, useState } from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
export interface IFurnitureProps {
  heading: string;
  subheading: string;
  imagebgcolor: string;
  bgColor: string;
  borderColor: string;
  listitems: Array<{
    id: number;
    image: string;
    title: string;
    price: string;
  }>;
}
export default function Furniture({
  heading,
  subheading,
  bgColor,
  imagebgcolor,
  listitems,
  borderColor,
}: IFurnitureProps) {
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
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,

    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "41px" : "12px",
          height: "12px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          transition: "all 0.3s ease-in-out",
          margin: "-25px 4px",
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
          slidesToShow: 2,
        },
      },
    ],
  };
  return (
    <>
      <div
        className={`flex flex-col items-center  mx-auto gap-y-[20px] md:py-4 py-2 md:max-w-[1494px] max-w-[410px] ${bgColor}  `}
      >
        <div className="flex flex-col items-center">
          <div className="max-w-[348px]  py-1">
            <h1 className="text-[#212227] text-[24px] font-bold ">
              {heading}
            </h1>
          </div>
          {subheading ? (
            <div>
              <h2 className="text-[#7B7C83] font-medium label-text  text-center ">
                {subheading}
              </h2>
            </div>
          ) : null}
        </div>
        <div className="hidden md:flex flex-wrap items-center justify-center mx-auto w-full gap-x-[10px] gap-y-[24px]">
          {listitems.map((item: any, index: number) => {
            return (
              <div
                className={`max-w-[333px] min-h-[208px] flex flex-col items-center gap-y-[24px]  rounded-[16px] ${imagebgcolor} px-3 py-4 border-[1px] ${borderColor}`}
                key={item.id}
                id={`item-${item.image}-${item.title}-${item.price}-${index}`}
              >
                <div className="relative w-[265px] h-[156px] ">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover rounded-[4px]"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col items-center gap-y-[8px]">
                  <div className="max-w-[293px] min-h-[23px]">
                    <h1 className="text-[#000000] font-medium text-[16px] leading-[22.8px]">
                      {item.title}
                    </h1>
                  </div>
                  <div className="max-w-[163px] min-h-[19px]">
                    {" "}
                    <h1 className="text-[#737272] font-medium text-[13px] leading-[18.52px]">
                      {item.price}
                    </h1>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="block md:hidden max-w-[380px] min-h-[212px] px-3 ">
          <Slider ref={sliderRef} {...sliderSettings}>
            {listitems.map((item, index) => {
              return (
                <div
                  key={`item-${item.image}-${item.title}-${item.price}-${index}`}
                  className={`max-w-[159px] h-[230px]  flex flex-col items-center gap-y-[8px] mr-[20px] ${imagebgcolor} p-3 ${borderColor} rounded-lg ml-[5px] `}
                >
                  <Image
                    src={item.image}
                    width={147}
                    height={118}
                    alt={item.title}
                    unoptimized
                  />
                  <h1 className="max-w-[230px] min-h-[43px] text-center font-medium md:text-[16px] text-[12px] leading-[22.8px]  text-[#000000] mt-[12px]">
                    {item.title}
                  </h1>
                  <p className="max-w-[163px] min-h-[19px] font-medium md:text-[13px] text-[10px] leading-[18.52px] text-[#737272]">
                    {item.price}
                  </p>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
    </>
  );
}
