import React, { useState } from "react";
import Image from "next/image";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import Button from "@/common/Button";
import { LuMapPin } from "react-icons/lu";
export interface IPackersAndMoversHeroSectionprops {
  bgimageurl: string;
  heading: string;
  gpsicon: string;
  listItems: Array<{
    id: number;
    title: string;
    image: string;
    description: string;
  }>;
}

export default function PackersAndmoversHeroSection({
  bgimageurl,
  heading,
  gpsicon,
  listItems,
}: IPackersAndMoversHeroSectionprops) {
  const [formdata, setFormdata] = useState({
    mobilenumber: "",
    city: "",
    movingDate: "",
    movingFrom: "",
    movingTo: "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });
  };
  const handleSelectChange = (selectedOption: { id: number; city: string }) => {
    setFormdata({
      ...formdata,
      city: selectedOption.city,
    });
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("formdata is", formdata);
  };

  return (
    <>
      <div className="max-w-[1440px] max-h-[472px] relative mx-auto z-10 p-6 bg-black bg-opacity-[0.40] flex items-center   flex-wrap">
        <Image
          src={bgimageurl}
          layout="fill"
          alt=""
          objectFit="cover"
          className="absolute -z-10"
        />
        <div className="flex items-start flex-wrap  lg:flex-nowrap justify-center gap-x-[5px] gap-y-[12px]">
          <div className="flex flex-col items-start  gap-y-[20px] pt-[10px] mt-[70px] mb-[10%]">
            <div className="max-w-[456px] min-h-[189px] px-[20px] ">
              <h1 className="text-[#FFFFFF] font-bold  text-[44px] leading-[62.7px] text-wrap">
                {heading}
              </h1>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-[10px]">
              {listItems.map((item, index) => {
                return (
                  <div className="md:w-[205px]  w-[165px] min-h-[70px] rounded-[4px] bg-[#FFFFFF] border-[1px] border-[#E7E7E7] flex items-center px-[8px] gap-x-[8px] " key={index}>
                    <div className="relative w-[24px] h-[24px]">
                      <Image
                        src={item.image}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex items-start flex-col gap-y-[4px] font-medium text-[13px] leading-[18.52px]  text-[#000000] max-w-[141px] min-h-[38px]">
                      <div className="">
                        <h1>{item.title}</h1>
                      </div>
                      <div>
                        <h2 className="text-[#7B7C83]">{item.description}</h2>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="">
            <div className="md:max-w-[515px] max-w-[415px] w-full max-h-[675px] fixed  hidden  md:flex flex-col items-center gap-y-[24px] rounded-[8px] bg-[#FFFFFF] shadow-custom  py-8 px-10  mt-[5px]">
              <h1 className="max-w-[313px] min-h-[29px] text-[#000000] font-medium text-[20px] leading-[28.5px] mt-[10px]">
                Get a Free Personalized Quote.
              </h1>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-y-[12px] w-full">
                  <CustomInput
                    label="Mobile Number"
                    type="number"
                    name="mobilenumber"
                    labelCls=" font-medium text-[16px] leading-[22.8px] text-[#77AEFF]"
                    placeholder="enter your number"
                    className="h-[30px] px-2 py-1 border md:max-w-[437px] max-w-[297px] w-full border-[#CFCFCF] rounded-[4px] "
                    rootCls="px-2 py-1"
                    onChange={handleInputChange}
                  />

                  <div className="flex flex-col gap-y-[8px] w-[480px] px-3">
                    <p className="text-[#77AEFF] font-medium text-[16px] leading-[22.8px]">
                      Select City
                    </p>
                    <SingleSelect
                      type="single-select"
                      name="city"
                      options={[
                        { id: 1, city: "Hyderabad" },
                        { id: 2, city: "Chennai" },
                        { id: 3, city: "Bangalore" },
                      ]}
                      rootCls="border-b-[1px]  h-[45px] px-1 py-1 w-full border md:max-w-[480px] max-w-[377px] border-[#CFCFCF] w-full rounded-[4px] "
                      buttonCls="border-none"
                      selectedOption={{
                        id: 2,
                        city: "Chennai",
                      }}
                      optionsInterface={{ isObj: true, displayKey: "city" }}
                      handleChange={(name, value) => handleSelectChange(value)}
                    />
                  </div>

                  <div className="flex flex-col gap-y-[4px] w-[480px]">
                    <CustomInput
                      type="text"
                      label="Search your Locality"
                      labelCls="text-[#77AEFF] font-medium text-[16px] leading-[22.8px]"
                      name="movingFrom"
                      placeholder="Moving From"
                      className="h-[30px] px-3  border md:max-w-[437px] w-full max-w-[337px] border-[#CFCFCF] rounded-[4px]"
                      rootCls="px-2 "
                      onChange={handleInputChange}
                      leftIcon={<LuMapPin />}
                    />
                    <div className="flex items-center justify-start ml-[20px]">
                      <div className="w-[0.5px] border-[1px] border-[#7B7C83] h-[37px] border-dashed "></div>
                    </div>
                    <CustomInput
                      type="text"
                      name="movingTo"
                      placeholder="Moving To"
                      className="h-[30px] px-3 border md:max-w-[437px] w-full max-w-[337px] border-[#CFCFCF] rounded-[4px]"
                      rootCls="px-2 "
                      onChange={handleInputChange}
                      leftIcon={<LuMapPin />}
                    />
                  </div>

                  <div className="flex flex-col gap-y-[4px] max-w-[480px] w-full px-3">
                    <div className="max-w-[105px] min-h-[23px]">
                      <h1 className="font-medium text-[16px] leading-[22.8px] text-[#77AEFF]">
                        Moving Date
                      </h1>
                    </div>

                    <input
                      type="date"
                      name="movingDate"
                      placeholder="Select your date"
                      className="h-[50px] px-2 py-1 border md:max-w-[480px] max-w-[367px]  w-full border-[#CFCFCF] rounded-[4px]"
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="md:max-w-[460px]  max-w-[390px] w-full h-[45px] bg-[#3586FF] text-[#FFFFFF] font-medium text-[16px] leading-[22.8px] rounded-[8px] cursor-pointer"
                  >
                    Check Price
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
