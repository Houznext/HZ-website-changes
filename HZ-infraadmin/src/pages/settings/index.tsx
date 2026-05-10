import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="Settings" subtitle="Environment & integrations">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Settings</h1>
      <p className="mt-2 font-inter text-sm text-muted">
        Infra environment targets and integration keys (managed in Vercel / Railway).
      </p>
    </AdminLayout>
  );
}
