import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/common/Button";
import { RightArrowWhite } from "@/components/Icons";
import ContactForm from "../../Components/ContactForm";
import StepForm from "../StepForm";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Modal from "@/common/Modal";
import { MdEventAvailable } from "react-icons/md";
import { useRouter } from "next/router";
import { FaPaintRoller, FaClock, FaBroom } from "react-icons/fa";

export interface IServiceHeroSectionInterfaceProps {
  heading: string;
  subHeading: string;
  bgImageUrl: string;
  bookingCtaUrl: { label: string; url: string };
  locationcta: Array<{
    label: string;
    url: string;
  }>;
  selectedId: {
    id: number;
    service: string;
  };
}

function HeroSection({
  bookingCtaUrl,
  heading,
  locationcta,
  subHeading,
  bgImageUrl,
  selectedId,
}: IServiceHeroSectionInterfaceProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStepFormVisible, setIsStepFormVisible] = useState(false);
  const router = useRouter();

  const sliderSettings = {
    dots: true,
    appendDots: (dots: any) => (
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          zIndex: 30,
        }}
      >
        {dots}
      </div>
    ),
    beforeChange: (current: number, next: number) => setCurrentSlide(next),
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "18px" : "18px",
          height: "18px",
          borderRadius: i === currentSlide ? "20px" : "20px",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          transition: "all 0.3s ease-in-out",
          display: "inline-block",
        }}
      />
    ),
  };
  const steps = [
    {
      id: 1,
      icon: <FaPaintRoller className="md:w-6 w-4 md:h-6 h-4" />,
      title: "Flawless Finish",
      subtitle: "Guaranteed!",
    },
    {
      id: 2,
      icon: <FaClock className="md:w-6 w-4 md:h-6 h-4" />,
      title: "On-time Completion",
      subtitle: "Guaranteed!",
    },
    {
      id: 3,
      icon: <FaBroom className="md:w-6 w-4 md:h-6 h-4" />,
      title: "Post-painting Cleanup",
      subtitle: "Guaranteed!",
    },
  ];

  const heroSlides = [
    {
      image: bgImageUrl,
      heading: "Transform Your Home with Professional Painting Services",
      subHeading:
        "Give your walls a stunning makeover! Our skilled painters in Chennai ensure a flawless, vibrant finish that revitalizes your entire space, adding elegance and charm to your home.",
      bookingCtaUrl: { label: "Discover More", url: "" },
    },
    {
      image:
        "/images/custombuilder/subservices/painting/services/residential.png",
      heading: "Residential Painting Services That Elevate Your Living Space",
      subHeading:
        "From cozy apartments to luxurious villas, our expert team delivers seamless painting solutions that brighten every corner, enhance aesthetics, and protect your home for years to come.",
      bookingCtaUrl: { label: "Book Now", url: "" },
    },
    {
      image:
        "/images/custombuilder/subservices/painting/services/commercial.png",
      heading: "Reliable Commercial Painting Solutions for Businesses",
      subHeading:
        "Make a lasting impression with professionally painted offices and commercial spaces. We guarantee timely completion, superior quality finishes, and colors that reflect your brand’s identity.",
      bookingCtaUrl: { label: "Get Started", url: "" },
    },
  ];

  return (
    <>
      <div className="lg:h-[580px] md:h-[430px] h-[420px] relative overflow-hidden">
        <Slider {...sliderSettings}>
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className="relative w-full lg:h-[580px] md:h-[430px] h-[420px]"
            >
              <Image
                src={slide.image}
                alt={`slide-${index}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20" />
            </div>
          ))}
        </Slider>
        <div className="absolute inset-0 flex flex-col md:flex-row w-full h-full items-center justify-between px-6 z-30">
          <div className="flex flex-col max-w-[520px] h-full justify-center items-start py-6 md:py-12 px-5">
            <h1 className="text-white font-bold text-[26px] md:text-[32px] lg:text-[36px] leading-tight md:mb-4 mb-2">
              {heroSlides[currentSlide].heading}
            </h1>
            <p className="text-white text-[14px] md:text-[16px] lg:text-[18px] leading-relaxed md:mb-8 mb-4 md:max-w-[500px]">
              {heroSlides[currentSlide].subHeading}
            </p>

            <div className="mb-6 md:mb-10 w-full">
              <Button
                className="rounded-lg bg-[#3586FF] text-[13px] md:text-[16px] px-3 py-2 md:px-5 md:py-4 font-regular md:font-medium text-white cursor-pointer "
                onClick={() => router.push("/painting/paint-cost-calculator")}
              >
                <div className="flex flex-row gap-3 items-center">
                  <p>Estimate Painting Cost</p>
                  <div className="hover:rotate-90 transition-transform duration-200 hover:ease-out w-6 h-6 flex items-center justify-center">
                    <RightArrowWhite />
                  </div>
                </div>
              </Button>
            </div>
          </div>
          <div className="relative md:w-[400px] md:h-[300px]">
            <Image
              src={"/images/custombuilder/subservices/painting/homecover.png"}
              alt="hero"
              className="object-cover"
              fill
            />
          </div>
          <div className="fixed bottom-[7%] left-0 w-full bg-white shadow-md border-t pb-1 px-4 z-50 md:hidden block">
            <div className="max-w-[1600px] w-full mx-auto p-3 flex items-center justify-center">
              <Button
                className="bg-[#3586FF] font-medium md:px-5 px-3 md:py-3 py-3 md:text-[16px] text-[14px] rounded-[4px] text-white md:max-w-[50%] w-full flex items-center justify-center gap-2"
                onClick={() => setIsStepFormVisible(true)}
              >
                <MdEventAvailable className="text-white w-5 h-5" /> Book Site
                Inspection
              </Button>
            </div>
          </div>

          <div className="md:max-w-[390px] z-30 w-full  md:block hidden ">
            {/* <ContactForm selectedId={selectedId} /> */}
            <StepForm />
          </div>
        </div>
        {isStepFormVisible && (
          <Modal
            isOpen={isStepFormVisible}
            closeModal={() => setIsStepFormVisible(false)}
            className="w-fit max-w-full rounded-[4px] px-3 py-2"
            isCloseRequired={false}
            rootCls="z-[9999] "
          >
            {" "}
            <StepForm />
          </Modal>
        )}
      </div>
      {/* <div className="absolute bottom-0 left-0 w-full  md:mt-5 bg-black text-white md:py-6 py-10 px-2 md:px-3 z-40">
        <div className="max-w-[1200px] mx-auto  relative flex justify-center  items-center md:gap-6 gap-3 md:pl-[20px] pl-0">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex  items-center md:items-start relative gap-1 md:gap-2 md:flex-1"
            >
              <div className="md:w-12 w-8 md:h-12 h-8 bg-[#3586FF] rounded-full flex items-center justify-center text-white font-bold mb-2 z-10">
                {step.icon}
              </div>

              <div className="">
                <div className="text-center md:text-left md:space-y-2 space-y-1">
                  <h4 className="font-bold text-[12px] md:text-[16px]">
                    {step.title}
                  </h4>
                  <p className="font-medium text-[10px] md:text-[14px]">
                    {step.subtitle}
                  </p>
                </div>
              </div>

              <div className="">
                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-1 my-3  right-1/4 w-[2px] mb-5 h-full bg-gray-600"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </>
  );
}

export default HeroSection;
