import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '@/components/SeoHead';
import Badge from '@/livebuild/components/Badge';
import Button from '@/livebuild/components/Button';
import Card from '@/livebuild/components/Card';
import Modal from '@/livebuild/components/Modal';
import LivebuildProjectLayout from '@/livebuild/components/LivebuildProjectLayout';
import { LivebuildToastProvider, useLbToast } from '@/livebuild/components/ToastProvider';
import { livebuildApi } from '@/livebuild/lib/api';
import { formatDateTime, statusBadgeClass, statusLabel } from '@/livebuild/lib/format';
import type { LbProjectSummary, LbQuery } from '@/livebuild/lib/types';

type QFilter = 'all' | 'open' | 'resolved';

function matchQueryFilter(q: LbQuery, f: QFilter): boolean {
  const s = q.status.toLowerCase();
  if (f === 'all') return true;
  if (f === 'open') return s === 'open' || s.includes('pending');
  return s.includes('resolved') || s.includes('close');
}

function LivebuildQueriesContent() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const { toast } = useLbToast();
  const [project, setProject] = useState<LbProjectSummary | null>(null);
  const [queries, setQueries] = useState<LbQuery[]>([]);
  const [filter, setFilter] = useState<QFilter>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [home, list] = await Promise.all([
        livebuildApi.projectHome(projectId),
        livebuildApi.queries(projectId),
      ]);
      setProject(home.project);
      setQueries(Array.isArray(list) ? list : []);
    } catch {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    void load();
  }, [projectId]);

  const filtered = useMemo(
    () => queries.filter((q) => matchQueryFilter(q, filter)),
    [queries, filter],
  );

  const openCount = queries.filter((q) => matchQueryFilter(q, 'open')).length;

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast('Enter subject and message');
      return;
    }
    setSubmitting(true);
    try {
      await livebuildApi.raiseQuery(projectId, { subject: subject.trim(), message: message.trim() });
      toast('Query submitted');
      setModalOpen(false);
      setSubject('');
      setMessage('');
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not submit query');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead title="Queries | LiveBuild" description="Project queries" canonical={`/livebuild/${projectId}/queries`} />
      <LivebuildProjectLayout project={project} queriesBadge={openCount}>
        <div className="content" style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 800, margin: 0 }}>Your queries</h2>
            <Button size="sm" onClick={() => setModalOpen(true)}>
              Raise query
            </Button>
          </div>
          <div className="stf" style={{ marginBottom: 16 }}>
            {(
              [
                ['all', 'All'],
                ['open', 'Open'],
                ['resolved', 'Resolved'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`stf-btn ${filter === key ? 'on' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
                {key === 'open' ? ` (${openCount})` : ''}
              </button>
            ))}
          </div>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: 'var(--mu)' }}>Loading…</div>}
          {!loading &&
            filtered.map((q) => (
              <div key={q.id} className="query-item fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{q.subject}</span>
                  <Badge variant={statusBadgeClass(q.status)}>{statusLabel(q.status)}</Badge>
                </div>
                {q.body && <p style={{ fontSize: 12.5, color: 'var(--mu)', margin: '0 0 6px' }}>{q.body}</p>}
                {q.reply && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '10px 12px',
                      background: 'var(--bl)',
                      borderRadius: 8,
                      fontSize: 12.5,
                      borderLeft: '3px solid var(--blue)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>Team reply</div>
                    {q.reply}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 6 }}>
                  {formatDateTime(q.createdAt)}
                  {q.roomName ? ` · ${q.roomName}` : ''}
                </div>
              </div>
            ))}
          {!loading && !filtered.length && (
            <Card style={{ textAlign: 'center', color: 'var(--mu)' }}>
              {filter === 'all' ? 'No queries yet. Tap Raise query to ask your team.' : 'No queries in this filter.'}
            </Card>
          )}
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Raise a query"
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={submitting} onClick={() => void submit()}>
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
          }
        >
          <div className="lb-field">
            <label>Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Kitchen countertop shade" />
          </div>
          <div className="lb-field">
            <label>Message</label>
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your question…" />
          </div>
        </Modal>
      </LivebuildProjectLayout>
    </>
  );
}

export default function LivebuildQueriesPage() {
  return (
    <LivebuildToastProvider>
      <LivebuildQueriesContent />
    </LivebuildToastProvider>
  );
}
