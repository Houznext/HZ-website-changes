import React from "react";
import withUserLayout from "@/components/Layouts/UserLayout";
import PaymentTrackingView from "@/components/CustomBuilder/PaymentTrackingView";
import SEO from "@/components/SEO";

const PaymentsPage = () => {
  return (
    <div className="flex w-full">
      <SEO
        title="Payment Tracking | Custom Builder | OneCasa"
        description="Track all payments for your custom builder project including milestones, advances, and settlements."
        keywords="Payment Tracking, Construction Payments, Milestone Payments, OneCasa Builder Payments"
      />
      <PaymentTrackingView />
    </div>
  );
};

export default withUserLayout(PaymentsPage);
