import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import FurnitureComponent from "@/components/Products/components/SubServices/FurnitureComponent";
import React from "react";
import SEO from '@/components/SEO';

function Furnitures() {
  return (
    <div>
      <SEO
        title="Buy Furniture Online in India | Modern & Custom Furniture | OneCasa"
        description="Shop premium furniture online at OneCasa. Living room, bedroom, dining & office furniture with custom options. Free delivery in Hyderabad, Bangalore, Mumbai, Chennai & Pune."
        keywords="buy furniture online India, modern furniture Hyderabad, custom furniture Bangalore, living room furniture, bedroom furniture, dining table, sofa set online, modular furniture, office furniture, OneCasa furniture, affordable furniture India"
        imageUrl="https://www.onecasa.in/images/logobb.png"
        service={{
          name: "Custom & Modular Furniture",
          description: "Premium quality furniture including living room, bedroom, dining, and office collections. Custom-made options available with free delivery across major cities.",
          areaServed: ["Hyderabad", "Bangalore", "Mumbai", "Chennai", "Pune", "Delhi"],
          providerType: "HomeAndConstructionBusiness",
        }}
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Services", item: "https://www.onecasa.in/services/furnitures" },
          { name: "Furniture", item: "https://www.onecasa.in/services/furnitures" },
        ]}
        faq={[
          { question: "Does OneCasa deliver furniture across India?", answer: "Yes, OneCasa delivers furniture across all major Indian cities including Hyderabad, Bangalore, Mumbai, Chennai, Pune, and Delhi with professional assembly services." },
          { question: "Can I get custom furniture made through OneCasa?", answer: "Yes! OneCasa offers custom furniture design and manufacturing. Share your requirements and our team will create personalized furniture pieces for your space." },
          { question: "What is the return policy for furniture?", answer: "OneCasa offers hassle-free returns within the specified return window for each product. Check individual product pages for specific return policies." },
        ]}
      />
      <FurnitureComponent />
    </div>
  );
}

export default withGeneralLayout(Furnitures);
