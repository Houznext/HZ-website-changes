import React, { useRef, useState } from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
export interface ITopBrandsprops {
  heading: string;
  listItems: Array<{
    id: number;
    image: string;
  }>;
}

export default function TopBrands({ heading, listItems }: ITopBrandsprops) {
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
    slidesToShow: 7,
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
          slidesToShow: 4,
          slidesToScroll: 1,
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
      <div className="max-w-[1392px] min-h-[214px] flex flex-col items-center mx-auto gap-y-[64px]">
        <div className="max-w-[144px] min-h-[36px]">
          <h2 className="text-[#212227] font-bold text-[25px] leading-[35.62px]">
            {heading}
          </h2>
        </div>
        <div className="relative w-full ">
          <Slider ref={sliderRef} {...sliderSettings}>
            {listItems.map((item, index) => {
              return (
                <div
                  className=" max-w-[164px] min-h-[114px] md:ml-[0px] ml-[30px] lg:w-1/6 md:w-1/4 sm:w-1/2"
                  key={item.id}
                >
                  <div className="relative w-[164px] h-[114px] rounded-[4px]">
                    <Image
                      src={item.image}
                      fill
                      alt="image"
                      className="absloute w-full h-full object-cover"
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
