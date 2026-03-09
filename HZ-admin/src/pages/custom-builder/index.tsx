import AccessDenied from "@/src/common/AccessDenied";
import withAdminLayout from "@/src/common/AdminLayout";
import CustomBuilderSteps from "@/src/features/CustomBuilder/BuilderMultiStep";
import { usePermissionStore } from "@/src/stores/usePermissions";
import React from "react";

const CustomBuilder = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("custom_builder", "view");

  return (
    <>
      {hasAccess ? (
        <div className="w-full md:p-5 p-3">
          <CustomBuilderSteps />
        </div>
      ) : (
        <AccessDenied resource={"CustomBuilder"} />
      )}
    </>
  );
};

export default withAdminLayout(CustomBuilder);
