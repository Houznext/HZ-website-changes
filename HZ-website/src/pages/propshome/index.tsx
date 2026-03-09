import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import PropertiesHome from "@/components/PropertyComp/Properties";
import React from "react";
import SEO from '@/components/SEO';


const Properties = () => {
  return (
    <div>
      <SEO
        title="Buy, Rent, or Invest in Residential & Commercial Properties | OneCasa"
        description="Find the perfect property for your needs—buy, rent, or invest in residential homes, commercial spaces, and plots. Explore verified listings with expert insights on OneCasa."
        keywords="OneCasa Properties Properties for Sale,Properties for Rent,Real Estate Listings,Buy a Home,Rental Properties,Luxury Homes,Investment Properties,OneCasa Real Estate,Commercial Real Estate,Residential Properties,Plots for Sale,Investment Properties,Office Spaces,OneCasa Listings"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <PropertiesHome />
    </div>
  );
};

export default withGeneralLayout(Properties);
