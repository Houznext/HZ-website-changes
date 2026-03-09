import React, { useEffect, useState, useRef } from "react";
import Button from "@/common/Button";
import usePostPropertyStore, {
  propertyInitialState,
  PropertyStore,
} from "@/store/postproperty";
import apiClient from "@/utils/apiClient";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { LookingType } from "@/components/Property/PropertyDetails/PropertyHelpers";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

import { useSession } from "next-auth/react";
import { generateSlug } from "@/utils/helpers";
import { getLookingTypePath } from "@/components/Property/PropertyDetails/PropertyHelpers";

export default function PropertiesAds() {
  const [properties, setProperties] = useState<PropertyStore[]>([]);
  const sliderRef = useRef<any>(null);
  const router = useRouter();
  const session = useSession();
  const pathname = usePathname();
  const pathSegments = pathname?.split("/");
  const activeTab = pathSegments?.[2];

  const city = pathSegments?.[3];
  const gotoNext = () => {
    sliderRef.current?.slickNext();
  };
  const gotoPrev = () => {
    sliderRef.current?.slickPrev();
  };
  const fetchProperties = async () => {
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.property}/get-all-properties`
      );
      setProperties(res.body.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchProperties();
  }, []);
  const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 5000,
    speed: 2000,
    centerMode: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 375,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
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
  const handlePostProperty = () => {
    if (session.status !== "authenticated") {
      router.push("/post-property");
    } else {
      router.push("/post-property/details");
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="p-4 bg-white w-[100%] shadow-custom rounded-[10px]">
          <div className="space-y-4">
            <div className="relative w-full max-h-[210px] max-w-[520px] ">
              <Slider ref={sliderRef} {...sliderSettings}>
                {properties?.slice(0, 2).map((property, index) => (
                  <div
                    key={property.propertyId}
                    className="max-w-[100%] md:h-[176px] h-[240px] mx-auto relative bg-white  overflow-hidden  m-2 px-2"
                  >
                    <div className="relative w-full aspect-[16/9] md:h-[166px] p-2 ">
                      {property.mediaDetails?.propertyImages?.[0] && (
                        <Image
                          src={
                            property.mediaDetails.propertyImages[0] ||
                            "/images/newlylaunched/apartments3.png"
                          }
                          alt={
                            property?.propertyDetails?.propertyName ||
                            "Property image"
                          }
                          fill
                          className="object-cover absolute z-10 w-full h-full rounded-[16px]"
                        />
                      )}
                      <div className="absolute font-medium top-2 right-1 z-20  bg-gray-300 text-white rounded-[10px] px-2 py-1 flex items-end justify-end text-[10px]">
                        Ad
                      </div>
                      <div className="absolute bottom-0 left-0 w-full px-4 py-3 z-20 flex items-center justify-between text-white font-medium text-[16px]">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[12px]">
                            {(property.basicDetails?.lookingType === LookingType.Rent || property.basicDetails?.lookingType === LookingType.FlatShare)
                              ? `₹${property.propertyDetails?.pricingDetails?.monthlyRent}/Month`
                              : `₹${formatPrice(
                                Number(
                                  property?.propertyDetails?.pricingDetails
                                    ?.expectedPrice
                                )
                              )}`}
                          </p>
                          <p className="font-bold text-[12px]">
                            {property?.propertyDetails?.propertyName}
                          </p>
                          <p className="font-medium text-[12px]">
                            {property?.locationDetails?.locality},
                            {property?.locationDetails?.city}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            className="bg-transparent text-[14px] font-medium  rounded-[10px] text-white border-[1px] border-white px-4 py-1"
                            onClick={() => {
                              const slug = generateSlug(
                                property.propertyDetails?.propertyName!
                              );
                              const lookingTypePath = getLookingTypePath(
                                property?.basicDetails?.lookingType
                              );

                              router.push(
                                `/properties/${lookingTypePath}/${property?.locationDetails?.city}/details/${slug}?id=${property.propertyId}&type=property`
                              );
                            }}
                          >
                            View Details
                          </Button>
                          <Button className="bg-transparent text-[14px]  rounded-[10px] font-medium text-white border-[1px] border-white px-4 py-1">
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
              <Image
                src="/testimonials/icons/left-slide.svg"
                alt="Previous"
                width={32}
                height={32}
                onClick={gotoPrev}
                priority
                className="absolute left-0 md:top-1/2 top-1/2  transform md:-translate-y-1/2 -translate-y-5 md:-translate-x-1/2 md:translate-x-1/1 -translate-x-1/2 cursor-pointer"
              />
              <Image
                src="/testimonials/icons/right-slide.svg"
                alt="Next"
                width={42}
                height={42}
                onClick={gotoNext}
                priority
                className="absolute md:-right-1  -right-2 top-1/2 transform -translate-y-1/2  md:translate-x-1 translate-x-2 cursor-pointer"
              />
            </div>
            <div className="flex items-center  gap-x-3 w-full px-2">
              {properties?.slice(2, 4).map((property, index) => (
                <div
                  className="flex flex-col gap-y-1 w-[50%] border-[1px] border-gray-100 cursor-pointer"
                  onClick={() => {
                    const slug = generateSlug(
                      property.propertyDetails?.propertyName!
                    );
                    const lookingTypePath = getLookingTypePath(
                      property?.basicDetails?.lookingType
                    );
                    router.push(
                      `/properties/${lookingTypePath}/${property?.locationDetails?.city}/details/${slug}?id=${property.propertyId}&type=property`
                    );
                  }}
                  key={index}
                >
                  <div className="relative w-full h-[90px] ">
                    {property.mediaDetails?.propertyImages?.[0] && (
                      <Image
                        src={
                          property.mediaDetails.propertyImages[0] ||
                          "/images/newlylaunched/apartments3.png"
                        }
                        alt={
                          property?.propertyDetails?.propertyName ||
                          "Property image"
                        }
                        fill
                        className="object-cover absolute z-10 w-full h-full rounded-[16px]"
                      />
                    )}
                    <div className="absolute top-2 right-1 z-20 bg-gray-300 text-white rounded-[10px] px-2 py-1 flex items-end justify-end text-[10px]">
                      Ad
                    </div>
                    <div className="absolute bottom-0 left-0 w-full text-white px-4 py-3 z-20 font-medium text-[12px]">
                      {" "}
                      <p className="font-bold text-[12px]">
                        {" "}
                        {(property?.basicDetails?.lookingType === LookingType.Rent || property?.basicDetails?.lookingType === LookingType.FlatShare)
                          ? `₹${property?.propertyDetails?.pricingDetails?.monthlyRent}/Month`
                          : `₹${formatPrice(
                            Number(
                              property?.propertyDetails?.pricingDetails
                                ?.expectedPrice
                            )
                          )}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-1 py-1 px-2">
                    <p className="font-bold text-[10px]">
                      {property?.propertyDetails?.propertyName}
                    </p>
                    <p className="font-medium text-[10px]">
                      {property?.locationDetails?.locality},
                      {property?.locationDetails?.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full px-2">
              {properties?.slice(4, 8).map((property, index) => (
                <div
                  className="flex items-center  gap-x-2 w-full border-[1px] border-gray-100 cursor-pointer"
                  onClick={() => {
                    const slug = generateSlug(
                      property.propertyDetails?.propertyName!
                    );
                    const lookingTypePath = getLookingTypePath(
                      property?.basicDetails?.lookingType
                    );
                    router.push(
                      `/properties/${lookingTypePath}/${property?.locationDetails?.city}/details/${slug}?id=${property.propertyId}&type=property`
                    );
                  }}
                >
                  <div className="relative w-[90px] h-[90px]">
                    {property?.mediaDetails?.propertyImages?.[0] && (
                      <Image
                        src={
                          property?.mediaDetails.propertyImages[0] ||
                          "/images/newlylaunched/apartments3.png"
                        }
                        alt={
                          property?.propertyDetails?.propertyName ||
                          "Property image"
                        }
                        fill
                        className="object-cover rounded-[16px]"
                      />
                    )}
                    <div className="absolute top-2 right-1 z-20 bg-gray-400/50 text-white rounded-[10px] px-2 py-1 flex items-end justify-end text-[10px]">
                      Ad
                    </div>
                  </div>

                  <div className="flex flex-col gap-y-1 py-2">
                    <p className="font-bold text-[12px]">
                      {" "}
                      {(property?.basicDetails?.lookingType === LookingType.Rent || property?.basicDetails?.lookingType === LookingType.FlatShare)
                        ? `₹${property?.propertyDetails?.pricingDetails?.monthlyRent}/Month`
                        : `₹${formatPrice(
                          Number(
                            property?.propertyDetails?.pricingDetails
                              ?.expectedPrice
                          )
                        )}`}
                    </p>
                    <p className="font-bold text-[12px]">
                      {property?.propertyDetails?.propertyName}
                    </p>
                    <p className="font-medium text-[12px]">
                      {property?.locationDetails?.locality},
                      {property?.locationDetails?.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-gradient-to-r from-white to-blue-50 w-full shadow-md flex items-center justify-between rounded-2xl ">
          <div className="flex flex-col justify-between gap-1">
            <h1 className="font-medium md:text-[12px] text-[10px] text-gray-800">
              Are you a Property owner looking to rent or sell?
            </h1>
            <h2
              className="md:text-[12px] text-[10px] text-[#3586FF] underline underline-offset-4 cursor-pointer "
              onClick={handlePostProperty}
            >
              Post your property for <span className="uppercase ">free</span>
            </h2>
          </div>

          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            <Image
              src="/images/legalservices/herosection/vector3.png"
              alt="icon"
              className="object-contain"
              fill
              priority
            />
          </div>
        </div>
      </div>
    </>
  );
}
