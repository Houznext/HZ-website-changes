import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';
import PropertyDocumentsView from "@/components/LivebuildComponent/PropertyDocumentsView";

export const dynamic = "force-dynamic";

function PropertyDocuments() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="LiveBuild | Houznext"
        description="View documents for your LiveBuild project, including property information and construction records."
        keywords="LiveBuild, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
        imageUrl="https://www.houznext.com/images/houznext-logo.png"
      />

      <PropertyDocumentsView />
    </div>
  );
}

export default withUserLayout(PropertyDocuments);
