import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminDeveloperSubmissionsPage() {
  return (
    <AdminLayout title="Developer submissions" subtitle="Review listings">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Developer submissions</h1>
      <p className="mt-2 font-inter text-sm text-muted">
        Review listings submitted by developer accounts.
      </p>
    </AdminLayout>
  );
}
