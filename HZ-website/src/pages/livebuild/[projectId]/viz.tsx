import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Button from '@/livebuild/components/Button';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { LivebuildToastProvider, useLbToast } from '@/livebuild/components/ToastProvider';
import { livebuildApi } from '@/livebuild/lib/api';
import { roomRingColor } from '@/livebuild/lib/format';
import type { Lb3dCamera, Lb3dHotspot, Lb3dModel, LbProjectSummary, LbRoomSummary, LbViz } from '@/livebuild/lib/types';

const VizWalkthrough = dynamic(
  () => import('@/livebuild/components/VizWalkthrough').then((m) => m.VizWalkthrough),
  { ssr: false, loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.7)' }}>Loading 3D…</div> },
);

function IsometricFloorSvg({ rooms }: { rooms: LbRoomSummary[] }) {
  const labels = rooms.slice(0, 4);
  const positions = [
    { x: 115, y: 130 },
    { x: 245, y: 130 },
    { x: 115, y: 210 },
    { x: 245, y: 210 },
  ];

  return (
    <svg width="360" height="280" viewBox="0 0 360 280" style={{ opacity: 0.22 }}>
      <polygon points="180,40 310,110 310,220 180,290 50,220 50,110" fill="#2f80ed" fillOpacity=".15" stroke="#fff" strokeWidth="1.5" />
      <polygon points="50,110 180,40 180,160 50,220" fill="#fff" fillOpacity=".05" stroke="#fff" strokeWidth="1" />
      <polygon points="310,110 180,40 180,160 310,220" fill="#fff" fillOpacity=".08" stroke="#fff" strokeWidth="1" />
      <line x1="180" y1="160" x2="180" y2="290" stroke="#fff" strokeWidth="1" strokeOpacity=".4" />
      <line x1="50" y1="165" x2="310" y2="165" stroke="#fff" strokeWidth="1" strokeOpacity=".3" />
      {labels.map((r, i) => (
        <text
          key={r.id}
          x={positions[i]?.x ?? 180}
          y={positions[i]?.y ?? 160}
          fontSize="11"
          fill="rgba(255,255,255,.6)"
          fontFamily="Montserrat, sans-serif"
          fontWeight="600"
          textAnchor="middle"
        >
          {r.name.length > 16 ? `${r.name.slice(0, 14)}…` : r.name}
        </text>
      ))}
    </svg>
  );
}

function RoomGridTile({ room, active, onClick }: { room: LbRoomSummary; active?: boolean; onClick: () => void }) {
  const ringColor = roomRingColor(room.color);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 10,
        background: active ? 'var(--bl)' : 'var(--off)',
        border: active ? '1.5px solid var(--blue)' : '.5px solid #e2e8f0',
        padding: '10px 8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all .18s',
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 5 }}>{room.icon ?? '🏠'}</div>
      <div style={{ fontFamily: 'var(--m)', fontSize: 10.5, fontWeight: 700, color: 'var(--ch)', marginBottom: 5, lineHeight: 1.3 }}>
        {room.name}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: ringColor }}>{Math.round(room.progressPct)}%</div>
    </button>
  );
}

function RoomListRow({ room, active, onClick }: { room: LbRoomSummary; active?: boolean; onClick: () => void }) {
  const ringColor = roomRingColor(room.color);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
        border: 'none',
        background: active ? 'var(--off)' : 'transparent',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <div style={{ fontSize: 16, width: 24, textAlign: 'center', flexShrink: 0 }}>{room.icon ?? '🏠'}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ch)' }}>{room.name}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--m)', fontSize: 12, fontWeight: 700, color: ringColor }}>
          {Math.round(room.progressPct)}%
        </div>
      </div>
    </button>
  );
}

function hotspotForRoom(hotspots: Lb3dHotspot[], room: LbRoomSummary): Lb3dHotspot | undefined {
  return (
    hotspots.find((h) => h.roomId === room.id) ??
    hotspots.find((h) => h.roomName?.toLowerCase() === room.name.toLowerCase()) ??
    hotspots.find((h) => h.label.toLowerCase() === room.name.toLowerCase())
  );
}

function cameraForHotspot(h: Lb3dHotspot): Lb3dCamera {
  if (h.camera) return h.camera;
  const [x, y, z] = h.position;
  return {
    position: [x, y + 2.2, z + 3.5],
    target: [x, y, z],
  };
}

