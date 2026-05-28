import withAdminLayout from "@/src/common/AdminLayout";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import RolesView from "@/src/components/RolesView";
import React from "react";
import BackRoute from "@/src/common/BackRoute";

const RolesPage: React.FC = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((s) => s);

  if (isLoading && !initialized) return null;

  const canManage = hasPermission("role", "edit");
  if (!canManage) return <AccessDenied resource="Roles" />;

  return (
    <div className="br-admin-root flex flex-col w-full">
      <div className="px-3 pt-3 md:px-5 md:pt-4">
        <BackRoute />
      </div>
      <div className="w-full px-3 pb-6 md:px-5 md:pb-8">
        <RolesView />
      </div>
    </div>
  );
};

export default withAdminLayout(RolesPage);
