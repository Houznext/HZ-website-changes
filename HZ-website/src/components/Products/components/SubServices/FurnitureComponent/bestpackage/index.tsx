import React, { useState, useRef } from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Button from "@/common/Button";
export interface IBestPackageprops {
  heading: string;
  listItems: Array<{
    id: number;
    image: string;
    title: string;
    price: string;
    subtitle: string;
    buttontitle: string;
    textcolor: string;
    backgroundcolor: string;
    buttontextcolor: string;
    buttonbackgroundcolor: string;
    bordercolor: string;
  }>;
}

export default function BestPackage({
  heading,

  listItems,
}: IBestPackageprops) {
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
      <div className=" max-w-7xl w-full mx-auto  md:min-h-[352px]  min-h-[313px]  ">
        <h1 className="max-w-[281px] h-[36px] font-bold md:text-[25px]  text-[20px] md:leading-[35.62px] text-center  md:ml-[30%] lg:ml-[42%] ml-[10%] leading-[28.5px]">
          {heading}
        </h1>
        <div className="hidden md:flex flex-nowrap items-center justify-around  mt-[50px] gap-x-[40px] gap-y-[20px] mr-[20px]">
          {listItems.map((item) => {
            return (
              <div
                key={item.id}
                className={`md:max-w-[685px] md:h-[272px]  rounded-[8px] ${item.backgroundcolor} flex  justify-between`}
              >
                <div className="md:max-w-[40%] sm:max-w-[40%] max-w-[40%] w-full ml-[18px] mt-[13px] flex flex-col items-start gap-y-[10px]">
                  <h2
                    className={`max-w-[72px] min-h-[36px] font-medium text-[25px] italic font-[500] leading-[35.62px] text-left ${item.textcolor}`}
                  >
                    {item.title}
                  </h2>
                  <div
                    className={`max-w-[230px] min-h-[29px] font-medium text-[20px] font-[400] leading-[28.5px] text-left ${item.textcolor}`}
                  >
                    {item.subtitle}
                  </div>
                  <div
                    className={`max-w-[108px] min-h-[23px] font-Gordita-medium text-[16px] leading-[22.8px] text-left ${item.textcolor}`}
                  >
                    Starting from
                  </div>
                  <div
                    className={`max-w-[132px] min-h-[36px] font-medium font-[700] text-[25px] leading-[35.62px] ${item.textcolor}`}
                  >
                    {item.price}
                  </div>
                  <div className="flex flex-col items-start max-w-[129px] h-[38px] mt-[5%] relative">
                    <Button
                      className={`max-w-[130px] min-h-[14px] px-[24px] py-[12px] ${item.buttonbackgroundcolor} ${item.buttontextcolor} font-Lato text-[12px] font-[700] leading-[14.4px] tracking-[.16em] flex items-center hover:scale-105 transform duration-300  justify-center z-10 relative`}
                    >
                      {item.buttontitle}
                    </Button>
                    <div
                      className={`w-[128px] h-[38px] border border-solid ${item.bordercolor} absolute top-1 left-0`}
                    ></div>
                  </div>
                </div>
                <div className=" relative w-[454px] h-[272px] md:max-w-[60%] ">
                  <Image
                    src={item.image}
                    alt="image"
                    fill
                    className="max-w-[454px] h-[272px] rounded-[8px] object-cover"
                    unoptimized
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="md:hidden block max-w-[401px] min-h-[242px] pt-[20px]">
          <Slider ref={sliderRef} {...sliderSettings}>
            {listItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className={` max-w-[398px] min-h-[242px] rounded-[8px] ${item.backgroundcolor} flex  justify-between`}
                >
                  <div className="max-w-[170px] min-h-[120px] w-full ml-[18px] mt-[13px] flex flex-col items-start gap-y-[10px]">
                    <div
                      className={`max-w-[58px] min-h-[29px] font-medium text-[20px] italic leading-[28.5px] text-left ${item.textcolor}`}
                    >
                      {item.title}
                    </div>
                    <div
                      className={`max-w-[194px] min-h-[23px] font-regular text-[16px] font-[400] leading-[22.8px] text-left ${item.textcolor}`}
                    >
                      {item.subtitle}
                    </div>
                    <div
                      className={`max-w-[108px] min-h-[23px] font-Gordita-medium text-[16px] leading-[22.8px] text-left ${item.textcolor}`}
                    >
                      Starting from
                    </div>
                    <div
                      className={`max-w-[132px] min-h-[36px] font-bold  text-[20px] leading-[28.5px] ${item.textcolor}`}
                    >
                      {item.price}
                    </div>
                    <div className="flex flex-col items-start w-[129px] h-[38px] mt-[5%] relative mr-[10px]">
                      <button
                        className={`w-[129px] min-h-[14px] px-[24px] py-[12px] ${item.buttonbackgroundcolor} ${item.buttontextcolor} font-Lato text-[12px] font-[700] leading-[14.4px] tracking-[.16em] flex items-center justify-center z-10 relative`}
                      >
                        {item.buttontitle}
                      </button>
                      <div
                        className={`w-[130px] h-[39px] border border-solid ${item.bordercolor} absolute top-1 left-1`}
                      ></div>
                    </div>
                  </div>
                  <div className="relative rounded-[8px] w-[197px] h-[242px]">
                    <Image
                      src={item.image}
                      alt="image"
                      fill
                      className=" rounded-[8px] object-cover"
                      unoptimized
                    />
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
