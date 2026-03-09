import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import BlogCard from "@/components/BlogCard";
import MobileBlogCard from "@/components/MobileBlogCard";
import apiClient from "@/utils/apiClient";
import Button from "@/common/Button";
import HomeDecor, {
  HomeDecorprops,
} from "../SubServices/HomeDecorComponent/HomeDecor";
import Furnitures from "../SubServices/FurnitureComponent/furnitures";
import BestSellingItems, {
  IBestSellingItemsprops,
} from "../SubServices/HomeDecorComponent/BestSellingItems";
import TopBrands, { ITopBrandsprops } from "./TopBrands";
import FAQSComp from "../SubServices/Components/FAQSComp";
import { LuArrowLeft } from "react-icons/lu";
import BreadCrumb from "../BreadCrumb";
import ElectronicHeroSection, {
  IElectronicHeroSectionProps,
} from "./ElectronicHeroSection";
import GoogleAdSense from "@/components/GoogleAdSense";
import LaunchedSoon from '@/components/LaunchedSoon'

export default function ElectronicsComponent() {
  const ElectronicHeroSectionData: IElectronicHeroSectionProps = {
    bgimage:
      "/images/custombuilder/subservices/electronics/electronicherosection/electronicsherosectionbgimage.png",
    listitems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/electronics/electronicherosection/herosectionimage1.png",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/electronics/electronicherosection/herosectionimage2.png",
      },
    ],
  };
  const categoriesData: HomeDecorprops = {
    heading: "Categories",
    // path: "/services/custom-builder/electronics/electronics-shop",

    subheading: "Shop by Category",
    dataItems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/electronics/categories/kitchenappliances.png",
        title: "Kitchen appliances",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/electronics/categories/professionallighting.png",
        title: "Professional Lighting",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/electronics/categories/cablesandcharges.png",
        title: "Cables & chargers",
      },
      {
        id: 4,
        image:
          "/images/custombuilder/subservices/electronics/categories/tv.png",
        title: "TV",
      },
      {
        id: 5,
        image:
          "/images/custombuilder/subservices/electronics/categories/mobileandtablet.png",
        title: "Mobile & tablet accessories",
      },
      {
        id: 6,
        image:
          "/images/custombuilder/subservices/electronics/categories/fans.png",
        title: "Fans",
      },
      {
        id: 7,
        image:
          "/images/custombuilder/subservices/electronics/categories/waterheater.png",
        title: "Water Heater",
      },
      {
        id: 8,
        image:
          "/images/custombuilder/subservices/electronics/categories/switchgear.png",
        title: "Switch Gear",
      },
      {
        id: 9,
        image:
          "/images/custombuilder/subservices/electronics/categories/relay.png",
        title: "Relay",
      },
      {
        id: 10,
        image:
          "/images/custombuilder/subservices/electronics/categories/aircoolers.png",
        title: "Air Coolers",
      },
      {
        id: 11,
        image:
          "/images/custombuilder/subservices/electronics/categories/meter.png",
        title: "Meter",
      },
      {
        id: 12,
        image:
          "/images/custombuilder/subservices/electronics/categories/pcandlaptop.png",
        title: "PC & Laptop Peripherals",
      },
    ],
  };
  const SellersData = {
    heading: "Sellers",
    subheading: "Best Sellers",
    listitems: [
      {
        id: 1,
        title: "Belkin 65W 3.1 A Multiport Mobile Gan Charger",
        price: "Starts only at ₹24,000/-",
        image:
          "/images/custombuilder/subservices/electronics/sellers/mobilegancharger.png",
      },
      {
        id: 2,
        title: "Logitech G413 Mechanical Backlit Gaming Keyboard",
        price: "Starts only at ₹14,000/-",
        image:
          "/images/custombuilder/subservices/electronics/sellers/gamingkeyboard.png",
      },
      {
        id: 3,
        title: "HP LaserJet Pro MFP 4104fdw Printer",
        price: "Starts only at ₹30,000/-",
        image:
          "/images/custombuilder/subservices/electronics/sellers/printer.png",
      },
      {
        id: 4,
        title: "Epson EcoTank L3250 A4 Wi-Fi All-in-One Ink Tank Printer",
        price: "Starts only at ₹40,000/-",
        image:
          "/images/custombuilder/subservices/electronics/sellers/tankprinter.png",
      },
    ],
  };
  const BestSellingItemsData: IBestSellingItemsprops = {
    heading: "Best Selling Items Under Your Budget!",
    listItems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/electronics/bestsellingitems/printers.png",
        title: "Best Selling Printers",
        subtitle: "From ₹199",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/electronics/bestsellingitems/routers.png",
        title: "Best Selling Routers",
        subtitle: "From ₹199",
      },
      {
        id: 3,
        image:
          "/images/custombuilder/subservices/electronics/bestsellingitems/savingback.png",
        title: "Power Saving Back",
        subtitle: "From ₹199",
      },
    ],
  };
  const TopBrandsData: ITopBrandsprops = {
    heading: "Top Brands",
    listItems: [
      {
        id: 1,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/belkin.png",
      },
      {
        id: 2,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/jbl.png",
      },

      {
        id: 3,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/netgear.png",
      },

      {
        id: 4,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/dlink.png",
      },

      {
        id: 5,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/sony.png",
      },

      {
        id: 6,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/philips.png",
      },

      {
        id: 7,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/ahuja.png",
      },

      {
        id: 8,
        image:
          "/images/custombuilder/subservices/electronics/topbrands/vguard.png",
      },
    ],
  };
  const NewArrivalsData = {
    heading: "New Arrivals",
    subheading: "",
    listitems: [
      {
        id: 1,
        title: "VGuard VTI 5150 Stabilizer",
        price: "Starts only at ₹24,000/-",
        image:
          "/images/custombuilder/subservices/electronics/newarrivals/stabilizer.png",
      },
      {
        id: 2,
        title: "Wireless Portable Bluetooth Boom Box ",
        price: "Starts only at ₹14,000/-",
        image:
          "/images/custombuilder/subservices/electronics/newarrivals/bluetooth.png",
      },
      {
        id: 3,
        title: "Soundcore by Anker Pyro Mini portable 6W bluetooth speaker ",
        price: "Starts only at ₹30,000/-",
        image:
          "/images/custombuilder/subservices/electronics/newarrivals/bluetoothspeaker.png",
      },
      {
        id: 4,
        title: "Live Tech PS14 Power Strip with 4 Power Socket ",
        price: "Starts only at ₹40,000/-",
        image:
          "/images/custombuilder/subservices/electronics/newarrivals/powersocket.png",
      },
    ],
  };
  const PopularProductsData = {
    heading: "Popular Products",
    subheading: "",
    listitems: [
      {
        id: 1,
        title: "Philips Heavy Weight Dry Iron GC 181 1000W",
        price: "UPTO 30% OFF",
        image:
          "/images/custombuilder/subservices/electronics/popularproducts/iron.png",
      },
      {
        id: 2,
        title: "Belkin AC Anywhere™ Car Power Inverter with USB charging.",
        price: "UPTO 38% OFF",
        image:
          "/images/custombuilder/subservices/electronics/popularproducts/carpowerinverter.png",
      },
      {
        id: 3,
        title: "Venus Splash 15L Water Heater",
        price: "UPTO 59% OFF",
        image:
          "/images/custombuilder/subservices/electronics/popularproducts/waterheater.png",
      },
      {
        id: 4,
        title: "JBL Tune 230 NC Active Noise Cancelling Earbuds ",
        price: "UPTO 70% OFF",
        image:
          "/images/custombuilder/subservices/electronics/popularproducts/earbuds.png",
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
            { label: "Home", link: "/" },
            {
              label: "Electronic",
              link: "/services/electronics",
            },
          ]}
          currentStep="Electronic"
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
        <ElectronicHeroSection {...ElectronicHeroSectionData} />
      </div>

      <div className="mb-[45px] md:mb-[0px]">
        <HomeDecor {...categoriesData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Furnitures
          {...SellersData}
          imagebgcolor="bg-[#ECF3FE]"
          bgColor="bg-transparent"
          borderColor="border-transparent"
        />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <BestSellingItems {...BestSellingItemsData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <TopBrands {...TopBrandsData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">

        <GoogleAdSense />
      </div>

      <div className="mb-[45px] md:mb-[64px]">
        <Furnitures
          {...NewArrivalsData}
          imagebgcolor="bg-[#ECF3FE]"
          bgColor="bg-transparent"
          borderColor="border-transparent"
        />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Furnitures
          {...PopularProductsData}
          imagebgcolor="bg-[#FFFFFF]"
          bgColor="bg-[#EBF3FE]"
          borderColor="border-[#E4E4E4]"
        />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <LaunchedSoon serviceName="Electronics" />
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
