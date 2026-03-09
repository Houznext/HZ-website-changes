import withAdminLayout from "@/src/common/AdminLayout";
import CustomBuiderInvoices from "@/src/features/CustomBuilder/CustomBuilderInvoices";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

import React from "react";

const Invoices = () => {
  const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("invoice_estimator", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full p-5">
          <CustomBuiderInvoices />
        </div>
      ) : (
        <AccessDenied resource={"Invoices"} />
      )}
    </>
  );
};

export default withAdminLayout(Invoices);
