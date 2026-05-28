import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SeoHead from '@/components/SeoHead';
import Card from '@/livebuild/components/Card';
import ProgressBar from '@/livebuild/components/ProgressBar';
import ProgressGraph from '@/livebuild/components/ProgressGraph';
import ProgressRing from '@/livebuild/components/ProgressRing';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbProjectHome, LbProjectSummary, LbRoomDetail, LbWorkTypeProgress } from '@/livebuild/lib/types';

type SubTab = 'overview' | 'material' | 'images' | 'viz';

function WorkTypeOverviewRow({ wt }: { wt: LbWorkTypeProgress }) {
  const days = wt.days ?? [];
  const [activeDate, setActiveDate] = useState(days[0]?.date ?? '');
  const photos = days.find((d) => d.date === activeDate)?.photos ?? [];

  return (
    <div className="work-row" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 700 }}>{wt.name}</span>
        <span style={{ fontFamily: 'var(--m)', fontWeight: 800 }}>{Math.round(wt.progressPct)}%</span>
      </div>
      <ProgressBar pct={wt.progressPct} />
      {days.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10 }}>
          {days.map((d) => (
            <button
              key={d.date}
              type="button"
              className={`cal-chip ${activeDate === d.date ? 'on' : ''}`}
              onClick={() => setActiveDate(d.date)}
            >
              {formatDate(d.date)}
            </button>
          ))}
        </div>
      )}
      {photos.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto' }}>
          {photos.map((ph) => (
            <a key={ph.id} href={ph.url} target="_blank" rel="noopener noreferrer">
              <img
                src={ph.url}
                alt=""
                style={{ width: 56, height: 46, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LivebuildRoomPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const roomId = String(router.query.roomId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [homeRooms, setHomeRooms] = useState<LbProjectHome['rooms']>([]);
  const [room, setRoom] = useState<LbRoomDetail | null>(null);
  const [tab, setTab] = useState<SubTab>('overview');
  const [range, setRange] = useState('14d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    livebuildApi
      .projectHome(projectId)
      .then((h) => {
        setProject(h.project);
        setHomeRooms(h.rooms ?? []);
      })
      .catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !roomId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await livebuildApi.room(projectId, roomId);
        if (!cancelled) setRoom(r);
      } catch {
        if (!cancelled) setRoom(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, roomId]);

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'material', label: 'Material used' },
    { key: 'images', label: 'Images' },
    { key: 'viz', label: '3D' },
  ];

  return (
    <>
      <SeoHead title={`${room?.name ?? 'Room'} | LiveBuild`} description="Room detail" canonical={`/livebuild/${projectId}/rooms/${roomId}`} />
      <LivebuildProjectLayout project={project} showMainTabs>
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid var(--brd)',
            padding: '8px 24px',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', gap: 8, maxWidth: 1100, margin: '0 auto' }}>
            {homeRooms.map((r) => (
              <Link
                key={r.id}
                href={`/livebuild/${projectId}/rooms/${r.id}`}
                style={{
                  flexShrink: 0,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${roomId === r.id ? 'var(--blue)' : '#e2e8f0'}`,
                  background: roomId === r.id ? 'var(--bl)' : '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 15 }}>{r.icon ?? '🏠'}</span>
                <div>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 12, fontWeight: 700, color: roomId === r.id ? 'var(--blue)' : 'var(--ch)' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--mu)' }}>{Math.round(r.progressPct)}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <nav className="stabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`stab ${tab === t.key ? 'on' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="content" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && room && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <ProgressRing pct={room.progressPct} size={64} label={`${Math.round(room.progressPct)}%`} />
                <div>
                  <h2 style={{ fontFamily: 'var(--m)', fontSize: 18, fontWeight: 800, margin: 0 }}>{room.name}</h2>
                  <div style={{ marginTop: 8, maxWidth: 280 }}>
                    <ProgressBar pct={room.progressPct} />
                  </div>
                </div>
              </div>

              {tab === 'overview' && (
                <Card className="fade-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700 }}>{room.name} — Progress</div>
                      <div style={{ fontSize: 12, color: 'var(--mu)' }}>Day-by-day completion tracker</div>
                    </div>
                    <div className="cal-filter">
                      {(['7d', '14d', '30d'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`cal-chip ${range === r ? 'on' : ''}`}
                          onClick={() => setRange(r)}
                        >
                          Last {r.replace('d', '')} days
                        </button>
                      ))}
                    </div>
                  </div>
                  <ProgressGraph points={room.graphPoints ?? []} todayPct={room.progressPct} />
                  <div style={{ marginTop: 16 }}>
                    {(room.workTypes ?? []).map((wt) => (
                      <WorkTypeOverviewRow key={wt.id} wt={wt} />
                    ))}
                    {!(room.workTypes?.length) && (
                      <p style={{ color: 'var(--mu)', fontSize: 13 }}>Work types will appear when assigned by your project team.</p>
                    )}
                  </div>
                </Card>
              )}

              {tab === 'material' && (
                <Card>
                  {(room.materials ?? []).length === 0 ? (
                    <p style={{ color: 'var(--mu)' }}>No materials logged for this room yet.</p>
                  ) : (
                    (room.materials ?? []).map((m) => (
                      <div key={m.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '.5px solid #f1f5f9' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{m.spec}</div>
                        </div>
                        <span className={`bdg ${m.status === 'installed' ? 'b-blue' : 'b-gray'}`}>{m.status}</span>
                      </div>
                    ))
                  )}
                </Card>
              )}

              {tab === 'images' && (
                <div className="grid-3">
                  {(room.images ?? []).length === 0 ? (
                    <Card><p style={{ color: 'var(--mu)' }}>No site photos yet for this room.</p></Card>
                  ) : (
                    (room.images ?? []).map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-sm"
                        style={{ padding: 0, overflow: 'hidden' }}
                      >
                        <img src={img.url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                      </a>
                    ))
                  )}
                </div>
              )}

              {tab === 'viz' && (
                <Card>
                  {room.vizUrl ? (
                    <a href={room.vizUrl} target="_blank" rel="noopener noreferrer" className="btn btn-blue">
                      View floor plan / 3D
                    </a>
                  ) : (
                    <Link href={`/livebuild/${projectId}/viz`} className="btn btn-blue">
                      Open project 3D view
                    </Link>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
