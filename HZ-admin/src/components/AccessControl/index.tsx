import { useState } from "react";
import RolesList from "./RolesList";
import RolePermissions from "./RolePermissions";
import apiClient from "@/src/utils/apiClient";
import Loader from "@/src/common/Loader";
import BackRoute from "@/src/common/BackRoute";
import toast from "react-hot-toast";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CustomTooltip from "@/src/common/ToolTip";


export interface Permission {
  resource: string;
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Role {
  id: string;
  roleName: string;
  users?: {
    id: string;
    profile: string;
    firstName: string;
  }[];
  permissions: Permission[];
}

const AccessControlView = () => {
  const [view, setView] = useState<"list" | "permissions">("list");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fetchPermissions = usePermissionStore((state) => state.fetchPermissions);
   const { hasPermission, permissions } = usePermissionStore((state) => state);



  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setView("permissions");
  };

  const handleSavePermissions = async (
    roleId: string,
    changedPermissions: Permission[]
  ) => {
    setIsLoading(true);
    try {
      await apiClient.patch(
        `${apiClient.URLS.roles}/${roleId}/permissions`,
        changedPermissions,true
      );

      const updatedRoleRes = await apiClient.get(
        `${apiClient.URLS.roles}/${roleId}`
      );

      setSelectedRole(updatedRoleRes.body);
      await fetchPermissions(Number(roleId));
      toast.success("Permissions updated");
    } catch (e) {
      console.log(e);
      toast.error("Failed to update permissions");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-h-full w-full bg-gray-50">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {view === "list" && <div className="px-4 py-3">
        <BackRoute />
      </div>}
      {view === "list" ? (
        <RolesList onEditRole={handleEditRole} />
      ) : (
        <RolePermissions
          selectedRole={selectedRole}
          updatePermissions={handleSavePermissions}
          onBack={() => setView("list")}
        />
      )}
    </div>
  );
};

export default AccessControlView;
