import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "@/common/Button";
import RecentTab from "../RecentTab";
import SectionSkeleton from "@/common/Skeleton";
import SpecialOffersSkeleton from "@/common/Skeleton";

export interface ISpecialOffersprops {
  heading: string;
  listItems: Array<{
    id: number;
    image: string;
    title: string;
  }>;
}

export default function SpecialOffers({
  heading,
  listItems,
}: ISpecialOffersprops) {
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
    centerMode: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "58px" : "8px",
          height: "8px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#3s7382",
          transition: "all 0.3s ease-in-out",
          margin: "-10px 4px",

          display: "inline-block",
        }}
      />
    ),
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <>
      <div className="  max-w-[1440px]  flex flex-col items-center mx-auto md:gap-y-[48px] gap-y-[20px]">
        <div className="relative w-full flex flex-row md:mt-5 md:mb-[10px]  mb-[5px] h-full">
          <div className="max-w-[440px]  mx-auto">
            <h1 className="text-center text-nowrap text-  md:text-[24px] text-[18px] leading-[44.17px] font-bold"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #3586FF 30.48%, #212227 100%)",
                color: "transparent",
                backgroundClip: "text",
              }}
            >
              {heading}
            </h1>
          </div>
          {/* <div className=" max-md:hidden absolute md:top-[60%] md:left-[56%]  md:-translate-y-[50%]">
            <RecentTab />
          </div> */}
        </div>
        {loading ? (
          <SectionSkeleton type={"specialOffers"} />
        ) : (
          <div className="relative w-full  pb-10 xl:max-w-[1392px] lg:max-w-[980px]  min-h-[301px] max-w-[325px]  md:max-w-[750px] mx-auto md:pl-0 pl-1">
            <Slider ref={sliderRef} {...sliderSettings}>
              {listItems.map((item) => (
                <div
                  key={item.id}
                  className="xl:max-w-[451px] lg:max-w-[450px] md:max-w-[340px] max-w-[310px] md:h-[263px] h-[240px] mx-auto relative bg-white  overflow-hidden xl:ml-0 lg:ml-[19px] md:ml-[17px] ml-0"
                >
                  <div className="relative   xl:w-[451px] lg:w-[450px] md:w-[340px] w-[310px] md:h-[263px] h-[240px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 310px, (max-width: 1024px) 340px, 450px"
                      className="absolute z-10 w-full h-full rounded-[16px] object-cover"
                    />
                    <div className="relative z-20">
                      <div className="flex flex-col md:gap-y-[96px] gap-y-[60px]">
                        <div className="flex items-center justify-between">
                          <div className="md:w-[255px] w-[190px] md:min-h-[84px] min-h-[70px]  bg-[#2A2C2780] rounded-tl-[16px] rounded-tr-[4px] rounded-bl-[4px] rounded-br-[4px] flex flex-col items-center justify-center md:mb-0 mb-2">
                            <h1 className="text-[#B9D5FF] font-bold md:text-[24px] text-[18px] leading-[28.64px]">
                              BIG SALE
                            </h1>
                            <h2 className="text-[#FFFFFF] md:font-medium font-regular md:text-[13px] text-[10px] leading-[18.52px]">
                              {item.title}
                            </h2>
                          </div>
                          <div className="md:w-[90px]  min-h-[78px] bg-[#527fcc] rounded-tr-[16px] md:py-2  py-1 px-1">
                            <div className="max-w-[75px] min-h-[46px] flex flex-col items-center justify-center mx-auto">
                              <h1 className="text-[#B4D2FF] font-medium md:text-[13px] text-[10px] leading-[18.52px] tracking-6percent">
                                DIS UP TO
                              </h1>
                              <div className="flex items-center">
                                <span className="text-white font-Battambang font-bold md:text-[31px] text-[18px] leading-[56.01px] tracking-[6%]">
                                  40
                                </span>
                                <div className="flex flex-col items-center -mt-1">
                                  <span className="text-white font-bold md:text-[13px] text-[10px] leading-[18.52px] tracking-[6%]">
                                    %
                                  </span>
                                  <span className="text-white font-medium md:text-[13px] text-[10px] leading-[18.52px] tracking-[6%]">
                                    OFF
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start max-w-[116px] h-[39px] mt-[5%] relative cursor-pointer ml-4 ">
                          <Button
                            className="w-[112px] min-h-[35px] px-[24px] py-[12px] bg-[#FFFFFF] text-[#3687FF] font-medium text-[13px]  leading-[18.52px]  z-10 relative"
                            aria-hidden="true"
                            tabIndex={-1}
                          >
                            Visit Now
                          </Button>

                          <div className="w-[116px] h-[35px] border border-solid border-[#FFFFFF]  absolute top-2 left-0  "></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
            <Image
              src="/testimonials/icons/left-slide.svg"
              alt="Previous"
              width={42}
              height={42}
              onClick={gotoPrev}
              priority
              className="absolute left-0 md:top-1/2 top-1/2  transform md:-translate-y-1/2 -translate-y-5 md:-translate-x-1/2 md:translate-x-1/1 -translate-x-1/2 cursor-pointer"
            />
            <Image
              src="/testimonials/icons/right-slide.svg"
              alt="Next"
              width={42}
              height={42}
              onClick={gotoNext}
              priority
              className="absolute md:-right-1  -right-2 top-1/2 transform -translate-y-1/2  md:translate-x-1 translate-x-2 cursor-pointer"
            />
          </div>
        )}
      </div>
    </>
  );
}
