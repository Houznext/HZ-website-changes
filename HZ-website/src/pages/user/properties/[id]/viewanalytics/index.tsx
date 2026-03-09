import withUserLayout from "@/components/Layouts/UserLayout";
import ViewAnalyticsComponent from "@/components/ViewAnalyticsComponent";
import React from "react";
import SEO from '@/components/SEO';

import { useRouter } from "next/router";

const viewanalytics = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div className="flex w-full min-h-full">
      <SEO
        title="Property View Analytics | OneCasa"
        description="Track and analyze property views with OneCasa's GA4 analytics. Get insights on user engagement, popular listings, and audience behavior."
        keywords="Property Analytics, Real Estate Insights, GA4 Analytics, Property Views, User Engagement, OneCasa Analytics, Real Estate Data, Property Trends"
      />

      <ViewAnalyticsComponent />
    </div>
  );
};

export default withUserLayout(viewanalytics);
