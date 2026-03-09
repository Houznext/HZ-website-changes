import withAdminLayout from "@/src/common/AdminLayout";
import SolarManagement from "@/src/components/SolarManagement";

const SolarPage = () => {
  return (
    <div className="w-full">
      <SolarManagement />
    </div>
  );
};

export default withAdminLayout(SolarPage);
