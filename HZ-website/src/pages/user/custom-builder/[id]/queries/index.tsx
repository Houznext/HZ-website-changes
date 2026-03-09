import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import ServicesSelectedView from "@/components/CustomBuilder/ServicesSelectedView";
import QueriesView from "@/components/CustomBuilder/QueriesView";

function Queries() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Custom Builders | OneCasa"
        description="Find expert custom builders for your dream home. View detailed profiles, property information, and construction progress."
        keywords="Custom Builders, Home Construction, Property Development, OneCasa Builders, House Building Experts, Construction Services, Real Estate Builders"
        imageUrl="https://www.onecasa.in/images/onecasa-logo.png"
      />

      <QueriesView />
    </div>
  );
}

export default withUserLayout(Queries);
