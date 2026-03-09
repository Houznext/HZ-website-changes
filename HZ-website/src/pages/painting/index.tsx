import React from "react";
import PaintingComponent from "@/components/Products/components/SubServices/PaintingComponent";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';

const Painting = () => {
  return (
    <div>
      <SEO
        title="Professional Painting Services in Hyderabad, Bangalore & India | Home & Commercial | OneCasa"
        description="Transform your home or office with OneCasa's expert painting services. Interior & exterior painting, texture painting, waterproofing in Hyderabad, Bangalore, Mumbai, Chennai & Pune. Free estimate."
        keywords="painting services Hyderabad, house painting Bangalore, interior painting India, exterior painting, wall painting cost, texture painting, waterproofing services, commercial painting, home painting near me, OneCasa painting, painting contractor"
        imageUrl="https://www.onecasa.in/images/logobb.png"
        service={{
          name: "Professional Home & Commercial Painting Services",
          description: "Expert interior and exterior painting, texture painting, and waterproofing services with premium paints and trained professionals. Free consultation and estimates.",
          areaServed: ["Hyderabad", "Bangalore", "Mumbai", "Chennai", "Pune", "Delhi"],
          providerType: "HomeAndConstructionBusiness",
        }}
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Painting Services", item: "https://www.onecasa.in/painting" },
        ]}
        faq={[
          { question: "How much does house painting cost in India?", answer: "House painting costs ₹12-35 per sq ft depending on paint quality, surface prep, and location. OneCasa provides free estimates with transparent pricing." },
          { question: "What types of painting services does OneCasa offer?", answer: "OneCasa offers interior painting, exterior painting, texture painting, waterproofing, wood polishing, and commercial painting services across major Indian cities." },
          { question: "How long does it take to paint a 2BHK apartment?", answer: "A standard 2BHK apartment takes 3-5 days including surface preparation, priming, and two coats of paint. Timelines vary with surface condition." },
        ]}
      />
      <PaintingComponent />
    </div>
  );
};

export default withGeneralLayout(Painting);
