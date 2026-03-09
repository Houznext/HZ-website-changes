import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import MaterialsView from "@/components/CustomBuilder/MaterialsView";
import SEO from "@/components/SEO";

const MaterialsPage = () => {
  return (
    <div className="flex w-full">
      <SEO
        title="Materials | Custom Builder | OneCasa"
        description="View and track all construction materials for your custom builder project."
        keywords="Construction Materials, Building Materials, Material Tracking, OneCasa Builder"
      />
      <MaterialsView />
    </div>
  );
};

export default withUserLayout(MaterialsPage);
