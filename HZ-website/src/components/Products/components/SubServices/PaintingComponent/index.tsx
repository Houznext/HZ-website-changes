import Painting from "@/pages/painting";
import React, { useEffect, useState } from "react";
import BreadCrumb from "../../BreadCrumb";
import HeroSection, { IServiceHeroSectionInterfaceProps } from "./HeroSection";
import AboutUs from "./AboutUs";
import { useRouter } from "next/router";
import HowItWorks from './HowItWorks'
import PaintServices from "./OurServices";

import {
  BrushIcon,
  IndustrialIcon,
  InteriorIcon,
  ResidentialIcon,
  RollerIcon,
  WallPapersIcon,
} from "./PaintIcons";
import OurPartners from "../Components/OurPartners";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import GoogleAdSense from "@/components/GoogleAdSense";
import FAQSComp from "../Components/FAQSComp";
import apiClient from "@/utils/apiClient";
import BlogCard from "@/components/BlogCard";
import Button from "@/common/Button";
import MobileBlogCard from "@/components/MobileBlogCard";
import PaintingServiceCard from "./BookNowCard";

const PaintingHeroSectionData: IServiceHeroSectionInterfaceProps = {
  heading: "Professional Painting Services",
  subHeading:
    "Transform your home with a fresh coat of paint! Hire the best painters in Chennai and give your space a fresh, new Look! Trust the skilled painters in Chennai to bring your walls to life with precision and care.",
  bgImageUrl: "/images/custombuilder/subservices/painting/herosection_bg.png",

  bookingCtaUrl: { label: "Discover More", url: "" },
  locationcta: [
    { label: "Hyderabad", url: "" },
    { label: "Chennai", url: "" },
    { label: "Bengaluru ", url: "" },
  ],
  selectedId: { id: 6, service: "Painting" },
};

const testimonialsData: ITestimonialsSectionProps = {
  words: [
    {
      name: "Suresh",
      desc: "The painting service was excellent. The team was professional, timely, and the quality of the work exceeded my expectations. Highly recommend!",
      rating: 5,
    },
    {
      name: "Anjali",
      desc: "We are thrilled with the results. The painters were meticulous, and our home looks beautiful with the fresh coat of paint. The attention to detail was fantastic.",
      rating: 5,
    },
    {
      name: "Rajesh",
      desc: "Great service! The painters did a wonderful job and were very efficient. The whole process was hassle-free, and the outcome is perfect.",
      rating: 4,
    },
    {
      name: "Neha",
      desc: "The team was very professional and completed the painting on time. The colors they suggested really transformed the look of our living room.",
      rating: 5,
    },
  ],
};
const faqs = [
  {
    question: "How do I choose the right paint color for my space?",
    answer:
      "Choosing the right paint color depends on factors like room size, lighting, and personal preference. Our experts can guide you through the process by offering color consultations and suggesting shades that match your style and enhance your space.",
  },
  {
    question: "How long does a typical painting project take?",
    answer:
      "The duration of a painting project depends on the size of the area being painted and the complexity of the work. Most residential projects can be completed in a few days, while larger commercial spaces may take longer. We’ll provide you with a timeline during the consultation.",
  },
  {
    question: "What should I do to prepare my home for painting?",
    answer:
      "Before we start, it’s helpful to remove fragile items, furniture, and decor from the rooms being painted. Our team will cover and protect floors, fixtures, and furniture that can’t be moved to ensure everything stays clean and undamaged during the process.",
  },
  {
    question: "How often should I repaint my home?",
    answer:
      "On average, interior walls should be repainted every 5-7 years, depending on wear and tear. Exterior surfaces may need repainting every 5-10 years, depending on weather conditions and the quality of the previous paint job.",
  },
  {
    question: "Do I need to be home during the painting process?",
    answer:
      "It’s not necessary for you to be present while we paint, but some clients prefer to be home to monitor progress. Our team is professional and trustworthy, so you can feel confident leaving us to complete the job.",
  },
];

