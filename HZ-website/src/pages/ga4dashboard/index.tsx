import React from "react";
import LegalServicesComponent from "@/components/LegalServicesComponent";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import Ga4Dasboardview from "@/components/Ga4Dashboardview";
import SEO from '@/components/SEO';


const ga4dashboard = () => {
  return (
    <div>
      <SEO
        title="GA4 Dashboard | Track Website Analytics & User Insights | OneCasa"
        description="Monitor your website performance with the GA4 Dashboard. Track real-time user activity, page views, events, conversions, and engagement metrics to optimize your real estate platform."
        keywords="GA4 Dashboard,Google Analytics 4,Website Analytics,User Engagement Metrics,Event Tracking,Real-Time Analytics,Conversion Tracking,OneCasa Analytics"
      />
      <Ga4Dasboardview />
    </div>
  );
};

export default withGeneralLayout(ga4dashboard);
