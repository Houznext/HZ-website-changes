import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { SiteVisitsTable, type SiteVisitRow } from '@/components/admin/SiteVisitsTable';
import adminApi from '@/lib/axios';

export default function AdminSiteVisitsPage() {
  const [rows, setRows] = useState<SiteVisitRow[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const res = await adminApi.get('/admin/site-visits');
        setRows(res.data ?? []);
      } catch {
        setRows([]);
      }
    })();
  }, []);
  return (
    <AdminLayout title="Site visits" subtitle="Scheduled visits">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Site visits</h1>
      <div className="mt-6">
        <SiteVisitsTable data={rows} />
      </div>
    </AdminLayout>
  );
}