const services = [
  {
    title: "Commercial Painting",
    description:
      "Our commercial painting services help business owners make a good impression on customers and workers alike.",
    icon: BrushIcon,
    imageUrl:
      "/images/custombuilder/subservices/painting/services/commercial.png",
  },
  {
    title: "Residential Painting",
    description:
      "Our residential painting services aim to aid homeowners in making their dwellings look more presentable and comfortable.",
    icon: ResidentialIcon,
    imageUrl:
      "/images/custombuilder/subservices/painting/services/residential.png",
  },
  {
    title: "Drywall Texturing",
    description:
      "You can rely on us to repair any holes in your walls and texture them so they are ready to be painted or wallpapered.",
    icon: RollerIcon,
    imageUrl: "/images/custombuilder/subservices/painting/services/drywall.png",
  },
  {
    title: "Interior Painting",
    description:
      "We provide interior painting services for your home or business that include walls, ceilings, trim, doors, and other surfaces.",
    icon: InteriorIcon,
    imageUrl:
      "/images/custombuilder/subservices/painting/services/interior.png",
  },
  {
    title: "Industrial Painting",
    description:
      "Our industrial painting services help business owners make a good impression on customers and workers alike.",
    icon: IndustrialIcon,
    imageUrl:
      "/images/custombuilder/subservices/painting/services/industrial.png",
  },
  {
    title: "Wallpapering",
    description:
      "Our wallpapering services help business owners make a good impression on customers and workers alike.",
    icon: WallPapersIcon,
    imageUrl:
      "/images/custombuilder/subservices/painting/services/wallpaper.png",
  },
];

const PartnerImages = [
  {
    image: "/images/custombuilder/subservices/painting/partners/paint1.png",
  },
  {
    image: "/images/custombuilder/subservices/painting/partners/paint2.png",
  },
  {
    image: "/images/custombuilder/subservices/painting/partners/paint3.png",
  },
  {
    image: "/images/custombuilder/subservices/painting/partners/paint4.png",
  },
  {
    image: "/images/custombuilder/subservices/painting/partners/paint1.png",
  },
];

const PaintingComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const fetchBlogs = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: "Paints",
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
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector("#hero-section");
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setShowButtons(heroBottom < window.innerHeight - 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEnquireNow = () => {
    const heroSection = document.querySelector("#hero-section");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
            { label: "Painting", link: "/painting" },
          ]}
          currentStep="Painting"
        />
      </div>
      <div id="hero-section" className="mx-auto max-w-[90%]">

        <HeroSection {...PaintingHeroSectionData} />
      </div>

      {showButtons && (
        <div className="fixed top-1/2 -translate-y-1/2 right-0 flex flex-col items-end gap-3 z-50">
          <Button
            onClick={handleEnquireNow}
            className="bg-gradient-to-b from-blue-600 to-cyan-400 text-white font-medium px-1 md:px-3 md:py-2 py-2  rotate-180 [writing-mode:vertical-rl] rounded-tl-lg rounded-bl-lg shadow-lg hover:scale-105 transition-transform duration-300 md:text-[14px] text-[11px]"
          >
            ENQUIRE NOW
          </Button>

          <Button
            onClick={() => router.push('/painting/paint-cost-calculator')}
            className="bg-gradient-to-b from-orange-500 to-red-400 text-white font-medium md:px-3 px-1 md:py-2 py-2 rotate-180 [writing-mode:vertical-rl] rounded-tl-lg rounded-bl-lg shadow-lg hover:scale-105 transition-transform duration-300 md:text-[14px] text-[11px]"
          >
            PAINTING COST
          </Button>
        </div>
      )}
      <div className="mt-[0] md:mt-[0px]">
        <AboutUs />
      </div>
      <HowItWorks />
      {/* <PaintingServiceCard /> */}
      <PaintServices services={services} />
      <OurPartners images={PartnerImages} />
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>

      <TestimonialsSection {...testimonialsData} />
      <div className="mb-[45px] md:mb-[64px]">
        <FAQSComp
          faqs={faqs}
          image={"/images/custombuilder/subservices/painting/faqs.png"}
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
        <div className="max-w-[368px] min-h-[29px] flex items-center gap-x-[195px] md:hidden px-4">
          <div className="max-w-[109px] min-h-[29px] ">
            <h1 className="text-[#000000] font-medium text-[20px] leading-[28.5px] text-nowrap">
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
         <div className="hidden md:flex flex-row gap-7 justify-center items-center mx-auto max-w-[90%]">
          {blogs.length > 0 ? (
            blogsToShow.map((blog, index) => (
              <>
                <div
                  key={index}
                  className={`rounded-[12px] shadow-md w-full md:max-w-[332px] h-[320px]`}
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
        
        </div>  
        <div className="rounded-[12px] shadow-md flex flex-col gap-y-[8px] px-3 items-center md:hidden">

          {blogsToShowall.map((blog, index) => (
            <div
              key={index}
              className={`rounded-[12px] shadow-md md:max-w-[332px] w-full`}
            >
              <MobileBlogCard data={blog} />
            </div>
          ))}
          </div>

        {blogs.length > 4 && (
          <div className="md:flex justify-center hidden mt-5">
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

export default PaintingComponent;
