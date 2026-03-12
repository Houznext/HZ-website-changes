import Image from "next/image";
import { Mail, Phone } from "lucide-react";

const CostEstimationHeader = () => {
  return (
    <header className="w-full pb-4 mb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <img
              src="/images/houznext-logo-full-blue.png"
              alt="Houznext logo"
              className="h-10 md:h-12 w-auto"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="text-slate-800 font-medium md:text-sm text-xs space-y-1 md:text-right">
          <div
            className="flex md:justify-end whitespace-nowrap leading-none"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <a href="tel:+918498823043" className="hover:underline">
              +91&nbsp;84988&nbsp;23043
            </a>
          </div>
          <div className="flex md:justify-end whitespace-nowrap leading-none">
            <a href="mailto:business@houznext.com" className="hover:underline">
              business@houznext.com
            </a>
          </div>
        </div>

      </div>
    </header>
  );
};

export default CostEstimationHeader;
