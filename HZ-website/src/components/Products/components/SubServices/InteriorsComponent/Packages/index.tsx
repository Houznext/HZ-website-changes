import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Button from "@/common/Button";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Modal from "@/common/Modal";
import clsx from "clsx";
import { useQuoteModal } from "@/components/QuoteModal";
import { useStrapiInteriorStore } from "@/store/strapiInteriorsData";
import SectionSkeleton from "@/common/Skeleton";
import { packages, budgetDetails } from "@/utils/interiorshelper";
import {
  Check,
  ChefHat,
  Tv,
  DoorOpen,
  Sparkles,
  Layers,
  Wrench,
  Flower2,
  ArrowRight,
  Star,
  Shield,
  Crown,
  Gem,
  Zap,
} from "lucide-react";

const FEATURE_ICONS: Record<string, React.ElementType> = {
  Kitchen: ChefHat,
  "TV Unit": Tv,
  Wardrobes: DoorOpen,
  "Pooja Unit": Flower2,
  "Dressing Unit": Sparkles,
  Plywood: Layers,
  Hardware: Wrench,
};

const TIER_CONFIG: Record<
  string,
  { gradient: string; badge: string; icon: React.ElementType; accent: string }
> = {
  Basic: {
    gradient: "from-slate-600 to-slate-800",
    badge: "bg-slate-100 text-slate-700",
    icon: Zap,
    accent: "border-slate-300",
  },
  Standard: {
    gradient: "from-[#3586FF] to-[#1a5bbf]",
    badge: "bg-blue-50 text-[#3586FF]",
    icon: Star,
    accent: "border-[#3586FF]",
  },
  Premium: {
    gradient: "from-amber-500 to-amber-700",
    badge: "bg-amber-50 text-amber-700",
    icon: Crown,
    accent: "border-amber-400",
  },
};

interface Package {
  image: string;
  title: string;
  description: string;
  price: string;
  buttonText: string;
  buttonLink: string;
}

