import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../../components/portal/PortalLayout';

interface ISnag {
  id: string; title: string; description: string | null;
  raisedBy: string; severity: string; status: string;
  resolutionNote: string | null; resolvedBy: string | null;
  resolvedAt: string | null; raisedAt: string;
}
interface IProject {
  id: string; city: string; locality: string; bhk?: string;
  customer: { fullName: string };
}

const SEVERITY_DOT: Record<string, string> = {
  low: 'bg-gray-400', medium: 'bg-[#1A56DB]',
  high: 'bg-[#F59E0B]', critical: 'bg-red-500',
};
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('hz_customer_token') ?? ''
    : '';

export default function SnagsPortalPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [project, setProject] = useState<IProject | null>(null);
  const [snags, setSnags]     = useState<ISnag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter]   = useState('all');
  const [showRaise, setShowRaise] = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newSev, setNewSev]       = useState('medium');
  const [raising, setRaising]     = useState(false);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true); setError('');
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const [pRes, sRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/snags`, { headers: h }),
      ]);
      if (!pRes.ok) throw new Error('Failed to load');
      const [p, s] = await Promise.all([
        pRes.json() as Promise<IProject>,
        sRes.json() as Promise<ISnag[]>,
      ]);
      setProject(p);
      setSnags(Array.isArray(s) ? s : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleRaise = async () => {
    if (!newTitle.trim() || !projectId) return;
    setRaising(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}/snags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          projectId,
          title: newTitle.trim(),
          description: newDesc || null,
          raisedBy: 'Customer',
          severity: newSev,
        }),
      });
      if (!res.ok) throw new Error('Failed to raise snag');
      setSuccess('Snag raised. Your designer has been notified.');
      setShowRaise(false); setNewTitle(''); setNewDesc(''); setNewSev('medium');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setRaising(false);
    }
  };

  const filtered = filter === 'all' ? snags : snags.filter(s => s.status === filter);
  const openCount = snags.filter(s => s.status !== 'resolved').length;

  return (
    <PortalLayout
      activePage="snags"
      projectId={project?.id ?? (projectId as string ?? '')}
      projectAddress={`${project?.bhk ? project.bhk + ' · ' : ''}${project?.city ?? ''}`}
      customerName={project?.customer?.fullName}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-medium text-gray-900">Snags & issues</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {openCount > 0
              ? `${openCount} open issue${openCount !== 1 ? 's' : ''} being tracked`
              : 'No open issues'}
          </p>
        </div>
        <button
          onClick={() => setShowRaise(true)}
          className="text-xs font-medium px-4 py-2 bg-[#1A56DB] text-white rounded-lg hover:bg-[#1547c0] transition-colors"
        >
          + Report issue
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { label: 'All', value: 'all', count: snags.length },
          { label: 'Open', value: 'open', count: snags.filter(s => s.status === 'open').length },
          {
            label: 'In progress',
            value: 'in_progress',
            count: snags.filter(s => s.status === 'in_progress').length,
          },
          {
            label: 'Resolved',
            value: 'resolved',
            count: snags.filter(s => s.status === 'resolved').length,
          },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f.value
                ? 'bg-[#EBF3FF] text-[#1A56DB] border-[rgba(26,86,219,0.2)] font-medium'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
            {f.count > 0 && <span className="ml-1 opacity-60">{f.count}</span>}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3 text-xs text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-3 mb-3 text-xs text-[#085041]">
          {success}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">
            {filter === 'all' ? 'No issues reported' : `No ${filter.replace('_', ' ')} issues`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Use the &quot;Report issue&quot; button to flag any problems
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sn => (
            <div key={sn.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${SEVERITY_DOT[sn.severity] ?? 'bg-gray-400'}`}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {sn.title}
                    </p>
                    <span
                      className={`text-[9px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                        sn.status === 'resolved'
                          ? 'bg-[#E1F5EE] text-[#085041]'
                          : sn.status === 'in_progress'
                            ? 'bg-[#FFFBEB] text-[#92400E]'
                            : 'bg-[#FEF2F2] text-[#991B1B]'
                      }`}
                    >
                      {sn.status.replace('_', ' ')}
                    </span>
                  </div>
                  {sn.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sn.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        sn.severity === 'critical'
                          ? 'bg-red-50 text-red-600'
                          : sn.severity === 'high'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {sn.severity}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Raised{' '}
                      {new Date(sn.raisedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      by {sn.raisedBy}
                    </span>
                  </div>
                  {sn.status === 'resolved' && sn.resolutionNote && (
                    <div className="mt-2 bg-[#E1F5EE] rounded-lg px-2.5 py-1.5">
                      <p className="text-[10px] text-[#085041]">
                        <span className="font-medium">Resolved:</span>{' '}
                        {sn.resolutionNote}
                        {sn.resolvedAt
                          ? ` · ${new Date(
                              sn.resolvedAt,
                            ).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}`
                          : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRaise && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowRaise(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-base font-medium text-gray-900 mb-4">
              Report an issue
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Issue title *
                </label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1A56DB]"
                  placeholder="e.g. Kitchen cabinet door not closing properly"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#1A56DB] resize-none"
                  placeholder="Add more details..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">
                  Severity
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map(s => (
                    <button
                      key={s}
                      onClick={() => setNewSev(s)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize ${
                        newSev === s
                          ? 'bg-[#EBF3FF] text-[#1A56DB] border-[rgba(26,86,219,0.3)] font-medium'
                          : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowRaise(false)}
                className="flex-1 text-sm py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRaise}
                disabled={raising || !newTitle.trim()}
                className="flex-1 text-sm py-2.5 rounded-xl bg-[#1A56DB] text-white font-medium hover:bg-[#1547c0] disabled:opacity-50"
              >
                {raising ? 'Submitting...' : 'Submit issue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

