import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SolarPage from "@/components/SolarPage";
import React from "react";
import SEO from '@/components/SEO';

const SolarServices = () => {
  return (
    <div>
      <SEO
        title="Solar Panel Installation in Hyderabad, Bangalore & India | Solar Energy Solutions | OneCasa"
        description="Get solar panels installed for your home or business with OneCasa. Expert solar installation, maintenance and consultation in Hyderabad, Bangalore, Mumbai, Chennai & Pune. Save up to 90% on electricity bills."
        keywords="solar panel installation Hyderabad, solar panels Bangalore, solar energy India, residential solar installation, commercial solar panels, solar power system cost, rooftop solar, solar panel price India, OneCasa solar, green energy solutions, solar subsidy India"
        imageUrl="https://www.onecasa.in/images/logobb.png"
        service={{
          name: "Solar Panel Installation & Consultation",
          description: "Professional residential and commercial solar panel installation, maintenance, and consultation services across India. Save up to 90% on electricity with OneCasa solar solutions.",
          areaServed: ["Hyderabad", "Bangalore", "Mumbai", "Chennai", "Pune", "Delhi"],
          providerType: "HomeAndConstructionBusiness",
        }}
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Solar Energy Solutions", item: "https://www.onecasa.in/solar" },
        ]}
        faq={[
          { question: "How much does solar panel installation cost in India?", answer: "Solar panel installation costs range from ₹40,000 to ₹6,00,000 depending on system size, panel type, and location. OneCasa offers competitive pricing with subsidy assistance." },
          { question: "How much can I save with solar panels?", answer: "Most homeowners save 70-90% on electricity bills. A typical 3kW system can save ₹2,000-3,500 per month depending on usage and location." },
          { question: "Is solar panel installation available in my city?", answer: "OneCasa provides solar installation services in Hyderabad, Bangalore, Mumbai, Chennai, Pune, Delhi and other major cities across India." },
          { question: "What is the payback period for solar panels?", answer: "The typical payback period is 4-6 years, after which you enjoy virtually free electricity for the remaining 20+ years of panel life." },
        ]}
      />
      <SolarPage />
    </div>
  );
};

export default withGeneralLayout(SolarServices);
