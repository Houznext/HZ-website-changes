import withAdminLayout from "@/src/common/AdminLayout";
import FurnituresView from "@/src/components/FurnituresView";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions"

const Furnitures = () => {
    const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
    if (isLoading && !initialized) {
        return null;
    }
    const hasAccess = hasPermission("furniture", "view");
    return (
        <>
            {hasAccess ?
                <div className="flex w-full min-h-full">
                    <FurnituresView />
                </div> : <AccessDenied resource={"Furnitures"} />}
        </>
    );
};

export default withAdminLayout(Furnitures);
