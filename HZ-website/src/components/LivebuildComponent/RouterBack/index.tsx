import React from "react";
import { useRouter } from "next/router";
import { MdArrowBack } from "react-icons/md";

export default function RouterBack() {
  const router = useRouter();

  return (
    <div className="w-full">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 px-3 md:py-1.5 py-1 md:rounded-[8px] rounded-[4px] bg-gray-50 hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200"
      >
        <MdArrowBack className="text-gray-700 group-hover:-translate-x-1 transition-transform duration-300 md:w-[22px] md:h-[22px] w-[16px] h-[16px]" />
        <span className="font-medium text-gray-800 md:text-[14px] text-[12px] group-hover:text-[#3586FF] transition-colors duration-300">
          Back
        </span>
      </button>
    </div>
  );
}
