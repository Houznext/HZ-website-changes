import AdminLayout from '@/components/layout/AdminLayout';
import { HeroCMS } from '@/components/admin/HeroCMS';

export default function AdminHeroCmsPage() {
  return (
    <AdminLayout title="Hero image CMS" subtitle="Homepage hero">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Hero CMS</h1>
      <div className="mt-6">
        <HeroCMS />
      </div>
    </AdminLayout>
  );
}
