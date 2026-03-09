import React, { useRef } from "react";
import styles from "./index.module.scss";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import Button from "@/common/Button";

const OurProjects = () => {
  const sliderRef = useRef<any>(null);
  const gotoNext = () => sliderRef.current?.slickNext();
  const gotoPrev = () => sliderRef.current?.slickPrev();

  const data = [
    {
      projectName: "Dream Heights",
      imageLink: "/ourProjects/sample-image-1.jpg",
      location: "Madhapur, Hyderabad",
      link: "/projects/dreamheights",
    },
    {
      projectName: "Urban Oasis",
      imageLink: "/ourProjects/sample-image-2.jpg",
      location: "Rajaji Nagar, Bengaluru",
      link: "/projects/urbanoasis",
    },
    {
      projectName: "Skyline Residency",
      imageLink: "/ourProjects/sample-image-3.jpg",
      location: "Bandra, Mumbai",
      link: "/projects/skylineresidency",
    },
    {
      projectName: "Green Valley",
      imageLink: "/ourProjects/sample-image-4.jpg",
      location: "Whitefield, Bengaluru",
      link: "/projects/greenvalley",
    },
    {
      projectName: "Sunset Apartments",
      imageLink: "/ourProjects/sample-image-5.jpg",
      location: "Kothrud, Pune",
      link: "/projects/sunsetapartments",
    },
    {
      projectName: "Lake View Homes",
      imageLink: "/ourProjects/sample-image-6.jpg",
      location: "Gachibowli, Hyderabad",
      link: "/projects/lakeviewhomes",
    },
    {
      projectName: "Golden Gate",
      imageLink: "/ourProjects/sample-image-7.jpg",
      location: "T Nagar, Chennai",
      link: "/projects/goldengate",
    },
    {
      projectName: "Silver Springs",
      imageLink: "/ourProjects/sample-image-8.jpg",
      location: "Salt Lake, Kolkata",
      link: "/projects/silversprings",
    },
    {
      projectName: "Palm Grove",
      imageLink: "/ourProjects/sample-image-9.jpg",
      location: "Viman Nagar, Pune",
      link: "/projects/palmgrove",
    },
    {
      projectName: "Elite Enclave",
      imageLink: "/ourProjects/sample-image-3.jpg",
      location: "Jubilee Hills, Hyderabad",
      link: "/projects/eliteenclave",
    },
    {
      projectName: "Royal Orchard",
      imageLink: "/ourProjects/sample-image-7.jpg",
      location: "MG Road, Bengaluru",
      link: "/projects/royalorchard",
    },
    {
      projectName: "Emerald Park",
      imageLink: "/ourProjects/sample-image-4.jpg",
      location: "Sector 62, Noida",
      link: "/projects/emeraldpark",
    },
  ];

  const sliderSettings = {
    cssEase: "ease-in-out",
    speed: 500,
    arrows: false,
    swipeToSlide: true,
    infinite: true,
    variableWidth: true,
    touchThreshold: 8000,
    responsive: [
      {
        breakpoint: 768,
        settings: { variableWidth: true },
      },
    ],
  };

  return (
    <div className="w-full flex flex-col gap-4 md:gap-12 my-4">
      <p className="text-center font-bold md:text-[28px] text-[20px] leading-[32px] text-[#081221]">
        Our <span className="text-[#3586FF]">Projects</span>
      </p>

      <div className="relative">
        <div className={styles.sliderClassName}>
          <Slider ref={sliderRef} {...sliderSettings}>
            {data?.map((item, index: number) => (
              <div key={`project-${index}`} className="px-2 md:px-3">
                <div
                  className="
                    group relative overflow-hidden
                    border border-[#E6EEFF] bg-white
                    rounded-[14px] md:rounded-[20px]
                    shadow-sm hover:shadow-xl
                    transition-all duration-300
                    w-[220px] md:w-[320px]
                  "
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-[14px] md:rounded-t-[20px]">
                    <Image
                      src={item.imageLink}
                      alt={`${item.projectName} - ${item.location}`}
                      fill
                      sizes="(max-width: 768px) 320px, (min-width: 768px) 440px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 2}
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/30 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] md:text-[12px] font-medium bg-white/90 text-gray-800 shadow-sm">
                        📍 {item.location}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 md:p-5 flex items-center justify-between md:gap-3 gap-1">
                    <div className="text-[#081221]">
                      <p className="font-bold text-[14px] md:text-[18px] leading-tight mb-1">
                        {item.projectName}
                      </p>
                      <p className="text-[12px] md:text-[13px] text-gray-600 leading-snug line-clamp-1 md:hidden">
                        {item.location}
                      </p>
                    </div>
                    <Link
                      href={item.link}
                      className="
                        px-3 md:px-4 py-1.5
                        text-[12px] md:text-[13px]
                        rounded-md text-white
                        bg-gradient-to-r from-[#3586FF] to-[#5B8BFF]
                        shadow-sm hover:shadow-md
                        transition-all duration-300
                        hover:scale-[1.03] active:scale-[0.98]
                        whitespace-nowrap
                      "
                      aria-label={`See more details about ${item.projectName}`}
                    >
                      See more
                      <span className="sr-only"> about {item.projectName}</span>
                    </Link>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#D1E3FF] via-[#A9C9FF] to-transparent" />
                </div>
              </div>
            ))}
          </Slider>
        </div>

        <Button
          aria-label="Previous projects"
          onClick={gotoPrev}
          className="
            hidden md:flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white shadow-md border border-[#E6EEFF]
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2
            hover:scale-110 transition-transform
          "
        >
          ‹
        </Button>
        <Button
          aria-label="Next projects"
          onClick={gotoNext}
          className="
            hidden md:flex items-center justify-center
            w-10 h-10 rounded-full
            bg-white shadow-md border border-[#E6EEFF]
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
            hover:scale-110 transition-transform
          "
        >
          ›
        </Button>
      </div>
    </div>
  );
};

export default OurProjects;
