import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export interface Card {
  id: number;
  image: string;
  title: string;
  width?: string;
  category: string;         
  subCategory?: string;
}

export interface IFurnitureDataprops {
  heading: string;
  subheading: string;

  dataitems: Card[];
}

export default function ExploreFurniture({
  dataitems,
  heading,
  subheading,
}: IFurnitureDataprops) {
  const router = useRouter();
  const pathSegments = router.pathname.split("/");
  
  const categorys = pathSegments[2] || "";
  const categoryShop = categorys ? `${categorys}-shop` : "";


  const handleRoute = (card: any) => {
    console.log(card.category)
  router.push({
    pathname: `/services/${categorys}/${categoryShop}`,
    query: {
      category: card.category,         
    
    },
  });
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

    centersapcing: "20px",
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
      {
        breakpoint: 550,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const firstSlideItems = dataitems.slice(0, 6); // First 8 items
  const secondSlideItems = dataitems.slice(6);
  return (
    <div className="w-full md:max-w-[1392px] max-w-[398px] min-h-[416px] flex-flex-col items-center gap-y-[16px] mx-auto ">
      <div className="text-center mt-3 mb-6">
        <h1 className="font-bold  md:text-[24px] text-[18px] md:leading-[35.62px] leading-[28.5px] text-[#212227]">
          {heading}
        </h1>
        <h2 className="font-medium label-text text-[#7B7C83] ">
          {subheading}
        </h2>
      </div>
      <div className="hidden md:flex flex-wrap  justify-center items-center gap-y-[24px]   p-2 mt-7">
        {dataitems.map((card) => (
          <div
            key={card.id}
            className="sm:w-1/2 md:w-1/4 lg:w-1/6 xl:w-1/6 w-full p-2 flex flex-col items-center cursor-pointer "
            onClick={() => handleRoute(card)}
          >
            <div className="relative md:w-[168px] md:h-[120px]">
              <Image
                src={card.image}
                alt={card.title}
                className=" rounded-[2px] md:rounded-[4px] hover:scale-105 transition-all ease-in-out duration-500"
                priority
                fill
                unoptimized
              />
            </div>
            <h1
              className={`mt-2 font-medium label-text  leading-[22.8px] text-[#5F5F5F]`}
            >
              {card.title}
            </h1>
          </div>
        ))}
      </div>
      <div className="block md:hidden max-w-[380px]">
        <Slider ref={sliderRef} {...sliderSettings}>
          <div className="grid grid-cols-3 gap-4 max-w-[396px] min-h-[238px] gap-x-[16px] gap-y-[20px] w-full">
            {firstSlideItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center max-w-[90px] gap-y-[16px] min-h-[107px] rounded-[4px] m-1"
                onClick={() => handleRoute(item)}
              >
                <div className="relative w-[90px] h-[72px] rounded-[4px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="rounded-[4px] object-cover"
                    unoptimized
                  />
                </div>
                <div className="md:max-w-[87px] max-w-[60px] min-h-[19px] ">
                  <h1 className="font-regular text-[13px] text-center  text-[#000000] leading-[18.52px] whitespace-wrap">
                    {item.title}
                  </h1>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-[396px] min-h-[238px] gap-x-[16px] gap-y-[20px]  ">
            {secondSlideItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center max-w-[90px] gap-y-[16px] min-h-[107px] rounded-[4px]"
                onClick={() => handleRoute(item)}
              >
                <div className="relative w-[90px] h-[72px] rounded-[4px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="rounded-[4px] object-cover"
                    unoptimized
                  />
                </div>
                <div className="max-w-[87px] min-h-[19px]">
                  <h1 className="font-regular text-[13px] text-center text-[#000000] leading-[18.52px] whitespace-wrap">
                    {item.title}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        </Slider>
      </div>
    </div>
  );
}
