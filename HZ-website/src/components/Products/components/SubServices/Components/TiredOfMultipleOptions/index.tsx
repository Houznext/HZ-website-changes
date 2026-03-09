import React from "react";
import Image from "next/image";
import SectionSkeleton from "@/common/Skeleton";
import { useStrapiInteriorStore } from "@/store/strapiInteriorsData";

export interface ITiredOfMultipleOptionsProps {
  heading: string;
  subHeading: string;
  listitems: Array<{
    iconUrl: string;
    title: string;
    description: string;
  }>;
}

function TiredOfMultipleOptions({
  heading,
  listitems,
  subHeading,
}: ITiredOfMultipleOptionsProps) {
  const { loading } = useStrapiInteriorStore();

  return (
    <section className="w-full  py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-bold subheading-text text-[20px] md:text-[28px] leading-[1.3] text-[#0E0E0E]">
            {heading}
          </h1>
          <p className="mt-3 md:mt-4 font-regular label-text leading-[1.6] text-[#6B7280]">
            {subHeading}
          </p>
        </div>
        <div className="mt-6 md:mt-10">
          {loading ? (
            <SectionSkeleton type="interiorMarket" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-7">
              {listitems.map((item, index) => (
                <article
                  key={`option-${index}-${item.title}`}
                  className="group h-full flex flex-col rounded-2xl border border-[#E3E7F0] bg-white/90 shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-[#F3F6FC]">
                    <Image
                      src={item.iconUrl}
                      alt={item.title}
                      fill
                      className="object-contain p-4 md:p-5 group-hover:scale-105 transition-transform duration-200"
                      sizes="(min-width: 1024px) 250px, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>

                  <div className="flex flex-col flex-1 px-4 md:px-5 py-4 md:py-5">
                    <h3 className="font-bold text-[14px] md:text-[16px] leading-[1.5] text-[#0B1020]">
                      {item.title}
                    </h3>
                    <p className="mt-2 md:mt-3 font-regular sublabel-text leading-relaxed text-[#4B5563]">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TiredOfMultipleOptions;
