import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import PropertyType from "../PropertyType";
import PropertyCity from "../PropertyCity";
import TopProperties from "../TopProperties";
import PopularCities from "../PopularLocalties";
import PopularBuilders from "../PopularBuilders";
import PopularLocalties from "../PopularLocalties";
import PopularCity from "../PopularCity";
import { Tab } from "@headlessui/react";
import Link from "next/link";
import { RightArrow } from "@/components/Icons";
import clsx from "clsx";
import PropertyHeader from "@/components/PropertiesListComponent/PropertyHeader";
import Slider from "react-slick";
import apiClient from "@/utils/apiClient";
import { generateSlug, formatCost } from "@/utils/helpers";
import GoogleAdSense from "@/components/GoogleAdSense";
import PropertyFilterBar, {
  PropertyTab,
  tabs,
} from "@/common/PropertyFilterBar";

import PropertySearchBar from "@/common/PropertySearchBar";
import SectionSkeleton from "@/common/Skeleton";
import RealEstateProperties from "../realEstateProperties";
import { useRouter } from "next/router";
import { Loader } from "lucide-react";
interface CityData {
  city: string;
  total: number;
}
interface PopularLocalityItem {
  locality: string;
  name: string;
  id: number;
  city: string;
  zone: string | null;
  totalProjects: number;
  minPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
}

interface SummaryData {
  city: string;
  topProperties: any[];
  topProjects: any[];
  popularCities: CityData[];
  popularLocalities: PopularLocalityItem[];
  popularBuilders: any[];
}

const PopularLocalty = [
  {
    localty: "Gachibowli",
    location: "Financial District",
    range: "50L - 2.5Cr*",
    sqft: "1200 - 3000 SQ.FT",
  },
  {
    localty: "Banjara Hills",
    location: "Central Hyderabad",
    range: "1Cr - 5Cr*",
    sqft: "1500 - 4000 SQ.FT",
  },
  {
    localty: "Jubilee Hills",
    location: "Central Hyderabad",
    range: "2Cr - 7Cr*",
    sqft: "1800 - 5000 SQ.FT",
  },
  {
    localty: "Hitech City",
    location: "Madhapur",
    range: "80L - 3Cr*",
    sqft: "1000 - 3500 SQ.FT",
  },
  {
    localty: "Kondapur",
    location: "Northwest Hyderabad",
    range: "60L - 2Cr*",
    sqft: "1100 - 3200 SQ.FT",
  },
  {
    localty: "Miyapur",
    location: "Northwest Hyderabad",
    range: "40L - 1.5Cr*",
    sqft: "900 - 2800 SQ.FT",
  },
  {
    localty: "Manikonda",
    location: "Southwest Hyderabad",
    range: "50L - 2Cr*",
    sqft: "1200 - 3400 SQ.FT",
  },
  {
    localty: "Kukatpally",
    location: "Northwest Hyderabad",
    range: "50L - 2Cr*",
    sqft: "1100 - 3300 SQ.FT",
  },
];

const BuilderData = [
  {
    image: "/images/popularbuilders/appaswamy.png",
    name: "Hyderabad Builder 1",
    projects: "25 Total Projects | 15 in this city",
  },
  {
    image: "/images/popularbuilders/casagrand.png",
    name: "Hyderabad Builder 2",
    projects: "30 Total Projects | 20 in this city",
  },
  {
    image: "/images/popularbuilders/radiance.png",
    name: "Hyderabad Builder 3",
    projects: "40 Total Projects | 25 in this city",
  },
];

const cityData = [
  {
    city: "Hyderabad",
    count: 23000,
    image: "/images/popularCity/hyderabad.png",
  },
  { city: "Mumbai", count: 35000, image: "/images/popularCity/mumbai.png" },
  { city: "Delhi", count: 30000, image: "/images/popularCity/delhi.png" },
  {
    city: "Bangalore",
    count: 28000,
    image: "/images/popularCity/bangalore.png",
  },
  { city: "Chennai", count: 22000, image: "/images/popularCity/chennai.png" },
  { city: "Kolkata", count: 20000, image: "/images/popularCity/kolkata.png" },
  { city: "Pune", count: 18000, image: "/images/popularCity/pune.png" },
  {
    city: "Ahmedabad",
    count: 15000,
    image: "/images/popularCity/ahmedbad.png",
  },
];

