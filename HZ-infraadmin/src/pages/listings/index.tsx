import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ListingsTable } from '@/components/admin/ListingsTable';
import { StatsCard } from '@/components/admin/StatsCard';
import adminApi from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';

export default function AdminListingsPage() {
  const [rows, setRows] = useState<InfraProperty[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminApi.get('/admin/properties');
        setRows(res.data ?? []);
      } catch {
        setRows([]);
      }
    })();
  }, []);

  return (
    <AdminLayout title="All listings" subtitle="Properties and approval status">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">All listings</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsCard title="Total" value={rows.length} />
        <StatsCard title="Approved" value={rows.filter((r) => r.isApproved).length} />
        <StatsCard title="Pending" value={rows.filter((r) => !r.isApproved).length} />
      </div>
      <div className="mt-8">
        <ListingsTable data={rows} />
      </div>
    </AdminLayout>
  );
}
