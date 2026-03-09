import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import SectionSkeleton from "@/common/Skeleton";
import { setTime } from "react-datepicker/dist/date_utils";

export interface ITestimonialsSectionProps {
  words: Array<{
    name: string;
    desc: string;
    rating: 1 | 2 | 3 | 4 | 5;
  }>;
}

function TestimonialsSection({ words }: ITestimonialsSectionProps) {
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
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };


  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    },1500)
  })
  return (
    <div className="md:py-[48px] py-[38px] px-[24px] bg-[#EDF3FC] -z-10">
      {/*<div className="flex  items-center justify-center gap-2 mb-[81px] md:w-full md:h-full max-w-[380px] min-h-[29px] w-full">
        <span className="text-[20px] leading-[28.5px] md:font-medium font-bold md:text-[24px] md:leading-[34.2px] ">
          Testimonials
        </span>
        <div className="md:flex h-[30.2px] w-[1px] bg-[#000000] "></div>
        <span className="text-[20px] leading-[28.5px] md:font-medium font-bold md:text-[24px] md:leading-[34.2px] ">
          Words of Appreciation
        </span>
      </div>*/}
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:mb-[81px] mb-[30px]">
        <span className="text-[16px] leading-[24.5px] md:font-medium font-bold md:text-[24px] md:leading-[34.2px] ">
          Testimonials
        </span>
        <div className="md:flex h-[30.2px] w-[1px] bg-[#000000] hidden"></div>
        <span className="text-[16px] leading-[24.5px] md:font-medium font-bold md:text-[24px] md:leading-[34.2px]">
          Words of Appreciation
        </span>
      </div>
      {loading ? (<SectionSkeleton type={"testimonialsSectionskeleton"} />) : (
        <div className="hidden md:grid grid-cols-1 gap-y-12 lg:gap-x-3 lg:gap-y-3 place-content-center place-items-center md:place-content-between md:grid-cols-2 lg:grid-cols-4 ">
          {words.map((word, index) => {
            return (
              <div
                key={`${word.name}-${word.rating}-${index}`}
                className="max-w-[333px] rounded-lg bg-[#FFFFFF] relative px-4 pt-11 pb-4"
              >
                <div className="absolute w-[60px] h-[60px] bg-[#97C0FF] rounded-full flex items-center justify-center top-0 translate-y-[-50%] left-[50%] translate-x-[-50%]">
                  <Image
                    src="/icons/semi-colon.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="object-cover"
                  ></Image>
                </div>
                <h1 className="text-center text-xl leading-[28.5px] text-[#000000] mb-4">
                  {word.name}
                </h1>
                <h2 className="text-[#7B7C83] text-[13px] leading-[18.52px] mb-2">
                  {word.desc}
                </h2>
                <div className="flex items-center flex-wrap justify-center gap-2 mt-2">
                  {Array(word.rating)
                    .fill(",")
                    .map((data: any, key: any) => {
                      return (
                        <FaStar
                          key={`${data}-${key}`}
                          className="text-sm text-[#FFC909]"
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="block md:hidden  max-w-[414px] min-h-[275px] overflow-visible ml-[10px]">
        <Slider ref={sliderRef} {...sliderSettings}>
          {words.map((word, index) => {
            return (
              <div
                key={`${word.name}-${word.rating}-${index}`}
                className="max-w-[159px] min-h-[240px]  rounded-lg bg-[#FFFFFF] relative flex flex-col items-center gap-y-[8px] px-4 pt-11 pb-4 overflow-visible mx-[8px] m-9 "
              >
                <div className="absolute w-[60px] h-[60px] bg-[#97C0FF] rounded-full flex items-center justify-center top-0 translate-y-[-50%] left-[50%] translate-x-[-50%] z-auto">
                  <div className="relative w-[16px] h-[46px]">
                    <Image
                      src="/icons/semi-colon.svg"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <p className="text-center text-[20px]  text-xl leading-[28.5px] text-[#000000] mb-4 max-w-[67px] min-h-[29px] font-regular">
                  {word.name}
                </p>
                <p className="text-[#7B7C83] text-[13px] leading-[24px] mb-2 text-center max-w-[193px] min-h-[96px] font-regular">
                  {word.desc.slice(0, 60)}...
                </p>
                <div className="flex items-center flex-wrap justify-center gap-2 mt-2 ">
                  {Array(word.rating)
                    .fill(",")
                    .map((data: any, key: any) => {
                      return (
                        <FaStar
                          key={`${data}-${key}`}
                          className="text-sm text-[#FFC909]"
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
}

export default TestimonialsSection;
