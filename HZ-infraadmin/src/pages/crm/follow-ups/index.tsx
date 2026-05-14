'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import adminApi from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { StageBadge } from '@/components/crm/StageBadge';

type L = {
  id: string;
  fullName: string;
  propertyType?: string;
  bhkPreference?: string | null;
  stage?: string;
  nextFollowUpAt?: string | null;
  followUpMethod?: string;
  assignedTo?: string | null;
};

export default function CrmFollowUpsPage() {
  const [data, setData] = useState<{ overdue: L[]; today: L[]; upcoming: L[] } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<{ overdue: L[]; today: L[]; upcoming: L[] }>('/admin/crm/follow-ups');
      setData(res.data);
    } catch {
      toast.error('Failed to load follow-ups');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const Section = ({
    title,
    tone,
    rows,
  }: {
    title: string;
    tone: 'red' | 'amber' | 'neutral';
    rows: L[];
  }) => {
    const bg = tone === 'red' ? '#fff5f5' : tone === 'amber' ? '#fffbeb' : '#fff';
    const bd = tone === 'red' ? '#fca5a5' : tone === 'amber' ? '#fbbf24' : '#e2e8f0';
    return (
      <div className="acard" style={{ background: bg, borderColor: bd, padding: 0, overflow: 'auto', marginBottom: 16 }}>
        <div style={{ padding: '12px 16px', fontWeight: 800, fontSize: 12.5, borderBottom: `1px solid ${bd}` }}>{title}</div>
        <table className="atbl">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Interested in</th>
              <th>Stage</th>
              <th>Due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700 }}>{r.fullName}</td>
                <td>
                  {r.propertyType} {r.bhkPreference ? `· ${r.bhkPreference}` : ''}
                </td>
                <td>{r.stage ? <StageBadge stage={r.stage} /> : '—'}</td>
                <td style={{ color: tone === 'red' ? '#dc2626' : undefined }}>{r.nextFollowUpAt ? formatDate(r.nextFollowUpAt) : '—'}</td>
                <td>
                  <Link href={`/crm/leads/${r.id}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AdminLayout title="CRM — Follow-ups">
      <CrmLayout>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="max-md:grid-cols-1">
          <div className="acard stat-card" style={{ borderColor: '#fca5a5', background: '#fff5f5' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#b91c1c' }}>OVERDUE</div>
            <div className="stat-val" style={{ color: '#b91c1c' }}>
              {data?.overdue?.length ?? 0}
            </div>
          </div>
          <div className="acard stat-card" style={{ borderColor: '#fbbf24', background: '#fffbeb' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#92400e' }}>DUE TODAY</div>
            <div className="stat-val" style={{ color: '#92400e' }}>
              {data?.today?.length ?? 0}
            </div>
          </div>
          <div className="acard stat-card" style={{ borderColor: '#93c5fd', background: '#eff6ff' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#1d4ed8' }}>UPCOMING 7D</div>
            <div className="stat-val" style={{ color: '#1d4ed8' }}>
              {data?.upcoming?.length ?? 0}
            </div>
          </div>
        </div>

        <Section title="🚨 Overdue — Action needed" tone="red" rows={data?.overdue ?? []} />
        <Section title="Due today" tone="amber" rows={data?.today ?? []} />
        <Section title="Upcoming 7 days" tone="neutral" rows={data?.upcoming ?? []} />
      </CrmLayout>
    </AdminLayout>
  );
}
