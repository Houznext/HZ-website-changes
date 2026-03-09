import { Lightbulb, Settings } from "@mui/icons-material";
import React, { useState, useRef } from "react";
import { MdElectricBolt } from "react-icons/md";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const WhyToChoose = () => {
  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const sliderSettings = {
    dots: true,
    beforeChange: (current: number, next: number) => setCurrentSlide(next),
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,
    centerPadding: "10px",
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "40px" : "12px",
          height: "10px",
          borderRadius: "9999px",
          backgroundColor: i === currentSlide ? "#3586FF" : "#CBD5E1",
          transition: "all 0.3s ease-in-out",
          margin: "0 4px",
          display: "inline-block",
        }}
      />
    ),
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 425, settings: { slidesToShow: 1, centerPadding: "0px" } },
    ],
  };

  const features = [
    {
      id: 1,
      title: "Reliability Manufacturing",
      description:
        "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
      Icon: Settings,
      gradient: "from-[#3586FF] to-cyan-500",
    },
    {
      id: 2,
      title: "Material Financing Energy",
      description:
        "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
      Icon: MdElectricBolt,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Powered Innovation",
      description:
        "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
      Icon: Lightbulb,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[#F8FBFF] to-[#EAF1FF] py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-[18px] lg:text-[24px] font-bold text-[#3586FF] tracking-wide mb-2">
            WHY TO CHOOSE ONECASA?
          </h1>
          <h2 className="text-[#1C2436] font-regular md:text-[16px] text-[14px] opacity-80">
            Powering the Future One Ray at a Time
          </h2>
          <div className="w-20 h-[3px] bg-[#3586FF] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 hidden md:block">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group bg-white/70 backdrop-blur-md border border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 p-5 rounded-2xl"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    ></div>

                    <div
                      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                    ></div>
                    <div
                      className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.Icon className="w-6 h-6 text-white min-w-min" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#3586FF] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 font-regular leading-snug">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="block md:hidden w-full max-w-[350px] mx-auto">
            <Slider ref={sliderRef} {...sliderSettings}>
              {features.map((feature) => (
                <div key={feature.id}>
                  <div className="bg-white/70 backdrop-blur-md border border-blue-100 shadow-md hover:shadow-lg transition-all duration-300 p-6 rounded-xl mx-2">
                    <div className="flex items-start gap-4">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                      ></div>

                      <div
                        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                      ></div>
                      <div
                        className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <feature.Icon className="w-6 h-6 text-white min-w-min" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-gray-900 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-[13px] font-regular leading-snug">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="flex justify-end relative">
            <div className="relative w-[400px] h-[400px] hidden lg:block group">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-blue-100">
                <img
                  src="https://cdn.pixabay.com/photo/2021/12/10/11/52/solar-power-6860359_640.jpg"
                  alt="Solar panel installation close-up"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 border-[1.5px] border-transparent group-hover:border-blue-400/40 rounded-3xl animate-pulse-slow"></div>
              </div>

              <div className="absolute -left-24 top-[40px]">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://cdn.pixabay.com/photo/2024/05/02/09/41/talking-8734281_640.png"
                    alt="Team collaboration on project"
                    className="w-[300px] h-[200px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute -top-3 -right-3 w-4 h-4 bg-[#3586FF] rounded-full animate-ping"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-500 rounded-full animate-bounce delay-200"></div>
                </div>

                <div className="absolute bottom-[-90px] left-8">
                  <div className="bg-white p-5 shadow-xl rounded-2xl border-l-4 border-blue-600 transition-transform duration-300 group-hover:scale-105 hover:-rotate-1 relative">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#3586FF] to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-lg font-bold text-white">
                            10+
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          YEARS OF EXPERIENCE
                        </h4>
                        <p className="text-xs text-gray-600 font-regular">
                          IN THIS FIELD
                        </p>
                      </div>
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3586FF]rounded-tl-full opacity-20"></div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute bottom-24 -left-8 w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-md opacity-40 animate-bounce-slow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyToChoose;
