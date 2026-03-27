import withAdminLayout from "@/src/common/AdminLayout";
import GA4AnalyticsView from "@/src/components/GA4AnalyticsView";

// /ga4-dashboard now renders the same view as /dashboard.
// The sidebar only links to /dashboard — this route is kept
// for any bookmarked or direct links.
function GA4DashboardPage() {
  return <GA4AnalyticsView />;
}

export default withAdminLayout(GA4DashboardPage);
