import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import PropertyInformationView from "@/components/LivebuildComponent/PropertyInformationView";

function propertyInformation() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="LiveBuild | Houznext"
        description="View property information and construction details for your LiveBuild project."
        keywords="LiveBuild, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
/>

      <PropertyInformationView />
    </div>
  );
}

export default withUserLayout(propertyInformation);
