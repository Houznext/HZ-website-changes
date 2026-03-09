import React, { useState } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import CustomInput from "@/common/FormElements/CustomInput";
import FileInput from "@/common/FileInput";
import SingleSelect from "@/common/FormElements/SingleSelect";
import Modal from "@/common/Modal";
import ImageUploader from "@/common/FormElements/DragImageInput";
import Stepper from "@/common/Stepper";

export interface ICustomHeroSectionprops {
  image: string;
}

export default function CustomHeroSection({ image }: ICustomHeroSectionprops) {
  const [OpenModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleModal = () => {
    setOpenModal(true);
  };
  const handlesubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const renderContent = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return <Contact handleNext={() => setCurrentStep(currentStep + 1)} />;

      case 1:
        return (
          <DesignPreference
            handleNext={() => setCurrentStep(currentStep + 1)}
          />
        );

      case 2:
        return <AddressDetails />;
    }
  };

  return (
    <>
      <div className="w-full mx-auto relative p-6 md:max-w-[1440px] md:min-h-[492px] max-w-[430px] h-[215px]   bg-[#000000] md:bg-opacity-35  bg-opacity-50">
        <Image
          src={`${image}`}
          fill
          alt="imageherosection"
          className=" absolute -z-10 object-cover"
          priority
          quality={75}
        />

        <div className="flex flex-col md:flex-row w-full h-full  ">
          <div className="flex flex-col  w-full h-full md:justify-start md:items-start items-center justify-center md:gap-y-[40px]  md:py-10 px-5">
            <div className="flex md:flex-col flex-nowrap flex-row items-center justify-center max-w-[329px] min-h-[112px] md:ml-[8px] ml-[35px]  gap-x-[10px] mx-auto">
              <h1 className="md:max-w-[160px] md:min-h-[56px] max-w-[255px] min-h-[29px] font-bold md:text-[39px] text-[20px] font-italic md:leading-[55.57px]  leading-[28.5px] text-center md:text-left text-[#FFFFFF]">
                Custom
              </h1>
              <div className="flex items-center gap-x-[10px]">
                <h1 className="md:max-w-[329px] md:min-h-[56px] max-w-[255px] min-h-[29px] font-regular md:text-[39px] text-[20px] font-italic md:leading-[55.57px]  leading-[28.5px] text-center md:text-left text-[#FFFFFF]">
                  Furniture{" "}
                </h1>
                <h1 className="font-bold md:text-[39px] text-[20px] font-italic md:leading-[55.57px]  leading-[28.5px] text-center md:text-left text-[#FFFFFF]">
                  Design
                </h1>
              </div>
            </div>

            <h2 className="md:max-w-[526px] md:min-h-[58px] max-w-[374px] min-h-[38px] font-regular md:text-[20px] text-[13px] md:leading-[28.5px] leading-[18.52px]text-center md:text-left mb-[25px] md:mb-[0px] text-[#FFFFFF] ">
              Looking for your dream furniture! We make it easy to customize the
              furniture of your dreams.
            </h2>
            <div
              className="max-w-[182px] min-h-[42px] relative z-10 md:mb-0 mb-[30px]"
              onClick={handleModal}
            >
              <Button className=" md:w-[174px] md:h-[38px] w-[150px] h-[42px]px-[24px] py-[12px] text-[#3E8AFB] bg-[#FFFFFF] font-medium text-[12px]  leading-[14.4px]  tracking-[.16em] flex items-center justify-center ">
                {"Customize Now".toUpperCase()}
              </Button>

              <div className="md:w-[175px] md:h-[38px] w-[150px] h-[42px] border-[1px] border-solid border-[#FFFFFF] absolute top-1 left-1"></div>
            </div>
          </div>
          {OpenModal && (
            <Modal
              isOpen={OpenModal}
              closeModal={() => setOpenModal(false)}
              className="md:max-w-[924px] max-w-[700px] md:min-h-[597px] min-h-[620px]"
            >
              <div className="flex flex-col gap-y-[25px]">
                <div className="max-w-[523px] min-h-[29px] md:mt-[0px] mt-[30px]">
                  <h1 className="text-[20px] text-[#212227] font-medium text-center leading-[28.5px]">
                    Tell us your ideas and we’ll get you a custom design.
                  </h1>
                </div>
                <div className="max-w-full mx-auto mt-5  py-3 mb-5">
                  <Stepper
                    currentStep={currentStep}
                    steps={[
                      "Your Contact",
                      "Design Preference",
                      "Address Details",
                    ]}
                    handleClick={(index) => () => setCurrentStep(index)}
                  />
                </div>
                <div>{renderContent(currentStep)}</div>
              </div>
            </Modal>
          )}
          <div className=" md:w-[30%] w-full ">
            <div className="  w-full max-w-[388px] min-h-[443px] mt-[20px]  ">
              <div className="rounded-[8px] shadow-custom-card bg-white flex flex-col gap-y-[10px]  p-6">
                <p className=" max-w-[271px] min-h-[23px] ml-[5px] mx-auto text-center font-medium mb-3 text-[16px] leading-[22.8px] text-[#000000]">
                  Share Your Custom Requirements
                </p>
                <form onSubmit={handlesubmit}>
                  <div className="flex flex-col gap-4">
                    <CustomInput
                      name={""}
                      type={"text"}
                      placeholder="Enter Your Name"
                      className="max-w-[356px] min-h-[40px]  rounded-[4px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px]"
                    />
                    <CustomInput
                      name={""}
                      type={"number"}
                      placeholder="Enter Phone Number"
                      className="max-w-[356px] min-h-[40px]  rounded-[4px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px]"
                    />
                    <FileInput
                      name={""}
                      type="file"
                      folderName="customfurniture"
                      label="Upload Attachments (PDF/Image)"
                      labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                      className="max-w-[356px] min-h-[40px]  rounded-[4px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px]"
                    />
                    <CustomInput
                      name={""}
                      type={"text"}
                      placeholder="Enter description"
                      rootCls="h-[40px]"
                      className="max-w-[356px] min-h-[40px]  rounded-[4px] text-[#7B7C83] text-[13px] font-regular leading-[18.52px]"
                    />

                    <Button
                      type="submit"
                      className="bg-[#3586FF] text-[#FFFFFF] font-medium py-2 rounded-[8px] mt-4 max-w-[356px] min-h-[51px] text-[16px] leading-[22.8px] text-center"
                    >
                      submit
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
const Contact = ({ handleNext }: any) => {
  const [contactdata, setContactdata] = useState({
    name: "",
    email: "",
    number: "",
  });
  const handleContactchange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactdata({ ...contactdata, [name]: value });
  };
  const handleContactSubmit = (e: any) => {
    e.preventDefault();
    console.log("contact details are ", contactdata);
  };
  return (
    <>
      <div>
        <form onSubmit={handleContactSubmit}>
          <div className="flex flex-col gap-y-[30px]">
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
                  onChange={handleContactchange}
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
                />
              </div>{" "}
              <div className="w-full">
                <CustomInput
                  label="Phone Number*"
                  type="number"
                  name="number"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter your phone number"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
            </div>
            <div>
              <Button
                className="px-24 py-4 font-medium text-[16px] leading-[22.8px] text-[#FFFFFF] bg-[#3586FF] rounded-[8px]"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
const DesignPreference = ({ handleNext }: any) => {
  return (
    <>
      <div>
        <form>
          <div className="flex flex-col gap-y-[30px]">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col gap-y-[8px] w-full px-3">
                <p className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                  Type of Furniture*
                </p>
                <SingleSelect
                  type="single-select"
                  name="furniture"
                  options={[
                    { id: 1, furniture: "Table" },
                    { id: 2, furniture: "Cabinets" },
                    { id: 3, furniture: "Bookshelves" },
                    { id: 4, furniture: "Recliner" },
                  ]}
                  rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[8px] max-w-[586px] min-h-[50px]"
                  buttonCls="border-none"
                  selectedOption={{
                    id: 1,
                    furniture: "table",
                  }}
                  optionsInterface={{
                    isObj: true,
                    displayKey: "furniture",
                  }}
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Dimensions (Length)*"
                  type="number"
                  name="dimensionslength"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter number"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Dimensions (Width)*"
                  type="number"
                  name="dimensionswidth"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter number"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Dimensions (Hight)*"
                  type="number"
                  name="dimensionsheight"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter number"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Additional Notes on Dimensions"
                  type="text"
                  name="additionalnotes"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="additional message ..."
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
              <div className="flex flex-col gap-y-[8px] w-full px-3">
                <p className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                  Material*
                </p>
                <SingleSelect
                  type="single-select"
                  name="material"
                  options={[
                    { id: 1, material: "Wood" },
                    { id: 2, material: "Fabrics" },
                    { id: 3, material: "Glass" },
                    { id: 4, material: "Metal" },
                  ]}
                  rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[8px] max-w-[586px] min-h-[50px]"
                  buttonCls="border-none"
                  selectedOption={{
                    id: 1,
                    material: "Wood",
                  }}
                  optionsInterface={{
                    isObj: true,
                    displayKey: " material",
                  }}
                />
              </div>
              <div className="flex flex-col gap-y-[8px] w-full px-3">
                <p className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                  Color Option /Color Customize*
                </p>
                <SingleSelect
                  type="single-select"
                  name="color"
                  options={[
                    { id: 1, color: "Brown" },
                    { id: 2, color: "Olive Green" },
                    { id: 3, color: "Aqua" },
                    { id: 4, color: "Lavender" },
                  ]}
                  rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[8px] max-w-[586px] min-h-[50px]"
                  buttonCls="border-none"
                  selectedOption={{
                    id: 1,
                    color: "Brown",
                  }}
                  optionsInterface={{
                    isObj: true,
                    displayKey: "color",
                  }}
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Budge Range*"
                  type="number"
                  name="budget"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter number"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
              <div className=" md:col-span-2 w-full">
                <p className="text-[16px] font-medium mb-3 leading-[22.8px] text-[#000000]">
                  Attachments (PDF/Image)
                </p>
                <div>
                  <ImageUploader
                    label=""
                    folderName="furnitures"
                    onFilesChange={() => { }}
                    maxFiles={5}
                    maxFileSize={10}
                    acceptedFormats={["image/png", "image/jpg", "image/jpeg"]}
                    outerCls="border-[#979797] border-[1px] border-solid rounded-[4px] max-w-[800px] min-h-[117px]"
                    buttonCls="bg-[#3586FF]"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <Button
                className="px-24 py-4 font-medium text-[16px] leading-[22.8px] text-[#FFFFFF] bg-[#3586FF] rounded-[8px]"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
const AddressDetails = () => {
  const [OpenMessageModal, setOpenMessageModal] = useState(false);
  return (
    <>
      <div>
        <form>
          <div className="flex flex-col gap-y-[30px]">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-1 md:grid-cols-2">
              <div className="flex flex-col gap-y-[8px] w-full px-3">
                <p className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                  Country*
                </p>
                <SingleSelect
                  type="single-select"
                  name="country"
                  options={[
                    { id: 1, country: "India" },
                    { id: 2, country: "America" },
                    { id: 3, country: "London" },
                  ]}
                  rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[4px] max-w-[586px] min-h-[50px]"
                  buttonCls="border-none"
                  selectedOption={{
                    id: 1,
                    country: "India",
                  }}
                  optionsInterface={{
                    isObj: true,
                    displayKey: "country",
                  }}
                />
              </div>
              <div className="flex flex-col gap-y-[8px] w-full px-3">
                <p className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                  State*
                </p>
                <SingleSelect
                  type="single-select"
                  name="state"
                  options={[
                    { id: 1, state: "Tamil Nadu" },
                    { id: 2, state: "Telangana" },
                    { id: 3, state: "Karnataka" },
                  ]}
                  rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[4px] max-w-[586px] min-h-[50px]"
                  buttonCls="border-none"
                  selectedOption={{
                    id: 1,
                    state: "Tamil Nadu",
                  }}
                  optionsInterface={{
                    isObj: true,
                    displayKey: "state",
                  }}
                />
              </div>
              <div className="flex flex-col gap-y-[8px] w-full px-3">
                <p className="text-[#7B7C83] font-regular text-[16px] leading-[22.8px]">
                  City*
                </p>
                <SingleSelect
                  type="single-select"
                  name="city"
                  options={[
                    { id: 1, city: "Chennai" },
                    { id: 2, city: "Hyderabad" },
                    { id: 3, city: "Bangalore" },
                  ]}
                  rootCls="border-[1px] border-[#A1A0A0]  px-1 py-1 w-full rounded-[4px] max-w-[586px] min-h-[50px]"
                  buttonCls="border-none"
                  selectedOption={{
                    id: 1,
                    city: "Chennai",
                  }}
                  optionsInterface={{
                    isObj: true,
                    displayKey: "city",
                  }}
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Pin code*"
                  type="number"
                  name="pincode"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter your pin code"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
              <div className="w-full">
                <CustomInput
                  label="Area*"
                  type="text"
                  name="area"
                  labelCls=" font-regular text-[16px] leading-[22.8px] text-[#7B7C83]"
                  placeholder="enter your address"
                  className="h-[30px] px-2 py-1 border md:max-w-[368px] max-w-[297px] w-full border-[#A1A0A0] rounded-[4px] "
                  rootCls="px-2 py-1"
                />
              </div>
            </div>
            <div>
              <Button
                className="px-24 py-4 font-medium text-[16px] leading-[22.8px] text-[#FFFFFF] bg-[#3586FF] rounded-[8px]"
                onClick={() => setOpenMessageModal(true)}
              >
                Next
              </Button>
            </div>
          </div>
        </form>
      </div>
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
            <div className="max-w-[363px] min-h-[34px]">
              <h1 className="text-[#1F1F27] font-bold text-[24px] leading-[34.2px] text-center">
                Form Submitted Successfully
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
    </>
  );
};
