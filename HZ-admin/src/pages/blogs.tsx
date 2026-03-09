import withAdminLayout from "@/src/common/AdminLayout";
import React from "react";
import BlogsView from "../components/BlogsView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "../stores/usePermissions";

const BlogsPage = () => {
    const { hasPermission,isLoading, initialized } = usePermissionStore((state) => state);
   if (isLoading && !initialized) {
    return null;
  }
   const hasAccess = hasPermission("blog", "view")

  if (!hasAccess) {
    return <AccessDenied resource="Blogs" />;
  }

  return (
    <div className="w-full min-h-screen">
      <BlogsView />
    </div>
  );
};

export default withAdminLayout(BlogsPage);
