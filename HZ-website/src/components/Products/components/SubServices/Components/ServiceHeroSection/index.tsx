import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RightArrowWhite } from "@/components/Icons";
import Button from "@/common/Button";
import { MdArrowForward } from "react-icons/md";


export interface IServiceHeroSectionInterfaceProps {
  heading?: string;
  subHeading?: string;
  bgImageUrl?: string;
  bookingCtaUrl?: { label: string; url: string };
  locationcta?: { label: string; url: string }[];
  selectedId: {
    id: number;
    service: string;
    label?: string;
  };
}

export default function ServicesHeroSection(props: any) {
  return (
    <section className="relative w-full h-[360px] md:h-[400px] lg:h-[380px] overflow-hidden">

      <Image
        src="/images/custombuilder/subservices/furnitures/furniture-hero-sec.png"
        alt="Furniture Lifestyle Banner"
        fill
        className="object-cover object-center"
        priority
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-[1400px] mx-auto">

        <h1 className="text-white font-bold heading-text  leading-tight max-w-2xl drop-shadow-lg">
          Transform Your Home with Premium Furniture
        </h1>

        <p className="text-white/90 label-text font-medium max-w-xl mt-4 leading-relaxed">
          Discover beautifully crafted designs that elevate your lifestyle.
          Experience comfort, style, and durability — all in one place.
        </p>

        <div className="flex flex-wrap gap-3 md:gap-4 mt-6">
          {[
            "Free Delivery",
            "Free Installation",
            "Easy Returns",
            "3–10 Year Warranty",
            "EMI Available",
          ].map((benefit, index) => (
            <div
              key={index}
              className="md:px-3 px-1 md:py-1 py-[2px] bg-white/20 backdrop-blur-md rounded-lg border border-white/30 
                        text-white sublabel-text font-medium shadow-md"
            >
              {benefit}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button className="flex max-h-[40px]  items-center gap-2 bg-[#3586FF] hover:bg-[#4B9CFF] px-4 md:py-2 py-1 rounded-lg 
                               text-white font-medium label-text shadow-lg transition-all duration-200">
            Explore Furniture Collection
            <span className="transform group-hover:translate-x-1 transition-all">
              <MdArrowForward className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
}
