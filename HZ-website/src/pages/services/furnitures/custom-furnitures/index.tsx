import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import CustomFurniture from "@/components/Products/components/SubServices/CustomFurniture";
import React from "react";
import SEO from '@/components/SEO';


const CustomFurnitures = () => {
  return (
    <div>
      <SEO
        title="Custom Furniture | Bespoke Designs for Home & Office | OneCasa"
        description="Get handcrafted custom furniture tailored to your style and space. Explore bespoke home and office furniture with premium materials and expert craftsmanship."
        keywords="Custom Furniture, Bespoke Furniture, Handmade Furniture, Personalized Furniture, Home Furniture, Office Furniture, Tailor-Made Furniture, OneCasa Furniture"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <CustomFurniture />
    </div>
  );
};

export default withGeneralLayout(CustomFurnitures);
