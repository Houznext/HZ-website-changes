import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import SingleSelect from "@/common/FormElements/SingleSelect";

import Drawer from "@/common/Drawer";
import Button from "@/common/Button";
import CallIcon from "@mui/icons-material/Call";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";

export interface ICustomFurnitureOrderprops {
  heading: string;
  subheading: string;
  image: string;
  whatsappimage: string;
}

export default function CustomFurnitureOrder({
  heading,
  subheading,
  image,
  whatsappimage,
}: ICustomFurnitureOrderprops) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    city: "",
    message: "",
  });
  const [alldata, setAlldata] = useState<any>([]);
  const handleinputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSelectChange = (selectedOption: { id: number; city: string }) => {
    setFormData({ ...formData, city: selectedOption.city });
  };

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [OpenMessageModal, setOpenMessageModal] = useState(false);
  const handlecallbacksubmit = async (e: any) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.number ||
      !formData.city
    ) {
      console.error("All fields are required!");
      return;
    }
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        number: formData.number,
        city: formData.city,
        message: formData.message,
      };
      const res = await apiClient.post(apiClient.URLS.Requestcall, {
        ...payload,
      });
      if (res.status === 201) {
        setAlldata({
          name: "",
          email: "",
          number: "",
          city: " Chennai",
          message: "",
        });
      } else {
        console.error("failed to create request call data", res);
      }
    } catch (error) {
      console.log("error is", error);
      toast.error("Failed to create request call data.");
    }

    setOpenMessageModal(true);
  };
  const citydata = [
    { id: 1, city: "Chennai" },
    { id: 2, city: "Hyderabad" },
    { id: 3, city: "Bangalore" },
  ];
  return (
    <>
      <div className=" flex flex-row md:items-center  flex-wrap justify-center ">
        <div className="flex-grow  md:max-w-[900px] max-w-[398px]  md:min-h-[148px] min-h-[333px] w-full  mx-auto flex-none   text-center ">
          <div className="text-center mt-3 mb-6 flex flex-col  items-center gap-y-[16px] mx-auto">
            <h1
              className={twMerge(
                "md:min-h-[36px] font-bold min-h-[29px] md:text-[25px] text-[20px] md:leading-[35.62px] leading-[28.5px] mx-auto   text-center  text-[#000000]"
              )}
            >
              {heading}
            </h1>
            <h2 className="md:min-h-[96px] min-h-[224px] w-full font-Gordit-Regular text-[16px] text-[#7B7C83] leading-[32px] text-center mx-auto ml-[10px]">
              {subheading}
            </h2>
          </div>
        </div>

        <div
          className="max-w-[75px] w-full min-h-[70px] bg-[#3586FF] rounded-[8px] gap-y-[2px] flex flex-col items-center justify-center mx-auto flex-none md:mr-[30px]  ml-[20px] animate-move-up-down"
          onClick={() => setOpenModal(true)}
        >
          <div className="relative w-[24px] h-[24px]">
            <Image
              src={image}
              alt="call"
              fill
              sizes="(max-width: 768px) 24px, 24px"
              className="object-cover"
            />
          </div>
          <div className="max-w-[32px] min-h-[23px]">
            <h1 className="font-medium text-[#FFFFFF] text-[16px] leading-[22.8px]">
              Call
            </h1>
          </div>
        </div>
        {openModal && (
          <Modal
            isOpen={openModal}
            closeModal={() => setOpenModal(false)}
            className="md:max-w-[924px] max-w-[700px] md:h-[716px] h-[920px]"
          >
            <div className="flex flex-col gap-y-[30px]">
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-y-[8px] max-w-[514px] min-h-[66px]">
                  <div className="max-w-[194px] min-h-[29px]">
                    <p className="text-[#212227] font-medium text-[20px] leading-[28.5px] text-center">
                      Request a Callback
                    </p>
                  </div>
                  <div className="max-w-[514px] min-h-[29px]">
                    <p className="text-[#8D8E8E] font-regular text-[20px] leading-[28.5px] ">
                      Fill in the details and we will get back to you shortly.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlecallbacksubmit}>
                <div className="flex flex-col gap-y-[48px] p-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-2">
                    <div className="w-full">
                      <CustomInput
                        label="Name*"
                        type="text"
                        name="name"
                        labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                        placeholder="enter your name"
                        className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                        rootCls="px-2 py-1"
                        onChange={handleinputChange}
                      />
                    </div>
                    <div className="w-full">
                      <CustomInput
                        label="Email*"
                        type="email"
                        name="email"
                        labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                        placeholder="enter your email"
                        className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                        rootCls="px-2 py-1"
                        onChange={handleinputChange}
                      />
                    </div>
                    <div className="w-full">
                      <CustomInput
                        label="Phone Number*"
                        type="number"
                        name="number"
                        labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                        placeholder="enter your phone number"
                        className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                        rootCls="px-2 py-1"
                        onChange={handleinputChange}
                      />
                    </div>
                    <div className="flex flex-col gap-y-[8px] w-full px-3">
                      <p className="text-[#7B7C83] font-medium text-[16px] leading-[22.8px]">
                        City*
                      </p>
                      <SingleSelect
                        type="single-select"
                        name="city"
                        rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[8px] max-w-[586px] min-h-[50px]"
                        buttonCls="border-none"
                        options={citydata}
                        selectedOption={
                          citydata.find(
                            (item) => item.city === formData.city
                          ) || { id: 1, city: "Chennai" }
                        }
                        optionsInterface={{
                          isObj: true,
                          displayKey: "city",
                        }}
                        handleChange={(name, value) =>
                          handleSelectChange(value)
                        }
                      />
                    </div>
                    <div className="w-full  md:col-span-2 ">
                      <CustomInput
                        label="Message"
                        type="textarea"
                        name="message"
                        labelCls=" font-regular text-[16px] max-w-[800px] leading-[22.8px] text-[#7B7C83]"
                        placeholder="write your message here..."
                        className="h-[120px] px-2 py-4 border w-full border-[#A1A0A0] rounded-[4px] max-w-[800px] min-h-[120px] "
                        rootCls="px-2 py-1"
                        onChange={handleinputChange}
                      />
                    </div>
                  </div>
                  <div className=" max-w-[828px] min-h-[55px] bg-[#3586FF] rounded-[8px] text-center  flex items-center justify-center">
                    <Button
                      className="text-[#FFFFFF] font-medium text-[16px] leading-[22.8px] text-center px-12 py-4 cursor-pointer"
                      type="submit"
                    >
                      SUBMIT
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Modal>
        )}
        {OpenMessageModal && (
          <Modal
            isOpen={OpenMessageModal}
            closeModal={() => setOpenMessageModal(false)}
            className="md:max-w-[563px] max-w-[300px] md:h-[402px] h-[520px]"
          >
            <div className="flex flex-col items-center gap-y-[16px]">
              <div className="relative w-[136px] h-[120px]">
                <Image
                  src="/images/earthmoves/packagesandservices/success.png"
                  alt="success"
                  objectFit="cover"
                  layout="fill"
                />
              </div>
              <div className="max-w-[375px] min-h-[34px]">
                <h1 className="text-[#1F1F27] font-bold text-[24px] leading-[34.2px] md:text-left text-center">
                  Call request successfully sent!
                </h1>
              </div>
              <div className="max-w-[358px] min-h-[58px]">
                <h1 className="text-[#37373F] font-regular text-[20px] leading-[28.5px] text-center">
                  your team will contact you within 24hours
                </h1>
              </div>
              <div className=" w-full bg-[#3586FF] rounded-[8px] text-center  flex items-center justify-center mt-[20px]">
                <Button className="text-[#FFFFFF] font-medium text-[16px] leading-[22.8px] text-center px-12 py-4 cursor-pointer">
                  Ok
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