const PackageCard: React.FC<Package> = ({
  image,
  title,
  description,
  price,
}) => {
  const { openModal: openConsultationModal } = useQuoteModal();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Package | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState(0);

  const handleModal = (item: Package) => {
    setSelectedItem(item);
    setOpenModal(true);
    setActiveTab(0);
  };

  const bhk = description.split(" ").pop() || "";
  const matchedBhk = useMemo(
    () => budgetDetails.find((d) => d.bhk === bhk),
    [bhk]
  );
  const activePackage = matchedBhk?.packages[activeTab];
  const tierKey = activePackage?.type || "Basic";
  const tier = TIER_CONFIG[tierKey] || TIER_CONFIG.Basic;

  return (
    <>
      <div className="relative xl:max-w-[451px] lg:max-w-[450px] md:max-w-[380px] md:h-[240px] xl:ml-0 lg:ml-[19px] md:ml-[17px] ml-0 mx-auto md:m-0 m-1 group cursor-pointer overflow-hidden md:rounded-[16px] rounded-[6px]">
        <Image
          src={image}
          alt="package_bg"
          fill
          className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="relative flex flex-col justify-between h-full md:p-5 p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="md:text-[22px] text-[16px] text-white font-bold drop-shadow-lg">
                {title}
              </p>
              <p className="md:text-[13px] text-[11px] text-white/80 font-medium">
                {description}
              </p>
            </div>
            <div className="bg-[#3586FF] backdrop-blur-sm md:px-4 px-2 md:py-2 py-1 rounded-xl text-center shadow-lg">
              <p className="text-[10px] text-white font-medium uppercase tracking-wide">
                From
              </p>
              <p className="md:text-[15px] text-[12px] font-bold text-white">
                {price}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button
              className="inline-flex items-center gap-2 bg-white text-gray-900 md:px-5 px-3 md:py-2.5 py-2 rounded-xl font-semibold md:text-[13px] text-[11px] shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 group/btn"
              onClick={() => {
                if (matchedBhk) {
                  handleModal({
                    title,
                    description,
                    price,
                    image,
                    buttonText: "Visit Now",
                    buttonLink: "#",
                  });
                }
              }}
            >
              Explore Packages
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {openModal && selectedItem && matchedBhk && (
        <Modal
          isOpen={openModal}
          closeModal={() => setOpenModal(false)}
          className="max-w-[820px] !p-0 overflow-hidden"
          rootCls="z-[99999]"
        >
          <div className="flex flex-col">
            {/* Header */}
            <div
              className={clsx(
                "bg-gradient-to-r px-6 py-5 text-white",
                tier.gradient
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">
                    Interior Packages
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold">
                    Select Package for{" "}
                    <span className="text-yellow-300">{bhk}</span>
                  </h2>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">10-Year Warranty</span>
                </div>
              </div>
            </div>

            {/* Tier Tabs */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {matchedBhk.packages.map((pkg: any, idx: number) => {
                  const t = TIER_CONFIG[pkg.type] || TIER_CONFIG.Basic;
                  const TIcon = t.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={clsx(
                        "flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                        activeTab === idx
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <TIcon className="w-4 h-4" />
                      {pkg.type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            {activePackage && (
              <div className="px-6 pb-6">
                {/* Hero Image + Price */}
                <div className="relative h-[180px] md:h-[220px] rounded-2xl overflow-hidden my-3 group/img">
                  <Image
                    src={activePackage.image.url}
                    alt={activePackage.type}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {React.createElement(tier.icon, {
                          className: "w-5 h-5 text-yellow-300",
                        })}
                        <span className="text-white font-bold text-lg">
                          {activePackage.type} Package
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Complete home interior solution
                      </p>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-2.5 text-center shadow-xl">
                      <p className="text-[10px] text-gray-500 font-medium uppercase">
                        Starting at
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {activePackage.startingPrice}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    What&apos;s Included
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activePackage.features.map(
                      (feature: any, idx: number) => {
                        const FeatureIcon =
                          FEATURE_ICONS[feature.title] || Check;
                        return (
                          <div
                            key={idx}
                            className={clsx(
                              "flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:shadow-md hover:border-gray-300 bg-white",
                              tier.accent,
                              "border-gray-100"
                            )}
                          >
                            <div
                              className={clsx(
                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                tier.badge
                              )}
                            >
                              <FeatureIcon className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                {feature.title}
                                <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md">
                                  <Check className="w-3 h-3 inline -mt-0.5" />{" "}
                                  Included
                                </span>
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-gray-500">
                      Prices are indicative. Final quote based on material
                      selection &amp; customization.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const hint = [
                        "Interiors packages",
                        activePackage?.type,
                        bhk,
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      setOpenModal(false);
                      window.setTimeout(() => openConsultationModal(hint), 0);
                    }}
                    className={clsx(
                      "flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl shrink-0",
                      `bg-gradient-to-r ${tier.gradient}`
                    )}
                  >
                    <Gem className="w-4 h-4" />
                    Get free consultation
                  </Button>
                </div>
              </div>
            )}
          </div>

        </Modal>
      )}
    </>
  );
};

type PackagesProps = {
  heading: string;
  subHeading?: string;
  headingStyle?: React.CSSProperties;
};

const Packages: React.FC<PackagesProps> = ({
  heading,
  subHeading,
  headingStyle,
}) => {
  const sliderRef = useRef<any>(null);
  const gotoNext = () => {
    sliderRef.current?.slickNext();
  };
  const gotoPrev = () => {
    sliderRef.current?.slickPrev();
  };
  const [currentSlide, setCurrentSlide] = useState(0);

  const packagesData: Package[] = packages.map((item) => ({
    image: item.imageUrl?.url || "",
    title: item.offerTitle || "",
    description: item.highlightOfProperty || "",
    price: item.price || "*",
    buttonText: "Visit Now",
    buttonLink: "#",
  }));

  const sliderSettings = {
    dots: true,
    appendDots: (dots: any) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "60px",
        }}
      >
        {dots}
      </div>
    ),
    beforeChange: (_current: number, next: number) => {
      setCurrentSlide(next);
    },
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    customPaging: (i: number) => (
      <div
        style={{
          width: i === currentSlide ? "39px" : "12px",
          height: "12px",
          borderRadius: i === currentSlide ? "20px" : "50%",
          backgroundColor: i === currentSlide ? "#3586FF" : "#ccc",
          transition: "all 0.3s ease-in-out",
          margin: "-10px 14px",
          display: "inline-block",
        }}
      />
    ),
    responsive: [
      { breakpoint: 1440, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 500, settings: { slidesToShow: 1 } },
      { breakpoint: 425, settings: { slidesToShow: 1 } },
      { breakpoint: 375, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="px-6 mb-20">
      <h1
        className="mainheading-text leading-9 md:mb-8 text-center mb-1"
        style={headingStyle}
      >
        {heading}
      </h1>
      {packagesData.length === 0 ? (
        <SectionSkeleton type={"specialOffers"} />
      ) : (
        <div className="md:max-w-[1392px] w-full relative max-w-[410px] mx-auto">
          <Slider ref={sliderRef} {...sliderSettings}>
            {packagesData.map((pkg, index) => (
              <div key={index} className="md:px-0 px-1">
                <PackageCard key={index} {...pkg} />
              </div>
            ))}
          </Slider>
          <Image
            src="/testimonials/icons/left-slide.svg"
            alt="Previous"
            width={42}
            height={42}
            onClick={gotoPrev}
            className="absolute md:left-0 -left-7 top-1/2 transform -translate-y-1/2 md:-translate-x-1/2 translate-x-1/1 cursor-pointer"
          />
          <Image
            src="/testimonials/icons/right-slide.svg"
            alt="Next"
            width={42}
            height={42}
            onClick={gotoNext}
            className="absolute md:-right-1 -right-5 top-1/2 transform -translate-y-1/2 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};

export default Packages;
