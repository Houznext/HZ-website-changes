import { Star } from "lucide-react";
import type { Lead } from "../../NewCrmView/types";
import StatusBadge from "./StatusBadge";
import { useInteriorsCRM } from "../CRMContext";

interface LeadCardProps {
  lead: Lead;
}

export default function LeadCard({ lead }: LeadCardProps) {
  const { openLeadDetail } = useInteriorsCRM();
  return (
    <button
      type="button"
      onClick={() => openLeadDetail(lead)}
      className="bg-white rounded-[9px] border border-[#e2e8f0] p-3 w-full text-left
        hover:shadow-lg hover:-translate-y-[1px] hover:border-[#93c5fd] transition-all duration-200"
    >
      <p className="text-[13px] font-bold text-[#1e293b] truncate">{lead.Fullname}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">
        {String(lead.propertytype)} · {lead.bhk || "—"} BHK
      </p>
      <p className="text-[11px] text-slate-400 mt-1">{lead.Phonenumber}</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {lead.city ? (
          <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">
            {lead.city}
          </span>
        ) : null}
        {lead.platform ? (
          <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 bg-[#eff6ff] text-[#2563eb]">
            {String(lead.platform)}
          </span>
        ) : null}
        {lead.isFuturePotential ? (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
            <Star className="w-3 h-3" strokeWidth={1.8} />
            Future
          </span>
        ) : null}
      </div>
      <div className="mt-2">
        <StatusBadge status={String(lead.leadstatus)} size="sm" />
      </div>
    </button>
  );
}
