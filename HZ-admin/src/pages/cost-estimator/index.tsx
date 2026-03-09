import withAdminLayout from "@/src/common/AdminLayout";
import CostEstimatorView from "@/src/components/CostEstimatorView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const CostEstimator = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("cost_estimator", "view");
  return (
    <>
      {hasAccess ? (
        <div className="flex w-full min-h-full md:px-10 px-3 py-4">
          <CostEstimatorView />
        </div>
      ) : (
        <AccessDenied resource={"Cost Estimator"} />
      )}
    </>
  );
};

export default withAdminLayout(CostEstimator);
