import withAdminLayout from "@/src/common/AdminLayout";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import InteriorsCRM from "@/src/components/InteriorsCRM";

const CrmPage = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  if (!hasPermission("crm", "view")) {
    return <AccessDenied resource="CRM" />;
  }
  return (
    <div className="flex w-full min-h-full md:px-6 md:py-4 px-3 py-5">
      <InteriorsCRM />
    </div>
  );
};

export default withAdminLayout(CrmPage);
