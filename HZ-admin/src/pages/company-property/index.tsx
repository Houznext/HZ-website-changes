import withAdminLayout from "@/src/common/AdminLayout";
import { CompanyPropertyView } from "@/src/components/CompanyPropertiesComp/CompanyProperty";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const ComProperty = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("company", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full">
          <CompanyPropertyView />
        </div>
      ) : (
        <AccessDenied resource={"Company Property"} />
      )}

    </>
  );
};
export default withAdminLayout(ComProperty);
