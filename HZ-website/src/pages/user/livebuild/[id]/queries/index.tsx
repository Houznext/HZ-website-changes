import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import ServicesSelectedView from "@/components/LivebuildComponent/ServicesSelectedView";
import QueriesView from "@/components/LivebuildComponent/QueriesView";

function Queries() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="LiveBuild | Houznext"
        description="Ask questions and get answers about your LiveBuild project, property details, and construction progress."
        keywords="LiveBuild, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
/>

      <QueriesView />
    </div>
  );
}

export default withUserLayout(Queries);
