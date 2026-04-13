import withAdminLayout from "@/src/common/AdminLayout";
import BackRoute from "@/src/common/BackRoute";
import StepNavigationHeader from "@/src/features/CustomBuilder/CustomBuilderStepHeader";
import { DayProgress } from "@/src/features/CustomBuilder/DayProgress";
import { useRouter } from "next/router";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const WorkProgress = () => {
  const router = useRouter();
  const builderId = String(router.query.userId);
  const { hasPermission ,isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  // const hasAccess = hasPermission("daily_progress", "view");
  const hasAccess = true;
  
  return (
    <>
      {hasAccess ? (
        <div className="w-full md:px-10 px-2 py-3">
          <BackRoute />
          <StepNavigationHeader builderId={builderId} />
          <DayProgress />
        </div>
      ) : (
        <AccessDenied resource={"Work Progress"} />
      )}
    </>
  );
};

export default withAdminLayout(WorkProgress);
