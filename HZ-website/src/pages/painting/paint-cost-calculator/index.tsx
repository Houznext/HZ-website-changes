import React from "react";
import PaintingCostEstimator from "@/components/Products/components/SubServices/PaintingComponent/PaintingCostEstimator";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from '@/components/SEO';


const PaintCostEstimator = () => {
  return (
    <div>
      <SEO
        title="Painting Services | Expert Home & Commercial Painting | OneCasa"
        description="Transform your space with professional painting services. Get high-quality home and commercial painting with premium colors and expert craftsmanship."
        keywords="Painting Services, Home Painting, Commercial Painting, Interior Painting, Exterior Painting, Wall Painting, House Painting, Professional Painters, OneCasa Painting"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <h1>
        <PaintingCostEstimator />
      </h1>
    </div>
  );
};

export default withGeneralLayout(PaintCostEstimator);
