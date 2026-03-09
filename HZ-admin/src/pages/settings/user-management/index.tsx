import withAdminLayout from "@/src/common/AdminLayout";
import UserManagementView from "@/src/components/UserManagement";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const UserManagement = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("user", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full min-h-screen">
          <UserManagementView />
        </div>
      ) : (
        <AccessDenied resource={"User Management"} />
      )}
    </>
  );
};

export default withAdminLayout(UserManagement);
