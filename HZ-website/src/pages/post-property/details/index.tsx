import LoginLayout from "@/components/Layouts/LoginLayout";
import PropertySteps from "@/components/PublicPostProperty/PropertySteps";
import React from "react";
import SEO from '@/components/SEO';


const PropDetails = () => {
  return (
    <div className="w-full mx-auto max-w-[1640px]">
      <SEO
        title="Post Property Details | List Your Property in 4 Easy Steps | Houznext"
        description="Complete your property listing in just four steps—Basic Info, Location Details, Property Features, and Media Upload. Sell or rent your property effortlessly with Houznext."
        keywords="Post Property Online,Property Listing Steps,Basic Property Info,Location Details,Real Estate Features,Upload Property Photos,Add Property Videos,Houznext Property Submission"
/>
      <PropertySteps />
    </div>
  );
};

export default LoginLayout(PropDetails);
