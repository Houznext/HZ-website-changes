import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, MapPin, Monitor } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import LiveDot from '@/livebuild/components/LiveDot';
import ProgressRing from '@/livebuild/components/ProgressRing';
import { LivebuildDashboardShell } from '@/livebuild/components/LivebuildProjectLayout';
import { lbIconProps } from '@/livebuild/components/icons';
import { useLivebuildSession } from '@/livebuild/lib/useLivebuildSession';
import { formatUpdateWhen, projectLocation } from '@/livebuild/lib/format';
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

function progressBarColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('hold')) return 'var(--am)';
  if (s.includes('complete')) return '#16a34a';
  return 'var(--blue)';
}

function ProjectStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s.includes('complete')) {
    return (
      <span className="bdg b-navy" style={{ fontSize: 8.5, flexShrink: 0 }}>
        ✓ Completed
      </span>
    );
  }
  if (s.includes('hold')) {
    return (
      <span className="bdg b-amber" style={{ fontSize: 8.5, flexShrink: 0 }}>
        On Hold
      </span>
    );
  }
  return (
    <span className="bdg b-blue" style={{ fontSize: 8.5, flexShrink: 0 }}>
      <LiveDot style={{ display: 'inline-block', marginRight: 2, width: 5, height: 5 }} />
      In Progress
    </span>
  );
}

function ProjectCard({ p, index }: { p: LbProjectSummary; index: number }) {
  const pct = Math.round(p.overallProgress ?? 0);
  const barColor = progressBarColor(p.status);
  const fallbackBg = p.coverGradient || 'linear-gradient(135deg,#1a3d5c,#0f2a44)';
  const thumbnails = p.coverThumbnails?.length
    ? p.coverThumbnails.slice(0, 4)
    : p.coverImageUrl
      ? [p.coverImageUrl]
      : [];
  const propertyLabel = (p.propertyLabel || p.bhk || 'Project').toUpperCase();
  const updateText = p.latestUpdate?.text ?? `${p.phase ?? 'Project'} · ${pct}% complete`;
  const updateWhen = formatUpdateWhen(p.latestUpdate?.at);
  const updateLine = updateWhen ? `${updateText} · ${updateWhen}` : updateText;
  const isLive = !p.status.toLowerCase().includes('hold') && !p.status.toLowerCase().includes('complete');

  return (
    <Link
      href={`/livebuild/${p.id}`}
      className="proj-card fade-up"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="proj-img">
        {thumbnails.length > 0 ? (
          <div className={`proj-thumb-grid cols-${Math.min(thumbnails.length, 4)}`}>
            {thumbnails.map((url, i) => (
              <img key={`${url}-${i}`} src={url} alt="" className="proj-thumb-cell" loading="lazy" />
            ))}
          </div>
        ) : (
          <div className="proj-img-fallback" style={{ background: fallbackBg }} />
        )}
        <div className="proj-img-overlay" />
        <div className="proj-img-content">
          <div className="proj-img-label">{propertyLabel}</div>
          <ProgressRing
            pct={pct}
            size={72}
            stroke={6}
            color="#fff"
            trackColor="rgba(255,255,255,.22)"
            label={`${pct}%`}
            labelColor="#fff"
          />
        </div>
        <div className="proj-progress-bar">
          <div
            className="proj-progress-fill"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className="proj-arrow">
          <ChevronRight size={14} {...lbIconProps({ color: 'var(--ch)' })} />
        </div>
      </div>
      <div className="proj-body">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div className="proj-title">{p.title}</div>
          <ProjectStatusBadge status={p.status} />
        </div>
        <div className="proj-loc">
          <MapPin size={10} {...lbIconProps()} />
          {projectLocation(p)}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {p.projectType ? (
            <span className="bdg b-gray" style={{ fontSize: 8.5 }}>
              {p.projectType}
            </span>
          ) : null}
          {p.roomCount != null && p.roomCount > 0 ? (
            <span className="bdg b-gray" style={{ fontSize: 8.5 }}>
              {p.roomCount} rooms
            </span>
          ) : null}
          {p.daysLabel ? (
            <span className="bdg b-gray" style={{ fontSize: 8.5 }}>
              Day {p.daysLabel}
            </span>
          ) : null}
          {p.phase ? (
            <span className="bdg b-gray" style={{ fontSize: 8.5 }}>
              {p.phase}
            </span>
          ) : null}
        </div>
        <div
          style={{
            background: 'var(--off)',
            borderRadius: 8,
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <LiveDot
            style={{
              flexShrink: 0,
              background: isLive ? 'var(--blue)' : '#94a3b8',
            }}
          />
          <div style={{ fontSize: 11.5, color: 'var(--mu)', lineHeight: 1.4 }}>
            {updateLine}
          </div>
        </div>
        {p.projectCode ? (
          <div style={{ fontSize: 10.5, color: 'var(--mu)', marginTop: 6 }}>
            Ref: {p.projectCode}
          </div>
        ) : null}
      </div>
    </Link>
  );
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
      <SeoHead
        title="My Projects | LiveBuild"
        description="Your LiveBuild projects."
        canonical="/livebuild/dashboard"
      />
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
              <div
                style={{
                  fontFamily: 'var(--m)',
                  fontSize: 18,
                  fontWeight: 800,
                  color: 'var(--ch)',
                }}
              >
                My Projects
              </div>
              <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>
                Track your construction progress in real time
              </div>
            </div>
            <div className="stf">
              {(
                [
                  ['all', `All (${counts.all})`, false],
                  ['in_progress', `In Progress (${counts.progress})`, true],
                  ['completed', `Completed (${counts.completed})`, false],
                  ['on_hold', `On Hold (${counts.hold})`, false],
                ] as const
              ).map(([key, label, showDot]) => (
                <button
                  key={key}
                  type="button"
                  className={`stf-btn ${filter === key ? 'on' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {showDot && filter === key ? (
                    <LiveDot style={{ display: 'inline-block', marginRight: 3 }} />
                  ) : null}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="content" style={{ paddingTop: 18 }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--mu)' }}>
              Loading projects…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div id="dash-empty" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <Monitor
                size={48}
                strokeWidth={1.5}
                color="#cbd5e1"
                style={{ margin: '0 auto 16px', display: 'block' }}
              />
              <div style={{ fontFamily: 'var(--m)', fontSize: 15, fontWeight: 700, color: 'var(--mu)' }}>
                No projects found
              </div>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div
              className="grid-4"
              style={{
                gap: 18,
                maxWidth: 1440,
                margin: '0 auto',
              }}
            >
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </LivebuildDashboardShell>
    </>
  );
}
