import React, { useEffect, useState } from "react";
import BreadCrumb from "../../BreadCrumb";
import ServiceHeroSection, {
  IServiceHeroSectionInterfaceProps,
} from "../../SubServices/ServiceHeroSection";
import ServiceProcess, { StepProps } from "../Components/ServiceProcess";
import Packages from "./Packages";
import OurServices, { ServiceCardProps } from "../Components/OurServices";
import FAQSComp from "../Components/FAQSComp";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import BlogCard from "@/components/BlogCard";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import MobileBlogCard from "@/components/MobileBlogCard";
import GoogleAdSense from "@/components/GoogleAdSense";

const CivilHeroSectionData: IServiceHeroSectionInterfaceProps = {
  heading: "Civil Engineering Structural Design",
  subHeading:
    "The world’s leading platform , promotes the idea that as a form of structural design.",
  bgImageUrl:
    "/images/custombuilder/subservices/civilengineering/herosection.png",
  bookingCtaUrl: { label: "Book for Consultation", url: "" },
  locationcta: [
    { label: "Hyderabad", url: "" },
    { label: "Chennai", url: "" },
    { label: "Bengaluru ", url: "" },
  ],
  selectedId: { id: 1, service: "Vaastu Consultation" },
};

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

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is structural design in civil engineering?",
    answer:
      "Structural design in civil engineering involves the creation of a framework that supports and resists loads. It ensures that buildings, bridges, and other structures are safe, stable, and durable, adhering to local codes and standards.",
  },
  {
    question: "Why is structural analysis important?",
    answer:
      "Structural analysis evaluates the effects of loads and forces on a structure. This process helps engineers ensure that the structure can withstand various stresses like wind, earthquakes, and weight, preventing failure or collapse.",
  },
  {
    question: "What materials are commonly used in structural design?",
    answer:
      "Common materials used in structural design include concrete, steel, wood, and masonry. The choice of material depends on the type of structure, its intended use, environmental factors, and the desired strength and durability.",
  },
  {
    question:
      "What is the difference between reinforced concrete and steel structure design?",
    answer:
      "Reinforced concrete design uses steel bars within the concrete to improve its tensile strength, making it suitable for various structures. Steel structure design involves the use of steel as the primary material, offering flexibility, strength, and faster construction times, especially for large or complex structures.",
  },
  {
    question: "How long does the structural design process take?",
    answer:
      "The structural design process can vary depending on the complexity and size of the project. A small building may take a few weeks, while larger, more complex structures can take several months. Factors such as material selection, design complexity, and client requirements also influence the timeline.",
  },
];

const stepsdata: StepProps[] = [
  {
    step: "STEP 1",
    title: "Book Consultation",
    description:
      "Schedule an appointment with our Vaastu expert at your convenience.",
    icon: "/images/custombuilder/subservices/plumbing/appointment.png",
  },
  {
    step: "STEP 2",
    title: "Site Analysis",
    description:
      "Our expert visits your location to assess the Vaastu compliance of your property.",
    icon: "/images/custombuilder/subservices/plumbing/schedule.png",
  },
  {
    step: "STEP 3",
    title: "Customized Solutions",
    description:
      "Receive personalized recommendations to enhance harmony and prosperity.",
    icon: "/images/custombuilder/subservices/plumbing/solve-prob.png",
  },
];
const services: ServiceCardProps[] = [
  {
    name: "Structural Design Consultation",
    description:
      "Get expert advice on designing efficient and sustainable structures. Our consultation service ensure .",
    imageUrl:
      "/images/custombuilder/subservices/civilengineering/services/design.png",
  },
  {
    name: "Structural Analysis",
    description:
      "Perform in-depth structural analysis to assess the strength, stability, and rigidity of your building framework. This service helps",
    imageUrl:
      "/images/custombuilder/subservices/civilengineering/services/concrete.png",
  },
  {
    name: "Reinforced Concrete Design",
    description:
      "Design durable and robust reinforced concrete structures that meet the demands of modern construction.  ",
    imageUrl:
      "/images/custombuilder/subservices/civilengineering/services/analysis.png",
  },
  {
    name: "Steel Structure Design",
    description:
      "Create resilient and flexible steel structures that can withstand heavy loads and extreme conditions. f ",
    imageUrl:
      "/images/custombuilder/subservices/civilengineering/services/structure.png",
  },
];

const CivilEngineeringComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const fetchBlogs = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: "CivilEngineering",
      });

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
    <div className="px-5">
      <BreadCrumb
        steps={[
          { label: "Our Services", link: "/services/custom-builder" },
          {
            label: "CivilEngineering",
            link: "/services/civilEngineering",
          },
        ]}
        currentStep="CivilEngineering"
      />
      <ServiceHeroSection {...CivilHeroSectionData} />
      <div className="mt-[100%] md:mt-[0px] md:mb-0 mb-14">
        <ServiceProcess
          steps={stepsdata}
          title={"Our Process"}
          subTitle={"We’ll get the job done efficiently and discretely"}
        />{" "}
      </div>
      <Packages />
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">

        <GoogleAdSense />
      </div>

      <OurServices
        title={"Our Services"}
        subTitle={" Explore Our Vaastu Expertise"}
        services={services}
      />
      <TestimonialsSection {...testimonialsData} />
      <div className="mb-[45px] md:mb-[64px]">
        <FAQSComp
          faqs={faqs}
          image={"/images/custombuilder/subservices/civilengineering/faqs.png"}
        />{" "}
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
            <p>Loading blogs...</p>
          ) : (
            <p>No blogs found.</p>
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

export default CivilEngineeringComponent;
