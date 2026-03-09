import withAdminLayout from "@/src/common/AdminLayout";
import React from "react";
import GeneralEnquiresView from "@/src/components/GeneralEnquiresView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const generalenquires = () => {
  const { hasPermission ,isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("referral", "view");
  return (
    <>
    <GeneralEnquiresView />
    </>
  );
};
export default withAdminLayout(generalenquires);
