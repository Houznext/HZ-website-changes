'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';

type Visit = {
  visitId: string;
  name: string;
  phone: string;
  email?: string | null;
  preferredDate?: string | null;
  preferredSlot?: string | null;
  status: string;
  property?: { title?: string; propertyCode?: string } | null;
  createdAt?: string;
};

export default function SiteVisitsPage() {
  const [rows, setRows] = useState<Visit[]>([]);

  const load = async () => {
    try {
      const res = await adminApi.get('/admin/site-visits');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load site visits');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      await adminApi.patch(`/admin/site-visits/${id}`, { status });
      toast.success('Updated');
      void load();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <AdminLayout title="Site visits">
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Phone</th>
              <th>Property</th>
              <th>Preferred</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.visitId}>
                <td style={{ fontWeight: 600 }}>{v.name}</td>
                <td>{v.phone}</td>
                <td>
                  {v.property?.title ?? '—'}
                  {v.property?.propertyCode ? (
                    <span className="bdg b-gray" style={{ marginLeft: 6 }}>
                      {v.property.propertyCode}
                    </span>
                  ) : null}
                </td>
                <td>
                  {[v.preferredDate, v.preferredSlot].filter(Boolean).join(' · ') || '—'}
                </td>
                <td>
                  <select className="fi" style={{ minWidth: 120 }} value={v.status} onChange={(e) => void setStatus(v.visitId, e.target.value)}>
                    {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{v.createdAt ? formatDate(v.createdAt) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
