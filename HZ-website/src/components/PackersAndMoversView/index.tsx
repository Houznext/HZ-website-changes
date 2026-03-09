import React from "react";
import ServicesWeOffers, { IServicesWeOffersprops } from "./ServicesWeOffers";
import { LuArrowLeft } from "react-icons/lu";
import BreadCrumb from "../Products/components/BreadCrumb";
import Button from "@/common/Button";
import { useRouter } from "next/router";
import TestimonialsSection, {
  ITestimonialsSectionProps,
} from "@/components/Products/components/SubServices/Components/TestimonialsSection";
import OurWorkingProcess, {
  IOurWorkingProcessProps,
} from "./OurWorkingProcess";
import WhyPackersAndMoversInChennai, {
  IWhyPackersAndMoversProps,
} from "./WhypackaresAndMoversInChennai";
import ServicesBetterThanOthers, {
  IServicesBetterThanOthersProps,
} from "./ServicesBetterThanOthers";
import PackersAndmoversHeroSection, {
  IPackersAndMoversHeroSectionprops,
} from "./PackersAndMoversHeroSection";
import GoogleAdSense from "@/components/GoogleAdSense";
import FAQSComp from "@/components/Products/components/SubServices/Components/FAQSComp";
import HomeLoanFaqs, {
  IHomeLoanFaqsprops,
} from "@/components/Products/components/SubServices/LoansComponent/HomeLoanFaqs";

