import React from "react";
import ReferPropCard from "./ReferPropCard";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import PropertyHeader from "../PropertiesListComponent/PropertyHeader";
import ServicesCard from "../ServicesCard";
import ReferralFormSection from "./ReferralFormSection";
import Image from "next/image";
import { RightArrowWhite } from "../Icons";
import ReferHeroSection from "./ReferHeroSection";
import ReferPropertiesSlider from "./ReferPropertiesSlider";
import Refersteps, { IReferStepProps } from "./Refersteps";
import RefferingUs, { IReferringusProps } from "./RefferingUs";
import HomeLoanFaqs, {
  IHomeLoanFaqsprops,
} from "../Products/components/SubServices/LoansComponent/HomeLoanFaqs";
import GoogleAdSense from "@/components/GoogleAdSense";
import ExploreMore from './ExploreMore'
import Link from "next/link";
const AdCard = () => {
  return (
    <div className="relative h-[200px] md:w-[1000px] w-[350px] mx-auto">
      <Image
        src="/referandearn/ads.png"
        alt="referandearn"
        layout="fill"
        objectFit="cover"
      />
      <div className="absolute md:top-[50%] top-[75%] left-[50%] md:translate-x-[-110%] translate-x-[-90%] translate-y-[-110%]">
        <h1 className="md:text-[36px] text-[24px] leading-11 font-semibold text-[#FFFFFF]">
          Dream Casa Apartments
        </h1>
        <h2 className="md:text-[24px] text-[20px] leading-6 font-semibold text-[#FFFFFF]">
          Experience the Luxury of living.
        </h2>
      </div>

      <div className=" absolute top-[80%] md:left-[75%] left-[50%] translate-x-[100%] translate-y-[-50%] ">
        <div className="flex flex-row text-white gap-1 justify-center items-center bg-[#929394] px-4 py-2 rounded-md cursor-pointer hover:bg-gray-200">
          <p className="text-[20px] leading-6">view</p>
          <div>
            <RightArrowWhite />
          </div>
        </div>
      </div>
    </div>
  );
};

