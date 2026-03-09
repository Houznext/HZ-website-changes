import React, { useState, useRef, useEffect } from "react";
import Button from "@/common/Button";
import {
  BsArrowUpRight,
  BsClock,
  BsBriefcase,
  BsHeadset,
} from "react-icons/bs";
import ContactForm from "@/components/Products/components/SubServices/Components/ContactForm";
import SolarContactForm from "./SolarContactForm";
import SolarQuoteDisplay from "../SolarQuoteDisplay";
import { SolarQuote } from "@/utils/solar/solarCalculations";
import { useSolarStore } from "@/store/useSolarStore";
export interface IHerosectionprops {
  bgimage: string;
  heading: string;
  heading2: string;
  subheading: string;
  descriptions: string;
  btntext: string;
  overlaystyle: string;
  overlaycolor?: React.CSSProperties;
  onScrollToPackages?: () => void;
}

const HeroSection = ({
  heading,
  bgimage,
  heading2,
  subheading,
  descriptions,
  btntext,
  overlaycolor,
  overlaystyle,
  onScrollToPackages,
}: IHerosectionprops) => {
  const { quote } = useSolarStore();
  const quoteRef = useRef<HTMLDivElement>(null);

  const handleQuoteGenerated = (generatedQuote: SolarQuote) => {
    // Scroll to quote section after a short delay to ensure it's rendered
    setTimeout(() => {
      quoteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBookSiteVisit = () => {
    // TODO: Implement site visit booking logic
    window.open('tel:+919999999999', '_self');
  };

  return (
    <div className="font-sans">
      <div className="relative h-auto min-h-[600px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat "
          style={{
            backgroundImage: `url('${bgimage}')`,
          }}
        >
          <div
            className={`absolute inset-0  ${overlaystyle}`}
            style={overlaycolor}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20 lg:py-24 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-center">
            <div className="flex flex-col justify-center lg:col-span-2 md:mb-0 mb-8 py-4">
              <div className="tracking-wide text-white ">
                <h1 className="font-medium md:text-[38px] text-[28px] leading-tight">
                  <span className="font-bold">{heading}</span>{" "}
                  {heading2}
                </h1>
                <h2 className="mt-4 font-medium md:text-[30px] text-[18px] lg:leading-normal text-white/95">
                  {subheading}
                </h2>
              </div>
              <p className="mt-6 text-[14px] md:text-[16px] font-medium leading-relaxed text-white/90 max-w-[706px]">
                {descriptions}
              </p>
              <div className="md:mt-8 mt-1">
                <Button
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black transition-colors rounded-full  focus:outline-none focus:ring-2  focus:ring-offset-2 bg-white"
                  onClick={() => {
                    if (onScrollToPackages) {
                      onScrollToPackages();
                    }
                  }}
                >
                  {btntext}
                  <span className="text-white bg-[#3586FF] hover:bg-[#3586FF] w-[40px] h-[40px] rounded-full flex justify-center items-center ml-2">
                    <BsArrowUpRight className="w-4 h-4" />
                  </span>
                </Button>
                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                  <div className="group relative flex-1 min-w-[80px] max-w-[140px] bg-gradient-to-br from-[#3586FF]/15 to-blue-600/10 backdrop-blur-xl rounded-2xl md:p-3 p-1 flex flex-col items-center shadow-lg hover:shadow-[#3586FF]/30 border border-white/20 hover:border-blue-400/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3586FF]/0 via-blue-400/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 bg-gradient-to-br from-[#3586FF] to-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-[#3586FF]/25 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <BsClock className="text-white w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-white">
                      10+
                    </div>{" "}
                    <div className="text-xs font-medium text-white/80 mt-0.5">
                      Years
                    </div>
                  </div>

                  <div className="group relative flex-1 min-w-[80px] max-w-[140px] bg-gradient-to-br from-blue-400/15 to-[#3586FF]/10 backdrop-blur-xl rounded-2xl md:p-3 p-1 flex flex-col items-center shadow-lg hover:shadow-blue-400/30 border border-white/20 hover:border-blue-300/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-blue-300/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 bg-gradient-to-br from-blue-400 to-[#3586FF] w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-blue-400/25 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <BsBriefcase className="text-white w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-white">
                      500+
                    </div>{" "}
                    <div className="text-xs font-medium text-white/80 mt-0.5">
                      Projects
                    </div>
                  </div>

                  <div className="group relative flex-1 min-w-[80px] max-w-[140px] bg-gradient-to-br from-blue-300/15 to-blue-400/10 backdrop-blur-xl rounded-2xl md:p-3 p-1 flex flex-col items-center shadow-lg hover:shadow-blue-300/30 border border-white/20 hover:border-cyan-400/40 transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-400/5 to-blue-300/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 bg-gradient-to-br from-cyan-500 to-blue-400 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-cyan-500/25 mb-2 group-hover:scale-110 transition-transform duration-300">
                      <BsHeadset className="text-white w-4 h-4" />
                    </div>
                    <div className="text-xl font-bold text-white">
                      24/7
                    </div>{" "}
                    <div className="text-xs font-medium text-white/80 mt-0.5">
                      Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <SolarContactForm
              selectedId={{
                id: 9,
                service: "Solar",
              }}
              onQuoteGenerated={handleQuoteGenerated}
            />
          </div>
        </div>
      </div>

      {/* Quote Display Section */}
      {quote && (
        <div ref={quoteRef} className="scroll-mt-16">
          <SolarQuoteDisplay
            quote={quote}
            onBookSiteVisit={handleBookSiteVisit}
          />
        </div>
      )}
    </div>
  );
};

export default HeroSection;
