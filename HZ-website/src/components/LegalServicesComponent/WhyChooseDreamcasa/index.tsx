import React from "react";
import Image from "next/image";

export interface IWhyChooseDreamcasaprops {
  heading: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
    cardwidth: string;
  }>;
}

export default function WhyChooseDreamcasa({
  heading,
  listItems,
}: IWhyChooseDreamcasaprops) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6">
      <div className="flex flex-col items-center gap-8 md:gap-10">
        <h2 className="text-center font-bold text-[22px] md:text-[26px] text-[#111827]">
          {heading}
        </h2>

        <div className="w-full rounded-2xl bg-[#E5F0FF] px-4 md:px-8 py-8 md:py-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {listItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col items-center text-center ${item.cardwidth} min-h-[220px] gap-4`}
            >
              <div className="relative w-[200px] h-[180px] md:w-[220px] md:h-[190px]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="max-w-[320px] font-medium text-[16px] md:text-[18px] text-[#111827] leading-snug">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
