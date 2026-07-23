import { Pencil, MessageCircle, Trash2 } from "lucide-react";
import type { Lead } from "../../NewCrmView/types";
import { formatDate } from "../../NewCrmView/types";
import { getOverdueFollowUps } from "../../NewCrmView/types";
import StatusBadge from "./StatusBadge";
import AgentAvatar from "./AgentAvatar";
import { useInteriorsCRM } from "../CRMContext";
import { usePermissionStore } from "@/src/stores/usePermissions";
import toast from "react-hot-toast";
import { openWhatsAppToNumber } from "@/src/utils/openWhatsAppChat";

interface LeadRowProps {
  lead: Lead;
  selected: boolean;
  onToggle: (id: string) => void;
  allLeads: Lead[];
  /** Opens parent confirmation before single-lead delete */
  onDeleteRequest?: (lead: Lead) => void;
}

export default function LeadRow({
  lead,
  selected,
  onToggle,
  allLeads,
  onDeleteRequest,
}: LeadRowProps) {
  const { openLeadDetail, setSelectedLeadId, setLeadFormOpen } = useInteriorsCRM();
  const { hasPermission } = usePermissionStore();

  const overdue = getOverdueFollowUps(allLeads).some((l) => l.id === lead.id);
  const fu = lead.followUpDate ? formatDate(lead.followUpDate) : "—";

  const wa = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!openWhatsAppToNumber(lead.Phonenumber)) {
      toast.error("No valid phone number for WhatsApp.");
    }
  };

  return (
    <tr
      onClick={() => openLeadDetail(lead)}
      className="border-b border-[#f1f5f9] hover:bg-slate-50 cursor-pointer transition-colors duration-150"
    >
      <td
        className="px-3 py-2.5 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(lead.id)}
          className="rounded border-slate-300"
        />
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <AgentAvatar name={lead.Fullname} size={32} className="text-[10px] shrink-0" />
          <div>
            <p className="text-[12.5px] font-semibold text-slate-800 whitespace-nowrap">
              {lead.Fullname}
            </p>
            <p className="text-[10px] text-slate-400 whitespace-nowrap">
              {lead.Phonenumber || "—"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">
        {lead.city || "—"}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">
        {lead.state || "—"}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">
        {String(lead.propertytype || "—")}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">
        {lead.bhk || "—"}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">
        {String(lead.whenToStart || "—")}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <StatusBadge status={String(lead.leadstatus)} />
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-600 whitespace-nowrap">
        {formatDate(lead.createdAt)}
      </td>
      <td
        className={`px-3 py-2.5 text-[12.5px] whitespace-nowrap ${
          overdue ? "text-[#dc2626] font-semibold" : "text-slate-700"
        }`}
      >
        {fu}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-slate-700 whitespace-nowrap">
        {String(lead.platform || "—")}
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {lead.assignedTo ? (
            <>
              <AgentAvatar
                name={lead.assignedTo}
                size={24}
                className="text-[9px] shrink-0"
              />
              <span className="text-[12px] text-slate-700 whitespace-nowrap">
                {lead.assignedTo}
              </span>
            </>
          ) : (
            <span className="text-slate-400 text-[12px]">—</span>
          )}
        </div>
      </td>
      <td
        className="px-3 py-2.5 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!hasPermission("crm", "edit")}
            onClick={() => {
              setSelectedLeadId(lead.id);
              setLeadFormOpen(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-40 transition-all duration-150"
            title="Edit"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={wa}
            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-all duration-150"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
          </button>
          {onDeleteRequest ? (
            <button
              type="button"
              disabled={!hasPermission("crm", "delete")}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(lead);
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-40 transition-all duration-150"
              title="Delete lead"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
