import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import ServicesSelectedView from "@/components/LivebuildComponent/ServicesSelectedView";

function ServicesSelected() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="LiveBuild | Houznext"
        description="Review selected services for your LiveBuild project, including property information and construction scope."
        keywords="LiveBuild, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
      />

      <ServicesSelectedView />
    </div>
  );
}

export default withUserLayout(ServicesSelected);