const PropCity = [
  {
    count: 200,
    type: "Ready to Move",
    image: "/images/cityprops/ready_move.png",
  },
  {
    count: 1300,
    type: "Under Construction",
    image: "/images/cityprops/under_const.png",
  },
  {
    count: 300,
    type: "New launch",

    image: "/images/cityprops/new_launch.png",
  },
  {
    count: 1200,
    type: "Affordable Apartment /house",
    image: "/images/cityprops/aff_house.png",
  },
];

const cityOptions = [
  {
    label: "Hyderabad",
    value: "hyderabad",
  },
  {
    label: "Banglore",
    value: "banglore",
  },
  {
    label: "Mumbai",
    value: "mumbai",
  },
  {
    label: "Pune",
    value: "pune",
  },
];

const tabConfig = {
  buy: {
    budgetOptions: ["50Lac - 1Cr", "1Cr - 2Cr", "2Cr+"],
    houseTypeOptions: ["House/Villa", "Apartment", "Villa", "Plot", "Land"],
    roomsOptions: ["1BHK", "2BHK", "3BHK", "4BHK"],
  },
  rent: {
    budgetOptions: ["5K - 10K", "10K - 20K", "20K+"],
    houseTypeOptions: ["Apartment", "Flat", "Studio"],
    roomsOptions: ["1BHK", "2BHK", "3BHK"],
  },
  commercial: {
    budgetOptions: ["1Cr - 2Cr", "2Cr - 3Cr", "3Cr+"],
    houseTypeOptions: ["Office", "Retail", "Warehouse", "ShowRoom", "Plot"],
    roomsOptions: [],
  },
  plot: {
    budgetOptions: ["20L - 50L", "50L - 1Cr", "1Cr+"],
    houseTypeOptions: ["Residential Plot", "Commercial", "Industrial"],
    roomsOptions: [],
  },
} as any;

