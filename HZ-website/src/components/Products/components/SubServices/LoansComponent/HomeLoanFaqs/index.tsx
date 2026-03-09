import React, { useState } from "react";
import { RightViewArrow } from "@/components/Icons";
import { String } from "aws-sdk/clients/cloudhsm";
export interface IHomeLoanFaqsprops {
  heading: string;
  Faqs: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
}
export default function HomeLoanFaqs({ heading, Faqs }: IHomeLoanFaqsprops) {
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const handleClick = (index: number) => {
    setOpen((prev) => {
      return { ...prev, [index]: !prev[index] };
    });
  };
  return (
    <>
      <div className="flex flex-col items-center md:gap-y-[48px] gap-y-[20px]">
        <div>
          <h1 className="max-w-[313px] min-h-[34px] font-bold md:text-[24px] text-[18px] text-[#000000] leading-[34.2px] text-center md:text-nowrap text-wrap">
            {heading}
          </h1>
        </div>

        <div className="w-full max-w-[1156px] min-h-[432px] bg-[#FFFFFF]   rounded-[16px] px-4 sm:px-6 md:px-8">
          {Faqs.map((faq: { question: string, answer: string }, index: number) => (
            <div
              key={index}
              className="
             border border-[#E6E5E5] rounded-xl bg-white shadow-sm
             px-5 py-4 mb-4 transition hover:shadow-md
           "
            >
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => handleClick(index)}
              >
                <h2 className="md:text-[16px] text-[14px] font-medium text-gray-900">
                  {faq.question}
                </h2>
                <span
                  className={`transform transition-transform duration-300 text-[#3586FF] ${open[index] ? "rotate-90" : ""
                    }`}
                >
                  <RightViewArrow />
                </span>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open[index] ? "max-h-96 mt-3" : "max-h-0"
                  }`}
              >
                <p className="md:text-[15px] text-[13px] font-regular text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>

          ))}
        </div>
      </div>
    </>
  );
}
