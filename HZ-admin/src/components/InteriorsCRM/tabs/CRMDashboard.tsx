"use client";

import {
  Users,
  CheckCircle,
  CalendarDays,
  MapPin,
  IndianRupee,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import StatusBadge from "../components/StatusBadge";
import ActivityFeed, { type ActivityItem } from "../components/ActivityFeed";
import AgentAvatar from "../components/AgentAvatar";
import { useInteriorsCRM } from "../CRMContext";
import { PIPELINE_STAGES } from "../constants";
import { getOverdueFollowUps, getTodayFollowUps, formatDate } from "../../NewCrmView/types";
import { usePipelineGroups } from "../hooks/usePipelineGroups";
import apiClient from "@/src/utils/apiClient";

export default function CRMDashboard() {
  const {
    allLeads,
    setActiveTab,
    openLeadDetail,
  } = useInteriorsCRM();
  const groups = usePipelineGroups(allLeads);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void apiClient
      .get(`${apiClient.URLS.crmlead}/activity`, {}, true)
      .then((res: { status?: number; body?: { items?: unknown[] } }) => {
        if (cancelled || res.status !== 200 || !res.body) return;
        const raw = Array.isArray((res.body as { items?: unknown[] }).items)
          ? (res.body as { items: unknown[] }).items
          : Array.isArray(res.body)
            ? (res.body as unknown[])
            : [];
        const mapped: ActivityItem[] = raw
          .map((row: unknown, i: number) => {
            const r = row as Record<string, string>;
            return {
              id: String(r.id ?? i),
              icon: r.icon || "📌",
              text: r.text || r.message || "Activity",
              at: r.at || r.createdAt || new Date().toISOString(),
            };
          })
          .slice(0, 12);
        if (mapped.length) setActivityItems(mapped);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const derivedActivity = useMemo(() => {
    if (activityItems.length) return activityItems;
    return [...allLeads]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      )
      .slice(0, 8)
      .map((l, i) => ({
        id: l.id + String(i),
        icon: "✨",
        text: `${l.Fullname} · ${String(l.leadstatus)}`,
        at: l.updatedAt || l.createdAt,
      }));
  }, [activityItems, allLeads]);

  const wonCount = allLeads.filter((l) =>
    ["Won", "completed"].includes(String(l.leadstatus)),
  ).length;
  const siteVisitCount = allLeads.filter((l) =>
    String(l.leadstatus || "").toLowerCase().includes("site visit"),
  ).length;

  const platformCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of allLeads) {
      const p = String(l.platform || "Unknown");
      m.set(p, (m.get(p) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [allLeads]);

  const overdue = getOverdueFollowUps(allLeads);
  const todayFu = getTodayFollowUps(allLeads);

  const recent = useMemo(
    () =>
      [...allLeads].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [allLeads],
  );

  const dots = ["#2563eb", "#6d28d9", "#ca8a04", "#0d9488", "#ea580c"];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard
          label="Total Leads"
          value={allLeads.length}
          icon={Users}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />
        <KPICard
          label="Won"
          value={wonCount}
          icon={CheckCircle}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
        />
        <KPICard
          label="Follow-ups Today"
          value={todayFu.length}
          icon={CalendarDays}
          iconBg="#fffbeb"
          iconColor="#ca8a04"
        />
        <KPICard
          label="Site Visits"
          value={siteVisitCount}
          icon={MapPin}
          iconBg="#fdf4ff"
          iconColor="#a21caf"
        />
        <KPICard
          label="Pipeline Value"
          value="₹2.4Cr"
          subtitle="Placeholder"
          icon={IndianRupee}
          iconBg="#fff7ed"
          iconColor="#ea580c"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-[#1e293b]">Pipeline overview</h3>
            <button
              type="button"
              onClick={() => setActiveTab("pipeline")}
              className="text-[12px] font-semibold text-[#2563eb] flex items-center gap-0.5 hover:underline transition-all duration-150"
            >
              View full pipeline
              <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const n = groups[stage.id]?.length ?? 0;
              const max = Math.max(1, ...PIPELINE_STAGES.map((s) => groups[s.id]?.length ?? 0));
              const pct = Math.round((n / max) * 100);
              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <span className="w-28 text-[12px] text-slate-500 truncate">{stage.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${pct}%`, background: stage.color }}
                    />
                  </div>
                  <span className="w-7 text-right text-[12px] font-semibold text-slate-700">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
              Leads by source
            </p>
            <ul className="space-y-2">
              {platformCounts.map(([name, count], i) => (
                <li key={name} className="flex items-center gap-2 text-[12.5px] text-slate-700">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: dots[i % dots.length] }}
                  />
                  <span className="flex-1 truncate">{name}</span>
                  <span className="font-semibold text-slate-600">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#fca5a5] bg-[#fff5f5] p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-red-700 mb-2">
              Overdue follow-ups
            </p>
            <ul className="space-y-2">
              {overdue.slice(0, 3).map((l) => (
                <li key={l.id} className="text-[12.5px] text-slate-800 font-medium truncate">
                  {l.Fullname}
                </li>
              ))}
              {!overdue.length ? (
                <li className="text-[12px] text-slate-500">None — great job.</li>
              ) : null}
            </ul>
            <button
              type="button"
              onClick={() => setActiveTab("followups")}
              className="mt-3 text-[12px] font-semibold text-[#dc2626] hover:underline transition-all duration-150"
            >
              View all follow-ups
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-[#e2e8f0] flex justify-between items-center">
            <h3 className="text-[13px] font-bold text-[#1e293b]">Recent leads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500">
                  <th className="text-left px-4 py-2.5">Lead</th>
                  <th className="text-left px-4 py-2.5">Property</th>
                  <th className="text-left px-4 py-2.5">Platform</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Added</th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 6).map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => openLeadDetail(l)}
                    className="border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <AgentAvatar name={l.Fullname} size={28} className="text-[10px]" />
                        <div>
                          <p className="text-[12.5px] font-semibold text-slate-800">{l.Fullname}</p>
                          <p className="text-[11px] text-slate-400">{l.Phonenumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-slate-700">{String(l.propertytype)}</td>
                    <td className="px-4 py-2.5 text-[12.5px] text-slate-700 max-w-[100px] truncate">
                      {String(l.platform)}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={String(l.leadstatus)} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-slate-600">{formatDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1e293b] mb-3">Activity</h3>
          <ActivityFeed items={derivedActivity} />
        </div>
      </div>
    </div>
  );
}