const PropertiesHome = () => {
  const [activeTab, setActiveTab] = React.useState<PropertyTab>("buy");
  const [city, setCity] = useState("hyderabad");
  const [PopularfetchCity, setPopularCities] = useState<SummaryData | null>(
    null
  );
  const [formattedLocalities, setFormattedLocalities] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchPopularCities = async () => {
      try {
        const res = await apiClient.get(
          `${apiClient.URLS.unified_listing}/summary?city=${city}`
        );
        if (res?.status === 200 && res?.body) {
          setPopularCities(res.body);

          const formatted =
            res.body.popularLocalities?.map((item: any) => {
              const slugName = generateSlug(item.name);
              const dynamicLink = `/properties/${activeTab}/${item.city}/details/${slugName}?id=${item.id}&type=project`;

              return {
                localty: item?.locality,
                location: item?.city,
                range: `${formatCost(item.minPrice)} - ${formatCost(
                  item.maxPrice
                )}*`,
                sqft: `${item.minSize} - ${item.maxSize} SQ.FT`,
                projectCount: item?.totalProjects,
                link: dynamicLink,
              };
            }) || [];

          setFormattedLocalities(formatted);
        }
      } catch (error) {
        console.error("error is", error);
      }
    };

    fetchPopularCities();
  }, [city, activeTab]);

  const settings = {
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "ease-in-out",
    arrows: false,
    dots: false,
  };

  const images = [
    "/images/background/properties_bg.png",
    "/images/background/properties_bg2.jpeg",
    "/images/background/properties_bg1.jpg",
  ];
  const [loading, setLoading] = useState(true);
  const getCityImage = (city: string): string => {
    const imageMap: Record<string, string> = {
      Hyderabad: "/images/popularCity/hyderabad.png",
      Bengaluru: "/images/popularCity/bangalore.png",
      Chennai: "/images/popularCity/chennai.png",
    };
    return imageMap[city] || "/images/default.jpg";
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);
  const formatCity = (city: string) =>
    city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

  const PropTypes = [
    {
      type: "Residential Land",
      count: 1204,
      image: "/images/propertytypes/residential_plots.png",
      url: `/properties/buy/${formatCity(city)}?propertyType=Plot`,
    },
    {
      type: "Independent House",
      count: 1300,
      image: "/images/propertytypes/builder_floor.png",
      url: `/properties/${activeTab}/${formatCity(
        city
      )}?propertyType=Independent+House`,
    },
    {
      type: "Villa",
      count: 1400,
      image: "/images/propertytypes/villas.png",
      url: `/properties/${activeTab}/${formatCity(city)}?propertyType=Villa`,
    },
    {
      type: "Service Apartment",
      count: 1200,
      image: "/images/propertytypes/service_apartments.png",
      url: `/properties/${activeTab}/${formatCity(
        city
      )}?propertyType=Apartment`,
    },
  ];

  return (
    <div className="relative">
      <div className="relative h-[500px] md:h-[461px] flex flex-col items-center justify-center gap-10 md:gap-16 ">
        <Slider {...settings} className="absolute z-0 w-full h-full">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative md:w-full w-full h-[500px] md:h-[461px]"
              style={{ aspectRatio: "16 / 9" }}
            >
              <Image
                src={src}
                alt={`slider-image-${index}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </Slider>

        <div>
          <Image
            src="/images/background/shade_bg.png"
            alt="shade_bg"
            fill
            className="absolute inset-0"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="z-10 w-full mt-24">
          <p className="text-[18px] md:text-[24px] md:leading-[44.17px] text-center font-bold text-white">
            Find the Perfect Place in
            <span
              className="text-[#5599ff] text-[18px] md:text-[24px] inline-block min-w-[150px] md:pl-3"
              style={{ minHeight: "1em" }}
            >
              {city ? (
                city.toUpperCase()
              ) : (
                <span className="invisible"><Loader /></span>
              )}
            </span>
          </p>

          <div className="p-2 md:py-6 md:px-2  rounded-md w-full xl:w-[50%] lg:w-[70%] mx-auto">
            <Tab.Group onChange={(index) => setActiveTab(tabs[index].tabKey)}>
              <Tab.List className="flex flex-wrap md:flex-nowrap justify-center md:w-[60%]  w-[80%] bg-white mx-auto rounded-t-[6px] overflow-x-auto custom-scrollbar gap-[8px] md:gap-[4px] pt-[10px] pb-1 px-2">
                {tabs.map((tabList) => (
                  <Tab
                    key={tabList.tabKey}
                    className={({ selected }) =>
                      clsx({
                        "md:text-[14px] text-[12px] rounded md:min-w-[106px] xl:px-3 lg:px-1 md:py-[2px] py-[2px] px-3":
                          true,
                        "font-medium bg-[#F4F4F4] text-[#212227] ":
                          !selected,
                        "font-medium bg-[#418cfb] text-[#FDFDFD] focus:outline-none":
                          selected,
                      })
                    }
                  >
                    {tabList.buttonLabel}
                  </Tab>
                ))}
              </Tab.List>

              <Tab.Panels className="w-full  rounded-md bg-white max-w-[92%] md:pt-5 pt-2 mx-auto">
                <div className="flex justify-center mx-auto ">
                  <PropertySearchBar
                    activeTab={activeTab}
                    cityOptions={cityOptions}
                    searchrootCls="bg-[white] w-full"
                  />
                </div>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
      <div>
        <h1 className="text-center md:text-[24px] text-[20px] font-medium leading-9 mt-20">
          In Hyderabad Apartments, Villas and more
        </h1>

        {loading ? (
          <SectionSkeleton type={"propertiesSkeleton"} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-2 gap-1 mx-auto lg:max-w-[1336px] md:max-w-[720px] max-w-[390px] w-full md:mt-16 mt-10 md:pl-0 pl-2">
            {PropTypes.map((item, index) => {
              return (
                <PropertyType
                  key={index}
                  type={item.type}
                  count={item.count}
                  image={item.image}
                  url={item.url}
                />
              );
            })}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-center md:text-[24px] text-[20px] font-medium leading-9 mt-20">
          Projects in Chennai
        </h2>

        {loading ? (
          <SectionSkeleton type={"propertiesSkeleton"} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-3 gap-1 mx-auto lg:max-w-[1336px] md:max-w-[720px] max-w-[390px] w-full md:mt-16 mt-10 md:pl-0 pl-2">
            {PropCity.map((item, index) => {
              return (
                <PropertyCity
                  key={index}
                  city={city}
                  image={item.image}
                  type={item.type}
                  count={item.count}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="mb-[80px]">
        <p className="text-center md:text-[24px] text-[20px] font-medium leading-9 mt-20 md:mb-[64px] mb-[30px]">
          Top Projects
        </p>

        {loading ? (
          <SectionSkeleton type={"propertiesSkeleton"} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mx-auto lg:max-w-[1336px] md:max-w-[720px] max-w-[390px] md:px-4 px-2 w-full ">
            {PopularfetchCity?.topProjects?.map((item, index) => {
              const name = generateSlug(item.name);
              const dynamicLink = `/properties/${activeTab}/${item.city}/details/${name}?id=${item.id}&type=project`;

              return (
                <TopProperties
                  key={index}
                  image={item.images[0]}
                  projectName={item?.name}
                  location={item.locality}
                  city={item.city}
                  area={item?.areaRange}
                  price={item?.priceRange}
                  link={dynamicLink}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="mb-[80px]">
        <p className="text-center md:text-[24px] text-[20px] font-medium leading-9 mt-20 md:mb-[64px] mb-[30px]">
          Top Properties
        </p>

        {loading ? (
          <SectionSkeleton type={"propertiesSkeleton"} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mx-auto lg:max-w-[1336px] md:max-w-[720px] max-w-[390px] md:px-4 px-2 w-full ">
            {PopularfetchCity?.topProperties?.map((item, index) => {
              const name = generateSlug(item.name);
              const dynamicLink = `/properties/${activeTab}/${item.city}/details/${name}?id=${item.id}&type=property`;

              return (
                <TopProperties
                  key={index}
                  image={item?.images}
                  projectName={item?.name}
                  location={item.location}
                  city={item.city}
                  area={item.area || "N/A"}
                  price={item.price || "Price on request"}
                  link={dynamicLink}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="relative w-full h-[550px]">
        <div className="absolute inset-0">
          <Image
            src="/images/background/toplocalties_bg.png"
            alt="shade_bg"
            fill
            className=" z-10"
          />
        </div>
        <div className="absolute inset-0 z-20 flex flex-col ">
          <div>
            <PopularLocalties data={formattedLocalities} city={city} />
          </div>
        </div>
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>

      <div className="mb-[60px]">
        <h2 className="text-center  relative md:text-[24px] text-[20px] font-medium leading-9 md:mt-20 mt-10 md:mb-[64px] mb-[30px] ">
          Popular builders
        </h2>
        {loading ? (
          <SectionSkeleton type={"popularBuildersSkeleton"} />
        ) : (
          <div className="flex flex-col md:flex-row gap-7 items-center justify-center">
            {PopularfetchCity?.popularBuilders?.map((item, index) => {
              return (
                <PopularBuilders
                  key={index}
                  image={item?.logo}
                  name={item?.companyName}
                  projects={item?.totalProjects}
                  slug={item?.slug}
                  id={item?.id}
                  projectsincity={item?.projectsInCity}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="mb-[60px]">
        <p className="text-center  relative md:text-[24px] text-[20px] font-medium leading-9 md:mt-20 mt-10 md:mb-[64px] mb-[30px] ">
          Top Popular Indian Cities
        </p>

        {loading ? (
          <SectionSkeleton type={"popularIndianCitiesSkeleton"} />
        ) : (
          <div className="flex flex-wrap md:gap-7 gap-4 justify-center">
            {PopularfetchCity?.popularCities?.map(
              (popular: any, index: number) => (
                <div
                  key={index}
                  className="w-[calc(39.33%-1.75rem)] min-w-[150px] md:w-[calc(20%-1.75rem)]"
                >
                  <PopularCity
                    city={popular.city}
                    count={popular.total || 10}
                    image={getCityImage(popular.city)}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
      <div className="mb-[60px]">{/* <RealEstateProperties /> */}</div>
    </div>
  );
};

export default PropertiesHome;
