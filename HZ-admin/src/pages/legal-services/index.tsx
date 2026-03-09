import withAdminLayout from "@/src/common/AdminLayout";
import LegalServicesView from "@/src/components/LegalServicesView";

const LegalServicesPage = () => {
  return (
    <div className="w-full">
      <LegalServicesView />
    </div>
  );
};

export default withAdminLayout(LegalServicesPage);
