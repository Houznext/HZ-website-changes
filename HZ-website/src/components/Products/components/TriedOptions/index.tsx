import React from "react";
import Image from "next/image";
import { BudgetIcon, OnTimeIcon, SubContractIcon } from "../../icons";

const data = [
  {
    id: 1,
    title: "On-Time Delivery",
    description:
      "We provide expert on-time home building services across all budget ranges in this dynamic market.",
    image: "/images/custombuilder/tried/on-time.png",
    icon: <OnTimeIcon />,
  },
  {
    id: 2,
    title: "No Sub-Contracting",
    description:
      "Our in-house team covers all: architecture, structure, construction, electrical, plumbing, and interiors.",
    image: "/images/custombuilder/tried/sub-contract.png",
    icon: <SubContractIcon />,
  },
  {
    id: 3,
    title: "Construction Guarantee",
    description:
      "We provide 1 year construction guarantee and 10 year waterproofing warranty.",
    image: "/images/custombuilder/tried/gurantee1.png",
    icon: <OnTimeIcon />,
  },
  {
    id: 4,
    title: "No Hidden Charges",
    description:
      "One lump sum cost till the completion and handover of the project.",
    image: "/images/custombuilder/tried/hidden.png",
    icon: <BudgetIcon />,
  },
];

const TriedOptions = () => {
  return (
    <div className="flex flex-col justify-center items-center mb-5">
      <div className="flex flex-col md:gap-5 gap-3 justify-center items-center mb-10">
        <p className="font-bold md:text-[24px] text-[20px] leading-7 text-center">
          Tired of multiple options available in the market?
        </p>
        <p className="max-w-[400px] font-regular md:text-[16px] text-[12px] text-[#7B7C83] text-center">
          No more worries! Here at Houznext, we provide all-round services in
          every price range!
        </p>
      </div>

      <div className="flex flex-wrap gap-5 items-center justify-center">
        {data.map((item) => (
          <div
            key={item.id}
            className="md:w-[270px] w-[150px] h-auto min-h-[240px] shadow-custom flex flex-col    rounded-[8px] transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative md:w-[270px] md:h-[120px] w-[150px] h-[110px]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 150px, (min-width: 768px) 330px"
                className="rounded-t-[10px] object-cover"
              />
              <div className="absolute inset-0  flex justify-center items-end ">
                <p className="bg-white p-3 rounded-[50%] md:w-[64px] w-[40px] h-[40px] md:h-[64px]">
                  <span className="w-[20px] h-[20px] md:w-[40px] md:h-[40px] flex items-center justify-center">
                    {item.icon}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 py-4 px-3">
              <p className="md:text-[18px] text-[14px] font-bold">
                {item.title}
              </p>
              <p className="md:text-[12px]  text-[10px] text-[#7B7C83]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TriedOptions;
