import React, { useState, useRef } from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

export interface ServiceCardProps {
  name: string;
  description: string;
  imageUrl: string;
  index?: number;
}

const ServiceCard = ({
  name,
  description,
  imageUrl,
  index,
}: ServiceCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-4 group" key={index}>
      <div className="md:w-[333px] w-[280px] h-[205px] md:p-[15px] p-[9px] relative">
        <Image
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover -z-10 group-hover:scale-110 transition-transform duration-700 ease-in-out"
          fill
        />
      </div>
      <div className="max-w-[300px] max-h-[166px] -mt-[90px] border-b-[4px] border-[#3586FF] bg-white p-4 rounded-md flex flex-col gap-4">
        <p className="font-medium md:text-[20px] text-[16px] text-center">
          {name}
        </p>
        <p className="font-regular md:text-[16px] text-[12px] text-[#7B7C83] text-center">
          {description}
        </p>
      </div>
    </div>
  );
};

export interface OurServiceProps {
  title: string;
  subTitle: string;
  services: ServiceCardProps[];
}

const OurServices = (props: OurServiceProps) => {
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
          centerMode: true,
          centerPadding: "1px",
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

  const { title, subTitle, services } = props;
  return (
    <div className="relative py-10 px-6 mb-20 ">
      <div className="flex flex-col gap-2 items-center justify-center mb-8  ">
        <div className="relative">
           <h1 className="  font-medium md:text-[25px] text-[20px] text-center">
          {title}
        </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-[3px] bg-gradient-to-r from-[#0052CC] to-[#3586FF] rounded-full"></div>

        </div>
       
       
        <h2 className="font-medium md:text-[20px] text-[16px] text-[#7B7C83] text-center">
          {subTitle}
        </h2>
      </div>
      <div className="hidden md:flex flex-wrap justify-center items-center gap-x-8 gap-y-10">
        {services.map((service: ServiceCardProps, index: number) => (
          <ServiceCard
            key={index}
            name={service.name}
            description={service.description}
            imageUrl={service.imageUrl}
            index={index}
          />
        ))}
      </div>
      <div className="block md:hidden max-w-[410px]">
        <Slider ref={sliderRef} {...sliderSettings}>
          {services.map((service: ServiceCardProps, index: number) => (
            <ServiceCard
              key={index}
              name={service.name}
              description={service.description}
              imageUrl={service.imageUrl}
              index={index}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default OurServices;
