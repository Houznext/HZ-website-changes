import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Card from '@/livebuild/components/Card';
import LiveDot from '@/livebuild/components/LiveDot';
import ProgressBar from '@/livebuild/components/ProgressBar';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbDayProgress, LbProjectSummary, LbWorkTypeProgress } from '@/livebuild/lib/types';

function WorkTypeDayCard({ wt }: { wt: LbWorkTypeProgress }) {
  const days = wt.days ?? [];
  const [activeDate, setActiveDate] = useState(days[0]?.date ?? '');

  useEffect(() => {
    if (days.length && !days.some((d) => d.date === activeDate)) {
      setActiveDate(days[0].date);
    }
  }, [days, activeDate]);

  const activePhotos = days.find((d) => d.date === activeDate)?.photos ?? [];
  const photoCount = days.reduce((n, d) => n + d.photos.length, 0);

  return (
    <Card className="fade-up" style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700 }}>{wt.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{photoCount} photos in period</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {wt.status === 'live' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>
              <LiveDot /> Live
            </span>
          )}
          <span style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 800 }}>{Math.round(wt.progressPct)}%</span>
        </div>
      </div>
      <ProgressBar pct={wt.progressPct} />
      {days.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 12, paddingBottom: 4 }}>
            {days.map((day) => (
              <button
                key={day.date}
                type="button"
                className={`cal-chip ${activeDate === day.date ? 'on' : ''}`}
                onClick={() => setActiveDate(day.date)}
              >
                {formatDate(day.date)}
                {day.photos.length ? ` (${day.photos.length})` : ''}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10, paddingBottom: 6 }}>
            {activePhotos.map((ph) => (
              <a
                key={ph.id}
                href={ph.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flexShrink: 0,
                  width: 72,
                  height: 58,
                  borderRadius: 9,
                  overflow: 'hidden',
                  border: activeDate ? '2px solid var(--blue)' : '2px solid var(--brd)',
                  background: '#e2e8f0',
                }}
              >
                <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </a>
            ))}
            {!activePhotos.length && (
              <span style={{ fontSize: 12, color: 'var(--mu)', padding: '8px 0' }}>No photos for this day.</span>
            )}
          </div>
        </>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--mu)', marginTop: 12 }}>No daily updates in this period yet.</p>
      )}
    </Card>
  );
}

export default function LivebuildDayProgressPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [data, setData] = useState<LbDayProgress | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    livebuildApi.projectHome(projectId).then((h) => setProject(h.project)).catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await livebuildApi.dayProgress(projectId, {
          roomId: roomId ?? undefined,
          range,
        });
        if (!cancelled) {
          setData(d);
          if (!roomId && d.rooms?.[0]) setRoomId(d.rooms[0].id);
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, roomId, range]);

  const activeRoom = useMemo(
    () => data?.rooms?.find((r) => r.id === roomId) ?? data?.rooms?.[0],
    [data, roomId],
  );

  return (
    <>
      <SeoHead title="Day Progress | LiveBuild" description="Daily progress photos" canonical={`/livebuild/${projectId}/day-progress`} />
      <LivebuildProjectLayout project={project} loading={!project}>
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid var(--brd)',
            padding: '8px 24px',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', gap: 8, maxWidth: 1100, margin: '0 auto' }}>
            {(data?.rooms ?? []).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoomId(r.id)}
                style={{
                  flexShrink: 0,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: `1.5px solid ${roomId === r.id ? 'var(--blue)' : '#e2e8f0'}`,
                  background: roomId === r.id ? 'var(--bl)' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 15 }}>{r.icon ?? '🏠'}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 12, fontWeight: 700, color: roomId === r.id ? 'var(--blue)' : 'var(--ch)' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--mu)' }}>{Math.round(r.progressPct)}% done</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="content" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
          <div className="cal-filter" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--mu)' }}>Period:</span>
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
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (data?.workTypes ?? []).map((wt) => <WorkTypeDayCard key={wt.id} wt={wt} />)}
          {!loading && !(data?.workTypes?.length) && (
            <Card style={{ textAlign: 'center', color: 'var(--mu)' }}>
              No progress for {activeRoom?.name ?? 'this room'} in the selected period. Updates appear here after your team submits DPR.
            </Card>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
