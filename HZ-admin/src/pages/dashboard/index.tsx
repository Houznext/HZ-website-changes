import withAdminLayout from "@/src/common/AdminLayout";
import Admindashboard from "@/src/components/AdminDashBoard";

function dashboard() {
  return (
    <>
      <Admindashboard />
    </>
  );
}

export default withAdminLayout(dashboard);
