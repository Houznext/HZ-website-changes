import { Headphones, Lightbulb } from "@mui/icons-material";
import Image from "next/image";
import React from "react";
import { BsAward } from "react-icons/bs";
import { LuBadgeCheck } from "react-icons/lu";

const whyChooseUsData = [
  {
    id: 1,
    icon: Lightbulb,
    heading: "Efficiency & Power",
    description:
      "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
  },
  {
    id: 2,
    icon: BsAward,
    heading: "Trust & Warranty",
    description:
      "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
  },
  {
    id: 3,
    icon: LuBadgeCheck,
    heading: "High Quality Work",
    description:
      "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
  },
  {
    id: 4,
    icon: Headphones,
    heading: "24*7 Support",
    description:
      "Provide urgent solutions also convenient for busy clients, maintained while discussing over phone.",
  },
];

const statsData = [
  {
    id: 1,
    number: "1000+",
    statTitle: "Successful Projects",
    image: "/solar/icons/project-done.png",
  },
  {
    id: 2,
    number: "500+",
    statTitle: "Happy Customers",
    image: "/solar/icons/clients.png",
  },
  {
    id: 3,
    number: "100+",
    statTitle: "Team Members",
    image: "/solar/icons/delivery.png",
  },
  {
    id: 4,
    number: "25+",
    statTitle: "Years of Experience",
    image: "/solar/icons/experience.png",
  },
  {
    id: 5,
    number: "30+",
    statTitle: "Dedicated team",
    image: "/solar/icons/clients.png",
  },
];

const WhyToChooseUs = () => {
  return (
    <section className="w-full flex justify-center font-sans">
      <div className="py-6 md:py-10">
        {/* Header */}
        <div className="text-center md:mb-16 mb-8 px-4">
          <h1 className="text-[18px] lg:text-[34px] font-bold text-[#3E6196] mb-2">
            Why Choose Us
          </h1>
          <h2 className="text-[#1C2436] md:text-[16px] text-[14px] font-regular">
            Providing Solar Energy Solutions
          </h2>
          <div className="w-20 h-[3px] bg-[#3586FF] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center px-4 lg:px-[108px] py-5 bg-[#AFCFFF] md:py-[40px]  ">
          <div className="md:space-y-6  space-y-4 grid lg:grid-cols-1 grid-cols-2 mx-auto md:space-x-0 space-x-3  items-center lg:pl-3">
            {whyChooseUsData.map((item) => (
              <div className="group bg-white backdrop-blur-sm rounded-2xl md:p-2 p-1 shadow-sm hover:shadow-xl border border-blue-50 hover:border-blue-200/50 transition-all duration-500 hover:-translate-y-1 relative flex gap-3 border-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-blue-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="md:w-[60px] w-[30px] md:h-[60px] h-[30px] bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon className="md:w-6 w-3 md:h-6 h-3 text-[#2B579A]" />
                </div>
                <div>
                  <h3 className="md:text-[20px] text-[14px] group-hover:text-[#3586FF] transition-colors duration-300 font-medium mb-2">
                    {item.heading}
                  </h3>
                  <p className="text-[#5C5D5F] max-w-[586px] font-regular md:text-[14px] text-[10px]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mx-auto md:w-[450px] md:h-[450px] w-[300px] h-[250px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500 group">
            <Image
              src="/solar/images/why-choose-us-images-right.png"
              fill
              alt="Why choose us image"
              className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            />

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500"></div>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md text-center">
              <div className="text-lg font-bold text-[#3586FF]">10+</div>
              <div className="text-xs font-medium text-gray-700">
                Years Experience
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-12">
              <h3 className="text-white font-bold text-lg mb-2">
                Solar Excellence
              </h3>
              <p className="text-blue-100 font-regular text-sm">
                Premium quality solar solutions
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center py-8 md:max-w-full  max-w-[360px] bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-y-8 gap-y-4 gap-x-4  text-center max-w-[1075px] ">
            {statsData.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 md:gap-4 group hover:transform hover:-translate-y-1 transition-all duration-300 p-3 rounded-2xl hover:bg-blue-50/50"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                  <div className="relative w-5 h-5">
                    <Image
                      src={item.image}
                      fill
                      className="object-contain"
                      alt={item.statTitle}
                    />
                  </div>
                </div>

                <div className="text-left min-w-[100px]">
                  <h3 className="text-[16px] md:text-[18px] font-bold text-[#3586FF] leading-none">
                    {item.number}
                  </h3>
                  <p className="text-black font-light text-left label-text">
                    {item.statTitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="h-[100px] w-full bg-[#AFCFFF]" /> */}
        <div className="h-[100px] w-full bg-gradient-to-b from-[#AFCFFF] to-blue-100 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3586FF] to-transparent"></div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-80 h-20 bg-blue-200/30 blur-3xl rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default WhyToChooseUs;
