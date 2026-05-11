"use client";

import { useMemo, useState } from "react";
import { useInteriorsCRM } from "../CRMContext";
import AgentAvatar from "../components/AgentAvatar";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../../NewCrmView/types";
import { getTodayFollowUps, getOverdueFollowUps } from "../../NewCrmView/types";
import toast from "react-hot-toast";

const WON = new Set(["Won", "completed"]);

export default function TeamAssign() {
  const { allLeads, branchUsers, assignLead, refetch } = useInteriorsCRM();
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAgent, setBulkAgent] = useState("");
  const [rowAgent, setRowAgent] = useState<Record<string, string>>({});

  const byAgent = useMemo(() => {
    const m = new Map<string, { leads: number; won: number; fu: number }>();
    const overdue = getOverdueFollowUps(allLeads);
    const today = getTodayFollowUps(allLeads);
    for (const l of allLeads) {
      const name = l.assignedTo || "Unassigned";
      const cur = m.get(name) || { leads: 0, won: 0, fu: 0 };
      cur.leads += 1;
      if (WON.has(String(l.leadstatus))) cur.won += 1;
      if (overdue.some((x) => x.id === l.id) || today.some((x) => x.id === l.id)) cur.fu += 1;
      m.set(name, cur);
    }
    return [...m.entries()].sort((a, b) => b[1].leads - a[1].leads);
  }, [allLeads]);

  const toggle = (id: string) => {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const applyBulk = async () => {
    if (!bulkAgent) return;
    for (const id of selected) {
      await assignLead(id, bulkAgent);
    }
    setSelected([]);
    setBulkAgent("");
    await refetch();
    toast.success("Bulk assign complete");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {byAgent.slice(0, 9).map(([name, stats]) => (
          <div
            key={name}
            className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <AgentAvatar name={name} size={44} className="rounded-[12px] text-[12px]" />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#1e293b] truncate">{name}</p>
                <p className="text-[11px] text-slate-400">Team member</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[12px]">
              <div className="rounded-lg bg-slate-50 py-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase">Leads</p>
                <p className="font-bold text-slate-800">{stats.leads}</p>
              </div>
              <div className="rounded-lg bg-green-50 py-2">
                <p className="text-[9px] font-bold text-green-700 uppercase">Won</p>
                <p className="font-bold text-green-800">{stats.won}</p>
              </div>
              <div className="rounded-lg bg-amber-50 py-2">
                <p className="text-[9px] font-bold text-amber-800 uppercase">FU</p>
                <p className="font-bold text-amber-900">{stats.fu}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-bold text-[#1e293b]">Bulk assign</p>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-1.5 text-[12px]"
            value={bulkAgent}
            onChange={(e) => setBulkAgent(e.target.value)}
          >
            <option value="">Assign selected to…</option>
            {branchUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selected.length || !bulkAgent}
            onClick={() => void applyBulk()}
            className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-[12px] font-semibold disabled:opacity-40 transition-all duration-150"
          >
            Apply
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500 border-b border-[#e2e8f0]">
                <th className="text-left px-3 py-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.length > 0 &&
                      selected.length === allLeads.slice(0, 40).length
                    }
                    onChange={() => {
                      const slice = allLeads.slice(0, 40).map((l) => l.id);
                      if (selected.length === slice.length) setSelected([]);
                      else setSelected(slice);
                    }}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="text-left px-3 py-2">Lead</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Assigned</th>
                <th className="text-left px-3 py-2">City</th>
                <th className="text-left px-3 py-2">Added</th>
                <th className="text-left px-3 py-2">Assign</th>
              </tr>
            </thead>
            <tbody>
              {allLeads.slice(0, 40).map((l) => (
                <tr key={l.id} className="border-b border-[#f1f5f9] hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(l.id)}
                      onChange={() => toggle(l.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-3 py-2 text-[12.5px]">
                    <p className="font-semibold text-slate-800">{l.Fullname}</p>
                    <p className="text-[11px] text-slate-400">{l.Phonenumber}</p>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={String(l.leadstatus)} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-[12px] text-slate-600">{l.assignedTo || "—"}</td>
                  <td className="px-3 py-2 text-[12px]">{l.city || "—"}</td>
                  <td className="px-3 py-2 text-[12px]">{formatDate(l.createdAt)}</td>
                  <td className="px-3 py-2">
                    <select
                      className="rounded-lg border border-[#e2e8f0] px-2 py-1 text-[11px] max-w-[140px]"
                      value={rowAgent[l.id] ?? ""}
                      onChange={async (e) => {
                        const v = e.target.value;
                        setRowAgent((p) => ({ ...p, [l.id]: v }));
                        if (!v) return;
                        await assignLead(l.id, v);
                        await refetch();
                        toast.success("Assigned");
                      }}
                    >
                      <option value="">Change…</option>
                      {branchUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
