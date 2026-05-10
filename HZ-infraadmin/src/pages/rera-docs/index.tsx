import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminReraDocsPage() {
  return (
    <AdminLayout title="RERA & docs" subtitle="Compliance documents">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">RERA documents</h1>
      <p className="mt-2 font-inter text-sm text-muted">
        Upload RERA PDFs to S3 prefix infra/rera via the upload API.
      </p>
    </AdminLayout>
  );
}
