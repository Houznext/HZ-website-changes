import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Button from '@/livebuild/components/Button';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { LivebuildToastProvider, useLbToast } from '@/livebuild/components/ToastProvider';
import { livebuildApi } from '@/livebuild/lib/api';
import {
  formatDate,
  paymentStatusBadge,
  paymentStatusLabel,
} from '@/livebuild/lib/format';
import type { LbPaymentMilestone, LbPayments, LbProjectSummary } from '@/livebuild/lib/types';

function PaidIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round">
      <path d="M9 11l3 3L22 4" />
    </svg>
  );
}

function DueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rd)" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function UpcomingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function milestoneIcon(status: string) {
  if (status === 'paid') return <PaidIcon />;
  if (status === 'due') return <DueIcon />;
  return <UpcomingIcon />;
}

function milestoneIconBg(status: string) {
  if (status === 'paid') return 'var(--bl)';
  if (status === 'due') return '#fee2e2';
  return '#f1f5f9';
}

function PayRow({ m }: { m: LbPaymentMilestone }) {
  const pctColor = m.status === 'paid' ? 'var(--blue)' : m.status === 'due' ? 'var(--rd)' : 'var(--mu)';
  const dueLine = m.dueDate
    ? `Due: ${formatDate(m.dueDate)}${m.paidDate ? ` · Paid: ${formatDate(m.paidDate)}` : ''}`
    : m.paidDate
      ? `Paid: ${formatDate(m.paidDate)}`
      : '';

  return (
    <div className="pay-row">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: milestoneIconBg(m.status),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {milestoneIcon(m.status)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch)' }}>{m.name}</div>
        {dueLine && <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{dueLine}</div>}
        <div style={{ marginTop: 6, height: 5, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: m.status === 'paid' ? '100%' : '0%',
              background: m.status === 'paid' ? 'var(--blue)' : m.status === 'due' ? 'var(--rd)' : '#e2e8f0',
              borderRadius: 5,
              transition: 'width .7s ease',
            }}
          />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
        <div style={{ fontFamily: 'var(--m)', fontSize: 15, fontWeight: 800, color: pctColor }}>
          {Math.round(m.progressPct)}%
        </div>
        <span className={`bdg ${paymentStatusBadge(m.status)}`} style={{ fontSize: 8.5 }}>
          {paymentStatusLabel(m.status)}
        </span>
      </div>
    </div>
  );
}

function LivebuildPaymentsContent() {
  const router = useRouter();
  const { toast } = useLbToast();
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
  const pendingPct = Math.round(payments?.pendingPct ?? Math.max(0, 100 - paidPct));
  const total = payments?.totalMilestones ?? payments?.milestones?.length ?? 0;
  const paidCount = payments?.paidMilestonesCount ?? payments?.milestones?.filter((m) => m.status === 'paid').length ?? 0;
  const pendingCount =
    payments?.pendingMilestonesCount ?? payments?.milestones?.filter((m) => m.status !== 'paid').length ?? 0;
  const nextDue = payments?.nextDue ?? payments?.milestones?.find((m) => m.status === 'due' || m.status === 'upcoming');

  const downloadStatement = () => {
    if (payments?.statementUrl) {
      window.open(payments.statementUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    toast('Downloading statement…');
  };

  return (
    <>
      <SeoHead title="Payments | LiveBuild" description="Payment milestones" canonical={`/livebuild/${projectId}/payments`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && payments && (
            <>
              <div className="grid-3 fade-up" style={{ marginBottom: 18 }}>
                <Card small style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--m)', marginBottom: 4 }}>
                    Total milestones
                  </div>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: 'var(--ch)' }}>{total}</div>
                  <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>Across project</div>
                </Card>
                <Card small style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--m)', marginBottom: 4 }}>
                    Paid so far
                  </div>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{paidPct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>
                    {paidCount} milestone{paidCount === 1 ? '' : 's'} cleared
                  </div>
                </Card>
                <Card small style={{ textAlign: 'center', borderColor: '#fca5a5', background: '#fff5f5' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--rd)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--m)', marginBottom: 4 }}>
                    Pending
                  </div>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: 'var(--rd)' }}>{pendingPct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--rd)', marginTop: 2 }}>
                    {pendingCount} invoice{pendingCount === 1 ? '' : 's'} pending
                  </div>
                </Card>
              </div>

              <Card className="fade-up" style={{ marginBottom: 16, padding: '18px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--mu)' }}>Payment progress</span>
                  <span style={{ fontWeight: 700, color: 'var(--ch)' }}>
                    {paidPct}% complete · {pendingPct}% remaining
                  </span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${paidPct}%`,
                      background: 'linear-gradient(90deg,var(--blue),var(--bh))',
                      borderRadius: 8,
                      transition: 'width .8s ease',
                    }}
                  />
                </div>
              </Card>

              <Card className="fade-up" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <div
                  style={{
                    padding: '16px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>
                    Payment schedule
                  </div>
                  <Button variant="ghost" size="sm" onClick={downloadStatement}>
                    ↓ Statement
                  </Button>
                </div>
                <div style={{ padding: '0 18px' }}>
                  {(payments.milestones ?? []).map((m) => (
                    <PayRow key={m.id} m={m} />
                  ))}
                  {!(payments.milestones?.length) && (
                    <p style={{ color: 'var(--mu)', fontSize: 13, padding: '16px 0' }}>No payment milestones configured yet.</p>
                  )}
                </div>
              </Card>

              {nextDue && (nextDue.status === 'due' || nextDue.status === 'upcoming') && (
                <Card className="fade-up" style={{ borderColor: '#fca5a5', background: '#fff8f8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <DueIcon />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700, color: 'var(--ch)' }}>
                        {nextDue.name} — Payment due
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--mu)' }}>
                        {nextDue.dueDate ? `Due ${formatDate(nextDue.dueDate)} · ` : ''}
                        {Math.round(nextDue.progressPct)}% of total project cost
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="blue"
                    style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                    onClick={() => toast('Redirecting to payment…')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Pay now
                  </Button>
                  <div style={{ fontSize: 11, color: 'var(--mu)', textAlign: 'center', marginTop: 10 }}>
                    UPI · Net banking · Cards accepted · 100% secure
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}

export default function LivebuildPaymentsPage() {
  return (
    <LivebuildToastProvider>
      <LivebuildPaymentsContent />
    </LivebuildToastProvider>
  );
}
