import React, { useEffect, useState } from "react";
import Image from "next/image";
import ServiceHeroSection, {
  IServiceHeroSectionInterfaceProps,
} from "../../SubServices/ServiceHeroSection";
import TiredOfMultipleOptions, {
  ITiredOfMultipleOptionsProps,
} from "../Components/TiredOfMultipleOptions";
import ServiceTabSection, {
  IServiceTabSectionProps,
} from "../Components/ServiceTabSection";
import ListSection, { IListSectionProps } from "./ListSection";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Components/TestimonialsSection";
import Packages from "./Packages";
import WorkFlow from "./WorkFlow";
import BreadCrumb from "../../BreadCrumb";
import { FaCalculator } from "react-icons/fa";
import { useRouter } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import Button from "@/common/Button";
import MobileBlogCard from "@/components/MobileBlogCard";
import {
  InteriorStore,
  useStrapiInteriorStore,
} from "@/store/strapiInteriorsData";
import InteriorsCostEstimation from "./InteriorsCostEstimation";
import GoogleAdSense from "@/components/GoogleAdSense";
import {
  DesignIdeas,
  wayWeWork,
  Testimonials,
  listItems,
} from "@/utils/interiorshelper";
import { InteriorCalc } from "./InteriorsCard";
import Partners from "@/components/SolarPage/Partners";
import Link from "next/link";

