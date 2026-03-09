import withAdminLayout from "@/src/common/AdminLayout";
import UserManagementView from "@/src/components/UserManagement";
import React from "react";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import AttendanceManagementView from "@/src/components/AttendanceManagementView";



const AttendanceManagement = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((state) => state);
  if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("staff_attendance_records", "view");
  return (
    <>
      {hasAccess ? (
        <div className="w-full min-h-screen">
          <AttendanceManagementView />
        </div>
      ) : (
        <AccessDenied resource={"Attendance Management"} />
      )}
    </>
  );
};

export default withAdminLayout(AttendanceManagement);
