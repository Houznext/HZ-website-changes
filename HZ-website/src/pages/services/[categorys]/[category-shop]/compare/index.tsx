import EarthMovesComponent from "@/components/EarthMovesComponent";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";

import React from "react";
import SEO from '@/components/SEO';
import CompareView from "@/components/Products/components/SubServices/FurnitureComponent/furnitureItems/ItemsSection/CompareView";


const Compare = () => {
  return (
    <div>
      <SEO
        title="Compare Furniture, Home Decor & Electronics | Prices, Features & Reviews | OneCasa"
        description="Compare furniture, home decor, and electronics on OneCasa. View prices, features, specifications, and customer ratings side by side to choose the best products for your home."
        keywords="Compare Furniture, Furniture Comparison, Home Decor Comparison, Electronics Comparison, Product Comparison, Furniture Prices, Electronics Features, OneCasa Compare"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <CompareView />
    </div>
  );
};

export default withGeneralLayout(Compare);
