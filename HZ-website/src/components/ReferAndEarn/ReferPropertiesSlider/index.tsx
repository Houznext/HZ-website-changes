import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import apiClient from "@/utils/apiClient";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { fetchHomePageCity } from "@/utils/locationDetails/datafetchingFunctions";
import { generateSlug } from "@/utils/helpers";
import { getLookingTypePath } from "@/components/Property/PropertyDetails/PropertyHelpers";
import { MapPin, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import Button from "@/common/Button";
import { formatCost } from "@/utils/helpers";

const ALLOWED_CITIES = [
  { label: "Hyderabad", value: "hyderabad" },
  { label: "Bengaluru", value: "bengaluru" },
  { label: "Chennai", value: "chennai" },
  { label: "Mumbai", value: "mumbai" },
  { label: "Pune", value: "pune" },
] as const;

const DEFAULT_CITY = "hyderabad";

const ReferPropertiesSlider = () => {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string>(DEFAULT_CITY);
  const [properties, setProperties] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const sliderRef = React.useRef<Slider | null>(null);

  const fetchProperties = useCallback(async (city: string) => {
    setLoading(true);
    try {
      const res = await apiClient.get(apiClient.URLS.referAndEarnProperties, {
        city,
        limit: 12,
        page: 1,
      });
      const data = res?.body ?? res;
      setProperties(Array.isArray(data?.data) ? data.data : []);
      setTotal(typeof data?.total === "number" ? data.total : 0);
    } catch (err) {
      console.error("Refer & earn properties fetch error:", err);
      setProperties([]);
      setTotal(0);
      toast.error("Could not load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("city");
    if (stored && ALLOWED_CITIES.some((c) => c.value === stored.toLowerCase())) {
      setSelectedCity(stored.toLowerCase());
    }
  }, []);

  useEffect(() => {
    fetchProperties(selectedCity);
  }, [selectedCity, fetchProperties]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetchHomePageCity(
            String(latitude),
            String(longitude)
          );
          const fetchedCity = response?.city?.toLowerCase?.();
          if (
            fetchedCity &&
            ALLOWED_CITIES.some((c) => c.value === fetchedCity)
          ) {
            localStorage.setItem("city", fetchedCity);
            setSelectedCity(fetchedCity);
            toast.success(`Showing properties in ${fetchedCity}`);
          } else {
            setSelectedCity(DEFAULT_CITY);
            toast("Showing Hyderabad properties");
          }
        } catch {
          setSelectedCity(DEFAULT_CITY);
          toast("Showing Hyderabad properties");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        toast.error("Could not get your location");
        setSelectedCity(DEFAULT_CITY);
        setLocationLoading(false);
      }
    );
  };

  const getPropertyDetailUrl = (prop: any) => {
    const lookingType =
      getLookingTypePath(prop?.basicDetails?.lookingType) || "buy";
    const city = prop?.locationDetails?.city || "hyderabad";
    const slug = generateSlug(
      prop?.propertyDetails?.propertyName ||
        prop?.basicDetails?.title ||
        "property"
    );
    return `/properties/${lookingType}/${city}/details/${slug}?id=${prop.propertyId}&type=property`;
  };

  const getCityLabel = (value: string) =>
    ALLOWED_CITIES.find((c) => c.value === value)?.label ?? value;

  const sliderSettings = {
    dots: true,
    infinite: properties.length > 1,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section
      id="refer-properties"
      className="w-full bg-white py-12 px-4 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
          Properties you can refer & earn
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Earn when you refer these properties to friends
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {ALLOWED_CITIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setSelectedCity(c.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCity === c.value
                  ? "bg-[#3586FF] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locationLoading}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            {locationLoading ? "Detecting…" : "Use my location"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No refer & earn properties in {getCityLabel(selectedCity)} yet.
            Try another city.
          </div>
        ) : (
          <>
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => sliderRef.current?.slickPrev()}
                aria-label="Previous"
                className="hidden md:flex shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center text-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <Slider
                ref={(slider) => {
                  sliderRef.current = slider;
                }}
                {...sliderSettings}
              >
                {properties.map((prop) => {
                  const url = getPropertyDetailUrl(prop);
                  const imgSrc =
                    prop?.mediaDetails?.propertyImages?.[0];
                  const hasValidImage =
                    typeof imgSrc === "string" && imgSrc.trim() !== "";
                  const title =
                    prop?.propertyDetails?.propertyName ||
                    prop?.basicDetails?.title ||
                    "Property";
                  const purpose =
                    prop?.basicDetails?.purpose ||
                    "";
                  const propertyType =
                    prop?.propertyDetails?.propertyType ||
                    "";
                  const lookingType =
                    prop?.basicDetails?.lookingType ||
                    "";
                  const locality =
                    prop?.locationDetails?.locality ||
                    "";
                  const city =
                    prop?.locationDetails?.city ||
                    "";
                  const locStr = [locality, city].filter(Boolean).join(", ") || "—";
                  const pricing = prop?.propertyDetails?.pricingDetails;
                  const isRent = lookingType === "Rent";
                  const price =
                    isRent && pricing?.monthlyRent != null
                      ? pricing.monthlyRent
                      : pricing?.expectedPrice ??
                        pricing?.maxPriceOffer ??
                        pricing?.minPriceOffer;
                  const priceStr =
                    price != null
                      ? `₹${formatCost(price)}${isRent ? "/mo" : ""}`
                      : null;

                  const handleShare = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const fullUrl =
                      typeof window !== "undefined"
                        ? `${window.location.origin}${url}`
                        : url;
                    if (navigator.share) {
                      navigator
                        .share({
                          title,
                          url: fullUrl,
                          text: `Check out ${title} on OneCasa`,
                        })
                        .catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(fullUrl);
                      toast.success("Link copied");
                    }
                  };

                  const suitableFor = [purpose, propertyType, lookingType]
                    .filter(Boolean)
                    .join(", ") || "Property";

                  const locationLine = locStr !== "—" ? `In ${locStr}` : "";

                  // Refer perk: earn up to X from active agreement
                  const agreement = Array.isArray(prop?.referralAgreements)
                    ? prop.referralAgreements.find(
                        (a: any) => a?.status === "ACTIVE"
                      )
                    : null;
                  let earnUpToStr: string | null = null;
                  if (agreement) {
                    const rv = agreement.referrerValue;
                    const pct = agreement.referrerSharePercent;
                    const maxCredits = agreement.referrerMaxCredits;
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
                  if (!earnUpToStr) earnUpToStr = "0.5% of value";

                  // Bullet list: Size, Newly Launched, Possession, Parking
                  const resAttr = prop?.propertyDetails?.residentialAttributes;
                  const buildSize = resAttr?.buildupArea?.size ?? resAttr?.floorArea?.size;
                  const sizeUnit = resAttr?.buildupArea?.unit ?? resAttr?.floorArea?.unit ?? "sq.ft";
                  const sizeStr = buildSize != null ? `Size: ${buildSize} ${sizeUnit}` : null;
                  const constr = prop?.propertyDetails?.constructionStatus;
                  const statusStr = constr?.status;
                  const newlyLaunched = statusStr === "Newly Launched";
                  const possessionStr =
                    constr?.possessionYears != null
                      ? `Possession: ${constr.possessionYears} yrs`
                      : constr?.possessionBy
                        ? `Possession: ${new Date(constr.possessionBy).getFullYear()}`
                        : statusStr === "Ready to Move"
                          ? "Ready to move"
                          : statusStr
                            ? `Possession: ${statusStr}`
                            : null;
                  const hasParking = resAttr?.parking4w || resAttr?.parking2w;
                  const parkingStr = hasParking
                    ? `Parking: ${resAttr?.parking4w ? "Car" : ""}${resAttr?.parking4w && resAttr?.parking2w ? ", " : ""}${resAttr?.parking2w ? "Bike" : ""}`
                    : null;
                  const bulletParts = [
                    sizeStr,
                    newlyLaunched ? "Newly Launched" : null,
                    possessionStr,
                    parkingStr,
                  ].filter(Boolean);

                  return (
                    <div key={prop.propertyId} className="px-1.5">
                      <div className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full w-full max-w-[280px] mx-auto">
                        <div className="relative w-full min-h-[120px] aspect-[16/10] shrink-0 bg-gray-100">
                          {hasValidImage ? (
                            <Image
                              src={imgSrc}
                              alt={title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 480px) 100vw, 280px"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-4">
                              <Image
                                src="/images/logobb.png"
                                alt="OneCasa"
                                width={120}
                                height={48}
                                className="object-contain opacity-80"
                              />
                            </div>
                          )}
                          <span className="absolute top-2 left-2 inline-flex items-center rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-md">
                            Earn up to {earnUpToStr}
                          </span>
                        </div>
                        <div className="flex flex-col flex-1 p-3 min-h-0">
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1 min-w-0">
                              {title}
                            </h3>
                            <button
                              type="button"
                              onClick={handleShare}
                              className="shrink-0 p-1 rounded text-gray-500 hover:bg-gray-100 transition"
                              aria-label="Share"
                            >
                              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-600 mb-0.5 line-clamp-1">
                            Suitable for {suitableFor}
                            {locationLine ? ` in ${locStr}` : ""}
                          </p>
                          <p className="text-[10px] text-gray-500 mb-0">
                            {isRent ? "Rent" : "Total Price"}
                          </p>
                          {priceStr ? (
                            <p className="text-base font-bold text-gray-900 mb-1">
                              {priceStr}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mb-1">
                              Price on request
                            </p>
                          )}
                          {bulletParts.length > 0 ? (
                            <p className="text-[10px] text-gray-600 mb-1.5 line-clamp-1">
                              {bulletParts.join(" • ")}
                            </p>
                          ) : null}
                          <div className="mb-1.5 rounded bg-[#3586FF]/10 border border-[#3586FF]/20 px-2 py-1">
                            <p className="text-[10px] font-semibold text-[#3586FF]">
                              Refer & earn — Earn up to {earnUpToStr}
                            </p>
                          </div>
                          <div className="mt-auto flex flex-row gap-1.5 pt-0.5">
                            <a
                              href={url}
                              className="flex-1 inline-flex items-center justify-center bg-[#3586FF] hover:bg-[#2563eb] text-white font-medium py-2 px-2 rounded-md text-xs transition-colors min-w-0"
                            >
                              View Property
                            </a>
                            <a
                              href={url}
                              className="flex-1 inline-flex items-center justify-center bg-white border border-[#3586FF] text-[#3586FF] hover:bg-[#3586FF] hover:text-white font-medium py-2 px-2 rounded-md text-xs transition-colors min-w-0"
                            >
                              Refer and Earn
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
              </div>
              <button
                type="button"
                onClick={() => sliderRef.current?.slickNext()}
                aria-label="Next"
                className="hidden md:flex shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center text-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mt-8">
              <Button
                type="button"
                onClick={() =>
                  router.push(
                    `/properties/buy/${selectedCity}?referAndEarn=true`
                  )
                }
                className="bg-[#3586FF] hover:bg-[#2a6ed4] text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Show all referable properties in {getCityLabel(selectedCity)}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ReferPropertiesSlider;
