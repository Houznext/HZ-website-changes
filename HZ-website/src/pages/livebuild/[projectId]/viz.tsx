import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import type { LbProjectSummary, LbViz } from '@/livebuild/lib/types';

export default function LivebuildVizPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [viz, setViz] = useState<LbViz | null>(null);
  const [loading, setLoading] = useState(true);

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

  const renderPct = Math.round(viz?.renderPct ?? project?.overallProgress ?? 0);

  return (
    <>
      <SeoHead title="3D Visualisation | LiveBuild" description="3D floor plan" canonical={`/livebuild/${projectId}/viz`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (
            <Card className="fade-up" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="viz-card" style={{ minHeight: 360, borderRadius: 14 }}>
                {viz?.panoramaUrl ? (
                  <iframe
                    title="3D view"
                    src={viz.panoramaUrl}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                  />
                ) : viz?.floorPlanUrl ? (
                  <img
                    src={viz.floorPlanUrl}
                    alt="Floor plan"
                    style={{ width: '100%', minHeight: 360, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,.7)',
                      fontSize: 14,
                    }}
                  >
                    3D view will appear here when your team publishes it.
                  </div>
                )}
                <div style={{ position: 'absolute', top: 14, right: 14 }}>
                  <Badge variant="pu" style={{ background: 'rgba(124,58,237,.8)', color: '#fff', fontSize: 9 }}>
                    {renderPct}% RENDERED
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
