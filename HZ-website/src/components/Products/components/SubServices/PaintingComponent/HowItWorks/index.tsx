import Image from "next/image";
import Button from "@/common/Button";
import Modal from "@/common/Modal";
import StepForm from "../StepForm";
import { useState } from "react";
const steps = [
  {
    id: 1,
    title: "Site Inspection & Quotation",
    image: "/images/custombuilder/subservices/painting/howitworks/SiteInspectionQuotation.jpg",
  },
  { id: 2, title: "Accept Quotation", image: "/images/custombuilder/subservices/painting/howitworks/AcceptQuotation.jpg" },
  {
    id: 3,
    title: "Free Colour Consulation",
    image: "/images/custombuilder/subservices/painting/howitworks/FreeColourConsulation.jpg",
  },
  {
    id: 4,
    title: "Painting Work Begins",
    image: "/images/custombuilder/subservices/painting/services/commercial.png",
  },
  {
    id: 5,
    title: "Dedicated Project Manager",
    image: "/images/custombuilder/subservices/painting/howitworks/DedicatedProjectManager.jpg",
  },
  {
    id: 6,
    title: "Fininshing And HandOver",
    image: "/images/custombuilder/subservices/painting/howitworks/approval.webp",
  },
];

export default function HowItWorks() {
  const [isStepFormVisible, setIsStepFormVisible] = useState(false);
  return (
    <section className="md:py-8 py-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-3 lg:mb-5">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#3586FF] px-4 py-2 rounded-full mb-6 border border-blue-100">
            <div className="w-2 h-2 bg-[#3586FF] rounded-full animate-pulse"></div>
            <span className="font-medium text-sm tracking-wide">
              OUR PROCESS
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-center text-[24px] md:text-[32px] font-bold text-[#3586FF] md:mb-4 mb-2">
        How It Works
      </h2>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 -z-10">
          <div className="mx-auto h-40 rounded-full border border-rose-100/70" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
          <p className="flex-1 font-medium md:text-[18px] text-[12px] text-gray-500">
            OneCasa will help renovate your house in{" "}
            <span className="font-bold text-gray-800">
              6 simple steps Book your inspection today!
            </span>
          </p>

          <div className="flex-1 md:flex justify-end  hidden">
            <Button
              className="bg-[#3586FF] font-medium md:px-3 px-3 md:py-3 py-3 md:text-[16px] text-[14px] rounded-[10px] text-white md:max-w-[50%] w-full flex items-center justify-center gap-2"
              onClick={() => setIsStepFormVisible(true)}
            >
              Book Site Inspection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 md:gap-x-8 gap-x-4 md:gap-y-8 gap-y-4 md:px-4  px-2 py-4 md:py-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center text-center group transition-transform hover:-translate-y-2 duration-300"
            >
              <div className="relative w-full max-w-[360px] aspect-[4/3] overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <span className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-[#3586FF] to-rose-500 text-white text-[10px] font-bold rounded-full shadow-md md:hidden">
                  {step.id < 10 ? `0${step.id}` : step.id}
                </span>
              </div>


              <div className="md:mt-4 mt-2">
                <div className="text-[12px] md:text-[16px]">
                  <span className="font-bold text-[#3586FF] mr-2 md:block hidden">
                    {step.id < 10 ? `0${step.id}` : step.id}
                  </span>
                  <span className="font-medium md:text-[16px] text-[12px] text-gray-800">
                    {step.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:hidden mt-3 px-10">
        <div className="h-px border-t-2 border-dotted border-gray-300" />
      </div>
      {isStepFormVisible && (
        <Modal
          isOpen={isStepFormVisible}
          closeModal={() => setIsStepFormVisible(false)}
          className="w-full max-w-6xl rounded-[10px] overflow-hidden relative flex flex-col  md:flex-row shadow-xl h-auto"
          isCloseRequired={false}
          rootCls="z-[9999]"
        >
          <Image
            src="https://dreamcasaimages.s3.ap-south-1.amazonaws.com/IMG_1112_f2417c71bf.JPG"
            alt="Book Inspection"
            fill
            className="object-cover brightness-90 absolute inset-0 -z-10"
          />

          <div className="flex flex-col md:flex-row  justify-between  items-center md:gap-9 gap-3  w-full h-full">
            <div className="flex-1 flex flex-col justify-center items-start p-1 md:p-3 text-white md:gap-3 gap-1">
              <h3 className="text-[24px] md:text-[32px] font-bold uppercase leading-tight">
                UNLOCK
              </h3>
              <h4 className="text-[20px] md:text-[28px] font-bold leading-tight">
                BEST DEALS
              </h4>
              <p className="font-medium text-[14px] md:text-[16px]">
                BY BOOKING INSPECTION TODAY
              </p>
            </div>

            <div className="md:max-w-[390px] z-30 w-full   ">
              <StepForm />
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
