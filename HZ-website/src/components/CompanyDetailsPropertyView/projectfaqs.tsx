import Button from "@/common/Button";
import { useState } from "react";
import { MdArrowDownward, MdArrowForward } from "react-icons/md";

const FAQSection = ({
  data,
}: {
  data: { faqs: { question: string; answer: string }[] };
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const visibleFaqs = showAll ? data?.faqs : data?.faqs?.slice(0, 3);

  return (
    <>
      {data?.faqs?.length > 0 && (
        <div className="w-full flex flex-col gap-4 border rounded-md bg-white md:p-4 p-2">
          <div className="flex flex-col divide-y">
            {visibleFaqs.map((item, index) => (
              <div
                key={index}
                className="py-3 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex justify-between items-center">
                  <p className="text-[10px] md:text-[14px] font-medium text-[#535151]">
                    {item?.question}
                  </p>
                  <span className="text-[16px] text-gray-500">
                    {openIndex === index ? <MdArrowDownward /> : <MdArrowForward />}
                  </span>
                </div>
                {openIndex === index && (
                  <p className="mt-2 md:text-[12px] font-regular text-[8px] text-gray-900">
                    {item?.answer}
                  </p>
                )}
              </div>
            ))}
          </div>

          {data.faqs.length > 3 && (
            <div className="flex justify-center md:mt-4 mt-0">
              <Button
                className="md:text-[16px] text-[10px] font-medium text-gray-800 hover:underline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "See Less" : "See More"}
              </Button>
            </div>
          )}

          <div className="my-1 h-[1px] w-full bg-gray-300"></div>
          <div>
            <p className="md:text-[12px] font-regular text-[8px] text-gray-600">
              *Disclaimer: The information provided in this section is based on
              the property details and is not guaranteed to be accurate or
              up-to-date. Please refer to the property for the most current and
              up-to-date information.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FAQSection;
