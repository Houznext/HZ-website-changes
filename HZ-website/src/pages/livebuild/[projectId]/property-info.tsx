import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbProjectSummary, LbPropertyInfo } from '@/livebuild/lib/types';
import {
  customerAreaTiles,
  getPropertyCategory,
  PROPERTY_CATEGORY_FEATURES,
  PROPERTY_CATEGORY_UI,
  shouldShowRoomDimensionsTable,
  propertyTypeBadgeLabel,
} from '@/livebuild/lib/propertyInfoConfig';

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round">
      <path d="M9 11l3 3L22 4" />
    </svg>
  );
}

function SectionHeader({
  bg,
  stroke,
  title,
  children,
}: {
  bg: string;
  stroke: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f4f8' }}>
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: stroke,
        }}
      >
        {children}
      </div>
      <div style={{ fontFamily: 'var(--m)', fontSize: 13.5, fontWeight: 700, color: 'var(--ch)' }}>{title}</div>
    </div>
  );
}

function AreaTile({ label, value, unit }: { label: string; value?: string; unit?: string }) {
  return (
    <div style={{ background: 'var(--off)', borderRadius: 10, padding: '12px 14px' }}>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: 'var(--mu)',
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          fontFamily: 'var(--m)',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: 'var(--m)', fontSize: 18, fontWeight: 800, color: 'var(--ch)' }}>
        {value ?? '—'}
        {unit && value ? (
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--mu)' }}> {unit}</span>
        ) : null}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ background: 'var(--off)', borderRadius: 10, padding: '12px 14px' }}>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 700,
          color: 'var(--mu)',
          textTransform: 'uppercase',
          letterSpacing: '.06em',
          fontFamily: 'var(--m)',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch)' }}>{value ?? '—'}</div>
    </div>
  );
}

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

  const title = info?.projectTitle ?? project?.title ?? 'Property';
  const location = info?.locationLine ?? info?.address ?? '';
  const category = getPropertyCategory(info?.propertyType ?? info?.propertyCategory);
  const ui = PROPERTY_CATEGORY_UI[category];
  const areaTiles = info
    ? customerAreaTiles(category, {
        carpetArea: info.carpetArea,
        builtUpArea: info.builtUpArea,
        superBuiltUpArea: info.superBuiltUpArea,
        balconyArea: info.balconyArea,
        floorTower: info.floorTower,
        unitNumber: info.unitNumber,
        facing: info.facing,
      })
    : [];
  const features = PROPERTY_CATEGORY_FEATURES[category];
  const showRoomTable = shouldShowRoomDimensionsTable(category, info?.rooms?.length ?? 0);

  return (
    <>
      <SeoHead title="Property Info | LiveBuild" description="Property details" canonical={`/livebuild/${projectId}/property-info`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && info && (
            <>
              <Card className="fade-up" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'linear-gradient(135deg,var(--blue),var(--bh))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 20, fontWeight: 800, color: 'var(--ch)', marginBottom: 4 }}>
                      {title}
                    </div>
                    {location && (
                      <div style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {location}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {info.bhk && <Badge variant="blue">{info.bhk}</Badge>}
                      <Badge variant="navy">
                        {info.apartmentLabel ?? propertyTypeBadgeLabel(info.propertyType)}
                      </Badge>
                      {info.propertyType && <Badge variant="navy">{info.propertyType}</Badge>}
                      {info.projectTypeLabel && <Badge variant="prog">{info.projectTypeLabel}</Badge>}
                    </div>
                  </div>
                  {info.projectCode && (
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--mu)',
                          textTransform: 'uppercase',
                          letterSpacing: '.07em',
                          fontFamily: 'var(--m)',
                          marginBottom: 3,
                        }}
                      >
                        Project ref
                      </div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 15, fontWeight: 800, color: 'var(--ch)' }}>
                        {info.projectCode}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {areaTiles.length > 0 && (
                <Card className="fade-up" style={{ marginBottom: 14 }}>
                  <SectionHeader bg="var(--bl)" stroke="var(--blue)" title={ui.areasTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </SectionHeader>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
                    {areaTiles.map((tile) =>
                      tile.kind === 'area' ? (
                        <AreaTile key={tile.label} label={tile.label} value={tile.value} unit={tile.unit} />
                      ) : (
                        <InfoTile key={tile.label} label={tile.label} value={tile.value} />
                      ),
                    )}
                  </div>
                </Card>
              )}

              {(info.rooms?.length ?? 0) > 0 && showRoomTable && (
                <Card className="fade-up" style={{ marginBottom: 14 }}>
                  <SectionHeader bg="#fef3c7" stroke="var(--am)" title={features.roomDimensionsTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </SectionHeader>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['Room', 'Length × Width', 'Area', 'Ceiling ht.', 'Flooring'].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: '9px 12px',
                                textAlign: 'left',
                                fontSize: 10,
                                fontWeight: 700,
                                color: 'var(--mu)',
                                textTransform: 'uppercase',
                                letterSpacing: '.07em',
                                fontFamily: 'var(--m)',
                                borderBottom: '1.5px solid #e2e8f0',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {info.rooms!.map((r, i) => (
                          <tr
                            key={r.id}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--off)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <td style={{ padding: '11px 12px', borderBottom: i < info.rooms!.length - 1 ? '.5px solid #f1f5f9' : undefined, fontSize: 13, fontWeight: 600 }}>
                              <Link href={`/livebuild/${projectId}/rooms/${r.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {r.icon ? `${r.icon} ` : ''}{r.name}
                              </Link>
                            </td>
                            <td style={{ padding: '11px 12px', borderBottom: i < info.rooms!.length - 1 ? '.5px solid #f1f5f9' : undefined, fontSize: 12.5 }}>
                              {r.lengthWidth ?? r.dimensions}
                            </td>
                            <td style={{ padding: '11px 12px', borderBottom: i < info.rooms!.length - 1 ? '.5px solid #f1f5f9' : undefined, fontSize: 12.5, fontWeight: 600, color: 'var(--blue)' }}>
                              {r.areaLabel ?? '—'}
                            </td>
                            <td style={{ padding: '11px 12px', borderBottom: i < info.rooms!.length - 1 ? '.5px solid #f1f5f9' : undefined, fontSize: 12.5 }}>
                              {r.ceilingHeight ?? '—'}
                            </td>
                            <td style={{ padding: '11px 12px', borderBottom: i < info.rooms!.length - 1 ? '.5px solid #f1f5f9' : undefined, fontSize: 12.5, color: 'var(--mu)' }}>
                              {r.flooring ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {((info.scopeIncluded?.length ?? 0) > 0 || (info.specifications?.length ?? 0) > 0 || info.designScope) && (
                <Card className="fade-up" style={{ marginBottom: 14 }}>
                  <SectionHeader bg="#f3e8ff" stroke="var(--pu)" title={ui.scopeTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </SectionHeader>
                  {info.designScope ? (
                    <div style={{ fontSize: 13, color: 'var(--ch)', marginBottom: 14, lineHeight: 1.5 }}>
                      {info.designScope}
                    </div>
                  ) : null}
                  <div className="lb-scope-grid">
                    <div>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--mu)',
                          textTransform: 'uppercase',
                          letterSpacing: '.06em',
                          fontFamily: 'var(--m)',
                          marginBottom: 8,
                        }}
                      >
                        Included in scope
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(info.scopeIncluded ?? []).map((item) => (
                          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}>
                            <CheckIcon />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'var(--mu)',
                          textTransform: 'uppercase',
                          letterSpacing: '.06em',
                          fontFamily: 'var(--m)',
                          marginBottom: 8,
                        }}
                      >
                        Specifications
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5 }}>
                        {(info.specifications ?? []).map((spec) => (
                          <div key={spec.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ color: 'var(--mu)' }}>{spec.label}</span>
                            <span style={{ fontWeight: 600, textAlign: 'right' }}>{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {info.timeline && (
                <Card className="fade-up">
                  <SectionHeader bg="#fef3c7" stroke="var(--am)" title="Project timeline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </SectionHeader>
                  <div className="grid-4 lb-timeline-grid">
                    <div style={{ background: 'var(--off)', borderRadius: 9, padding: '11px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--m)', marginBottom: 4 }}>Start date</div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 13, fontWeight: 700, color: 'var(--ch)' }}>{formatDate(info.timeline.startDate)}</div>
                    </div>
                    <div style={{ background: 'var(--off)', borderRadius: 9, padding: '11px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--m)', marginBottom: 4 }}>Due date</div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 13, fontWeight: 700, color: 'var(--am)' }}>{formatDate(info.timeline.dueDate)}</div>
                    </div>
                    <div style={{ background: 'var(--off)', borderRadius: 9, padding: '11px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--m)', marginBottom: 4 }}>Duration</div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 13, fontWeight: 700, color: 'var(--ch)' }}>
                        {info.timeline.durationDays != null ? `${info.timeline.durationDays} days` : '—'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--bl)', borderRadius: 9, padding: '11px 12px', textAlign: 'center', border: '.5px solid rgba(47,128,237,.2)' }}>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--m)', marginBottom: 4 }}>Days left</div>
                      <div style={{ fontFamily: 'var(--m)', fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>
                        {info.timeline.daysLeft != null ? `${info.timeline.daysLeft} days` : '—'}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
