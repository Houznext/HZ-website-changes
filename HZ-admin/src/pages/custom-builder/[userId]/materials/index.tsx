import MaterialView from '@/src/features/CustomBuilder/MaterialView'
import React from 'react'
import withAdminLayout from "@/src/common/AdminLayout";
import { usePermissionStore } from '@/src/stores/usePermissions';
import BackRoute from '@/src/common/BackRoute';
import StepNavigationHeader from '@/src/features/CustomBuilder/CustomBuilderStepHeader';
import { useRouter } from 'next/router';
import AccessDenied from '@/src/common/AccessDenied';

const Materials = () => {
    const router = useRouter();
    const builderId = String(router.query.userId);
    const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
    if (isLoading && !initialized) {
        return null;
    }
    const hasAccess = hasPermission("custom_builder", "view");
    return (
        <div className="w-full md:px-10 px-2 py-3">
            <BackRoute />
            <StepNavigationHeader builderId={builderId} />
            {hasAccess ? <MaterialView /> : <AccessDenied resource={"Materials"} />}
        </div>
    )
}

export default withAdminLayout(Materials)