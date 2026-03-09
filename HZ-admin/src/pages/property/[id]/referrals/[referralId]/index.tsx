import withAdminLayout from "@/src/common/AdminLayout";
import ReferralDetailComponent from "@/src/components/ReferralDetailComponent";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const ReferralDetailPage = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore(
    (state) => state
  );
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("property", "view");
  return (
    <>
      {hasAccess ? (
        <div className="flex w-full min-h-full">
          <ReferralDetailComponent />
        </div>
      ) : (
        <AccessDenied resource="Property" />
      )}
    </>
  );
};

export default withAdminLayout(ReferralDetailPage);
