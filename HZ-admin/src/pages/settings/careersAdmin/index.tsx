import withAdminLayout from "@/src/common/AdminLayout";
import CareerAdminView from "@/src/components/CareerAdminView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const CareersAdmin = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("career", "view");
  return (
    <>
      {!hasAccess ? (
        <div className="flex w-full min-h-full px-6 py-4 ">
          <CareerAdminView />
        </div>
      ) : (
        <AccessDenied resource={"Careers Admin"} />
      )}
    </>
  );
};

export default withAdminLayout(CareersAdmin);
