
import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';

import ProjectOverViewComponent from "@/components/LivebuildComponent/ProjectOverViewComponent";

function ProjectOverView() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="LiveBuild | Houznext"
        description="See your LiveBuild project overview: profiles, property information, and construction progress."
        keywords="LiveBuild, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
      />

      <ProjectOverViewComponent />
    </div>
  );
}

export default withUserLayout(ProjectOverView);
