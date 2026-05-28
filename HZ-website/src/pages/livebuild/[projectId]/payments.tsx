import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Card from '@/livebuild/components/Card';
import ProgressRing from '@/livebuild/components/ProgressRing';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate, statusBadgeClass, statusLabel } from '@/livebuild/lib/format';
import type { LbPayments, LbProjectSummary } from '@/livebuild/lib/types';

export default function LivebuildPaymentsPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [payments, setPayments] = useState<LbPayments | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [home, pay] = await Promise.all([
          livebuildApi.projectHome(projectId),
          livebuildApi.payments(projectId),
        ]);
        if (!cancelled) {
          setProject(home.project);
          setPayments(pay);
        }
      } catch {
        if (!cancelled) setPayments(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const paidPct = Math.round(payments?.overallPaidPct ?? 0);

  return (
    <>
      <SeoHead title="Payments | LiveBuild" description="Payment milestones" canonical={`/livebuild/${projectId}/payments`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && payments && (
            <>
              <div
                className="grid-3 fade-up"
                style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}
              >
                {[
                  ['Paid', `${paidPct}%`, 'var(--blue)'],
                  ['Remaining', `${Math.max(0, 100 - paidPct)}%`, 'var(--am)'],
                  [
                    'Next due',
                    payments.milestones?.find((m) => m.status === 'upcoming' || m.status === 'due')
                      ? `${Math.round(
                          payments.milestones.find((m) => m.status === 'upcoming' || m.status === 'due')!
                            .progressPct,
                        )}%`
                      : '—',
                    'var(--ch)',
                  ],
                ].map(([lbl, val, col]) => (
                  <Card key={lbl} small style={{ textAlign: 'center', padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', fontFamily: 'var(--m)' }}>
                      {lbl}
                    </div>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: col, marginTop: 4 }}>{val}</div>
                  </Card>
                ))}
              </div>
              <Card className="fade-up" style={{ marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Overall paid</div>
                <ProgressRing pct={paidPct} size={100} stroke={8} label={`${paidPct}%`} subLabel="of contract" />
                <p style={{ fontSize: 12, color: 'var(--mu)', marginTop: 12 }}>
                  Percentages only — amounts are shared by your project manager.
                </p>
              </Card>
              <Card>
                <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Milestones</div>
                {(payments.milestones ?? []).map((m) => (
                  <div key={m.id} className="pay-row">
                    <ProgressRing pct={m.progressPct} size={48} stroke={4} label={`${Math.round(m.progressPct)}%`} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                      {m.dueDate && (
                        <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>Due {formatDate(m.dueDate)}</div>
                      )}
                    </div>
                    <span className={`bdg ${statusBadgeClass(m.status)}`}>{statusLabel(m.status)}</span>
                  </div>
                ))}
                {!(payments.milestones?.length) && (
                  <p style={{ color: 'var(--mu)', fontSize: 13 }}>No payment milestones configured yet.</p>
                )}
              </Card>
            </>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
