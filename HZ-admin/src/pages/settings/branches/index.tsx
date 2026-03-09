import withAdminLayout from "@/src/common/AdminLayout";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import BranchesView from "@/src/components/BranchesView";
import React from "react";
import BackRoute from "@/src/common/BackRoute";

const BranchesPage: React.FC = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((s) => s);

  if (isLoading && !initialized) return null;

  const hasAccess = hasPermission("branches", "view");
  if (hasAccess) return <AccessDenied resource="Branches" />;

  return (
    <div className="flex flex-col w-full justify-center">
      <div className=" p-3 md:p-5">
        <BackRoute />
      </div>
      <div className="w-full min-h-screen">
        <BranchesView />
      </div>
    </div>
  );
};

export default withAdminLayout(BranchesPage);
