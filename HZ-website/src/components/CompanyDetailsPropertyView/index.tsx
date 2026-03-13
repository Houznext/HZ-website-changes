import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { amenitiesData } from "./helper";
import PriceFloorPlan from "./floorDetails";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import Button from "@/common/Button";
import MapView from "@/common/MapView";
import Slider from "react-slick";
import {
  FiShare2,
  FiArrowRight,
  FiStar,
  FiMapPin,
  FiBookOpen,
  FiHelpCircle,
  FiInfo,
  FiMap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
  fetchNearbyLocations,
  getLocationDetails,
} from "@/utils/locationDetails/datafetchingFunctions";
import apiClient from "@/utils/apiClient";
import { ShieldCheck } from "lucide-react";
import { FaRulerCombined } from "react-icons/fa";
import { FiPhoneCall } from "react-icons/fi";
import { PiShareFat } from "react-icons/pi";
import { CiLocationOn } from "react-icons/ci";
import { BiRupee } from "react-icons/bi";
import { MdArrowForwardIos } from "react-icons/md";
import Link from "next/link";
import sliderSettings from "@/utils/sliderSettings";
import FAQSection from "./projectfaqs";
import ContactSellerForm from "@/components/PropertyDetailsComponent/ContactSellerForm";
import {
  IoArrowForward,
  IoClose,
  IoChevronForward,
  IoChevronBack,
} from "react-icons/io5";
import ProjectBrochure from "./broucherDownload";
import BackRoute from "@/common/BackRoute";
import { generateSlug } from "@/utils/helpers";
import Modal from "@/common/Modal";
import MoreProjectCard from "./ProjectCard";
import AmenitiesList from "./amenitiesList";
import LocalityTrends from "../PropertyDetailsComponent/LocalityTrends";

