import React, { useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import { FaGlobe, FaCheckCircle, FaClock, FaStar } from "react-icons/fa";

const OurPartners = ({ images }: any) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    cssEase: "linear",
    beforeChange: (_: number, next: number) => setActiveIndex(next),
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };
  const stats = [
    {
      number: "50+",
      label: "Global Partners",
      color: "from-cyan-400 to-[#3586FF]",
      icon: <FaGlobe size={28} />,
    },
    {
      number: "100%",
      label: "Quality Score",
      color: "from-green-400 to-cyan-400",
      icon: <FaCheckCircle size={28} />,
    },
    {
      number: "24/7",
      label: "Support",
      color: "from-blue-400 to-purple-400",
      icon: <FaClock size={28} />,
    },
    {
      number: "5★",
      label: "Rated",
      color: "from-yellow-400 to-orange-400",
      icon: <FaStar size={28} />,
    },
  ];

  return (
    <div className="w-full relative overflow-hidden md:py-8 py-4 px-6 md:px-12 bg-[#f0f4f8]">
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center md:mb-8 mb-5">
          <div className="inline-flex items-center gap-3 bg-[#3586FF] backdrop-blur-sm border border-white/30 text-white md:px-6 px-3 md:py-3 py-2 rounded-full md:mb-6 mb-3">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="font-medium md:text-[14px] text-[12px] tracking-wider">
              TRUSTED PARTNERSHIPS
            </span>
          </div>
        </div>
        {/* Header Section */}
        <div className="text-center md:text-left mb-6 md:mb-8">
          <h1 className="font-medium text-[18px] md:text-[24px] text-[#1e3a8a] md:mb-4 mb-2">
            Our Partners
          </h1>
          <p className="font-regular text-[14px] md:text-[18px] text-gray-700 md:leading-7 leading-6 max-w-3xl mx-auto md:mx-0">
            Our suppliers are some of the world’s most renowned. We also have
            our exclusive own-brand Instinct, which is fast gaining a reputation
            for quality and value.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f0f4f8] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f0f4f8] to-transparent z-10 pointer-events-none"></div>

          <Slider {...settings}>
            {images.map((item: any, index: number) => (
              <div key={index} className="px-2 lg:px-4">
                <div
                  className={`group relative bg-blue-100 rounded-2xl md:p-6 p-3 border border-gray-200 shadow-md transition-transform duration-500 transform hover:-translate-y-2 hover:scale-105 ${activeIndex === index ? "shadow-lg" : ""
                    }`}
                >
                  {/* Logo */}
                  <div className="relative flex items-center justify-center md:h-28 h-22">
                    <div className="relative w-full md:h-20 h-16 transition-all duration-500 group-hover:scale-105">
                      <Image
                        src={item.image}
                        alt={`Partner ${index + 1}`}
                        fill
                        className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 md:gap-6 gap-3 mt-2  md:mt-4 mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center justify-center md:p-6 p-3 rounded-3xl bg-gradient-to-tr from-white/5 to-white/10 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/20"
            >
              <div className="text-[#3586FF] mb-3">{stat.icon}</div>

              <div
                className={`text-[16px] md:text-[18px] font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
              >
                {stat.number}
              </div>

              <div className="text-[12px] md:text-[16px] font-medium text-gray-700 mt-1 text-center">
                {stat.label}
              </div>

              <div className="absolute -top-3 -right-3 w-5 h-5 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurPartners;
