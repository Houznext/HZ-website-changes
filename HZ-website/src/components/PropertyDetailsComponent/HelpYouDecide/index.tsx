import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiPhoneCall, FiLayers, FiArrowRight } from "react-icons/fi";
const helpYouDecideBetter = [
  {
    icon: "/icons/EMI_Calculator.svg",
    heading: "EMI Calculator",
    description:
      "Calculate your monthly installment based on loan amount, interest rate, and tenure to plan your finances efficiently.",
    cta: { label: "Read more", link: "/" },
  },
  {
    icon: "/icons/Property_Valuation.svg",
    heading: "Property Valuation",
    description:
      "Get an estimated market value of a property based on location, size, amenities, and recent transactions.",
    cta: { label: "Read more", link: "/" },
  },
  {
    icon: "/icons/Investment_Hotspot.svg",
    heading: "Investment Hotspot",
    description:
      "Discover high-growth real estate markets with promising returns and upcoming infrastructure developments.",
    cta: { label: "Read more", link: "/" },
  },
  {
    icon: "/icons/Rate_Trends.svg",
    heading: "Rate & Trends",
    description:
      "Stay updated on property price trends, rental yields, and market fluctuations to make informed investment decisions.",
    cta: { label: "Read more", link: "/" },
  },
];

export default function HelpYouDecide() {
  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-[4px] md:rounded-[10px] shadow-custom border border-blue-200/50 md:p-6 p-2">
        <h2 className="flex items-center gap-2 text-[#3586FF] text-[14px] md:text-[16px] font-bold md:mb-4 mb-2">
          <FiLayers className="text-[#3586FF] " />
          Help You Decide Better
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 md:gap-5 gap-2">
          {helpYouDecideBetter.map((item, index) => (
            <div
              key={`help-card-${index}`}
              className="group relative flex flex-col items-start md:gap-3 gap-1 md:p-5 p-2 rounded-[4px] md:rounded-[10px]
                           bg-white/70 backdrop-blur-md border border-gray-200/60 
                           shadow-custom  hover:border-blue-200/80 
                           hover:-translate-y-2 transition-all duration-300"
            >
              <div
                className="flex items-center justify-center md:w-14 w-8 md:h-14 h-8 rounded-full 
                                bg-gradient-to-br from-blue-100 to-blue-50 
                                border border-blue-200 shadow-sm 
                                group-hover:scale-110 group-hover:shadow-lg 
                                transition-all duration-300"
              >
                <Image
                  src={item.icon}
                  alt={item.heading}
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col flex-1 md:mt-2 mt-1">
                <p className="font-medium text-[12px] md:text-[14px] text-gray-800 mb-1">
                  {item.heading}
                </p>
                <p className="hidden md:block text-gray-600 font-Gordita-Light text-[12px] leading-relaxed flex-1 mb-3">
                  {item.description}
                </p>
                <p className="block md:hidden text-gray-600 font-Gordita-Light text-[10px] leading-snug mb-3">
                  {item.description.slice(0, 60)}...
                </p>

                <Link
                  href={item.cta.link}
                  className="text-[#3586FF] text-[12px] md:text-[14px] font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
                >
                  {item.cta.label}
                  <span className="text-[#3586FF]">
                    <FiArrowRight />
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
