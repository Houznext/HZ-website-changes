import withAdminLayout from "@/src/common/AdminLayout";
import EditComanyPropertyview from "@/src/components/CompanyPropertiesComp/EditComanyPropertyview";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const EditCompanyProperty = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("company", "edit");
  return (
    <>
      {hasAccess ? (
        <div className="w-full">
          <EditComanyPropertyview />
        </div>
      ) : (
        <AccessDenied resource={"Company Property"} />
      )}
    </>
  );
};

export default withAdminLayout(EditCompanyProperty);
