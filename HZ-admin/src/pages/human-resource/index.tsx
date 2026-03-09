
import InvoiceView from '@/src/components/InvoiceView';
import React from 'react';
import withAdminLayout from '@/src/common/AdminLayout'
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions"
import HrView from '@/src/components/HumanResouceView';

function HumanResource() {
    const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
    if (isLoading && !initialized) {
        return null;
    }
    const hasAccess = hasPermission("hr", "view");
    return (
        <>
            {!hasAccess ?
                <div className="w-full min-h-screen">
                    <HrView />
                </div> : <AccessDenied resource={"hr"} />}
        </>
    );
}

export default withAdminLayout(HumanResource);
