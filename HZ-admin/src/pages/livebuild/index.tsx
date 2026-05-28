import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Building2,
  CreditCard,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react';
import withLivebuildLayout from '@/src/common/LivebuildAdminLayout';
import livebuildApi from '@/src/livebuild/lib/api';
import type { LbDashboard } from '@/src/livebuild/lib/types';
import {
  Badge,
  Btn,
  LiveBuildPageHeader,
  NewProjectModal,
  ProgressRing,
  StatCard,
  lbToast,
} from '@/src/livebuild/components';
import { useLbStickyTop } from '@/src/livebuild/hooks/useLbStickyTop';
import Loader from '@/src/common/Loader';

function LiveBuildDashboardPage() {
  useLbStickyTop();
  const router = useRouter();
  const [data, setData] = useState<LbDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const body = await livebuildApi.getDashboard();
      setData(body);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load dashboard', 'err');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = data?.stats;

  return (
    <div className="lb-page">
      <LiveBuildPageHeader
        title="Dashboard"
        subtitle="LiveBuild admin overview"
        actions={
          <Btn variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={12} strokeWidth={2.5} />
            New project
          </Btn>
        }
      />
      <div className="lb-content">
        {loading ? (
          <div className="lb-loading">
            <Loader />
          </div>
        ) : (
          <>
            <div className="lb-g4 lb-fa" style={{ marginBottom: 18 }}>
              <StatCard
                label="Active projects"
                value={stats?.activeProjects ?? 0}
                sub={
                  stats?.completedProjects != null
                    ? `${stats.completedProjects} completed`
                    : undefined
                }
                valueColor="var(--lb-blue)"
                icon={<Building2 size={20} strokeWidth={1.8} color="#2563eb" />}
                onClick={() => router.push('/livebuild/projects')}
              />
              <StatCard
                label="Open queries"
                value={stats?.openQueries ?? 0}
                sub="Needs reply"
                valueColor="var(--lb-am)"
                icon={<MessageSquare size={20} strokeWidth={1.8} color="#ca8a04" />}
              />
              <StatCard
                label="Pending payments"
                value={stats?.pendingPayments ?? 0}
                sub={
                  stats?.pendingMilestones != null
                    ? `${stats.pendingMilestones} milestones due`
                    : 'Milestones due'
                }
                valueColor="var(--lb-rd)"
                icon={<CreditCard size={20} strokeWidth={1.8} color="#dc2626" />}
              />
              <StatCard
                label="Customers"
                value={stats?.customers ?? 0}
                sub="All active"
                valueColor="var(--lb-tl)"
                icon={<Users size={20} strokeWidth={1.8} color="#0d9488" />}
                onClick={() => router.push('/livebuild/customers')}
              />
            </div>

            <div className="lb-g2 lb-fa lb-fa2" style={{ marginBottom: 16 }}>
              <div className="lb-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700 }}>
                    Projects
                  </div>
                  <Link href="/livebuild/projects">
                    <Btn variant="ghost" size="sm">
                      View all →
                    </Btn>
                  </Link>
                </div>
                {(data?.projects ?? []).length === 0 ? (
                  <div className="lb-empty">No projects yet</div>
                ) : (
                  (data?.projects ?? []).slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="lb-tl-row"
                      style={{ padding: '12px 18px', cursor: 'pointer' }}
                      onClick={() => router.push(`/livebuild/projects/${p.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <ProgressRing pct={p.progressPct} size={44} strokeWidth={4} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>
                          {p.code} · {p.customerName}
                          {p.days ? ` · ${p.days}` : ''}
                        </div>
                        <div
                          className="lb-prog-track"
                          style={{ marginTop: 6, height: 4, maxWidth: 200 }}
                        >
                          <div
                            className="lb-prog-fill"
                            style={{ width: `${p.progressPct ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontFamily: 'var(--lb-m)',
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--lb-blue)',
                          }}
                        >
                          {p.progressPct ?? 0}%
                        </div>
                        <Badge variant="prog">{p.phase || 'Active'}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="lb-card">
                <div
                  style={{
                    fontFamily: 'var(--lb-m)',
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  Recent activity
                </div>
                {(data?.activity ?? []).length === 0 ? (
                  <div className="lb-empty" style={{ padding: 16 }}>
                    No recent activity
                  </div>
                ) : (
                  (data?.activity ?? []).slice(0, 8).map((a) => (
                    <div key={a.id} className="lb-tl-row">
                      <span className="lb-tl-dot" style={{ background: 'var(--lb-blue)' }} />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.message}</div>
                        <div style={{ fontSize: 11, color: 'var(--lb-mu)' }}>
                          {a.projectName ? `${a.projectName} · ` : ''}
                          {new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {(data?.openQueries ?? []).length > 0 ? (
              <div
                className="lb-card lb-fa lb-fa3"
                style={{ borderColor: '#fca5a5', background: '#fff8f8' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--lb-m)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--lb-rd)',
                    }}
                  >
                    Open queries — need response
                  </div>
                  <Link href="/livebuild/projects">
                    <Btn variant="ghost" size="sm">
                      View all →
                    </Btn>
                  </Link>
                </div>
                {(data?.openQueries ?? []).map((q) => (
                  <div
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    style={{
                      padding: '10px 0',
                      borderBottom: '0.5px solid #f1f5f9',
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      q.projectId &&
                      router.push(`/livebuild/projects/${q.projectId}?tab=queries`)
                    }
                  >
                    <strong>{q.subject}</strong>
                    <span style={{ color: 'var(--lb-mu)' }}>
                      {' '}
                      — {q.customerName || q.projectName}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(id) => {
          load();
          router.push(`/livebuild/projects/${id}`);
        }}
      />
    </div>
  );
}

export default withLivebuildLayout(LiveBuildDashboardPage);
