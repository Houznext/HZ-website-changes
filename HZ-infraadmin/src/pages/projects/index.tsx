import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ProjectsTable } from '@/components/admin/ProjectsTable';
import adminApi from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';

export default function AdminProjectsPage() {
  const [rows, setRows] = useState<InfraProject[]>([]);
  useEffect(() => {
    void (async () => {
      try {
        const res = await adminApi.get('/projects');
        setRows(res.data ?? []);
      } catch {
        setRows([]);
      }
    })();
  }, []);
  return (
    <AdminLayout title="Projects" subtitle="Infra project catalogue">
      <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Projects</h1>
      <div className="mt-6">
        <ProjectsTable data={rows} />
      </div>
    </AdminLayout>
  );
}
