import Button from "@/common/Button";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ServicesCard = () => {
  const router = useRouter();
  const services = [
    {
      image: "/images/services/residential.png",
      label: "Construction",
      href: "/custom-builder",
    },
    {
      image: "/images/services/business-residential.png",
      label: "Construction for Business",
      href: "/services/construction-for-business",
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
  ];

  const handleClick = (index: number) => {
    router.push(services[index].href);
  };

  return (
    <div className="flex flex-wrap gap-6">
      {services.map((service: any, index: number) => (
        <div
          key={index}
          className="flex flex-col gap-3 px-2 shadow-md max-w-[310px] rounded-[12px] cursor-pointer hover:scale-[103%] transition-all ease-in-out duration-500"
          onClick={() => handleClick(index)}
        >
          <div className="relative h-[232px] w-[300px] rounded-[2%]">
            <Image
              src={service.image}
              alt={`${service.label}_img`}
              fill
              className="rounded-[2%] object-cover "
            />
          </div>
          <div className="flex flex-row justify-between items-center py-4 px-3">
            <p className="font-medium text-[20px] leading-7">
              {service.label}
            </p>
            <Button
              href={service.href}
              className="bg-[#4992FF] text-white p-1 rounded-md text-[16px] text-nowrap"
            >
              <p className="text-white">View More</p>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesCard;
