import withUserLayout from "@/components/Layouts/UserLayout";
import UserPropertyView from "@/components/Property";
import React from "react";
import SEO from '@/components/SEO';


const UserProperty = () => {
  return (
    <div className="w-full">
      <SEO
        title="Explore Properties | OneCasa"
        description="Find your dream property with OneCasa. Browse a wide range of real estate listings, including residential and commercial properties."
        keywords="Properties for Sale, OneCasa Properties, Real Estate Listings, Buy Property, Residential Properties, Commercial Properties, Property Search, Home Listings"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />

      <UserPropertyView />
    </div>
  );
};

export default withUserLayout(UserProperty);
