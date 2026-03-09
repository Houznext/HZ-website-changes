import VerticalStepper from "@/common/VerticalStepper";
import React, { useEffect, useState } from "react";
import { BackArrow } from "../PropIcons";
import BasicDetails from "../BasicDetails";
import LocationDetails from "../LocationDetails";
import UploadImage from "../UploadMedia";
import apiClient from "@/utils/apiClient";
import { useSession } from "next-auth/react";
import Image from "next/image";
import usePostPropertyStore, {
  propertyInitialState,
} from "@/store/postproperty";
import toast from "react-hot-toast";

import PropertyDetails from "../PropDetails/PropertyDetails";
import PropertySlider from "../PropertySilder";
import Loader from "@/components/Loader";
import Modal from "@/common/Modal";
import Button from "@/common/Button";
import HomeLoanFaqs from "@/components/Products/components/SubServices/LoansComponent/HomeLoanFaqs";
import GoogleAdSense from "@/components/GoogleAdSense";
import { User, MapPin, Home, Image as ImageIcon } from "lucide-react";

const PropertySteps = () => {
  const steps = [
    {
      label: "Basic Info",
      subtitle: "Flat/Apartment for Sale",
      icon: <User size={16} />,
    },
    {
      label: "Location Info",
      subtitle: "Step 2",
      icon: <MapPin size={16} />,
    },
    {
      label: "Property Info",
      subtitle: "Step 3",
      icon: <Home size={16} />,
    },
    {
      label: "Videos & Photos",
      subtitle: "Step 4",
      icon: <ImageIcon size={16} />,
    },
  ];

  const currentStep = usePostPropertyStore((state) => state.currentStep);
  const setCurrentStep = usePostPropertyStore((state) => state.setCurrentStep);
  const propertyId = usePostPropertyStore((state) => state.propertyId);
  const resetState = usePostPropertyStore((state) => state.resetState);
  const [user, setUser] = useState<{ [key: string]: any }>();
  const property = usePostPropertyStore((state) => state.getProperty());
  const setProperty = usePostPropertyStore((state) => state.setProperty);
  const [loading, setLoading] = useState(false);
  const [pendingProperty, setPendingProperty] = useState(false);

  const { data: session, status } = useSession();

  // Always start at step 0 on mount so stale Zustand state from a
  // previous SPA navigation never lands the user on a random step.
  useEffect(() => {
    resetState();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user) {
      setUser(session.user);
    }
  }, [status, session]);

  // Track step completion in GA4
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).gtag =
        (window as any).gtag ||
        function () {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).dataLayer.push(arguments);
        };

      (window as any).gtag("event", "step_completion", {
        step: currentStep + 1,
        user_id: user?.id || "guest",
      });
    }
  }, [currentStep]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await apiClient.get(
          `${apiClient.URLS.property}/get-pending-properties/${user?.id}`
        );

        if (!response.body) return;
        setProperty(response.body);

        // Derive the correct step from the existing property data
        const data = response.body;
        let resumeStep = 0;
        if (data.basicDetails?.ownerType) resumeStep = 1;
        if (data.locationDetails?.city) resumeStep = 2;
        if (data.propertyDetails?.propertyType) resumeStep = 3;

        setCurrentStep(resumeStep);
        setPendingProperty(true);
      } catch (error) {
        console.error("Error fetching property progress:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProgress();
    }
  }, [user?.id]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEdit = (index: number) => {
    setCurrentStep(index);
  };

  const handleDeletePendingProperty = async () => {
    try {
      const response = await apiClient.delete(
        `${apiClient.URLS.property}/${property.propertyId}`,
        {},
        true
      );
      if (response.status === 200) {
        toast.success("Cleared your progress");
        setProperty(propertyInitialState);
      }
    } catch (error) {
      console.error("Error fetching property progress:", error);
    }
  };

  if (loading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  const RenderDetailSteps = () => {
    switch (currentStep) {
      case 0:
        return <BasicDetails handleNext={handleNext} user={user} />;
      case 1:
        return <LocationDetails handleNext={handleNext} />;
      case 2:
        return <PropertyDetails handleNext={handleNext} user={user} />;
      case 3:
        return <UploadImage handleNext={handleNext} user={user} />;
      default:
        return <p>Select a step to continue</p>;
    }
  };
  const propertyItems = [
    {
      id: 1,
      title: "Fill up the property details",
      iconurl: "/icons/propertydetails.png",
      description: "Use our  quick self-upload feature to provide few details ",
    },
    {
      id: 2,
      title: "Upload photos & Videos",
      iconurl: "/icons/uploadmedia.png",
      description:
        "Add high-quality images and videos to attract potential buyers.",
    },
    {
      id: 3,
      title: "Property review process",
      iconurl: "/icons/propertyreview.png",
      description:
        "Our in house quality team will review your property details.",
    },
    {
      id: 4,
      title: "Your property goes live",
      iconurl: "/images/legalservices/herosection/vector3.png",
      description: "Sit back and relax as enquiries begin to pour in .",
    },
  ];
  const Faqsdata = {
    heading: "Frequently asked questions",

    Faqs: [
      {
        id: 1,
        question:
          "What type of property i can post on OneCasa for selling/renting ?",
        answer:
          "On OneCasa, you can post various types of properties for selling or renting, including residential properties like apartments, villas, and penthouses. You can also list commercial properties such as office spaces, retail shops, and warehouses, along with land and plots for residential, commercial, or agricultural use.  Whether you're an owner, builder, or agent, OneCasa makes it easy to connect with potential buyers or tenants. ",
      },
      {
        id: 2,
        question:
          "can i sell/rent out my property on my own without paying brokerage?",
        answer:
          "Yes, on OneCasa, you can sell or rent out your property on your own without paying any brokerage. The platform allows property owners to list their properties directly, connect with potential buyers or tenants, and complete the transaction without involving middlemen. This ensures a cost-effective and hassle-free experience while giving you full control over the process",
      },
      {
        id: 3,
        question: "How can i rent/sell my property faster on OneCasa ?",
        answer:
          "To rent or sell your property faster on OneCasa, make sure to provide detailed and accurate information about your property, including location, amenities, and pricing. Upload high-quality photos and videos to attract more interest. Setting a competitive price based on market trends can also help. Additionally, promoting your listing through social media and real estate networks increases visibility. Responding quickly to inquiries and offering flexible viewing options can further speed up the process.",
      },
      {
        id: 4,
        question:
          " What should I include in my property listing for better response?",
        answer:
          "To get a better response on OneCasa, include detailed and accurate property information, such as location, size, price, and key amenities. Upload high-quality photos and videos to attract more interest. Highlight unique selling points like nearby schools, markets, or transport links. Setting a competitive price and responding quickly to inquiries can also improve your chances of finding buyers or tenants faster.",
      },
      {
        id: 5,
        question: "Can I post multiple properties on OneCasa?",
        answer:
          "Yes, you can post multiple properties on OneCasa without any restrictions. Each property listing should include complete and accurate details, such as location, price, and amenities, to attract potential buyers or tenants. Managing multiple listings is easy through your OneCasa account, where you can update or modify property details anytime.",
      },
    ],
  };
  return (
    <div className="flex md:flex-row flex-col w-[100%] gap-3 md:px-2 px-0 py-1 overflow-hidden">
      <div className="w-[22%] md:max-w-[280px] max-h-screen max-md:hidden sticky top-0">
        <div className="px-2 mx-auto flex items-center justify-center">
          <VerticalStepper
            steps={steps}
            currentStep={currentStep}
            handleEdit={handleEdit}
          />
        </div>
        <div className="mt-2 bg-red-300">
          <GoogleAdSense />
        </div>
      </div>
      <div className="w-full block md:hidden">
        <div className="px-3">
          <div
            className="rounded-md bg-gray-100 text-black
                  px-3 py-3"
          >
            <div className="flex flex-col items-center">
              <PropertySlider />
              <h2 className="md:text-lg text-[16px] mt-3">
                <span className="text-[#081221] font-bold">
                  Sell or Rent
                </span>{" "}
                Property online faster
              </h2>
              <p className="md:text-sm text-[12px] mt-1 flex items-center gap-1">
                <span className="text-[12px] font-medium md:text-lg">
                  ✓
                </span>
                Get unlimited enquiries
              </p>
            </div>
          </div>
        </div>

        <div className="sticky top-2 z-10 bg-white px-2 py-2 shadow-custom overflow-x-auto">
          <div className="flex min-w-max gap-2 px-1">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;

              return (
                <div
                  key={index}
                  className={`
          relative flex items-center gap-2 px-3 py-[6px] rounded-full
          text-[12px] font-medium whitespace-nowrap cursor-pointer transition
          ${isActive
                      ? "bg-[#3586FF] text-white shadow-md"
                      : isCompleted
                        ? "bg-blue-100 text-[#3586FF]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
        `}
                  onClick={() => {
                    if (index <= currentStep) {
                      handleEdit(index);
                    }
                  }}
                >
                  <span className="flex items-center">{step.icon}</span>
                  {step.label}

                  {isActive && (
                    <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#3586FF]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="md:w-[45%] w-full md:px-[10px] rounded-xl px-[20px] md:py-5 py-2 flex flex-col md:h-[100vh] h-full overflow-hidden">
        <div
          className="flex flex-row cursor-pointer items-center md:justify-center justify-start max-w-[100px] md:mb-4 mb-0 md:h-[60px] -ml-1"
          onClick={handleBack}
        >
          <BackArrow />
          <p className="font-medium md:text-[16px] text-[12px] leading-6 md:ml-2">
            Back
          </p>
        </div>
        <div className="overflow-y-auto h-full flex-grow">
          <div className="md:w-[90%] w-full mx-auto md:mb-10">
            {RenderDetailSteps()}
          </div>
        </div>
      </div>

      {/* Improved Right Side Container */}
      <div className="md:block hidden md:w-[32%] mt-0 bg-gradient-to-br from-[#3586FF] via-[#2563eb] to-[#1d4ed8] md:px-8 lg:px-12 md:py-12 h-screen sticky top-0 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2" />

        <div className="relative flex flex-col items-center  justify-center h-full">
          {/* Header Section */}
          <div className="text-center  ">
            <h2 className="text-2xl lg:text-[26px]  font-bold leading-tight text-white">
              Post Property Ad to sell or rent online
            </h2>
            <span className="inline-block mt-3 px-5 py-1.5 bg-[#4ADE80] text-[#166534] text-sm font-bold rounded-full shadow-lg">
              100% FREE
            </span>
          </div>

          {/* Slider Section */}
          <div className="w-full mb-8">
            <PropertySlider />
          </div>

          {/* Progress Steps */}
          <div className="w-full max-w-[280px]">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
              <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-4">
                Your Progress
              </p>
              <ul className="space-y-3">
                {[
                  { text: "Add Basic Details", icon: User },
                  { text: "Add Location Details", icon: MapPin },
                  { text: "Add Property Details", icon: Home },
                  { text: "Add Video & Photos Details", icon: ImageIcon },
                ].map((item, idx) => {
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;
                  const IconComponent = item.icon;

                  return (
                    <li
                      key={idx}
                      className={`
                        flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300
                        ${isActive ? "bg-white/20 scale-[1.02]" : ""}
                      `}
                    >
                      {/* Status indicator */}
                      <div
                        className={`
                          w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0
                          transition-all duration-300
                          ${isCompleted
                            ? "bg-[#4ADE80] text-white shadow-lg shadow-green-500/30"
                            : isActive
                              ? "bg-[#ffdf00] text-[#1d4ed8] shadow-lg shadow-yellow-500/30 animate-pulse"
                              : "bg-white/20 text-white/50"
                          }
                        `}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <IconComponent size={14} />
                        )}
                      </div>

                      {/* Text */}
                      <span
                        className={`
                          text-sm font-medium leading-tight transition-colors duration-300
                          ${isCompleted
                            ? "text-[#4ADE80]"
                            : isActive
                              ? "text-[#ffdf00]"
                              : "text-white/60"
                          }
                        `}
                      >
                        {item.text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Progress bar */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/70 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold text-white">
                    {Math.round((currentStep / steps.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4ADE80] to-[#22c55e] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer tip */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              Complete all steps to publish your property
            </p>
          </div>
        </div>
      </div>

      <div className="md:hidden mb-3 flex flex-col md:gap-6 gap-3">
        <h1 className="text-center md:text-[20px] text-[18px] font-bold text-[#3586FF]">
          How to Post Property
        </h1>

        <div className="flex flex-col gap-y-6 bg-gray-200 p-2 rounded-lg">
          {propertyItems.map((item, index) => (
            <div
              className={`flex ${index % 2 !== 0 ? "justify-end" : "justify-start"
                }`}
              key={item.id}
            >
              <div
                className="
                relative max-w-[320px] w-full bg-white rounded-xl shadow-md
                flex items-center gap-5 px-5 py-4
                border-l-4 border-[#3586FF] transition
                hover:shadow-lg hover:-translate-y-[2px]
              "
              >
                <div className="flex-shrink-0 w-[50px] h-[50px] bg-blue-100 rounded-full flex items-center justify-center ring-1 ring-blue-200">
                  <div className="relative w-[32px] h-[32px]">
                    <Image
                      src={item.iconurl}
                      alt="icon"
                      className="object-contain"
                      fill
                      priority
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <h1 className="font-medium text-gray-900 text-[15px] leading-5">
                    {item.title}
                  </h1>
                  <p className="font-regular text-gray-500 text-[13px] leading-4">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="md:hidden block mt-[10px] w-full">
        <HomeLoanFaqs {...Faqsdata} />
      </div>

      <Modal
        isOpen={pendingProperty}
        closeModal={() => {
          setPendingProperty(false);
          handleDeletePendingProperty();
        }}
        className="max-w-[400px] py-10 rounded-md"
        isCloseRequired={false}
      >
        <div className="max-w-[310px] mx-auto flex flex-col gap-5">
          <p className="text-[14px] font-medium text-center">
            We saved your previous progress. Do you want to continue from where
            you left off?
          </p>

          <div className="flex flex-row gap-5 mx-auto">
            <Button
              className="px-[34px] md:py-[8px] label-text text-nowrap py-[2px] md:text-[16px] text-[14px] font-medium border-2 border-[#3B82F6] rounded-md"
              onClick={() => {
                setPendingProperty(false);
                handleDeletePendingProperty();
                setCurrentStep(0);
              }}
            >
              Start Fresh
            </Button>
            <Button
              className="px-[34px] md:py-[8px] label-text text-nowrap  py-[2px] md:text-[16px] text-[14px] bg-[#3B82F6] font-medium text-white rounded-md"
              onClick={() => setPendingProperty(false)}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertySteps;
