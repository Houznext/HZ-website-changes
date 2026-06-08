import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import Button from '@/livebuild/components/Button';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbDocument, LbDocumentsResponse, LbProjectSummary } from '@/livebuild/lib/types';

const DOC_CATEGORIES = [
  { key: 'all', label: 'All', color: 'var(--blue)', border: 'var(--blue)' },
  { key: 'warranty', label: 'Warranty slips', color: '#ca8a04', border: '#ca8a04' },
  { key: 'boq', label: 'BOQ', color: 'var(--blue)', border: 'var(--blue)' },
  { key: 'agreement', label: 'Agreements', color: 'var(--pu)', border: 'var(--pu)' },
  { key: 'design', label: 'Design files', color: '#0d9488', border: '#0d9488' },
] as const;

const CAT_COLORS: Record<string, { stroke: string; bg: string; label: string }> = {
  warranty: { stroke: '#ca8a04', bg: '#fef3c7', label: 'Warranty' },
  boq: { stroke: '#2563eb', bg: '#e8f1fd', label: 'BOQ' },
  agreement: { stroke: '#7c3aed', bg: '#f3e8ff', label: 'Agreement' },
  design: { stroke: '#0d9488', bg: '#ccfbf1', label: 'Design' },
  other: { stroke: '#475569', bg: '#f1f5f9', label: 'Other' },
};

function DocIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function DocumentRow({ doc }: { doc: LbDocument }) {
  const cat = (doc.category ?? 'other').toLowerCase();
  const colors = CAT_COLORS[cat] ?? CAT_COLORS.other;
  const wtPart = doc.workType && doc.workType !== 'General' ? doc.workType : null;
  const metaLine = [
    doc.roomName ?? 'General',
    wtPart,
    doc.uploadedAt ? formatDate(doc.uploadedAt) : null,
    doc.fileSizeLabel && doc.fileSizeLabel !== '—' ? doc.fileSizeLabel : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card fade-up"
      style={{
        padding: '14px 16px',
        borderLeft: `3px solid ${colors.stroke}`,
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: 'box-shadow .2s, transform .18s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <DocIcon color={colors.stroke} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ch)' }}>{doc.name}</div>
            <Badge variant="gray" style={{ fontSize: 8.5, background: colors.bg, color: colors.stroke, flexShrink: 0 }}>
              {colors.label}
            </Badge>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{metaLine}</div>
          {doc.expiryDate && (
            <div style={{ fontSize: 11, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--am)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Expires: {formatDate(doc.expiryDate)}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="xs"
          style={{ flexShrink: 0 }}
          onClick={(e) => {
            e.preventDefault();
            window.open(doc.url, '_blank', 'noopener,noreferrer');
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </Button>
      </div>
    </a>
  );
}

export default function LivebuildDocumentsPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [data, setData] = useState<LbDocumentsResponse | null>(null);
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [home, docs] = await Promise.all([
          livebuildApi.projectHome(projectId),
          livebuildApi.documents(projectId),
        ]);
        if (!cancelled) {
          setProject(home.project);
          setData(docs);
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
  }, [projectId]);

  const counts = data?.categoryCounts ?? { all: 0, warranty: 0, boq: 0, agreement: 0, design: 0, other: 0 };

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    if (catFilter === 'all') return items;
    return items.filter((d) => (d.category ?? '').toLowerCase() === catFilter);
  }, [data, catFilter]);

  return (
    <>
      <SeoHead title="Documents | LiveBuild" description="Project documents" canonical={`/livebuild/${projectId}/documents`} />
      <LivebuildProjectLayout project={project}>
        <div className="content" style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 80 }}>
          <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: '#ccfbf1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <DocIcon color="#0d9488" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--m)', fontSize: 20, fontWeight: 800, color: 'var(--ch)' }}>Documents</div>
              <div style={{ fontSize: 13, color: 'var(--mu)' }}>Warranty slips, BOQ, agreements & design files</div>
            </div>
          </div>

          <div className="grid-4 fade-up" style={{ margin: '16px 0' }}>
            {DOC_CATEGORIES.slice(1).map(({ key, label, color, border }) => (
              <div key={key} className="card-sm" style={{ textAlign: 'center', borderTop: `3px solid ${border}` }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 22, fontWeight: 800, color }}>{counts[key as keyof typeof counts] ?? 0}</div>
                <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div
            className="fade-up"
            style={{
              display: 'flex',
              gap: 4,
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 9,
              marginBottom: 16,
              overflowX: 'auto',
            }}
          >
            {DOC_CATEGORIES.map(({ key, label }) => {
              const count = counts[key as keyof typeof counts] ?? 0;
              const active = catFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCatFilter(key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 7,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    background: active ? '#fff' : 'transparent',
                    color: active ? 'var(--blue)' : 'var(--mu)',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                    fontFamily: 'var(--m)',
                    whiteSpace: 'nowrap',
                    transition: 'all .15s',
                  }}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {filtered.map((d) => (
                <DocumentRow key={d.id} doc={d} />
              ))}
              {!filtered.length && (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--mu)', fontSize: 13 }}>No documents in this category.</div>
              )}
            </div>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
