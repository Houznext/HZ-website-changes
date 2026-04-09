import CustomBuilderView from "@/components/CustomBuilder";
import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


function Custom() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Custom Home Builders | Tech-Enabled Construction & Interiors | Houznext"
        description="Build your dream home with Houznext’s custom builder services. Enjoy tech-enabled solutions, real-time tracking, 12+ years of expertise, and 100% Vastu compliance. Serving Telangana, Andhra Pradesh, Mumbai, Pune, Bangalore."
        keywords="Custom Builders, Home Construction, Tech-Enabled Construction, Vastu Compliant Homes, Real-Time Tracking, House Building Experts, Houznext Builders, Dream Home Builders, Residential Construction India, End-to-End Interiors"
breadcrumbs={[
          { name: "Home", item: "https://houznext.com/" },
          { name: "Custom Builder", item: "https://houznext.com/user/custom-builder" },
        ]}
      />

      <CustomBuilderView />
    </div>
  );
}

export default withUserLayout(Custom);
