import withAdminLayout from "@/src/common/AdminLayout";
import BackRoute from "@/src/common/BackRoute";
import StepNavigationHeader from "@/src/features/CustomBuilder/CustomBuilderStepHeader";
import PaymentTracking from "@/src/features/CustomBuilder/PaymentTracking";
import { useRouter } from "next/router";
import React from "react";

const PaymentsPage = () => {
  const router = useRouter();
  const builderId = String(router.query.userId);

  return (
    <div className="w-full md:px-10 px-2 py-3">
      <BackRoute />
      <StepNavigationHeader builderId={builderId} />
      <PaymentTracking />
    </div>
  );
};

export default withAdminLayout(PaymentsPage);
