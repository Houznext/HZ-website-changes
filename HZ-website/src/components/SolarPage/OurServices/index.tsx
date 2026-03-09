import Image from "next/image";
import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const solarData = [
  {
    id: 1,
    title: "Solar for Agriculture Farms",
    description:
      "Harness clean energy for agriculture while cutting costs and ensuring sustainability.",
    icon: "/solar/icons/farm.png",
    image:
      "https://cdn.pixabay.com/photo/2017/09/12/13/21/photovoltaic-system-2742302_640.jpg",
  },
  {
    id: 2,
    title: "Solar for Industrial Use",
    description:
      "Empower factories with renewable energy solutions for long-term savings and efficiency.",
    icon: "/solar/icons/solar-panel.png",
    image:
      "https://cdn.pixabay.com/photo/2020/10/03/09/05/solar-energy-5622969_640.jpg",
  },
  {
    id: 3,
    title: "Solar for Commercial Use",
    description:
      "Boost commercial spaces with reliable and eco-friendly solar energy solutions.",
    icon: "/solar/icons/wind-energy.png",
    image:
      "https://cdn.pixabay.com/photo/2021/12/10/11/52/solar-power-6860359_640.jpg",
  },
];

const OurServices = () => {
  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderSettings = {
    dots: true,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "32px" : "10px",
          height: "10px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#D1D5DB",
          transition: "all 0.3s ease-in-out",
          margin: "0 4px",
        }}
      />
    ),
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white via-blue-50/40 to-white">
      <div className="container px-4 md:px-8 mx-auto">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
          <h1 className="heading-text font-bold text-[#3586FF] mb-3">
            OUR SERVICES
          </h1>
          <h2 className="text-[#1C2436] font-regular text-[12px] md:text-[14px] leading-relaxed">
            Energy Independence Through Solar Power & Best Offers for Renewable
            Energy
          </h2>
          <div className="w-16 h-[3px] bg-[#3586FF] mt-3 rounded-full" />
        </div>

        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {solarData.map((service) => (
            <div
              key={service.id}
              className="group relative bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl shadow-sm hover:shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
            >
              <div className="relative h-56 w-full overflow-hidden rounded-t-3xl">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-3 left-3 bg-[#3586FF] p-3 rounded-xl shadow-lg group-hover:scale-110 transition-all">
                  <Image
                    src={service.icon}
                    width={26}
                    height={26}
                    alt={service.title}
                    className="w-6 h-6"
                  />
                </div>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-[#3586FF] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 font-regular leading-relaxed text-[13px]">
                  {service.description}
                </p>

                <div className="mt-4 w-10 h-[3px] mx-auto bg-gradient-to-r from-[#3586FF] to-[#6EA8FF] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="block md:hidden mt-8 max-w-sm mx-auto">
          <Slider ref={sliderRef} {...sliderSettings}>
            {solarData.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden mx-2"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#3586FF] p-2 rounded-md shadow">
                    <Image
                      src={service.icon}
                      width={20}
                      height={20}
                      alt={service.title}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-600 font-regular leading-snug">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default OurServices;
