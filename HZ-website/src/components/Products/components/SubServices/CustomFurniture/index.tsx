import React from "react";
import CustomHeroSection, {
  ICustomHeroSectionprops,
} from "./CustomHerosection";
import CustomFurnitureOrder, {
  ICustomFurnitureOrderprops,
} from "./CustomFurnitureOrder";
import CustomFurnitureProcess, {
  ICustomFurnitureProcessprops,
} from "./CustomFurnitureProcess";
import OurCustomFurniture, {
  IOurCustomFurnitureprops,
} from "./OurCustomFurniture";
import FurnitureCustomization, {
  IFurnitureCustomizationprops,
} from "./FurnitureCustomization";
import Customization, { ICustomizationprops } from "./Customization";
import AlreadyCustomizedFurniture, {
  IAlreadyCustomizedFurnitureprops,
} from "./AlreadyCustomizedFurniture";
import FrequentlyAskedQuestion, {
  IFrequentlyAskedQuestionsprops,
} from "./FrequentlyAskedQuestions";

export default function CustomFurniture() {
  const CustomHeroSectionData: ICustomHeroSectionprops = {
    image:
      "/icons/custom-builder/subservices/customfurniture/customherosection/herosection.png",
  };
  const CustomFurnitureOrderData: ICustomFurnitureOrderprops = {
    heading: "Custom Furniture “Made to Order”",
    subheading:
      "We make the process of creating customised furniture simple with the help of our skilled designer staff. Whether you're looking for online bespoke furniture to personalize your Dream Home. We have got you covered. So go ahead, let your imagination run wild, right now to book your custom furniture.",
    image:
      "/icons/custom-builder/subservices/customfurniture/customfurnitureorder/call.png",
    whatsappimage:
      "/icons/custom-builder/subservices/customfurniture/customization/whatsapp.png",
  };
  const CustomFurnitureProcessData: ICustomFurnitureProcessprops = {
    heading: " “Our Process” of custom furniture",
    arrowicon:
      "/icons/custom-builder/subservices/customfurniture/customfurnitureprocess/arrowicon.png",
    listItems: [
      {
        id: 1,
        title: "Share your Idea",
        description:
          "Our furniture designers understand your requirements closely to craft a perfect piece.",
        image:
          "/icons/custom-builder/subservices/customfurniture/customfurnitureprocess/shareyouridea.png",
      },
      {
        id: 2,
        title: "Designing",
        description:
          "Your idea is converted into a workable 3D design for further approvals and confirmations.",
        image:
          "/icons/custom-builder/subservices/customfurniture/customfurnitureprocess/designing.png",
      },
      {
        id: 3,
        title: "Manufacturing",
        description:
          "As soon as our team receives the confirmation, manufacturing is initiated for your custom furniture.",
        image:
          "/icons/custom-builder/subservices/customfurniture/customfurnitureprocess/manufacturing.png",
      },
      {
        id: 4,
        title: "Delivery",
        description:
          "Each custom order is treated with high priority & we ensured to deliver it on time.",
        image:
          "/icons/custom-builder/subservices/customfurniture/customfurnitureprocess/delivery.png",
      },
    ],
  };
  const OurCustomFurnitureData: IOurCustomFurnitureprops = {
    heading: "Our Custom Furniture better than others",
    listItems: [
      {
        id: 1,
        image:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/custom1.png",
      },
      {
        id: 2,
        image:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/custom2.png",
      },
    ],
    dataItems: [
      {
        id: 1,
        image:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/Sofa.png",
        title: "Manufactures",
        price: "₹500",
        price2: "₹500",
        priceimage: "",
      },
      {
        id: 2,
        image:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/Shop.png",
        title: "Wholesales",
        priceimage:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/Cross.png",
        price2: "₹700",
        price: "",
      },
      {
        id: 3,
        image:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/Office.png",
        title: "Retailer",
        priceimage:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/Cross.png",
        price2: "₹1000",
        price: "",
      },
      {
        id: 4,
        image:
          "/icons/custom-builder/subservices/customfurniture/ourcustomfurniture/Delivery.png",
        title: "Final Prize",
        price: "₹600",
        price2: "₹2200",
        priceimage: "",
      },
    ],
  };
  const FurnitureCustomizationData: IFurnitureCustomizationprops = {
    heading: "Furnitures For Customization",
    subheading:
      "Our work is to provide you with sustainable custom furniture options, and ready-to-order furniture that combines quality and affordability. Whether you’re looking for custom furniture for home offices or modern interiors, we’ve got something special for every style.",
    listItems: [
      {
        id: 1,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/armchairs.png",
        title: "Arm Chairs",
        width: "w-[74px]",
      },
      {
        id: 2,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/dressingtable.png",
        title: "Dressing Table",
        width: "w-[96px]",
      },
      {
        id: 3,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/tvunit.png",
        title: "TV Unit",
        width: "w-[50px]",
      },
      {
        id: 4,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/bedsidetables.png",
        title: "Bed side Table",
        width: "w-[96px]",
      },
      {
        id: 5,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/studytable.png",
        title: "Study Table",
        width: "w-[77px]",
      },
      {
        id: 6,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/diningtables.png",
        title: "Dining Tables",
        width: "w-[88px]",
      },
      {
        id: 7,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/bookshelfs.png",
        title: "Book shelfs",
        width: "w-[76px]",
      },
      {
        id: 8,
        image:
          "/icons/custom-builder/subservices/customfurniture/furniturecustomization/diningtablesets.png",
        title: "Dinning  Sets",
        width: "w-[122px]",
      },
    ],
  };
  const CustomizationData: ICustomizationprops = {
    whatsappicon:
      "/icons/custom-builder/subservices/customfurniture/customization/whatsappicon.png",
    whatsappimage:
      "/icons/custom-builder/subservices/customfurniture/customization/whatsapp.png",
  };
  const AlreadyCustomizedFurnitureData: IAlreadyCustomizedFurnitureprops = {
    heading: "Already customized Furniture",
    listItems: [
      {
        id: 1,
        image:
          "/icons/custom-builder/subservices/customfurniture/alreadycustomizedfurniture/image21.png",
        width: 451,
      },
      {
        id: 2,
        image:
          "/icons/custom-builder/subservices/customfurniture/alreadycustomizedfurniture/image22.png",
        width: 450,
      },
      {
        id: 3,
        image:
          "/icons/custom-builder/subservices/customfurniture/alreadycustomizedfurniture/image23.png",
        width: 451,
      },
      {
        id: 4,
        image:
          "/icons/custom-builder/subservices/customfurniture/alreadycustomizedfurniture/image24.png",
        width: 451,
      },
      {
        id: 5,
        image:
          "/icons/custom-builder/subservices/customfurniture/alreadycustomizedfurniture/image25.png",
        width: 450,
      },
      {
        id: 6,
        image:
          "/icons/custom-builder/subservices/customfurniture/alreadycustomizedfurniture/image26.png",
        width: 451,
      },
    ],
  };
  const FrequentlyAskedQuestionsData: IFrequentlyAskedQuestionsprops = {
    heading: "Frequently Asked Questions",
    image:
      "/icons/custom-builder/subservices/customfurniture/frequentlyaskedquestions/frequentlyaskedquestion.png",
    Faqs: [
      {
        question: "What services are included under Furniture?",
        answer:
          "Furniture services encompass a range of offerings designed to meet various needs. These include custom design services, where furniture is tailored to individual preferences and space requirements, ensuring a unique and personalized touch.",
      },
      {
        question: "What services are included under Furniture?",
        answer:
          "Furniture services encompass a range of offerings designed to meet various needs. These include custom design services, where furniture is tailored to individual preferences and space requirements, ensuring a unique and personalized touch.",
      },
      {
        question: "What services are included under Furniture?",
        answer:
          "Furniture services encompass a range of offerings designed to meet various needs. These include custom design services, where furniture is tailored to individual preferences and space requirements, ensuring a unique and personalized touch.",
      },
      {
        question: "What services are included under Furniture?",
        answer:
          "Furniture services encompass a range of offerings designed to meet various needs. These include custom design services, where furniture is tailored to individual preferences and space requirements, ensuring a unique and personalized touch.",
      },
      {
        question: "What services are included under Furniture?",
        answer:
          "Furniture services encompass a range of offerings designed to meet various needs. These include custom design services, where furniture is tailored to individual preferences and space requirements, ensuring a unique and personalized touch.",
      },
    ],
  };
  return (
    <>
      <div className="mb-[45px] md:mb-[64px]">
        <CustomHeroSection {...CustomHeroSectionData} />
      </div>
      <div className="mb-[45px] md:mb-[64px] md:mt-[0px] mt-[490px]">
        <CustomFurnitureOrder {...CustomFurnitureOrderData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <CustomFurnitureProcess {...CustomFurnitureProcessData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <OurCustomFurniture {...OurCustomFurnitureData} />
      </div>

      <div className="mb-[45px] md:mb-[64px]">
        <FurnitureCustomization {...FurnitureCustomizationData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <Customization {...CustomizationData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <AlreadyCustomizedFurniture {...AlreadyCustomizedFurnitureData} />
      </div>
      <div className="mb-[45px] md:mb-[64px]">
        <FrequentlyAskedQuestion {...FrequentlyAskedQuestionsData} />
      </div>
    </>
  );
}
