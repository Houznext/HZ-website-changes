import withAdminLayout from "@/src/common/AdminLayout";
import ProjectDetailsView from "@/src/components/ProjectsComponents/ProjectDetailsView";
import ProjectView from "@/src/components/ProjectsComponents/ProjectView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const ProjectsDetails = () => {
  const { hasPermission } = usePermissionStore((state) => state);
  const hasAccess = hasPermission("project", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full">
          <ProjectDetailsView />
        </div>
      ) : (
        <AccessDenied resource={"Projects"} />
      )}
    </>
  );
};

export default withAdminLayout(ProjectsDetails);
