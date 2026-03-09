import { useCallback, useEffect, useState, useRef } from "react";
import Button from "@/common/Button";

import type { PropertyStore } from "@/store/postproperty";
import ImageSlider from "../PropertiesListComponent/SingleProperty/ImageSlider";
import { CiBookmark } from "react-icons/ci";
import { Search } from "lucide-react";
import { PiShareFat } from "react-icons/pi";
import { CiLocationOn } from "react-icons/ci";
import { FiPhoneCall, FiLayers, FiArrowRight } from "react-icons/fi";
import { BiRupee } from "react-icons/bi";
import { usePathname } from "next/navigation";
import HelpYouDecide from "./HelpYouDecide";
import { useWishlistStore } from "@/store/wishlist";
import { useSession } from "next-auth/react";
import Modal from "@/common/Modal";

import {
  MdOutlineBalcony,
  MdBathroom,
  MdBedroomParent,
  MdOutlineSquareFoot,
  MdOutlineDirectionsCar,
  MdTwoWheeler,
  MdLayers,
  MdOutlineStairs,
  MdOutlineDateRange,
  MdOutlineSearch,
  MdOutlineElevator,
  MdVerticalAlignTop,
  MdExplore,
  MdCropSquare,
  MdStraighten,
  MdSwapHoriz,
  MdDateRange,
  MdOutlineHandshake,
  MdOutlineSecurity,
  MdOutlineAttachMoney,
  MdOutlineLocalOffer,
  MdBookmark,
  MdOutlineFence,
  MdOutlineBusiness,
  MdOutlinePerson,
  MdOutlineEmail,
  MdOutlinePhone,
  MdOutlineLocationOn,
  MdOutlineHomeWork,
  MdOutlinePinDrop,
  MdOutlineMeetingRoom,
  MdOutlineChair,
  MdOutlinePeople,
  MdOutlineEvent,
  MdOutlinePriceChange,
  MdOutlineCurrencyRupee,
  MdOutlineBuild,
  MdOutlineApartment,
  MdOutlineWeekend,
  MdOutlineInventory,
  MdOutlineCalendarToday,
  MdOutlineConstruction,
  MdArrowForwardIos,
} from "react-icons/md";
import {
  ConstructionStatusEnum,
  LookingType,
  PurposeType,
} from "../Property/PropertyDetails/PropertyHelpers";
import toast from "react-hot-toast";
import ContactSellerForm from "./ContactSellerForm";
import {
  furnitureTypesEnum,
  propertyTypeEnum,
} from "../PublicPostProperty/PropertyHelpers";
import { getLookingTypePath } from "@/components/Property/PropertyDetails/PropertyHelpers";

// MUI Material Icons
import {
  LocalLaundryService,
  Weekend,
  Microwave,
  Kitchen,
  Water,
  GasMeter,
  AcUnit,
  Tv,
  KingBed,
  Countertops,
  Window,
  Chair,
  ElectricalServices,
  SoupKitchen,
  House,
  CameraAlt,
  FitnessCenter,
  Yard,
  Pool,
  LocalBar,
  Power,
  ChildCare,
  MeetingRoom,
  Security,
  LocalParking,
  WaterDrop,
  LocalFireDepartment,
} from "@mui/icons-material";
import { MdDining } from "react-icons/md";
import { FaFan } from "react-icons/fa";

import Link from "next/link";
import Image from "next/image";
import apiClient from "@/utils/apiClient";
import { useRouter } from "next/navigation";
import MapView from "@/common/MapView";
import {
  fetchNearbyLocations,
  getLocationDetails,
} from "@/utils/locationDetails/datafetchingFunctions";
import Slider from "react-slick";
import sliderSettings from "@/utils/sliderSettings";
import SectionSkeleton from "@/common/Skeleton";
import BackRoute from "@/common/BackRoute";
import InsightsAndTools from "../Homepage/InsightsAndTools";
import { generateSlug } from "@/utils/helpers";
import LocalityTrends from "./LocalityTrends";

interface ViewedProperty {
  id: string;
  name: string;
}

