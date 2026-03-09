import React from "react";
import Slider from "react-slick";
import Image from "next/image";

export default function PropertySlider() {
  const settings = {
    infinite: true,
    speed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "ease-in-out",
    arrows: false,
    dots: false,
    fade: true,
  };
  const images = [
    "/images/Customizable.svg",
    "/images/Referandearn.svg",
    "/images/Fastenquiry.svg",
    // "/images/postproperty/tick.png",
  ];
  return (
    <div className="relative w-full md:max-w-[592px] max-w-[150px] md:h-[298px] h-[80px] mx-auto">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div
            key={index}
            className="relative md:h-[298px] md:w-[592px] w-[150px] h-[80px]"
          >
            <Image
              src={src}
              alt={`slider-image-${index}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
