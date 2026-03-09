import React, { useState, useRef } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import { useRouter } from "next/router";
import { LuArrowRight } from "react-icons/lu";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export interface HomeDecorprops {
  heading: string;
  subheading: string;

  dataItems: Array<{
    id: number;
    image: string;
    title: string;
  }>;
}

export default function HomeDecor({
  heading,
  subheading,

  dataItems,
}: HomeDecorprops) {
  const [showMore, setShowMore] = useState(false);
  const Itemstodisply = showMore ? dataItems : dataItems.slice(0, 12);
  const handleButton = () => {
    setShowMore(!showMore);
  };
  const router = useRouter();

  const pathSegments = router.pathname.split("/");
  const categorys = pathSegments[2] || "";
  const categoryShop = categorys ? `${categorys}-shop` : "";

  const handleRoute = (label: string) => {
    const formattedLabel = label.replace(/\s+/g, "-"); // Convert label to lowercase and replace spaces with hyphens
    router.push(
      `/services/${categorys}/${categoryShop}?category=${formattedLabel}`
    );
  };
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
  const firstSlide = dataItems.slice(0, 9);
  const secondSlide = dataItems.slice(9, 18);
  const thirdSlide = dataItems.slice(19);

  return (
    <>
      <div className="md:max-w-[1392px] max-w-[398px] md:min-h-[614px] min-h-[416px] flex flex-col items-center  mx-auto gap-y-[48px]">
        <div className="flex flex-col items-center gap-y-[8px]">
          <div className="md:max-w-[163px] ">
            <h1 className="text-[#212227] font-bold text-[25px] leading-[35.62px]">
              {heading}
            </h1>
          </div>
          <div className="max-w-[740px]  text-center">
            <h2 className="text-[#7B7C83] font-medium label-text leading-[22.8px] text-center">
              {subheading}
            </h2>
          </div>
        </div>
        <div className="hidden md:flex flex-wrap items-center gap-3 justify-center mx-auto max-w-[1392px] w-full  gap-y-[30px]">
          {Itemstodisply.map((item, index) => {
            return (
              <div
                className="flex flex-col items-center  gap-y-[16px] cursor-pointer"
                key={item.id}
                onClick={() => handleRoute(item.title)}
              >
                <div className="relative w-[215px] h-[158px] rounded-[16px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover rounded-md"
                    unoptimized
                  />
                </div>
                <div className="max-w-[226px]">
                  <h1 className="text-[#5F5F5F] font-medium text-[14px] leading-[22.8px]">
                    {item.title}
                  </h1>
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-center w-full">
            {dataItems.length > 12 && (
              <div
                onClick={handleButton}
                className="max-w-[216px] min-h-[29px]"
              >
                {showMore ? (
                  ""
                ) : (
                  <div className="flex items-center gap-x-[8px]">
                    <div className="max-w-[184px]  w-full">
                      <h1 className="text-[#3586FF] font-medium label-text leading-[28.5px]">
                        Show all Category
                      </h1>
                    </div>
                    <div>
                      <LuArrowRight className="text-[#3586FF] w-[24px] h-[24px]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="block md:hidden max-w-[370px] min-h-[238px] mx-auto">
          <Slider ref={sliderRef} {...sliderSettings}>
            {[firstSlide, secondSlide, thirdSlide]
              .filter((slide) => slide.length > 0)
              .map((slide, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-3 max-w-[370px] mx-auto gap-x-[10px] gap-y-[20px] w-full cursor-pointer ml-2"
                >
                  {slide.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col items-center max-w-[90px] w-[90px] gap-y-[16px] min-h-[107px] rounded-[4px] ml-2"
                      onClick={() => handleRoute(item.title)}
                    >
                      <div className="relative max-w-[90px] w-[90px] h-[72px] rounded-[4px]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="rounded-[4px] object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="max-w-[97px] min-h-[39px] text-center text-wrap">
                        <h1 className="font-regular text-[13px] text-[#000000] leading-[18.52px] text-wrap">
                          {item.title}
                        </h1>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </Slider>
        </div>
      </div>
    </>
  );
}
