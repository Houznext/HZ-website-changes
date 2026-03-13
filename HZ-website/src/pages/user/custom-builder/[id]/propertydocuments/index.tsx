import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import PropertyDocumentsView from "@/components/CustomBuilder/PropertyDocumentsView";

function PropertyDocuments() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Custom Builders | Houznext"
        description="Find expert custom builders for your dream home. View detailed profiles, property information, and construction progress."
        keywords="Custom Builders, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
        imageUrl="https://www.houznext.com/images/houznext-logo.png"
      />

      <PropertyDocumentsView />
    </div>
  );
}

export default withUserLayout(PropertyDocuments);
