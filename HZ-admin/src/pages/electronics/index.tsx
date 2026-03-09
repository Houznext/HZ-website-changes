import withAdminLayout from "@/src/common/AdminLayout";
import HomeDecorsView from "@/src/components/HomeDecors";
import React from "react";
import ElectronicsView from "@/src/components/ElectronicsView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const Electronics = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("electronics", "view");
  return (
    <>
      {hasAccess ? (
        <div className="flex w-full min-h-full">
          <ElectronicsView />
        </div>
      ) : (
        <AccessDenied resource={"Electronics"} />
      )}
    </>
  );
};

export default withAdminLayout(Electronics);
