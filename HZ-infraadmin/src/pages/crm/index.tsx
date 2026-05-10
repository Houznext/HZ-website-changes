import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { CRMTable } from '@/components/admin/CRMTable';
import adminApi from '@/lib/axios';
import type { CrmRow } from '@/types/admin.types';

export default function AdminCrmPage() {
  const [rows, setRows] = useState<CrmRow[]>([]);

  const load = async () => {
    try {
      const res = await adminApi.get('/admin/crm/leads');
      setRows(res.data ?? []);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onPatch = async (id: string, stage: string) => {
    await adminApi.patch(`/admin/crm/leads/${id}`, { stage });
    void load();
  };

  return (
    <AdminLayout title="CRM leads" subtitle="Pipeline and stages">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">CRM — property leads</h1>
      <div className="mt-6">
        <CRMTable data={rows} onPatch={onPatch} />
      </div>
    </AdminLayout>
  );
}
