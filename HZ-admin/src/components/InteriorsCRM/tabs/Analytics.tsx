"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { useInteriorsCRM } from "../CRMContext";
import KPICard from "../components/KPICard";
import { Users, CheckCircle, Percent, Timer } from "lucide-react";
import AgentAvatar from "../components/AgentAvatar";

const WON = new Set(["Won", "completed"]);

export default function Analytics() {
  const { allLeads } = useInteriorsCRM();
  const [range, setRange] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [city, setCity] = useState("all");
  const [agent, setAgent] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const agents = useMemo(() => {
    const s = new Set<string>();
    for (const l of allLeads) {
      if (l.assignedTo) s.add(String(l.assignedTo));
    }
    return [...s].sort();
  }, [allLeads]);

  const scoped = useMemo(() => {
    const now = new Date();
    return allLeads.filter((l) => {
      if (city !== "all" && String(l.city || "").toLowerCase() !== city.toLowerCase()) return false;
      if (agent !== "all" && String(l.assignedTo || "") !== agent) return false;
      if (!l.createdAt) return range === "all";
      const d = parseISO(l.createdAt);
      if (!isValid(d)) return range === "all";
      if (range === "all") return true;
      if (range === "today") {
        return format(d, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
      }
      if (range === "week") {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        return d >= start;
      }
      if (range === "month") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (range === "custom" && customStart && customEnd) {
        const a = new Date(customStart);
        const b = new Date(customEnd);
        b.setHours(23, 59, 59, 999);
        return d >= a && d <= b;
      }
      return true;
    });
  }, [allLeads, range, city, agent, customStart, customEnd]);

  const total = scoped.length;
  const won = scoped.filter((l) => WON.has(String(l.leadstatus))).length;
  const conversion = total ? Math.round((won / total) * 1000) / 10 : 0;

  const byDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of scoped) {
      if (!l.createdAt) continue;
      const d = parseISO(l.createdAt);
      if (!isValid(d)) continue;
      const key = format(d, "MMM d");
      m.set(key, (m.get(key) || 0) + 1);
    }
    return [...m.entries()].map(([date, count]) => ({ date, count }));
  }, [scoped]);

  const statusRows = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const l of scoped) {
      const s = String(l.leadstatus || "New");
      acc[s] = (acc[s] || 0) + 1;
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  const maxStatus = Math.max(1, ...statusRows.map(([, c]) => c));

  const platformRows = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const l of scoped) {
      const p = String(l.platform || "—");
      acc[p] = (acc[p] || 0) + 1;
    }
    return Object.entries(acc).sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  const propTypes = ["Flat", "Villa", "Independent House", "Independent Floor"] as const;
  const propCounts = propTypes.map((pt) => ({
    pt,
    n: scoped.filter((l) => String(l.propertytype) === pt).length,
  }));

  const agentPerf = useMemo(() => {
    const m = new Map<string, { total: number; won: number }>();
    for (const l of scoped) {
      const a = l.assignedTo || "Unassigned";
      const cur = m.get(a) || { total: 0, won: 0 };
      cur.total += 1;
      if (WON.has(String(l.leadstatus))) cur.won += 1;
      m.set(a, cur);
    }
    return [...m.entries()]
      .map(([name, v]) => ({
        name,
        ...v,
        pct: v.total ? Math.round((v.won / v.total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [scoped]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="bg-[#f1f5f9] p-[3px] rounded-[9px] flex flex-wrap gap-0.5">
          {(
            [
              ["all", "All time"],
              ["today", "Today"],
              ["week", "This week"],
              ["month", "This month"],
              ["custom", "Custom"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRange(id)}
              className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all duration-150 ${
                range === id
                  ? "bg-white text-[#2563eb] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {range === "custom" ? (
          <>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] px-2 py-1 text-[12px]"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-lg border border-[#e2e8f0] px-2 py-1 text-[12px]"
            />
          </>
        ) : null}
        <select
          className="rounded-lg border border-[#e2e8f0] px-2 py-1.5 text-[12px]"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="all">All cities</option>
          {["Hyderabad", "Bengaluru", "Chennai", "Mumbai"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-[#e2e8f0] px-2 py-1.5 text-[12px]"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
        >
          <option value="all">All agents</option>
          {agents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Total" value={total} icon={Users} iconBg="#eff6ff" iconColor="#2563eb" />
        <KPICard label="Won" value={won} icon={CheckCircle} iconBg="#f0fdf4" iconColor="#16a34a" />
        <KPICard
          label="Conversion"
          value={`${conversion}%`}
          icon={Percent}
          iconBg="#fffbeb"
          iconColor="#ca8a04"
        />
        <KPICard
          label="Avg response"
          value="—"
          subtitle="TBD"
          icon={Timer}
          iconBg="#ede9fe"
          iconColor="#6d28d9"
        />
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
          Leads over time
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDay}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }}
                formatter={(v: number) => [`${v} leads`, "Count"]}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
            Status breakdown
          </p>
          <div className="space-y-2">
            {statusRows.map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span className="w-32 text-[11px] text-slate-500 truncate">{status}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2563eb]"
                    style={{ width: `${Math.round((count / maxStatus) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
            Platform breakdown
          </p>
          <ul className="space-y-1.5 max-h-64 overflow-y-auto">
            {platformRows.map(([name, count]) => (
              <li key={name} className="flex justify-between text-[12.5px] text-slate-700">
                <span className="truncate pr-2">{name}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
          Property type
        </p>
        <div className="flex flex-wrap gap-3">
          {propCounts.map(({ pt, n }) => (
            <div key={pt} className="rounded-lg border border-[#e2e8f0] px-3 py-2 min-w-[120px]">
              <p className="text-[11px] text-slate-500">{pt}</p>
              <p className="text-lg font-bold text-[#1e293b] font-head">{n}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {agentPerf.slice(0, 12).map((a) => (
          <div
            key={a.name}
            className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <AgentAvatar name={a.name} size={44} className="rounded-[12px] text-[12px]" />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#1e293b] truncate">{a.name}</p>
                <p className="text-[11px] text-slate-400">Agent</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 py-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Leads</p>
                <p className="text-[15px] font-bold text-slate-800">{a.total}</p>
              </div>
              <div className="rounded-lg bg-green-50 py-2">
                <p className="text-[10px] text-green-700 font-bold uppercase">Won</p>
                <p className="text-[15px] font-bold text-green-800">{a.won}</p>
              </div>
              <div className="rounded-lg bg-amber-50 py-2">
                <p className="text-[10px] text-amber-800 font-bold uppercase">Conv</p>
                <p className="text-[15px] font-bold text-amber-900">{a.pct}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
