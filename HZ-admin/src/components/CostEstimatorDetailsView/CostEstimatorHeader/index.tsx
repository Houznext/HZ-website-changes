import Image from "next/image";
import Link from "next/link";
import { AiOutlineMail } from "react-icons/ai";
import { FiPhone } from "react-icons/fi";

const CostEstimationHeader = () => {
  return (
    <header className="w-full pb-4 mb-6 border-b border-gray-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg border border-gray-200 bg-white">
            <Image
              src="/images/background/newlogo.png"
              alt="OneCasa logo"
              fill
              className="object-contain p-1.5"
              sizes="48px"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="flex items-baseline  font-bold tracking-wide">
              <span className="text-lg md:text-xl">ONE</span>
              <span className="text-lg md:text-xl text-[#3586FF] ">CASA</span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-600 font-medium">
              One Roof. Every Solution
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="text-gray-700 font-medium md:text-sm text-xs space-y-1">
          {/* Phones */}
          <div
            className="flex items-center gap-2 whitespace-nowrap leading-none"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <FiPhone className="w-4 h-4 relative top-[1px] shrink-0" />
            <div className="flex items-center gap-2">
              <a href="tel:+918639820425" className="hover:underline">
                +91&nbsp;8639820425
              </a>
              <span aria-hidden="true">•</span>
              <a href="tel:+918897574909" className="hover:underline">
                8897574909
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 whitespace-nowrap leading-none">
            <AiOutlineMail className="w-4 h-4 relative top-[1px] shrink-0" />
            <a href="mailto:sales@onecasa.in" className="hover:underline">
              sales@onecasa.in
            </a>
          </div>
        </div>

      </div>
    </header>
  );
};

export default CostEstimationHeader;