const ReferandEarnView = () => {
  const tabs: Array<{
    tabKey: string;
    buttonLabel: string;
  }> = [
      {
        buttonLabel: "Properties",
        tabKey: "properties",
      },
      {
        buttonLabel: "Services",
        tabKey: "services",
      },
    ];
  const flowData = [
    "you refer lead",
    "we contact them",
    "they buy property",
    "we pay you",
  ];
  const referStepsData: IReferStepProps = {
    heading: "Refer a Friend in 4 Easy Steps",
    listItems: [
      {
        id: 1,
        title: "Refer",
        description:
          "Sign up by filling out this form with your and your friend’s details.",
        iconurl: "/icons/propertydetails.png",
      },
      {
        id: 2,
        title: "Connect",
        description: "The Referrer raise a construction request with us.",
        iconurl: "/images/legalservices/herosection/Vector1.png",
      },
      {
        id: 3,
        title: "Project Confirmation",
        description:
          "When their project is confirmed and underway, your referral is recorded.",
        iconurl: "/icons/propertyreview.png",
      },

      {
        id: 4,
        title: "Earn Rewards",
        description:
          "Earn 0.5% of your friend’s project value when their construction begins.",
        iconurl: "/images/legalservices/herosection/vector3.png",
      },
    ],
  };
  const refferingUsData: IReferringusProps = {
    heading: "Why You'll Love Referring Us",
    image:
      "https://dreamcasaimages.s3.ap-south-1.amazonaws.com/approval_4d9fcc8a3b.webp",

    listItems: [
      {
        id: 1,
        title: "Earn Cash Rewards",
        description: "Get a percentage of the project value as cash rewards.",
        iconurl: "/images/referandearn/referringus/refer1.png",
      },
      {
        id: 2,
        title: "Help Loved Ones",
        description:
          "Ensure your friends and family find reliable construction services.",
        iconurl: "/images/referandearn/referringus/refer2.png",
      },
      {
        id: 3,
        title: "Build Trust",
        description: "Boost your reputation by recommending trusted services.",
        iconurl: "/images/referandearn/referringus/refer3.png",
      },
      {
        id: 4,
        title: "Exclusive Perks:",
        description: "Unlock special offers and discounts for your referrals.",
        iconurl: "/images/referandearn/referringus/refer4.png",
      },
      {
        id: 5,
        title: "Strengthen Relationships",
        description:
          "Show you care by guiding loved ones to quality construction.",
        iconurl: "/images/referandearn/referringus/refer5.png",
      },
    ],
  };
  const LegalServiceFaqsData: IHomeLoanFaqsprops = {
    heading: "Frequently Asked Questions",

    Faqs: [
      {
        id: 1,
        question: "How does the Refer & Earn program work?",
        answer:
          "You refer a friend by submitting their details. Once your friend starts a construction project with us, you receive 0.5% of the project value as a reward directly into your account.",
      },
      {
        id: 2,
        question: "When will I receive my reward?",
        answer:
          "You will receive your reward once your referred friend officially starts the construction project with us. The amount will be processed after project confirmation.",
      },
      {
        id: 3,
        question: "Is there a limit to how many friends I can refer?",
        answer:
          "No, there is no limit. You can refer as many friends as you like. For each successful referral, you will receive a reward when the construction begins.",
      },
      {
        id: 4,
        question: "How will I receive the reward money?",
        answer:
          "The reward amount will be transferred directly to your bank account. Make sure to provide valid bank details while signing up for the referral program.",
      },
      {
        id: 5,
        question: "What if two people refer the same friend?",
        answer:
          "The reward will be given to the person whose referral entry was submitted first in our system. We track referral timestamps to ensure fairness.",
      },
    ],
  };

  return (
    <div>
      {/* <div className="relative md:h-[170px] h-[200px] w-full">
        <Image
          src="/referandearn/banner.png"
          alt="referandearn"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center justify-center gap-5">
            <p className="text-[36px] leading-11 font-semibold text-[#FFFFFF]">
              Refer a Lead and Earn Money
            </p>
            <div className="flex items-center justify-center space-x-4">
              {flowData.map((step, index) => (
                <React.Fragment key={index}>
                  <span className="text-white">{step}</span>
                  {index < flowData.length - 1 && (
                    <span className="w-[40px] h-[1px] bg-white"></span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className="-mt-8">
        <AdCard />
      </div> */}
      <div className="mb-[64px]">
        <ReferHeroSection />
      </div>
      <ReferPropertiesSlider />

      {/* <div className="px-[72px] py-10">
        <div className="mb-10">
          <Tab.Group>
            <Tab.List className={`flex flex-wrap overflow-x-auto`}>
              {tabs.map((tabList) => {
                return (
                  <Tab
                    key={`${tabList.tabKey}`}
                    className={({ selected }) =>
                      clsx({
                        "md:text-base rounded-lg md:px-[24px] md:py-[16px] px-[12px] py-[12px] underline underline-offset-2":
                          true,
                        "font-regular decoration-transparent text-[#212227]":
                          !selected,
                        "font-medium text-[#3586FF] decoration-[#3586FF] focus:outline-none":
                          selected,
                      })
                    }
                  >
                    {tabList.buttonLabel}
                  </Tab>
                );
              })}
            </Tab.List>
          </Tab.Group>
        </div>
        <div className="overflow-x-auto">
          <PropertyHeader
            allowedDropDowns={[
              'location',
              'houseType',
              'rooms',
              'budget',
              'sort',
              'locality',
              'search',
            ]}
          />
        </div>
        <div>
          <ReferPropCard />
        </div>
        <div>
          <p className="font-medium text-center text-[28px] leading-[40px] text-[#4992FF] mb-[40px] mt-20 ">
            Services
          </p>
          <ServicesCard />
        </div>
      </div> */}
      <div className="md:px-5 px-3 mb-[45px] md:mb-[64px] md:max-w-[1490px] max-w-full mx-auto">
        <Refersteps {...referStepsData} />
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
      <div className="md:px-8  px-3 mb-[45px] md:mb-[64px]  mx-auto">
        <RefferingUs {...refferingUsData} />
      </div>
      <div className="md:px-8  px-3 mb-[45px] md:mb-[64px]  mx-auto">
        <ExploreMore />

      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <GoogleAdSense />
      </div>
      <div className="md:px-10  px-3 mb-[45px] md:mb-[64px] md:max-w-[1190px] max-w-full mx-auto">
        <HomeLoanFaqs {...LegalServiceFaqsData} />
      </div>
    </div>
  );
};

export default ReferandEarnView;
