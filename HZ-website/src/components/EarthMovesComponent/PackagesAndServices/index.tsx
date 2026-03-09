import React, { useState, forwardRef } from "react";

import Image from "next/image";
import Button from "@/common/Button";
import Modal from "@/common/Modal";
import CustomInput from "@/common/FormElements/CustomInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
export interface ListItem {
  id: number;
  servicename: string;
  image: string;
  rollertype: string;
  automationgrade: string;
  price: string;
  soldby: string;
  location: string;
  operationweight: string;
  servicetype: string;
}
export interface IPackagesAndServicesprops {
  heading: string;
  listItems: ListItem[];
}

export default function PackagesAndServices({
  heading,
  listItems,
}: IPackagesAndServicesprops) {
  const [OpenModal, setOpenModal] = useState(false);
  const [OpenMessageModal, setOpenMessageModal] = useState(false);
  const [SelectedItem, setSelectedItem] = useState<ListItem | undefined>(
    undefined
  );
  const handleClick = (item: ListItem) => {
    setSelectedItem(item);
    setOpenModal(true);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpenMessageModal(true);
  };
  return (
    <>
      <div className="flex flex-col items-center mx-auto max-w-[1392px] min-h-[481px] gap-y-[48px]">
        <div className="max-w-[300px] min-h-[34px]">
          <h1 className="text-[#3E6196] text-left font-bold text-[24px] leading-[34.2px]">
            {heading}
          </h1>
        </div>
        <div className="flex flex-wrap justify-center mx-auto gap-x-[14px] gap-y-[40px] w-full">
          {listItems.map((item, index) => {
            return (
              <div className=" max-w-[334px] min-h-[179px] bg-[#FFFFFF] shadow-custom border-[1px] border-[#C5C5C5] rounded-[8px]  flex flex-col gap-y-[8px] w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/4 p-2">
                <div className="flex items-center gap-x-[20px] justify-around">
                  {" "}
                  <div className="relative w-[106px] h-[86px] rounded-[4px] overflow-hidden p-[8px] ml-[6px]">
                    <Image
                      src={item.image}
                      alt={item.servicename}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="flex flex-col items-start mt-[5px] gap-y-[8px]">
                    <div className="max-w-[154px] min-h-[23px]">
                      <h1 className="text-left text-[#000000] font-medium text-[16px] leading-[22.8px]">
                        {item.servicename}
                      </h1>
                    </div>
                    <div className="max-w-[180px] min-h-[19px] text-[#5F6A7A]">
                      <h2 className="font-bold text-[13px] leading-[18.52px] text-left">
                        Roller Type: {" "}
                        <span className="font-regular text-[13px] leading-[18.52px]">
                          {item.rollertype}
                        </span>
                      </h2>
                    </div>
                    <div className="max-w-[180px] min-h-[38px] text-[#5F6A7A]">
                      <h1 className="font-bold text-[13px] leading-[18.52px] text-left">
                        Automation Grade:{" "}
                        <span className="font-regular text-[13px] leading-[18.52px]">
                          {item.automationgrade}
                        </span>
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="flex items-center  gap-x-[86px] md:gap-x-[48px] justify-around  mt-[10px]">
                  <div className="max-w-[132px] min-h-[29px]">
                    <h1 className="max-w-[93px] min-h-[29px] font-medium text-[#3586FF] text-[20px] leading-[28.5px] ">
                      {item.price}
                    </h1>
                  </div>
                  <div className="w-[102px] min-h-[35px] bg-[#3586FF] rounded-[4px] cursor-pointer  text-center">
                    <Button
                      className="text-[#FEFEFE] max-w-[70px] min-h-[19px]  font-medium text-[13px] leading-[18.52px] text-center pt-[8px]"
                      onClick={() => handleClick(item)}
                    >
                      Get Quote
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {OpenModal && SelectedItem && (
            <Modal
              isOpen={OpenModal}
              closeModal={() => setOpenModal(false)}
              className="max-w-[1098px] min-h-[926px]"
            >
              <div className="flex items-start flex-wrap mx-auto justify-center gap-x-[90px]">
                <div className=" flex flex-col  bg-[#E7F0FF] gap-y-[24px] rounded-[8px] max-w-[411px] h-[727px]">
                  <div className="relative w-[379px] h-[271px]  rounded-[4px]  p-[16px]  mx-auto">
                    <Image
                      src={SelectedItem.image}
                      layout="fill"
                      objectFit="cover"
                      alt={SelectedItem.servicename}
                      className=" p-[16px] "
                    />
                  </div>
                  <div className="flex flex-col items-start  pl-[20px] gap-y-[16px]">
                    <div className="max-w-[379px] min-h-[29px]">
                      <h1 className="text-left text-[#000000] font-medium text-[20px] leading-[28.5px]">
                        {SelectedItem.servicename} Service
                      </h1>
                    </div>
                    <div className="max-w-[139px] min-h-[29px]">
                      <h1 className="text-left text-[#000000] font-regular text-[20px] leading-[28.5px]">
                        {SelectedItem.price}
                        <span>/Day</span>
                      </h1>
                    </div>
                    <div className="flex flex-col max-w-[379px] min-h-[240px] gap-y-[16px]">
                      {[
                        { label: "Sold By", value: SelectedItem.soldby },
                        {
                          label: "Automation Grade",
                          value: SelectedItem.automationgrade,
                        },
                        {
                          label: "Roller Type",
                          value: SelectedItem.rollertype,
                        },
                        {
                          label: "Location/City",
                          value: SelectedItem.location,
                        },
                        {
                          label: "Operating Weight",
                          value: SelectedItem.operationweight,
                        },
                        {
                          label: "Service Type",
                          value: SelectedItem.servicename,
                        },
                      ].map((item, index) => {
                        return (
                          <div key={index}>
                            <h1 className="text-left text-[#5F6A7A] font-medium text-[16px] leading-[40px] tracking-3p">
                              {item.label} -{" "}
                              <span className="text-left font-regular text-[#5F6A7A] text-[16px] leading-[40px] tracking-3p">
                                {item.value}
                              </span>
                            </h1>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-[38px] pt-[20px]">
                  <div className="max-w-[489px] min-h-[34px] ">
                    <h1 className="text-left text-[#000000] font-bold text-[24px] leading-[34.2px]">
                      Supplier wants to know more about you
                    </h1>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-y-[24px]">
                      <div className="max-w-[586px] min-h-[86px] flex flex-col gap-y-[8px]">
                        <CustomInput
                          label="First name"
                          labelCls="font-medium text-[16px] leading-[22.8px]"
                          name={""}
                          required
                          type={"text"}
                          placeholder="Kingston"
                          rootCls=" "
                          className="max-w-[586px] min-h-[35px]  rounded-[8px]  placeholder:max-w-[72px] placeholder:min-h-[23px]  placeholder:font-medium placeholder:text-gray-400 placeholder:text-[16px] placeholder:leading-[22.8px]"
                        />
                      </div>
                      <div className="max-w-[586px] min-h-[86px] flex flex-col gap-y-[8px]">

                        <CustomInput
                          label="Email Address"
                          labelCls="font-medium text-[16px] leading-[22.8px]"
                          required
                          name={""}
                          type={"email"}
                          rootCls=" "
                          placeholder="david1876@hmail.com"
                          className="max-w-[586px] min-h-[35px]  rounded-[8px]  placeholder:max-w-[182px] placeholder:min-h-[23px]  placeholder:font-medium  placeholder:text-gray-400 placeholder:text-[16px] placeholder:leading-[22.8px]"
                        />
                      </div>
                      <div className="max-w-[586px] min-h-[86px] flex flex-col gap-y-[8px]">

                        <CustomInput
                          label="Company / Business name"
                          labelCls="font-medium text-[16px] leading-[22.8px]"
                          required
                          name={""}
                          type={"text"}
                          placeholder="David"
                          rootCls=" "
                          className="max-w-[586px] min-h-[35px]  rounded-[8px]  placeholder:max-w-[47px] placeholder:min-h-[23px] placeholder:text-gray-400 placeholder:font-medium placeholder:text-[16px] placeholder:leading-[22.8px] "
                        />
                      </div>
                      <div className="max-w-[586px] min-h-[86px] flex flex-col gap-y-[8px]">

                        <CustomInput
                          label="Website URL"
                          labelCls="font-medium text-[16px] leading-[22.8px]"
                          required
                          name={""}
                          type={"url"}
                          rootCls=" "
                          placeholder="www/kjcnjanoa/hbb.com"
                          className="max-w-[586px] min-h-[35px]  rounded-[8px]  placeholder:max-w-[209px] placeholder:min-h-[23px]  placeholder:text-gray-400 placeholder:font-medium placeholder:text-[16px] placeholder:leading-[22.8px]"
                        />
                      </div>
                      <div className="max-w-[501px] min-h-[111px] flex flex-col gap-y-[16px]">
                        <p className="max-w-[96px] min-h-[23px] text-[#000000] font-regular text-[16px] leading-[22.8px]">
                          Roller Type
                          <span className="text-red-600 font-bold text-[16px] leading-[22.8px]">
                            *
                          </span>
                        </p>
                        <div className="flex gap-x-[24px] gap-y-[24px] flex-wrap">
                          {[
                            "Tandem Roller",
                            "Vibratory Rollers",
                            "Static Rollers",
                            "Smooth Drum Rollers",
                          ].map((option, index) => (
                            <label key={index}>
                              <input
                                type="radio"
                                name="rollertype"
                                defaultChecked={index === 0}
                              />{" "}
                              &nbsp;
                              <span className="font-medium text-[#000000] max-w-[172px] min-h-[23px] text-[16px] leading-[22.8px]">
                                {option}
                              </span>
                              &nbsp; &nbsp;
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="max-w-[586px] min-h-[86px] flex flex-col gap-y-[8px]">

                        <SingleSelect
                          label="Rental Duration"
                          type="single-select"
                          name="Service"
                          options={[
                            { id: 1, service: "2 hours" },
                            { id: 2, service: "5 hours" },
                            { id: 3, service: "3 days" },
                          ]}
                          rootCls="border-[1px] border-[#DBDBDB] rounded-[8px] max-w-[586px] min-h-[55px]"
                          buttonCls="border-none"
                          selectedOption={{
                            id: 2,
                            service: "5 hours",
                          }}
                          optionsInterface={{
                            isObj: true,
                            displayKey: "service",
                          }}
                        />
                      </div>
                    </div>
                    <div className="lg:pl-[256px] lg:pt-[20px] md:pl-[256px] md:pt-[20px] sm:pl-[256px] sm:pt-[20px] text-center">
                      <div className="w-[221px] min-h-[61px] bg-[#3586FF] rounded-[16px]   mt-[20px] text-center cursor-pointer">
                        <Button
                          type="submit"
                          className="text-[#FFFFFF] max-w-[73px] min-h-[29px] mt-[10px] font-medium text-[20px] leading-[28.5px] "
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </Modal>
          )}
          {OpenMessageModal && (
            <Modal
              isOpen={OpenMessageModal}
              closeModal={() => setOpenMessageModal(false)}
              className="max-w-[563px] min-h-[373px] rounded-[24px]"
            >
              <div className="flex flex-col items-center gap-y-[40px]">
                <div className="flex flex-col items-center max-w-[136px] min-h-[155px] gap-y-[1px]">
                  <div className="realtive max-w-[136px] min-h-[120px]">
                    <Image
                      src="/images/earthmoves/packagesandservices/success.png"
                      alt="success"
                      objectFit="contain"
                      width={136}
                      height={120}
                    />
                  </div>
                  <div className="max-w-[109px] min-h-[34px]">
                    <h1 className="text-[#1F1F27] font-bold text-[24px] leading-[34.2px]">
                      Success!
                    </h1>
                  </div>{" "}
                </div>
                <div className="max-w-[192px] min-h-[29px]">
                  <h1 className="text-[#37373F] font-regular text-center text-[20px] leading-[28.5px]">
                    We’ll see you soon!
                  </h1>
                </div>
                <div className="w-[467px] h-[61px] cursor-pointer rounded-[8px] bg-[#3586FF] mx-auto flex items-center justify-center">
                  <Button className="max-w-[31px] min-h-[29px] text-[#FFFFFF] font-bold text-[20px] leading-[28.5px]">
                    Ok
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
}
