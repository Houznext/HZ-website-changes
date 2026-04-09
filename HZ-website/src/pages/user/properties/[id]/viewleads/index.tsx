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
        title="Property Leads | Houznext"
        description="Monitor and manage your property leads efficiently with Houznext. Gain valuable insights into buyer interest, lead sources, and engagement metrics for each property."
        keywords="Property Leads, Real Estate Leads, Houznext Leads, Buyer Interest, Lead Management, Property Engagement, Real Estate Analytics, Track Leads, Houznext Property Leads"
/>
      <ViewLeadsComponent />
    </div>
  );
};

export default withUserLayout(Viewleads);
