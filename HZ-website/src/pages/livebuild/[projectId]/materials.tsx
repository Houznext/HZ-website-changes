import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbMaterialItem, LbProjectSummary } from '@/livebuild/lib/types';

export default function LivebuildMaterialsPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [items, setItems] = useState<LbMaterialItem[]>([]);
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
        const list = await livebuildApi.materials(projectId, {
          status: statusFilter === 'all' ? undefined : statusFilter,
          room: roomFilter === 'all' ? undefined : roomFilter,
        });
        if (!cancelled) setItems(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, statusFilter, roomFilter]);

  const rooms = useMemo(() => {
    const s = new Set<string>();
    items.forEach((m) => m.room && s.add(m.room));
    return ['all', ...Array.from(s)];
  }, [items]);

  const byRoom = useMemo(() => {
    const map = new Map<string, LbMaterialItem[]>();
    items.forEach((m) => {
      const r = m.room ?? 'General';
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(m);
    });
    return map;
  }, [items]);

  const statusStyle = (status: string) => {
    if (status === 'installed') return { bg: '#e8f1fd', cl: '#1d4ed8', tx: '✓ Installed' };
    if (status === 'procured') return { bg: '#fef3c7', cl: '#92400e', tx: 'Procured' };
    return { bg: '#f1f5f9', cl: '#64748b', tx: 'Not started' };
  };

  return (
    <>
      <SeoHead title="Materials | LiveBuild" description="BOQ and materials" canonical={`/livebuild/${projectId}/materials`} />
      <LivebuildProjectLayout project={project} showMainTabs={false}>
        <div className="content" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <div className="stf">
              {['all', 'installed', 'procured', 'pending'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`stf-btn ${statusFilter === s ? 'on' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--brd)', fontSize: 12 }}
            >
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r === 'all' ? 'All rooms' : r}
                </option>
              ))}
            </select>
          </div>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading &&
            Array.from(byRoom.entries()).map(([room, list]) => {
              const installed = list.filter((m) => m.status === 'installed').length;
              return (
                <div key={room} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1.5px solid #f0f4f8' }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700 }}>{room}</div>
                    <span className="bdg b-blue" style={{ fontSize: 9 }}>
                      {installed}/{list.length} installed
                    </span>
                  </div>
                  <Card small>
                    {list.map((m) => {
                      const st = statusStyle(m.status);
                      return (
                        <div key={m.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '.5px solid #f1f5f9' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{m.spec}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--mu)' }}>
                              {m.category} · {m.brand}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
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
                    })}
                  </Card>
                </div>
              );
            })}
          {!loading && !items.length && <Card style={{ color: 'var(--mu)' }}>No materials match this filter.</Card>}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
