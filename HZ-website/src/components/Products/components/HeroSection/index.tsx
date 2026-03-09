import React, { useState } from "react";
import Image from "next/image";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";
import SingleSelect from "@/common/FormElements/SingleSelect";
import { CautionIcon } from "../../icons";
import Link from "next/link";
import FileInput from "@/common/FileInput";
import { useRouter } from "next/router";

const creddata = [
  {
    image: "/icons/credicons/home.png",
    value: "100+",
    label: "Homes",
  },
  {
    image: "/icons/credicons/trust.png",
    value: "100%",
    label: " Quality",
  },
  {
    image: "/icons/credicons/satisfaction.png",
    value: "100%",
    label: " Satisfaction",
  },
];

const BuilderHeroSection = () => {
  const [formValue, setFormValue] = useState({
    name: "",
    phoneNumber: "",
    requirement: "",
    location: "",
    email: "",
  });
  const validateInput = (name: string, value: string) => {
    if (name) {
      return /^[A-Za-z\s]*$/.test(value);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!validateInput(name, value)) return;
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleselectChange = (selectedOption: {
    id: number;
    location: string;
  }) => {
    setFormValue((prev) => ({ ...prev, location: selectedOption.location }));
  };
  const router = useRouter();
  const LocationData = [
    { id: 1, location: "Hyderabad" },
    { id: 2, location: "Pune" },
    { id: 3, location: "Mumbai" },
  ];
  return (
    <div className="relative md:w-full   h-[600px] mx-auto mt-[-15px]">
      <div className="md:absolute inset-0 z-10 bg-gradient-to-t from-black to-transparent">
        <Image
          src="/images/background/builderbg.png"
          alt="bgherosec"
          layout="fill"
          objectFit="cover"
          loading="eager"
          quality={50}
          className="rounded-[20px]"
        />
      </div>
      <div className="md:absolute inset-0 flex md:flex-row md:justify-between md:gap-[40px] gap-[20px] flex-col z-20 p-3 md:p-[40px] w-full ">
        <div className="flex flex-row gap-[40px] md:w-[50%] w-full">
          <div className="flex flex-col md:gap-[40px] gap-5 w-full">
            <p className="font-bold md:text-[32px] text-[20px] relative md:static">
              Construct your <span className="text-[#3586FF]">DREAM HOUSE</span>{" "}
              as you like.
            </p>
            <p className="font-medium  md:text-[20px] text-[16px] rounded p-3 relative md:static bg-black/20 md:bg-transparent  text-[#ffffff] md:leading-[28.5px] md:max-w-[520px] ">
              Lets build a space where every corner reflects your personality,
              aspiration and lifestyle.
            </p>
            <div className="flex flex-row flex-wrap md:gap-[40px] gap-[20px]  backdrop-blur-sm bg-black/20 md:bg-white/20 rounded-[4px] md:px-[20px] md:py-[20px] px-[16px] py-[16px]">
              {creddata.map((item, index) => (
                <div key={index} className="flex flex-row gap-[8px]">
                  <div className="relative md:w-[60px] w-[30px] md:h-[60px] h-[30px]">
                    <Image
                      src={item.image}
                      alt="icons_cred"
                      fill

                      className="object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div>
                    <p className="font-bold md:text-[20px] text-[16px] md:leading-[38px] text-white leading-[28px]">
                      {item.value}
                    </p>
                    <p className="text-white md:text-[18px] text-[12px] font-bold">
                      {item.label}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="border-[0.5px] hidden md:block ml-[20px] h-full border-white"></div>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-[6px] backdrop-blur-sm max-w-[580px] ">
              <p className="md:text-[20px] text-[14px]  text-white leading-[28.5px] font-medium px-[4px] text-center relative mb-3 md:mb-0">
                India’s No.1 Modern Construction - Tech Enterprise Leader
                <span className="absolute hidden bottom-0 left-1/2 transform -translate-x-1/2 bg-white h-[1px] w-[90%] md:inline-block"></span>
              </p>
            </div>
          </div>
        </div>
        <div className=" md:max-w-[500px] relative md:w-[45%] w-full ">
          <div className="bg-white mx-[-10px] md:mx-0 md:px-[20px]  p-[16px] flex gap-[20px] flex-col items-center rounded-[16px] md:border-0 border border-gray-300">
            <div className="md:py-[16px] py-[10px] md:px-[8px] px-[6px] border-b-2 w-full text-center border-black">
              <p className="md:text-[22px] text-[18px] font-medium leading-[34.2px] ">
                Expert Quotation, Inquire Now.
              </p>
            </div>
            <div className="w-full flex flex-col md:gap-[6px] gap-[3px]">
              <CustomInput
                type="text"
                name="name"
                label="Name "
                required
                labelCls="font-medium md:text-[14px] text-[12px]"
                className="placeholder:text-[12px] leading-[20px] font-regular placeholder:text-[#959595]"
                value={formValue.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
              <CustomInput
                type="number"
                name="phoneNumber"
                label="Phone Number "
                labelCls="font-medium md:text-[14px] text-[12px]"
                value={formValue.phoneNumber}
                onChange={handleInputChange}
                required
                className="placeholder:text-[12px] leading-[20px] font-regular   placeholder:text-[#959595]"
                placeholder="Enter your Phone Number"
              />
              <CustomInput
                type="text"
                name="requirement"
                value={formValue.requirement}
                onChange={handleInputChange}
                labelCls="font-medium md:text-[14px] text-[12px]"
                label="Construction requirements "
                required
                className="placeholder:text-[12px] leading-[20px] font-regular  placeholder:text-[#959595]"
                placeholder="Enter your requirements"
              />
              <div className="flex flex-row gap-[20px] items-center">
                <p className="text-[12px] leading-[20px] font-medium">
                  or attach file{" "}
                </p>
                {/* <Button className="bg-gray-300 py-[2px] px-[4px] text-gray-600 rounded-[3px]">
                  + Select file
                </Button> */}
                <div className="relative w-fit">
                  <Button
                    type="button"
                    className="bg-[#3586FF] hover:bg-[#3586FF]text-white font-medium py-2 px-4 rounded-md"
                  >
                    Choose File
                  </Button>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={(e) => console.log(e.target.files)}
                  />
                </div>
              </div>
              <div className="flex md:flex-row flex-col items-center md:gap-[20px] gap-[16px]">
                <div className="md:w-[50%] relative w-full">
                  <SingleSelect
                    type="single-select"
                    label="Location "
                    required
                    labelCls="font-medium  md:text-[14px] text-[12px]"
                    name="location"
                    options={[
                      { id: 1, location: "Hyderabad" },
                      { id: 2, location: "Pune" },
                      { id: 3, location: "Mumbai" },
                    ]}
                    handleChange={(name, value) => handleselectChange(value)}
                    selectedOption={
                      LocationData.find(
                        (loc) => loc.location === formValue.location
                      ) || { id: 1, location: "Hyderabad" }
                    }
                    optionsInterface={{ isObj: true, displayKey: "location" }}
                  />
                </div>
                <div className="md:w-[50%] w-full">
                  <CustomInput
                    type="email"
                    name="email"
                    labelCls="font-medium md:text-[14px] text-[12px]"
                    value={formValue.email}
                    onChange={handleInputChange}
                    label="Email (optional)"
                    required
                    placeholder="www.dreamhome@gmail.com"
                    className="placeholder:text-[12px] leading-[20px]  font-regular  placeholder:text-[#959595]"
                  />
                </div>
              </div>
              <div>
                <Button className="bg-[#3586FF] mt-2 md:py-[6px] py-1 w-full rounded-[6px] text-white font-bold">
                  Submit
                </Button>
              </div>
            </div>
            <div className="flex flex-row md:gap-[10px] gap-[6px] justify-center md:items-end items-center">
              <div className="flex gap-1 md:gap-2 items-center">


                <div className="">
                  <CautionIcon />
                </div>
                <p>
                  <span className="md:text-[12px] text-[10px] md:leading-[20px] leading-[5px] font-regular">
                    Have any query regarding form submission?{" "}
                  </span>
                </p>
              </div>
              <Link
                href="/contact-us"
                className="underline cursor-pointer font-medium text-[#3586FF] text-nowrap text-[10px] md:text-[12px] leading-[20px]"
                onClick={() => router.push("/contact-us")}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderHeroSection;
