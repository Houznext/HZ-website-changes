import React, { useEffect, useState } from "react";
import BreadCrumb from "../../BreadCrumb";
import ServiceHeroSection, {
  IServiceHeroSectionInterfaceProps,
} from "../Components/ServiceHeroSection";
import ServiceProcess, {
  ServiceProcessProps,
  StepProps,
} from "../Components/ServiceProcess";
import ChooseUs from "../Components/ChooseUs";
import OurPartners from "../Components/OurPartners";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import OurServices, {
  OurServiceProps,
  ServiceCardProps,
} from "../Components/OurServices";
import FAQSComp from "../Components/FAQSComp";
import apiClient from "@/utils/apiClient";
import GoogleAdSense from "@/components/GoogleAdSense";
import BlogCard from "@/components/BlogCard";
import Button from "@/common/Button";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import MobileBlogCard from "@/components/MobileBlogCard";
import BookNowSection, { BookNowProps } from "./BookNowSection";
import ChooseServices, { ChooseServicesProps } from "./ChooseServices";
import ServicesSection, { ServicesSectionProps } from "./ServicesSection";
import PlumbingHeroSection, { HeroSectionProps } from "./PlumbingHeroSection";

const faqs = [
  {
    question: "What plumbing services do you offer?",
    answer:
      "We provide a wide range of plumbing services, including pipe repairs, drain cleaning, leak detection, water heater installation and repair, and more. Whether it’s routine maintenance or emergency repairs, our team is equipped to handle it all.",
  },
  {
    question: "How do I know if I need leak detection services?",
    answer:
      "If you notice unexplained water stains, damp spots, or an unusually high water bill, you may have a hidden leak. Our leak detection service uses advanced tools to locate and fix leaks without causing unnecessary damage to your property.",
  },
  {
    question: "Can you handle emergency plumbing repairs?",
    answer:
      "Yes, we offer 24/7 emergency plumbing repair services. Whether it’s a burst pipe, severe drain blockage, or a water heater malfunction, our team is ready to respond quickly and efficiently to resolve the issue.",
  },
  {
    question: "How often should I get my plumbing system inspected?",
    answer:
      "We recommend having your plumbing system inspected at least once a year to ensure everything is functioning properly. Regular inspections can help identify potential issues early and prevent costly repairs down the line.",
  },
  {
    question: "Do you offer water heater installation services?",
    answer:
      "Yes, we specialize in water heater installation and repair. Whether you need a new unit installed or your existing system repaired, our technicians are trained to handle a variety of water heater types and models.",
  },
];

