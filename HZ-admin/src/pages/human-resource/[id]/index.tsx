
import React from 'react';
import withAdminLayout from '@/src/common/AdminLayout'
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions"
import UserDetails from '@/src/components/HumanResouceView/UserDetails';

function HumanResourceUser() {
    const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
    if (isLoading && !initialized) {
        return null;
    }
    const hasAccess = hasPermission("hr", "view");
    return (
        <>
            {!hasAccess ?
                <div className="w-full min-h-screen">
                    <UserDetails />
                </div> : <AccessDenied resource={"hr"} />}
        </>
    );
}

export default withAdminLayout(HumanResourceUser);
