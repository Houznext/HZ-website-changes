import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import MaterialsView from "@/components/LivebuildComponent/MaterialsView";
import SEO from "@/components/SEO";

const MaterialsPage = () => {
  return (
    <div className="flex w-full">
      <SEO
        title="Materials | LiveBuild | Houznext"
        description="View and track all construction materials for your LiveBuild project."
        keywords="Construction Materials, Building Materials, Material Tracking, Houznext Builder"
      />
      <MaterialsView />
    </div>
  );
};

export default withUserLayout(MaterialsPage);
