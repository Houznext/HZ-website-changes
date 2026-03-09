import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import PropertyDocumentsView from "@/components/CustomBuilder/PropertyDocumentsView";
import ProgressImagesView from "@/components/CustomBuilder/ProgressImagesView";

function ProgressImages() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Custom Builders | OneCasa"
        description="Find expert custom builders for your dream home. View detailed profiles, property information, and construction progress."
        keywords="Custom Builders, Home Construction, Property Development, OneCasa Builders, House Building Experts, Construction Services, Real Estate Builders"
        imageUrl="https://www.onecasa.in/images/onecasa-logo.png"
      />

      <ProgressImagesView />
    </div>
  );
}

export default withUserLayout(ProgressImages);
