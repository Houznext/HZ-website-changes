import Image from "next/image";
import React, { useState, useRef } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export interface IWHyVisitUsProps {
  points: Array<{
    imageUrl: string;
    heading: string;
    description: string;
  }>;
}

function WhyVisitUs({ points }: IWHyVisitUsProps) {
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
    centerMode: true,
    centerPadding: "20px",
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
          slidesToShow: 2,
          centerPadding: "4px",
        },
      },
    ],
  };
  return (
    <div className="w-full mx-auto max-w-7xl">
      <h1 className="font-bold heading-text text-center px-5 text-[24px] leading-[34.2px] mb-[35px] md:mb-[48px]">
        Why Visit Us?
      </h1>
      <div className="hidden md:grid grid-cols-1 w-full mx-auto gap-y-12 lg:gap-x-3 lg:gap-y-3 md:grid-cols-2 lg:grid-cols-4 ">
        {points.map((point, index) => {
          return (
            <div
              key={`${point.imageUrl}-${point.heading}-${index}`}
              className="max-w-[340px]"
            >
              <div className="rounded-lg relative h-[160px] lg:h-[170px] mb-4">
                <Image src={point.imageUrl} alt={``} fill unoptimized />
              </div>
              <h2 className="text-center px-1 text-[16px] md:text-[20px] text-[#3586FF] md:leading-[28.5px] font-medium ">
                {point.heading}
              </h2>
              <p className="text-center px-1 text-[14px] md:text-[16px] text-[#212227] md:leading-[22.5px] font-medium ">
                {point.description}
              </p>
            </div>
          );
        })}
      </div>
      <div className="block md:hidden max-w-[418px] min-h-[250px]  ">
        <Slider ref={sliderRef} {...sliderSettings}>
          {points.map((point, index) => {
            return (
              <div
                key={`${point.imageUrl}-${point.heading}-${index}`}
                className="max-w-[213px] m-2"
              >
                <div className="rounded-lg relative h-[130px] w-[150px] lg:h-[185px] mb-4">
                  <Image src={point.imageUrl} alt={``} fill unoptimized />
                </div>
                <h2 className="text-center px-1 text-[16px] md:text-[20px] text-[#3586FF] md:leading-[28.5px] font-medium leading-[18.52px]">
                  {point.heading}
                </h2>
                <p className="text-center px-1 text-[14px] md:text-[16px] text-[#212227] md:leading-[22.5px] font-medium leading-[18.52px] ">
                  {point.description}
                </p>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}

export default WhyVisitUs;
