import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  FileText,
  Tag,
  CreditCard,
  FolderOpen,
  Box,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import Card from '@/livebuild/components/Card';
import LiveDot from '@/livebuild/components/LiveDot';
import ProgressGraph, { GRAPH_ZOOM_MAX, GRAPH_ZOOM_MIN, GRAPH_ZOOM_STEP } from '@/livebuild/components/ProgressGraph';
import ProgressRing from '@/livebuild/components/ProgressRing';
import RoomTypeIcon from '@/livebuild/components/RoomTypeIcon';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { lbIconProps } from '@/livebuild/components/icons';
import { livebuildApi } from '@/livebuild/lib/api';
import type { LbGraphPoint, LbProjectHome } from '@/livebuild/lib/types';
import {
  getPropertyCategory,
  PROPERTY_CATEGORY_FEATURES,
  shouldShowRoomProgressHome,
} from '@/livebuild/lib/propertyInfoConfig';

export default function LivebuildProjectHomePage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [data, setData] = useState<LbProjectHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const home = await livebuildApi.projectHome(projectId);
        if (!cancelled) setData(home);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const project = data?.project;
  const pct = Math.round(project?.overallProgress ?? 0);
  const stats = data?.stats;
  const openQ = data?.openQueriesCount ?? 0;
  const category = getPropertyCategory(project?.propertyType ?? project?.propertyLabel);
  const features = PROPERTY_CATEGORY_FEATURES[category];
  const rooms = data?.rooms ?? [];
  const showRoomProgress = shouldShowRoomProgressHome(category, rooms.length);

  const [graphZoom, setGraphZoom] = useState(1);

  const openDayFromGraph = (point: LbGraphPoint) => {
    if (!point.date) {
      void router.push(`/livebuild/${projectId}/day-progress`);
      return;
    }
    void router.push(`/livebuild/${projectId}/day-progress?date=${point.date}`);
  };

  return (
    <>
      <SeoHead title={`${project?.title ?? 'Project'} | LiveBuild`} description="Project home" canonical={`/livebuild/${projectId}`} />
      <LivebuildProjectLayout project={project} loading={loading} queriesBadge={openQ}>
        <div className="content" style={{ paddingBottom: 80, maxWidth: 1100, margin: '0 auto' }}>
          {error && <Card style={{ color: 'var(--rd)', marginBottom: 16 }}>{error}</Card>}
          {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && data && (
            <>
              <Card className="fade-up" style={{ marginBottom: 16, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 15, fontWeight: 700, color: 'var(--ch)', marginBottom: 4 }}>
                      Overall Progress
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--mu)' }}>
                      {stats?.totalDays ? `${stats.totalDays}-day project` : 'Project timeline'}
                      {project?.startedAt && ` · Started ${new Date(project.startedAt).toLocaleDateString('en-IN')}`}
                    </div>
                  </div>
                  <div className="stf">
                    <button
                      type="button"
                      className="stf-btn graph-zoom-btn"
                      aria-label="Zoom out"
                      disabled={graphZoom <= GRAPH_ZOOM_MIN}
                      onClick={() => setGraphZoom((z) => Math.max(GRAPH_ZOOM_MIN, z - GRAPH_ZOOM_STEP))}
                    >
                      <Minus size={14} {...lbIconProps()} />
                    </button>
                    <button
                      type="button"
                      className="stf-btn graph-zoom-btn"
                      aria-label="Zoom in"
                      disabled={graphZoom >= GRAPH_ZOOM_MAX}
                      onClick={() => setGraphZoom((z) => Math.min(GRAPH_ZOOM_MAX, z + GRAPH_ZOOM_STEP))}
                    >
                      <Plus size={14} {...lbIconProps()} />
                    </button>
                    <button type="button" className="stf-btn on">
                      <LiveDot style={{ display: 'inline-block', marginRight: 3 }} />
                      Live
                    </button>
                  </div>
                </div>
                <ProgressGraph
                  points={data.graphPoints ?? []}
                  todayPct={pct}
                  totalDays={stats?.totalDays ?? 50}
                  startDate={project?.startedAt}
                  onPointClick={openDayFromGraph}
                  zoom={graphZoom}
                  onZoomChange={setGraphZoom}
                />
                {stats && (
                  <div className="lb-stat-row" style={{ marginTop: 16 }}>
                    {[
                      ['Completed', `${stats.completedPct}%`, 'var(--blue)'],
                      ['Days elapsed', `${stats.daysElapsed}/${stats.totalDays}`, 'var(--ch)'],
                      ['Days remaining', String(stats.daysRemaining), 'var(--am)'],
                      ['On target', stats.onTargetLabel ?? '—', 'var(--blue)'],
                    ].map(([lbl, val, col], i) => (
                      <div
                        key={lbl}
                        style={{
                          padding: '12px 14px',
                          background: i % 2 === 0 ? 'var(--off)' : '#fff',
                          borderLeft: i ? '.5px solid #e2e8f0' : undefined,
                        }}
                      >
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', fontFamily: 'var(--m)', marginBottom: 3 }}>
                          {lbl}
                        </div>
                        <div style={{ fontFamily: 'var(--m)', fontSize: 18, fontWeight: 800, color: col }}>
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {showRoomProgress ? (
                <>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Home size={14} {...lbIconProps({ color: 'var(--blue)' })} />
                    {features.roomProgressTitle}
                    {features.showBhkBadge && project?.bhk ? <Badge variant="blue">{project.bhk}</Badge> : null}
                  </div>
                  <div className="grid-3" style={{ marginBottom: 16 }}>
                    {rooms.map((room) => (
                  <Link
                    key={room.id}
                    href={`/livebuild/${projectId}/rooms/${room.id}`}
                    className={`room-card ${room.color ?? 'apt'} fade-up`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ marginBottom: 6 }}>
                          <RoomTypeIcon name={room.name} size={22} color="var(--blue)" />
                        </div>
                        <div style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 14 }}>{room.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 4 }}>{room.lastUpdate ? `Updated ${room.lastUpdate}` : '—'}</div>
                      </div>
                      <ProgressRing
                        pct={room.progressPct}
                        size={52}
                        stroke={5}
                        labelColor="var(--ch)"
                        trackColor="#e8eef5"
                      />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div className="lb-prog-bar">
                        <div className="lb-prog-bar-fill" style={{ width: `${room.progressPct}%` }} />
                      </div>
                    </div>
                  </Link>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="fade-up fa3" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Box size={14} {...lbIconProps({ color: 'var(--pu)' })} />
                  {features.vizHomeTitle}
                </div>
                <Link href={`/livebuild/${projectId}/viz`} className="viz-card" style={{ height: 200, display: 'block' }}>
                  <div className="viz-overlay">
                    <span className="btn btn-blue">Open 3D View</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(to top,rgba(15,42,68,.8),transparent)' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{features.vizHomeCta}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.6)' }}>{pct}% rendered</div>
                  </div>
                </Link>
              </div>

              <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick links</div>
              <div className="grid-4">
                {[
                  { href: `/livebuild/${projectId}/property-info`, Icon: Home, bg: '#e8f1fd', stroke: 'var(--blue)', title: 'Property Info', sub: features.propertyInfoQuickSub },
                  { href: `/livebuild/${projectId}/materials`, Icon: Tag, bg: '#fef3c7', stroke: 'var(--am)', title: 'Materials and BOQ', sub: 'BOQ & specifications' },
                  { href: `/livebuild/${projectId}/payments`, Icon: CreditCard, bg: '#f3e8ff', stroke: 'var(--pu)', title: 'Payments', sub: `${data.paymentDuePct != null ? `${data.paymentDuePct}% due` : 'Milestones'}` },
                  { href: `/livebuild/${projectId}/documents`, Icon: FolderOpen, bg: '#ccfbf1', stroke: '#0d9488', title: 'Documents', sub: 'Warranty & project files' },
                ].map(({ href, Icon, bg, stroke, title, sub }) => (
                  <Link key={href} href={href} className="ql-card">
                    <div className="ql-icon" style={{ background: bg }}>
                      <Icon size={20} {...lbIconProps({ color: stroke })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{sub}</div>
                    </div>
                    <ChevronRight className="ql-arrow" size={16} {...lbIconProps({ color: 'var(--mu)' })} />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
