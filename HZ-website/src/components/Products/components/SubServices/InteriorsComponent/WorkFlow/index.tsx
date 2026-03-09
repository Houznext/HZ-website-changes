import React, { useState, useRef } from "react";
import { IListSectionProps } from "../ListSection";
import clsx from "clsx";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const WorkFlow = ({ heading, subHeading, list }: IListSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<any>(null);

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
          slidesToShow: 1,
          centerPadding: "5px",
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          centerPadding: "1px",
        },
      },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-centers ">
      <h1 className="font-medium md:text-[24px] text-[18px] md:mb-3 mb-2">{heading}</h1>
      <h2 className="font-medium text-[#7B7C83] md:text-[20px] text-[14px] text-center ">
        {subHeading}
      </h2>
      <div className="md:flex hidden flex-row flex-wrap md:flex-nowrap items-center justify-center gap-5 mt-[64px]">
        {list.map(({ imageUrl, label }, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-[264px] h-[260px]">
              <Image
                src={imageUrl}
                alt={label}
                fill
                className="rounded-[10px] object-cover"
              />
            </div>
            <p
              className={clsx(
                "text-[15px] font-medium text-[#7B7C83] mt-3",
                index === 0 ? "font-bold" : "font-normal"
              )}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="block md:hidden max-w-[370px] w-full pt-[20px]">
        <Slider ref={sliderRef} {...sliderSettings}>
          {list.map(({ imageUrl, label }, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative w-[290px] h-[210px]">
                <Image
                  src={imageUrl}
                  alt={label}
                  fill
                  className="rounded-[10px] object-cover"
                />
              </div>
              <p
                className={clsx(
                  "text-[12px] font-medium text-[#7B7C83] mt-3",
                  index === 0 ? "font-bold" : "font-normal"
                )}
              >
                {label}
              </p>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default WorkFlow;
