import React from "react";
import Image from "next/image";
import { LuArrowRight } from "react-icons/lu";
export interface HomeDecorHeroSectionprops {
  bgimage: string;

  heading: string;
  subheading: string;
  listimages: Array<{
    image: string;
  }>;
}
export default function HomeDecorHeroSection({
  bgimage,
  listimages,
  heading,
  subheading,
}: HomeDecorHeroSectionprops) {
  return (
    <>
      <div className="max-w-[1440px] md:min-h-[299px] min-h-[399px] flex items-center lg:flex-nowrap flex-wrap   mx-auto">
        <div className="  md:max-w-[573px] max-w-[370px] md:h-[298px] min-h-[250px] relative mx-auto">
          <Image
            src={bgimage}
            alt=""
            fill
            className="absolute -z-10 w-full h-full object-cover"
            unoptimized
          />

          <div className="flex items-start justify-center gap-x-[2px] md:mt-[0px] mt-[10px]">
            <div className="flex flex-col items-center mx-auto md:pt-5 md:pl-8 pt-2 pl-3 md:ml-8 ml-8 ">
              <div className="md:max-w-[166px] max-w-[112px] min-h-[23px]">
                <h1 className="font-kaushan md:text-[16px]  md:leading-[23.22px] text-[13px] leading-[18.52px] tracking-[0.35px] text-left text-[#3C1C81]">
                  {"The BIG Sale".toUpperCase()}
                </h1>
              </div>
              <div className="md:max-w-[392px] max-w-[278px] md:min-h-[65px] min-h-[45px]">
                <h2 className="text-[#3C1C80] font-jacques md:text-[49px] text-[30px] font-[400px] md:leading-[64.62px] leading-[30.52px] text-left tracking-[.3px]">
                  HOME DECOR
                </h2>
              </div>
              <div className="md:max-w-[285px] max-w-[200px] md:min-h-[65px] min-h-[45px]">
                <h1 className="text-[#3C1C80] font-jacques md:text-[24px] text-[16px] font-[400px] md:leading-[31.65px]  leading-[22.52px] text-left tracking-[.3px]">
                  UPTO{" "}
                  <span className="text-[#3C1C80] font-jacques md:text-[40px] text-[24px] font-[400px] md:leading-[52.75px] leading-[28.52px] text-left tracking-[.3px]">
                    80% OFF
                  </span>
                </h1>
              </div>
              <div className="md:w-[392px] w-[289px] border-[1px] border-t-[#000000] border-b-[#000000] border-l-transparent border-r-transparent md:p-2 p-3">
                <div className="md:max-w-[345px] max-w-[290px] md:h-[46px] h-[26px] flex  items-center justify-center gap-x-[4px] md:ml-4 ml-2">
                  <div className="md:max-w-[59px] md:min-h-[46px] max-w-[39px] min-h-[26px]">
                    <h1 className="text-[#3C1C80] font-regular md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-left tracking-[.3px]">
                      EXTRA UPTO
                    </h1>
                  </div>
                  <div className="md:max-w-[152px] md:min-h-[46px] max-w-[152px] min-h-[26px]">
                    <h1 className="text-[#3C1C80] font-bold md:text-[32px] text-[24px]  md:leading-[45.6px] leading-[25.6px] text-left tracking-[.3px]">
                      10% OFF
                    </h1>
                  </div>
                  <div className="md:max-w-[118px] md:min-h-[46px] max-w-[98px] min-h-[26px]">
                    <h1 className="text-[#3C1C80] font-regular md:text-[16px] text-[13px] md:leading-[22.8px] leading-[18.52px] text-left ">
                      On purchasing From website
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-[107px] h-[107px] md:mr-7 mr-3">
              <Image
                src="/images/custombuilder/subservices/homedecor/decorherosection/bulbimage.png"
                alt=""
                fill
                className="w-full h-full absolute top-0 right-5 -translate-x-12 object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
        <div className="  relative  mx-auto">
          <div className="lg:max-w-[868px] md:max-w-[700px] md:min-h-[299px]  max-w-[370px]  flex md:flex-nowrap flex-wrap items-center">
            {listimages.map((item, index) => {
              return (
                <div key={item.image ?? index} className=" lg:max-w-[290px] md:min-h-[298px] md:max-w-[230px] max-w-[123px] min-h-[190px] relative  bg-[#00000059] bg-opacity-[0.35]">
                  <div className="relative lg:w-[290px] md:h-[298px] md:w-[230px] w-[123px] h-[190px]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="absolute top-0 left-0 w-full h-full z-0 object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-10"></div>
                </div>
              );
            })}
          </div>
          <div className="max-w-[541px] min-h-[78px] absolute md:top-10 top-5 left-6 z-20 flex flex-col items-start md:gap-y-[4px] gap-y-[2px]">
            <div className="max-w-[375px] min-h-[42px]  ">
              <h1 className="text-[#D0B9FF] font-jacques md:text-[32px] text-[20px]  font-[400px] md:leading-[42.2px] leading-[28.52px] text-left">
                {heading}
              </h1>
            </div>
            <div className="flex md:items-center  items-start md:gap-x-[8px] gap-x-[4px] ">
              <h1 className="md:max-w-[509px] md:min-h-[32px] max-w-[400px] min-h-[42px] text-[#FFFFFF] font-jacques md:text-[24px] text-[16px]  font-[400px] md:leading-[31.65px] leading-[22.8px] text-left">
                {subheading}
              </h1>
              <h1>
                <LuArrowRight className="text-[#FFFFFF] w-[24px] h-[24px]" />
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
