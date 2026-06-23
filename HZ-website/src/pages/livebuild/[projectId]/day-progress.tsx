import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Card from '@/livebuild/components/Card';
import LiveDot from '@/livebuild/components/LiveDot';
import RoomTypeIcon from '@/livebuild/components/RoomTypeIcon';
import ImageLightbox from '@/livebuild/components/ImageLightbox';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { LivebuildToastProvider, useLbToast } from '@/livebuild/components/ToastProvider';
import { livebuildApi } from '@/livebuild/lib/api';
import {
  dayProgressFilterLabel,
  formatDate,
  formatDateShort,
} from '@/livebuild/lib/format';
import type { LbDayProgress, LbProjectSummary, LbWorkTypeProgress } from '@/livebuild/lib/types';

function WrenchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function WorkTypeDayCard({ wt, index }: { wt: LbWorkTypeProgress; index: number }) {
  const days = wt.days ?? [];
  const [activeDate, setActiveDate] = useState(days[days.length - 1]?.date ?? '');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (days.length && !days.some((d) => d.date === activeDate)) {
      setActiveDate(days[days.length - 1].date);
    }
  }, [days, activeDate]);

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeDate]);

  const activePhotos = days.find((d) => d.date === activeDate)?.photos ?? [];
  const photoCount = days.reduce((n, d) => n + d.photos.length, 0);
  const barColor = wt.status === 'live' ? 'var(--blue)' : '#e2e8f0';

  return (
    <Card className="fade-up" style={{ marginBottom: 14, animationDelay: `${index * 0.07}s` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: 'var(--bl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WrenchIcon />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700, color: 'var(--ch)' }}>{wt.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 2 }}>
              {photoCount} photos across {days.length} days
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {wt.status === 'live' && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>
              <LiveDot /> Live
            </span>
          )}
          <span style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 800, color: 'var(--ch)' }}>
            {Math.round(wt.progressPct)}%
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, wt.progressPct)}%`,
            background: barColor,
            borderRadius: 6,
            transition: 'width .8s ease',
          }}
        />
      </div>
      {days.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
            {days.map((day) => {
              const isActive = day.date === activeDate;
              const firstPhoto = day.photos[0];
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setActiveDate(day.date)}
                  style={{
                    flexShrink: 0,
                    width: 58,
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      height: 48,
                      borderRadius: 9,
                      border: `2px solid ${isActive ? 'var(--blue)' : 'transparent'}`,
                      background: firstPhoto ? '#e2e8f0' : '#f1f5f9',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all .18s',
                    }}
                  >
                    {firstPhoto ? (
                      <img src={firstPhoto.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, opacity: 0.3 }}>
                        📷
                      </div>
                    )}
                    {day.photos.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 3,
                          right: 3,
                          background: 'rgba(0,0,0,.45)',
                          color: '#fff',
                          fontSize: 7.5,
                          padding: '1px 5px',
                          borderRadius: 8,
                          fontFamily: 'var(--m)',
                          fontWeight: 700,
                        }}
                      >
                        {day.photos.length}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: isActive ? 'var(--blue)' : 'var(--mu)',
                      textAlign: 'center',
                      marginTop: 3,
                      fontFamily: 'var(--m)',
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    {formatDateShort(day.date)}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            {activePhotos.map((ph, i) => (
              <button
                key={ph.id}
                type="button"
                className="lb-photo-thumb"
                onClick={() => setLightboxIndex(i)}
                aria-label="View photo"
                style={{
                  flexShrink: 0,
                  width: 88,
                  height: 72,
                  borderRadius: 9,
                  overflow: 'hidden',
                  border: '2px solid var(--blue)',
                  background: '#e2e8f0',
                }}
              >
                <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
            {!activePhotos.length && (
              <span style={{ fontSize: 12, color: 'var(--mu)', padding: '6px 0' }}>No photos for this day.</span>
            )}
          </div>
          <ImageLightbox
            images={activePhotos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        </>
      ) : (
        <p style={{ fontSize: 12.5, color: 'var(--mu)', padding: '6px 0' }}>No photos for selected period.</p>
      )}
    </Card>
  );
}

function LivebuildDayProgressContent() {
  const router = useRouter();
  const { toast } = useLbToast();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [data, setData] = useState<LbDayProgress | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [range, setRange] = useState('7d');
  const [specificDate, setSpecificDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filterLabel = useMemo(
    () => dayProgressFilterLabel(range, specificDate),
    [range, specificDate],
  );

  useEffect(() => {
    if (!projectId) return;
    livebuildApi.projectHome(projectId).then((h) => setProject(h.project)).catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    const q = router.query.date;
    if (typeof q === 'string' && q) {
      setSpecificDate(q);
    }
  }, [router.query.date]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await livebuildApi.dayProgress(projectId, {
          roomId: roomId ?? undefined,
          range: specificDate ? undefined : range,
          date: specificDate ?? undefined,
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
  }, [projectId, roomId, range, specificDate]);

  const selectRange = (r: string) => {
    setSpecificDate(null);
    setRange(r);
  };

  const onSpecificDate = (val: string) => {
    if (!val) return;
    setSpecificDate(val);
    toast(`Showing ${formatDate(val)}`);
  };

  return (
    <>
      <SeoHead title="Day Progress | LiveBuild" description="Daily progress photos" canonical={`/livebuild/${projectId}/day-progress`} />
      <LivebuildProjectLayout project={project} loading={!project}>
        <div className="content" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
          <Card style={{ marginBottom: 16, padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: 12.5, fontWeight: 700, color: 'var(--ch)' }}>Filter by:</div>
              <div className="cal-filter">
                {(['7d', '14d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`cal-chip ${!specificDate && range === r ? 'on' : ''}`}
                    onClick={() => selectRange(r)}
                  >
                    Last {r.replace('d', '')} days
                  </button>
                ))}
                <input
                  type="date"
                  className="cal-chip"
                  style={{ fontFamily: 'var(--i)', fontSize: 11.5, cursor: 'pointer' }}
                  value={specificDate ?? ''}
                  onChange={(e) => onSpecificDate(e.target.value)}
                />
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--mu)' }}>{filterLabel}</div>
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
            {(data?.rooms ?? []).map((r) => {
              const active = roomId === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoomId(r.id)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: `1.5px solid ${active ? 'var(--blue)' : '#e2e8f0'}`,
                    background: active ? 'var(--bl)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all .15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <RoomTypeIcon name={r.name} size={18} color={active ? 'var(--blue)' : 'var(--mu)'} />
                  <div style={{ textAlign: 'left' }}>
                    <div
                      style={{
                        fontFamily: 'var(--m)',
                        fontSize: 12,
                        fontWeight: 700,
                        color: active ? 'var(--blue)' : 'var(--ch)',
                      }}
                    >
                      {r.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--mu)' }}>{Math.round(r.progressPct)}% done</div>
                  </div>
                </button>
              );
            })}
          </div>

          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (data?.workTypes ?? []).map((wt, i) => (
            <WorkTypeDayCard key={wt.id} wt={wt} index={i} />
          ))}
          {!loading && !(data?.workTypes?.length) && (
            <Card style={{ textAlign: 'center', padding: 32, color: 'var(--mu)' }}>
              No work type data for this room and filter.
            </Card>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}

export default function LivebuildDayProgressPage() {
  return (
    <LivebuildToastProvider>
      <LivebuildDayProgressContent />
    </LivebuildToastProvider>
  );
}
