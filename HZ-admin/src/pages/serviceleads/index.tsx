import withAdminLayout from "@/src/common/AdminLayout";
import React from "react";
import ServiceLeadsView from "@/src/components/ServiceLeadsView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const serviceleads = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("servicecustomlead", "view");
  return (
    <>
      {hasAccess ? (
        <ServiceLeadsView />
      ) : (
        <AccessDenied resource={"Service Leads"} />
      )}
    </>
  );
};
export default withAdminLayout(serviceleads);
