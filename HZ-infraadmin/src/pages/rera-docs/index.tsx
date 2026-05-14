'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';

type Row = {
  propertyId: string;
  title?: string;
  propertyCode?: string;
  reraNumber?: string | null;
  reraExpiry?: string | null;
  reraCertUrl?: string | null;
};

export default function ReraDocsPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/admin/properties', { params: { page: 1, limit: 100 } });
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setRows(list);
      } catch {
        toast.error('Failed to load properties');
      }
    })();
  }, []);

  const withRera = rows.filter((r) => r.reraNumber || r.reraCertUrl);

  return (
    <AdminLayout title="RERA & documents">
      <div className="info-box" style={{ marginBottom: 14 }}>
        <span>Properties with RERA numbers or uploaded certificates appear below. Upload documents from the listing wizard (step 3).</span>
      </div>
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Property</th>
              <th>Code</th>
              <th>RERA #</th>
              <th>Expiry</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {withRera.map((r) => (
              <tr key={r.propertyId}>
                <td style={{ fontWeight: 600 }}>{r.title ?? '—'}</td>
                <td>{r.propertyCode ?? '—'}</td>
                <td>{r.reraNumber ?? '—'}</td>
                <td>{r.reraExpiry ?? '—'}</td>
                <td>
                  {r.reraCertUrl ? (
                    <a href={r.reraCertUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      Open PDF
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