const CompanyDetailsPropertyView = ({ data }: any) => {
  const [showHighlights, setShowHighlights] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState<any>();
  const [locationDetails, setLocationDetails] = useState<any>();
  const [activeTab, setActiveTab] = useState<string>("Why Us");
  const router = useRouter();
  const [projects, setProjects] = useState<any>([]);
  const [localityprojects, setLocalityProjects] = useState<any>([]);
  const [OpenModal, setOpenModal] = useState(false);

  const pathname = usePathname();
  const pathSegments = pathname?.split("/");
  const activetab = pathSegments?.[2];

  const city = pathSegments?.[3];

  const whyChooseUsRef = useRef<HTMLDivElement | null>(null);
  const amenitiesRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const floorPlanRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const locationDetailsRef = useRef<HTMLDivElement | null>(null);
  const mapViewRef = useRef<HTMLDivElement | null>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [barH, setBarH] = useState(0);

  useEffect(() => {
    if (tabBarRef.current) setBarH(tabBarRef.current.offsetHeight);
    let ticking = false;

    const onScroll = () => {
      if (!tabBarRef.current) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          const top = tabBarRef.current!.getBoundingClientRect().top;
          setIsSticky(top <= 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tabs = [
    { label: "Why Us", ref: whyChooseUsRef },
    { label: "Amenities", ref: amenitiesRef },
    { label: "About Project", ref: aboutRef },
    { label: "Floor Plan", ref: floorPlanRef },
    { label: "Location", ref: locationDetailsRef },
    { label: "Map", ref: mapViewRef },
    { label: "FAQs", ref: faqRef },
  ];
  console.log("nn", nearbyLocations);

  const scrollToSection = (
    ref: React.RefObject<HTMLDivElement>,
    name: string
  ) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveTab(name);
  };

  const getNearByLocations = async (opts?: {
    radiusMeters?: number;
    types?: string[];
    signal?: AbortSignal;
  }) => {
    try {
      const lat = Number(data?.location?.latitude);
      const lng = Number(data?.location?.longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn("Nearby: missing/invalid coordinates", { lat, lng });
        const empty = { places: [], photos: [] };
        setNearbyLocations(empty);
        return empty;
      }

      const resp = await fetchNearbyLocations({
        latitude: lat,
        longitude: lng,
        radiusMeters: opts?.radiusMeters ?? 5000,
        types: opts?.types ?? [
          "school",
          "hospital",
          "supermarket",
          "restaurant",
          "bank",
          "atm",
          "bus_station",
          "train_station",
          "pharmacy",
          "gym",
        ],
        signal: opts?.signal,
      });

      setNearbyLocations(resp);
      return resp;
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
      const fallback = { places: [], photos: [] };
      setNearbyLocations(fallback);
      return fallback;
    }
  };
  const fetchLocationDetails = async () => {
    const placeId = data?.location?.place_id;
    if (!placeId) return;
    try {
      const locdata = await getLocationDetails(placeId);
      setLocationDetails(locdata ?? null);
    } catch (error) {
      console.log("Error fetching location details:", error);
    }
  };
  const fetchProjects = useCallback(
    async (companyId: string) => {
      if (!router?.isReady) return;

      if (!companyId) {
        return;
      }

      try {
        const res = await apiClient.get(
          `${apiClient.URLS.companyonboarding}/companies/${companyId}/projects/`
        );

        if (res?.status === 200 && res?.body) {
          setProjects(res.body);
        }
      } catch (error) {
        console.error("error is", error);
      }
    },
    [router?.isReady]
  );
  const fetchProjectsByLocality = async (locality: string) => {
    try {
      const params = new URLSearchParams();
      params.append("locality", locality);
      params.append("limit", "10");
      params.append("page", "1");

      const response = await apiClient.get(
        `${apiClient.URLS.companyonboarding
        }/get-all-projects?${params.toString()}`
      );

      setLocalityProjects(response.body);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  //useeffects for api calling

  useEffect(() => {
    if (data?.company?.id) {
      fetchProjects(data?.company?.id);
    }
    fetchProjectsByLocality(data?.location?.locality);
  }, [data?.company?.id, fetchProjects, router.isReady]);

  useEffect(() => {
    if (data?.location?.place_id) fetchLocationDetails();
  }, [data?.location?.place_id]);

  useEffect(() => {
    const controller = new AbortController();
    getNearByLocations({ signal: controller.signal });
    return () => controller.abort();
  }, [data?.location?.latitude, data?.location?.longitude]);
  const [selectedBHK, setSelectedBHK] = useState("All");
  const [openFloorModal, setOpenFloorModal] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const units = data?.propertyType?.units || [];

  const bhkSet = new Set(units.map((u: any) => u.BHK));

  const bhkTypes: any[] = Array.from(bhkSet).sort((a, b) => {
    const getValue = (bhk: string) => {
      if (bhk.toUpperCase().includes("RK")) return 0;
      const num = parseInt(bhk);
      return isNaN(num) ? 0 : num;
    };
    return getValue(b as any) - getValue(a as any);
  });

  bhkTypes.unshift("All");

  const filteredUnits =
    selectedBHK === "All"
      ? units
      : units.filter((u: any) => u.BHK === selectedBHK);

  const handleViewFloorplan = (images: string[]) => {
    setCurrentImages(images);
    setOpenFloorModal(true);
  };

  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} L`;
    } else {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(price);
    }
  };
  const handleShare = (project: any) => {
    const propertyUrl = `${window.location.origin}/projects/${project?.id}`;
    const location = `${project?.location?.locality || "N/A"}, ${project?.location?.city || "N/A"
      }`;
    const image = project?.mediaDetails?.propertyImages?.[0] || "/fallback.jpg";
    const title = project?.name || project?.company?.name || "Houznext Project";
    const bhk = project?.units?.[0]?.BHK || "N/A";
    const price = project?.minPrice
      ? `₹${(project.minPrice / 100000).toFixed(1)} L`
      : "N/A";

    const shareText = `
    ${title}
    BHK: ${bhk}
    Price: ${price}
    Location: ${location}
    Image: ${image}`;

    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: shareText,
          url: propertyUrl,
        })
        .then(() => console.log("Property shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard.writeText(propertyUrl);
      toast.success("Property link copied to clipboard!");
    }
  };
  const handleRoute = () => {
    const slug = generateSlug(data?.name);
    router.push(
      `/properties/${activeTab}/${city}/details/${slug}?id=${data?.id}&type=project`
    );
  };
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = data?.mediaDetails?.propertyImages || [];
  const insights = [
    {
      imageUrl: "/home/insight-1.png",
      heading: "Property Legal Opinion",
      description:
        "Get expert property legal guidance to avoid disputes and ensure your investment is secure.",
      link: "/legalservices",
    },
    {
      imageUrl: "/home/insight-2.png",
      heading: "Vaastu Consultation",
      description:
        "Enhance peace and prosperity with personalized Vaastu advice tailored to your property.",
      link: "/services/vaastu-consultation",
    },
    {
      imageUrl: "/home/insight-3.png",
      heading: "Interiors Cost Estimator",
      description:
        "Plan your interiors with instant cost estimates that match your style, space, and budget.",
      link: "/interiors/cost-estimator",
    },
    {
      imageUrl: "/home/insight-4.png",
      heading: "Solar Panel Calculator",
      description:
        "Estimate savings, ROI, and energy output from solar panels for your property in minutes.",
      link: "/solar",
    },
  ];

  return (
    <div className="w-full relative px-4 flex flex-col md:gap-4  gap-2 py-4 max-w-[1340px] mx-auto bg-gray-100">
      <div className="mb-3">
        <BackRoute />
      </div>

      <div className="flex flex-row justify-between shadow-custom bg-white/30 backdrop-blur-md  md:w-[70%] w-[100%] md:mb-2 mb-1 px-2 md:px-4 py-1 md:py-2">
        <div className="w-full md:text-[14px] text-[10px] font-medium text-gray-900 mb-2 md:mb-0">
          <div className="flex flex-wrap items-center gap-x-1">
            <Link href="/properties" className="underline underline-offset-2 ">
              Properties
            </Link>
            <MdArrowForwardIos size="10px" className="text-gray-500" />
            <Link
              href={`/properties/${activetab || ""}/${data?.location?.city || ""
                }`}
              className="underline underline-offset-2 "
            >
              {activetab || ""}
            </Link>
            <MdArrowForwardIos size="10px" className="text-gray-500" />
            <Link
              href={`/properties/${activetab || ""}/${data?.location?.city || ""
                }`}
              className="underline underline-offset-2 "
            >
              {data?.location?.city || ""}
            </Link>
            <MdArrowForwardIos size="10px" className="text-gray-500" />
            <span className="underline underline-offset-2  text-[#3586FF]">
              {data?.Name || ""}
            </span>
          </div>
        </div>

        <div className="text-[#7B7C83] md:text-[14px] text-[10px] font-medium  text-nowrap ">
          Latest Updated:
          {(data?.updatedAt
            ? new Date(data.updatedAt)
            : new Date()
          ).toLocaleDateString()}
        </div>
      </div>

      <div className="flex flex-col gap-5 md:w-[70%] w-[100%]">
        <div className="md:p-2 py-1 w-full">
          <div className="flex md:flex-row flex-col gap-3 w-full">
            <div className="md:w-[65%]">
              {images.length > 0 && (
                <div
                  className="relative w-full md:h-[230px] h-[130px] rounded-lg overflow-hidden shadow-md cursor-pointer"
                  onClick={() => {
                    setActiveIndex(0);
                    setOpenMediaModal(true);
                  }}
                >
                  <Image
                    src={images[0]}
                    alt="Property Image"
                    fill
                    className="object-cover"
                    priority
                  />

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    {data?.company?.RERAId && (
                      <div className="bg-black bg-opacity-80 inline-flex items-center gap-1  md:rounded-[6px] rounded-[4px] px-2 py-1 text-white text-[8px]">
                        <ShieldCheck size={12} />
                        <span className="text-transparent bg-gradient-to-r from-white to-yellow-500 bg-clip-text">
                          RERA Verified
                        </span>
                      </div>
                    )}
                    {data?.isBrokerage === false && (
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 inline-flex items-center gap-1  md:rounded-[6px] rounded-[4px] px-2 py-1.5 text-[8px] uppercase font-bold text-white">
                        Zero Brokerage
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="md:w-[35%] flex md:flex-col flex-row gap-2">
              {images.slice(1, 3).map((img: any, index: number) => (
                <div
                  key={index}
                  className="relative w-full h-[40px] md:h-[110px] rounded-md overflow-hidden shadow-sm cursor-pointer"
                  onClick={() => {
                    setActiveIndex(index + 1);
                    setOpenMediaModal(true);
                  }}
                >
                  <Image
                    src={img || "/placeholder-image.jpg"}
                    alt={`Property Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {index === 1 && images.length > 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <span className="text-white text-[12px] md:text-[14px] font-bold">
                        +{images.length - 3} more
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {data?.mediaDetails?.propertyVideo?.length > 0 && (
                <div className="relative w-full h-[70px] md:h-[110px] rounded-md overflow-hidden shadow-sm cursor-pointer">
                  <Image
                    src="https://via.placeholder.com/300x200"
                    alt="Property Video"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button className="bg-white bg-opacity-90 p-1 rounded-full text-[#3586FF] hover:scale-110 transition-transform">
                      <IoArrowForward size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal
          isOpen={openMediaModal}
          closeModal={() => setOpenMediaModal(false)}
          className="w-full md:max-w-[900px] max-w-[300px] max-h-[90vh]  md:mt-5 mt-0 md:rounded-[10px] rounded-[4px] bg-black/90 md:p-3 p-1 "
          rootCls="z-[9999]"
          isCloseRequired={false}
        >
          <div className="flex flex-col md:gap-4 gap-2">
            <div className="relative flex items-center justify-center">
              <Button
                className="absolute left-2 md:left-6 text-white text-3xl z-10"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1
                  )
                }
              >
                <IoChevronBack />
              </Button>

              <div className="relative w-[200px] md:w-[500px] h-[300px] md:h-[500px]">
                <Image
                  src={images[activeIndex]}
                  alt={`Preview ${activeIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              <Button
                className="absolute right-2 md:right-6 text-white text-3xl z-10"
                onClick={() =>
                  setActiveIndex((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0
                  )
                }
              >
                <IoChevronForward />
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto mt-3 md:mb-6 mb-0 justify-center">
              {images.map((img: any, idx: number) => (
                <div
                  key={idx}
                  className={`relative md:w-[110px] md:h-[90px] w-[60px] h-[50px] rounded-md overflow-hidden cursor-pointer ${idx === activeIndex ? "ring-2 ring-[#3586FF]" : ""
                    }`}
                  onClick={() => setActiveIndex(idx)}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Modal>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-medium md:text-[18px] text-[16px] text-gray-900">
              {data?.Name}
            </h1>
            <span className="bg-[#3586FF] text-white text-[10px] md:text-[12px] px-3 py-1 md:rounded-xl rounded-md font-medium">
              {data?.constructionStatus?.status}
            </span>
          </div>

          <div className="flex items-center text-[12px] md:text-[14px]">
            <span className="text-gray-600">By</span>
            <span
              className="font-medium ml-1 text-[#3586FF] underline cursor-pointer"
              onClick={() => {
                const name = generateSlug(data?.company?.companyName);
                router.push(`/company/${name}?id=${data?.company?.id}`);
              }}
            >
              {data?.company?.companyName}
            </span>
          </div>

          <p className="font-medium md:text-[14px] text-[12px] text-[#7B7C83]">
            {data?.location?.street} ,{data?.location?.locality} ,
            {data?.location?.city}, {data?.location?.state || ""}{" "}
            {data?.location?.country || "India"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 md:gap-3 gap-1 bg-white md:p-4 p-2 rounded-[4px] md:rounded-[10px] border border-gray-200 shadow-custom">
          <div className="flex flex-col items-center text-center bg-blue-50 md:p-4 p-1 md:rounded-[10px] rounded-[4px]">
            <p className="text-black font-bold md:text-[16px] text-[10px]">
              ₹{formatPrice(data?.minPrice)} - ₹{formatPrice(data?.maxPrice)}
            </p>
            {data?.propertyType?.units?.[0]?.flooringPlans?.[0] ? (
              <>
                {data.propertyType.units[0]?.flooringPlans[0].emiStartsAt ? (
                  <p className="text-[#3586FF] md:text-[14px] text-[10px] font-medium mt-1">
                    EMI Starts at ₹
                    {(
                      data.propertyType.units[0]?.flooringPlans[0].emiStartsAt /
                      100000
                    ).toFixed(1)}
                    K
                  </p>
                ) : (
                  <p className="text-gray-500 md:text-[12px] text-[10px] font-medium mt-1">
                    EMI details not available
                  </p>
                )}
                <p className="text-gray-400 text-[10px] md:text-[10px] mt-1">
                  All inclusive price
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-[10px] md:text-[10px] font-medium mt-1">
                Pricing info not available
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center items-center bg-blue-50 md:p-4 p-1 md:rounded-[10px] rounded-[4px]">
            <p className="text-black font-bold md:text-[16px] text-[10px]">
              ₹
              {(
                data.propertyType.units[0]?.flooringPlans[0].pricePerSft / 1000
              ).toFixed(2)}
              k/sq.ft
            </p>
            <p className="text-gray-500 md:text-[12px] text-[10px] mt-1">
              Avg Rate
            </p>
          </div>

          <div className="flex flex-col justify-center items-center bg-blue-50 md:p-4 p-1 md:rounded-[10px] rounded-[4px]">
            <p className="text-gray-500 font-medium md:text-[12px] text-[10px] uppercase tracking-wide text-center">
              Construction Status
            </p>
            <p className="bg-[#3586FF] text-white md:text-[12px] text-[8px] md:px-4 px-2 md:py-1 py-0.5 md:rounded-[10px] rounded-[4px] font-medium mt-2">
              {data?.constructionStatus?.status}
            </p>
            <p className="text-gray-500 md:text-[12px] text-[10px] font-medium mt-2 text-center">
              Completion by{" "}
              <span className="font-medium">
                {(data?.constructionStatus?.possessionBy
                  ? new Date(data.constructionStatus.possessionBy)
                  : new Date()
                ).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        <div className="w-full bg-white md:p-5 p-3 md:rounded-[10px] rounded-[4px] border border-gray-200 shadow-sm">
          <h2 className="text-gray-900 font-bold md:text-[18px] text-[16px] md:mb-4 mb-3">
            Floor Plans & Pricing {data?.typeName} in {data?.location?.city}
          </h2>

          <div className="flex md:gap-2 gap-1 overflow-x-auto pb-2 md:mb-4 mb-2">
            {bhkTypes.map((bhk) => (
              <Button
                key={bhk}
                onClick={() => setSelectedBHK(bhk as string)}
                className={`md:px-4 px-2 md:py-2 py-1 md:rounded-[10px] rounded-[4px] font-medium md:text-[14px] text-[12px] ${selectedBHK === bhk
                  ? "bg-[#3586FF] text-white"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {bhk}
              </Button>
            ))}
          </div>

          <div className="flex overflow-x-auto md:gap-5 gap-2 pb-3 scrollbar-hide">
            {filteredUnits.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No floor plans available.
              </div>
            ) : (
              filteredUnits.map((unit: any) =>
                unit.flooringPlans.map((plan: any, idx: number) => {
                  const builtup = plan?.BuiltupArea;
                  let areaLabel: string | null = null;
                  let areaSqM: string | null = null;

                  if (builtup) {
                    areaLabel = `${builtup.size} ${builtup.unit}`;
                    if (builtup.unit === "sq.ft") {
                      areaSqM = `${(builtup.size * 0.092903).toFixed(1)} sq.m`;
                    }
                  }

                  const price = plan?.TotalPrice
                    ? parseFloat(plan.TotalPrice)
                    : null;
                  const priceLabel = price
                    ? `₹${(price / 100000).toFixed(1)} L`
                    : null;

                  const psf = plan?.pricePerSft
                    ? parseFloat(plan.pricePerSft)
                    : null;
                  const psfLabel = psf
                    ? `₹${psf.toLocaleString()}/sq.ft`
                    : null;

                  return (
                    <div
                      key={`${unit.id}-${idx}`}
                      className="flex-shrink-0 max-w-[180px] w-full md:max-w-[250px] bg-gradient-to-b from-blue-50 to-white border border-blue-100 md:rounded-[10px] rounded-[4px] md:p-2 p-1 shadow-custom hover:shadow-md transition-all duration-200 flex items-center gap-2 "
                    >
                      {plan.floorplan?.length > 0 && (
                        <div className="relative w-full md:h-28 h-20 mb-2 rounded-md overflow-hidden">
                          <Image
                            src={plan.floorplan[0]}
                            alt="floorplan"
                            fill
                            className="object-cover rounded-md"
                          />
                          <span
                            className="absolute bottom-0 left-0 w-full bg-black bg-opacity-80 inline-flex items-center gap-1 md:rounded-[6px] rounded-[4px] px-2 py-1 text-white md:text-[10px] text-[6px] cursor-pointer font-medium"
                            onClick={() =>
                              plan.floorplan?.length &&
                              handleViewFloorplan(plan.floorplan)
                            }
                          >
                            View Floor Plan
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-center mb-1">
                          <span className="font-bold text-[#3586FF] md:text-[14px] text-[12px] tracking-wide">
                            {unit.BHK || "Plot"}
                          </span>
                        </div>

                        {areaLabel && (
                          <div className="text-gray-700 text-[11px] md:text-[13px] text-center font-medium">
                            {areaLabel}
                          </div>
                        )}
                        {areaSqM && (
                          <div className="text-gray-400 text-[10px] md:text-[12px] text-center mb-3">
                            ({areaSqM})
                          </div>
                        )}

                        {priceLabel && (
                          <div className="text-gray-900 font-bold text-[12px] md:text-[14px] text-center">
                            {priceLabel}
                          </div>
                        )}

                        {psfLabel && (
                          <div className="text-center mb-2">
                            <div className="text-[#3586FF] font-medium text-[11px] md:text-[12px] bg-blue-50 inline-block px-2 py-1 rounded-md">
                              {psfLabel}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>

          <Modal
            isOpen={openFloorModal}
            closeModal={() => setOpenFloorModal(false)}
            className="w-full md:max-w-[600px] max-w-[500px] h-full  rounded-[4px] px-3 py-2 flex items-center justify-center"
            isCloseRequired={false}
            rootCls="z-[99999]"
          >
            <div className="flex flex-wrap gap-3">
              {currentImages.map((img, idx) => (
                <div className="relative md:full w-[280px] h-[200px] md:h-[350px]">
                  <Image
                    src={img}
                    alt={`floorplan-${idx}`}
                    fill
                    className="object-contain md:rounded-[10px] rounded-[4px]"
                  />
                </div>
              ))}
            </div>
          </Modal>
        </div>
      </div>
      <div className="relative w-full">
        <div
          ref={tabBarRef}
          className="sticky md:top-[10%] top-[8%] bg-white shadow-md z-[999] overflow-x-auto no-scrollbar transition-all duration-300 md:mb-5"
        >
          <div className="flex gap-4 whitespace-nowrap px-4 border-b border-gray-200">
            {tabs.map((tab) => (
              <Button
                key={tab.label}
                onClick={() => scrollToSection(tab.ref, tab.label)}
                className={`pb-2 transition-all border-b-2 lg:px-6 py-[6px] md:px-3 px-2 md:py-2 md:text-[14px] text-[12px] font-medium ${activeTab === tab.label
                  ? "border-[#3586FF] text-[#3586FF]"
                  : "border-transparent text-gray-600"
                  }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <section className="flex md:flex-row flex-col  gap-3 w-full min-h-screen ">
          <div className="md:w-[65%] w-full h-full overflow-y-auto pr-4">
            <div className="flex flex-col md:gap-5 gap-3 ">
              <div
                className="max-w-[800px] w-full rounded-md bg-white shadow-custom md:px-6 md:py-4 px-4 py-2"
                ref={whyChooseUsRef}
              >
                <p className="heading-text font-bold  text-[#3586FF] md:mb-4 mb-2 flex items-center gap-2">
                  <FiStar className=" text-[#3586FF]" />
                  Why do you choose us?
                </p>

                {showHighlights ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data?.Specifications.slice(0, 300) || "",
                    }}
                    className="text-[10px] md:text-[14px] text-gray-700 md:leading-6 leading-4 font-regular"
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data?.Specifications || "",
                    }}
                    className="text-[10px] md:text-[14px] text-gray-700 md:leading-6 leading-4 font-regular"
                  />
                )}
                <div className="mx-auto  flex items-center justify-center">
                  <Button
                    onClick={() => setShowHighlights(!showHighlights)}
                    className="text-[#3586FF] md:text-sm text-[10px] mt-2 text-center font-medium hover:text-[#3586FF]"
                  >
                    {showHighlights ? "Hide Highlights ▲" : "Show Highlights ▼"}
                  </Button>
                </div>
              </div>
              <div
                className="max-w-[800px] w-full rounded-md bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-400 shadow-lg md:px-6 md:py-5 px-4 py-3"
                ref={amenitiesRef}
              >
                {(data?.ProjectAmenities?.length ?? 0) > 0 && (
                  <div>
                    <h2 className="flex items-center gap-2 font-bold text-[#3586FF] heading-text mb-4">
                      <FiBookOpen className=" text-[#3586FF]" />
                      Amenities:
                    </h2>
                    <AmenitiesList
                      data={data}
                      amenitiesData={amenitiesData}
                      limit={9}
                      collapsible={true}
                    />
                  </div>
                )}
              </div>

              <div
                className="max-w-[800px] rounded-md bg-white shadow-custom md:px-6 md:py-4 px-4 py-2"
                ref={aboutRef}
              >
                <p className="md:text-[16px] text-[#3586FF]   text-[14px] font-bold flex items-center gap-2 ">
                  <FiInfo className=" text-[#3586FF]" />
                  About Project :
                </p>
                <div className="md:text-[12px] md:mt-3 mt-[5px] text-gray-500 font-regular text-[10px]">
                  {data?.AboutProject}
                </div>
              </div>

              <div
                className="max-w-[800px] rounded-md bg-white shadow-custom md:px-6 mb-6 md:py-4 px-4 py-2"
                ref={floorPlanRef}
              >
                <PriceFloorPlan propertyData={data?.propertyType} data={data} />
              </div>
            </div>
            <div className="flex  flex-col gap-3 md:gap-5">
              <div className="max-w-[800px] md:px-4 md:py-2 p-2 rounded-md bg-white shadow-custom ">
                <ProjectBrochure brochures={data?.Brochure} />
              </div>
              <div
                className="max-w-[800px] bg-white px-4 py-2 rounded-md"
                ref={mapViewRef}
              >
                <h3 className="md:text-[16px] text-[14px]  text-[#3586FF] mb-2 font-medium flex items-center gap-2 ">
                  <FiMapPin className=" text-[#3586FF]" />
                  Explore neighbourhood - Map view :
                </h3>
                <div className="md:mt-3 mt-1">
                  <MapView
                    lat={Number(data?.location?.latitude)}
                    lng={Number(data?.location?.longitude)}
                  />
                </div>
              </div>
              {/* locations details */}
              <div
                className="max-w-[800px] bg-white px-4 py-2 rounded-md"
                ref={locationDetailsRef}
              >
                <div className="w-full mt-6 md:mt-10 md:mb-10 mb-7 flex flex-col md:gap-6 gap-3">
                  <h3 className="md:text-[16px] text-[14px]  font-bold text-[#3586FF] flex items-center gap-2">
                    <FiMap className=" text-[#3586FF]" />
                    Locality details
                  </h3>
                  <p className="font-medium md:text-[12px] text-[10px]">
                    {locationDetails?.description}
                  </p>
                  <Slider {...sliderSettings} className="">
                    {nearbyLocations?.photos?.map(
                      (item: any, index: number) => (
                        <div className="px-2 lg:px-[13px] flex pb-1 rounded-[8px]">
                          <div className="max-w-[240px] flex flex-col items-center bg-white md:gap-3 gap-1 md:p-3  p-1 shadow-md rounded-[8px]">
                            <div
                              key={index}
                              className="relative w-[120px] md:h-[113px] h-[110px] rounded-[8px] overflow-hidden px-1"
                            >
                              <Image
                                src={item?.photo_url}
                                alt={item?.place_name}
                                fill
                                className="absolute object-cover rounded-[8px]"
                              />
                            </div>
                            <p className="md:text-[12px] text-[10px] font-medium w-full text-left h-[70px] pt-2 text-gray-800">
                              {item?.place_name[0].toUpperCase() +
                                item?.place_name.slice(1)?.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </Slider>
                </div>
              </div>
              {data?.location?.locality && data?.location?.city && (
                <div className="mt-8 md:mt-10 max-w-[1320px]">
                  <LocalityTrends
                    locality={data?.location?.locality}
                    city={data?.location?.city || ""}
                    subLocality={data?.location?.subLocality || undefined}
                    lookingType={data?.lookingType ?? "Sell"}
                    purpose={data?.purpose}
                    propertyType={typeof data?.propertyType === "string" ? data.propertyType : undefined}
                  />
                </div>
              )}
              {/* project faqs */}
              <div
                className="max-w-[800px] shadow-xl bg-white rounded-md px-4 py-2"
                ref={faqRef}
              >
                <h3 className="md:text-[16px] text-[14px] mb-3  border-b-2  py-2 font-bold  flex items-center gap-2 text-[#3586FF]">
                  <FiHelpCircle className=" text-[#3586FF]" />
                  Frequently Asked Questions
                </h3>
                <FAQSection data={data} />
              </div>
            </div>
          </div>
          <div className="md:w-[35%] w-full md:sticky top-4 hidden md:block  self-start bg-white p-4 shadow-md space-y-2 ">
            <ContactSellerForm propertyId={data?.id as string} project={true} />

            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[10px] shadow-custom border border-blue-100 flex items-center justify-between group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-200 rounded-full opacity-20"></div>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-200 rounded-full opacity-20"></div>

              <div className="flex flex-col gap-2 z-10">
                <h1 className="font-medium text-gray-800 md:text-[14px] text-[12px]">
                  Found this project interesting?
                </h1>
                <Button
                  onClick={() => handleShare(data)}
                  className="text-[#3586FF] font-medium md:text-[14px] text-[12px] flex items-center gap-2 hover:text-[#3586FF] transition-colors duration-300 group-hover:gap-3"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span>Share with friends</span>

                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Button>
              </div>

              <div
                className="w-12 h-12 relative flex-shrink-0 bg-white rounded-full group-hover:bg-blue-50 transition-colors duration-300 flex items-center justify-center shadow-sm z-10"
                onClick={() => handleShare(data)}
              >
                <FiShare2 className="w-6 h-6 text-[#3586FF] group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
          <div className="fixed bottom-0  left-0 w-full bg-white shadow-md border-t pb-1 px-4 z-50 md:hidden block ">
            <div className="  w-full mx-auto  p-3 gap-2 flex items-center ">
              <Button
                className="bg-[#3586FF] font-medium md:px-5 px-2 md:py-3 py-2  text-[12px] rounded-[4px] text-white  w-full flex items-center justify-center gap-2"
                onClick={() => handleShare(data)}
              >
                <PiShareFat className="md:w-5 w-4 md:h-5 h-4" />
                Share
              </Button>
              <Button
                className="bg-[#3586FF] font-medium md:px-5 px-2 md:py-3 py-2 md:text-[16px] text-[12px] rounded-[4px] text-white  w-full flex items-center justify-center gap-2"
                onClick={() => setOpenModal(true)}
              >
                <FiPhoneCall className="md:w-5 w-4 md:h-5 h-4" />
                Contact Developer
              </Button>
            </div>
          </div>
        </section>
      </div>


      {OpenModal && (
        <Modal
          isOpen={OpenModal}
          closeModal={() => setOpenModal(false)}
          className="w-fit max-w-full rounded-[4px] px-3 py-2"
          isCloseRequired={false}
          rootCls="z-[9999] "
        >
          <div className="">
            <ContactSellerForm propertyId={data?.id as string} project={true} />
          </div>
        </Modal>
      )}
      <div className="md:pr-0 pr-3 space-y-3">
        <div className="w-full bg-white md:px-4 px-3  md:py-4 py-3 shadow-custom md:mb-4 mb-2 md:rounded-[10px] rounded-md">
          <div className="md:space-y-3 space-y-1">
            <h1 className="font-bold md:text-[18px] text-[14px] mb-4 text-[#3586FF] ">
              Our Other Services
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-2 place-content-center">
              {insights.map((insight, index) => (
                <div
                  key={`${insight.imageUrl}-${insight.link}-${index}-insight`}
                  className="group bg-white md:rounded-[10px] rounded-[4px] border border-gray-200 flex flex-col items-center p-3 md:p-6 max-w-[300px] mx-auto hover:shadow-xl hover:border-[#3586FF]/40 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#093576]/5 to-[#3586FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                  <div className="absolute top-0 right-0 md:w-12 w-8 md:h-12 h-8 overflow-hidden">
                    <div className="absolute top-0 right-0 md:w-6 w-3 md:h-6 h-3 bg-[#3586FF] opacity-10 group-hover:opacity-20 transition-opacity duration-300 transform rotate-45 translate-x-3 -translate-y-3"></div>
                  </div>

                  <div className="relative md:mb-5 mb-2 w-14 h-14 md:w-24 md:h-24 bg-blue-50 md:rounded-[10px] rounded-[4px] flex items-center justify-center md:p-4 p-2 group-hover:bg-blue-100 transition-colors duration-300">
                    <div className="relative w-10 h-10 md:w-16 md:h-16">
                      <Image
                        src={insight.imageUrl}
                        alt={insight.heading}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <div className="text-center flex flex-col items-center flex-1">
                    <h3 className="text-[#3586FF] md:text-[16px] text-[12px] font-bold md:mb-3 mb-1 group-hover:text-[#3586FF] transition-colors duration-300 leading-tight">
                      {insight.heading}
                    </h3>

                    <p className="text-[#4C4D54] text-[10px] md:text-[13px] font-regular md:mb-5 mb-2 flex-1 md:leading-relaxed leading-2">
                      {insight.description}
                    </p>

                    <Link
                      href={insight.link}
                      className="inline-flex items-center gap-2 bg-blue-50 text-[#3586FF] font-medium text-[10px] md:text-[14px] md:px-4 px-2 md:py-2 py-1 rounded-full group-hover:bg-[#3586FF] group-hover:text-white transition-all duration-300 hover:gap-3"
                    >
                      <span>Explore Now</span>
                      <FiArrowRight className="md:w-4 w-3 md:h-4 h-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {projects?.projects?.length > 0 && (
          <div className="bg-white md:px-4 px-3  md:py-4 py-3 shadow-custom md:mb-4 mb-2 md:rounded-[10px] rounded-md">
            <div className="md:space-y-3 space-y-1">
              <h1 className="font-bold md:text-[16px] text-[14px] mb-4 text-gray-500 ">
                More Projects by{" "}
                <span className="font-bold text-[#3586FF] text-[14px]">
                  {projects?.companyName}
                </span>
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-5 gap-3">
                {projects?.projects
                  ?.slice(0, 4)
                  .map((newProperty: any, index: number) => {
                    if (!newProperty) return;
                    return (
                      <MoreProjectCard
                        newProperty={newProperty}
                        key={index}
                        activetab={activetab}
                        city={city}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {localityprojects?.data?.length > 0 && (
          <div className="bg-white md:px-4 px-3  md:py-4 py-3 shadow-custom md:mb-4 mb-2 md:rounded-[10px] rounded-md">
            <div className="md:space-y-3 space-y-1">
              <h1 className="font-bold md:text-[16px] text-[14px] mb-4 text-gray-500 ">
                More Projects On{" "}
                <span className="font-bold text-[#3586FF] text-[14px]">
                  {data?.location?.locality}{" "}
                </span>
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-5 gap-3">
                {localityprojects?.data
                  ?.slice(0, 4)
                  .map((newProperty: any, index: number) => {
                    if (!newProperty) return;
                    return (
                      <MoreProjectCard
                        newProperty={{
                          ...newProperty,
                          Name: newProperty?.name || newProperty?.Name,
                          ProjectArea:
                            newProperty?.size || newProperty?.ProjectArea,
                          propertyType: {
                            typeName:
                              newProperty?.propertyType ||
                              newProperty?.propertyType?.typeName,
                          },
                        }}
                        key={index}
                        activetab={activetab}
                        city={city}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailsPropertyView;
