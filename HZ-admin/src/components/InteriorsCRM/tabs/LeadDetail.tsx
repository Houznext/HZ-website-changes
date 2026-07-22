"use client";

import { useEffect, useMemo, useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Pencil, Star } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/src/utils/apiClient";
import { openWhatsAppToNumber } from "@/src/utils/openWhatsAppChat";
import { usePermissionStore } from "@/src/stores/usePermissions";
import LeadTimelineStepper from "../../CrmView/LeadTimelineStepper";
import LeadStatusSelect from "../../NewCrmView/LeadStatusSelect";
import { formatDateTime, formatDate } from "../../NewCrmView/types";
import { useInteriorsCRM } from "../CRMContext";
import StatusBadge from "../components/StatusBadge";
import Button from "@/src/common/Button";

type Step = { status: string; at?: string; changedBy?: string };

export default function LeadDetail() {
  const {
    selectedLead,
    closeLeadDetail,
    allLeads,
    updateLead,
    branchUsers,
    setLeadFormOpen,
    setSelectedLeadId,
  } = useInteriorsCRM();
  const { hasPermission } = usePermissionStore();

  const lead = useMemo(() => {
    if (!selectedLead) return null;
    return allLeads.find((l) => l.id === selectedLead.id) || selectedLead;
  }, [allLeads, selectedLead]);

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [assignDraft, setAssignDraft] = useState("");
  const [followDate, setFollowDate] = useState("");
  const [followTime, setFollowTime] = useState("");
  const [logTab, setLogTab] = useState<"note" | "call" | "fu" | "visit">("note");
  const [logText, setLogText] = useState("");

  useEffect(() => {
    if (!lead?.id) return;
    setStatusDraft(String(lead.leadstatus));
    setAssignDraft(
      branchUsers.find((u) => u.name === lead.assignedTo)?.id || "",
    );
    if (lead.followUpDate) {
      const d = new Date(lead.followUpDate);
      if (!Number.isNaN(d.getTime())) {
        setFollowDate(d.toISOString().slice(0, 10));
        setFollowTime(d.toTimeString().slice(0, 5));
      }
    } else {
      setFollowDate("");
      setFollowTime("");
    }
  }, [lead?.id, lead?.leadstatus, lead?.assignedTo, lead?.followUpDate, branchUsers]);

  useEffect(() => {
    if (!lead?.id) return;
    void apiClient
      .get(`${apiClient.URLS.crmlead}/${lead.id}/timeline`, { branchId: lead.branchId }, true)
      .then((res: { status?: number; body?: { steps?: Step[]; currentStatus?: string } }) => {
        if (res.status === 200 && res.body) {
          setSteps(res.body.steps || []);
          setCurrentStatus(res.body.currentStatus || String(lead.leadstatus));
        }
      })
      .catch(() => {});
  }, [lead?.id, lead?.branchId, lead?.leadstatus]);

  if (!lead) {
    return (
      <p className="text-slate-500 text-[13px]">No lead selected.</p>
    );
  }

  const initials = (lead.Fullname || "L")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveStatusAssign = async () => {
    const patch: Record<string, unknown> = { leadstatus: statusDraft };
    if (assignDraft) {
      const u = branchUsers.find((x) => x.id === assignDraft);
      if (u) patch.assignedTo = u.name;
    }
    await updateLead(lead.id, patch as any);
    toast.success("Saved");
  };

  const saveFollowUp = async () => {
    if (!followDate) return;
    const iso = new Date(`${followDate}T${followTime || "09:00"}:00`).toISOString();
    await updateLead(lead.id, { followUpDate: iso } as any);
    toast.success("Follow-up saved");
  };

  const whatsapp = () => {
    if (!openWhatsAppToNumber(lead.Phonenumber)) {
      toast.error("Add a valid phone number to open WhatsApp.");
    }
  };

  const sms = async () => {
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.crmlead}/bulk-send`,
        { leadIds: [lead.id], channel: "sms", branchId: lead.branchId },
        true,
      );
      if (res?.body?.sent) toast.success("SMS sent");
    } catch {
      toast.error("SMS failed");
    }
  };

  const grid = [
    { label: "Service type", value: String(lead.serviceType || "—") },
    { label: "Property type", value: String(lead.propertytype || "—") },
    { label: "When to start", value: String(lead.whenToStart || "—") },
    { label: "BHK", value: lead.bhk || "—" },
    { label: "Platform", value: String(lead.platform || "—") },
    { label: "City", value: lead.city || "—" },
    { label: "State", value: lead.state || "—" },
    { label: "Apartment", value: lead.apartmentName || "—" },
    { label: "Area", value: lead.areaName || "—" },
    { label: "House No.", value: lead.houseNo || "—" },
    { label: "Pincode", value: lead.pincode || "—" },
    { label: "Lead ID", value: `#${lead.id}` },
    { label: "Created at", value: formatDateTime(lead.createdAt) },
  ];

  const history = steps.map((s, i) => ({
    id: String(i),
    icon: "🔄",
    text: `Status: ${s.status}`,
    at: s.at || "",
    who: s.changedBy || "",
  }));

  return (
    <div className="space-y-4">
      <nav className="text-[12px] text-slate-500">
        <button
          type="button"
          className="text-[#2563eb] font-semibold hover:underline transition-all duration-150"
          onClick={closeLeadDetail}
        >
          All Leads
        </button>
        <span className="mx-1.5">›</span>
        <span className="text-slate-800 font-medium">
          {lead.Fullname} — #{lead.id}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h1 className="font-head text-[18px] font-extrabold text-[#1e293b]">
                    {lead.Fullname}
                  </h1>
                  <div className="flex flex-wrap gap-3 mt-2 text-[12px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-4 h-4" strokeWidth={1.8} />
                      {lead.Phonenumber}
                    </span>
                    {lead.email ? (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-4 h-4" strokeWidth={1.8} />
                        {lead.email}
                      </span>
                    ) : null}
                    {lead.city ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" strokeWidth={1.8} />
                        {lead.city}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge status={String(lead.leadstatus)} />
                    {lead.isFuturePotential ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold rounded-full px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                        <Star className="w-3.5 h-3.5" strokeWidth={1.8} />
                        Future Potential
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => whatsapp()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-[12px] font-semibold hover:bg-green-700 transition-all duration-150"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => void sms()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563eb] text-white text-[12px] font-semibold hover:bg-blue-700 transition-all duration-150"
                >
                  <Phone className="w-4 h-4" strokeWidth={1.8} />
                  Call / SMS
                </button>
                <button
                  type="button"
                  disabled={!hasPermission("crm", "edit")}
                  onClick={() => {
                    setSelectedLeadId(lead.id);
                    setLeadFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] text-slate-700 text-[12px] font-semibold hover:bg-slate-50 disabled:opacity-40 transition-all duration-150"
                >
                  <Pencil className="w-4 h-4" strokeWidth={1.8} />
                  Edit
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm overflow-x-auto">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
              Timeline
            </p>
            <LeadTimelineStepper
              steps={steps}
              currentStatus={currentStatus || String(lead.leadstatus)}
              showTimes
            />
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-3">
              Property & lead info
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {grid.map((cell) => (
                <div key={cell.label} className="bg-slate-50 rounded-[9px] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                    {cell.label}
                  </p>
                  <p className="text-[13px] font-semibold text-[#1e293b] mt-1 break-words">
                    {cell.value}
                  </p>
                </div>
              ))}
            </div>
            {lead.review ? (
              <div className="mt-3 bg-[#fffbeb] border border-[#fef3c7] rounded-[9px] p-3 text-[12.5px] text-slate-800">
                {lead.review}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-1 bg-[#f1f5f9] p-[3px] rounded-[9px] mb-3">
              {(
                [
                  ["note", "Add note"],
                  ["call", "Log call"],
                  ["fu", "Set follow-up"],
                  ["visit", "Site visit"],
                ] as const
              ).map(([k, lab]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLogTab(k)}
                  className={`px-3 py-1.5 rounded-[7px] text-[11px] font-medium transition-all duration-150 ${
                    logTab === k
                      ? "bg-white text-[#2563eb] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lab}
                </button>
              ))}
            </div>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-[#e2e8f0] p-3 text-[13px] text-slate-800"
              placeholder="Enter details…"
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
            />
            <Button
              className="mt-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white text-[12px] font-semibold"
              onClick={async () => {
                if (!logText.trim()) return;
                await updateLead(lead.id, { review: `${lead.review || ""}\n${logText}`.trim() } as any);
                setLogText("");
                toast.success("Saved");
              }}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[82px]">
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm space-y-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400">
              Status & assignment
            </p>
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500">Status</p>
              <LeadStatusSelect
                value={statusDraft}
                onChange={setStatusDraft}
                variant="full"
                disabled={!hasPermission("crm", "edit")}
              />
              <p className="text-[11px] text-slate-500 pt-2">Assigned to</p>
              <select
                className="w-full rounded-lg border border-[#e2e8f0] px-2 py-2 text-[13px]"
                value={assignDraft}
                onChange={(e) => setAssignDraft(e.target.value)}
                disabled={!hasPermission("crm", "edit")}
              >
                <option value="">—</option>
                {branchUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void saveStatusAssign()}
                disabled={!hasPermission("crm", "edit")}
                className="w-full py-2 rounded-lg bg-[#2563eb] text-white text-[12px] font-semibold disabled:opacity-40 transition-all duration-150"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm space-y-2">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400">
              Next follow-up
            </p>
            <input
              type="date"
              className="w-full rounded-lg border border-[#e2e8f0] px-2 py-2 text-[13px]"
              value={followDate}
              onChange={(e) => setFollowDate(e.target.value)}
            />
            <input
              type="time"
              className="w-full rounded-lg border border-[#e2e8f0] px-2 py-2 text-[13px]"
              value={followTime}
              onChange={(e) => setFollowTime(e.target.value)}
            />
            <button
              type="button"
              onClick={() => void saveFollowUp()}
              className="w-full py-2 rounded-lg bg-slate-900 text-white text-[12px] font-semibold transition-all duration-150"
            >
              Save follow-up
            </button>
          </div>

          <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm max-h-[360px] overflow-y-auto">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-2">
              Activity history
            </p>
            <ul className="space-y-2">
              {history.length ? (
                history.map((h) => (
                  <li key={h.id} className="text-[12px] text-slate-700 border-b border-[#f1f5f9] pb-2">
                    <span className="mr-1">{h.icon}</span>
                    {h.text}
                    {h.who ? <span className="text-slate-400"> · {h.who}</span> : null}
                    <p className="text-[11px] text-slate-400">{formatDateTime(h.at)}</p>
                  </li>
                ))
              ) : (
                <li className="text-[12px] text-slate-500">No timeline entries.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
