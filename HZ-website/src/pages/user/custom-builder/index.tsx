import CustomBuilderView from "@/components/CustomBuilder";
import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


function Custom() {
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Custom Home Builders | Tech-Enabled Construction & Interiors | OneCasa"
        description="Build your dream home with OneCasa’s custom builder services. Enjoy tech-enabled solutions, real-time tracking, 12+ years of expertise, and 100% Vastu compliance. Serving Telangana, Andhra Pradesh, Mumbai, Pune, Bangalore."
        keywords="Custom Builders, Home Construction, Tech-Enabled Construction, Vastu Compliant Homes, Real-Time Tracking, House Building Experts, OneCasa Builders, Dream Home Builders, Residential Construction India, End-to-End Interiors"
        imageUrl="https://www.onecasa.in/images/onecasa-logo.png"
        breadcrumbs={[
          { name: "Home", item: "https://www.onecasa.in/" },
          { name: "Custom Builder", item: "https://www.onecasa.in/user/custom-builder" },
        ]}
      />

      <CustomBuilderView />
    </div>
  );
}

export default withUserLayout(Custom);
