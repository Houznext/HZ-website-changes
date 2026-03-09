import React, { useState, useEffect, useRef } from "react";
import BreadCrumb from "../../BreadCrumb";
import Button from "@/common/Button";

import HomeDecorHeroSection, {
  HomeDecorHeroSectionprops,
} from "./HomeDecorHeroSection";
import HomeDecor, { HomeDecorprops } from "./HomeDecor";
import BestSellingItems, { IBestSellingItemsprops } from "./BestSellingItems";
import FAQSComp from "../Components/FAQSComp";
import BlogCard from "@/components/BlogCard";
import apiClient from "@/utils/apiClient";
import Furniture from "../FurnitureComponent/furnitures";
import { LuArrowLeft } from "react-icons/lu";
import { useRouter } from "next/router";
import MobileBlogCard from "@/components/MobileBlogCard";
import Loader from "@/components/Loader";
import GoogleAdSense from "@/components/GoogleAdSense";

export default function HomeDecorComponent() {
  const HomedecorHeroSectionData: HomeDecorHeroSectionprops = {
    bgimage:
      "/images/custombuilder/subservices/homedecor/decorherosection/homedecorherosection.png",
    heading: "Make your Walls Shine..",
    subheading: "Explore all Night Lamps, Wall Mirror & More",

    listimages: [
      {
        image:
          "/images/custombuilder/subservices/homedecor/decorherosection/homedecorimage1.png",
      },
      {
        image:
          "/images/custombuilder/subservices/homedecor/decorherosection/homedecorimage2.png",
      },
      {
        image:
          "/images/custombuilder/subservices/homedecor/decorherosection/homedecorimage3.png",
      },
    ],
  };
  const HomeDecorData: HomeDecorprops = {
    heading: "Home Decor",
    // path: "/services/custom-builder/homedecor/homedecor-shop",

    subheading:
      "Home Decor is the most important segment in setting the complete ambiance of your home. ",
    dataItems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/wallshelves.png",
        title: "Wall Shelves",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/potsandplants.png",
        title: "Pots & Plants",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/baskets.png",
        title: "Baskets",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/photoframes.png",
        title: "Photo Frames",
      },
      {
        id: 5,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/tableware.png",
        title: "Tableware",
      },
      {
        id: 6,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/wallmirrors.png",
        title: "Wall Mirrors",
      },
      {
        id: 7,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/wallpapersanddecals.png",
        title: "Wallpapers & Decals",
      },
      {
        id: 8,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/clocks.png",
        title: "Clocks",
      },
      {
        id: 9,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/hometemples.png",
        title: "Home Temples",
      },
      {
        id: 10,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/wallartsandpaintings.png",
        title: "Wall Art & Paintings",
      },
      {
        id: 11,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/Figurines.png",
        title: "Figurines",
      },
      {
        id: 12,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/ArtificialPlants Flowers.png",
        title: "Artificial Plants & Flowers",
      },
      {
        id: 13,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/keyholder.png",
        title: "Key Holder",
      },
      {
        id: 14,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/Gardening.png",
        title: "Gardening",
      },
      {
        id: 15,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/Trays.png",
        title: "Trays",
      },
      {
        id: 16,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/DecorGiftSets.png",
        title: "Decor Gift Sets",
      },
      {
        id: 17,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/Glassware.png",
        title: "Glassware",
      },
      {
        id: 18,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/FestiveDecor.png",
        title: "Festive Decor",
      },
      {
        id: 19,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/OutdoorDecor.png",
        title: "Outdoor Decor",
      },
      {
        id: 20,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/Vases.png",
        title: "Vases",
      },
      {
        id: 21,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/WallHanging.png",
        title: "Wall Hanging",
      },
      {
        id: 22,
        image:
          "/images/custombuilder/subservices/homedecor/homedecorsection/HomeFragrances.png",
        title: "Home Fragrances",
      },
    ],
  };

  const NewArrivalsData = {
    heading: "New Arrivals",
    subheading: "Shop Before They Sold out",
    listitems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/newarrivals/timelesstable.png",
        title: "Timeless Table Decor Set 3",
        price: "Starts only at ₹24,000/-",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/newarrivals/blackmetal.png",
        title: "Black Metal 3 Votive Tealight Holder",
        price: "Starts only at ₹14,000/-",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/newarrivals/goldsymphony.png",
        title: "Gold Symphony Console Table",
        price: "Starts only at ₹30,000/-",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/newarrivals/regalgold.png",
        title: "Regal Gold Iron Book End",
        price: "Starts only at ₹40,000/-",
      },
    ],
  };

  const HomeDecorItemsData = {
    heading: "Home Decor Items for Wall",
    subheading: "",
    listitems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/homedecoritems/wallart.png",
        title: "Wall Art",
        price: "UPTO 30% OFF",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/homedecoritems/wallpainting.png",
        title: "Wall Painting",
        price: "UPTO 38% OFF",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/homedecoritems/wallmirror.png",
        title: "Wall Mirror",
        price: "UPTO 59% OFF",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/homedecoritems/wallclock.png",
        title: "Wall Clock",
        price: "UPTO 70% OFF",
      },
    ],
  };

  const DiningDecorData = {
    heading: "Dining Decor",
    subheading: "",
    listitems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/dinnerdecor/servingtrays.png",
        title: "Serving Trays",
        price: "Starts only at ₹24,000/-",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/dinnerdecor/dinnerset.png",
        title: "Dinner Set",
        price: "Starts only at ₹14,000/-",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/dinnerdecor/coffeemugs.png",
        title: "Coffee Mugs",
        price: "Starts only at ₹30,000/-",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/dinnerdecor/teapots.png",
        title: "Teapots",
        price: "Starts only at ₹40,000/-",
      },
    ],
  };
  const TableDecorData = {
    heading: "Table Decor",
    subheading: "",
    listitems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/tabledecor/Figurines.png",
        title: "Figurines",
        price: "UPTO 30% OFF",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/tabledecor/Candles.png",
        title: "Candles",
        price: "UPTO 38% OFF",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/tabledecor/Miniatures.png",
        title: "Miniatures",
        price: "UPTO 59% OFF",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/tabledecor/Flowerpotvase.png",
        title: "Flower pot & vase",
        price: "UPTO 70% OFF",
      },
    ],
  };

  const OutDoorData = {
    heading: "Outdoor & Balcony Decor",
    subheading: "",
    listitems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/outdoor/PlantStand.png",
        title: "Plant Stand",
        price: "Starts only at ₹24,000/-",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/outdoor/ArtificialFlowers.png",
        title: "Artificial Flowers",
        price: "Starts only at ₹14,000/-",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/outdoor/HangingPlanters.png",
        title: "Hanging Planters",
        price: "Starts only at ₹30,000/-",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/homedecor/decorsection/outdoor/Fountains.png",
        title: "Fountains",
        price: "Starts only at ₹40,000/-",
      },
    ],
  };
  const BestSellingItemsData: IBestSellingItemsprops = {
    heading: "Best Selling Items Under Your Budget!",
    listItems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/homedecor/bestsellingitems/wallmirror.png",
        title: "Wall Mirror",
        subtitle: "From ₹199",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/homedecor/bestsellingitems/plantstand.png",
        title: "Plant Stand",
        subtitle: "From ₹199",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/homedecor/bestsellingitems/wallwoodenhanding.png",
        title: "Wall Wooden Handing",
        subtitle: "From ₹199",
      },
    ],
  };
  const FaqsData = [
    {
      question: "What services are included under Furniture?",
      answer:
        "Furniture services typically include custom furniture design, where pieces are tailored to fit specific spaces and styles. It also covers furniture assembly for items requiring setup, and refurbishing or repair to restore or update existing furniture. Additionally, services often offer space planning and consultation to ensure the furniture complements the room's layout and functionality.",
    },
    {
      question: "What services are included under Furniture?",
      answer:
        "Furniture services typically include custom furniture design, where pieces are tailored to fit specific spaces and styles. It also covers furniture assembly for items requiring setup, and refurbishing or repair to restore or update existing furniture. Additionally, services often offer space planning and consultation to ensure the furniture complements the room's layout and functionality.",
    },
    {
      question: "What services are included under Furniture?",
      answer:
        "Furniture services typically include custom furniture design, where pieces are tailored to fit specific spaces and styles. It also covers furniture assembly for items requiring setup, and refurbishing or repair to restore or update existing furniture. Additionally, services often offer space planning and consultation to ensure the furniture complements the room's layout and functionality.",
    },
    {
      question: "What services are included under Furniture?",
      answer:
        "Furniture services typically include custom furniture design, where pieces are tailored to fit specific spaces and styles. It also covers furniture assembly for items requiring setup, and refurbishing or repair to restore or update existing furniture. Additionally, services often offer space planning and consultation to ensure the furniture complements the room's layout and functionality.",
    },
    {
      question: "What services are included under Furniture?",
      answer:
        "Furniture services typically include custom furniture design, where pieces are tailored to fit specific spaces and styles. It also covers furniture assembly for items requiring setup, and refurbishing or repair to restore or update existing furniture. Additionally, services often offer space planning and consultation to ensure the furniture complements the room's layout and functionality.",
    },
  ];
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
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const blogsToShowall = showAll ? blogs : blogs.slice(0, 3);

  const handleshowall = () => {
    setShowAll(!showAll);
  };

  return (
    <>
      <div className="max-w-[1440px] min-h-[77px] bg-[#F0F0F0] mx-auto relative">
        <BreadCrumb
          steps={[
            { label: "Our Services", link: "/services/custom-builder" },
            { label: "Home Decor", link: "/services/homedecor" },
          ]}
          currentStep="Home Decor"
        />
        <Button
          className="flex items-center gap-x-[2px] bg-gradient-to-b from-[#4838FF66] via-[#0F02A263] to-[#4838FF66] absolute top-7 left-[47%] w-[91px] h-[37px] px-[12px] py-[6px]  shadow-custom backdrop-blur-[12px] "
          onClick={() => router.push("/")}
          style={{
            border: "0.5px solid",
            borderImageSource:
              "radial-gradient(72.56% 622.32% at 44.51% 52.68%, #F5F4FFCC 80%, #18134D 100%, #F5F4FFCC 100%)",
          }}
        >
          <span>
            <LuArrowLeft className="text-[#F5F4FF] w-[20px] h-[20px]" />
          </span>{" "}
          <span className="max-w-[43px] min-h-[19px] font-Roboto text-[#F5F4FF] text-[16px] text-center leading-[18.57px]">
            Home
          </span>
        </Button>
      </div>

      <div className="mb-[45px] md:mb-[64px]">
        <HomeDecorHeroSection {...HomedecorHeroSectionData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <HomeDecor {...HomeDecorData} />
      </div>

      <div className="mb-[45px] md:mb-[64px]">
        <Furniture
          {...NewArrivalsData}
          imagebgcolor="bg-[#ECF3FE]"
          bgColor="bg-transparent"
          borderColor="border-transparent"
        />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Furniture
          {...HomeDecorItemsData}
          imagebgcolor="bg-[#FFFFFF]"
          bgColor="bg-[#EBF3FE]"
          borderColor="border-[#DBDBDB]"
        />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">

        <GoogleAdSense />
      </div>

      <div className="mb-[45px] md:mb-[64px]">
        <BestSellingItems {...BestSellingItemsData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Furniture
          {...DiningDecorData}
          imagebgcolor="bg-[#ECF3FE]"
          bgColor="bg-transparent"
          borderColor="border-transparent"
        />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Furniture
          {...TableDecorData}
          bgColor="bg-[#EBF3FE]"
          imagebgcolor="bg-[#FFFFFF]"
          borderColor="border-[#DBDBDB]"
        />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Furniture
          {...OutDoorData}
          imagebgcolor="bg-[#ECF3FE]"
          bgColor="bg-transparent"
          borderColor="border-transparent"
        />
      </div>
      <div className="flex flex-col items-center gap-y-[20px]">
        <div className="md:flex flex-col justify-center items-center gap-4  hidden">
          <h1 className="text-black font-medium md:font-bold text-[24px] md:text-[25px]  text-start">
            Our Blog
          </h1>
          <h2 className="text-[#7B7C83] leading-[28.5px] text-[20px]">
            Latest Blog & Articles
          </h2>
        </div>
        <div className="max-w-[398px] min-h-[29px] flex items-center gap-x-[150px] md:hidden">
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
                {/*<div
                  key={index}
                  className={`rounded-[12px] shadow-md  flex flex-col gap-y-[8px] items-center md:hidden `}
                >
                  <MobileBlogCard data={blog} />
                </div>*/}
              </>
            ))
          ) : loading ? (
            <p><Loader /></p>
          ) : (
            <p className="text-[#000000] font-medium text-[20px] text-center">No blogs found.</p>
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
      <div className="mb-[45px] md:mb-[64px]">
        <FAQSComp
          image={
            "/images/custombuilder/subservices/homedecor/faqs/faqsimage.png"
          }
          faqs={FaqsData}
        />
      </div>
    </>
  );
}
