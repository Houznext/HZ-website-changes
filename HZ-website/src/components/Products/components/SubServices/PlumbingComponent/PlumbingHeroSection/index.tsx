import React from "react";
import Image from "next/image";
import CustomInput from "@/common/FormElements/CustomInput";
export interface HeroSectionProps {
  heading: string;
  bgimage: string;
  formdata: Array<{
    id: number;
    label: string;
    type: "text" | "email" | "password" | "number" | "textarea" | "url";
    placeholder: string;
    icon: React.ReactNode;
  }>;
}

export default function PlumbingHeroSection({
  heading,
  bgimage,
  formdata,
}: HeroSectionProps) {
  return (
    <>
      <div className="lg:h-[352px] flex items-center justify-center mx-auto  relative p-6 bg-black h-[350px] bg-opacity-[0.32]">
        <Image src={bgimage} alt="" fill={true} className="absolute -z-10" />
        <div className="flex flex-col items-center gap-y-[48px]">
          <div className="max-w-[337px] min-h-[72px]">
            <h2 className="text-[#F9F9F9]  text-[25px] leading-[35.62px] font-medium text-center">
              {heading}
            </h2>
          </div>
          <div className="max-w-[786px] min-h-[72px] flex md:flex-row flex-col items-center gap-x-[40px]">
            {formdata.map((data, index) => (
              <form>
                <div className=" w-[373px] max-w-[297px]">
                  <CustomInput
                    label=""
                    type={data.type}
                    name=""
                    labelCls=" font-medium text-[14px] leading-[22.8px] text-[#000000]"
                    placeholder={data.placeholder}
                    className="h-[50px]  w-full rounded-[8px] bg-[#FEFEFE] border-none"
                    leftIcon={data.icon}
                  />
                </div>
              </form>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
