import withAdminLayout from "@/src/common/AdminLayout";
import CostEstimatorDetailsView from "@/src/components/CostEstimatorDetailsView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const CostEstimatorDetails = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("cost_estimator", "view");
  return (
    <>
      {hasAccess ? (
        <div className="flex w-full min-h-full md:px-6 md:py-4 px-2 py-3">
          <CostEstimatorDetailsView />
        </div>
      ) : (
        <AccessDenied resource={"Cost Estimator"} />
      )}
    </>
  );
};

export default withAdminLayout(CostEstimatorDetails);
