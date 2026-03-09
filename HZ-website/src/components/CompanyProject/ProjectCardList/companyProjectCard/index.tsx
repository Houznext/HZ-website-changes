import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Bike,
  Car,
  ChevronLeft,
  ChevronRight,
  MoveRight,
  Ruler,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { ShieldCheck } from "lucide-react";
import { FiShield } from "react-icons/fi";
import { CiBookmark, CiMapPin, CiMaximize2 } from "react-icons/ci";
import Button from "@/common/Button";
import Modal from "@/common/Modal";
import ContactSellerForm from "@/components/PropertyDetailsComponent/ContactSellerForm";
import { PiShareFat } from "react-icons/pi";
import toast from "react-hot-toast";
import { getPropertyIcon } from "@/components/PropertiesListComponent/SingleProperty/helper";
import { Directions, Home } from "@mui/icons-material";
import { AreaIcon } from "@/components/Products/icons";
import { LuBike } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";

import { generateSlug } from "@/utils/helpers";
import { useSession } from "next-auth/react";
import { iconMap } from "@/components/PropertiesListComponent/SingleProperty/helper";

interface PropertyCardProps {
  data: any;
  isCompared?: boolean;
  onToggleCompare?: () => void;
  compareDisabled?: boolean;
}

export const CompanyProjectCard = ({
  data,
  isCompared,
  onToggleCompare,
  compareDisabled,
}: PropertyCardProps) => {
  const images = data?.mediaDetails?.propertyImages || [];

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedImage, setSelectedImage] = useState<string>(
    "/orders/no-orders.jpeg",
  );
  const [OpenModal, setOpenModal] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const session = useSession();
  const ref = useRef(null);
  const pathname = usePathname();
  const pathSegments = pathname?.split("/");
  const activeTab = pathSegments?.[2];
  const city = pathSegments?.[3];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setSelectedImage(images[(currentIndex + 1) % images.length]);
  };
  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
    setSelectedImage(
      images[(currentIndex - 1 + images.length) % images.length],
    );
  };
  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);
  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);

  const launchDate = new Date(data?.constructionStatus?.launchedDate);
  const currentDate = new Date();
  const diffInMs = currentDate.getTime() - launchDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  const isNewlyLaunched = diffInDays <= 60 && diffInDays >= 0;

  const handleRoute = () => {
    const slug = generateSlug(data?.name);
    router.push(
      `/properties/${activeTab}/${city}/details/${slug}?id=${data?.id}&type=project`,
    );
    if (user) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "View_property",
        item_id: data.id,
        propertyname: data.company?.name || null,
        BHK: unit?.BHK,
        location: data?.location?.locality || null,
        city: data?.location?.city,
        customuserid: user.id,
        username: `${user?.firstName} ${user?.lastName}`,
        userEmail: user.email,
        phone: user.phone,
      });
    }
  };

  const handleShare = (project: any) => {
    const propertyUrl = `${window.location.origin}/projects/${project?.id}`;
    const location = `${project?.location?.locality || "N/A"}, ${
      project?.location?.city || "N/A"
    }`;
    const image = project?.mediaDetails?.propertyImages?.[0] || "/fallback.jpg";
    const title = project?.name || project?.company?.name || "OneCasa Project";
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

  const unit = data?.units?.[0];
  const flooring = unit?.flooringPlans?.[0];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: "Property_Impression",
              item_id: data.id,
              propertyname: data.company?.name || null,
              BHK: unit?.BHK,
              location: data?.location?.locality || null,
              city: data?.location?.city,
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

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
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const firstValidType = data?.promotionType?.find(
    (type: string) => iconMap[capitalize(type.trim())],
  );

  const borderClass = firstValidType
    ? iconMap[capitalize(firstValidType.trim())].border
    : "border-gray-200";
  const getUniqueUnitsByBHK = (units: any[]) => {
    const seen = new Set();
    return units.filter((unit) => {
      if (!unit.BHK || seen.has(unit.BHK)) return false;
      seen.add(unit.BHK);
      return true;
    });
  };

  return (
    <div
      className={`relative cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-lg duration-300 flex md:max-w-[90%]  md:!max-h-[270px] max-w-full  flex-col rounded-tl-[15px] rounded-[10px] border-[1px] gap-x-2 ${borderClass} shadow-sm md:p-2 p-0`}
      onClick={handleRoute}
    >
      <div className="flex flex-row md:items-start items-stretch">
        {/* Left - Image Carousel */}
        <div className="md:w-[320px] w-[45%] md:px-4 md:py-2 px-2 py-2">
          <div className="relative w-full h-full min-h-[150px] md:h-[130px] overflow-hidden flex justify-center items-center rounded-lg">
            <Button
              className="z-10 absolute bg-white md:left-2 left-3 top-1/2 transform -translate-y-1/2  rounded-full md:w-10 w-6 md:h-10 h-6  md:translate-x-0 -translate-x-1/2 flex items-center justify-center shadow-md"
              onClick={(e) => {
    e.stopPropagation();
    handlePrev();
  }}
            >
              <ChevronLeft className="md:w-[24px] md:h-[24px] w-[12px] h-[12px] " />
            </Button>
            <Image
              src={selectedImage}
              alt="Property"
              className="w-full rounded-lg overflow-hidden transition-all duration-200 ease-in-out object-cover"
              fill
              sizes="75vw"
            />
            <Image
              src="/images/logo.png"
              alt="OneCasa Logo"
              width={60}
              height={40}
              className="absolute  opacity-60 mix-blend-multiply"
            />
            <p className="text-[24px] text-white opacity-50 font-medium  absolute top-[84%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              OneCasa
            </p>

            <Button
              className="absolute bg-white md:right-2 -right-1 top-1/2 transform -translate-y-1/2 rounded-full md:w-10 w-6 md:h-10 h-6 flex items-center justify-center shadow-md"
              onClick={(e) => {
    e.stopPropagation();
    handleNext();
  }}
            >
              <ChevronRight className="md:w-[24px] md:h-[24px] w-[12px] h-[12px] " />
            </Button>
            <div className="flex  md:flex-row flex-col items-center md:gap-1  gap-0.5 absolute bottom-2 left-2 ">
              {data?.company?.RERAId && (
                <div className="z-30 bg-black inline-flex items-center gap-2 md:rounded-[6px] rounded-[4px] px-2 py-1 text-[6px] font-regular">
                  <ShieldCheck className="text-white" size={12} />
                  <span className="text-transparent bg-gradient-to-r from-white to-yellow-500 bg-clip-text">
                    RERA
                  </span>
                </div>
              )}
              {data?.isBrokerage === false && (
                <div className="z-30 bg-black inline-flex items-center gap-2 md:rounded-[6px] rounded-[4px] px-2 py-1.5 text-[6px] uppercase font-regular">
                  <span className="text-transparent bg-gradient-to-r from-white via-yellow-400 to-yellow-500 bg-clip-text">
                    Zero Brokerage
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex justify-center mt-4 gap-2 overflow-x-auto">
            {images.slice(0, 3).map((image: string, index: number) => (
              <div key={index} className="relative w-16 h-14 flex-shrink-0">
                <Image
                  src={image}
                  alt={`Property ${index + 1}`}
                  className={`absolute object - cover cursor - pointer rounded - lg transition - all duration - 100 ease -in -out ${
                    selectedImage === image
                      ? "border-2 border-[#3586FF]"
                      : "border-2 border-transparent"
                  } `}
                  fill
                  sizes="70vw"
                  onClick={() => {
                    setSelectedImage(image);
                    setCurrentIndex(index);
                  }}
                />

                <Image
                  src="/images/logo.png"
                  alt="OneCasa Logo"
                  width={30}
                  height={30}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-multiply"
                />
                <p className="text-[10px] text-white opacity-40 font-medium  absolute top-[84%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  OneCasa
                </p>
              </div>
            ))}
          </div>
        </div>
        {data?.constructionStatus?.status === "Newly Launched" &&
          isNewlyLaunched && (
            <div className="absolute bottom-2 left-2 z-30 bg-black font-regular text-white  md:rounded-[6px] rounded-[4px] px-2 py-1 text-[10px]">
              {"Newly Launched".toUpperCase()}
            </div>
          )}

        <div className="absolute md:top-0 top-0 left-0 flex flex-row gap-2 z-10">
          {data?.promotionType?.map((type: string) => {
            const formattedType = capitalize(type.trim());

            const badgeConfig = iconMap[formattedType] || {
              icon: null,
              style: "bg-white/90 border-gray-300 text-gray-800",
            };

            return (
              <div
                key={type}
                className={`
                      inline-flex items-center
                      md:px-3 px-1 md:py-[4px] py-[3px]
                     rounded-tl-[15px] rounded-tr-[2px] rounded-bl-[1px] rounded-br-[10px]
                      md:text-[12px] text-[10px]
                      font-medium 
                      border
                      shadow-md
                      backdrop-blur-md
                      ${badgeConfig.style}
                    `}
              >
                {badgeConfig.icon}
                <span className="whitespace-nowrap">{formattedType}</span>
              </div>
            );
          })}
        </div>
        {onToggleCompare && (
          <input
            type="checkbox"
              onClick={(e) => e.stopPropagation()}
            checked={isCompared}
            disabled={compareDisabled && !isCompared}
            onChange={onToggleCompare}
            className={twMerge(
              "absolute md:top-2 top-1 right-2 z-10 md:h-4 h-3 md:w-4 w-3 cursor-pointer rounded border-gray-600 text-[#3586FF] focus:ring-[#3586FF]",
              compareDisabled && !isCompared
                ? "opacity-50 cursor-not-allowed"
                : "",
            )}
            title={isCompared ? "Remove from Compare" : "Add to Compare"}
          />
        )}

        {/* Center - Details */}
        <div className="flex flex-col mt-3 md:mt-0  md:px-4 md:py-2 px-2 py-2 md:gap-2 gap-1 w-[50%] md:w-full ">
          <div className="md:mb-1 mb-2">
            <div className="flex justify-between items-start md:mb-2 mb-2 w-[100%]">
              <div className="md:space-y-2 space-y-1 w-full">
                <div className="flex md:items-center items-start md:gap-2 gap-1 md:flex-row flex-col">
                  <div className="flex  items-center  md:gap-2 gap-0.5">
                    {getPropertyIcon(data?.propertyType || "Apartment")}
                    <span className="md:font-bold font-medium md:text-[16px] text-[10px] leading-tight md:text-nowrap break-words">
                      {data?.name}
                    </span>
                  </div>

                  <span className="md:block hidden bg-[#e7d534] text-white md:text-[14px] text-[10px] md:px-2 px-1 md:py-[4px] py-[2px] rounded-md font-medium mt-1 md:mt-0">
                    {data?.propertyType}
                  </span>
                </div>
                <div className="md:text-[14px] text-[8px] font-medium w-full">
                  {Array.from(
                    new Set(
                      data?.units
                        .map((unit: any) => unit.BHK)
                        .filter((bhk: any) => bhk !== ""),
                    ),
                  ).join(", ")}{" "}
                  Flats in
                  {data?.location?.locality}, {data?.location?.city}
                </div>
              </div>
              <div className="flex gap-2">
                <CiBookmark className="md:text-2xl text-[14px] cursor-pointer" />
                <Button
                  onClick={(e) => {
    e.stopPropagation();
     handleShare(data)}}
                  className="cursor-pointer  focus:scale-105"
                >
                  <PiShareFat className="md:text-2xl text-[14px] hover:bg-gray-200 hover:rounded-lg" />
                </Button>
              </div>
            </div>
          </div>
          {data?.units?.length > 0 && (
            <div className="flex overflow-x-auto md:gap-4 gap-2 md:text-[14px] text-[10px] font-medium">
              {getUniqueUnitsByBHK(data.units).map(
                (unit: any, index: number) => (
                  <div key={unit.id} className="flex items-start gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-black md:text-[12px] text-[8px]">
                        {unit?.BHK}
                      </span>
                      {unit.flooringPlans?.map((plan: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-gray-600 md:text-[14px] text-[10px]"
                        >
                          ₹{formatPrice(plan?.TotalPrice)}
                        </span>
                      ))}
                    </div>

                    {index < getUniqueUnitsByBHK(data.units).length - 1 && (
                      <div className="w-[1px] bg-gray-400 h-full mx-2"></div>
                    )}
                  </div>
                ),
              )}
            </div>
          )}

          <div className="bg-gray-100 rounded-lg flex flex-wrap md:px-4 md:py-2 px-2 py-2 md:gap-4 gap-3   w-full ">
            <div className="text-gray-700  font-medium flex flex-wrap gap-x-2 gap-y-1   md:text-[12px] text-[10px] ">
              <span className="text-black">Avg. Price: </span>
              <p className="text-gray-700">
                ₹
                {((data?.minPrice + data?.maxPrice) / 2).toLocaleString(
                  "en-IN",
                )}
              </p>
              <span>•</span>
              <span className="text-black">Sizes: </span>
              <p>
                {data?.minSize?.size} {data?.minSize?.unit}-
                {data?.maxSize?.size} {data?.maxSize?.unit}
              </p>
              <span>•</span>
            </div>
          </div>
          <div className="h-[1px] w-full bg-gray-300 hidden md:block"></div>
          <div className="md:flex hidden items-center justify-between  w-full ">
            <div
              className="flex items-center md:gap-2 gap-1 cursor-pointer"
              onClick={() => {
                const name = generateSlug(data?.company?.name);
                router.push(`/company/${name}?id=${data?.company?.id}`);
              }}
            >
              <div className="relative md:w-[50px] md:h-[50px] w-[25px] h-[25px] ">
                <Image
                  src={data?.company?.logo?.[0] || "/images/logoimage.png"}
                  alt="Company logo"
                  fill
                  className="absolute object-cover md:rounded-[10px] rounded-[4px]"
                />
              </div>
              <div className="md:text-[14px] text-[10px]  font-medium text-gray-600">
                {data?.company?.name}
              </div>
            </div>
            <div className="flex  md:gap-2 gap-1 md:px-0 px-2">
              <Button
                className="md:px-4 px-2   text-nowrap  md:py-1 py-[2px] text-[10px] md:text-[12px] bg-[#3586FF] text-white font-medium  rounded-lg hover:bg-[#3586FF]transition-colors"
                onClick={handleRoute}
              >
                View Property
              </Button>
              <Button
                className="md:px-4 px-2 md:py-1 py-[2px] text-nowrap text-[10px] md:text-[12px] text-[#3586FF] border font-medium border-[#3586FF] rounded-lg text-center hover:bg-blue-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal(true);
                }}
              >
                Contact Owner
              </Button>
            </div>
          </div>
          {OpenModal && (
            <Modal
              isOpen={OpenModal}
              closeModal={() => setOpenModal(false)}
              className="w-fit max-w-full rounded-[4px]"
              isCloseRequired={false}
              rootCls="z-[9999] "
            >
              <ContactSellerForm
                propertyId={data?.id as string}
                project={true}
              />
            </Modal>
          )}
        </div>
      </div>
      <div className="h-[1px] w-full bg-gray-300 block md:hidden"></div>
      <div className="flex md:hidden items-center justify-between  w-full px-2 py-1">
        <div
          className="flex items-center md:gap-2 gap-1 cursor-pointer"
          onClick={() => {
            const name = generateSlug(data?.company?.name);
            router.push(`/company/${name}?id=${data?.company?.id}`);
          }}
        >
          <div className="relative md:w-[50px] md:h-[50px] w-[25px] h-[25px] ">
            <Image
              src={data?.company?.logo?.[0] || "/images/logoimage.png"}
              alt="Company logo"
              fill
              className="absolute object-cover md:rounded-[10px] rounded-[4px]"
            />
          </div>
          <div className="md:text-[14px] text-[10px]  font-medium text-gray-600">
            {data?.company?.name}
          </div>
        </div>
        <div className="flex  md:gap-2 gap-1 md:px-0 px-2">
          <Button
            className="md:px-4 px-2   text-nowrap  md:py-1 py-[2px] text-[10px] md:text-[12px] bg-[#3586FF] text-white font-medium  rounded-lg hover:bg-[#3586FF]transition-colors"
            onClick={handleRoute}
          >
            View Property
          </Button>
          <Button
            className="md:px-4 px-2 md:py-1 py-[2px] text-nowrap text-[10px] md:text-[12px] text-[#3586FF] border font-medium border-[#3586FF] rounded-lg text-center hover:bg-blue-50 transition-colors"
           onClick={(e) => {
    e.stopPropagation(); 
    setOpenModal(true);
  }}
          >
            Contact Owner
          </Button>
        </div>
      </div>
    </div>
  );
};
