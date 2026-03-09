import React, { useRef } from "react";
import { useRouter } from "next/router";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { LocationIcon, RupeesIconBlue, WallpaperIconBlue } from "../Icons";
import { RedirectIcon, ReviewIcon, RightArrow } from "@/components/Icons";
import Button from "@/common/Button";

/** ---------- Single Card ---------- **/
const PopularCard = ({
  locality,
  location,
  range,
  sqft,
  projectCount,
  link,
}: any) => {
  const router = useRouter();

  return (
    <div
      className="
        bg-white/95 backdrop-blur-[1px] 
        lg:w-[280px] md:w-[220px] xl:min-w-[300px] w-[200px]
        lg:h-[230px] md:h-[260px] h-[240px]
        flex flex-col justify-center items-start
        md:p-6 p-5 md:mx-6 mx-3 rounded-2xl
        border border-slate-200 shadow-[0_6px_24px_-12px_rgba(2,6,23,0.35)]
        hover:shadow-[0_18px_40px_-18px_rgba(37,99,235,0.55)]
        hover:border-blue-300 hover:-translate-y-[3px]
        transition-all duration-300 m-2
      "
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col md:gap-2 gap-1.5">
          <div className="flex items-center md:gap-2 gap-1.5">
            <h2 className="md:text-[18px] text-[15px] font-medium text-slate-900 line-clamp-1">
              {locality}
            </h2>
            <Button
              aria-label={`Open ${locality}`}
              className="cursor-pointer hover:opacity-80 active:scale-95 transition"
              onClick={() => router.push(link)}
            >
              <RedirectIcon />
            </Button>
          </div>
          <p className="text-slate-500 text-[12px] md:text-[13px]">
            {projectCount ?? 0} Projects
          </p>
        </div>

        {/* Rating pill */}
        <div
          className="
            inline-flex items-center gap-1
            rounded-full px-2 py-0.5
            bg-blue-50 text-[#3586FF]
            border border-blue-100
          "
          title="Average rating"
        >
          <span className="md:text-[14px] text-[12px] font-medium">
            4.0
          </span>
          <ReviewIcon />
        </div>
      </div>

      <div className="w-full h-px my-3 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="flex items-center md:gap-2 gap-2 mb-2">
        <span className="shrink-0 opacity-90">
          <LocationIcon />
        </span>
        <p className="font-medium text-slate-900 md:text-[14px] text-[12px] line-clamp-1">
          {location}
        </p>
      </div>

      <div className="flex items-center md:gap-2 gap-2 mb-2">
        <span className="shrink-0 opacity-90">
          <RupeesIconBlue />
        </span>
        <p className="font-regular text-slate-800 md:text-[14px] text-[12px]">
          {range}
        </p>
      </div>

      <div className="flex items-center md:gap-2 gap-2">
        <span className="shrink-0 opacity-90">
          <WallpaperIconBlue />
        </span>
        <p className="font-regular text-slate-800 md:text-[14px] text-[12px]">
          {sqft}
        </p>
      </div>
    </div>
  );
};

/** ---------- Custom Arrows (with icons) ---------- **/
const NextArrow = ({ onClick }: any) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Next localities"
      className="
        hidden md:flex
        items-center justify-center
        w-10 h-10 lg:w-11 lg:h-11
        rounded-full bg-white shadow-md border border-slate-200
        absolute top-1/2 -translate-y-1/2 -right-4
        hover:bg-blue-50 hover:shadow-[0_0_12px_rgba(82,151,255,0.5)]
        transition-all duration-300 group z-20
      "
    >
      <span className="text-[#3586FF] group-hover:translate-x-[2px] transition-transform">
        <RightArrow />
      </span>
    </button>
  );
};

const PrevArrow = ({ onClick }: any) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Previous localities"
      className="
        hidden md:flex
        items-center justify-center
        w-10 h-10 lg:w-11 lg:h-11
        rounded-full bg-white shadow-md border border-slate-200
        absolute top-1/2 -translate-y-1/2 -left-4
        hover:bg-blue-50 hover:shadow-[0_0_12px_rgba(82,151,255,0.5)]
        transition-all duration-300 group z-20
      "
    >
      <span className="text-[#3586FF] group-hover:-translate-x-[2px] transition-transform rotate-180">
        <RightArrow />
      </span>
    </button>
  );
};

interface PopularLocaltiesProps {
  city: string;
  activeTab?: string;
  data: any[];
  fallbackData?: any[];
  showMoreLink?: boolean;
}

