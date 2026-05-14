'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';

type Project = {
  projectId?: string;
  id?: string;
  name: string;
  slug: string;
  city?: string;
  reraNumber?: string | null;
  createdAt?: string;
};

export default function ProjectsPage() {
  const [rows, setRows] = useState<Project[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/projects', { params: { limit: 100 } });
        setRows(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error('Failed to load projects');
      }
    })();
  }, []);

  return (
    <AdminLayout title="Projects">
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>City</th>
              <th>RERA</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.projectId ?? p.id ?? p.slug}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.slug}</td>
                <td>{p.city ?? '—'}</td>
                <td>{p.reraNumber ?? '—'}</td>
                <td>{p.createdAt ? formatDate(p.createdAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
