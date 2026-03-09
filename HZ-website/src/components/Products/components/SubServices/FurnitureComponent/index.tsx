import React, { useEffect, useState } from "react";
import WhyVisitUs, { IWHyVisitUsProps } from "./WhyVisitUs";
import ServiceHeroSection, { IServiceHeroSectionInterfaceProps } from "../Components/ServiceHeroSection";
import { IListSectionProps } from "../InteriorsComponent/ListSection";
import TiredOfMultipleOptions, {
  ITiredOfMultipleOptionsProps,
} from "../Components/TiredOfMultipleOptions";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import ServiceTabSection, {
  IServiceTabSectionProps,
} from "../Components/ServiceTabSection";
import GoogleAdSense from "@/components/GoogleAdSense";
import {
  Category, SofaSubCategory,
  BedSubCategory,
  ChairSubCategory,
  TableSubCategory,
  WardrobeSubCategory,
  StudyRoomSubCategory,
  DiningTableSubCategory,
  AnySubCategory,
} from "@/utils/projectData";


import BlogCard from "@/components/BlogCard";
import Button from "@/common/Button";
import apiClient from "@/utils/apiClient";
import CustomizeFurniture, {
  ICustomizeFurnituresDataprops,
} from "./customizefurniture";
import ExploreFurniture, { IFurnitureDataprops } from "./explorefurniture";
import BestPackage, { IBestPackageprops } from "./bestpackage";
import Furniture, { IFurnitureProps } from "./furnitures";
import MobileBlogCard from "@/components/MobileBlogCard";

const FurnitureHeroSectionData: IServiceHeroSectionInterfaceProps = {
  heading: "Live the lifestyle you have imagined",
  subHeading: "Handpicked rental furniture choices created just for you.",
  bgImageUrl:
    "/images/custombuilder/subservices/furnitures/furniture-hero-sec.png",
  bookingCtaUrl: { label: "Book for Consultation", url: "" },
  selectedId: {
    id: 4,
    service: "Furniture",
    label: "Furniture",
  },
};

const TiredOfMultipleOptionsData: ITiredOfMultipleOptionsProps = {
  heading: "Tired of multiple options available in market?",
  subHeading:
    "No more worries! Here at OneCasa, we provide all round services in every price range!!",
  listitems: [
    {
      description:
        "Collaboration is the process of two or more people or organizations working together to complete a task or achieve a goal.",
      iconUrl:
        "/icons/custom-builder/subservices/tiredofmultiple/collaboration.png",
      title: "Collaboration",
    },
    {
      description:
        "We believe in honesty, transparency, and ethical practices in every aspect of our work. Integrity is the our partners.",
      iconUrl:
        "/icons/custom-builder/subservices/tiredofmultiple/integrity.png",
      title: "Integrity",
    },
    {
      description:
        "As  clients we understand the importance of building long-term relationships with my customers. Integrity is the foundation.",
      iconUrl:
        "/icons/custom-builder/subservices/tiredofmultiple/customerservice.png",
      title: "Customer Services",
    },
    {
      description:
        "We have extensive experience for clients across various industries. relation with my customers. Integrity  with our partners.",
      iconUrl:
        "/icons/custom-builder/subservices/tiredofmultiple/expertise.png",
      title: "Expertise",
    },
  ],
};
const CustomizeFurnituresData: ICustomizeFurnituresDataprops = {
  image:
    "/icons/custom-builder/subservices/customizefurnitures/customizefurniture.png",
};
const furnituresData: IFurnitureDataprops = {
  heading: "Explore our wide range in our furniture",
  subheading:
    "Choose from the countless choices of rental furniture that are hand-picked to suit your home interiors.",
  dataitems: [
    {
      id: 1,
      image: "/icons/custom-builder/subservices/explorefurnitures/image.png",
      title: "Sofas",
      category: Category.Sofas,
    },
    {
      id: 2,
      image: "/icons/custom-builder/subservices/explorefurnitures/image1.png",
      title: "Beds",
      category: Category.Beds,
    },
    {
      id: 3,
      image: "/icons/custom-builder/subservices/explorefurnitures/image2.png",
      title: "Dining Tables",
      category: Category.DiningTables,

    },
    {
      id: 4,
      image: "/icons/custom-builder/subservices/explorefurnitures/image3.png",
      title: "Shoe Racks",
      category: Category.Storage,
    },
    {
      id: 5,
      image: "/icons/custom-builder/subservices/explorefurnitures/image4.png",
      title: "Sofa Cum Beds",
      category: Category.Sofas,
      subCategory: SofaSubCategory.SofaBed,
    },
    {
      id: 6,
      image: "/icons/custom-builder/subservices/explorefurnitures/image5.png",
      title: "Bed side Table",
      category: Category.Tables,
      subCategory: TableSubCategory.Side,
    },
    {
      id: 7,
      image: "/icons/custom-builder/subservices/explorefurnitures/image6.png",
      title: "Cabinets",
      category: Category.Storage,
    },
    {
      id: 8,
      image: "/icons/custom-builder/subservices/explorefurnitures/image7.png",
      title: "Chairs",
      category: Category.Chairs,
    },
    {
      id: 9,
      image: "/icons/custom-builder/subservices/explorefurnitures/image8.png",
      title: "Coffee Table",
      category: Category.Tables,
      subCategory: TableSubCategory.Coffee,
    },
    {
      id: 10,
      image: "/icons/custom-builder/subservices/explorefurnitures/image9.png",
      title: "TV Unit",
      category: Category.TVUnits,
    },
    {
      id: 11,
      image: "/icons/custom-builder/subservices/explorefurnitures/image10.png",
      title: "Dressing Table",
      category: Category.Tables,
    },
    {
      id: 12,
      image: "/icons/custom-builder/subservices/explorefurnitures/image11.png",
      title: "Storage Cabinets",
      category: Category.Storage,
    },
  ],
};