const PopularLocalties: React.FC<PopularLocaltiesProps> = ({
  city,
  activeTab = "buy",
  data,
  fallbackData = [],
  showMoreLink = true,
}) => {
  const router = useRouter();
  const sliderRef = useRef<Slider | null>(null);

  // Ensure at least 8 localities using fallback
  const baseData = Array.isArray(data) ? data : [];
  const formattedData =
    baseData.length >= 8
      ? baseData
      : [...baseData, ...fallbackData.slice(0, 8 - baseData.length)];

  const isFewItems = formattedData.length < 5;

  const sliderSettings = {
    dots: true,
    infinite: !isFewItems,
    autoplay: isFewItems && formattedData.length > 1,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    speed: 700,
    slidesToShow: Math.min(5, formattedData.length || 1),
    slidesToScroll: 1,
   centerMode: true,
centerPadding: "10px",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    lazyLoad: "ondemand" as const,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: Math.min(4, formattedData.length || 1),
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, formattedData.length || 1),
          dots: true,
          centerMode: formattedData.length > 2,
          centerPadding: formattedData.length < 3 ? "20%" : "0px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, formattedData.length || 1),
          centerMode: false,
        },
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 1.3,
          centerMode: true,
          centerPadding: "12%",
        },
      },
    ],
  };

  const formattedCity =
    city?.length > 0
      ? city.charAt(0).toUpperCase() + city.slice(1)
      : "this city";

  return (
    <div className="relative w-full py-6 md:py-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[#eaf2ff] via-[#dfe3eb] to-transparent" />

      <div className="relative z-10 max-w-8xl mx-auto px-2 md:px-4 lg:px-0">
        <h1 className="text-center md:text-[24px] text-[18px] font-bold text-slate-900 leading-9 mb-2 md:mb-3">
          Explore Popular Localities in{" "}
          <span className="text-[#3586FF]">{formattedCity}</span>
        </h1>
        <p className="text-center text-[12px] md:text-[14px] text-slate-500 mb-6 md:mb-10">
          Discover neighbourhoods with active projects, best price ranges and
          ideal sizes for your next home.
        </p>

        <div className="px-1 md:px-2">
          <Slider
            ref={sliderRef}
            cssEase="linear"
            touchThreshold={10000}
            swipeToSlide
            touchMove
            className="popular-localities-slider"
            {...sliderSettings}
          >
            {formattedData?.map((item: any, index: number) => (
              <div key={index} className="px-8 m-2">
                <PopularCard
                  key={index}
                  locality={item.localty || item.locality}
                  location={item.location}
                  range={item.range}
                  sqft={item.sqft}
                  projectCount={item.projectCount}
                  link={item.link}
                />
              </div>
            ))}
          </Slider>
        </div>

        {showMoreLink && (
          <div className="mt-8 md:mt-10 flex justify-center">
            <Button
              className="
                inline-flex items-center gap-2
                text-[#3586FF] hover:text-[#2563eb]
                font-medium text-[14px] md:text-[16px]
                transition-colors group
              "
              onClick={() =>
                router.push(`/properties/${activeTab}/${city.toLowerCase()}`)
              }
            >
              <span className="leading-8">More Localities</span>
              <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">
                <RightArrow />
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Slider dots + arrows styling only for this slider */}
      <style jsx global>{`
        .popular-localities-slider .slick-dots {
          bottom: -32px;
          display: flex !important;
          justify-content: center;
          gap: 8px;
        }
        .popular-localities-slider .slick-dots li {
          margin: 0;
          width: 10px;
          height: 10px;
        }
        .popular-localities-slider .slick-dots li button {
          width: 10px;
          height: 10px;
          padding: 0;
        }
        .popular-localities-slider .slick-dots li button:before {
          font-size: 0;
        }
        .popular-localities-slider .slick-dots li button {
          background: #cbd5e1; /* slate-300 */
          border-radius: 9999px;
          transition: all 0.3s ease;
          opacity: 0.6;
        }
        .popular-localities-slider .slick-dots li.slick-active button {
          background: #3586FF;
          opacity: 1;
          transform: scale(1.3);
          box-shadow: 0 0 6px rgba(37, 99, 235, 0.5);
        }
        // .popular-localities-slider .slick-slide > div {
        //   padding: 0 12px;
        // }
        .popular-localities-slider .slick-slide {
  padding: 0 12px;   
}

.popular-localities-slider .slick-list {
  margin: 0 -12px;   
}

        .popular-localities-slider .slick-arrow {
          z-index: 30 !important;
        }
      `}</style>
    </div>
  );
};

export default React.memo(PopularLocalties);
