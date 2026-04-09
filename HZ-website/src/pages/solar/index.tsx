import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SolarPage from "@/components/SolarPage";
import React from "react";
import SEO from '@/components/SEO';

const SolarServices = () => {
  return (
    <div>
      <SEO
        title="Solar Panel Installation in Hyderabad, Bangalore & India | Solar Energy Solutions | Houznext"
        description="Get solar panels installed for your home or business with Houznext. Expert solar installation, maintenance and consultation in Hyderabad, Bangalore, Mumbai, Chennai & Pune. Save up to 90% on electricity bills."
        keywords="solar panel installation Hyderabad, solar panels Bangalore, solar energy India, residential solar installation, commercial solar panels, solar power system cost, rooftop solar, solar panel price India, Houznext solar, green energy solutions, solar subsidy India"
service={{
          name: "Solar Panel Installation & Consultation",
          description: "Professional residential and commercial solar panel installation, maintenance, and consultation services across India. Save up to 90% on electricity with Houznext solar solutions.",
          areaServed: ["Hyderabad", "Bangalore", "Mumbai", "Chennai", "Pune", "Delhi"],
          providerType: "HomeAndConstructionBusiness",
        }}
        breadcrumbs={[
          { name: "Home", item: "https://houznext.com/" },
          { name: "Solar Energy Solutions", item: "https://houznext.com/solar" },
        ]}
        faq={[
          { question: "How much does solar panel installation cost in India?", answer: "Solar panel installation costs range from ₹40,000 to ₹6,00,000 depending on system size, panel type, and location. Houznext offers competitive pricing with subsidy assistance." },
          { question: "How much can I save with solar panels?", answer: "Most homeowners save 70-90% on electricity bills. A typical 3kW system can save ₹2,000-3,500 per month depending on usage and location." },
          { question: "Is solar panel installation available in my city?", answer: "Houznext provides solar installation services in Hyderabad, Bangalore, Mumbai, Chennai, Pune, Delhi and other major cities across India." },
          { question: "What is the payback period for solar panels?", answer: "The typical payback period is 4-6 years, after which you enjoy virtually free electricity for the remaining 20+ years of panel life." },
        ]}
      />
      <SolarPage />
    </div>
  );
};

export default withGeneralLayout(SolarServices);
