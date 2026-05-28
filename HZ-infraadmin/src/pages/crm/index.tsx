'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import adminApi from '@/lib/axios';
import {
  Users,
  Zap,
  MapPin,
  CheckCircle,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { CRM_STAGES } from '@/components/crm/crmConstants';
import { StageBadge } from '@/components/crm/StageBadge';
import { LeadScoreRing } from '@/components/crm/LeadScoreRing';
import { getAvatarColor } from '@/components/crm/crmConstants';
import { formatDate } from '@/lib/utils';

type Stats = {
  totalLeads?: number;
  hotLeads?: number;
  siteVisits?: number;
  siteVisitsToday?: number;
  tokenPaid?: number;
  registered?: number;
  followUpsDue?: number;
  stageCounts?: Record<string, number>;
  sourceCounts?: Record<string, number>;
  pipelineValue?: number;
  weightedValue?: number;
  avgDealSize?: number;
  conversionRate?: number;
  avgDaysToClose?: number;
  overdueLeadsPreview?: Array<{
    id: string;
    fullName: string;
    phone: string;
    nextFollowUpAt?: string | null;
    stage?: string;
  }>;
  recentLeads?: Array<{
    id: string;
    fullName: string;
    phone: string;
    stage: string;
    priority: string;
    propertyType: string;
    bhkPreference?: string | null;
    budgetRange?: string | null;
    source?: string;
    leadScore: number;
    createdAt?: string;
  }>;
};

const ic = { size: 22, strokeWidth: 1.8 as const, fill: 'none' as const };

export default function CrmDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<Stats>('/admin/crm/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to load CRM stats');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const kpi = [
    { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: Users, bg: '#eff6ff', color: '#1f2933' },
    { label: 'Hot Leads', value: stats?.hotLeads ?? 0, icon: Zap, bg: '#fff7ed', color: '#ea580c' },
    { label: 'Site Visits', value: stats?.siteVisits ?? 0, icon: MapPin, bg: '#fdf4ff', color: '#a21caf' },
    { label: 'Token Paid', value: stats?.tokenPaid ?? 0, icon: CheckCircle, bg: '#ccfbf1', color: '#0d9488' },
    { label: 'Registered', value: stats?.registered ?? 0, icon: CheckCircle2, bg: '#dcfce7', color: '#16a34a' },
    { label: 'Follow-ups Due', value: stats?.followUpsDue ?? 0, icon: CalendarDays, bg: '#fffbeb', color: '#ca8a04' },
  ];

  const maxStage = Math.max(1, ...CRM_STAGES.map((s) => stats?.stageCounts?.[s.id] ?? 0));

  return (
    <AdminLayout title="CRM">
      <CrmLayout>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
          }}
        >
          {kpi.map((k) => (
            <div
              key={k.label}
              className="stat"
            >
              <span className="stat-icon" style={{ background: k.bg }}>
                <k.icon {...ic} color={k.color} />
              </span>
              <div>
                <div className="stat-lbl">{k.label}</div>
                <div className="stat-val" style={{ color: k.color }}>
                  {k.value.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 16, marginTop: 18 }} className="max-lg:grid-cols-1">
          <div className="acard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700 }}>Pipeline</span>
              <Link href="/crm/pipeline" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                View kanban <ArrowRight size={14} strokeWidth={1.8} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CRM_STAGES.slice(0, 8).map((s) => {
                const n = stats?.stageCounts?.[s.id] ?? 0;
                const pct = Math.round((n / maxStage) * 100);
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 150, fontSize: 11.5, color: '#475569', flexShrink: 0 }}>{s.label}</div>
                    <div style={{ flex: 1, height: 7, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.border, borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ width: 28, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1f2933' }}>{n}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="acard">
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Leads by source</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(stats?.sourceCounts ?? {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([src, c]) => (
                    <div key={src} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2f80ed', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: '#475569' }}>{src}</span>
                      <strong>{c}</strong>
                    </div>
                  ))}
                {Object.keys(stats?.sourceCounts ?? {}).length === 0 ? <span style={{ color: 'var(--mu)', fontSize: 12 }}>No data yet</span> : null}
              </div>
            </div>

            <div className="acard crm-overdue-card">
              <div style={{ fontWeight: 800, fontSize: 12, color: '#b91c1c', marginBottom: 10 }}>Overdue follow-ups</div>
              {(stats?.overdueLeadsPreview ?? []).slice(0, 3).map((l) => (
                <div key={l.id} style={{ fontSize: 12.5, marginBottom: 8 }}>
                  <Link href={`/crm/leads/${l.id}`} style={{ fontWeight: 700, color: '#1f2933' }}>
                    {l.fullName}
                  </Link>
                  <div style={{ fontSize: 11, color: '#dc2626' }}>
                    Due {l.nextFollowUpAt ? formatDate(l.nextFollowUpAt) : '—'}
                  </div>
                </div>
              ))}
              <Link href="/crm/follow-ups" className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>
                View all →
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginTop: 16 }} className="max-lg:grid-cols-1">
          <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f4f8', fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>Recent leads</div>
            <table className="atbl crm-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Interested in</th>
                  <th>Budget</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentLeads ?? []).map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => void router.push(`/crm/leads/${r.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: getAvatarColor(r.fullName),
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 13,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {r.fullName.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700 }}>{r.fullName}</div>
                          <div style={{ fontSize: 11, color: 'var(--mu)' }}>{r.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {r.propertyType}
                      {r.bhkPreference ? ` · ${r.bhkPreference}` : ''}
                    </td>
                    <td style={{ fontWeight: 800, color: '#2f80ed' }}>{r.budgetRange ?? '—'}</td>
                    <td>
                      <StageBadge stage={r.stage} />
                    </td>
                    <td>
                      <span className={`bdg ${r.priority === 'hot' ? 'p-hot' : r.priority === 'warm' ? 'p-warm' : 'p-cold'}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td>
                      <LeadScoreRing score={r.leadScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="acard">
            <div style={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>Activity feed</div>
            <div style={{ fontSize: 12.5, color: 'var(--mu)', lineHeight: 1.6 }}>
              <p>✨ New leads and stage changes appear here as your team logs activity on lead detail pages.</p>
              <p className="mt-2">Pipeline value (est.): ₹{(stats?.pipelineValue ?? 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </CrmLayout>
    </AdminLayout>
  );
}
