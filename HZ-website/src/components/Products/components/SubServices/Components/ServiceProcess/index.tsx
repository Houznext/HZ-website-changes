import React, { useState, useRef } from "react";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { motion } from "framer-motion";

export interface StepProps {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export interface ServiceProcessProps {
  steps: StepProps[];
  title: string;
  subTitle: string;
}

const ServiceProcess: React.FC<ServiceProcessProps> = ({
  steps,
  title,
  subTitle,
}) => {
  const sliderRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderSettings = {
    dots: true,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next);
    },
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,

    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "41px" : "12px",
          height: "12px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          transition: "all 0.3s ease-in-out",
          margin: "-10px 4px",
          display: "inline-block",
        }}
      />
    ),

    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "5px",
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "5px",
        },
      },
    ],
  };
  return (
    // <div className="md:py-10 py-6 md:px-6 px-4">
    //   <div className="flex flex-col gap-2 items-center justify-center mb-8">
    //     <h1 className="font-medium md:text-[25px] text-[20px] text-center">
    //       {title}
    //     </h1>
    //     <h2 className="font-medium md:text-[20px] text-[18px] text-[#7B7C83] text-center">
    //       {subTitle}
    //     </h2>
    //   </div>
    //   <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative  mt-16">
    //     {steps.map((step, index) => (
    //       <div
    //         key={index}
    //         className="relative border-dashed border-[2px] border-[#E5E5E5] p-6 rounded-md flex flex-col items-center"
    //       >
    //         <Image
    //           src={step.icon}
    //           alt={step.title}
    //           className="h-20 mb-4 rounded-[50%]"
    //           objectFit="cover"
    //           width={100}
    //           height={140}
    //         />
    //         <span className="bg-[#0052CC] absolute -top-[14px] right-4 transform -translate-x-[20%] text-white px-4 py-[6px] rounded-[4px] mb-4 text-sm font-medium">
    //           {step.step}
    //         </span>
    //         <h3 className="font-bold text-[20px] text-center mb-2">
    //           {step.title}
    //         </h3>
    //         <p className="font-regular text-center text-[#7B7C83]">
    //           {step.description}
    //         </p>
    //       </div>
    //     ))}
    //   </div>
    //   <div className="block md:hidden max-w-[390px] ">
    //     <Slider ref={sliderRef} {...sliderSettings}>
    //       {steps.map((step, index) => (
    //         <div
    //           key={index}
    //           className="relative border-dashed border-[2px] border-[#E5E5E5] p-3 rounded-md flex flex-col items-center m-1"
    //         >
    //           <Image
    //             src={step.icon}
    //             alt={step.title}
    //             className="h-20 mb-4 rounded-[50%]"
    //             objectFit="cover"
    //             width={100}
    //             height={140}
    //           />
    //           <span className="bg-[#0052CC] absolute -top-[11px] right-4 transform -translate-x-[20%] text-white px-4 py-[6px] rounded-[4px] mb-12 text-sm font-medium">
    //             {step.step}
    //           </span>
    //           <h3 className="font-bold md:text-[20px] text-[16px] text-center mb-2">
    //             {step.title}
    //           </h3>
    //           <p className="font-regular text-center md:text-[16px] text-[12px] text-[#7B7C83]">
    //             {step.description}
    //           </p>
    //         </div>
    //       ))}
    //     </Slider>
    //   </div>
    // </div>
    <section className="relative md:py-10 py-8 md:px-6 px-4 bg-gradient-to-b from-white to-[#f8faff] overflow-hidden">
      
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#0052CC]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-[#3586FF]/10 rounded-full blur-3xl"></div>

     
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-3 items-center justify-center mb-12 text-center relative z-10"
      >
        <div className="relative">
          <h1 className="font-medium md:text-[25px] text-[20px] text-center">
            {title}
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-[3px] bg-gradient-to-r from-[#0052CC] to-[#3586FF] rounded-full"></div>
        </div>
        <h2 className="font-medium md:text-[20px] text-[18px] text-[#7B7C83] text-center">
          {subTitle}
        </h2>
      </motion.div>

      
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 relative z-10">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            className="relative group"
          >
           
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-[2px] bg-gradient-to-r from-[#0052CC] to-[#3586FF] opacity-40 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}

            
            <div className="relative bg-white/90 border border-gray-200/60 p-6 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 group-hover:border-[#3586FF]/40 group-hover:translate-y-[-6px] flex flex-col items-center text-center backdrop-blur-sm">
              
            
              <div className="absolute -top-5 right-6">
                <div className="bg-gradient-to-r from-[#0052CC] to-[#3586FF] text-white px-4 py-2 rounded-xl shadow-lg font-medium text-sm relative">
                  {step.step}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-[#0052CC] to-[#3586FF] rotate-45"></div>
                </div>
              </div>

             
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0052CC] to-[#3586FF] blur-xl opacity-30 group-hover:opacity-70 transition-all duration-500"></div>
                <div className="relative w-24 h-24 bg-white rounded-full border border-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-500">
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>
              </div>

             
              <h3 className="font-bold text-[20px] text-gray-900 mb-2 group-hover:text-[#0052CC] transition-colors duration-300">
                {step.title}
              </h3>
              <p className="font-regular text-[15px] text-[#6B7280] leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      
      <div className="block md:hidden max-w-[390px] mx-auto mt-1 relative z-10">
        <Slider ref={sliderRef} {...sliderSettings}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="px-2 pb-6"
            >
              <div className="relative bg-white/90 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 flex flex-col items-center text-center p-3 backdrop-blur-sm">
              
                <div className="absolute top-1 right-4">
                  <div className="bg-gradient-to-r from-[#0052CC] to-[#3586FF] text-white px-4 py-1.5 rounded-lg shadow-md font-medium text-xs relative">
                    {step.step}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-[#0052CC] to-[#3586FF] rotate-45"></div>
                  </div>
                </div>

               
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0052CC] to-[#3586FF] blur-lg opacity-30"></div>
                  <div className="relative w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>

                
                <h3 className="font-bold text-[16px] text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="font-regular text-[12px] text-[#6B7280] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ServiceProcess;
