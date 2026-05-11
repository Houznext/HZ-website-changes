"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PIPELINE_STAGES } from "../constants";
import { useInteriorsCRM } from "../CRMContext";
import LeadCard from "../components/LeadCard";
import { usePipelineGroups } from "../hooks/usePipelineGroups";
import type { Lead } from "../../NewCrmView/types";

const reverseStatusForStage: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal Sent",
  negotiation: "Negotiation",
  sitevisit: "Site Visit",
  won: "Won",
};

export default function Pipeline() {
  const {
    allLeads,
    setLeadFormOpen,
    resetLeadForm,
    setLeadFormInitialStatus,
    setSelectedLeadId,
  } = useInteriorsCRM();

  const [localAgent, setLocalAgent] = useState("all");
  const [localCity, setLocalCity] = useState("all");

  const agents = useMemo(() => {
    const s = new Set<string>();
    for (const l of allLeads) {
      if (l.assignedTo) s.add(String(l.assignedTo));
    }
    return [...s].sort();
  }, [allLeads]);

  const filtered = useMemo(() => {
    return allLeads.filter((l) => {
      if (localAgent !== "all" && String(l.assignedTo || "") !== localAgent) return false;
      if (localCity !== "all" && String(l.city || "").toLowerCase() !== localCity.toLowerCase())
        return false;
      return true;
    });
  }, [allLeads, localAgent, localCity]);

  const groups = usePipelineGroups(filtered);

  const openAddForStage = (stageId: string) => {
    const st = reverseStatusForStage[stageId] || "New";
    setSelectedLeadId(null);
    resetLeadForm(st);
    setLeadFormInitialStatus(st);
    setLeadFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <select
          className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px]"
          value={localAgent}
          onChange={(e) => setLocalAgent(e.target.value)}
        >
          <option value="all">All agents</option>
          {agents.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px]"
          value={localCity}
          onChange={(e) => setLocalCity(e.target.value)}
        >
          <option value="all">All cities</option>
          {["Hyderabad", "Bengaluru", "Chennai", "Mumbai"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div
        className="grid gap-3 overflow-x-auto pb-2"
        style={{ gridTemplateColumns: "repeat(7, minmax(180px, 1fr))" }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const list = groups[stage.id] || [];
          return (
            <div
              key={stage.id}
              className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] min-w-[180px] flex flex-col"
            >
              <div
                className="px-3 py-2.5 border-l-[3px] rounded-t-xl bg-white/80"
                style={{ borderLeftColor: stage.color }}
              >
                <p className="text-[12.5px] font-bold text-[#1e293b]">{stage.label}</p>
                <p className="text-[11px] text-slate-500">{list.length} leads</p>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                {list.map((lead: Lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
              <div className="p-2 pt-0">
                <button
                  type="button"
                  onClick={() => openAddForStage(stage.id)}
                  className="w-full border border-dashed border-slate-300 rounded-lg py-2 text-[11px] font-semibold text-slate-500 hover:border-[#93c5fd] hover:text-[#2563eb] transition-all duration-150 flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.8} />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