const PropertyDetailsComponent = ({
  property,
}: {
  property: PropertyStore;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname?.split("/");
  const activeTab = pathSegments?.[2];
  const [user, setUser] = useState<any>();
  const session = useSession();
  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);

  const city = pathSegments?.[3];

  const [showMore, setShowMore] = useState(false);

  const [newlyLaunchedProperties, setNewlyLaunchedProperties] = useState<
    PropertyStore[]
  >([]);
  const [nearbyLocations, setNearbyLocations] = useState<any>();
  const [locationDetails, setLocationDetails] = useState<any>();
  const [viewedProperties, setViewedProperties] = useState<ViewedProperty[]>(
    []
  );
  const [locationProperties, setLocationProperties] = useState<any>([]);

  const [loading, setLoading] = useState(false);
  const [OpenModal, setOpenModal] = useState(false);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const localityRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [activeSection, setActiveSection] = useState("overview");
  const [showScrollBar, setShowScrollBar] = useState(false);

  const scrollToSection = (id: string) => {
    const root = scrollContainerRef.current;
    const el = document.getElementById(id);
    if (!root || !el) return;

    const stickyHeight = 50;
    const offset = el.offsetTop - stickyHeight;

    root.scrollTo({ top: offset, behavior: "smooth" });
  };
  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    const onScroll = () => {
      setShowScrollBar(root.scrollTop > 50);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      {
        root,
        threshold: [0.4, 0.6, 0.8],
        rootMargin: "-60px 0px 0px 0px",
      }
    );

    [overviewRef, aboutRef, localityRef, featuresRef].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      root.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const propertyId = property?.propertyId;
    const propertyName = property?.propertyDetails?.propertyName;

    if (!propertyId || !propertyName) return;

    const key = "viewed_properties";

    const storedProperties: ViewedProperty[] = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    const propertyExists = storedProperties.some(
      (p) => String(p.id) === String(propertyId)
    );

    if (!propertyExists) {
      const updatedProperties: ViewedProperty[] = [
        ...storedProperties,
        { id: propertyId, name: propertyName },
      ];
      localStorage.setItem(key, JSON.stringify(updatedProperties));
      setViewedProperties(updatedProperties);
    }
  }, [property?.propertyId, property?.propertyDetails?.propertyName]);

  useEffect(() => {
    const fetchNewlyLaunchedProperties = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `${apiClient.URLS.property}/get-all-properties`
        );
        if (response?.status === 200) {
          setNewlyLaunchedProperties(response.body.data);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchNewlyLaunchedProperties();
  }, []);

  const getLabel = useCallback((key: string) => {
    const keyValues: { [key: string]: string } = {
      balcony: "Balcony",
      bathrooms: "Bathrooms",
      bedrooms: "Bedrooms",
      floorArea: "Floor Area",
      parking2w: "2 Wheeler Parking",
      parking4w: "4 Wheeler Parking",
      totalFloors: "Total Floors",
      currentFloor: "Current Floor",
      facing: "Facing",
      plotArea: "Plot Area",
      length: "Length",
      width: "Width",
      widthFacingRoad: "Width Facing Road",
      possessionStatus: "Possession Status",
      possessionDate: "Possession Date",
      transactionType: "Transaction Type",
      boundaryWall: "Boundary Wall",
      noOfFloorsAllowed: "No of Floors Allowed",
      suitableFor: "Suitable For",
      ownership: "Ownership",
      locationHub: "Location Hub",
      builtUpArea: "Built Up Area Sqft",
      twoWheelerParking: "2 Wheeler Parking",
      fourWheelerParking: "4 Wheeler Parking",
      staircases: "Staircases",
      passengerLifts: "Passenger Lifts",
      entranceAreaWidth: "Entrance Area Width",
      entranceAreaHeight: "Entrance Area Height",
      purpose: "Purpose",
      lookingType: "Looking For",
      ownerType: "Posted by",
      email: "Email",
      phone: "Phone",
      name: "Name",
      address: "Address",
      city: "City",
      state: "State",
      pinCode: "Pin Code",
      numberOfWashrooms: "Number of Washrooms",
      numberOfMeetingRooms: "Number of Meeting Rooms",
      numberOfCabins: "Number of Cabins",
      minSeats: "Min Seats",
      isNegotiable: "Negotiable",
      advanceAmount: "Advance Amount",
      securityDeposit: "Security Deposit",
      monthlyRent: "Monthly Rent",
      maxPriceOffer: "Max Price Offer",
      minPriceOffer: "Min Price Offer",
      maintenanceCharges: "Maintenance Charges",
      pricePerSqft: "Price Per Sqft",
      expectedPrice: "Expected Price",
      status: "Construction Status",
      propertyType: "Property Type",
      bhk: "BHK",
      buildupArea: "Buildup Area",
      furnitureType: "Furniture Type",
      flatFurnishings: "Flat Furnishings",
      ageOfProperty: "Age of Property",
      possessionBy: "Possession By",
      possessionYears: "Possession Years",
      constructionStatus: "Construction Status",
    };

    return keyValues[key];
  }, []);

  const getIcon = useCallback((key: string) => {
    const icons: { name: string; icon: JSX.Element }[] = [
      {
        name: "Dining Table",
        icon: <MdDining className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Washing Machine",
        icon: (
          <LocalLaundryService className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Sofa",
        icon: <Weekend className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Microwave",
        icon: (
          <Microwave className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Stove",
        icon: <Kitchen className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Fridge",
        icon: <Kitchen className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Water Purifier",
        icon: <Water className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Gas Pipeline",
        icon: <GasMeter className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "AC",
        icon: <AcUnit className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "TV",
        icon: <Tv className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Cupboard",
        icon: <KingBed className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Geyser",
        icon: (
          <Countertops className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },

      {
        name: "Bed",
        icon: <KingBed className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Mattress",
        icon: <Weekend className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Curtains",
        icon: <Window className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Chairs",
        icon: <Chair className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Ceiling Fan",
        icon: <FaFan className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Inverter/UPS",
        icon: (
          <ElectricalServices className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Kitchen Chimney",
        icon: (
          <SoupKitchen className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },

      {
        name: "Lift",
        icon: <House className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "CCTV",
        icon: (
          <CameraAlt className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Gym",
        icon: (
          <FitnessCenter className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Garden",
        icon: <Yard className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Swimming Pool",
        icon: <Pool className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Intercom",
        icon: <House className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Club House",
        icon: <LocalBar className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },

      {
        name: "Power Backup",
        icon: <Power className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Children Play Area",
        icon: (
          <ChildCare className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Community Hall",
        icon: (
          <MeetingRoom className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Security",
        icon: <Security className="text-[#3586FF] md:text-[36px] text-[22px]" />,
      },
      {
        name: "Parking",
        icon: (
          <LocalParking className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Rainwater Harvesting",
        icon: (
          <WaterDrop className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
      {
        name: "Fire Safety",
        icon: (
          <LocalFireDepartment className="text-[#3586FF] md:text-[36px] text-[22px]" />
        ),
      },
    ];

    return icons.find(
      (item) => item.name === key || item.name === getLabel(key)
    )?.icon;
  }, []);

  const overviewIcons = {
    balcony: <MdOutlineBalcony />,
    bathrooms: <MdBathroom />,
    bedrooms: <MdBedroomParent />,
    floorArea: <MdOutlineSquareFoot />,
    parking2w: <MdTwoWheeler />,
    parking4w: <MdOutlineDirectionsCar />,
    totalFloors: <MdLayers />,
    currentFloor: <MdVerticalAlignTop />,
    facing: <MdExplore />,
    plotArea: <MdCropSquare />,
    length: <MdStraighten />,
    width: <MdStraighten />,
    widthFacingRoad: <MdSwapHoriz />,
    possessionStatus: <MdDateRange />,
    possessionDate: <MdDateRange />,
    transactionType: <MdOutlineHandshake />,
    boundaryWall: <MdOutlineFence />,
    noOfFloorsAllowed: <MdLayers />,
    suitableFor: <MdOutlineBusiness />,
    ownership: <MdOutlinePerson />,
    locationHub: <MdOutlineLocationOn />,
    builtUpArea: <MdOutlineSquareFoot />,
    twoWheelerParking: <MdTwoWheeler />,
    fourWheelerParking: <MdOutlineDirectionsCar />,
    staircases: <MdOutlineStairs />,
    passengerLifts: <MdOutlineElevator />,
    entranceAreaWidth: <MdStraighten />,
    entranceAreaHeight: <MdStraighten />,
    purpose: <MdOutlineBusiness />,
    lookingType: <MdOutlineSearch />,
    ownerType: <MdOutlinePerson />,
    email: <MdOutlineEmail />,
    phone: <MdOutlinePhone />,
    name: <MdOutlinePerson />,
    address: <MdOutlineHomeWork />,
    city: <MdOutlineLocationOn />,
    state: <MdOutlineLocationOn />,
    pinCode: <MdOutlinePinDrop />,
    numberOfWashrooms: <MdBathroom />,
    numberOfMeetingRooms: <MdOutlineMeetingRoom />,
    numberOfCabins: <MdOutlineChair />,
    minSeats: <MdOutlinePeople />,
    isNegotiable: <MdOutlineEvent />,
    advanceAmount: <MdOutlineAttachMoney />,
    securityDeposit: <MdOutlineSecurity />,
    monthlyRent: <MdOutlineCurrencyRupee />,
    maxPriceOffer: <MdOutlinePriceChange />,
    minPriceOffer: <MdOutlinePriceChange />,
    maintenanceCharges: <MdOutlineAttachMoney />,
    pricePerSqft: <MdOutlineCurrencyRupee />,
    expectedPrice: <MdOutlineCurrencyRupee />,
    status: <MdOutlineBuild />,
    propertyType: <MdOutlineApartment />,
    bhk: <MdOutlineHomeWork />,
    buildupArea: <MdOutlineSquareFoot />,
    furnitureType: <MdOutlineWeekend />,
    flatFurnishings: <MdOutlineInventory />,
    ageOfProperty: <MdOutlineCalendarToday />,
    possessionBy: <MdOutlineDateRange />,
    possessionYears: <MdOutlineDateRange />,
    constructionStatus: <MdOutlineConstruction />,
  };

  const getNearByLocations = async () => {
    try {
      const lat = Number(property?.locationDetails?.latitude);
      const lng = Number(property?.locationDetails?.longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn("Nearby: missing/invalid coordinates", { lat, lng });
        const empty = { places: [], photos: [] };
        setNearbyLocations(empty);
        return empty;
      }

      const resp = await fetchNearbyLocations({
        latitude: lat,
        longitude: lng,
        radiusMeters: 5000,
        types: [
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
      });

      setNearbyLocations(resp); // { places, photos }
      return resp;
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
      const fallback = { places: [], photos: [] };
      setNearbyLocations(fallback);
      return fallback;
    }
  };

  const fetchLocationDetails = async () => {
    const placeId = property?.locationDetails?.place_id;
    if (!placeId) return;
    try {
      const data = await getLocationDetails(placeId);
      setLocationDetails(data ?? null);
    } catch (error) {
      console.log("Error fetching location details:", error);
    }
  };
  const formatValue = (value: any) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (value instanceof Date) return new Date(value).toLocaleDateString();
    if (
      typeof value === "object" &&
      value !== null &&
      "size" in value &&
      "unit" in value
    ) {
      return `${value.size} ${value.unit}`;
    }
    return String(value);
  };
  const isFurnished = (type?: furnitureTypesEnum): boolean => {
    return (
      type === furnitureTypesEnum.Furnished ||
      type === furnitureTypesEnum.SemiFurnished ||
      type === furnitureTypesEnum.Unfurnished
    );
  };

  useEffect(() => {
    getNearByLocations();
    if (property?.locationDetails?.place_id) fetchLocationDetails();
  }, [
    property?.locationDetails?.place_id,
    property?.locationDetails?.latitude,
    property?.locationDetails?.longitude,
  ]);

  useEffect(() => {
    const locality = property?.locationDetails?.locality;

    if (!locality) return;
    const fetchLocationProperties = async (locality: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("locality", locality);
        params.append("limit", "10");
        params.append("page", "1");

        const response = await apiClient.get(
          `${apiClient.URLS.property}/get-all-properties?${params.toString()}`
        );

        setLocationProperties(response.body);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationProperties(locality);
  }, [property?.locationDetails?.locality]);

  const handleShare = (property: PropertyStore) => {
    const propertyUrl = `${window.location.origin}/properties/${property.basicDetails?.lookingType}/${property.locationDetails?.city}/${property.propertyId}`;
    const location = `${property.locationDetails?.locality}, ${property.locationDetails?.city}`;
    const image = property.mediaDetails?.propertyImages[0] || "/fallback.jpg";
    const title = property.propertyDetails?.propertyName || "Property Listing";
    const bhk = property.propertyDetails?.residentialAttributes?.bhk || "N/A";
    const price =
      property.propertyDetails?.pricingDetails?.monthlyRent || "N/A";

    const shareText = `
    ${title}
    BHK: ${bhk}
    Price: ${price}
    Location: ${location}
    Image: ${image}`;
    if (navigator.share) {
      navigator
        .share({
          title: property.propertyDetails?.propertyName || "Property Listing",
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
  const {
    removeFromWishlist,
    addToWishlist,
    items: wishListItems,
  } = useWishlistStore();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  useEffect(() => {
    if (!property?.propertyId) return;

    const inWishlist = wishListItems?.some(
      (wItem) => wItem.property?.id === property.propertyId
    );
    setIsWishlisted(inWishlist);
  }, [wishListItems, property?.propertyId]);
  const handleWishlistToggle = async () => {
    if (!user?.id) {
      toast.error("Please login to manage wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        const wishlistItem = wishListItems.find(
          (wItem) => wItem.property?.id === property.propertyId
        );
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          toast.success("Removed from wishlist");
          setIsWishlisted(false);
        }
      } else {
        await addToWishlist(
          user?.id,
          "property",
          property.propertyId as string
        );
        toast.success("Added to wishlist");
        setIsWishlisted(true);
      }
    } catch (error) {
      toast.error("Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <SectionSkeleton type={"propertyDetailsPage"} />
      ) : (
        <div className="max-w-[1320px] mx-auto  py-4">
          <div className="mb-1">
            <BackRoute />
          </div>
          <div className="w-full mb-2 font-medium text-gray-900">
            <div className="flex flex-wrap  items-center md:text-[12px] text-[8px] ">
              <Link
                href="/properties"
                className="px-2 py-1 md:rounded-[10px] rounded-[4px] hover:bg-gray-100 transition"
              >
                Properties
              </Link>
              <span className="mx-0.5 text-gray-400">/</span>
              <Link
                href={`/properties/${getLookingTypePath(
                  property.basicDetails?.lookingType
                )}`}
                className="px-2 py-1 md:rounded-[10px] rounded-[4px] hover:bg-gray-100 transition"
              >
                {getLookingTypePath(property.basicDetails?.lookingType)}
              </Link>
              <span className="mx-0.5 text-gray-400">/</span>
              <Link
                href={`/properties/${getLookingTypePath(
                  property.basicDetails?.lookingType
                )}/${property.locationDetails?.city || ""}`}
                className="px-2 py-1 md:rounded-[10px] rounded-[4px] hover:bg-gray-100 transition"
              >
                {property.locationDetails?.city || ""}
              </Link>
              <span className="mx-0.5 text-gray-400">/</span>
              <span className="px-2 py-1 md:rounded-[10px]  rounded-[4px] bg-blue-50 text-[#3586FF] ">
                {property.propertyDetails?.propertyName || ""}
              </span>
            </div>
          </div>

          <div className="">
            <div className="flex flex-col lg:flex-row gap-6 relative">
              <div
                className="lg:w-2/3 h-screen overflow-auto relative"
                ref={scrollContainerRef}
              >
                {showScrollBar && (
                  <div className="sticky top-[10%] z-40 bg-white border-b shadow-md">
                    <div className="flex gap-6 px-4 py-2 min-w-max overflow-x-auto no-scrollbar">
                      {[
                        { id: "overview", label: "Overview" },
                        { id: "about", label: "About Property" },
                        { id: "locality", label: "About Locality" },
                        { id: "features", label: "Features" },
                      ].map(({ id, label }) => (
                        <Button
                          key={id}
                          onClick={() => scrollToSection(id)}
                          className={`font-medium text-sm whitespace-nowrap transition-all duration-200 ${activeSection === id
                            ? "text-[#3586FF] border-b-2 border-blue-600 pb-1"
                            : "text-gray-600 hover:text-[#3586FF]"
                            }`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center items-start gap-2 md:mb-6 mb-3">
                      <div>
                        <h1 className="md:text-xl sm:text-[16px] font-bold flex items-center gap-2">
                          {property.propertyDetails?.propertyName}
                          {property.propertyDetails?.constructionStatus
                            ?.status === ConstructionStatusEnum.NewLaunched && (
                              <span className="text-white bg-[#3586FF] md:text-xs text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                                New
                              </span>
                            )}
                        </h1>
                        <p className="text-gray-600 md:text-sm text-[12px] mt-1">
                          {property.basicDetails?.purpose ===
                            PurposeType.Residential &&
                            `${property.propertyDetails?.residentialAttributes?.bhk} ${property.propertyDetails?.propertyType} For ${property.basicDetails?.lookingType} in `}
                          <span className="font-medium text-gray-700">
                            {property.locationDetails?.locality}
                          </span>
                          , {property.locationDetails?.city}
                        </p>
                      </div>

                      <div className="text-[#3586FF] font-medium md:text-lg text-[12px] bg-blue-50 px-3 py-1.5 rounded-md shadow-sm">
                        {property.basicDetails?.lookingType ===
                          LookingType.Rent ||
                          property.basicDetails?.lookingType ===
                          LookingType.FlatShare
                          ? `₹${property.propertyDetails?.pricingDetails?.monthlyRent}/Month`
                          : `₹${property.propertyDetails?.pricingDetails?.expectedPrice}`}
                      </div>
                    </div>

                    <div className="relative w-full md:h-[360px] h-[160px] rounded-xl overflow-hidden shadow-md group">
                      <ImageSlider
                        images={property?.mediaDetails?.propertyImages || []}
                      />

                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                          onClick={handleWishlistToggle}
                          disabled={wishlistLoading}
                          className={`cursor-pointer bg-white/90 backdrop-blur-sm transition-all font-medium duration-200 md:text-[14px] text-[10px] rounded-lg shadow-md flex gap-1 md:px-3 px-2 py-1.5 items-center ${isWishlisted
                            ? "text-red-500 hover:bg-red-50"
                            : "text-[#3586FF] hover:bg-blue-50"
                            }`}
                        >
                          <CiBookmark className="md:text-[16px] text-[14px]" />
                          {isWishlisted ? "Saved" : "Save "}
                        </Button>

                        <Button
                          onClick={() => handleShare(property)}
                          className="cursor-pointer bg-white/90 backdrop-blur-sm font-medium hover:bg-white transition-all duration-200 md:text-[14px] text-[10px] text-[#3586FF] rounded-lg shadow-md flex gap-1 md:px-3 px-2 py-1.5 items-center"
                        >
                          <PiShareFat className="md:text-[16px] text-[14px]" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <div
                      className="mt-4 sm:mt-6"
                      id="overview"
                      ref={overviewRef}
                    >
                      <h2 className="md:text-[16px] text-[#3586FF]   text-[14px] font-bold mb-3">
                        Overview
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:gap-3 gap-2">
                        {property.basicDetails?.purpose ===
                          PurposeType.Residential
                          ? property.basicDetails.lookingType ===
                            LookingType.Sell &&
                            (property.propertyDetails?.propertyType ===
                              propertyTypeEnum.Plot ||
                              property.propertyDetails?.propertyType ===
                              propertyTypeEnum.AgriculturalLand)
                            ? Object.entries(
                              property.propertyDetails?.plotAttributes || {}
                            ).map(([key, value]) => {
                              if (
                                key === "id" ||
                                value === null ||
                                value === undefined
                              )
                                return null;
                              return (
                                <div
                                  key={key}
                                  className="border-l-4 border-l-[#3586FF] border shadow-custom bg-white  rounded-lg p-1 md:p-3 "
                                >
                                  <div className="flex items-center md:gap-3 gap-1">
                                    <div className="bg-blue-100 text-[#3586FF] md:w-10 w-5 h-5 md:h-10 flex items-center justify-center md:rounded-full rounded-full md:text-lg text-[12px]">
                                      {
                                        overviewIcons[
                                        key as keyof typeof overviewIcons
                                        ]
                                      }
                                    </div>
                                    <div>
                                      <p className=" md:text-sm text-[12px] text-nowrap text-[#3586FF]">
                                        {getLabel(key)}
                                      </p>
                                      <p className="md:text-sm text-[12px] mt-1 font-medium">
                                        {formatValue(value)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                            : Object.entries(
                              property.propertyDetails
                                ?.residentialAttributes || {}
                            ).map(([key, value]) => {
                              if (
                                key === "id" ||
                                value === null ||
                                value === undefined
                              )
                                return null;
                              return (
                                <div
                                  key={key}
                                  className="border-l-4 border-l-[#3586FF] bg-white border shadow-custom  rounded-lg md:p-3 p-1 "
                                >
                                  <div className="flex items-center md:gap-3 gap-1">
                                    <div className="bg-blue-100 text-[#3586FF] md:w-10 w-5 h-5 md:h-10 flex items-center justify-center md:rounded-full rounded-full md:text-lg text-[12px]">
                                      {
                                        overviewIcons[
                                        key as keyof typeof overviewIcons
                                        ]
                                      }
                                    </div>
                                    <div>
                                      <p className=" md:text-sm text-[10px] text-nowrap text-[#3586FF]">
                                        {getLabel(key)}
                                      </p>
                                      <p className="md:text-sm text-[12px] mt-1 font-medium">
                                        {formatValue(value)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          : Object.entries(
                            property.propertyDetails?.commercialAttributes ||
                            {}
                          ).map(([key, value]) => {
                            if (
                              key === "id" ||
                              value === null ||
                              value === undefined
                            )
                              return null;
                            return (
                              <div
                                key={key}
                                className="bg-white border-l-4 border-l-[#3586FF] border shadow-custom  rounded-lg md:p-3 p-1 "
                              >
                                <div className="flex items-center md:gap-3 gap-1">
                                  <div className="bg-blue-100 text-[#3586FF] md:w-10 w-5 h-5 md:h-10 flex items-center justify-center md:rounded-full rounded-full md:text-lg text-[12px]">
                                    {
                                      overviewIcons[
                                      key as keyof typeof overviewIcons
                                      ]
                                    }
                                  </div>
                                  <div>
                                    <p className=" md:text-sm text-[12px] text-nowrap text-[#3586FF]">
                                      {getLabel(key)}
                                    </p>
                                    <p className="md:text-sm text-[12px] mt-1 font-medium">
                                      {formatValue(value)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 ">
                    <Button
                      className="w-full font-medium sm:w-auto bg-[#3586FF] hover:bg-[#3586FF] btn-text  text-white px-6 md:py-2 py-1 rounded-lg transition-colors"
                      onClick={() => {
                        setOpenModal(true);
                      }}
                    >
                      Contact Now
                    </Button>
                  </div>
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
                      <ContactSellerForm
                        propertyId={property.propertyId as string}
                        project={false}
                      />
                    </div>
                  </Modal>
                )}

                {/* About Section */}
                <div
                  className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-6"
                  id="about"
                  ref={aboutRef}
                >
                  <h2 className="md:text-[16px] text-[#3586FF]   text-[14px] font-bold md:mb-4 mb-2">
                    About this property
                  </h2>
                  {property.propertyDetails?.description && (
                    <div className="font-regular  leading-relaxed  md:text-[14px] text-[10px]">
                      {property.propertyDetails.description.split(" ").length >
                        30 ? (
                        showMore ? (
                          <>
                            <p>{property.propertyDetails.description}</p>
                            <button
                              className="text-[#3586FF] hover:text-[#3586FF] mt-2"
                              onClick={() => setShowMore(false)}
                            >
                              Show less
                            </button>
                          </>
                        ) : (
                          <>
                            <p>
                              {property.propertyDetails.description
                                .split(" ")
                                .slice(0, 30)
                                .join(" ")}
                              ...
                            </p>
                            <Button
                              className="text-[#3586FF] hover:text-[#3586FF] mt-2"
                              onClick={() => setShowMore(true)}
                            >
                              Show more
                            </Button>
                          </>
                        )
                      ) : (
                        <p>{property.propertyDetails.description}</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2 md:mt-4 items-center justify-center font-medium">
                    <Button
                      className="cursor-pointer  bg-[#3586FF] md:text-[16px] text-[10px] text-white md:rounded-[10px] rounded-[4px] flex gap-1 md:px-4 px-2  py-1 md:py-2 items-center "
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                    >
                      <MdBookmark />
                      Save
                    </Button>

                    <Button
                      onClick={() => handleShare(property)}
                      className="cursor-pointer  bg-[#3586FF] md:text-[16px] text-[10px] text-white md:rounded-[10px] rounded-[4px] flex gap-1 md:px-4 px-2  py-1 md:py-2 items-center "
                    >
                      <PiShareFat className="" />
                      Share
                    </Button>
                  </div>
                  <h3 className="md:text-[16px] text-[#3586FF]   text-[14px] font-bold mb-2 md:mb-4 mt-1">
                    Explore neighbourhood - Map view
                  </h3>
                  <MapView
                    lat={Number(property.locationDetails?.latitude)}
                    lng={Number(property.locationDetails?.longitude)}
                  />
                  <div
                    className="w-full mt-6 md:mt-9 md:mb-10 mb-7 flex flex-col md:gap-4 gap-2"
                    id="locality"
                    ref={localityRef}
                  >
                    <h3 className="md:text-[16px] text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2">
                      Locality details
                    </h3>
                    <p className="font-medium md:text-[12px] text-[10px]">
                      {locationDetails?.description}
                    </p>
                    <Slider {...sliderSettings} className="max-h-[250px]">
                      {nearbyLocations?.photos.map(
                        (item: any, index: number) => (
                          <div
                            className="px-2 lg:px-[13px] flex pb-1 rounded-[8px] "
                            key={index}
                          >
                            <div className="max-w-[240px]  flex flex-col items-center bg-white md:gap-3 gap-1 md:p-3  p-1 shadow-md rounded-[8px]">
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
                <div>
                  {property?.locationDetails?.locality && property?.locationDetails?.city && (
                    <div className="mt-8 md:mt-10 max-w-[1320px]">
                      <LocalityTrends
                        locality={property.locationDetails?.locality}
                        city={property.locationDetails?.city || ""}
                        subLocality={property?.locationDetails?.subLocality || undefined}
                      />
                    </div>
                  )}
                </div>

                <div
                  className="md:mt-6 mt-3 w-full md:rounded-[10px] rounded-[4px] bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-400 shadow-md md:p-6 p-3"
                  id="features"
                  ref={featuresRef}
                >
                  <h2 className="flex items-center gap-2 font-bold text-[#3586FF] text-[14px] md:text-[16px] mb-2 md:mb-4">
                    {property.basicDetails?.purpose === PurposeType.Residential
                      ? "Features"
                      : "Facilities"}
                  </h2>

                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                    {property.basicDetails?.purpose ===
                      PurposeType.Residential ? (
                      <>
                        {isFurnished(
                          property.propertyDetails?.furnishing?.furnishedType
                        ) &&
                          property.propertyDetails?.furnishing?.furnishings?.map(
                            (item) => (
                              <div
                                key={item}
                                className="flex items-center gap-1 md:gap-3 md:p-3 p-1 bg-white md:rounded-[10px] rounded-[4px] shadow-custom hover:shadow-md hover:bg-blue-50 transition-all duration-200"
                              >
                                <div className="flex-shrink-0">
                                  {getIcon(item)}
                                </div>
                                <span className="md:text-sm text-[10px] text-gray-800 md:font-medium font-regular">
                                  {item}
                                </span>
                              </div>
                            )
                          )}

                        {property.propertyDetails?.furnishing?.amenities?.map(
                          (item) => (
                            <div
                              key={item}
                              className="flex items-center gap-1 md:gap-3 md:p-3 p-1 bg-white md:rounded-[10px] rounded-[4px] shadow-custom hover:shadow-md hover:bg-blue-50 transition-all duration-200"
                            >
                              <div className="flex-shrink-0">
                                {getIcon(item)}
                              </div>
                              <span className="md:text-sm text-[10px] text-gray-800 md:font-medium">
                                {item}
                              </span>
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      Object.entries(
                        property.propertyDetails?.facilities || {}
                      ).map(([key, value]) => {
                        if (
                          key === "id" ||
                          value === null ||
                          value === undefined
                        )
                          return null;
                        return (
                          <div
                            key={key}
                            className="flex items-start gap-2 md:gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-blue-50 transition-all duration-200"
                          >
                            <div className="flex-shrink-0">{getIcon(key)}</div>
                            <div>
                              <p className="md:text-sm text-[12px] font-medium text-gray-900">
                                {getLabel(key)}
                              </p>
                              <p className="md:text-xs text-[10px] text-gray-500">
                                {typeof value === "boolean"
                                  ? value
                                    ? "Yes"
                                    : "No"
                                  : value}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column - Contact Form */}
              <div className="sticky hidden md:block right-4 w-full space-y-2 md:max-w-[390px] max-w-[300px]">
                <ContactSellerForm
                  propertyId={property.propertyId as string}
                  project={false}
                />
                <div>
                  <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md border border-blue-100 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[12px] md:text-[13px] text-gray-800 mb-1">
                        Looking for more options?
                      </h3>
                      <p className="text-[11px] md:text-[12px] text-gray-600">
                        Discover similar properties in{" "}
                        {property.locationDetails?.locality}.
                      </p>
                      <Button
                        onClick={() =>
                          document
                            .getElementById("more-properties-section")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="mt-2 text-[10px] md:text-[12px] bg-[#3586FF] text-white px-3 py-1.5 rounded-lg shadow hover:bg-[#3586FF]transition"
                      >
                        View Similar Properties
                      </Button>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
                        <Search className="h-6 w-6 text-[#3586FF]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed bottom-0  left-0 w-full bg-white shadow-md border-t pb-1 px-4 z-50 md:hidden block ">
              <div className="  w-full mx-auto  p-2 gap-2 flex items-center ">
                <Button
                  className="bg-[#3586FF] font-medium md:px-5 px-2 md:py-3 py-1.5  text-[12px] rounded-[4px] text-white  w-full flex items-center justify-center gap-2"
                  onClick={() => handleShare(property)}
                >
                  <PiShareFat className="md:w-5 w-4 md:h-5 h-4" />
                  Share
                </Button>
                <Button
                  className="bg-[#3586FF] font-medium md:px-5 px-2 md:py-3 py-1.5 md:text-[16px] text-[12px] rounded-[4px] text-white  w-full flex items-center justify-center gap-2"
                  onClick={() => setOpenModal(true)}
                >
                  <FiPhoneCall className="md:w-5 w-4 md:h-5 h-4" />
                  Contact Now
                </Button>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              {/* <HelpYouDecide /> */}

              <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-[4px] md:rounded-[10px] shadow-custom border border-gray-100 p-4 sm:p-6">
                <h2 className="text-[14px] md:text-[16px] font-bold  text-[#3586FF] mb-2 md:mb-4">
                  Newly launched projects
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-5 gap-3">
                  {newlyLaunchedProperties
                    .slice(4, 8)
                    .map((newProperty, index) => {
                      if (!newProperty) return;
                      return (
                        <div
                          className="p-2 md:p-4  border shadow-md border-[#DBDBDB] rounded-md"
                          key={newProperty.propertyId}
                        >
                          <div className="md:h-[147px] h-[75px] w-full relative md:mb-4 mb-2 overflow-hidden">
                            <Image
                              src={
                                newProperty.mediaDetails?.propertyImages[0] ||
                                "/orders/no-orders.jpeg"
                              }
                              alt={
                                newProperty.propertyDetails?.propertyName ?? ""
                              }
                              layout="fill"
                              className="object-cover md:rounded-[10px] rounded-[4px]"
                              sizes="(max-width: 640px) 130px, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                            />
                            <p className=" absolute top-1 left-1  bg-[#3586FF] text-white md:text-[12px] text-[10px] px-4 md:py-[4px] py-[4px] rounded-md font-medium">
                              {newProperty?.basicDetails?.lookingType}
                            </p>
                          </div>
                          <h3 className="font-medium md:text-[14px] text-[12px] md:leading-[18.5px] leading-[14.8px] text-gray-700 md:text-nowrap text-wrap">
                            {newProperty.propertyDetails?.propertyName}
                          </h3>

                          <div className="flex items-center gap-1">
                            <CiLocationOn className="md:text-[12px] text-[10px] text-gray-700" />{" "}
                            <p className="text-gray-500 md:text-[14px] text-[10px] text-nowrap">
                              {newProperty.locationDetails?.locality},{" "}
                              {newProperty.locationDetails?.city}
                            </p>
                          </div>
                          <div className="border border-[#E9E9E9] md:my-2 my-1"></div>
                          <div className="grid  grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 md:gap-y-4 gap-y-1 lg:gap-x-4 md:gap-x-3 gap-x-1">
                            <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-0.5  ">
                              <BiRupee className=" md:text-[12px] text-[10px]" />
                              <span className="text-[#3586FF] text-nowrap md:text-[12px] text-[10px]">
                                {newProperty.basicDetails?.lookingType ===
                                  LookingType.Rent ||
                                  newProperty.basicDetails?.lookingType ===
                                  LookingType.FlatShare
                                  ? `${newProperty.propertyDetails?.pricingDetails?.monthlyRent?.toLocaleString()}/month`
                                  : `${newProperty.propertyDetails?.pricingDetails?.expectedPrice?.toLocaleString()}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                              <MdOutlineApartment className=" md:text-[12px] text-[10px]" />
                              <span className="text-[#3586FF] md:text-[12px]  text-[10px] md:text-nowrap text-wrap">
                                {newProperty?.propertyDetails?.propertyType}
                              </span>
                            </div>
                          </div>
                          <Button
                            className="block w-full rounded-md text-center md:py-1 md:text-[14px]   text-[12px]  py-[2px] bg-[#3586FF] font-medium md:leading-[22.8px] leading-[18.52px] text-white md:mt-3 mt-2"
                            onClick={() => {
                              const slug = generateSlug(
                                newProperty.propertyDetails?.propertyName!
                              );
                              const lookingTypePath = getLookingTypePath(
                                newProperty?.basicDetails?.lookingType
                              );
                              router.push(
                                `/properties/${lookingTypePath}/${newProperty?.locationDetails?.city}/details/${slug}?id=${newProperty.propertyId}&type=property`
                              );
                            }}
                          >
                            View Property
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            {locationProperties?.data?.length > 0 && (
              <div className="space-y-2 md:space-y-4">
                <div
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6"
                  id="more-properties-section"
                >
                  <h2 className="text-[14px] md:text-[16px] font-bold  text-[#3586FF] mb-2 md:mb-4">
                    More Properties on {property.locationDetails?.locality}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-5 gap-3">
                    {locationProperties?.data
                      ?.slice(0, 4)
                      .map((newProperty: any, index: number) => {
                        if (!newProperty) return;
                        return (
                          <div
                            className="p-2 md:p-4  border shadow-md border-[#DBDBDB] rounded-md"
                            key={newProperty.propertyId}
                          >
                            <div className="md:h-[147px] h-[75px] w-full relative md:mb-4 mb-2 overflow-hidden">
                              <Image
                                src={
                                  newProperty.mediaDetails?.propertyImages[0] ||
                                  "/orders/no-orders.jpeg"
                                }
                                alt={
                                  newProperty.propertyDetails?.propertyName ??
                                  ""
                                }
                                layout="fill"
                                className="object-cover md:rounded-[10px] rounded-[4px]"
                                sizes="(max-width: 640px) 130px, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 30vw"
                              />
                              <p className=" absolute top-1 left-1  bg-[#3586FF] text-white md:text-[12px] text-[10px] px-4 md:py-[4px] py-[4px] rounded-md font-medium">
                                {newProperty?.basicDetails?.lookingType}
                              </p>
                            </div>
                            <h3 className="font-medium md:text-[14px] text-[12px] md:leading-[18.5px] leading-[14.8px] text-gray-700 md:text-nowrap text-wrap">
                              {newProperty?.propertyDetails?.propertyName}
                            </h3>

                            <div className="flex items-center gap-1">
                              <CiLocationOn className="md:text-[12px] text-[10px] text-gray-700" />{" "}
                              <p className="text-gray-500 md:text-[14px] text-[10px] text-nowrap">
                                {newProperty?.locationDetails?.locality},{" "}
                                {newProperty?.locationDetails?.city}
                              </p>
                            </div>
                            <div className="border border-[#E9E9E9] md:my-2 my-1"></div>
                            <div className="grid  grid-cols-1 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 md:gap-y-4 gap-y-1 lg:gap-x-4 md:gap-x-3 gap-x-1">
                              <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-0.5  ">
                                <BiRupee className=" md:text-[12px] text-[10px]" />
                                <span className="text-[#3586FF] text-nowrap md:text-[12px] text-[10px]">
                                  {newProperty.basicDetails?.lookingType ===
                                    LookingType.Rent ||
                                    newProperty.basicDetails?.lookingType ===
                                    LookingType.FlatShare
                                    ? `${newProperty.propertyDetails?.pricingDetails?.monthlyRent?.toLocaleString()}/month`
                                    : `${newProperty.propertyDetails?.pricingDetails?.expectedPrice?.toLocaleString()}`}
                                </span>
                              </div>
                              <div className="flex items-center justify-start gap-1.5 md:gap-2.5 lg:gap-1.5">
                                <MdOutlineApartment className=" md:text-[12px] text-[10px]" />
                                <span className="text-[#3586FF] md:text-[12px]  text-[10px] md:text-nowrap text-wrap">
                                  {newProperty?.propertyDetails?.propertyType}
                                </span>
                              </div>
                            </div>
                            <Button
                              className="block w-full rounded-md text-center md:py-1 md:text-[14px]   text-[12px]  py-[2px] bg-[#3586FF] font-medium md:leading-[22.8px] leading-[18.52px] text-white md:mt-3 mt-2"
                              onClick={() => {
                                const slug = generateSlug(
                                  newProperty.propertyDetails?.propertyName!
                                );
                                const lookingTypePath = getLookingTypePath(
                                  newProperty?.basicDetails?.lookingType
                                );
                                router.push(
                                  `/properties/${lookingTypePath}/${newProperty?.locationDetails?.city}/details/${slug}?id=${newProperty.propertyId}&type=property`
                                );
                              }}
                            >
                              View Property
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            <InsightsAndTools />
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetailsComponent;
