import withAdminLayout from "@/src/common/AdminLayout";
import UserManagementView from "@/src/components/UserManagement";
import AdminUsersSection from "@/src/components/UserManagement/AdminUsersSection";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const UserManagement = () => {
  const { hasPermission, canManageUsers, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("user", "view");
  const showAdminUsers = canManageUsers();

  return (
    <>
      {hasAccess ? (
        <div className="w-full min-h-screen px-4 md:px-6 py-4 bg-[#f5f6f8]">
          {showAdminUsers && (
            <div className="max-w-4xl mx-auto mb-6">
              <AdminUsersSection />
            </div>
          )}
          <div className={showAdminUsers ? "max-w-7xl mx-auto" : ""}>
            <UserManagementView />
          </div>
        </div>
      ) : (
        <AccessDenied resource={"User Management"} />
      )}
    </>
  );
};

export default withAdminLayout(UserManagement);
