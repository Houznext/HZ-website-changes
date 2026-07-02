import React from "react";
import withAdminLayout from "@/src/common/AdminLayout";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import InvoiceEditor from "@/src/components/InvoiceView/InvoiceEditor";

function NewInvoicePage() {
  const { hasPermission, isLoading, initialized } = usePermissionStore();
  if (isLoading && !initialized) return null;
  if (!hasPermission("invoice_estimator", "create")) {
    return <AccessDenied resource="Invoice" />;
  }
  return (
    <div className="w-full min-h-screen p-2 md:p-4">
      <InvoiceEditor />
    </div>
  );
}

export default withAdminLayout(NewInvoicePage);
