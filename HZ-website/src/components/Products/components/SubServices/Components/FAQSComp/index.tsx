import { RightViewArrow } from "@/components/Icons";
import React, { useState } from "react";
import Image from "next/image";

interface FAQSProps {
  image?: string;
  faqs: { question: string; answer: string }[];
}

const FAQSComp = ({ image, faqs }: FAQSProps) => {
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});

  const handleClick = (index: number) => {
    setOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="mt-12 mx-auto rounded-lg  mb-10">
      <h1 className="leading-9 md:text-[24px] text-[18px] font-bold text-center md:mb-8 mb-4 text-[#081221]">
        Frequently Asked Questions
      </h1>
      <div className="flex flex-row md:flex-nowrap flex-wrap w-full px-[24px] gap-7 items-start justify-center mt-6">
        <div className="hidden md:block w-[30%] relative h-[320px]">
          {image && (
            <Image
              src={image}
              alt="faq"
              fill
              className="rounded-tl-[104px] object-cover rounded-br-[105px] shadow-lg"
            />
          )}
        </div>

        <div className="md:max-w-[800px] max-w-[398px]  flex flex-col gap-4  overflow-y-auto custom-scrollbar">
          {faqs.map((faq, index) => {
            const isOpen = open[index];
            return (
              <div
                key={index}
                className="
                  border border-gray-200 rounded-xl 
                  bg-white shadow-sm hover:shadow-md
                  transition-all duration-300
                  p-2 md:p-3
                "
              >
                <div
                  className="flex flex-row items-center justify-between cursor-pointer select-none"
                  onClick={() => handleClick(index)}
                >
                  <h2 className="md:text-[16px] text-[12px] font-medium text-[#081221]">
                    {faq.question}
                  </h2>
                  <span
                    className={`
                      transform transition-transform duration-300
                      ${isOpen ? "rotate-90 text-[#3586FF]" : "text-gray-500"}
                    `}
                  >
                    <RightViewArrow />
                  </span>
                </div>

                <div
                  className={`
                    grid transition-all duration-500 ease-in-out
                    ${isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}
                  `}
                >
                  <div className="overflow-hidden">
                    <p className="md:text-[12px] text-[10px] font-regular text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQSComp;
