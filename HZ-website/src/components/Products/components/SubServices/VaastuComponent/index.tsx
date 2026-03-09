import React, { useEffect, useState } from "react";
import BreadCrumb from "../../BreadCrumb";
import ServiceHeroSection, {
  IServiceHeroSectionInterfaceProps,
} from "../../SubServices/ServiceHeroSection";
import FAQSComp from "../Components/FAQSComp";
import ServiceProcess, { StepProps } from "../Components/ServiceProcess";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import OurServices, { ServiceCardProps } from "../Components/OurServices";
import AboutVaastu from "./AboutVaastu";
import BlogCard from "@/components/BlogCard";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import MobileBlogCard from "@/components/MobileBlogCard";
import GoogleAdSense from "@/components/GoogleAdSense";

const VaastuHeroSectionData: IServiceHeroSectionInterfaceProps = {
  heading: "World’s Premier Vastu Portal",
  subHeading:
    "Vastu Consultation – the world’s leading platform on Vastu, promotes the idea that Vastu is a form of energy and space healing.",
  bgImageUrl: "/images/custombuilder/subservices/vaastu/herosection.png",
  bookingCtaUrl: { label: "Discover More", url: "" },
  locationcta: [
    { label: "Hyderabad", url: "" },
    { label: "Chennai", url: "" },
    { label: "Bengaluru ", url: "" },
  ],
  selectedId: { id: 1, service: "Vaastu Consultation" },
};

const stepsdata: StepProps[] = [
  {
    step: "STEP 1",
    title: "Proposal",
    description:
      "At stage two, we need a floor plan with accurate direction, details on the surrounding of the site, History of the premises with a brief on your goals & priorities.",
    icon: "/images/custombuilder/subservices/vaastu/process/proposal.png",
  },
  {
    step: "STEP 2",
    title: "Floor Plan & Details",
    description:
      "At stage two, we need a floor plan with accurate direction, details on the surrounding of the site, History of the premises with a brief on your goals & priorities.",
    icon: "/images/custombuilder/subservices/vaastu/process/floorplan.png",
  },
  {
    step: "STEP 3",
    title: "Site Survey",
    description:
      "At stage two, we need a floor plan with accurate direction, details on the surrounding of the site, History of the premises with a brief on your goals & priorities.",
    icon: "/images/custombuilder/subservices/vaastu/process/site.png",
  },
  {
    step: "STEP 4",
    title: "Vastu Reading",
    description:
      "At stage two, we need a floor plan with accurate direction, details on the surrounding of the site, History of the premises with a brief on your goals & priorities.",
    icon: "/images/custombuilder/subservices/vaastu/process/vastu.png",
  },
  {
    step: "STEP 5",
    title: "Report by Vastu Consultant",
    description:
      "At stage two, we need a floor plan with accurate direction, details on the surrounding of the site, History of the premises with a brief on your goals & priorities.",
    icon: "/images/custombuilder/subservices/vaastu/process/report.png",
  },
  {
    step: "STEP 6",
    title: "Vastu Follow up",
    description:
      "At stage two, we need a floor plan with accurate direction, details on the surrounding of the site, History of the premises with a brief on your goals & priorities.",
    icon: "/images/custombuilder/subservices/vaastu/process/follow.png",
  },
];

const testimonialsData: ITestimonialsSectionProps = {
  words: [
    {
      name: "Rohit",
      desc: "The Vastu consultation has brought a positive change in our home. The expert’s suggestions were spot-on, and we’ve noticed a great improvement in energy flow.",
      rating: 5,
    },
    {
      name: "Priya",
      desc: "Highly professional and insightful service. The consultant was thorough and explained everything in detail. We’re really happy with the results.",
      rating: 5,
    },
    {
      name: "Ankit",
      desc: "The consultation was extremely helpful. The recommendations were practical, and we’ve felt a noticeable difference in the harmony of our space.",
      rating: 4,
    },
    {
      name: "Divya",
      desc: "Amazing experience! The Vastu expert addressed all our concerns and provided clear guidance. We feel much more at peace in our home now.",
      rating: 5,
    },
  ],
};

const faqs = [
  {
    question: "What is Vastu consultation?",
    answer:
      "Vastu consultation involves analyzing and aligning your living or working space according to the principles of Vastu Shastra. This ancient Indian science promotes harmony, health, and prosperity by balancing the natural elements and energy flow within a building.",
  },
  {
    question: "What areas of my home or office can be evaluated through Vastu?",
    answer:
      "Vastu can be applied to every area of your home or office, including the layout of rooms, furniture placement, entrance direction, and the location of key elements like the kitchen, bedroom, and bathroom. It ensures positive energy flow throughout the space.",
  },
  {
    question: "Do I need a complete renovation for Vastu compliance?",
    answer:
      "Not necessarily. In many cases, small adjustments, such as repositioning furniture or adding specific Vastu remedies, can make a significant difference. A full renovation is only needed when there are major structural issues that conflict with Vastu principles.",
  },
  {
    question: "Can Vastu help with business success?",
    answer:
      "Yes, Vastu principles can be applied to commercial spaces to enhance productivity, profitability, and employee well-being. The right alignment of elements in your workspace can create a more balanced and prosperous environment.",
  },
  {
    question: "How do I know if my home or office needs Vastu consultation?",
    answer:
      "If you’re facing ongoing issues like financial instability, health problems, or lack of peace and harmony, a Vastu consultation could help identify the root causes. By making energy corrections, you can improve the quality of life in your space.",
  },
];

