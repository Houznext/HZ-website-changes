
import InvoiceView from '@/src/components/InvoiceView';
import React from 'react';
import withAdminLayout from '@/src/common/AdminLayout'
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions"

function Invoice() {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("invoice_estimator", "view");
  return (
    <>
      {hasAccess ?
        <div className="w-full min-h-screen">
          <InvoiceView />
        </div> : <AccessDenied resource={"Invoice"} />}
    </>
  );
}

export default withAdminLayout(Invoice);
