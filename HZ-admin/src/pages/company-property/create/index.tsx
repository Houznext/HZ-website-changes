import withAdminLayout from "@/src/common/AdminLayout";
import CreateCompanyView from "@/src/components/CompanyPropertiesComp/create-companyView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const CreateCompanyProperty = () => {
  const { hasPermission, isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("company", "create");
  return (
    <>
      {hasAccess ? (
        <div className="w-full">
          <CreateCompanyView />
        </div>
      ) : (
        <AccessDenied resource={"Company Property"} />
      )}
    </>
  );
};

export default withAdminLayout(CreateCompanyProperty);
