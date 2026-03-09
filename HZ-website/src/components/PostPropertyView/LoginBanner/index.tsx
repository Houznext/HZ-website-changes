import React from "react";
import Image from "next/image";
import PropertySlider from "@/components/PublicPostProperty/PropertySilder";

const stepsData = [
  {
    step: 1,
    desc: "Enter your Basic details",
  },
  {
    step: 2,
    desc: "Enter your property details",
  },
  {
    step: 3,
    desc: "Enter your locality details",
  },
  {
    step: 4,
    desc: "Upload Images & Videos",
  },
];
const LoginBanner = () => {
  return (
    <div className="px-[40px] md:py-[86px] py-[50px]">
      <div className="md:text-[42px] text-[24px] font-bold flex flex-col justify-center items-center">
        <h1 className="text-nowrap">Sell or Rent Your Property with</h1>
        <h2 className="text-[#3586FF]"> Zero Cost!</h2>
      </div>
      <div className="flex flex-col justify-center items-center ">
        <div className="flex flex-col justify-center items-center gap-2 md:mt-10 mt-0">
          <PropertySlider />
          <div className="md:text-[32px] text-[20px] font-regular">
            No Listing Fees
          </div>
        </div>
      </div>
      <div className="">
        <p className="md:text-[26px] text-[20px] font-medium text-center md:mt-10 mt-2 md:mb-5 mb-2">
          With three quick steps Your property will be Posted
        </p>
        <div className="flex flex-row justify-center items-center gap-4">
          {stepsData.map((item, index) => {
            return (
              <div className="" key={index}>
                <p className="text-[#3586FF] text-center">0{item.step}</p>
                <p className="text-center md:text-[14px] text-[10px]">
                  {" "}
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default LoginBanner;
