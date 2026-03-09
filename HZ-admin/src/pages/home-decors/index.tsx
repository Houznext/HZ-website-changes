import withAdminLayout from "@/src/common/AdminLayout";
import HomeDecorsView from "@/src/components/HomeDecors";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const HomeDecors = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("home_decors", "view");
  return (
    <>
      {" "}
      {hasAccess ? (
        <div className="flex w-full min-h-full">
          <HomeDecorsView />
        </div>
      ) : (
        <AccessDenied resource={"Home Decors"} />
      )}
    </>
  );
};

export default withAdminLayout(HomeDecors);
