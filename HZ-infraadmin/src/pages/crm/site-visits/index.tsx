'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';

type Visit = {
  id: string;
  scheduledAt: string;
  status: string;
  agentName?: string | null;
  propertyTitle?: string | null;
  lead?: { fullName?: string; phone?: string };
};

export default function CrmSiteVisitsPage() {
  const [rows, setRows] = useState<Visit[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<Visit[]>('/admin/crm/site-visits');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load visits');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminLayout title="CRM — Site visits">
      <CrmLayout>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="max-md:grid-cols-2">
          {[
            ['Scheduled today', rows.filter((v) => new Date(v.scheduledAt).toDateString() === new Date().toDateString()).length],
            ['This week', rows.length],
            ['Completed', rows.filter((v) => v.status === 'completed').length],
            ['Conversion (est.)', rows.length ? Math.round((rows.filter((v) => v.status === 'completed').length / rows.length) * 100) : 0],
          ].map(([a, b]) => (
            <div key={String(a)} className="acard stat-card">
              <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>{a}</div>
              <div className="stat-val" style={{ marginTop: 6 }}>
                {b}
                {String(a).includes('Conversion') ? '%' : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="acard" style={{ marginTop: 16, padding: 0, overflow: 'auto' }}>
          <table className="atbl">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Property</th>
                <th>When</th>
                <th>Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.lead?.fullName ?? '—'}</td>
                  <td>{v.propertyTitle ?? '—'}</td>
                  <td>{formatDate(v.scheduledAt)}</td>
                  <td>{v.agentName ?? '—'}</td>
                  <td>{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CrmLayout>
    </AdminLayout>
  );
}