const InteriorsComponent = ({
  blogs,
  interiorsStrapiData: initialStrapiData,
}: {
  blogs: any[];
  interiorsStrapiData: InteriorStore["interiorsStrapiData"];
}) => {
  const [showAll, setShowAll] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const router = useRouter();

  const {
    interiorsStrapiData,
    setInteriorsData,
    fetchInteriorsData,
    loading,
    error,
  } = useStrapiInteriorStore();


  useEffect(() => {
    if (!initialStrapiData?.heroCardPrices) {
      fetchInteriorsData();
    } else {
      setInteriorsData(initialStrapiData);
    }
  }, [initialStrapiData]);


  const blogsToShow = showMore ? blogs : blogs.slice(0, 4);

  const blogsToShowall = showAll ? blogs : blogs.slice(0, 3);

  const handleshowall = () => {
    setShowAll(!showAll);
  };

  const formatStrapiData = {
    heroSectionData: {
      heading:
        interiorsStrapiData?.heroCardPrices?.[0]?.HeroSection?.heading ?? "",
      subHeading:
        interiorsStrapiData?.heroCardPrices?.[0]?.HeroSection?.subHeading ?? "",
      bgImageUrl:
        interiorsStrapiData?.heroCardPrices?.[0]?.HeroSection?.bgImageUrl
          ?.url ?? "",
      bookingCtaUrl: interiorsStrapiData?.heroCardPrices?.[0]?.HeroSection
        ?.bookingCtaUrl ?? {
        label: "",
        url: "",
      },
      locationcta: interiorsStrapiData?.heroCardPrices?.[0]?.HeroSection
        ?.locationCtaUrl ?? [{ label: "", url: "" }],
    },
    cardSectionData: {
      heading:
        interiorsStrapiData?.heroCardPrices?.[0]?.CardSection?.mainHeading ??
        "",
      subHeading:
        interiorsStrapiData?.heroCardPrices?.[0]?.CardSection?.subHeading ?? "",
      listItems: interiorsStrapiData?.heroCardPrices?.[0]?.CardSection
        ?.listItems
        ? Object.values(
          interiorsStrapiData.heroCardPrices?.[0]?.CardSection.listItems
        ).map((item: any) => ({
          description: item.description,
          title: item.title,
          iconUrl: item.iconUrl?.url ?? "",
        }))
        : [],
    },
  };
  const interiorDesigns = {
    heading: listItems?.heading ?? "",
    subHeading: listItems?.subHeading ?? "",
    list: [
      {
        imageUrl: listItems?.Kitchen?.mainImageUrl?.url ?? "",
        label: "Kitchen",
      },
      {
        imageUrl: listItems?.LivingRoom?.mainImageUrl?.url ?? "",
        label: "Living Room",
      },
      {
        imageUrl: listItems?.Bedroom?.mainImageUrl?.url ?? "",
        label: "Bedrooms",
      },
      {
        imageUrl: listItems?.DiningRoom?.mainImageUrl?.url ?? "",
        label: "Dining Room",
      },
      {
        imageUrl: listItems?.Balconies?.mainImageUrl?.url ?? "",
        label: "Balconies",
      },
      {
        imageUrl: listItems?.Bathroom?.mainImageUrl?.url ?? "",
        label: "Bathrooms",
      },
      {
        imageUrl: listItems?.Home?.mainImageUrl?.url ?? "",
        label: "Home",
      },
      {
        imageUrl: listItems?.PoojaRoom?.mainImageUrl?.url ?? "",
        label: "Pooja Room",
      },
      {
        imageUrl: listItems?.StudyRoom?.mainImageUrl?.url ?? "",
        label: "Study Room",
      },
      {
        imageUrl: listItems?.Tiles?.mainImageUrl?.url ?? "",
        label: "Tiles",
      },
      {
        imageUrl: listItems?.TvUnit?.mainImageUrl?.url ?? "",
        label: "TV Unit",
      },
      {
        imageUrl: listItems?.Wardrobe?.mainImageUrl?.url ?? "",
        label: "Wardrobe",
      },
    ],
  };
  const TestimonialsData = {
    words:
      Testimonials?.testimonial.map((testimonial: any) => ({
        name: testimonial?.name ?? "",
        desc: testimonial?.message ?? "",
        rating: testimonial?.rating ?? 5, // Default rating to 5 if not available
      })) ?? [],
  };

  const testimonialsData: ITestimonialsSectionProps = {
    words: TestimonialsData?.words,
  };
  const wayWeWorkData = {
    heading: wayWeWork?.heading ?? "",
    subHeading: wayWeWork?.subHeading,
    list: Object.values(wayWeWork?.steps ?? {})
      .flat()
      .map((step: any) => ({
        label: step?.stepTitle ?? "",
        imageUrl: step?.imageUrl?.url ?? "",
      }))
      .slice(1),
  };

  const theWayWeWorkData: IListSectionProps = {
    heading: wayWeWorkData?.heading,
    subHeading: wayWeWorkData?.subHeading,
    list: wayWeWorkData?.list,
  };

  const interiorDesign: IListSectionProps = {
    heading: interiorDesigns.heading,
    subHeading: interiorDesigns.subHeading,
    list: interiorDesigns.list,
  };

  const InteriorsHeroSectionData: IServiceHeroSectionInterfaceProps = {
    heading: formatStrapiData?.heroSectionData?.heading ?? "",
    subHeading: formatStrapiData?.heroSectionData?.subHeading ?? "",
    bgImageUrl: formatStrapiData?.heroSectionData?.bgImageUrl ?? "",
    bookingCtaUrl: formatStrapiData?.heroSectionData?.bookingCtaUrl ?? {
      label: "",
      url: "",
    },
    locationcta: formatStrapiData?.heroSectionData?.locationcta ?? [
      { label: "", url: "" },
    ],
    selectedId: {
      id: 3,
      service: "Interiors",
    },
  };

  const TiredOfMultipleOptionsData: ITiredOfMultipleOptionsProps = {
    heading: formatStrapiData?.cardSectionData?.heading ?? "",
    subHeading: formatStrapiData?.cardSectionData?.subHeading ?? "",
    listitems: formatStrapiData?.cardSectionData?.listItems?.slice(1) ?? [],
  };

  const tabsSectionData = {
    heading: DesignIdeas.heading,
    subHeading: DesignIdeas.subHeading,
    tabs: [
      {
        buttonLabel: "Modern Kitchen",
        tabKey: "modernKitchen",
      },
      {
        buttonLabel: "Bedroom Retreats",
        tabKey: "bedRoom",
      },
      {
        buttonLabel: "Stylish Living Rooms",
        tabKey: "livingRoom",
      },
      {
        buttonLabel: "TV Unit Designs",
        tabKey: "tvUnit",
      },
      {
        buttonLabel: "Bathroom Elegance",
        tabKey: "bathRoom",
      },
      {
        buttonLabel: "Balcony Beauties",
        tabKey: "balcony",
      },
      {
        buttonLabel: "Wardrobe Wonders",
        tabKey: "wardrobe",
      },
      {
        buttonLabel: "Dining Room Inspirations",
        tabKey: "dinningRoom",
      },
    ],
    tabPanels: [
      {
        tabKey: "modernKitchen",
        list: Object.values(DesignIdeas.listOfSpaces.kitchen || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "bedRoom",
        list: Object.values(DesignIdeas.listOfSpaces.bedroom || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "livingRoom",
        list: Object.values(DesignIdeas.listOfSpaces.livingRoom || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "tvUnit",
        list: Object.values(DesignIdeas.listOfSpaces.tvUnit || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "bathRoom",
        list: Object.values(DesignIdeas.listOfSpaces.bathroom || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "balcony",
        list: Object.values(DesignIdeas.listOfSpaces.balcony || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "wardrobe",
        list: Object.values(DesignIdeas.listOfSpaces.Wardrobe || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
      {
        tabKey: "dinningRoom",
        list: Object.values(DesignIdeas.listOfSpaces.diningRoom || {}).map(
          (item: any) => ({
            imageUrl: item?.imageUrl?.url ?? "",
            label: item?.stepTitle ?? "",
          })
        ),
      },
    ],
  };
  const TabsSectionData: IServiceTabSectionProps = {
    heading: tabsSectionData?.heading,
    subHeading: tabsSectionData?.subHeading,
    tabs: tabsSectionData?.tabs,
    tabPanels: tabsSectionData.tabPanels,
  };
  const PackagesData = {
    heading: "Packages We Offer",
    subHeading: " You have mutiple options to choose from our packages",
  };
  const PartnerImages = [
    {
      image: "/Interiors/partners/interiorpartner1.png",
    },
    {
      image: "/Interiors/partners/interiorpartner2.png",
    },
    {
      image: "/Interiors/partners/interiorpartner3.png",
    },
    {
      image: "/Interiors/partners/interiorpartner4.png",
    },
    {
      image: "/Interiors/partners/interiorpartner5.png",
    },
    {
      image: "/Interiors/partners/interiorpartner6.png",
    },
    {
      image: "/Interiors/partners/interiorpartner7.png",
    },
    {
      image: "/Interiors/partners/interiorpartner8.png",
    },
  ];

  return (
    <div className="w-full mx-auto max-w-[95%]"
    >
      <div>
        <BreadCrumb
          steps={[
            { label: "Our Services", link: "/services/custom-builder" },
            { label: "Interiors", link: "/interiors" },
          ]}
          currentStep="Interiors"
        />
      </div>
      <div className="mb-[20px] md:mb-[64px] w-full mx-auto max-w-[90%]">
        <ServiceHeroSection {...InteriorsHeroSectionData} />
      </div>

      <div className="fixed bottom-[8%]  left-0 w-full bg-white shadow-md border-t pb-1 px-4 z-50 md:hidden block ">
        <div className="max-w-[1600px]  w-full mx-auto  p-1 flex items-center justify-center">
          <Button
            className="bg-[#3586FF] font-medium md:px-5 px-3 md:py-3 py-1 md:text-[16px] text-[12px] rounded-[4px] text-white md:max-w-[50%] w-full flex items-center justify-center gap-2"
            onClick={() => router.push("/interiors/cost-estimator")}
          >
            <FaCalculator />
            Get Estimate Now
          </Button>
        </div>
      </div>
      <Link
        href="https://wa.me/918897574909"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <div className="fixed top-1/2 right-0 transform -translate-y-1/2 max-w-[50px] w-full h-[50px] bg-white shadow-md md:rounded-[12px] rounded-[4px] z-50 flex items-center justify-center cursor-pointer hover:shadow-lg transition-all">
          <div className="relative w-[30px] h-[30px]">
            <Image
              src="/icons/custom-builder/subservices/customfurniture/customization/Whatsappicon.png"
              alt="whatsapp"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Link>

      <div className="md:px-0 px-1 mt-[90%] md:mt-[0px]  mb-[60px] md:mb-[64px]">
        <Packages {...PackagesData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px]">
        <ListSection {...interiorDesign} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px]">
        <Partners images={PartnerImages} />
      </div>

      <div className="md:px-7 px-2 mb-[45px] md:mb-[64px]">
        {/* <InteriorsCostEstimation />
         */}
        <InteriorCalc />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>

      {/* <div className="px-5 mb-[20px]  md:mb-[64px]  md:mt-[0px]">
        <TiredOfMultipleOptions {...TiredOfMultipleOptionsData} />
      </div> */}
      <div className="px-5 mb-[45px] max-w-[90%] mx-auto md:mb-[64px]">
        <ServiceTabSection {...TabsSectionData} />
      </div>
      <div className="px-5 mb-[45px] md:mb-[64px]">
        <WorkFlow {...theWayWeWorkData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <TestimonialsSection {...testimonialsData} />
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
        <div className="max-w-[398px] min-h-[29px] flex items-center md:gap-x-[231px] gap-x-[118px] md:hidden md:px-3 px-2">
          <div className="max-w-[109px] min-h-[29px] ">
            <h1 className="text-[#000000] font-medium text-[20px] text-nowrap pl-[10px] leading-[28.5px]">
              Our Blogs
            </h1>
          </div>
          {blogs.length > 3 && (
            <div className="max-w-[69px] min-h-[23px] pr-[10px] ">
              <Button
                className="text-[#3586FF] text-[16px] leading-[22.8px] text-nowrap font-medium"
                onClick={() => handleshowall()}
              >
                {showAll ? "View Less" : "View All"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap md:flex-row flex-col justify-center items-center gap-5">
          {blogs.length > 0 ? (
            blogsToShow.map((blog, index) => (
              <div
                key={index}
                className={`rounded-[12px] shadow-md md:max-w-[332px] hidden md:block`}
              >
                <BlogCard data={blog} />
              </div>
            ))
          ) : (
            <p className="text-center font-medium">No blogs found.</p>
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
          <div className="md:flex justify-center mt-5 hidden ">
            <Button
              className="bg-[#3586FF] text-white px-4 py-2 rounded-lg"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "See Less" : "See More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteriorsComponent;
