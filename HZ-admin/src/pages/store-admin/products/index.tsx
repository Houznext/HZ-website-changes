import withAdminLayout from "@/src/common/AdminLayout";
import FurnituresView from "@/src/components/FurnituresView";
import AccessDenied from "@/src/common/AccessDenied";
import { usePermissionStore } from "@/src/stores/usePermissions";

const StoreProducts = () => {
  const { hasPermission, isLoading, initialized } = usePermissionStore((s) => s);
  if (isLoading && !initialized) return null;
  if (!hasPermission("furniture", "view")) return <AccessDenied resource="Store Products" />;
  return <div className="flex w-full min-h-full"><FurnituresView /></div>;
};

export default withAdminLayout(StoreProducts);
