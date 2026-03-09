import withAdminLayout from "@/src/common/AdminLayout";
import ViewReferralsComponent from "@/src/components/ViewReferralsComponent";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const ViewReferrals = () => {
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
          <ViewReferralsComponent />
        </div>
      ) : (
        <AccessDenied resource="Property" />
      )}
    </>
  );
};

export default withAdminLayout(ViewReferrals);
