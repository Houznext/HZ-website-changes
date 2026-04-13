import withAdminLayout from "@/src/common/AdminLayout";
import BackRoute from "@/src/common/BackRoute";
import StepNavigationHeader from "@/src/features/CustomBuilder/CustomBuilderStepHeader";
import DocumentUpload from "@/src/features/CustomBuilder/DocumentUpload";
import { useRouter } from "next/router";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const UploadDocs = () => {
  const router = useRouter();
  const builderId = String(router.query.userId);
  const { hasPermission ,isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("custom_builder", "view");


  return (
    <>
      {hasAccess ? (
        <div className="w-full p-5">
          <BackRoute />
          <StepNavigationHeader builderId={builderId} />
          <DocumentUpload />
        </div>
      ) : (
        <AccessDenied resource={"Document Upload"} />
      )}
    </>
  )
};

export default withAdminLayout(UploadDocs);
