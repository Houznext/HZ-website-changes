import withUserLayout from "@/components/Layouts/UserLayout";
import ViewAnalyticsComponent from "@/components/ViewAnalyticsComponent";
import React from "react";
import SEO from '@/components/SEO';

import { useRouter } from "next/router";
import ViewLeadsComponent from "@/components/ViewLeadsComponent";

const Viewleads = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Property Leads | OneCasa"
        description="Monitor and manage your property leads efficiently with OneCasa. Gain valuable insights into buyer interest, lead sources, and engagement metrics for each property."
        keywords="Property Leads, Real Estate Leads, OneCasa Leads, Buyer Interest, Lead Management, Property Engagement, Real Estate Analytics, Track Leads, OneCasa Property Leads"
        imageUrl="https://www.onecasa.in/images/logobb.png"
      />
      <ViewLeadsComponent />
    </div>
  );
};

export default withUserLayout(Viewleads);
