import withAdminLayout from "@/src/common/AdminLayout";

import ViewAnalyticsComponent from "@/src/components/ViewAnalyticsComponent";
import ViewLeadsComponent from "@/src/components/ViewLeadsComponent";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const ViewLeads = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("property", "view");

  return (
    <>
      {hasAccess ? (
        <div className="flex w-full min-h-full">
          <ViewLeadsComponent />
        </div>
      ) : (
        <AccessDenied resource={"Property"} />
      )}{" "}
    </>
  );
};

export default withAdminLayout(ViewLeads);
