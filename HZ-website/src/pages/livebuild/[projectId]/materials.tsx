import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Button from '@/livebuild/components/Button';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { LivebuildToastProvider, useLbToast } from '@/livebuild/components/ToastProvider';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbMaterialItem, LbMaterialsResponse, LbProjectSummary } from '@/livebuild/lib/types';

function MaterialIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--am)" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function statusStyle(status: string) {
  if (status === 'installed') return { bg: '#e8f1fd', cl: '#1d4ed8', tx: '✓ Installed' };
  if (status === 'procured') return { bg: '#fef3c7', cl: '#92400e', tx: 'Procured' };
  return { bg: '#f1f5f9', cl: '#64748b', tx: 'Not started' };
}

function MaterialRow({ m }: { m: LbMaterialItem }) {
  const st = statusStyle(m.status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '.5px solid #f1f5f9' }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: 'var(--off)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MaterialIcon />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ch)' }}>{m.name}</div>
        {m.spec && <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 2 }}>{m.spec}</div>}
        <div style={{ fontSize: 10.5, color: 'var(--mu)', marginTop: 2 }}>
          Category: {m.category || '—'} · Brand: {m.brand || '—'}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ch)', marginBottom: 4 }}>
          {m.qty} {m.unit}
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 20,
            fontFamily: 'var(--m)',
            background: st.bg,
            color: st.cl,
          }}
        >
          {st.tx}
        </span>
        {m.installedAt && (
          <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 3 }}>{formatDate(m.installedAt)}</div>
        )}
      </div>
    </div>
  );
}

function LivebuildMaterialsContent() {
  const router = useRouter();
  const { toast } = useLbToast();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [data, setData] = useState<LbMaterialsResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
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
        const res = await livebuildApi.materials(projectId, {
          status: statusFilter,
          room: roomFilter,
        });
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, statusFilter, roomFilter]);

  const stats = data?.stats ?? { total: 0, installed: 0, procured: 0, pending: 0 };
  const items = data?.items ?? [];

  const byRoom = useMemo(() => {
    const map = new Map<string, LbMaterialItem[]>();
    items.forEach((m) => {
      const r = m.room ?? 'General';
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(m);
    });
    return map;
  }, [items]);

  const downloadBoq = () => {
    if (data?.boqPdfUrl) {
      window.open(data.boqPdfUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    toast('Downloading BOQ PDF…');
  };

  const statusFilters = [
    { key: 'all', label: `All (${stats.total})` },
    { key: 'installed', label: `✓ Installed (${stats.installed})` },
    { key: 'procured', label: `Procured (${stats.procured})` },
    { key: 'pending', label: `Pending (${stats.pending})` },
  ];

  return (
    <>
      <SeoHead title="Materials | LiveBuild" description="BOQ and materials" canonical={`/livebuild/${projectId}/materials`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 80 }}>
          <div className="grid-3 fade-up" style={{ marginBottom: 16 }}>
            <Card small style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--m)', marginBottom: 4 }}>
                Total items
              </div>
              <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: 'var(--ch)' }}>{stats.total}</div>
            </Card>
            <Card small style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--m)', marginBottom: 4 }}>
                Installed
              </div>
              <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{stats.installed}</div>
            </Card>
            <Card small style={{ textAlign: 'center', background: '#fff8f5', borderColor: '#fed7aa' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--am)', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--m)', marginBottom: 4 }}>
                Pending
              </div>
              <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color: 'var(--am)' }}>{stats.pending}</div>
            </Card>
          </div>

          <Card className="fade-up" style={{ padding: '10px 16px', marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="stf">
              {statusFilters.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`stf-btn ${statusFilter === key ? 'on' : ''}`}
                  onClick={() => setStatusFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="fi"
              style={{ width: 'auto', fontSize: 12.5, marginLeft: 'auto', padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--brd)' }}
            >
              <option value="all">All rooms</option>
              {(data?.roomOptions ?? []).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={downloadBoq}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download BOQ
            </Button>
          </Card>

          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (
            <Card className="fade-up" style={{ padding: '18px 20px' }}>
              {Array.from(byRoom.entries()).map(([room, list]) => {
                const installed = list.filter((m) => m.status === 'installed').length;
                return (
                  <div key={room} style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                        paddingBottom: 8,
                        borderBottom: '1.5px solid #f0f4f8',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700, color: 'var(--ch)' }}>{room}</div>
                      <span className="bdg b-blue" style={{ fontSize: 9 }}>
                        {installed}/{list.length} installed
                      </span>
                    </div>
                    {list.map((m) => (
                      <MaterialRow key={m.id} m={m} />
                    ))}
                  </div>
                );
              })}
              {!items.length && (
                <p style={{ color: 'var(--mu)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No materials match this filter.</p>
              )}
            </Card>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}

export default function LivebuildMaterialsPage() {
  return (
    <LivebuildToastProvider>
      <LivebuildMaterialsContent />
    </LivebuildToastProvider>
  );
}