const PlumbingHeroSectionData: HeroSectionProps = {
  heading: "Book reliable professionals for your home",
  bgimage: "/images/custombuilder/subservices/plumbing/herosection.png",
  formdata: [
    {
      id: 1,
      label: "",
      placeholder: "Select your location",
      type: "text",
      icon: <FaMapMarkerAlt className="text-[20px] text-[#FFFFFF]" />,
    },
    {
      id: 2,
      label: "",
      placeholder: "What services do you need?",
      type: "text",
      icon: <FaSearch className="text-[20px] text-[#FFFFFF]" />,
    },
  ],
};
const BookNowData: BookNowProps = {
  listItems: [
    {
      id: 1,
      name: "Home Repairs",
      description: "Electricians, plumbers, Carpenters",
      image:
        "/images/custombuilder/subservices/plumbing/booknow/homerepairs.png",
    },
    {
      id: 2,
      name: "AC Services",
      description: "Save on electricity bills with power",
      image:
        "/images/custombuilder/subservices/plumbing/booknow/Acservices.png",
    },
    {
      id: 3,
      name: "Need For Electrician",
      description: "Electric Service at your doorstep",
      image:
        "/images/custombuilder/subservices/plumbing/booknow/electrician.png",
    },
  ],
};
const ChooseServicesData: ChooseServicesProps = {
  heading: "Choose your Plumbing Services",
  listItems: [
    {
      id: 1,
      title: "Mostly Booked",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/mostlybooked.png",
    },
    {
      id: 2,
      title: "Basin & sink",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/basinsink.png",
    },
    {
      id: 3,
      title: "Bath filling",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/bathfilling.png",
    },
    {
      id: 4,
      title: "Drainage pipes",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/drainagepipes.png",
    },
    {
      id: 5,
      title: "Toilet",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/toilet.png",
    },
    {
      id: 6,
      title: "Tap & mixer",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/tapmixer.png",
    },
    {
      id: 7,
      title: "Water tank",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/watertank.png",
    },
    {
      id: 8,
      title: "Motor",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/motor.png",
    },
    {
      id: 9,
      title: "Submeter",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/submeter.png",
    },
    {
      id: 10,
      title: "Water filter",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/waterfilter.png",
    },
    {
      id: 11,
      title: "Appliance",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/appliance.png",
    },
    {
      id: 12,
      title: "Ceiling lightWall",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/ceilinglightwall.png",
    },
    {
      id: 13,
      title: "Switch & socket",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/switchsocket.png",
    },
    {
      id: 14,
      title: "Inverter & stabiliser",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/inverterstabiliser.png",
    },
    {
      id: 15,
      title: "Water pipe connection",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/waterpipeconnection.png",
    },
    {
      id: 16,
      title: "Festive Lights Decoration",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/festivelightsdecoration.png",
    },
    {
      id: 17,
      title: "Fan/AC Repair & Installation",
      image:
        "/images/custombuilder/subservices/plumbing/chooseservices/fanacinstallation.png",
    },
  ],
};
const ServicesSectionData: ServicesSectionProps = {
  sections: [
    {
      heading: "Mostly Booked",
      btntext: "More details",
      btn1: "Add to cart",
      btn2: "Book now",
      listitems: [
        {
          id: 1,
          heading: "Tap Repair",
          time: "30 mins",
          price: " ₹200.00",
          cancelprice: "₹300.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/toprepair.png",
        },
        {
          id: 2,
          heading: "Inverter installation",
          time: "30 mins",
          price: "₹500.00",
          cancelprice: "₹900.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/Inverterinstallation.png",
        },
      ],
    },
    {
      heading: "Basin & Sink",
      btntext: "More details",
      btn1: "Add to cart",
      btn2: "Book now",
      listitems: [
        {
          id: 1,
          heading: "Wash Basin",
          time: "30 mins",
          price: "₹200.00",
          cancelprice: "₹300.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/WashBasin.png",
        },
        {
          id: 2,
          heading: "Waste Pipe",
          time: "30 mins",
          price: "₹500.00",
          cancelprice: "₹900.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/WastePipe.png",
        },
        {
          id: 3,
          heading: "Wash Basin Blockage Removal",
          time: "30 mins",
          price: "₹500.00",
          cancelprice: "₹900.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/WashBasinBlockag Removal.png",
        },
      ],
    },
    {
      heading: "Bath filling",
      btntext: "More details",
      btn1: "Add to cart",
      btn2: "Book now",
      listitems: [
        {
          id: 1,
          heading: "Shower Wall Mounted",
          time: "30 mins",
          price: "₹200.00",
          cancelprice: "₹300.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/ShowerWallMounted.png",
        },
        {
          id: 2,
          heading: "Shower Ceiling Mounted",
          time: "30 mins",
          price: "₹500.00",
          cancelprice: "₹900.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/ShowerCeilingMounted.png",
        },
      ],
    },
    {
      heading: "Drainage pipes",
      btntext: "More details",
      btn1: "Add to cart",
      btn2: "Book now",
      listitems: [
        {
          id: 1,
          heading: "Drain cover installation",
          time: "30 mins",
          price: "₹200.00",
          cancelprice: "₹300.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/Draincoverinstallation.png",
        },
        {
          id: 2,
          heading: "Balcony drain blockage removal",
          time: "30 mins",
          price: "₹500.00",
          cancelprice: "₹900.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/Balconydrainblockageremoval.png",
        },
        {
          id: 3,
          heading: "Drainage pipe blockage removal",
          time: "30 mins",
          price: "₹200.00",
          cancelprice: "₹300.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/Drainagepipeblockageremoval.png",
        },
      ],
    },
    {
      heading: "Toilet",
      btntext: "More details",
      btn1: "Add to cart",
      btn2: "Book now",
      listitems: [
        {
          id: 1,
          heading: "Flush tank repair",
          time: "30 mins",
          price: "₹200.00",
          cancelprice: "₹300.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/Flushtankrepair.png",
        },
        {
          id: 2,
          heading: "Indian toilet installation",
          time: "30 mins",
          price: "₹500.00",
          cancelprice: "₹900.00",
          rating: "4.5",
          save: "₹100.00",
          image:
            "/images/custombuilder/subservices/plumbing/servicessection/Indiantoiletinstallation.png",
        },
      ],
    },
  ],
  cartsection: [
    {
      image:
        "/images/custombuilder/subservices/plumbing/servicessection/CartSection.png",
      text: "Add items in your cart",
      dataItems: [
        {
          id: 1,
          icon: "/images/custombuilder/subservices/plumbing/servicessection/offericon.png",
          title: "Get Visitation fee off",
          description: "On order above ₹200",
        },
        {
          id: 2,
          icon: "/images/custombuilder/subservices/plumbing/servicessection/offericon.png",
          title: "Amazon Cashback upto",
          description: "On order above ₹500",
        },
        {
          id: 3,
          icon: "/images/custombuilder/subservices/plumbing/servicessection/offericon.png",
          title: "CRED Cashback upto",
          description: "On order above ₹500",
        },
      ],
    },
  ],
};

const PlumbingComponent = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const fetchBlogs = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: "Plumbing",
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
      <div className="bg-[#F0F0F0]">
        <BreadCrumb
          steps={[
            { label: "Our Services", link: "/services/custom-builder" },
            { label: "Plumbing", link: "/services/plumbing" },
          ]}
          currentStep="Plumbing"
        />
      </div>

      <div className="mb-[45px] md:mb-[64px] ">
        <PlumbingHeroSection {...PlumbingHeroSectionData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] ">
        <BookNowSection {...BookNowData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <h1 className="font-bold md:text-[24px] text-[18px] ">
          Recommended for You
        </h1>
        <GoogleAdSense />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <ChooseServices {...ChooseServicesData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <ServicesSection {...ServicesSectionData} />
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

export default PlumbingComponent;