const BestpackageData: IBestPackageprops = {
  heading: "Best Selling Packages",
  listItems: [
    {
      id: 1,
      image: "/icons/custom-builder/subservices/bestpackages/sofas.png",
      title: "Sofas",
      price: "₹11,400/-",
      subtitle: "that’ll steal your heart",
      buttontitle: "Shop Now",
      textcolor: "text-[#FFFFFF]",
      backgroundcolor:
        "bg-[linear-gradient(258.23deg,#5192EF_100%,#3586FF_100%)]",
      buttontextcolor: " text-[#3E8AFB]",
      buttonbackgroundcolor: "bg-[#FFFFFF]",
      bordercolor: "border-[#FFFFFF]",
    },
    {
      id: 2,
      image: "/icons/custom-builder/subservices/bestpackages/beds.png",
      title: "Beds",
      price: "₹10,800/-",
      subtitle: "that dreams are made of",
      buttontitle: "Shop Now",
      textcolor: "text-[#212227]",
      backgroundcolor: "bg-[#ABCDFF]",
      buttontextcolor: "text-[#FFFFFF]",
      buttonbackgroundcolor: "bg-[#3E8AFB]",
      bordercolor: "border-[#3E8AFB]",
    },
  ],
};
const RoomFurnitureData = {
  heading: "Bed Room Furniture",
  subheading: "Explore beds online and find the one that's perfect for you",
  listitems: [
    {
      id: 1,
      image: "/icons/custom-builder/subservices/furnitures/singlebeds.png",
      title: "Single Beds",
      price: "Starts only at ₹15,000/-",
    },
    {
      id: 2,
      image: "/icons/custom-builder/subservices/furnitures/doublebeds.png",
      title: "Double Beds",
      price: "Starts only at ₹20,000/-",
    },
    {
      id: 3,
      image: "/icons/custom-builder/subservices/furnitures/posterbeds.png",
      title: "Poster Beds",
      price: "Starts only at ₹30,800/-",
    },
    {
      id: 4,
      image: "/icons/custom-builder/subservices/furnitures/modernbeds.png",
      title: "Modern Beds",
      price: "Starts only at ₹55,000/-",
    },
  ],
};
const DiningRoomFurnitureData = {
  heading: "Dining Room Furniture",
  subheading:
    "Explore Dining room in online and find the one that's perfect for you",
  listitems: [
    {
      id: 1,
      image: "/icons/custom-builder/subservices/furnitures/Diningtables.png",
      title: "Dining Tables",
      price: "Starts only at ₹24,000/-",
    },
    {
      id: 2,
      image: "/icons/custom-builder/subservices/furnitures/Diningchairs.png",
      title: "Dining Chairs",
      price: "Starts only at ₹14,000/-",
    },
    {
      id: 3,
      image: "/icons/custom-builder/subservices/furnitures/4seaterdining.png",
      title: "4 Seater Dining",
      price: "Starts only at ₹30,000/-",
    },
    {
      id: 4,
      image: "/icons/custom-builder/subservices/furnitures/6seaterdinig.png",
      title: "6 Seater Dining",
      price: "Starts only at ₹40,000/-",
    },
  ],
};
const SofaFurnitureData = {
  heading: "Sofas Furniture",
  subheading: "Explore beds online and find the one that's perfect for you",
  listitems: [
    {
      id: 1,
      image: "/icons/custom-builder/subservices/furnitures/sofaset.png",
      title: "Sofa Set",
      price: "Starts only at ₹28,000/-",
    },
    {
      id: 2,
      image: "/icons/custom-builder/subservices/furnitures/sofacumbed.png",
      title: "Sofa Cum Bed",
      price: "Starts only at ₹34,500/-",
    },
    {
      id: 3,
      image: "/icons/custom-builder/subservices/furnitures/fabricsofa.png",
      title: "Fabric Sofa",
      price: "Starts only at ₹44,800/-",
    },
    {
      id: 4,
      image: "/icons/custom-builder/subservices/furnitures/cornersofa.png",
      title: "Corner Sofa",
      price: "Starts only at ₹89,800/-",
    },
  ],
};

