import withAdminLayout from '@/src/common/AdminLayout';

import React from 'react'
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CrmView from '@/src/components/NewCrmView/newcrmview';


const Crm = () => {
    const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
    if (isLoading && !initialized) {
        return null;
    }
    const hasAccess = hasPermission("crm", "view");
    return (
        <>
            {hasAccess ?
                <div className='flex w-full min-h-full md:px-6 md:py-4 px-3 py-5 '>
                    <CrmView />
                </div> : <AccessDenied resource={"Crm"} />}
        </>
    )
}

export default withAdminLayout(Crm); 