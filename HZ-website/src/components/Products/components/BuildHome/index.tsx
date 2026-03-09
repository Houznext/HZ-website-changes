import React from "react";
import OneStopSol from "../onestepsol";
import BuilderProcess from "../BuilderProcess";
import TestimonalBuilder from "../TestimonalHouse";
import CostEstimator from "../CostEstimator";
import BuilderHeroSection from "../HeroSection";
import OurProjects from "../ourProjects";
import FAQSComp from "../SubServices/Components/FAQSComp";
import TriedOptions from "../TriedOptions";
import GoogleAdSense from "@/components/GoogleAdSense";

const faqs = [
  {
    question: "What services do you offer?",
    answer:
      "We provide a comprehensive range of construction and interior services, including Residential Construction, Construction for Business, Interior Design, Vastu Consultation, and Furniture Manufacturing. Our services are tailored to meet your specific needs and ensure a seamless experience from start to finish.",
  },
  {
    question: "How can I estimate the cost of my construction project?",
    answer:
      "You can use our Construction Cost Estimator tool available on our website. Simply enter your project details, such as the type of building, location, and area, and our estimator will provide you with an accurate cost estimate instantly.",
  },
  {
    question: "What makes your construction services different from others?",
    answer:
      "We stand out by offering on-time delivery, no-cost overruns, and hassle-free project management. With us, you’ll have transparency throughout the process, from budgeting to the final handover, ensuring that there are no hidden charges or unexpected delays.",
  },
  {
    question: "Can I customize my interior design project?",
    answer:
      "Absolutely! We offer fully customizable interior design services to match your personal style and preferences. Our team of experienced designers works closely with you to create spaces that reflect your vision while ensuring functionality and aesthetics.",
  },
  {
    question: "What is CustomBuilder in OneCasa?",
    answer:
      "CustomBuilder is OneCasa's specialized service that allows you to design and build your dream home exactly the way you envision it. From architectural design and layout to material choices and interior finishes, CustomBuilder offers the flexibility and expertise to create a space that is uniquely yours.",
  },
];
const BuildHome = () => {
  return (
    <div className="p-5 md:p-[40px] md:max-w-[90%] mx-auto">
      <div className="md:mb-[0px] mb-[40px]">
        <BuilderHeroSection />
      </div>
      <div className="md:mt-[0px] mt-[500px] ">
        <OneStopSol />
      </div>
      <TriedOptions />
      <CostEstimator />
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>
      <BuilderProcess />
      <OurProjects />
      <TestimonalBuilder />
      <FAQSComp
        image={"/images/custombuilder/subservices/homedecor/faqs/faqsimage.png"}
        faqs={faqs} />
    </div>
  );
};
export default BuildHome;
