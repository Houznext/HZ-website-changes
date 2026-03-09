import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import ElectronicsComponent from "@/components/Products/components/ElectronicsComponent";
import SEO from '@/components/SEO';

const Electronics = () => {
  return (
    <div>
      <SEO
        title="Buy Electronics Online India | Smart Devices, Appliances & Gadgets | OneCasa"
        description="Shop electronics online at OneCasa. Smart home devices, kitchen appliances, lighting, fans & more with best prices. Free delivery in Hyderabad, Bangalore, Mumbai & more cities."
        keywords="buy electronics online India, smart home devices, home appliances Hyderabad, kitchen appliances, LED lights, ceiling fans, smart gadgets, OneCasa electronics, electronics store online India, home electronics Bangalore"
        imageUrl="https://www.onecasa.in/images/logobb.png"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Services", item: "https://www.onecasa.in/services/electronics" },
          { name: "Electronics", item: "https://www.onecasa.in/services/electronics" },
        ]}
        faq={[
          { question: "Does OneCasa deliver electronics across India?", answer: "Yes, OneCasa delivers electronics across all major cities including Hyderabad, Bangalore, Mumbai, Chennai, Pune, and Delhi with safe packaging and tracking." },
          { question: "What electronics can I buy on OneCasa?", answer: "OneCasa offers a wide range including smart home devices, kitchen appliances, lighting solutions, fans, and home automation products." },
        ]}
      />
      <ElectronicsComponent />
    </div>
  );
};

export default withGeneralLayout(Electronics);
