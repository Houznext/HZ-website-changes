import Image from "next/image";
import React, { useMemo, useState } from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export type PartnerItem = { image: string; name?: string; url?: string };

function Arrow({ direction, onClick }: { direction: "prev" | "next"; onClick?: () => void }) {
  return (
    <button
      aria-label={direction === "prev" ? "Previous" : "Next"}
      onClick={onClick}
      className={[
        "absolute z-10 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center",
        "h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white transition",
        direction === "prev" ? "-left-5" : "-right-5",
      ].join(" ")}
    >
      {direction === "prev" ? (
        <ChevronLeft className="text-slate-700" />
      ) : (
        <ChevronRight className="text-slate-700" />
      )}
    </button>
  );
}

const defaultImages: PartnerItem[] = [
  { image: "/partners/1.png", name: "Partner 1" },
  { image: "/partners/2.png", name: "Partner 2" },
  { image: "/partners/3.png", name: "Partner 3" },
  { image: "/partners/4.png", name: "Partner 4" },
  { image: "/partners/5.png", name: "Partner 5" },
  { image: "/partners/6.png", name: "Partner 6" },
  { image: "/partners/7.png", name: "Partner 7" },
];

export default function Partners({ images = defaultImages }: { images?: PartnerItem[] }) {
  const [current, setCurrent] = useState(0);

  const settings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      autoplay: true,
      autoplaySpeed: 2600, // feel smoother
      speed: 600,
      slidesToShow: 5,
      slidesToScroll: 1,
      prevArrow: <Arrow direction="prev" />,
      nextArrow: <Arrow direction="next" />,
      centerMode: false,
      swipeToSlide: true,
      beforeChange: (_: number, next: number) => setCurrent(next),
      customPaging: (i: number) => (
        <span
          className={[
            "inline-block h-1.5 rounded-full transition-all duration-300",
            i === current ? "w-8 bg-[#3586FF]" : "w-2 bg-slate-300",
          ].join(" ")}
        />
      ),
      responsive: [
        {
          breakpoint: 1280,
          settings: { slidesToShow: 5 },
        },
        {
          breakpoint: 1024,
          settings: { slidesToShow: 4 },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 3 },
        },
        {
          breakpoint: 520,
          settings: { slidesToShow: 2 },
        },
      ],
    }),
    [current]
  );

  return (
    <section className="w-full py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-[18px] md:text-[24px]  font-bold text-[#3586FF]">Partners</h2>
          <p className="font-regular text-[12px] md:text-[14px] text-slate-600">Trusted by brands we proudly work with</p>
          <div className="w-20 h-[3px] bg-[#3586FF] mx-auto mt-3 rounded-full"></div>
        </div>

        <div className="relative">
          <div className="partner-mask pointer-events-none absolute -inset-x-6 -inset-y-1 bg-gradient-to-r from-white via-transparent to-white [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" />
          <Slider {...settings}>
            {images.map((it, idx) => {
              const Card = (
                <div className="px-2">
                  <div className="group relative mx-auto h-24 md:h-28 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition overflow-hidden flex items-center justify-center hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-white to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3586FF] to-blue-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                    <div className="relative w-[85%] h-[70%] grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition">
                      <Image src={it.image} alt={it.name || `Partner ${idx + 1}`} fill className="object-contain" />
                    </div>
                  </div>
                </div>
              );
              return it.url ? (
                <Link key={idx} href={it.url} target="_blank" rel="noopener noreferrer" aria-label={it.name || `Partner ${idx + 1}`}>
                  {Card}
                </Link>
              ) : (
                <div key={idx}>{Card}</div>
              );
            })}
          </Slider>
        </div>

        <div className="mt-10 md:mt-12 lg:mt-16 flex items-center justify-center relative">

          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl"></div>

          <Link
            href="#become-a-partner"
            className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-3 text-xs md:text-sm font-medium text-slate-700 hover:border-[#3586FF] hover:text-[#3586FF] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
          >
            Become a Partner
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}