export default function PackersAndMoversView() {
  const router = useRouter();
  const PackersAndMoversHerosectionData: IPackersAndMoversHeroSectionprops = {
    bgimageurl:
      "/images/packersandmovers/packersandmoversherosection/herosection.png",
    gpsicon: "/images/packersandmovers/packersandmoversherosection/Gps.png",
    heading: "Your Trusted House Moving Partner",
    listItems: [
      {
        id: 1,
        image:
          "/images/packersandmovers/packersandmoversherosection/feedback.png",
        title: "Happy Customers ",
        description: "98.3 %",
      },
      {
        id: 2,
        image:
          "/images/packersandmovers/packersandmoversherosection/clients.png",
        title: "Clients ",
        description: "1000+",
      },
      {
        id: 3,
        image:
          "/images/packersandmovers/packersandmoversherosection/Pricetag.png",
        title: "Best Price ",
        description: "Lowest",
      },
      {
        id: 4,
        image:
          "/images/packersandmovers/packersandmoversherosection/FastestDelivery.png",
        title: "Faster ",
        description: "Delivery",
      },
    ],
  };
  const ServicesWeOffersData: IServicesWeOffersprops = {
    heading: "Services We Offers",
    listItems: [
      {
        id: 1,
        image: "/images/packersandmovers/servicesweoffers/withincity.png",
        title: "Within City",
        discount: "Upto 20% off",
      },
      {
        id: 2,
        image: "/images/packersandmovers/servicesweoffers/betweencity.png",
        title: "Between City",
        discount: "Upto 20% off",
      },
      {
        id: 3,
        image: "/images/packersandmovers/servicesweoffers/citytempo.png",
        title: "City Tempo",
        discount: "Upto 20% off",
      },
      {
        id: 4,
        image: "/images/packersandmovers/servicesweoffers/vehicleshifting.png",
        title: "Vehicle Shifting",
        discount: "Upto 20% off",
      },
    ],
  };
  const OurWorkingProcessData: IOurWorkingProcessProps = {
    heading: "Our Working Process",
    subheading: "How We Deliver Your Parce!",
    arrowicon: "/images/packersandmovers/ourworkingprocess/arrow.png",
    listItems: [
      {
        id: 1,
        image: "/images/packersandmovers/ourworkingprocess/parcelregister.png",
        title: "Parcel Register",
      },
      {
        id: 2,
        image: "/images/packersandmovers/ourworkingprocess/packaging.png",
        title: "Packaging",
      },
      {
        id: 3,
        image: "/images/packersandmovers/ourworkingprocess/safeloading.png",
        title: "Safe Loading",
      },
      {
        id: 4,
        image: "/images/packersandmovers/ourworkingprocess/deliverparcel.png",
        title: "Deliver Parcel",
      },
    ],
  };
  const WhyPackaresAndMoversData: IWhyPackersAndMoversProps = {
    heading: "Why OneCasa Packers and Movers in Chennai?",
    arrowicon: "/images/packersandmovers/whypackarsandmovers/arrowline.png",
    listItems: [
      {
        id: 1,
        image:
          "/images/packersandmovers/whypackarsandmovers/priceguarantee.png",
        title: "Lowest Price Guarantee",
        description:
          "Moving at a price you can afford - we’ll match any competitor’s quote",
      },

      {
        id: 2,
        image:
          "/images/packersandmovers/whypackarsandmovers/qualityservice.png",
        title: "Best Quality Service",
        description:
          "Moving at a price you can afford - we’ll match any competitor’s quote",
      },
      {
        id: 3,
        image: "/images/packersandmovers/whypackarsandmovers/reschedule.png",
        title: "Reschedule anytime",
        description:
          "Moving at a price you can afford - we’ll match any competitor’s quote",
      },
      {
        id: 4,
        image: "/images/packersandmovers/whypackarsandmovers/support.png",
        title: "Support Assistance",
        description:
          "Moving at a price you can afford - we’ll match any competitor’s quote",
      },
      {
        id: 5,
        image: "/images/packersandmovers/whypackarsandmovers/professional.png",
        title: "Professional Labour",
        description:
          "Moving at a price you can afford - we’ll match any competitor’s quote",
      },
    ],
  };
  const ServicesBetterThanOthersData: IServicesBetterThanOthersProps = {
    heading: "Our customers services better than others",
    title1: "OneCasa",
    title2: "Others",
    closeIcon: "/images/packersandmovers/servicesbetterthanothers/Close.png",
    listItems: [
      {
        id: 1,
        image: "/images/packersandmovers/servicesbetterthanothers/Verified.png",
        title: "Verified Professional Driver",
      },
      {
        id: 2,
        image: "/images/packersandmovers/servicesbetterthanothers/quality.png",
        title: "Regular Update",
      },
      {
        id: 3,
        image:
          "/images/packersandmovers/servicesbetterthanothers/Monitoring.png",
        title: "Bubble/ Foam Wrapping Of",
      },
      {
        id: 4,
        image: "/images/packersandmovers/servicesbetterthanothers/Zero.png",
        title: "On Demand Warehouse Storage",
      },
      {
        id: 5,
        image: "/images/packersandmovers/servicesbetterthanothers/OnTime.png",
        title: "Damage Assurance",
      },
    ],
    otherslistItems: [
      {
        id: 1,
        title: "No Verified Professional Driver",
      },
      {
        id: 2,
        title: "No Regular Update",
      },
      {
        id: 3,
        title: "No Bubble/ Foam Wrapping Of",
      },
      {
        id: 4,
        title: "No On Demand Warehouse Storage",
      },
      {
        id: 5,
        title: "No Damage Assurance",
      },
    ],
  };
  const testimonialsData: ITestimonialsSectionProps = {
    words: [
      {
        name: "Nisha",
        desc: "The quality of the furniture is exceptional, with a perfect blend of style and comfort. It has completely transformed my living space!",
        rating: 5,
      },
      {
        name: "Trisha",
        desc: "The craftsmanship is top-notch, and the designs are modern yet timeless. Every piece adds a unique touch to my home.",
        rating: 5,
      },
      {
        name: "Charan",
        desc: "I am impressed by the durability and finish of the furniture. It not only looks great but also feels sturdy and well-made.",
        rating: 5,
      },
      {
        name: "Bhargav",
        desc: "The furniture exceeded my expectations in both quality and design. It has become a focal point in my living room.",
        rating: 5,
      },
    ],
  };
  const FaqsData: IHomeLoanFaqsprops = {
    heading: "Frequently Asked Questions",
    Faqs: [
      {
        id: 1,
        question: "Can I change my movement date?",
        answer:
          "Yes, you can change your moving date by notifying your packers and movers as early as possible. Changes may be subject to availability and could incur rescheduling fees, especially during peak times. Flexible providers might accommodate your new date without extra charges. Clear communication ensures a smooth adjustment.",
      },
      {
        id: 2,
        question:
          "Is it possible to find a better price for packers and movers?",
        answer:
          "Yes, you can find better prices for packers and movers by comparing quotes from multiple service providers. Opt for off-peak days or mid-week relocations to save costs. Declutter and move only essential items to reduce the load and expenses. Negotiating and booking in advance also helps secure competitive rates.",
      },
      {
        id: 3,
        question:
          "Can packers and movers in Chennai assist with storage services if needed?",
        answer:
          "Yes, many packers and movers in Chennai offer storage services for short or long-term needs. These facilities are secure, climate-controlled, and suitable for household or commercial items. Storage solutions can be customized based on the volume and duration required. Discuss this option during your initial consultation to ensure availability and cost clarity.",
      },
      {
        id: 4,
        question:
          "Are there any items that packers and movers in Chennai do not transport?",
        answer:
          "Yes, packers and movers in Chennai typically do not transport hazardous items such as explosives, flammable liquids, or corrosive substances. They may also refuse to move perishable goods, plants, pets, and valuable documents or jewelry. It’s recommended to handle these items personally. Always check with your chosen service provider for specific exclusions. Proper communication ensures a smooth relocation process.",
      },
      {
        id: 5,
        question:
          "How early should I book packers and movers in Chennai for my relocation?",
        answer:
          "It’s best to book packers and movers in Chennai at least 2-4 weeks before your relocation date. This ensures availability, especially during weekends or peak seasons. Early booking also allows time for cost comparison and planning. For long-distance moves, consider booking 4-6 weeks in advance.",
      },
    ],
  };
  return (
    <>
      <div className="mb-[45px] md:mb-[64px]">
        <PackersAndmoversHeroSection {...PackersAndMoversHerosectionData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] ml-[40px]">
        <ServicesWeOffers {...ServicesWeOffersData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] ml-[40px]">
        <OurWorkingProcess {...OurWorkingProcessData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] ml-[40px]">
        <WhyPackersAndMoversInChennai {...WhyPackaresAndMoversData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] ml-[40px]">
        <ServicesBetterThanOthers {...ServicesBetterThanOthersData} />
      </div>
      <div className="md:px-8 px-3 mb-[45px] max-w-[98%] mx-auto md:mb-[64px] flex flex-col items-center gap-4">
        <h1 className="font-bold md:text-[24px] text-[18px] ">
          Recommended for You
        </h1>
        <GoogleAdSense />
      </div>
      <div className="mb-[45px] md:mb-[64px] max-w-[800px] min-h-[338px]">
        <TestimonialsSection {...testimonialsData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] max-w-[800px] min-h-[378px]">
        <HomeLoanFaqs {...FaqsData} />
      </div>
    </>
  );
}
