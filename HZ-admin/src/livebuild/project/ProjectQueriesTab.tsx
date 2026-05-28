import { useEffect, useState } from 'react';
import livebuildApi from '../lib/api';
import type { LbQuery } from '../lib/types';
import { Badge, Btn, FormInput, TabBar, lbToast } from '../components';
import Loader from '@/src/common/Loader';

type Props = { projectId: string; projectName: string };

export function ProjectQueriesTab({ projectId, projectName }: Props) {
  const [queries, setQueries] = useState<LbQuery[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState<Record<string, string>>({});

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const list = await livebuildApi.listQueries(
        projectId,
        status && status !== 'all' ? status : undefined,
      );
      setQueries(list);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load queries', 'err');
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter === 'all' ? undefined : filter);
  }, [projectId, filter]);

  const sendReply = async (q: LbQuery, asResolved = false) => {
    const text = asResolved ? 'Marked resolved by admin.' : replies[q.id]?.trim();
    if (!text) return;
    try {
      await livebuildApi.replyQuery(projectId, q.id, text);
      lbToast(asResolved ? 'Marked resolved' : 'Reply sent', 'ok');
      setReplies((r) => ({ ...r, [q.id]: '' }));
      load(filter === 'all' ? undefined : filter);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Reply failed', 'err');
    }
  };

  const openCount = queries.filter((q) => q.status === 'open').length;

  if (loading) return <div className="lb-loading"><Loader /></div>;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
          Queries — {projectName}
        </div>
        <TabBar
          tabs={[
            { id: 'all' as const, label: 'All', count: queries.length },
            { id: 'open' as const, label: 'Open', count: openCount },
            { id: 'resolved' as const, label: 'Resolved' },
          ]}
          active={filter}
          onChange={(id) => setFilter(id as 'all' | 'open' | 'resolved')}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {queries.map((q) => (
          <div
            key={q.id}
            className="lb-card"
            style={{
              borderLeft: `3px solid ${q.status === 'open' ? 'var(--lb-am)' : 'var(--lb-tl)'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
              <div>
                {q.room ? (
                  <div style={{ marginBottom: 5 }}>
                    <Badge variant="gray">{q.room}</Badge>
                  </div>
                ) : null}
                <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13.5, fontWeight: 700 }}>{q.subject}</div>
                <div style={{ fontSize: 11.5, color: 'var(--lb-mu)', marginTop: 2 }}>
                  {q.customerName ?? ''} · {q.createdAt?.slice(0, 10)}
                </div>
              </div>
              <Badge variant={q.status === 'open' ? 'amber' : 'tl'}>{q.status}</Badge>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--lb-mu)', lineHeight: 1.6 }}>{q.message}</p>
            {q.reply ? (
              <div
                style={{
                  background: 'var(--lb-bl)',
                  borderRadius: 9,
                  padding: '10px 12px',
                  marginTop: 10,
                  borderLeft: '3px solid var(--lb-blue)',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--lb-blue)' }}>Reply</div>
                {q.reply}
              </div>
            ) : null}
            {q.status === 'open' ? (
              <div style={{ marginTop: 10 }}>
                <FormInput
                  as="textarea"
                  rows={2}
                  placeholder="Type your reply…"
                  value={replies[q.id] ?? ''}
                  onChange={(e) => setReplies((r) => ({ ...r, [q.id]: e.target.value }))}
                  style={{ resize: 'none', marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="blue" size="sm" onClick={() => sendReply(q)}>
                    Send reply
                  </Btn>
                  <Btn variant="ghost" size="sm" onClick={() => sendReply(q, true)}>
                    Mark resolved
                  </Btn>
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {queries.length === 0 ? <div className="lb-empty">No queries</div> : null}
      </div>
    </div>
  );
}
