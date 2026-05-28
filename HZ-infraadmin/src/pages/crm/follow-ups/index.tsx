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
    const sectionClass = tone === 'red' ? 'fu-section fu-section--overdue' : tone === 'amber' ? 'fu-section fu-section--today' : 'fu-section';
    return (
      <div className={sectionClass}>
        <div className="fu-section-hd">{title}</div>
        <table className="atbl crm-table">
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
                <td className={tone === 'red' ? 'date-overdue' : tone === 'amber' ? 'date-today' : 'date-normal'}>{r.nextFollowUpAt ? formatDate(r.nextFollowUpAt) : '—'}</td>
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
          <div className="stat fu-section--overdue" style={{ cursor: 'default' }}>
            <div>
              <div className="stat-lbl" style={{ color: '#dc2626' }}>OVERDUE</div>
              <div className="stat-val" style={{ color: '#dc2626' }}>{data?.overdue?.length ?? 0}</div>
            </div>
          </div>
          <div className="stat fu-section--today" style={{ cursor: 'default' }}>
            <div>
              <div className="stat-lbl" style={{ color: '#ca8a04' }}>DUE TODAY</div>
              <div className="stat-val" style={{ color: '#ca8a04' }}>{data?.today?.length ?? 0}</div>
            </div>
          </div>
          <div className="stat" style={{ cursor: 'default', background: '#eff6ff', border: '0.5px solid #93c5fd' }}>
            <div>
              <div className="stat-lbl" style={{ color: '#2563eb' }}>UPCOMING 7D</div>
              <div className="stat-val" style={{ color: '#2563eb' }}>{data?.upcoming?.length ?? 0}</div>
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
