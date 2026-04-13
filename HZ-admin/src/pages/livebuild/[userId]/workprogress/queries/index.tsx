import withAdminLayout from "@/src/common/AdminLayout";

import QueriesView from "@/src/features/CustomBuilder/QueriesView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const Queries = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("custom_builder", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full p-5">
          <QueriesView />
        </div>
      ) : (
        <AccessDenied resource={"Queries"} />
      )}
    </>
  );
};

export default withAdminLayout(Queries);
