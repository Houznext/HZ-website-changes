import withAdminLayout from "@/src/common/AdminLayout";
import React from "react";
import ReferandEarnView from "@/src/components/ReferandEarnView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const referandearn = () => {
  const { hasPermission ,isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("referral", "view");
  return (
    <>
      {!hasAccess ? (
        <ReferandEarnView />
      ) : (
        <AccessDenied resource={"Refer and Earn"} />
      )}{" "}
    </>
  );
};
export default withAdminLayout(referandearn);
