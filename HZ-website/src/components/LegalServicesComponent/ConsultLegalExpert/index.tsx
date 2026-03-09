import React from "react";
import Image from "next/image";

export interface IConsultExpertWhyProps {
  heading: string;
  subheading: string;
  image: string;
  listItems: Array<{
    id: number;
    title: string;
    description: string;
    image: string;
  }>;
}

export default function ConsultLegalExpert({
  heading,
  image,
  subheading,
  listItems,
}: IConsultExpertWhyProps) {
  return (
    <section className="max-w-[1392px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col items-center text-center gap-2 md:gap-4 mb-8">
        <h2 className="font-bold mainheading-text text-[#111827]">
          {heading}
        </h2>
        <p className="max-w-[1100px] text-[12px] md:text-[14px] leading-[1.6] text-[#6B7280]">
          {subheading}
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 flex flex-col gap-5">
          {listItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 ${index % 2 !== 0 ? "md:pl-4" : "md:pr-4"
                }`}
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-[16px] md:text-[18px] text-[#111827] text-left">
                  {item.title}
                </h3>
                <p className="label-text text-[#4B4C4F] leading-snug text-left">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-[320px] h-[240px] md:w-[380px] md:h-[280px] lg:w-[420px] lg:h-[300px] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={image}
              alt="Consult a legal expert"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
