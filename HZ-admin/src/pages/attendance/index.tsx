import withAdminLayout from "@/src/common/AdminLayout";
import React from "react";
import ServiceLeadsView from "@/src/components/ServiceLeadsView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";
import AttendanceView from "@/src/components/AttendanceView";

const Attendance = () => {
 
  return (
    <>
      
       <AttendanceView/>
     
    </>
  );
};
export default withAdminLayout(Attendance);