const services: ServiceCardProps[] = [
  {
    name: "Home Vastu Consultation",
    description:
      "Home Vastu provides you with specific guidelines that can be applied to any home environment.",
    imageUrl:
      "/images/custombuilder/subservices/vaastu/services/homevaastu.png",
  },
  {
    name: "Office Vastu Consultation",
    description:
      "Many companies have experienced a spontaneous improvement in their prosperity by making their location Vastu-compliant.",
    imageUrl:
      "/images/custombuilder/subservices/vaastu/services/officevaastu.png",
  },
  {
    name: "Industries Vastu Consultation",
    description:
      "Industries Vastu focuses on applying guidelines to factory and industrial sites, improving overall energy.",
    imageUrl:
      "/images/custombuilder/subservices/vaastu/services/industvaastu.png",
  },
  {
    name: "Quick Vastu Consultation",
    description:
      "Quick Vastu is designed for fast consultations, offering quick insights to improve property alignment for better results.",
    imageUrl:
      "/images/custombuilder/subservices/vaastu/services/quickvaastu.png",
  },
];

const VaastuComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const fetchBlogs = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: "VaastuConsultation",
      });
      console.log("lohhh", res);
      setBlogs(res?.body?.blogs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setLoading(false);
    }
  };
  const blogsToShow = showMore ? blogs : blogs.slice(0, 4);

  useEffect(() => {
    fetchBlogs();
  }, []);
  const [showAll, setShowAll] = useState(false);
  const blogsToShowall = showAll ? blogs : blogs.slice(0, 3);

  const handleshowall = () => {
    setShowAll(!showAll);
  };

  return (
    <div>
      <div>
        <BreadCrumb
          steps={[
            { label: "Our Services", link: "/services/custom-builder" },
            {
              label: "VaastuConsultation",
              link: "/services/vaastu-consultation",
            },
          ]}
          currentStep="VaastuConsultation"
        />
      </div>
      <ServiceHeroSection {...VaastuHeroSectionData} />
      <div className="mt-[85%] md:mt-[0px]">
        {" "}
        <OurServices
          title={"Our Services"}
          subTitle={" Explore Our Vaastu Expertise"}
          services={services}
        />
      </div>
      <AboutVaastu />
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <h1 className="font-bold md:text-[24px] text-[18px] ">
          Recommended for You
        </h1>
        <GoogleAdSense />
      </div>
      <ServiceProcess
        steps={stepsdata}
        title={"Our Vastu  Process Consultation"}
        subTitle={"We’ll get the job done efficiently and discreetly"}
      />
      <TestimonialsSection {...testimonialsData} />
      <div className="mb-[45px] md:mb-[64px]">
        <FAQSComp
          faqs={faqs}
          image={"/images/custombuilder/subservices/plumbing/faqs.png"}
        />
      </div>

      <div className="flex flex-col items-center gap-y-[20px] mb-[45px] md:mb-[64px]">
        <div className="md:flex flex-col justify-center items-center gap-4  hidden">
          <h1 className="text-black font-medium md:font-bold text-[24px] md:text-[25px]  text-start">
            Our Blog
          </h1>
          <h2 className="text-[#7B7C83] leading-[28.5px] text-[20px]">
            Latest Blog & Articles
          </h2>
        </div>
        <div className="max-w-[398px] min-h-[29px] flex items-center gap-x-[231px] md:hidden">
          <div className="max-w-[109px] min-h-[29px] ">
            <h1 className="text-[#000000] font-medium text-[20px] leading-[28.5px]">
              Our Blogs
            </h1>
          </div>
          {blogs.length > 3 && (
            <div className="max-w-[69px] min-h-[23px] ">
              <Button
                className="text-[#3586FF] text-[16px] leading-[22.8px] text-nowrap font-medium"
                onClick={() => handleshowall()}
              >
                {showAll ? "View Less" : "View All"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap md:flex-row flex-col justify-center items-center gap-5 ">
          {blogs.length > 0 ? (
            blogsToShow.map((blog, index) => (
              <>
                <div
                  key={index}
                  className={`rounded-[12px] shadow-md md:max-w-[332px] hidden md:block`}
                >
                  <BlogCard data={blog} />
                </div>
              </>
            ))
          ) : loading ? (
            <p className="text-center text-gray-500 label-text">Loading blogs...</p>
          ) : (
            <p className="text-center text-gray-500 label-text">No blogs found.</p>
          )}
          {blogsToShowall.map((blog, index) => (
            <div
              key={index}
              className="rounded-[12px] shadow-md flex flex-col gap-y-[8px] items-center md:hidden"
            >
              <MobileBlogCard data={blog} />
            </div>
          ))}
        </div>

        {blogs.length > 4 && (
          <div className="md:flex justify-center mt-5 hidden">
            <button
              className="bg-[#3586FF] text-white px-4 py-2 rounded-lg"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "See Less" : "See More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaastuComponent;
