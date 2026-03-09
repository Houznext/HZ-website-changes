import { RightViewArrow } from "@/components/Icons";
import React, { useState } from "react";
import Image from "next/image";
export interface IFrequentlyAskedQuestionsprops {
  image: string;
  heading: string;
  Faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export default function FrequentlyAskedQuestions({
  heading,
  Faqs,
  image,
}: IFrequentlyAskedQuestionsprops) {
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const handleClick = (index: number) => {
    setOpen((prev) => {
      return { ...prev, [index]: !prev[index] };
    });
  };

  return (
    <div className="  mx-auto   md:min-h-[540px] md:max-w-[1392px] max-w-[398px] min-h-[548px] flex flex-col gap-y-[61px] ">
      <h1 className=" max-h-[356px] min-h-[36px] leading-[35.62px] text-[25px] font-medium text-center mb-6 text-[#000000]">
        {heading}
      </h1>
      <div className=" flex flex-wrap lg:flex-row gap-x-[60px]  md:flex-row  sm:flex-col items-center justify-center ">
        <div className="lg:w-[30%] relative h-[530px] hidden md:block ">
          <Image
            src={image}
            alt="faq"
            width={451}
            height={415}
            className="max-w-[451px] min-h-[415px] border-[3px] border-solid border-[#E8E8E8] rounded-tl-[104px] rounded-br-[105px] object-cover"
          />
        </div>
        <div className="lg:max-w-[917px]  lg:w-[60%] flex flex-col gap-y-[24px]   md:max-h-[540px] mb-[20px]  ">
          {Faqs.map(
            (faq: { question: string; answer: string }, index: number) => (
              <div
                key={index}
                className="flex flex-col  border-[1px] border-[#E6E5E5] py-6 px-4   rounded-[8px] shadow-custom"
              >
                <div className="flex flex-row items-center  justify-between">
                  <h2 className="  min-h-[23px] text-[16px] font-medium leading-[22.8px] text-[#000000] ">
                    {faq.question}
                  </h2>
                  <p
                    onClick={() => handleClick(index)}
                    className={`transform transition-transform duration-300  cursor-pointer ${open[index] ? "rotate-90" : ""
                      }`}
                  >
                    <RightViewArrow />
                  </p>
                </div>
                <div
                  className={`overflow-hidden transition-max-height duration-600 ease-in-out ${open[index] ? "max-h-96" : "max-h-0"
                    }`}
                >
                  <p className="text-[16px] font-regular leading-9 text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
