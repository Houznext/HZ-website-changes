import React from "react";
import Image from "next/image";
export interface IElectronicHeroSectionProps {
  bgimage: string;
  listitems: Array<{
    id: number;
    image: string;
  }>;
}

export default function ElectronicHeroSection({
  bgimage,
  listitems,
}: IElectronicHeroSectionProps) {
  return (
    <>
      <div className="flex lg:flex-nowrap flex-wrap items-center justify-center mx-auto max-w-[1440px] ">
        <div className="md:max-w-[447px] md:min-h-[298px] max-w-[370px] min-h-[230px]">
          {listitems[0] && (
            <div className="md:max-w-[447px] md:min-h-[298px] max-w-[370px] min-h-[230px]">
              <div className="relative md:w-[447px] md:h-[298px] w-[370px] h-[230px]">
                <Image
                  src={listitems[0].image}
                  alt=""
                  fill
                  className="w-full h-full absolute object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
        <div className="  md:max-w-[573px] max-w-[370px] md:h-[298px] min-h-[250px] relative mx-auto">
          <Image
            src={bgimage}
            alt=""
            fill
            className="absolute -z-10 w-full h-full object-cover"
            unoptimized
          />

          <div className="flex    gap-x-[-10px] md:mt-[0px] mt-[10px]">
            <div className="flex flex-col items-center mx-auto md:pt-5 md:pl-8 pt-2 pl-3 md:ml-8 ml-8 ">
              <div className="md:max-w-[166px] max-w-[112px] min-h-[23px]">
                <h1 className="font-kaushan md:text-[16px]  md:leading-[23.22px] text-[13px] leading-[18.52px] tracking-[0.35px] text-left text-[#F9F9F9] text-nowrap">
                  {"The BIGger Sale".toUpperCase()}
                </h1>
              </div>
              <div className="md:max-w-[392px] max-w-[278px] md:min-h-[84px] min-h-[45px]">
                <h2 className="text-[#F9F9F9] font-jacques md:text-[32px] text-[30px] font-[400px] md:leading-[42.2px] leading-[30.52px]  tracking-[.3px] text-center  ">
                  {"HOME Appliance & Electronic".toUpperCase()}
                </h2>
              </div>
              <div className="md:max-w-[285px] max-w-[200px] md:min-h-[65px] min-h-[45px]">
                <h1 className="text-[#F9F9F9] font-jacques md:text-[24px] text-[16px] font-[400px] md:leading-[31.65px]  leading-[22.52px] text-left tracking-[.3px]">
                  UPTO{" "}
                  <span className="text-[#F9F9F9] font-jacques md:text-[40px] text-[24px] font-[400px] md:leading-[52.75px] leading-[28.52px] text-left tracking-[.3px]">
                    80% OFF
                  </span>
                </h1>
              </div>
              <div className="md:w-[392px] w-[289px] border-[1px] border-t-[#F9F9F9] border-b-[#F9F9F9] border-l-transparent border-r-transparent md:p-2 p-3">
                <div className="md:max-w-[345px] max-w-[290px] md:h-[46px] h-[26px] flex  items-center justify-center gap-x-[8px] md:ml-4 ml-2">
                  <div className="md:max-w-[59px] md:min-h-[46px] max-w-[39px] min-h-[26px]">
                    <h1 className="text-[#F9F9F9] font-regular md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-left tracking-[.3px]">
                      EXTRA UPTO
                    </h1>
                  </div>
                  <div className="md:max-w-[152px] md:min-h-[46px] max-w-[152px] min-h-[26px]">
                    <h1 className="text-[#F9F9F9] font-bold md:text-[32px] text-[24px]  md:leading-[45.6px] leading-[25.6px] text-left tracking-[.3px]">
                      10% OFF
                    </h1>
                  </div>
                  <div className="md:max-w-[118px] md:min-h-[46px] max-w-[98px] min-h-[26px]">
                    <h1 className="text-[#F9F9F9] font-regular md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-left ">
                      On purchasing From website
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-[107px] h-[107px]  pl-[24px] ">
              <Image
                src="/images/custombuilder/subservices/electronics/electronicherosection/bulbimage.png"
                alt=""
                fill
                className="w-full h-full absolute left-0 translate-x-[-80px] md:ml-[0px] ml-[45px] object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
        <div className="md:max-w-[435px] md:min-h-[298px] max-w-[370px] min-h-[230px]">
          {listitems[1] && (
            <div className="md:max-w-[435px] md:min-h-[299px] max-w-[370px] min-h-[230px]">
              <div className="relative md:w-[435px] md:h-[299px] w-[370px] h-[230px]">
                <Image
                  src={listitems[1].image}
                  alt=""
                  fill
                  className="w-full h-full absolute object-cover"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
