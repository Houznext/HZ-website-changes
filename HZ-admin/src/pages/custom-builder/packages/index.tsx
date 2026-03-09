import withAdminLayout from "@/src/common/AdminLayout";

import PackagesView from "@/src/features/CustomBuilder/PackagesView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const Packages = () => {
  const { hasPermission ,isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("custom_builder", "view");

  return (
    <>
      {hasAccess ? (
        <div className="w-full p-5">
          <PackagesView />
        </div>
      ) : (
        <AccessDenied resource={"Packages"} />
      )}
    </>
  );
};

export default withAdminLayout(Packages);
