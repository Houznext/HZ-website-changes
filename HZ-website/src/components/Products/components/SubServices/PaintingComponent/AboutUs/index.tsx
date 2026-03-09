import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Button from "@/common/Button";

const AboutUs = () => {
  const router = useRouter();
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-0 md:w-72 w-60 md:h-72 h-60 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 right-0 md:w-96 w-70 md:h-96 h-70 bg-blue-50 rounded-full translate-x-1/3 translate-y-1/3 opacity-60"></div>

      <div className="relative flex flex-col lg:flex-row gap-12 lg:gap-16 justify-between items-center px-6 sm:px-4 lg:px-12 py-16 lg:py-20 mt-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:gap-8 gap-4  relative z-10">
          <div className="inline-flex items-center gap-2 md:text-[16px] text-[14px] bg-blue-50 text-[#3586FF] px-4 py-2 rounded-full w-fit ">
            <div className="w-2 h-2 bg-[#3586FF] rounded-full"></div>
            <span className="font-medium  md:text-[16px] text-[14px] tracking-wide">
              WHO WE ARE
            </span>
          </div>

          <h1 className="font-bold text-[24px] lg:text-[32px] leading-11 lg:leading-[52px] text-[#3586FF]">
            About us
          </h1>

          <div className="md:space-y-6 space-y-3">
            <h2 className="font-bold text-[18px] lg:text-[24px] leading-6 lg:leading-[32px] text-gray-900">
              We believe that a fresh coat of paint can transform any space.
            </h2>

            <div className="md:space-y-4 space-y-2">
              <p className="font-regular text-[15px] lg:text-[17px] leading-6 lg:leading-7 text-gray-600">
                We are fully licensed and insured, so you can have peace of mind
                knowing that your property is in good hands. We also offer
                competitive pricing for our services without compromising on
                quality.
              </p>

              <div className="flex flex-row gap-4 sm:gap-2 md:pt-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#3586FF] rounded-full"></div>
                  </div>
                  <span className="font-regular text-gray-700 md:text-[18px] text-[12px]">
                    Licensed & Insured
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-[#3586FF] rounded-full"></div>
                  </div>
                  <span className="font-regular text-gray-700 md:text-[18px] text-[12px]">
                    Competitive Pricing
                  </span>
                </div>
              </div>

              <p className="font-regular text-[15px] lg:text-[17px] leading-6 lg:leading-7 text-gray-600 pt-4">
                We are a locally owned and operated business. We are proud to
                serve our community and have built strong relationships with our
                clients over the years.
              </p>
            </div>
          </div>

          <div className="flex gap-4 md:pt-4 pt-2">
            <Button
              onClick={() => router.push("/about-us")}
              className="bg-[#3586FF] text-white md:px-8 px-3 md:py-3 py-1 md:text-[16px] text-[12px] rounded-lg font-medium hover:bg-[#3586FF]transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Learn More
            </Button>
            <Button
              onClick={() => router.push("/contact-us")}
              className="border border-gray-300 text-gray-700 md:px-8 px-3 md:py-3 py-1 md:text-[16px] text-[12px] rounded-lg font-medium hover:border-blue-300 hover:text-[#3586FF] transition-all duration-300"
            >
              Contact Us
            </Button>
          </div>
        </div>


        <div className="relative aspect-[16/9] md:w-[700px] w-full h-[380px] lg:h-[500px]">
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce z-20"></div>
          <div className="absolute -bottom-2 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-bounce z-20 delay-300"></div>

          <div className="absolute -inset-6 bg-gradient-to-r from-blue-200/50 via-cyan-200/30 to-purple-200/20 rounded-3xl transform rotate-3 blur-sm"></div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl transform rotate-2"></div>
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl transform rotate-2"></div>
          <div className="relative w-full md:h-full h-[380px] rounded-xl overflow-hidden shadow-2xl">
            <Image
              src="/images/custombuilder/subservices/painting/aboutus.png"
              alt="Our professional painting team at work"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            {/* Overlay Card */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg md:p-4  p-2 shadow-lg ">
              <div className="flex items-center gap-3">
                <div className="md:w-12 w-8 md:h-12 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="md:w-6 w-3 md:h-6 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div>
                  <p className="font-bold md:text-[16px] text-[12px] text-gray-900">
                    5+ Years
                  </p>
                  <p className="font-regular md:text-[14px] text-[10px] text-gray-600">
                    Experience
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
