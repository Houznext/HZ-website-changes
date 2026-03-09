import React, { useRef, useState } from "react";
import Image from "next/image";
import RupeesIcon, { BuildingIcon } from "@/components/PropertyComp/Icons";
import { AreaIcon, ResidentialIcon } from "@/components/Products/icons";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

interface PackageCardProps {
  price: string;
  area: string;
  floors: string;
  type: string;
  imageUrl: string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  price,
  area,
  floors,
  type,
  imageUrl,
}) => {
  return (
    <div className="md:max-w-[450px] max-w-[340px] shadow-[1px_10px_10px_1px_#E5E5E5] rounded-[16px] transition transform hover:scale-105 hover:transition-ease hover:duration-400 cursor-pointer">
      <div className="md:w-[450px] w-[330px] md:h-[242px] h-[180px] relative">
        <Image
          src={imageUrl}
          alt="Package Image"
          fill
          className="rounded-[16px_16px_0_0] object-cover"
        />
      </div>
      <div className="md:px-4  px-7 md:py-3 py-1 flex flex-col gap-1">
        <p className="flex flex-row items-center justify-start md:gap-2 gap-1">
          <RupeesIcon />{" "}
          <span className="md:text-[20px] text-[12px] md:leading-8 leading-4 font-medium">
            {price}
          </span>
        </p>
        <div className="md:mb-3 mb-2">
          <div className="flex flex-row gap-2 items-center justify-start">
            <div className="flex flex-row gap-1 items-center justify-center">
              <AreaIcon />
              <div className="flex  md:leading-8 leading-4 md:text-[16px] text-[12px] font-regular">
                {area}
              </div>
            </div>
            <div className="h-[10px] w-[1px] bg-[#4d4040]" />
            <div className="flex flex-row gap-1 items-center justify-center">
              <BuildingIcon />
              <div className="flex  md:leading-8 leading-4 md:text-[16px] text-[12px] font-regular">
                {floors}
              </div>
            </div>
            <div className="h-[10px] w-[1px] bg-[#4d4040]" />
            <div className="flex flex-row gap-1 items-center justify-center">
              <ResidentialIcon />
              <div className="flex md:leading-8 leading-4 font-regular md:text-[16px] text-[12px]">
                {type}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Packages = () => {
  const packagesData = [
    {
      price: "₹ 52 Lakhs",
      area: "48*76 sq.ft",
      floors: "G+3",
      type: "Residential",
      imageUrl:
        "/images/custombuilder/subservices/civilengineering/packages/modal.jpg",
    },
    {
      price: "₹ 42 Lakhs",
      area: "45*70 sq.ft",
      floors: "G+2",
      type: "Residential",
      imageUrl:
        "/images/custombuilder/subservices/civilengineering/packages/modal1.png",
    },
    {
      price: "₹ 42 Lakhs",
      area: "45*70 sq.ft",
      floors: "G+2",
      type: "Residential",
      imageUrl:
        "/images/custombuilder/subservices/civilengineering/packages/modal2.png",
    },
  ];
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

  return (
    <div className="mb-10">
      <h1 className="font-medium md:text-[25px] text-[20px] text-center mb-5">
        Packages
      </h1>
      <h2 className="font-regular text-[#7B7C83] mx-auto max-w-[92%] md:leading-7 leading-6 text-center md:mb-16 mb-10">
        Explore our versatile house plan, the best 3D house designs, and
        detailed floor plans that are specifically designed for contemporary
        living. Our 3D house design allows you to visualize your dream home in
        stunning detail and explore many floor plans and finishes to ensure a
        seamless and distinctive construction experience. Our house design
        layout combines functionality with contemporary aesthetics, ensuring
        that every detail is designed for comfort and convenience.
      </h2>
      <div className="md:flex flex-row gap-8 items-center justify-center mx-auto hidden">
        {packagesData.map((pkg, index) => (
          <PackageCard
            key={index}
            price={pkg.price}
            area={pkg.area}
            floors={pkg.floors}
            type={pkg.type}
            imageUrl={pkg.imageUrl}
          />
        ))}
      </div>
      <div className="block md:hidden  mx-auto">
        <Slider ref={sliderRef} {...sliderSettings}>
          {packagesData.map((pkg, index) => (
            <PackageCard
              key={index}
              price={pkg.price}
              area={pkg.area}
              floors={pkg.floors}
              type={pkg.type}
              imageUrl={pkg.imageUrl}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Packages;
