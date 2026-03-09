import withAdminLayout from "@/src/common/AdminLayout";
import PropertyView from "@/src/components/Property";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const Property = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("property", "view");
  return (
    <>
      {hasAccess ? <PropertyView /> : <AccessDenied resource={"Property"} />}
    </>
  );
};

export default withAdminLayout(Property);
