import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import ConstructionForBusinessComponent from "@/components/Products/components/SubServices/ConstructionForBusinessComponent";
import React from "react";
import SEO from '@/components/SEO';


const ConstructionForBusiness = () => {
  return (
    <div>
      <SEO
        title="Expert Commercial Construction Services | Office, Retail & Industrial Buildings | OneCasa"
        description="OneCasa specializes in top-quality commercial construction services, including office spaces, retail stores, industrial buildings, and business infrastructure development."
        keywords="Commercial Construction, Business Construction, Office Building Contractors, Retail Space Construction, Industrial Construction, Infrastructure Development, OneCasa Commercial Services"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <ConstructionForBusinessComponent />
    </div >
  );
};

export default withGeneralLayout(ConstructionForBusiness);
