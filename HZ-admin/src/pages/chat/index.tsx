import withAdminLayout from '@/src/common/AdminLayout';

import React from 'react'
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import CrmView from '@/src/components/NewCrmView/newcrmview';
import ChatView from '@/src/components/ChatView';
import ChatPanel from "../../components/ChatPanel"


const Chat = () => {
    const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
    if (isLoading && !initialized) {
        return null;
    }
    const hasAccess = hasPermission("chat", "view");
    return (
        <>
            {hasAccess ?
                <div className='flex w-full min-h-full px-2 py-2 '>
                    <ChatPanel />
                </div> : <AccessDenied resource={"Chat"} />}
        </>
    )
}

export default withAdminLayout(Chat); 