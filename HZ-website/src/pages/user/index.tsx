import DashboardView from "@/components/DashboardView";
import withUserLayout from "@/components/Layouts/UserLayout";
import React from "react";
import SEO from '@/components/SEO';


const Admin = () => {
  return (
    <div>
      <SEO
        title="Customer Dashboard | Houznext"
        description="Manage your Houznext interior projects and monitor interior tracking updates from your dashboard."
        keywords="Houznext dashboard, interior projects, interior tracking, customer dashboard"
        imageUrl="https://www.houznext.com/images/logobb.png"
      />
      <DashboardView />
    </div>
  );
};

export default withUserLayout(Admin);
