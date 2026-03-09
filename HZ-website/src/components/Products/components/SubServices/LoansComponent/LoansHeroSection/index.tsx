import React from "react";
import Image from "next/image";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";
export interface ILoansHeroSectionprops {
  heading: string;
  subheading: string;
  bgimageurl: string;

  iconurl: string;
  listItems: Array<{
    id: number;
    loanicon: string;
    loanicontext: string;
  }>;
}

export default function LoansHeroSection({
  heading,
  subheading,
  bgimageurl,
  listItems,
  iconurl,
}: ILoansHeroSectionprops) {
  return (
    <>
      <div className="max-w-[1440px] md:h-[604px] h-[370px]  relative mx-auto p-6 bg-black bg-opacity-[0.45] flex items-center justify-center flex-wrap ">
        <Image src={bgimageurl} alt="" fill={true} className="absolute -z-10" />
        <div className="flex flex-wrap items-center justify-center  gap-x-[469px] gap-y-[30px] ">
          <div className="flex flex-col  md:gap-y-[16px] gap-y-[5px]">
            <div className="md:max-w-[422px] max-w-[370px] min-h-[68px] flex items-center md:pl-0 pl-5 gap-x-[16px]">
              <div className="max-w-[276px] min-h-[68px] font-bold md:text-[48px] text-[30px] leading-[68.4px] text-left text-[#FFFFFF]">
                {heading}
              </div>
              <div className="max-w-[130px] min-h-[68px] flex items-center">
                <h1 className="max-w-[28px] min-h-[68px] font-bold md:text-[48px] text-[30px] leading-[68.4px] text-left text-[#FFFFFF]">
                  L
                </h1>
                <Image
                  src={iconurl}
                  width={34}
                  height={34}
                  objectFit="cover"
                  alt="icon"
                />
                <h1 className="max-w-[60px] min-h-[68px] font-bold md:text-[48px] text-[30px] leading-[68.4px] text-left text-[#FFFFFF]">
                  an
                </h1>
              </div>
            </div>

            <h2 className="max-w-[526px] min-h-[46px] font-medium md:text-[32px] text-[20px] md:pl-0 pl-5 md:leading-[45.6px] leading-[31.6px] text-left  text-[#FFFFFF]">
              {subheading}
            </h2>

            <div className="flex flex-col gap-y-[8px] md:pl-0 pl-5">
              {listItems.map((item, index) => {
                return (
                  <div
                    className="flex items-center max-w-[387px] min-h-[32px]"
                    key={index}
                  >
                    <div>
                      <Image
                        src={item.loanicon}
                        alt="loanicon"
                        width={32}
                        height={32}
                      />
                    </div>
                    <h1 className="max-w-[347px] min-h-[29px] font-medium md:text-[20px] text-[16px] leading-[28.5px] text-left text-[#FFFFFF]">
                      {item.loanicontext}
                    </h1>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:max-w-[481px] max-w-[350px] min-h-[500px] rounded-[8px] flex flex-col items-center bg-[#FFFFFF] gap-y-[16px] md:px-[18px] px-[8px] ">
            <p className="max-w-[215px] min-h-[29px] font-medium md:text-[20px] text-[18px] leading-[28.5px]text-left text-[#000000] pt-[20px]">
              Check Your Eligibility
            </p>
            <h1 className="w-[333px] h-[0px] border-[1px] border-[#808080] bg-opacity-40"></h1>
            <form>
              <div className=" md:max-w-[410px] max-w-[310px] flex items-center flex-col gap-y-[18px]  mx-auto ">
                <CustomInput
                  name={""}
                  type={"text"}
                  placeholder="Name * "
                  rootCls=" "
                  className="  w-full min-h-[35px]  rounded-[8px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px] border-[#979797] border-[1px] px-[5px] placeholder:text-[13px] placeholder:leading-[18.52px] placeholder:text-[#7B7B80] placeholder:font-regular placeholder:max-w-[50px] placeholder:min-h-[19px]"
                />
                <CustomInput
                  name={""}
                  type={"number"}
                  placeholder="Phone Number * "
                  className="w-full h-[35px]  rounded-[8px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px] border-[#979797] border-[1px] px-[5px] placeholder:text-[13px] placeholder:leading-[18.52px] placeholder:text-[#7B7B80] placeholder:font-regular placeholder:max-w-[109px] placeholder:min-h-[19px]"
                />
                <CustomInput
                  name={""}
                  type={"number"}
                  placeholder="Enter loan amount *"
                  className="w-full min-h-[35px]  rounded-[8px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px] border-[#979797] border-[1px] px-[5px] placeholder:text-[13px] placeholder:leading-[18.52px] placeholder:text-[#7B7B80] placeholder:font-regular placeholder:max-w-[129px] placeholder:min-h-[19px]"
                />
              </div>
              <div className="flex flex-col gap-y-[14px] px-[10px] mx-auto">
                <div className="max-w-[143px] min-h-[19px]">
                  <span className="font-regular text-[13px] leading-[18.52px] text-[#7B7B80]">
                    Is property finalized?
                  </span>{" "}
                  <span className="font-bold text-[13px] leading-[18.52px] text-[#7B7B80]">
                    *
                  </span>
                </div>
                <div className="flex gap-x-[10px]">
                  {["Yes", "No"].map((option, index) => (
                    <label key={index}>
                      <input type="radio" name="finalized" />{" "}
                      <span className="font-regular text-[13px] leading-[18.52px]">
                        {option}
                      </span>
                      &nbsp;
                    </label>
                  ))}
                </div>
                <div>
                  <label>
                    <input
                      type="checkbox"
                      className="mr-2 rounded-sm w-[24px] h-[24px] border-[#7B7B80] border-[1px]"
                    />
                    <span className="max-w-[263px] min-h-[19px] font-regular text-[13px] leading-[18.52px] text-[#7B7B80] text-left">
                      I agree to terms of use and private policy
                    </span>
                  </label>
                </div>
              </div>
              <div className="pt-[24px] mx-auto pl-[5px]">
                <Button className="w-[349px] min-h-[51px] text-[16px] text-[#FFFFFF] font-medium leading-[22.8px] bg-[#3586FF] rounded-[8px] cursor-pointer">
                  Check Eligibility
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
