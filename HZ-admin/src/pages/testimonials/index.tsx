

import React from 'react';
import withAdminLayout from '@/src/common/AdminLayout'
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions"
import Testimonialsview from '@/src/components/Testimonialsview'

function Testimonials() {
  const { hasPermission ,isLoading, initialized} = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
  const hasAccess = hasPermission("testimonials", "view");
  return (
    <>
    {hasAccess ? 
  
    <div className="w-full min-h-screen">
     <Testimonialsview />
    </div>:<AccessDenied resource={"Testimonials"} />}
    </>
  );
}

export default withAdminLayout(Testimonials);
