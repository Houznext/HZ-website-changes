"use client";

import { MessageCircle } from "lucide-react";
import { getOverdueFollowUps, getTodayFollowUps, getUpcomingFollowUps, formatDate, formatDateTime } from "../../NewCrmView/types";
import { useInteriorsCRM } from "../CRMContext";
import StatusBadge from "../components/StatusBadge";
import { AlertTriangle, Calendar, CalendarRange } from "lucide-react";
import toast from "react-hot-toast";
import { openWhatsAppToNumber } from "@/src/utils/openWhatsAppChat";

export default function FollowUps() {
  const { allLeads, openLeadDetail } = useInteriorsCRM();
  const overdue = getOverdueFollowUps(allLeads);
  const today = getTodayFollowUps(allLeads);
  const upcoming = getUpcomingFollowUps(allLeads, 7).filter((l) => {
    const t = getTodayFollowUps(allLeads).some((x) => x.id === l.id);
    const o = overdue.some((x) => x.id === l.id);
    return !t && !o;
  });

  const wa = (lead: (typeof allLeads)[0]) => {
    if (!openWhatsAppToNumber(lead.Phonenumber)) {
      toast.error("No valid phone number for WhatsApp.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#fca5a5] bg-white p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 cursor-default">
          <div className="w-11 h-11 rounded-[11px] bg-[#fff5f5] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#dc2626]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400">Overdue</p>
            <p className="text-[24px] font-black text-[#1e293b] font-head">{overdue.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#fbbf24] bg-white p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200">
          <div className="w-11 h-11 rounded-[11px] bg-[#fffbeb] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#ca8a04]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400">Due today</p>
            <p className="text-[24px] font-black text-[#1e293b] font-head">{today.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#93c5fd] bg-white p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200">
          <div className="w-11 h-11 rounded-[11px] bg-[#eff6ff] flex items-center justify-center">
            <CalendarRange className="w-4 h-4 text-[#2563eb]" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400">Upcoming 7 days</p>
            <p className="text-[24px] font-black text-[#1e293b] font-head">{upcoming.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#fca5a5] bg-[#fff5f5] overflow-hidden shadow-sm">
        <div className="px-4 py-2 bg-red-50 border-b border-[#fca5a5]">
          <p className="text-[13px] font-bold text-red-800">Overdue</p>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500 border-b border-[#e2e8f0]">
                <th className="text-left px-3 py-2">Lead</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Assigned</th>
                <th className="text-left px-3 py-2">Due</th>
                <th className="text-left px-3 py-2">Ago</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((l) => {
                const due = l.followUpDate ? new Date(l.followUpDate) : null;
                const days = due
                  ? Math.max(
                      1,
                      Math.floor(
                        (Date.now() - due.getTime()) / (1000 * 60 * 60 * 24),
                      ),
                    )
                  : 0;
                return (
                  <tr
                    key={l.id}
                    className="border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer"
                    onClick={() => openLeadDetail(l)}
                  >
                    <td className="px-3 py-2 text-[12.5px] font-medium text-slate-800">{l.Fullname}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={String(l.leadstatus)} size="sm" />
                    </td>
                    <td className="px-3 py-2 text-[12.5px] text-slate-600">{l.assignedTo || "—"}</td>
                    <td className="px-3 py-2 text-[12.5px]">{formatDate(l.followUpDate)}</td>
                    <td className="px-3 py-2 text-[12.5px] text-red-600 font-semibold">{days}d ago</td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => void wa(l)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150"
                      >
                        <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#fef3c7] bg-[#fffbeb] overflow-hidden shadow-sm">
        <div className="px-4 py-2 bg-amber-50 border-b border-[#fef3c7]">
          <p className="text-[13px] font-bold text-amber-900">Due today</p>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500 border-b border-[#e2e8f0]">
                <th className="text-left px-3 py-2">Lead</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Time</th>
                <th className="text-left px-3 py-2">Assigned</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {today.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer"
                  onClick={() => openLeadDetail(l)}
                >
                  <td className="px-3 py-2 text-[12.5px] font-medium">{l.Fullname}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={String(l.leadstatus)} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-[12.5px]">
                    {l.followUpDate ? formatDateTime(l.followUpDate) : "—"}
                  </td>
                  <td className="px-3 py-2 text-[12.5px]">{l.assignedTo || "—"}</td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => void wa(l)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
        <div className="px-4 py-2 border-b border-[#e2e8f0]">
          <p className="text-[13px] font-bold text-[#1e293b]">Upcoming (7 days)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500 border-b border-[#e2e8f0]">
                <th className="text-left px-3 py-2">Lead</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Due date</th>
                <th className="text-left px-3 py-2">Assigned</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer"
                  onClick={() => openLeadDetail(l)}
                >
                  <td className="px-3 py-2 text-[12.5px] font-medium">{l.Fullname}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={String(l.leadstatus)} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-[12.5px]">{formatDate(l.followUpDate)}</td>
                  <td className="px-3 py-2 text-[12.5px]">{l.assignedTo || "—"}</td>
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => void wa(l)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                    </button>
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
