import React from "react";
import { useRef } from "react";
import HeroSection, { IHerosectionprops } from "../SolarPage/HeroSection";
import WhyToChooseDreamcasa, {
  IWhyToChooseDreamcasaprops,
} from "./WhyToChooseDreamcasa";
import WhyChooseUs, { IWhyChooseUSprops } from "./WhyChooseUs";

import Partners, { IPartnersprops } from "./Partners";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "../Products/components/SubServices/Components/TestimonialsSection";
import PackagesAndServices, {
  IPackagesAndServicesprops,
} from "./PackagesAndServices";
import GoogleAdSense from "@/components/GoogleAdSense";

export default function EarthMovesComponent() {
  const packagesRef = useRef<HTMLDivElement>(null);

  const handleScrollToPackages = () => {
    if (packagesRef.current) {
      packagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const PackagesAndServicesData: IPackagesAndServicesprops = {
    heading: "Packages & Services",
    listItems: [
      {
        id: 1,
        servicename: "Vibrator Rod Roller",
        image: "/images/earthmoves/packagesandservices/vibratorrodroller.png",
        rollertype: "Tandem Roller",
        automationgrade: " Automatic",
        price: "₹ 7,500",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 2,
        servicename: "Loader Rental",
        image: "/images/earthmoves/packagesandservices/loaderrental.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 21,000",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 3,
        servicename: "Tipper Rental",
        image: "/images/earthmoves/packagesandservices/tipperrental.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 12,800",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 4,
        servicename: "Breaker Machine",
        image: "/images/earthmoves/packagesandservices/breakermachine.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 10,400",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 5,
        servicename: "Demolition Rental",
        image: "/images/earthmoves/packagesandservices/demolition.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 9,500",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 6,
        servicename: "Rock Breaker ",
        image: "/images/earthmoves/packagesandservices/rockbreaker.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 18,000",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 7,
        servicename: "Excavator Rental ",
        image: "/images/earthmoves/packagesandservices/excavatorrental.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 11,200",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
      {
        id: 8,
        servicename: "Crane Rental",
        image: "/images/earthmoves/packagesandservices/cranerental.png",
        rollertype: "Tandem Roller",
        automationgrade: "Automatic",
        price: "₹ 15,600",
        soldby: "K K Earth Movers",
        location: "Hyderabad",
        operationweight: "75 MT",
        servicetype: "",
      },
    ],
  };
  const WhyToChooseDreamcasaData: IWhyToChooseDreamcasaprops = {
    heading: "Why to choose Dreamcasa?",
    icon: "/images/earthmoves/whytochoosedreamcasa/arrowline.png",
    listItems: [
      {
        id: 1,
        title: "We are Trendy",
        image: "/images/earthmoves/whytochoosedreamcasa/wearetrendy.png",
        number: "01",
      },
      {
        id: 2,
        title: "Planning",
        image: "/images/earthmoves/whytochoosedreamcasa/planning.png",
        number: "02",
      },
      {
        id: 3,
        title: "Development",
        image: "/images/earthmoves/whytochoosedreamcasa/development.png",
        number: "03",
      },
      {
        id: 4,
        title: "24/7 Support",
        image: "/images/earthmoves/whytochoosedreamcasa/24support.png",
        number: "04",
      },
    ],
  };
  const WhyChooseUsData: IWhyChooseUSprops = {
    heading: "Why Choose Us",
    subheading: "Always on time and never delay a project",
    bgurl: "/images/earthmoves/whychooseus/bgimage.png",
    listItems: [
      {
        id: 1,
        title: "Experience and Expertise",
        description:
          "We were either the first or among the first to purchase JCBs, SANY and other brands of equipment",
        iconurl: "/images/earthmoves/whychooseus/Experience.png",
      },
      {
        id: 2,
        title: "Timely completion",
        description:
          "We were either the first or among the first to purchase JCBs, SANY and other brands of equipment",
        iconurl: "/images/earthmoves/whychooseus/FastTime.png",
      },
      {
        id: 3,
        title: "Skilled Team",
        description:
          "We were either the first or among the first to purchase JCBs, SANY and other brands of equipment",
        iconurl: "/images/earthmoves/whychooseus/skills.png",
      },
      {
        id: 4,
        title: "Client-focussed",
        description:
          "We were either the first or among the first to purchase JCBs, SANY and other brands of equipment",
        iconurl: "/images/earthmoves/whychooseus/Client.png",
      },
    ],
    images: [
      {
        id: 1,
        image: "/images/earthmoves/whychooseus/image1.png",
        radius: "tl-[40px]",
      },
      {
        id: 2,
        image: "/images/earthmoves/whychooseus/image2.png",
        radius: "tr-[40px]",
      },
      {
        id: 3,
        image: "/images/earthmoves/whychooseus/image3.png",
        radius: "bl-[40px]",
      },
      {
        id: 4,
        image: "/images/earthmoves/whychooseus/image4.png",
        radius: "br-[40px]",
      },
    ],
    listitems: [
      {
        id: 1,
        number: "100+",
        title: "Project Done",
        iconurl: "/images/earthmoves/whychooseus/Project.png",
      },
      {
        id: 2,
        number: "80+",
        title: "Satisfied Clients",
        iconurl: "/images/earthmoves/whychooseus/Clients.png",
      },
      {
        id: 3,
        number: "25+",
        title: "Machines & Equipment",
        iconurl: "/images/earthmoves/whychooseus/Delivery.png",
      },
      {
        id: 4,
        number: "10+",
        title: "Years Experience",
        iconurl: "/images/earthmoves/whychooseus/experiences.png",
      },
    ],
  };
  const partnersData: IPartnersprops = {
    heading: "Partners",
    subheading: "Who We Work With",
    image: "/images/earthmoves/partners/partnersimage.png",
  };
  const testimonialsData: ITestimonialsSectionProps = {
    words: [
      {
        name: "Arjun",
        desc: "Finding a rental property without dealing with brokers saved me so much time and money!",
        rating: 5,
      },
      {
        name: "Meera",
        desc: "I listed my apartment on the site and found a tenant within a week. Highly recommend!",
        rating: 4,
      },
      {
        name: "Karan",
        desc: "The property listings were accurate and up-to-date. Made my home search much easier.",
        rating: 4,
      },
      {
        name: "Divya",
        desc: "The customer support team was very helpful throughout the documentation process.",
        rating: 5,
      },
    ],
  };
  const HeroSectionData: IHerosectionprops = {
    bgimage: "/images/earthmoves/herosection/herosectionimage.png",
    heading: "Building The Future ",
    heading2: "",
    subheading: "",

    descriptions:
      "With years of experience in the industry. we have built a solid reputation for our commitment to quality.attention to details,andtimely project completion.",
    btntext: "View More",
    overlaycolor: {
      background:
        "linear-gradient(99.79deg, rgba(33, 34, 39, 0.58) -0.51%, rgba(33, 34, 39, 0.58) 18.58%, rgba(33, 34, 39, 0.58) 34.16%, rgba(255, 255, 255, 0) 100%)",
    },
    overlaystyle: "",
  };

  return (
    <>
      <div className="mb-[45px] md:mb-[64px]">
        <HeroSection
          {...HeroSectionData}
          onScrollToPackages={handleScrollToPackages}
        />
      </div>
      <div className="mb-[35px] md:mb-[64px] md:mt-[0px] mt-[120%]" ref={packagesRef}>
        <PackagesAndServices {...PackagesAndServicesData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <WhyToChooseDreamcasa {...WhyToChooseDreamcasaData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">

        <GoogleAdSense />
      </div>

      <div className="mb-[45px] md:mb-[64px]">
        <WhyChooseUs {...WhyChooseUsData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Partners {...partnersData} />
      </div>
      <div className="mb-[35px] md:mb-[64px]">
        <TestimonialsSection {...testimonialsData} />
      </div>
    </>
  );
}
