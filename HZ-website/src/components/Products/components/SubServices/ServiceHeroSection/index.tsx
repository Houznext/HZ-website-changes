import React from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/common/Button";
import { RightArrowWhite } from "@/components/Icons";
import { ArrowRight } from "lucide-react";
import ContactForm from "@/components/Products/components/SubServices/Components/ContactForm";

export interface IServiceHeroSectionInterfaceProps {
  heading: string;
  subHeading: string;
  bgImageUrl: string;
  bookingCtaUrl: { label: string; url: string };
  locationcta: Array<{
    label: string;
    url: string;
  }>;
  selectedId: {
    id: number;
    service: string;
    label?: string;
  };
}

function ServiceHeroSection({
  bookingCtaUrl,
  heading,
  locationcta,
  subHeading,
  bgImageUrl,
  selectedId,
}: IServiceHeroSectionInterfaceProps) {
  return (
    <div className="lg:h-[470px] relative p-6 bg-black h-[350px] bg-opacity-[0.32]">
      <Image
        src={`${bgImageUrl}`}
        alt=""
        fill={true}
        className="absolute -z-10"
      />
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="flex flex-col  w-full h-full justify-between  items-center py-5 md:py-3 px-5 ">
          <div className="mb-5 md:mb-8 w-full">
            <p className="text-[#FFFFFF] font-medium md:font-bold text-[24px] md:text-[27px]  lg:text-[40px] lg:leading-[44.17px] text-start mb-8 w-[50%]">
              {heading}
            </p>

            <p className="text-[#FFFFFF] md:font-medium md:text-[16px] lg:leading-[34.2px]  md:max-w-[500px] mb-[20px] md:mb-[0px]">
              {subHeading}
            </p>
          </div>
          <div className="mb-6 md:mb-0 w-full">
            <Button className="rounded-lg bg-[#3586FF] text-[13px] md:text-[16px] p-3 md:p-4 font-regular md:font-medium text-white  cursor-pointer">
              <Link href={bookingCtaUrl.url}>
                <div className="flex flex-row gap-2 ">
                  <p> {bookingCtaUrl.label}</p>
                  <div className="hover:rotate-90 transition-transform  duration-00 hover:ease-out ">
                    <ArrowRight className="w-full h-full text-white/80" />
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
        <div className=" md:w-[30%] w-full  md:mt-[0px] mt-[20%]">
          <ContactForm selectedId={selectedId} />
        </div>
      </div>
    </div>
  );
}

export default ServiceHeroSection;