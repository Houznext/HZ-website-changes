import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import type { LbProjectSummary, LbPropertyInfo } from '@/livebuild/lib/types';

export default function LivebuildPropertyInfoPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [info, setInfo] = useState<LbPropertyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [home, prop] = await Promise.all([
          livebuildApi.projectHome(projectId),
          livebuildApi.propertyInfo(projectId),
        ]);
        if (!cancelled) {
          setProject(home.project);
          setInfo(prop);
        }
      } catch {
        if (!cancelled) setInfo(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const rows = info?.fields?.length
    ? info.fields
    : [
        { label: 'Property type', value: info?.propertyType ?? '—' },
        { label: 'BHK', value: info?.bhk ?? '—' },
        { label: 'Carpet area', value: info?.carpetArea ?? '—' },
        { label: 'Built-up area', value: info?.builtUpArea ?? '—' },
        { label: 'Address', value: info?.address ?? '—' },
        { label: 'Package', value: info?.packageName ?? '—' },
      ];

  return (
    <>
      <SeoHead title="Property Info | LiveBuild" description="Property details" canonical={`/livebuild/${projectId}/property-info`} />
      <LivebuildProjectLayout project={project} showMainTabs={false}>
        <div className="content" style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (
            <>
              <Card className="fade-up" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  {info?.projectTitle ?? project?.title ?? 'Property'}
                </div>
                {info?.address && (
                  <div style={{ fontSize: 12.5, color: 'var(--mu)', marginBottom: 10 }}>{info.address}</div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {info?.bhk && <Badge variant="blue">{info.bhk}</Badge>}
                  {info?.projectCode && <Badge variant="gray">Ref {info.projectCode}</Badge>}
                </div>
              </Card>

              <Card className="fade-up" style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Flat dimensions</div>
                {rows.map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '11px 0',
                      borderBottom: '.5px solid #f1f5f9',
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: 'var(--mu)', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 600, textAlign: 'right' }}>{value || '—'}</span>
                  </div>
                ))}
              </Card>

              {(info?.rooms?.length ?? 0) > 0 && (
                <Card className="fade-up" style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Room dimensions</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: 'var(--mu)', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '8px 6px' }}>Room</th>
                          <th style={{ padding: '8px 6px' }}>Dimensions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {info!.rooms!.map((r) => (
                          <tr key={r.id} style={{ borderBottom: '.5px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 6px', fontWeight: 600 }}>{r.name}</td>
                            <td style={{ padding: '10px 6px' }}>{r.dimensions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {info?.designScope && (
                <Card className="fade-up">
                  <div style={{ fontFamily: 'var(--m)', fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Design scope</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ch)', whiteSpace: 'pre-wrap' }}>{info.designScope}</p>
                </Card>
              )}
            </>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
