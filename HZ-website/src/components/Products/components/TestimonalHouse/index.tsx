import React, { useRef } from "react";
import styles from "./index.module.scss";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonalBuilder = () => {
  const sliderRef = useRef<any>(null);
  const gotoNext = () => sliderRef.current?.slickNext();
  const gotoPrev = () => sliderRef.current?.slickPrev();

  const data = [
    {
      desc: "OneCasa Pvt Limited is your premier partner in turning dreams into reality when it comes to finding your perfect home. With a commitment to excellence and a passion for creating spaces that inspire",
      author: "Mahesh",
      location: "Madhapur, Hyderabad",
    },
    {
      author: "Sachin",
      desc: "Exceptional service! I had the pleasure of working with OneCasa Pvt Limited, and their attention to detail exceeded my expectations.",
      location: "Rajaji Nagar, Bengaluru",
    },
    // ...rest of your testimonials
  ];

  return (
    <div className="w-full flex flex-col gap-5 md:gap-y-10">
      <p className="text-center font-bold md:text-[24px] text-[18px] leading-[30px] text-[#081221]">
        Here’s what our customers say
      </p>

      <div className="bg-gradient-to-r py-4 md:py-8 relative rounded-[16px] from-[#CEE1FF4D] via-[#CCE0FF33] to-[#CEE1FF4D]">
        <div className={styles.sliderClassName}>
          <Slider
            ref={sliderRef}
            cssEase="linear"
            speed={300}
            touchThreshold={10000}
            arrows={false}
            swipeToSlide
            variableWidth
          >
            {data?.map((item, index: number) => (
              <div
                key={`testimonial-${index}`}
                className="
                  md:min-w-[340px] md:max-w-[340px] 
                  min-w-[280px] max-w-[280px] 
                  p-3 flex flex-col 
                  bg-white shadow rounded-[16px] 
                  text-[#081221] 
                  min-h-[200px] max-h-[240px]
                  transition-all duration-300
                "
              >
                <div className="bg-[#AFCEFF] flex gap-4 rounded-[32px] min-h-[56px] px-3 py-2">
                  <div className="h-[50px] w-[50px] relative rounded-full border-r-2 border-white overflow-hidden">
                    <Image
                      src={`/testimonials/sample-icon.svg`}
                      alt={`${item.author}`}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex flex-col justify-center text-[#081221]">
                    <p className="text-sm md:text-base font-bold">
                      {item.author}
                    </p>
                    <p className="text-xs text-gray-600">{item.location}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-3 px-1 text-[12px]  font-regular text-gray-700 leading-relaxed line-clamp-4 text-left">
                  {item.desc}
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Arrows */}
        <Image
          src={"/testimonials/icons/left-slide.svg"}
          alt="previous"
          onClick={gotoPrev}
          width={32}
          height={32}
          className="absolute left-0 top-[50%] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        />
        <Image
          src={"/testimonials/icons/right-slide.svg"}
          alt="next"
          onClick={gotoNext}
          width={32}
          height={32}
          className="absolute right-0 top-[50%] translate-x-1/2 -translate-y-1/2 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default TestimonalBuilder;
