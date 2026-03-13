import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { CiBookmark, CiMapPin, CiMaximize2 } from "react-icons/ci";
import { PiShareFat } from "react-icons/pi";
import { LuBike } from "react-icons/lu";
import Modal from "@/common/Modal";
import { twMerge } from "tailwind-merge";
import ContactSellerForm from "@/components/PropertyDetailsComponent/ContactSellerForm";
import {
  CarCrash,
  ConstructionSharp,
  Directions,
  Garage,
  Home,
  Warehouse,
} from "@mui/icons-material";

import { AreaIcon } from "@/components/Products/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyStore } from "@/store/postproperty";
import Button from "@/common/Button";
import toast from "react-hot-toast";
import { getPropertyIcon, iconMap } from "./helper";
import { ConstructionStatusEnum } from "@/components/Property/PropertyDetails/PropertyHelpers";
import { generateSlug, formatCost } from "@/utils/helpers";
import ReferralForm from "@/components/PropertyDetailsComponent/ReferralForm";
import { useWishlistStore } from "@/store/wishlist";
interface ViewedProperty {
  id: string;
  name: string;
}
type SinglePropertyProps = {
  property: PropertyStore;
  isCompared: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
};

function SingleProperty({
  property,
  isCompared,
  onToggleCompare,
  compareDisabled,
}: SinglePropertyProps) {
  const [user, setUser] = useState<any>();
  const [viewedProperties, setViewedProperties] = useState<ViewedProperty[]>(
    [],
  );
  const [images, setImages] = useState<string[]>(
    property?.mediaDetails?.propertyImages ?? ["/orders/no-orders.jpeg"],
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    "/orders/no-orders.jpeg",
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [OpenModal, setOpenModal] = useState(false);
  const [activeForm, setActiveForm] = useState<"contact" | "referral">(
    "contact",
  );

  const router = useRouter();
  const session = useSession();
  const pathname = usePathname();
  const pathSegments = pathname?.split("/");
  const activeTab = pathSegments?.[2];
  const city = pathSegments?.[3];

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]);
    }
    loadViewedProperties();
  }, [images]);
  const loadViewedProperties = () => {
    const storedData = localStorage.getItem("viewed_properties");
    const storedProperties: ViewedProperty[] = storedData
      ? JSON.parse(storedData)
      : [];
    setViewedProperties(storedProperties);
  };

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
  const isSeen = viewedProperties.some((p) => p.id === property.propertyId);

  useEffect(() => {
    if (session.status === "authenticated") {
      setUser(session?.data?.user);
    }
  }, [session?.status]);
  const ref = useRef(null);

  const hasReferrals =
    property.isReferAndEarnEnabled ||
    (Array.isArray(property.referralAgreements) &&
      property.referralAgreements.some((a: any) => a.status === "ACTIVE"));

  // Compute earn amount from active referral agreement (for badges)
  type ReferralAgreement = {
    status?: string;
    referrerValue?: number;
    referrerSharePercent?: number;
    referrerMaxCredits?: number;
  };
  const activeAgreement = Array.isArray(property?.referralAgreements)
    ? (property.referralAgreements.find((a: any) => a?.status === "ACTIVE") as ReferralAgreement | undefined)
    : null;
  let earnUpToStr: string | null = null;
  if (activeAgreement) {
    const price =
      property.propertyDetails?.pricingDetails?.expectedPrice ??
      property.propertyDetails?.pricingDetails?.monthlyRent ??
      property.propertyDetails?.pricingDetails?.maxPriceOffer ??
      property.propertyDetails?.pricingDetails?.minPriceOffer;
    const rv = activeAgreement.referrerValue;
    const pct = activeAgreement.referrerSharePercent;
    const maxCredits = activeAgreement.referrerMaxCredits;
    if (rv != null && Number(rv) > 0) {
      earnUpToStr = `₹${formatCost(Number(rv))}`;
    } else if (pct != null && price != null) {
      const computed = (Number(price) * Number(pct)) / 100;
      const capped =
        maxCredits != null
          ? Math.min(computed, Number(maxCredits))
          : computed;
      earnUpToStr = `₹${formatCost(capped)}`;
    }
  }
  if (hasReferrals && !earnUpToStr) earnUpToStr = "0.5% of value";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: "Property_Impression",
              item_id: property.propertyId,
              propertyname: property.propertyDetails?.propertyName || null,
              BHK: property.propertyDetails?.residentialAttributes?.bhk,
              location: property.locationDetails?.locality || null,
              city: property.locationDetails?.city,
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

  const handleRoute = () => {
    const slug = generateSlug(property.propertyDetails?.propertyName!);
    router.push(
      `/properties/${activeTab}/${city}/details/${slug}?id=${property.propertyId}&type=property`,
    );

    if (user) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "View_property",
        item_id: property.propertyId,
        propertyname: property.propertyDetails?.propertyName || null,
        BHK: property.propertyDetails?.residentialAttributes?.bhk,
        location: property.locationDetails?.locality || null,
        city: property.locationDetails?.city,
        customuserid: user.id,
        username: `${user?.firstName} ${user?.lastName}`,
        userEmail: user.email,
        phone: user.phone,
      });
    }
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

  const handleShare = (property: PropertyStore) => {
    const propertyUrl = `${window.location.origin}/properties/${activeTab}/${city}/${property.propertyId}`;
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

  const isResidential = property.basicDetails?.purpose === "Residential";
  const isRent = property.basicDetails?.lookingType === "Rent";
  const lookingType = property.basicDetails?.lookingType;

  const label =
    lookingType === "Rent"
      ? "Rent"
      : lookingType === "Flat Share"
        ? "Flat Share"
        : "Sale";

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const firstValidType = property.promotionType?.find(
    (type: string) => iconMap[capitalize(type.trim())],
  );

  const borderClass = firstValidType
    ? iconMap[capitalize(firstValidType.trim())].border
    : "border-gray-200";
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
      (wItem) => wItem.property?.id === property.propertyId,
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
          (wItem) => wItem.property?.id === property.propertyId,
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
          property.propertyId as string,
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
    <div
      className="w-full max-w-full md:max-w-[105%] flex flex-row md:max-h-[300px] "
      ref={ref}
    >
      <div
        className={`relative cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-lg duration-300  rounded-tl-[15px] flex flex-row rounded-[10px] border-[1px] ${borderClass} w-full md:min-w-[730px] md:max-w-[730px]`}
        onClick={handleRoute}
      >
        {/* Left Section with Image Gallery */}
        <div className="md:w-[250px] w-[45%] md:px-4 md:py-2  px-2 py-2 ">
          <div className="relative w-full h-[170px] md:h-[150px] overflow-hidden flex justify-center items-center rounded-lg">
            <Button
              className="z-10 absolute bg-white md:left-2 left-1 top-1/2 transform -translate-y-1/2  rounded-full md:w-10 w-6 md:h-10 h-6  md:translate-x-0 -translate-x-1/2 flex items-center justify-center shadow-md"
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
              alt="Houznext Logo"
              width={120}
              height={60}
              className="absolute  opacity-60 mix-blend-multiply"
            />
            <p className="text-[24px] text-white opacity-50 font-medium  absolute top-[84%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              HOUZNEXT
            </p>

            <Button
              className="absolute bg-white md:right-2 -right-2 top-1/2 transform -translate-y-1/2 rounded-full md:w-10 w-6 md:h-10 h-6 flex items-center justify-center shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="md:w-[24px] md:h-[24px] w-[12px] h-[12px] " />
            </Button>
            {isSeen && (
              <div className="absolute top-2 right-2 z-30 bg-black text-white rounded-[10px] px-2 py-1 text-[10px]">
                Seen
              </div>
            )}
          </div>

          <div className="hidden md:flex justify-center mt-4 gap-2 overflow-x-auto">
            {images.slice(0, 3).map((image, index) => (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(image);
                    setCurrentIndex(index);
                  }}
                />

                <Image
                  src="/images/logo.png"
                  alt="Houznext Logo"
                  width={30}
                  height={30}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-multiply"
                />
                <p className="text-[10px] text-white opacity-40 font-medium  absolute top-[84%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  HOUZNEXT
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Promotion badges only (Featured, Sponsored, etc.) — keep short */}
        <div className="absolute md:top-0 top-0 left-0 flex flex-row gap-2 z-10">
          {property.promotionType?.map((type: string) => {
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
          md:px-3 px-2 md:py-[6px] py-[3px]
       rounded-tl-[15px] rounded-tr-[2px] rounded-bl-[1px] rounded-br-[20px]
          md:text-[14px] text-[10px]
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

        {/* Share and Compare aligned in top-right */}
        <div className="absolute md:top-2 top-1 right-2 z-10 flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(property);
            }}
            className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 focus:scale-105"
          >
            <PiShareFat className="md:text-xl text-[14px] text-gray-700" />
          </Button>
          {onToggleCompare && (
            <input
              type="checkbox"
              onClick={(e) => e.stopPropagation()}
              checked={isCompared}
              disabled={compareDisabled && !isCompared}
              onChange={onToggleCompare}
              className={twMerge(
                "md:h-4 h-3 md:w-4 w-3 cursor-pointer rounded border-gray-600 text-[#3586FF] focus:ring-[#3586FF]",
                compareDisabled && !isCompared
                  ? "opacity-50 cursor-not-allowed"
                  : "",
              )}
              title={isCompared ? "Remove from Compare" : "Add to Compare"}
            />
          )}
        </div>

        {/* Middle Section with Property Details */}
        <div className="flex-1 md:px-3 md:py-2 px-2 py-1 md:mt-0 mt-3 md:ml-3 ml-0">
          <div className="flex justify-between items-start  ">
            <div className="md:space-y-1 space-y-1">
              <div className="flex md:items-center items-start md:gap-2 gap-1 md:flex-row flex-col">
                <div className="flex  items-center  md:gap-2 gap-0.5">
                  {getPropertyIcon(
                    property.propertyDetails?.propertyType || "Apartment",
                  )}
                  <span className="md:font-bold font-medium md:text-[16px] text-[10px] leading-tight md:text-nowrap break-words">
                    {property.propertyDetails?.propertyName ||
                      property.propertyDetails?.propertyType}
                  </span>
                </div>

                <span className="bg-[#3586FF] md:block hidden text-white md:text-[14px] text-[10px] md:px-2 px-1 md:py-[4px] py-[2px] rounded-md font-medium mt-1 md:mt-0">
                  {label}
                </span>
              </div>

              <div className="md:text-[14px] text-[8px] font-medium">
                {isResidential ? (
                  <>
                    {property.basicDetails?.lookingType === "Flat Share"
                      ? property?.propertyDetails?.flatshareAttributes?.bhk
                      : property?.propertyDetails?.residentialAttributes
                          ?.bhk}{" "}
                   {property?.propertyDetails?.propertyType} in {property.locationDetails?.locality},{" "}
                    {property.locationDetails?.city}
                  </>
                ) : (
                  <>
                    Suitable For{" "}
                    {property.propertyDetails?.commercialAttributes?.suitableFor.join(
                      ", ",
                    )}{" "}
                    in {property.locationDetails?.locality},{" "}
                    {property.locationDetails?.city}
                  </>
                )}
              </div>
              <div className="flex flex-col md:gap-1 gap-0.5">
                <p className="md:text-[12px] text-[10px]  font-medium">
                  {isRent || lookingType === "Flat Share"
                    ? "Monthly Rent"
                    : "Total Price"}
                </p>

                <p className="md:text-[14px]  text-gray-700 text-[10px] font-bold">
                  {isRent || lookingType === "Flat Share"
                    ? `${formatPrice(
                        property.propertyDetails?.pricingDetails?.monthlyRent ||
                          0,
                      )}/month`
                    : `₹${formatPrice(
                        property.propertyDetails?.pricingDetails
                          ?.expectedPrice || 0,
                      )}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 md:px-3 md:py-3 px-2 py-1 rounded-lg flex flex-wrap max-w-[500px] md:overflow-x-auto   md:gap-4 gap-2">
            {isResidential ? (
              <>
                <div className="text-gray-700  font-medium flex flex-wrap gap-x-2 gap-y-1   md:text-[12px] text-[10px] ">
                  {!isRent &&
                    property.propertyDetails?.pricingDetails?.pricePerSqft && (
                      <>
                        <span className="text-black">Avg. Price: </span>
                        <p className="text-gray-700">
                          {formatPrice(
                            property.propertyDetails.pricingDetails
                              .pricePerSqft,
                          )}{" "}
                          /sq.ft
                        </p>

                        <span>•</span>
                      </>
                    )}
                  {property.basicDetails?.lookingType === "Flat Share" && (
                    <>
                      <span className="text-black">Sizes: </span>
                      <p className="text-gray-700">
                        {
                          property?.propertyDetails?.flatshareAttributes
                            ?.floorArea?.size
                        }{" "}
                        {property?.propertyDetails?.flatshareAttributes
                          ?.floorArea?.unit ?? "sq.ft"}{" "}
                      </p>
                      <span>•</span>
                      <span className="text-black">Looking For:</span>
                      <p className="text-gray-700">
                        {property?.propertyDetails?.flatshareAttributes
                          ?.lookingFor ?? "N/A"}
                      </p>
                      <span>•</span>
                      <span className="text-black">Water:</span>
                      <p className="text-gray-700">
                        {property?.propertyDetails?.flatshareAttributes
                          ?.waterAvailability ?? "N/A"}
                      </p>
                    </>
                  )}
                  {property?.propertyDetails?.residentialAttributes && (
                    <>
                      <span className="text-black">Sizes: </span>
                      <p className="text-gray-700">
                        {
                          property?.propertyDetails?.residentialAttributes
                            ?.floorArea?.size
                        }{" "}
                        {property?.propertyDetails?.residentialAttributes
                          ?.floorArea?.unit ?? "sq.ft"}{" "}
                        -{" "}
                        {
                          property?.propertyDetails?.residentialAttributes
                            ?.buildupArea?.size
                        }{" "}
                        {property?.propertyDetails?.residentialAttributes
                          ?.buildupArea?.unit ?? "sq.ft"}
                      </p>
                    </>
                  )}
                  {property?.propertyDetails?.constructionStatus?.status && (
                    <>
                      <span>•</span>
                      <span className="text-black">
                        {property?.propertyDetails?.constructionStatus?.status}
                      </span>
                      {property.propertyDetails?.constructionStatus?.status ===
                        ConstructionStatusEnum.UnderConstruction &&
                      property.propertyDetails?.constructionStatus
                        ?.possessionBy ? (
                        <>
                          <span>•</span>
                          <span className="text-black">Possession: </span>
                          <p className="text-gray-700">
                            {new Date(
                              property.propertyDetails.constructionStatus
                                .possessionBy,
                            ).toLocaleDateString("en-IN", {
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </>
                      ) : property.propertyDetails?.constructionStatus
                          ?.possessionYears ? (
                        <>
                          <span>•</span>
                          <span className="text-black">Possession: </span>
                          <p className="text-gray-700">
                            {new Date().getFullYear() -
                              property.propertyDetails.constructionStatus
                                .possessionYears}{" "}
                            (
                            {
                              property.propertyDetails.constructionStatus
                                .possessionYears
                            }{" "}
                            ) yrs ago
                          </p>
                        </>
                      ) : null}{" "}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-gray-700  font-medium flex flex-wrap gap-x-2 gap-y-1   md:text-[12px] text-[10px] ">
                  <span className="text-black"> Size : </span>
                  <p className="text-gray-700">
                    {
                      property?.propertyDetails?.commercialAttributes
                        ?.builtUpArea?.size
                    }
                    {property?.propertyDetails?.commercialAttributes
                      ?.builtUpArea?.unit ?? "sq.ft"}{" "}
                  </p>

                  <span>•</span>
                  <span className="text-black">
                    {property?.propertyDetails?.constructionStatus?.status}
                  </span>

                  {property.propertyDetails?.constructionStatus?.status ===
                    ConstructionStatusEnum.UnderConstruction &&
                  property.propertyDetails?.constructionStatus?.possessionBy ? (
                    <>
                      <span>•</span>
                      <span className="text-black">Possession: </span>
                      <p className="text-gray-700">
                        {new Date(
                          property.propertyDetails.constructionStatus
                            .possessionBy,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </>
                  ) : property.propertyDetails?.constructionStatus
                      ?.possessionYears ? (
                    <>
                      <span>•</span>
                      <span className="text-black">Possession : </span>
                      <p className="text-gray-700">
                        {new Date().getFullYear() -
                          property.propertyDetails.constructionStatus
                            .possessionYears}{" "}
                        (
                        {
                          property.propertyDetails.constructionStatus
                            .possessionYears
                        }{" "}
                        ) yrs ago
                      </p>

                      <span>•</span>
                      <span className="text-black"> Parking :</span>
                      <p className="text-gray-700">
                        {(property.propertyDetails?.commercialAttributes
                          ?.fourWheelerParking ||
                          property.propertyDetails?.commercialAttributes
                            ?.twoWheelerParking) && (
                          <>
                            <span>
                              {
                                property.propertyDetails.commercialAttributes
                                  .fourWheelerParking
                              }{" "}
                              Cars,{" "}
                              {
                                property.propertyDetails.commercialAttributes
                                  .twoWheelerParking
                              }{" "}
                              Bikes
                            </span>
                          </>
                        )}
                      </p>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <div className="h-[1px] w-full bg-gray-300 my-2 "></div>

          <div
            className="flex flex-col items-end justify-end md:gap-1 gap-0.5 md:mb-4 mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {hasReferrals && earnUpToStr && (
              <p className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 text-[10px] md:text-[11px] font-semibold mb-2">
                Earn up to {earnUpToStr} when you refer
              </p>
            )}
            <div className="flex md:gap-2 gap-1">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoute();
                }}
                className=" md:px-4 px-2  py-1 text-[12px] md:text-[12px] bg-[#3586FF] text-nowrap text-white font-medium  rounded-lg hover:bg-[#3586FF]transition-colors"
              >
                View Property
              </Button>
              {hasReferrals ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveForm("referral");
                    setOpenModal(true);
                  }}
                  className="md:px-4 px-2  py-1 text-[12px] md:text-[12px] text-nowrap text-[#3586FF] border font-medium border-[#3586FF] rounded-lg text-center hover:bg-blue-50 transition-colors"
                >
                  Refer and Earn
                </Button>
              ) : (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenModal(true);
                  }}
                  className="md:px-4 px-2  py-1 text-[12px] md:text-[12px] text-nowrap text-[#3586FF] border font-medium border-[#3586FF] rounded-lg text-center hover:bg-blue-50 transition-colors"
                >
                  Contact Owner
                </Button>
              )}
            </div>
          </div>

          {OpenModal && (
            <Modal
              isOpen={OpenModal}
              closeModal={() => setOpenModal(false)}
              className="w-full max-w-full p-0 md:w-fit md:max-w-[560px] md:rounded-2xl md:p-6"
              isCloseRequired={false}
              rootCls="z-[9999]"
              innerCls="p-0 md:p-4"
            >
              <div className="flex min-h-full flex-col bg-white md:min-h-0 md:gap-4">
                {hasReferrals ? (
                  <ReferralForm
                    propertyId={property.propertyId as string}
                    referrerUserId={user?.id}
                    onSuccess={() => setOpenModal(false)}
                    onClose={() => setOpenModal(false)}
                  />
                ) : (
                  <>
                    {property.isReferAndEarnEnabled && (
                      <div className="flex border-b border-gray-200 md:mb-6 mb-2 bg-gray-50 rounded-full p-1 shadow-sm">
                        <Button
                          className={`flex-1 py-2  btn-txt font-medium transition-all duration-300 rounded-full text-center ${
                            activeForm === "contact"
                              ? "bg-[#5297FF] text-white shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setActiveForm("contact")}
                        >
                          Contact Owner
                        </Button>

                        <Button
                          className={`flex-1 py-2 btn-txt font-medium transition-all duration-300 rounded-full text-center ${
                            activeForm === "referral"
                              ? "bg-[#5297FF] text-white shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => setActiveForm("referral")}
                        >
                          Referral Form
                        </Button>
                      </div>
                    )}

                    <div className="transition-all duration-300 ease-in-out">
                      {activeForm === "contact" ||
                      !property.isReferAndEarnEnabled ? (
                        <ContactSellerForm
                          propertyId={property.propertyId as string}
                        />
                      ) : (
                        <ReferralForm
                          propertyId={property.propertyId as string}
                          referrerUserId={user?.id}
                          onClose={() => setOpenModal(false)}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

export default SingleProperty;
