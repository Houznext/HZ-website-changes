import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LiaLongArrowAltRightSolid } from "react-icons/lia";
import SectionSkeleton from "@/common/Skeleton";

const insights = [
  {
    imageUrl: "/home/insight-1.png",
    heading: "Painting Cost Estimator",
    description:
      "Get expert guidance to estimate painting costs quickly and accurately for your space.",
    link: "/painting/paint-cost-calculator",
  },
  {
    imageUrl: "/home/insight-2.png",
    heading: "Vaastu Consultation",
    description:
      "Get expert advice to align your property with Vaastu principles for enhanced harmony and prosperity.",
    link: "/services/vaastu-consultation",
  },
  {
    imageUrl: "/home/insight-3.png",
    heading: "Interiors Cost Estimator",
    description:
      "Get instant interior cost estimates based on your preferences, space, and style—designed to fit your budget and vision.",
    link: "/interiors/cost-estimator",
  },
  {
    imageUrl: "/home/insight-4.png",
    heading: "Solar Panel Cost Calculator",
    description:
      "Calculate potential savings, energy output & ROI from solar panel installation at your property.",
    link: "/solar",
  },
];

const InsightsAndTools = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="md:px-6 px-4 py-2 mt-10 md:mt-[120px] mb-8 relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#EEF5FF] via-white to-transparent" />
      <h2
        className="
          text-center font-medium
          md:text-[26px] text-[18px]
          md:leading-[44px] leading-[28px]
          mb-6 md:mb-10
          select-none
        "
        style={{
          backgroundImage: "linear-gradient(90deg,#3586FF 20%,#0F172A 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        INSIGHTS & TOOLS
      </h2>

      {loading ? (
        <SectionSkeleton type="insideAndTools" />
      ) : (
        <div className="mx-auto max-w-[1240px]">
          <div className="
              grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
              gap-[14px] md:gap-5 lg:gap-6
            ">
            {insights.map((insight, i) => (
              <article
                key={`${insight.imageUrl}-${insight.link}-${i}-insight`}
                className="
                  group relative overflow-hidden
                  rounded-2xl border border-[#E0EAFF]
                  bg-gradient-to-b from-[#E7F0FF] to-white
                  shadow-[0_8px_28px_-14px_rgba(37,99,235,0.25)]
                  hover:shadow-[0_16px_40px_-16px_rgba(37,99,235,0.35)]
                  transition-all duration-300
                  md:px-6 md:py-6 px-3 py-4
                  min-h-[240px] md:min-h-[300px]
                  focus-within:ring-2 focus-within:ring-blue-400
                "
              >
                <span className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-blue-200/30 blur-2xl" />
                <div className="flex justify-center">
                  <Image
                    src={insight.imageUrl}
                    alt={insight.heading}
                    width={160}
                    height={120}
                    className="hidden md:block"
                    style={{ width: "auto", height: "auto" }}
                    priority={i < 2}
                  />
                  <Image
                    src={insight.imageUrl}
                    alt={insight.heading}
                    width={110}
                    height={90}
                    className="md:hidden block"
                    style={{ width: "auto", height: "auto" }}
                    priority={i < 2}
                  />
                </div>

                <h3 className="
                    text-center text-[#0B3A78]
                    md:text-[20px] text-[14px]
                    font-medium
                    md:mt-4 mt-2
                    md:mb-3 mb-1
                    leading-snug md:leading-[28px]
                    line-clamp-2
                  ">
                  {insight.heading}
                </h3>

                <p className="
                    text-center text-[#4C4D54]
                    md:text-[14px] text-[12px]
                    md:leading-[22px] leading-[16px]
                    md:mb-8 mb-5
                    line-clamp-3
                  ">
                  {insight.description}
                </p>

                <Link
                  href={insight.link}
                  className="
                    relative inline-flex items-center gap-2
                    text-[#2563EB] hover:text-[#1D4ED8]
                    font-medium
                    md:text-[16px] text-[13px]
                    md:leading-[22px] leading-[18px]
                    transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded
                  "
                >
                  <span>Explore Now</span>
                  <LiaLongArrowAltRightSolid
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    size={20}
                  />
                </Link>

                <span
                  aria-hidden
                  className="
                    absolute left-0 right-0 bottom-0 h-[3px]
                    bg-gradient-to-r from-transparent via-[#3586FF] to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  "
                />
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default InsightsAndTools;
