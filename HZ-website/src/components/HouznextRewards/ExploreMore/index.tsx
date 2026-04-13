import React from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Button from "@/common/Button";
import { CheckCircle } from "lucide-react";

export default function ExploreMore() {
  const router = useRouter();
  return (
    <>
      <div className="flex flex-col md:flex-row items-center md:max-w-6xl w-full mx-auto p-4 gap-8  bg-gradient-to-r from-indigo-50 to-blue-50 md:rounded-[10px] rounded-[4px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="md:w-1/2 w-full relative h-full md:min-h-[270px]  min-h-[170px] ">
          <Image
            src="/images/referandearn/referandearnexplore.jpg"
            alt="construction"
            fill
            className="object-cover md:rounded-[10px] rounded-[4px]"
          />
        </div>

        <div className="md:w-1/2">
          <div className="flex items-center gap-2 text-[#3586FF] md:text-[16px] text-[14px] font-medium mb-2">
            <CheckCircle className="w-5 h-5" />
            Trusted by 1000+ Home Owners
          </div>
          <h2 className="md:text-[22px] text-[18px] font-bold md:mb-4 mb-2">
            {" "}
            Smarter Home Construction{" "}
            <span className="text-[#3586FF]">Without the Stress</span>
          </h2>
          <p className="text-gray-600 md:mb-6 mb-3 font-regular">
            Let us guide your home construction journey.
          </p>
          <Button
            className="md:px-6 px-3 md:py-3 font-medium py-2 text-white md:text-[16px] text-[12px] bg-[#3586FF] hover:bg-[#3586FF] transition-colors md:rounded-[10px] rounded-[4px]"
            onClick={() => router.push("/services/custom-builder")}
          >
            Explore More
          </Button>
        </div>
      </div>
    </>
  );
}
