import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import React from "react";
import ProductListItems from "@/components/Products/components/SubServices/FurnitureComponent/furnitureItems";
import SEO from '@/components/SEO';

import { useRouter } from "next/router";


const Categoryshop = () => {
  const router = useRouter();
  const { categorys } = router.query;
  return (
    <div>
      <SEO
        title="Explore Categories | Home Decor, Furniture & Electronics | OneCasa"
        description="Browse a wide range of home decor, furniture, and electronics at OneCasa. Find stylish interiors, high-quality furniture, and the latest electronic gadgets for your home."
        keywords="Home Decor, Furniture, Electronics, Modern Interiors, Home Furnishing, Smart Gadgets, Home Appliances, Stylish Furniture, OneCasa Categories"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <div>
        <ProductListItems />
      </div>
    </div>
  );
};

export default withGeneralLayout(Categoryshop);
