import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { FileText, Download } from 'lucide-react';
import SeoHead from '@/components/SeoHead';
import Card from '@/livebuild/components/Card';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { lbIconProps } from '@/livebuild/components/icons';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDate } from '@/livebuild/lib/format';
import type { LbDocument, LbProjectSummary } from '@/livebuild/lib/types';

const CAT_LABELS: Record<string, string> = {
  warranty: 'Warranty',
  design: 'Design',
  invoice: 'Invoice',
  agreement: 'Agreement',
  other: 'Other',
};

export default function LivebuildDocumentsPage() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [docs, setDocs] = useState<LbDocument[]>([]);
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [home, list] = await Promise.all([
          livebuildApi.projectHome(projectId),
          livebuildApi.documents(projectId),
        ]);
        if (!cancelled) {
          setProject(home.project);
          setDocs(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) setDocs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    docs.forEach((d) => d.category && s.add(d.category));
    return ['all', ...Array.from(s)];
  }, [docs]);

  const filtered = useMemo(() => {
    if (catFilter === 'all') return docs;
    return docs.filter((d) => (d.category ?? '').toLowerCase() === catFilter);
  }, [docs, catFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    docs.forEach((d) => {
      const c = (d.category ?? 'other').toLowerCase();
      map[c] = (map[c] ?? 0) + 1;
    });
    return map;
  }, [docs]);

  return (
    <>
      <SeoHead title="Documents | LiveBuild" description="Project documents" canonical={`/livebuild/${projectId}/documents`} />
      <LivebuildProjectLayout project={project} showMainTabs={false}>
        <div className="content" style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 80 }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Project documents</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`cal-chip ${catFilter === c ? 'on' : ''}`}
                onClick={() => setCatFilter(c)}
              >
                {c === 'all' ? `All (${docs.length})` : `${CAT_LABELS[c] ?? c} (${counts[c] ?? 0})`}
              </button>
            ))}
          </div>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading &&
            filtered.map((d) => (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-sm fade-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 10,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={18} {...lbIconProps({ color: 'var(--am)' })} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>
                    {CAT_LABELS[(d.category ?? '').toLowerCase()] ?? d.category ?? 'Document'}
                    {d.uploadedAt ? ` · ${formatDate(d.uploadedAt)}` : ''}
                  </div>
                </div>
                <Download size={16} {...lbIconProps({ color: 'var(--mu)' })} />
              </a>
            ))}
          {!loading && !filtered.length && (
            <Card style={{ color: 'var(--mu)' }}>No documents in this category yet.</Card>
          )}
        </div>
      </LivebuildProjectLayout>
    </>
  );
}
