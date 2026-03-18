/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../../components/portal/PortalLayout';

interface ITemplate { name: string; slug: string; }
interface ITrade {
  id: string; customName: string | null;
  overallProgress: number; status: string;
  template: ITemplate;
  lastUpdatedAt: string | null;
}
interface IProject { id: string; city: string; locality: string; bhk?: string; customer: { fullName: string }; trades?: ITrade[]; }
interface ILabourEntry { tradeType: string; count: number; }
interface IMaterialUsage { materialName: string; brandName: string | null; quantity: number; unit: string; unitCost: number | null; totalCost: number | null; }
interface IUpdate {
  id: string; updateDate: string;
  progressDelta: number; cumulativeProgress: number;
  stageLabel: string | null; workDoneToday: string | null;
  blockerNote: string | null; labourCount: number | null;
  totalExpenditureToday: number | null;
  labourEntries: ILabourEntry[];
  materialUsages: IMaterialUsage[];
}
interface IQcItem { id: string; checkpointName: string; status: string; isMandatory: boolean; }

const TRADE_EMOJI: Record<string, string> = {
  'modular-kitchen':'🍳','wardrobes':'🚪','false-ceiling':'⬛',
  'flooring':'🔲','painting':'🖌','electrical':'⚡',
  'plumbing':'💧','bathroom-remodel':'🚿','tv-unit':'📺',
  'pooja-unit':'🪔','study-unit':'📚','shoe-rack':'👟',
};
const STATUS_CLASSES: Record<string, string> = {
  in_progress: 'bg-[#EBF3FF] text-[#1A56DB]',
  not_started: 'bg-gray-100 text-gray-500',
  on_hold:     'bg-[#FFFBEB] text-[#92400E]',
  completed:   'bg-[#E1F5EE] text-[#085041]',
};
const BAR_COLOR: Record<string, string> = {
  in_progress: '#1A56DB', not_started: '#9ca3af',
  on_hold: '#F59E0B', completed: '#1D9E75',
};
const DATE_FILTERS = [
  { label: 'Today',      value: 'today' },
  { label: 'Yesterday',  value: 'yesterday' },
  { label: 'Last 7 days',value: 'week' },
  { label: 'Last month', value: 'month' },
  { label: 'All time',   value: 'all' },
];
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('hz_customer_token') ?? '' : '';

