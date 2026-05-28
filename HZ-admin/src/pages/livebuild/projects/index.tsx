import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { LayoutGrid, List, Plus, Search, Trash2 } from 'lucide-react';
import withLivebuildLayout from '@/src/common/LivebuildAdminLayout';
import livebuildApi from '@/src/livebuild/lib/api';
import type { LbProjectSummary } from '@/src/livebuild/lib/types';
import {
  Badge,
  Btn,
  FormInput,
  LiveBuildPageHeader,
  Modal,
  NewProjectModal,
  ProgressRing,
  ProjectCard,
  Table,
  lbToast,
} from '@/src/livebuild/components';
import { useLbStickyTop } from '@/src/livebuild/hooks/useLbStickyTop';
import Loader from '@/src/common/Loader';

function LiveBuildProjectsPage() {
  useLbStickyTop();
  const router = useRouter();
  const [projects, setProjects] = useState<LbProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'card' | 'list'>('card');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LbProjectSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await livebuildApi.listProjects(search ? { q: search } : undefined);
      setProjects(Array.isArray(list) ? list : []);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load projects', 'err');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.customerName?.toLowerCase().includes(q),
    );
  }, [projects, search]);

  const goDetail = (id: string, tab?: string) => {
    const url = tab
      ? `/livebuild/projects/${id}?tab=${tab}`
      : `/livebuild/projects/${id}`;
    router.push(url);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await livebuildApi.deleteProject(deleteTarget.id);
      lbToast(`"${deleteTarget.name}" deleted`, 'ok');
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to delete project', 'err');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="lb-page">
      <LiveBuildPageHeader
        title="All Projects"
        actions={
          <>
            <div className="lb-search-wrap">
              <Search size={13} strokeWidth={1.8} color="#94a3b8" />
              <FormInput
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="lb-view-toggle">
              <button
                type="button"
                className={`lb-view-btn ${view === 'card' ? 'on' : ''}`}
                onClick={() => setView('card')}
                aria-label="Card view"
              >
                <LayoutGrid size={13} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                className={`lb-view-btn ${view === 'list' ? 'on' : ''}`}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <List size={13} strokeWidth={1.8} />
              </button>
            </div>
            <Btn variant="blue" size="sm" onClick={() => setModalOpen(true)}>
              <Plus size={12} strokeWidth={2.5} />
              New project
            </Btn>
          </>
        }
      />

      <div className="lb-content">
        {loading ? (
          <div className="lb-loading">
            <Loader />
          </div>
        ) : filtered.length === 0 ? (
          <div className="lb-empty">No projects found</div>
        ) : view === 'card' ? (
          <div
            className="lb-fa"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {filtered.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onClick={() => goDetail(p.id)}
                onDpr={() => goDetail(p.id, 'dpr')}
                onDelete={() => setDeleteTarget(p)}
              />
            ))}
          </div>
        ) : (
          <div className="lb-card" style={{ padding: 0, overflow: 'hidden' }}>
            <Table
              headers={[
                'Project',
                'Customer',
                'Type',
                'Progress',
                'Phase',
                'Status',
                'Actions',
              ]}
            >
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => goDetail(p.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--lb-mu)' }}>{p.code}</div>
                  </td>
                  <td>{p.customerName}</td>
                  <td>{p.projectType || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="lb-prog-track" style={{ width: 80 }}>
                        <div
                          className="lb-prog-fill"
                          style={{ width: `${p.progressPct}%`, background: 'var(--lb-blue)' }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--lb-m)', fontSize: 11, fontWeight: 700 }}>
                        {p.progressPct}%
                      </span>
                    </div>
                  </td>
                  <td>{p.phase || '—'}</td>
                  <td>
                    <Badge variant="prog">{p.status}</Badge>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <Btn variant="ghost" size="xs" onClick={() => goDetail(p.id, 'dpr')}>
                        DPR
                      </Btn>
                      <Btn variant="ghost" size="xs" onClick={() => goDetail(p.id)}>
                        Edit
                      </Btn>
                      <Btn
                        variant="icon"
                        size="xs"
                        aria-label="Delete project"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2 size={12} color="var(--lb-rd)" />
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </div>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(id) => router.push(`/livebuild/projects/${id}`)}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete project?"
        subtitle="All rooms, payments, queries, documents, and materials for this project will be permanently removed."
        maxWidth={520}
        footer={
          <>
            <Btn variant="red" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, delete project'}
            </Btn>
            <Btn variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              No, keep project
            </Btn>
          </>
        }
      >
        {deleteTarget ? (
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--lb-ch)' }}>
            <p style={{ margin: '0 0 12px' }}>
              Delete <strong>{deleteTarget.name}</strong> ({deleteTarget.code})?
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--lb-mu)' }}>
              <li>Customer: {deleteTarget.customerName}</li>
              <li>Progress: {deleteTarget.progressPct}%</li>
              <li>Phase: {deleteTarget.phase || '—'}</li>
              <li>Status: {deleteTarget.status}</li>
              {deleteTarget.location ? <li>Location: {deleteTarget.location}</li> : null}
            </ul>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--lb-rd)' }}>
              Houznext will email project contacts about this deletion (if SMTP is configured).
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default withLivebuildLayout(LiveBuildProjectsPage);
