import { useMemo, useState } from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import LiveDot from '@/livebuild/components/LiveDot';
import ProgressRing from '@/livebuild/components/ProgressRing';
import { LivebuildDashboardShell } from '@/livebuild/components/LivebuildProjectLayout';
import { lbIconProps } from '@/livebuild/components/icons';
import { useLivebuildSession } from '@/livebuild/lib/useLivebuildSession';
import { projectLocation, statusBadgeClass, statusLabel } from '@/livebuild/lib/format';
import type { LbProjectSummary } from '@/livebuild/lib/types';

type Filter = 'all' | 'in_progress' | 'completed' | 'on_hold';

function matchFilter(p: LbProjectSummary, f: Filter): boolean {
  if (f === 'all') return true;
  const s = p.status.toLowerCase();
  if (f === 'in_progress') return s.includes('progress') || s.includes('active') || s === 'live';
  if (f === 'completed') return s.includes('complete');
  if (f === 'on_hold') return s.includes('hold');
  return true;
}

export default function LivebuildDashboardPage() {
  const { ready, projects, canAccess } = useLivebuildSession(true);
  const loading = !ready;
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => projects.filter((p) => matchFilter(p, filter)),
    [projects, filter],
  );

  const counts = useMemo(() => {
    const all = projects.length;
    const progress = projects.filter((p) => matchFilter(p, 'in_progress')).length;
    const completed = projects.filter((p) => matchFilter(p, 'completed')).length;
    const hold = projects.filter((p) => matchFilter(p, 'on_hold')).length;
    return { all, progress, completed, hold };
  }, [projects]);

  return (
    <>
      <SeoHead title="My Projects | LiveBuild" description="Your LiveBuild projects." canonical="/livebuild/dashboard" />
      <LivebuildDashboardShell>
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid var(--brd)',
            padding: '0 24px',
            position: 'sticky',
            top: 60,
            zIndex: 150,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              gap: 12,
              flexWrap: 'wrap',
              maxWidth: 1440,
              margin: '0 auto',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--m)', fontSize: 18, fontWeight: 800, color: 'var(--ch)' }}>
                My Projects
              </div>
              <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>
                Track your construction progress in real time
              </div>
            </div>
            <div className="stf">
              {(
                [
                  ['all', `All (${counts.all})`],
                  ['in_progress', 'In Progress'],
                  ['completed', 'Completed'],
                  ['on_hold', 'On Hold'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`stf-btn ${filter === key ? 'on' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {key === 'in_progress' && filter === key && (
                    <LiveDot style={{ display: 'inline-block', marginRight: 3 }} />
                  )}
                  {key === 'in_progress' ? `${label} (${counts.progress})` : key === 'completed' ? `${label} (${counts.completed})` : key === 'on_hold' ? `${label} (${counts.hold})` : label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="content" style={{ paddingTop: 18 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--mu)' }}>Loading projects…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--mu)' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: 15, fontWeight: 700 }}>No projects found</div>
            </div>
          )}
          <div className="grid-4">
            {filtered.map((p) => {
              const pct = Math.round(p.overallProgress ?? 0);
              const barColor =
                p.status.toLowerCase().includes('hold')
                  ? 'var(--am)'
                  : p.status.toLowerCase().includes('complete')
                    ? '#16a34a'
                    : 'var(--blue)';
              return (
                <Link key={p.id} href={`/livebuild/${p.id}`} className="proj-card fade-up">
                  <div
                    className="proj-img"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg,var(--navy),#1a3d5c)',
                    }}
                  >
                    <ProgressRing
                      pct={pct}
                      size={88}
                      stroke={6}
                      color="rgba(255,255,255,.9)"
                      trackColor="rgba(255,255,255,.15)"
                    />
                    <div className="proj-progress-bar">
                      <div className="proj-progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <div className="proj-arrow">
                      <ChevronRight size={14} {...lbIconProps()} />
                    </div>
                  </div>
                  <div className="proj-body">
                    <div className="proj-title">{p.title}</div>
                    <div className="proj-loc">
                      <MapPin size={12} {...lbIconProps()} />
                      {projectLocation(p)}
                    </div>
                    <Badge variant={statusBadgeClass(p.status)}>{statusLabel(p.status)}</Badge>
                    <span style={{ marginLeft: 8, fontFamily: 'var(--m)', fontWeight: 800, fontSize: 12 }}>
                      {pct}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </LivebuildDashboardShell>
    </>
  );
}
