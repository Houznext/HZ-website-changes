import React from "react";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import ElectronicsComponent from "@/components/Products/components/ElectronicsComponent";
import SEO from '@/components/SEO';


const electronics = () => {
  return (
    <div>
      <SEO
        title="Buy Electronics Online | Latest Gadgets, Home Appliances & Smart Devices | OneCasa"
        description="Discover top-quality electronics, including smartphones, laptops, home appliances, and smart devices. Shop the latest technology at OneCasa with great deals!"
        keywords="Electronics, Buy Electronics Online, Smartphones, Laptops, Home Appliances, Smart Devices, Gadgets, Best Electronics Deals, Tech Accessories, Consumer Electronics"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <ElectronicsComponent />
    </div>
  );
};
export default withGeneralLayout(electronics);