const TabsSectionData: IServiceTabSectionProps = {
  heading: "Design Ideas For Every Space",
  subHeading: "Every corner holder a unique design potential",
  tabs: [
    {
      buttonLabel: "Bed Room",
      tabKey: "bedRoom",
    },
    {
      buttonLabel: "Living Room",
      tabKey: "livingRoom",
    },
    {
      buttonLabel: "Dining Room",
      tabKey: "diningRoom",
    },
    {
      buttonLabel: "Study Room",
      tabKey: "studyRoom",
    },
    {
      buttonLabel: "Storage Cabinets",
      tabKey: "StorageCabinets",
    },
    {
      buttonLabel: "Office Furniture",
      tabKey: "officeFurniture",
    },
  ],
  tabPanels: [
    {
      list: [
        {
          imageUrl: "/images/custombuilder/subservices/bed-sofa.png",
          label: "Bed Sofa",
        },
        {
          imageUrl: "/images/custombuilder/subservices/bed.png",
          label: "Bed",
        },
        {
          imageUrl: "/images/custombuilder/subservices/wardrobes.png",
          label: "Wardrobes",
        },
        {
          imageUrl: "/images/custombuilder/subservices/chair.png",
          label: "Chair",
        },
      ],
      tabKey: "bedRoom",
    },

    {
      list: [
        {
          imageUrl: "/images/custombuilder/subservices/bed-sofa.png",
          label: "Bed Sofa",
        },
        {
          imageUrl: "/images/custombuilder/subservices/bed.png",
          label: "Bed",
        },
        {
          imageUrl: "/images/custombuilder/subservices/wardrobes.png",
          label: "Wardrobes",
        },
        {
          imageUrl: "/images/custombuilder/subservices/chair.png",
          label: "Chair",
        },
      ],
      tabKey: "livingRoom",
    },
    {
      list: [
        {
          imageUrl: "/images/custombuilder/subservices/bed-sofa.png",
          label: "Bed Sofa",
        },
        {
          imageUrl: "/images/custombuilder/subservices/bed.png",
          label: "Bed",
        },
        {
          imageUrl: "/images/custombuilder/subservices/wardrobes.png",
          label: "Wardrobes",
        },
        {
          imageUrl: "/images/custombuilder/subservices/chair.png",
          label: "Chair",
        },
      ],
      tabKey: "diningRoom",
    },
    {
      list: [
        {
          imageUrl: "/images/custombuilder/subservices/bed-sofa.png",
          label: "Bed Sofa",
        },
        {
          imageUrl: "/images/custombuilder/subservices/bed.png",
          label: "Bed",
        },
        {
          imageUrl: "/images/custombuilder/subservices/wardrobes.png",
          label: "Wardrobes",
        },
        {
          imageUrl: "/images/custombuilder/subservices/chair.png",
          label: "Chair",
        },
      ],
      tabKey: "studyRoom",
    },
    {
      list: [
        {
          imageUrl: "/images/custombuilder/subservices/bed-sofa.png",
          label: "Bed Sofa",
        },
        {
          imageUrl: "/images/custombuilder/subservices/bed.png",
          label: "Bed",
        },
        {
          imageUrl: "/images/custombuilder/subservices/wardrobes.png",
          label: "Wardrobes",
        },
        {
          imageUrl: "/images/custombuilder/subservices/chair.png",
          label: "Chair",
        },
      ],
      tabKey: "StorageCabinets",
    },
    {
      list: [
        {
          imageUrl: "/images/custombuilder/subservices/bed-sofa.png",
          label: "Bed Sofa",
        },
        {
          imageUrl: "/images/custombuilder/subservices/bed.png",
          label: "Bed",
        },
        {
          imageUrl: "/images/custombuilder/subservices/wardrobes.png",
          label: "Wardrobes",
        },
        {
          imageUrl: "/images/custombuilder/subservices/chair.png",
          label: "Chair",
        },
      ],
      tabKey: "officeFurniture",
    },
  ],
};

