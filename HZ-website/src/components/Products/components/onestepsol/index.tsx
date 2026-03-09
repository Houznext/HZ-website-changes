import React from "react";
import Image from "next/image";
import {
  ConstructionGIcon,
  HiddenIcon,
  SubCIcon,
  TimeDIcon,
} from "../../icons";
import Link from "next/link";

const data = [
  {
    image: <TimeDIcon />,
    title: "TIMELY DELIVERY",
    desc: "We provide expert on-time home building services across all budget ranges in this dynamic market.",
  },
  {
    image: <HiddenIcon />,
    title: "NO HIDDEN CHARGES",
    desc: "One lump sum cost till the completion and handover of the project.",
  },
  {
    image: <ConstructionGIcon />,
    title: "CONSTRUCTION GUARANTEE",
    desc: "We provide 1 year construction guarantee and 10 year waterproofing warranty.",
  },
  {
    image: <SubCIcon />,
    title: "NO SUBCONTRACTING",
    desc: "Our in-house team covers all : architecture, structure, construction, electrical, plumbing, and interiors.",
  },
];
const services = [
  {
    image: "/images/services/business-residential.png",
    label: "Construction",
    href: "/custom-builder",
  },
  {
    image: "/images/services/interiors.png",
    label: "Interiors",
    href: "/interiors",
  },
  {
    image: "/images/services/furnitures.png",
    label: "Furniture",
    href: "/services/furnitures",
  },
  {
    image: "/images/services/plumbing.png",
    label: "Plumbing",
    href: "/services/plumbing",
  },
  {
    image: "/images/services/painting.png",
    label: "Painting",
    href: "/painting",
  },
  {
    image: "/images/services/vaastu.png",
    label: "Vastu Consultation",
    href: "/services/vaastu-consultation",
  },
  {
    image: "/images/services/civilEngineering.png",
    label: "Civil Engineerings Design",
    href: "/services/civilEngineering",
  },
  {
    image: "/images/services/loan.jpg",
    label: "Loans",
    href: "/services/loans",
  },
];
const OneStopSol = () => {
  return (
    <div className="relative mt-[30px] md:mt-[100px]">
      <div className="flex flex-col md:gap-[10px] gap-[5px] md:mb-[40px]">
        <p className=" heading-text font-bold text-center  ">
          Our Services
        </p>
        <p className="md:text-[16px] max-w-[80%] text-center  text-[14px] font-regular mx-auto text-gray-500 md:mb-[20px] mb-[10px]">
          We provide comprehensive solutions for building your dream home.
        </p>
        <div className="flex  flex-row flex-wrap flex-1 gap-[20px] mb-[40px] justify-center">
          {services.map((item, index) => {
            return (
              <Link
                href={item.href}
                key={`${item.href}-${item.image}-${index}`}
                className="group block"
              >
                <div
                  key={index}
                  className="relative md:h-[150px] md:w-[200px] w-[120px] h-[120px] md:rounded-[10px] rounded-[6px] hover:shadow-2xl overflow-clip"
                >
                  <Image
                    src={item.image}
                    alt=" services_img"
                    fill
                    sizes="(max-width: 768px) 154px, 324px"
                    style={{ objectFit: "cover" }}
                    className="absolute md:rounded-[10px] rounded-[6px] group-hover:scale-125 transition-all ease-in-out duration-500 w-full h-full overflow-hidden"
                  />
                  <div className="absolute bottom-0 md:py-[10px] py-[4px] md:px-[10px] px-[10px] bg-[#081221] transition-all ease-in-out duration-500 w-full rounded-b-[10px]">
                    <p className="text-center text-[#EFEFEF] group-hover:text-[#3586FF] transition-all ease-in-out duration-500 font-medium md:text-[14px] text-[10px] ">
                      {item.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OneStopSol;
