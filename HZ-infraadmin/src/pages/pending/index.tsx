import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ApprovalsTable } from '@/components/admin/ApprovalsTable';
import adminApi from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';
import toast from 'react-hot-toast';

export default function AdminPendingPage() {
  const [rows, setRows] = useState<InfraProperty[]>([]);

  const load = async () => {
    try {
      const res = await adminApi.get('/admin/properties/pending');
      setRows(res.data ?? []);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: string) => {
    await adminApi.patch(`/admin/properties/${id}/approve`);
    toast.success('Approved');
    void load();
  };

  return (
    <AdminLayout title="Pending approval" subtitle="Review before publishing">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Pending approval</h1>
      <div className="mt-6">
        <ApprovalsTable data={rows} onApprove={approve} />
      </div>
    </AdminLayout>
  );
}
