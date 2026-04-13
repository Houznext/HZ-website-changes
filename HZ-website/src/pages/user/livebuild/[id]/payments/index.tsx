import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import PaymentTrackingView from "@/components/LivebuildComponent/PaymentTrackingView";
import SEO from "@/components/SEO";

const PaymentsPage = () => {
  return (
    <div className="flex w-full">
      <SEO
        title="Payment Tracking | LiveBuild | Houznext"
        description="Track all payments for your LiveBuild project including milestones, advances, and settlements."
        keywords="Payment Tracking, Construction Payments, Milestone Payments, Houznext Builder Payments"
      />
      <PaymentTrackingView />
    </div>
  );
};

export default withUserLayout(PaymentsPage);