function TradeCard({ trade, isSelected, onClick }: {
  trade: ITrade; isSelected: boolean; onClick: () => void;
}) {
  const prog = Math.round(trade.overallProgress ?? 0);
  const emoji = TRADE_EMOJI[trade.template?.slug ?? ''] ?? '🔧';
  const statusClass = STATUS_CLASSES[trade.status] ?? STATUS_CLASSES.not_started;
  const barColor = BAR_COLOR[trade.status] ?? '#9ca3af';
  const name = trade.customName ?? trade.template?.name ?? 'Trade';
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border cursor-pointer transition-all p-4 ${
        isSelected ? 'border-[#1A56DB] shadow-[0_2px_8px_rgba(26,86,219,0.12)]' : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">{name}</p>
          {trade.lastUpdatedAt && (
            <p className="text-[10px] text-gray-400">
              Updated {new Date(trade.lastUpdatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusClass}`}>
          {trade.status.replace('_', ' ')}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${prog}%`, background: barColor }} />
        </div>
        <span className="text-xs font-medium text-gray-700 flex-shrink-0">{prog}%</span>
      </div>
      {isSelected && (
        <p className="text-[10px] text-[#1A56DB] mt-2">Click to collapse ▲</p>
      )}
    </div>
  );
}

function TradeDetailPanel({ trade, projectId, onClose }: {
  trade: ITrade; projectId: string; onClose: () => void;
}) {
  const [dateFilter, setDateFilter] = useState('week');
  const [updates, setUpdates]       = useState<IUpdate[]>([]);
  const [qcItems, setQcItems]       = useState<IQcItem[]>([]);
  const [loading, setLoading]       = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const [uRes, qRes] = await Promise.all([
        fetch(`${API}/interiors/trades/${trade.id}/updates?dateFilter=${dateFilter}`, { headers: h }),
        fetch(`${API}/interiors/qc/${trade.id}`, { headers: h }).catch(() => ({ ok: false, json: async () => [] } as Response)),
      ]);
      const u = uRes.ok ? await uRes.json() as IUpdate[] : [];
      const q = (qRes as Response).ok ? await (qRes as Response).json() as IQcItem[] : [];
      setUpdates(Array.isArray(u) ? u : []);
      setQcItems(Array.isArray(q) ? q : []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [trade.id, dateFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const allMaterials = updates.flatMap(u => u.materialUsages ?? []);
  const latestLabour = updates[0]?.labourEntries ?? [];
  const totalSpend   = updates.reduce((s, u) => s + (Number(u.totalExpenditureToday) || 0), 0);
  const hasBlocker   = updates.some(u => u.blockerNote);

  return (
    <div className="bg-white rounded-xl border border-[#1A56DB] mt-3 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-[#fafbff]">
        <span className="text-base">
          {TRADE_EMOJI[trade.template?.slug ?? ''] ?? '🔧'}
        </span>
        <span className="text-sm font-medium text-gray-900 flex-1">
          {trade.customName ?? trade.template?.name ?? 'Trade'}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_CLASSES[trade.status] ?? STATUS_CLASSES.not_started}`}>
          {trade.status.replace('_', ' ')}
        </span>
        <button
          onClick={() => window.open(`${API}/interiors/trades/${trade.id}/report`, '_blank')}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          Download report
        </button>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1">
          ×
        </button>
      </div>

      <div className="flex border-b border-gray-100 overflow-x-auto">
        {DATE_FILTERS.map(f => (
          <button key={f.value} onClick={() => setDateFilter(f.value)}
            className={`px-4 py-2.5 text-xs whitespace-nowrap border-b-2 transition-colors ${
              dateFilter === f.value
                ? 'border-[#1A56DB] text-[#1A56DB] font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100" style={{ minHeight: 200 }}>
          <div className="p-4">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">
              {updates.length > 0 ? `${updates.length} update(s)` : 'Daily updates'}
            </p>
            {updates.length === 0 ? (
              <p className="text-xs text-gray-400">No updates in this period</p>
            ) : updates.map(u => (
              <div key={u.id} className="bg-gray-50 rounded-xl p-3 mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-gray-900">
                    {new Date(u.updateDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  {u.stageLabel && (
                    <span className="text-[10px] text-gray-400 truncate ml-2 max-w-[120px]">
                      {u.stageLabel}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 text-[10px] text-gray-500">
                  <span className="text-[#1A56DB] font-medium">
                    +{u.progressDelta}% → {u.cumulativeProgress}%
                  </span>
                  {u.totalExpenditureToday && Number(u.totalExpenditureToday) > 0 && (
                    <span>₹{Number(u.totalExpenditureToday).toLocaleString('en-IN')}</span>
                  )}
                </div>
                {u.workDoneToday && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                    {u.workDoneToday}
                  </p>
                )}
                {u.blockerNote && (
                  <div className="mt-1.5 bg-red-50 rounded-lg px-2 py-1">
                    <p className="text-[10px] text-red-600">
                      ⚠ {u.blockerNote}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {totalSpend > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-500">Total spend: </span>
                <span className="text-[10px] font-medium text-gray-900">
                  ₹{totalSpend.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">
              Materials used
            </p>
            {allMaterials.length === 0 ? (
              <p className="text-xs text-gray-400 mb-4">No materials logged</p>
            ) : (
              <div className="mb-4">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="text-left pb-1 font-medium">Material</th>
                      <th className="text-left pb-1 font-medium">Brand</th>
                      <th className="text-right pb-1 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMaterials.map((m, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="py-1 text-gray-700">{m.materialName}</td>
                        <td className="py-1 text-gray-500">{m.brandName ?? '—'}</td>
                        <td className="py-1 text-right text-gray-700">
                          {m.totalCost
                            ? `₹${Number(m.totalCost).toLocaleString('en-IN')}`
                            : `${m.quantity} ${m.unit}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              QC checkpoints
            </p>
            {qcItems.length === 0 ? (
              <p className="text-xs text-gray-400">No checkpoints</p>
            ) : qcItems.map(qc => (
              <div key={qc.id} className="flex items-center gap-2 py-1 border-b border-gray-50">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    qc.status === 'pass'
                      ? 'bg-[#1D9E75]'
                      : qc.status === 'fail'
                        ? 'bg-red-400'
                        : qc.status === 'skipped'
                          ? 'bg-gray-300'
                          : 'bg-[#1A56DB]'
                  }`}
                />
                <span className="text-[10px] text-gray-700 flex-1">
                  {qc.checkpointName}
                </span>
                <span
                  className={`text-[9px] ${
                    qc.status === 'pass'
                      ? 'text-[#085041]'
                      : qc.status === 'fail'
                        ? 'text-red-500'
                        : 'text-gray-400'
                  }`}
                >
                  {qc.status}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3">
              Labour
            </p>
            {latestLabour.length === 0 ? (
              <p className="text-xs text-gray-400 mb-4">
                {updates[0]?.labourCount
                  ? `${updates[0].labourCount} workers total`
                  : 'No labour data'}
              </p>
            ) : (
              <div className="mb-4 space-y-1.5">
                {latestLabour.map((l, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-[11px] text-gray-600">
                      {l.tradeType}
                    </span>
                    <span className="text-[11px] font-medium text-gray-900">
                      {l.count} workers
                    </span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              Status
            </p>
            <span
              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-4 ${
                STATUS_CLASSES[trade.status] ?? STATUS_CLASSES.not_started
              }`}
            >
              {trade.status.replace('_', ' ')}
            </span>

            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
              Blockers
            </p>
            {hasBlocker ? (
              <div className="bg-red-50 rounded-lg px-2 py-1.5">
                {updates
                  .filter(u => u.blockerNote)
                  .map(u => (
                    <p
                      key={u.id}
                      className="text-[10px] text-red-600 mb-0.5"
                    >
                      {u.blockerNote}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-[10px] text-[#085041]">No active blockers</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TradesPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [project, setProject]       = useState<IProject | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to load project');
      setProject(await res.json() as IProject);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const trades = project?.trades ?? [];
  const selectedTrade = trades.find(t => t.id === selectedTradeId) ?? null;
  const pid = typeof projectId === 'string' ? projectId : '';

  if (loading) {
    return (
      <PortalLayout activePage="trades" projectId={project?.id ?? pid}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      activePage="trades"
      projectId={project?.id ?? pid}
      projectAddress={`${project?.bhk ? project.bhk + ' · ' : ''}${project?.city ?? ''}`}
      customerName={project?.customer?.fullName}
    >
      <div className="mb-4">
        <h2 className="text-base font-medium text-gray-900">All trades</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Click any trade to see the full timeline, materials, QC and labour detail
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-xs text-red-700">
          {error}
        </div>
      )}

      {trades.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm font-medium text-gray-700">
            No trades added yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Trades will appear here once added by your designer
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {trades.map(t => (
              <TradeCard
                key={t.id}
                trade={t}
                isSelected={selectedTradeId === t.id}
                onClick={() =>
                  setSelectedTradeId(prev => (prev === t.id ? null : t.id))
                }
              />
            ))}
          </div>
          {selectedTrade && (
            <TradeDetailPanel
              trade={selectedTrade}
              projectId={project?.id ?? ''}
              onClose={() => setSelectedTradeId(null)}
            />
          )}
        </>
      )}
    </PortalLayout>
  );
}