const whyVisitUs: IWHyVisitUsProps = {
  points: [
    {
      heading: "One Shop",
      description: "For Your Dream Home",
      imageUrl: "/images/custombuilder/subservices/furnitures/one-shop.png",
    },
    {
      heading: "Free Home Visits",
      description: "For Your Comfort",
      imageUrl:
        "/images/custombuilder/subservices/furnitures/free-home-visits.png",
    },
    {
      heading: "Touch & Feel",
      description: "Choose What’s Right For You",
      imageUrl:
        "/images/custombuilder/subservices/furnitures/touch-and-feel.png",
    },
    {
      heading: "Free Consultation",
      description: "From Interior Design Experts",
      imageUrl:
        "/images/custombuilder/subservices/furnitures/free-consultation.png",
    },
  ],
};

const testimonialsData: ITestimonialsSectionProps = {
  words: [
    {
      name: "Nisha",
      desc: "The quality of the furniture is exceptional, with a perfect blend of style and comfort. It has completely transformed my living space!",
      rating: 5,
    },
    {
      name: "Trisha",
      desc: "The craftsmanship is top-notch, and the designs are modern yet timeless. Every piece adds a unique touch to my home.",
      rating: 5,
    },
    {
      name: "Charan",
      desc: "I am impressed by the durability and finish of the furniture. It not only looks great but also feels sturdy and well-made.",
      rating: 5,
    },
    {
      name: "Bhargav",
      desc: "The furniture exceeded my expectations in both quality and design. It has become a focal point in my living room.",
      rating: 5,
    },
  ],
};

function FurnitureComponent() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const fetchBlogs = async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.blogs, {
        blogType: "Furniture",
      });

      setBlogs(res?.body.blogs);
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
    <div className="w-full">
      <div className="mb-[45px] max-w-[90%] mx-auto md:mb-[64px] ">
        <ServiceHeroSection />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]">
        <ExploreFurniture {...furnituresData} />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]  md:mt-[0px]">
        <CustomizeFurniture {...CustomizeFurnituresData} />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]">
        <BestPackage {...BestpackageData} />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]">
        <Furniture
          {...RoomFurnitureData}
          bgColor="bg-[#EBF3FE]"
          imagebgcolor="bg-[#FFFFFF]"
          borderColor="border-[#DBDBDB]"
        />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]">
        <Furniture
          {...DiningRoomFurnitureData}
          imagebgcolor="bg-[#ECF3FE]"
          bgColor="bg-[#FFFFFF]"
          borderColor="border-[#B7D9FF]"
        />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]">
        <Furniture
          {...SofaFurnitureData}
          bgColor="bg-[#EBF3FE]"
          imagebgcolor="bg-[#FFFFFF]"
          borderColor="border-[#F0E0FF]"
        />
      </div>
      <div className="px-5 mb-[45px] md:mt-[0px] md:mb-[64px] mt-[390px] md:block hidden">
        <TiredOfMultipleOptions {...TiredOfMultipleOptionsData} />
      </div>
      <div className="px-5 mx-auto w-full  mb-[45px] md:mb-[64px]">
        <ServiceTabSection {...TabsSectionData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">

        <GoogleAdSense />
      </div>

      <div className="px-5 mb-[45px] w-full mx-auto md:mb-[64px]">
        <WhyVisitUs {...whyVisitUs} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <TestimonialsSection {...testimonialsData} />
      </div>
      <div className="flex flex-col items-center  mb-[45px] md:mb-[64px]">
        <div className="md:flex flex-col justify-center items-center gap-4  hidden">
          <h1 className="text-black font-medium md:font-bold text-[24px] md:text-[25px]  text-start">
            Our Blog
          </h1>
          <h2 className="text-[#7B7C83] leading-[28.5px] label-text">
            Latest Blog & Articles
          </h2>
        </div>
        <div className="max-w-[398px] min-h-[29px] flex items-center gap-x-[151px] md:hidden px-5">
          <div className="max-w-[109px] min-h-[29px] ">
            <h1 className="text-[#000000] font-medium text-[20px] text-nowrap leading-[28.5px]">
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
}

export default FurnitureComponent;
