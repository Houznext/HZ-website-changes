import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import livebuildApi from '../lib/api';
import { LB_DOC_CATEGORIES } from '../lib/constants';
import type { LbDocument, LbRoom } from '../lib/types';
import { UploadDocModal } from '../components/UploadDocModal';
import { Badge, Btn, StatCard, TabBar, lbToast } from '../components';
import Loader from '@/src/common/Loader';

const CAT_COLORS: Record<string, string> = {
  warranty: '#0d9488',
  boq: '#2563eb',
  agreement: '#7c3aed',
  design: '#d97706',
  other: '#64748b',
};

type Props = { projectId: string; projectName: string; rooms: LbRoom[] };

export function ProjectDocumentsTab({ projectId, projectName, rooms }: Props) {
  const [docs, setDocs] = useState<LbDocument[]>([]);
  const [cat, setCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await livebuildApi.listDocuments(
        projectId,
        cat === 'all' ? undefined : cat,
      );
      setDocs(list);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load documents', 'err');
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, cat]);

  useEffect(() => {
    load();
  }, [load]);

  const byCat = (id: string) => docs.filter((d) => d.category === id).length;

  if (loading) {
    return (
      <div className="lb-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
          Documents — {projectName}
        </div>
        <Btn variant="blue" size="sm" onClick={() => setModalOpen(true)}>
          <Upload size={12} strokeWidth={1.8} />
          Upload document
        </Btn>
      </div>
      <div className="lb-g4" style={{ marginBottom: 14 }}>
        {LB_DOC_CATEGORIES.map((c) => (
          <StatCard
            key={c.id}
            label={c.label}
            value={byCat(c.id)}
            valueColor={CAT_COLORS[c.id] ?? 'var(--lb-blue)'}
            icon={
              <FileText size={16} strokeWidth={1.8} color={CAT_COLORS[c.id] ?? 'var(--lb-blue)'} />
            }
          />
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <TabBar
          tabs={[
            { id: 'all', label: 'All' },
            ...LB_DOC_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
          ]}
          active={cat}
          onChange={setCat}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docs.map((d) => {
          const accent = CAT_COLORS[d.category] ?? 'var(--lb-blue)';
          const expiring =
            d.expiryDate &&
            new Date(d.expiryDate) < new Date(Date.now() + 30 * 86400000);
          return (
            <div
              key={d.id}
              className="lb-card"
              style={{
                padding: '14px 18px',
                borderLeft: `4px solid ${accent}`,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <FileText size={18} strokeWidth={1.8} color={accent} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>
                    {d.category} · {d.room || 'All rooms'} · {d.uploadedAt?.slice(0, 10)}
                    {d.expiryDate ? ` · Expires ${d.expiryDate.slice(0, 10)}` : ''}
                  </div>
                </div>
                {expiring ? <Badge variant="amber">Expiring</Badge> : null}
                <Badge variant="gray">{d.category}</Badge>
                {d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="lb-btn lb-btn-ghost lb-btn-sm"
                    title="Download"
                  >
                    <Download size={12} />
                  </a>
                ) : null}
                <Btn
                  variant="icon"
                  size="xs"
                  aria-label="Delete"
                  onClick={async () => {
                    if (!confirm('Delete document?')) return;
                    await livebuildApi.deleteDocument(d.id);
                    lbToast('Deleted', 'ok');
                    load();
                  }}
                >
                  <Trash2 size={12} color="var(--lb-rd)" />
                </Btn>
              </div>
            </div>
          );
        })}
        {docs.length === 0 ? <div className="lb-empty">No documents</div> : null}
      </div>
      <UploadDocModal
        open={modalOpen}
        projectId={projectId}
        rooms={rooms}
        onClose={() => setModalOpen(false)}
        onUploaded={load}
      />
    </div>
  );
}
