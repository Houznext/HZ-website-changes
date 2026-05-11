import { useMemo } from "react";
import type { Lead } from "../../NewCrmView/types";
import { PIPELINE_STAGES, STAGE_MAP } from "../constants";

export function usePipelineGroups(leads: Lead[]) {
  return useMemo(() => {
    const groups: Record<string, Lead[]> = {};
    for (const s of PIPELINE_STAGES) {
      groups[s.id] = [];
    }
    for (const lead of leads) {
      const st = String(lead.leadstatus ?? "New");
      const id = STAGE_MAP[st] ?? "new";
      if (!groups[id]) groups[id] = [];
      groups[id].push(lead);
    }
    return groups;
  }, [leads]);
}
