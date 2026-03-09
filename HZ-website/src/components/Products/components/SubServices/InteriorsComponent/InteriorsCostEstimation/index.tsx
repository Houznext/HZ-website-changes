import React from "react";
import Image from "next/image";
import Button from "@/common/Button";
import { useRouter } from "next/navigation";
import { useStrapiInteriorStore } from "@/store/strapiInteriorsData";
import SectionSkeleton from "@/common/Skeleton";

export default function InteriorsCostEstimation() {
  const details = [
    "High-quality plywood with 10+ years warranty",
    "Branded hardware from Ebco/Hafele",
    "Customizable modular kitchen",
    "Bedroom & living room designs included",
    "Premium quality finish with multiple color options",
    "Upgraded lighting systems for modern appeal",
  ];
  const router = useRouter();

  const { interiorsStrapiData, loading } = useStrapiInteriorStore();

  const data = {
    heading: interiorsStrapiData.heroCardPrices?.[0]?.PriceEstimator?.heading,
    contentTitle: interiorsStrapiData.heroCardPrices?.[0]?.PriceEstimator?.contentTitle,
    contentDescription: interiorsStrapiData.heroCardPrices?.[0]?.PriceEstimator?.contentDescription,
    imageUrl: interiorsStrapiData.heroCardPrices?.[0]?.PriceEstimator?.imageUrl?.url,
    calculateBtnText: interiorsStrapiData.heroCardPrices?.[0]?.PriceEstimator?.calculateBtnText,
    subHeading: interiorsStrapiData.heroCardPrices?.[0]?.PriceEstimator?.subHeading,
  }



  return (
    <div className="flex flex-col items-center md:gap-y-[40px] gap-y-[20px] mx-auto max-w-[1392px]">
      <div className="flex flex-col items-center md:gap-y-[4px] gap-y-[5px]">
        <h1 className="font-bold uppercase md:text-[25px] text-[18px] md:leading-[35.62px] leading-[28.5px] text-[#212227]">
          {data.heading}
        </h1>
        <h2 className="font-regular px-3 text-center md:text-[18px] text-[14px] md:leading-[22.8px] leading-[15px] text-[#7B7C83] mt-2">
          {data.subHeading}
        </h2>
      </div>
      {loading ? (<SectionSkeleton type={"tiredOfMultipleOptionsSkeleton"} />) : (
        <div className="flex mx-auto shadow-custom w-full">
          <div className="relative w-[50%] md:h-[320px] h-[270px] md:block hidden">
            <Image
              src={data.imageUrl}
              fill
              alt="Interior"
              className="object-cover rounded-[4px]"
            />
          </div>

          <div className="md:pl-5  pl-0 md:py-6 py-3 flex flex-col justify-between items-center bg-white  rounded-[16px] w-full max-w-lg mx-auto md:h-[320px] h-[220px]">
            <div className="flex items-center justify-center">
              <div className="relative md:w-[100px] w-[70px] md:h-[100px] h-[70px] rounded-[8px]">
                <Image
                  src="/images/custombuilder/subservices/interiors/homeicon.png"
                  fill
                  alt="Home Icon"
                  className="object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col md:gap-y-4 gap-y-2 w-full text-center md:px-5 px-3 md:pb-[10px] pb-[5px]">
              <div className="font-bold  md:text-[20px]  text-[14px] text-[#000000]">
                {data.contentTitle}
              </div>
              <div className="font-medium text-[#7B7C83] md:text-[14px]  text-[12px] md:leading-[20px] leading-[18px]">
                {data.contentDescription}
              </div>
            </div>
            <Button
              className="bg-[#3586FF]  md:px-20 px-6 md:py-3 py-2 md:rounded-[6px] uppercase rounded-[4px] md:text-[16px] text-[12px] font-bold text-white cursor-pointer"
              onClick={() =>
                router.push("/interiors/cost-estimator")
              }
            >
              {data.calculateBtnText}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

