import withAdminLayout from "@/src/common/AdminLayout";
import GA4AnalyticsView from "@/src/components/GA4AnalyticsView";

function DashboardPage() {
  return <GA4AnalyticsView />;
}

export default withAdminLayout(DashboardPage);
