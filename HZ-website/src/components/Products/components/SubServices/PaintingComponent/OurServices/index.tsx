import React, { useState, useRef } from "react";
import Image from "next/image";
import { BrushIcon } from "../PaintIcons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

interface PaintProps {
  services: {
    title: string;
    description: string;
    icon: any;
    imageUrl: string;
  }[];
}

const ServiceCard = ({ title, description, icon: Icon, imageUrl, isActive }: any) => {
  return (
   
    <div className={`
      relative aspect-[4/3] md:w-[400px] w-[300px] md:h-[350px] h-[270px] 
      mx-3 transition-all duration-500 ease-out
      ${isActive ? 'scale-105 opacity-100' : 'scale-95 opacity-70'}
      group cursor-pointer
    `}>
      
      <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 rounded-2xl" />
      </div>

      
      <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
      
        <div className="absolute md:top-1 top-2 left-8">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <Icon />
          </div>
        </div>

      
        <div className="space-y-3 transform transition-transform duration-300 group-hover:translate-y-[-5px]">
          <h3 className="font-medium md:text-[20px] text-[16px] md:leading-6 leading-4 tracking-wide">
            {title}
          </h3>
          <p className="font-regular md:text-[16px]  text-[14px] md:leading-5 leading-5 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-500 ease-in-out">
            {description}
          </p>
        </div>

        
        <div className="absolute bottom-4 left-8 w-8 h-0.5 bg-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>

      
      <div className="absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/0 backdrop-blur-sm" />
    </div>
  );
};

const PaintServices = ({ services }: PaintProps) => {
  const sliderRef = useRef<any>(null);
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
    centerPadding: "25px",
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
          centerPadding: "0px",
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
    <div className="flex flex-col px-6 py-10 mt-10">
      <div className="flex flex-col gap-8 mx-auto">
        <h1 className="font-bold text-[32px] leading-11 text-[#3586FF] mx-auto">
          Our Services
        </h1>
        <h2 className="font-medium md:text-[16px] text-[14px] md:leading-6 leading-4 md:max-w-[1200px] max-w-[270px] mx-auto md:text-left text-center">
          Whether you're looking to refresh your space or create a new look, our
          team can help with a range of painting services.
        </h2>
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-content-center">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              imageUrl={service.imageUrl}
               isActive={true}
            />
          ))}
        </div>
        <div className="block md:hidden max-w-[340px] w-full relative ">
          <Slider ref={sliderRef} {...sliderSettings}>
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                imageUrl={service.imageUrl}
                isActive={index === currentSlide}
              />
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default PaintServices;
