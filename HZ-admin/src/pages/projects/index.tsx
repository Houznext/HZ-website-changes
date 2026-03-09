import withAdminLayout from "@/src/common/AdminLayout";
import ProjectView from "@/src/components/ProjectsComponents/ProjectView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const Projects = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("project", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full">
          <ProjectView />
        </div>
      ) : (
        <AccessDenied resource={"Projects"} />
      )}
    </>
  );
};

export default withAdminLayout(Projects);
