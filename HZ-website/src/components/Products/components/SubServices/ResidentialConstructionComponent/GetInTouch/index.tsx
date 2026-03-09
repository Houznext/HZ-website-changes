import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import React, { useState } from "react";

export const GetInTouch = () => {
  const [getInTouchDetails, setGetInTouchDetails] = useState({
    name: "",
    email: "",
    message: "",
    number: "",
  });
  const validateInput = (name: string, value: string) => {
    switch (name) {
      case "name":
        return /^[A-Za-z\s]*$/.test(value);
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case "number":
        return /^[0-9]{10}$/.test(value);
      case "message":
        return true;
      default:
        return true;
    }
  };

  const handleFormChange = (name: string, value: any) => {
    if (validateInput(name, value)) {
      setGetInTouchDetails((currDetails) => {
        return { ...currDetails, [name]: value };
      });
    }
  };

  return (
    <div className="md:py-16 py-10 px-6 md:px-10 bg-gradient-to-b from-[#77AEFFF7] to-[#BFD8FF]">
      <h2 className="font-medium text-center px-5 text-[20px] leading-[28.5px] mb-10 md:mb-16">
        Submit your details here and we will get in touch soon
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-10 lg:gap-x-16">
        <CustomInput
          name="name"
          type={"text"}
          value={getInTouchDetails.name}
          outerInptCls="border-[#ADADAD] bg-white md:min-h-[45px] max-w-[603px]"
          rootCls="md:flex md:items-center md:gap-4 md:justify-between"
          placeholder="enter your name"
          className="placeholder:text-[#7B7C83] md:placeholder:text-[16px]"
          onChange={(e) => {
            handleFormChange(e.target.name, e.target.value);
          }}
          label="Name"
          labelCls="md:text-[16px] text-[16px] text-black"
        />
        <CustomInput
          name="email"
          type={"text"}
          value={getInTouchDetails.email}
          outerInptCls="border-[#ADADAD] bg-white md:min-h-[45px] max-w-[603px]"
          rootCls="md:flex md:items-center md:gap-4 md:justify-between"
          placeholder="enter your email"
          className="placeholder:text-[#7B7C83] md:placeholder:text-[16px]"
          onChange={(e) => {
            handleFormChange(e.target.name, e.target.value);
          }}
          label="Email"
          labelCls="md:text-[16px] text-[16px] text-black"
        />
        <CustomInput
          name="number"
          type={"text"}
          value={getInTouchDetails.number}
          outerInptCls="border-[#ADADAD] bg-white md:min-h-[45px] max-w-[603px]"
          rootCls="md:flex md:items-center md:gap-4 md:justify-between"
          placeholder="enter your number"
          className="placeholder:text-[#7B7C83] md:placeholder:text-[16px]"
          onChange={(e) => {
            if (parseInt(e.target.value) || e.target.value === "") {
              handleFormChange(e.target.name, e.target.value);
            }
          }}
          label="Phone Number"
          labelCls="md:text-[16px] text-[16px] text-black whitespace-nowrap"
        />
        <CustomInput
          name="message"
          type={"text"}
          value={getInTouchDetails.message}
          outerInptCls="border-[#ADADAD] bg-white md:min-h-[45px] max-w-[603px]"
          rootCls="md:flex md:items-center md:gap-4 md:justify-between"
          placeholder="Details about your requirement"
          className="placeholder:text-[#7B7C83] md:placeholder:text-[16px]"
          onChange={(e) => {
            handleFormChange(e.target.name, e.target.value);
          }}
          label="Message"
          labelCls="md:text-[16px] text-[16px] text-black"
        />
      </div>
      <Button className="w-fit block mx-auto mt-16 font-medium text-white bg-[#3586FF] py-4 px-10 rounded-lg text-lg">
        Submit Requirement
      </Button>
    </div>
  );
};