function LivebuildVizContent() {
  const router = useRouter();
  const { toast } = useLbToast();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [viz, setViz] = useState<LbViz | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<Lb3dCamera | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [home, v] = await Promise.all([
          livebuildApi.projectHome(projectId),
          livebuildApi.viz(projectId),
        ]);
        if (!cancelled) {
          setProject(home.project);
          setViz(v);
          const primary = v.primaryModel ?? v.models?.find((m) => m.isPrimary) ?? v.models?.[0] ?? null;
          setActiveModelId(primary?.id ?? null);
        }
      } catch {
        if (!cancelled) setViz(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const models = viz?.models ?? [];
  const activeModel: Lb3dModel | null =
    models.find((m) => m.id === activeModelId) ?? viz?.primaryModel ?? null;
  const modelUrl = activeModel?.fileUrl ?? viz?.modelUrl ?? null;
  const hotspots = activeModel?.hotspots ?? viz?.hotspots ?? [];

  const floorModels = useMemo(() => {
    const floors = models.filter((m) => m.modelType === 'floor' && m.floorNumber != null);
    if (floors.length) return floors.sort((a, b) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0));
    return models.length > 1 ? models : [];
  }, [models]);

  const rooms = viz?.rooms ?? [];
  const gridRooms = useMemo(() => rooms.slice(0, 4), [rooms]);
  const floorPlanTitle = viz?.floorPlanTitle ?? (project?.bhk ? `${project.bhk} Floor Plan` : 'Floor Plan');
  const designSpecs = viz?.designSpecs ?? [];

  const navigateHotspot = (h: Lb3dHotspot) => {
    setActiveHotspotId(h.id);
    setActiveRoomId(h.roomId ?? null);
    setFlyTarget(cameraForHotspot(h));
    toast(`Viewing ${h.label}`);
  };

  const viewRoom = (room: LbRoomSummary) => {
    const h = hotspotForRoom(hotspots, room);
    if (h) {
      navigateHotspot(h);
      return;
    }
    toast(`${room.name} — hotspot not configured yet`);
  };

  const downloadPdf = () => {
    const url = viz?.floorPlanPdfUrl ?? viz?.floorPlanUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    toast('Floor plan PDF not available');
  };

  const hasGlb = !!modelUrl;

  return (
    <>
      <SeoHead title="3D Visualisation | LiveBuild" description="3D floor plan" canonical={`/livebuild/${projectId}/viz`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}
              className="grid-2 lb-viz-grid"
            >
              <div>
                <div className="viz-card fade-up" style={{ height: 420, borderRadius: 16, marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
                  {hasGlb ? (
                    <VizWalkthrough
                      modelUrl={modelUrl!}
                      hotspots={hotspots}
                      activeHotspotId={activeHotspotId}
                      flyTarget={flyTarget}
                      onHotspotClick={navigateHotspot}
                      height="100%"
                    />
                  ) : viz?.panoramaUrl ? (
                    <iframe
                      title="3D panorama"
                      src={viz.panoramaUrl}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {viz?.floorPlanUrl ? (
                        <img
                          src={viz.floorPlanUrl}
                          alt="Floor plan"
                          style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', opacity: 0.85 }}
                        />
                      ) : (
                        <IsometricFloorSvg rooms={rooms} />
                      )}
                    </div>
                  )}

                  {floorModels.length > 1 ? (
                    <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8, zIndex: 2 }}>
                      {floorModels.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{
                            background: activeModelId === m.id ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.15)',
                            color: activeModelId === m.id ? 'var(--ch)' : '#fff',
                            fontSize: 11,
                          }}
                          onClick={() => {
                            setActiveModelId(m.id);
                            setActiveHotspotId(null);
                            setFlyTarget(null);
                            toast(m.label);
                          }}
                        >
                          {m.floorNumber != null ? `Floor ${m.floorNumber}` : m.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
                    <span className="bdg" style={{ background: 'rgba(47,128,237,.85)', color: '#fff', fontSize: 9 }}>
                      {hasGlb ? 'INTERACTIVE 3D' : '3D PREVIEW'}
                    </span>
                  </div>

                  {!hasGlb ? (
                    <div className="viz-overlay">
                      <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                        <div style={{ marginBottom: 10 }}>3D model coming soon</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,.6)' }}>
                          Your designer will upload the walkthrough
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <Card className="fade-up fa2" style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 13, fontWeight: 700, color: 'var(--ch)', marginBottom: 12 }}>
                    Room views — click to navigate
                  </div>
                  <div className="grid-viz-rooms">
                    {gridRooms.length > 0 ? (
                      gridRooms.map((r) => (
                        <RoomGridTile
                          key={r.id}
                          room={r}
                          active={activeRoomId === r.id}
                          onClick={() => viewRoom(r)}
                        />
                      ))
                    ) : (
                      <p style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--mu)' }}>Room views will appear when rooms are configured.</p>
                    )}
                  </div>
                </Card>
              </div>

              <div style={{ position: 'sticky', top: 194, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Card className="fade-up fa1">
                  <div style={{ fontFamily: 'var(--m)', fontSize: 13, fontWeight: 700, color: 'var(--ch)', marginBottom: 12 }}>
                    {floorPlanTitle}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {rooms.length > 0 ? (
                      rooms.map((r) => (
                        <RoomListRow
                          key={r.id}
                          room={r}
                          active={activeRoomId === r.id}
                          onClick={() => viewRoom(r)}
                        />
                      ))
                    ) : (
                      <p style={{ fontSize: 12, color: 'var(--mu)' }}>No rooms listed yet.</p>
                    )}
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '.5px solid #f1f5f9' }}>
                    <Button variant="blue" size="sm" style={{ width: '100%', justifyContent: 'center' }} onClick={downloadPdf}>
                      Download PDF
                    </Button>
                  </div>
                </Card>
                <Card small>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 12, fontWeight: 700, color: 'var(--ch)', marginBottom: 8 }}>
                    Design specifications
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    {designSpecs.map((spec) => (
                      <div key={spec.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ color: 'var(--mu)', flexShrink: 0 }}>{spec.label}</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}

export default function LivebuildVizPage() {
  return (
    <LivebuildToastProvider>
      <LivebuildVizContent />
    </LivebuildToastProvider>
  );
}
