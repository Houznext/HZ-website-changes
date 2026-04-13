import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


import PropertyDocumentsView from "@/components/LivebuildComponent/PropertyDocumentsView";
import ProgressImagesView from "@/components/LivebuildComponent/ProgressImagesView";

function ProgressImages() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="LiveBuild | Houznext"
        description="View progress photos for your LiveBuild project. Track room-by-room updates, property information, and construction milestones."
        keywords="LiveBuild, Home Construction, Property Development, Houznext Builders, House Building Experts, Construction Services, Real Estate Builders"
/>

      <ProgressImagesView />
    </div>
  );
}

export default withUserLayout(ProgressImages);
