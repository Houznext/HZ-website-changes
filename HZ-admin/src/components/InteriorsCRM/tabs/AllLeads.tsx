"use client";

import { useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { Download, Search, Trash2, X } from "lucide-react";
import { useInteriorsCRM } from "../CRMContext";
import LeadRow from "../components/LeadRow";
import { LEAD_STATUSES, PLATFORMS, PROPERTY_TYPES, WHEN_TO_START_OPTIONS } from "../constants";
import { headers } from "../../NewCrmView/types";
import type { Lead } from "../../NewCrmView/types";
import { useCrmLeadStatusDefinitions } from "@/src/hooks/useCrmLeadStatusDefinitions";
import { useCrmFieldOptions } from "@/src/hooks/useCrmFieldOptions";

const CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Mumbai"] as const;

type LeadSortOption = "name-asc" | "date-asc" | "date-desc";

const SORT_OPTIONS: { value: LeadSortOption; label: string }[] = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "date-desc", label: "Date added (newest)" },
  { value: "date-asc", label: "Date added (oldest)" },
];

function sortLeads(rows: Lead[], sortBy: LeadSortOption): Lead[] {
  const copy = [...rows];
  if (sortBy === "name-asc") {
    copy.sort((a, b) =>
      String(a.Fullname || "").localeCompare(String(b.Fullname || ""), undefined, {
        sensitivity: "base",
      }),
    );
  } else if (sortBy === "date-asc") {
    copy.sort(
      (a, b) =>
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
    );
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );
  }
  return copy;
}

const WON = new Set(["Won", "completed"]);
const LOST = new Set([
  "Not Interested",
  "Rejected",
  "Lost",
  "Closed",
  "Wrong Number",
  "DND",
]);

function countSegment(
  rows: { leadstatus?: string; isFuturePotential?: boolean }[],
  seg: "all" | "active" | "followup" | "future" | "won" | "lost",
) {
  if (seg === "all") return rows.length;
  if (seg === "active") {
    return rows.filter((l) => {
      const s = String(l.leadstatus || "");
      return !WON.has(s) && !LOST.has(s);
    }).length;
  }
  if (seg === "followup") return rows.filter((l) => String(l.leadstatus) === "Follow-up").length;
  if (seg === "future") return rows.filter((l) => l.isFuturePotential === true).length;
  if (seg === "won") return rows.filter((l) => WON.has(String(l.leadstatus))).length;
  if (seg === "lost") return rows.filter((l) => LOST.has(String(l.leadstatus))).length;
  return rows.length;
}

export default function AllLeads() {
  const {
    allLeads,
    filteredLeads,
    barFilteredLeads,
    searchQuery,
    setSearchQuery,
    barStatus,
    setBarStatus,
    barPlatform,
    setBarPlatform,
    barPropertyType,
    setBarPropertyType,
    barWhenToStart,
    setBarWhenToStart,
    barCity,
    setBarCity,
    datePreset,
    setDatePreset,
    customDateRange,
    setCustomDateRange,
    tableSegment,
    setTableSegment,
    deleteLeadsBulk,
    deleteLead,
    assignLead,
    branchUsers,
    refetch,
    selectedLead,
    closeLeadDetail,
  } = useInteriorsCRM();

  const { items: statusDefItems } = useCrmLeadStatusDefinitions();
  const { items: platformDefItems } = useCrmFieldOptions("platform");
  const platformFilterOptions = useMemo(() => {
    if (platformDefItems.length > 0) {
      return platformDefItems.map((p) => p.value);
    }
    return [...PLATFORMS];
  }, [platformDefItems]);
  const statusFilterOptions = useMemo(() => {
    if (statusDefItems.length > 0) {
      return [...statusDefItems]
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.value.localeCompare(b.value),
        )
        .map((d) => ({
          value: d.value,
          label: d.label?.trim() || d.value,
        }));
    }
    return LEAD_STATUSES.map((s) => ({ value: s, label: s }));
  }, [statusDefItems]);

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [sortBy, setSortBy] = useState<LeadSortOption>("date-desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAgent, setBulkAgent] = useState("");
  const [leadPendingDelete, setLeadPendingDelete] = useState<Lead | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const sortedLeads = useMemo(
    () => sortLeads(filteredLeads, sortBy),
    [filteredLeads, sortBy],
  );

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const pageRows = sortedLeads.slice((page - 1) * pageSize, page * pageSize);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selected.length === pageRows.length && pageRows.length > 0) setSelected([]);
    else setSelected(pageRows.map((l) => l.id));
  };

  const tabs: { id: typeof tableSegment; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "followup", label: "Follow-up" },
    { id: "future", label: "Future Potential" },
    { id: "won", label: "Won" },
    { id: "lost", label: "Lost / Closed" },
  ];

  const applyBulkAssign = async () => {
    if (!bulkAgent) return;
    for (const id of selected) {
      await assignLead(id, bulkAgent);
    }
    setSelected([]);
    setBulkAgent("");
    await refetch();
  };

  const confirmDeleteOne = async () => {
    if (!leadPendingDelete) return;
    setDeleteBusy(true);
    try {
      const ok = await deleteLead(leadPendingDelete.id);
      if (ok) {
        if (selectedLead?.id === leadPendingDelete.id) {
          closeLeadDetail();
        }
        setSelected((s) => s.filter((x) => x !== leadPendingDelete.id));
        setLeadPendingDelete(null);
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.8} />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#e2e8f0] text-[13px] text-slate-800 placeholder:text-slate-400"
              placeholder="Search name, phone, city…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={barStatus}
            onChange={(e) => {
              setBarStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {statusFilterOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={barPlatform}
            onChange={(e) => {
              setBarPlatform(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All platforms</option>
            {platformFilterOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={barPropertyType}
            onChange={(e) => {
              setBarPropertyType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All property types</option>
            {PROPERTY_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={barWhenToStart}
            onChange={(e) => {
              setBarWhenToStart(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">When to start</option>
            {WHEN_TO_START_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={barCity}
            onChange={(e) => {
              setBarCity(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={datePreset}
            onChange={(e) => {
              setDatePreset(e.target.value as typeof datePreset);
              setPage(1);
            }}
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="custom">Custom</option>
          </select>
          {datePreset === "custom" ? (
            <>
              <input
                type="date"
                className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12px]"
                value={customDateRange.start}
                onChange={(e) =>
                  setCustomDateRange((p) => ({ ...p, start: e.target.value }))
                }
              />
              <input
                type="date"
                className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12px]"
                value={customDateRange.end}
                onChange={(e) =>
                  setCustomDateRange((p) => ({ ...p, end: e.target.value }))
                }
              />
            </>
          ) : null}
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-2 text-[12.5px] text-slate-700"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as LeadSortOption);
              setPage(1);
            }}
            aria-label="Sort leads"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <CSVLink
            data={sortedLeads}
            headers={headers}
            filename="crm-leads.csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] px-3 py-2 text-[12.5px] font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-150"
          >
            <Download className="w-4 h-4" strokeWidth={1.8} />
            Export CSV
          </CSVLink>
        </div>
      </div>

      <div className="bg-[#f1f5f9] p-[3px] rounded-[9px] flex flex-wrap gap-0.5">
        {tabs.map((t) => {
          const active = tableSegment === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTableSegment(t.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium transition-all duration-150 ${
                active
                  ? "bg-white text-[#2563eb] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label} ({countSegment(barFilteredLeads, t.id)})
            </button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3">
          <span className="text-[12.5px] text-slate-600">{selected.length} selected</span>
          <select
            className="rounded-lg border border-[#e2e8f0] px-2 py-1.5 text-[12px]"
            value={bulkAgent}
            onChange={(e) => setBulkAgent(e.target.value)}
          >
            <option value="">Assign to…</option>
            {branchUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="text-[12px] font-semibold text-[#2563eb] px-2 py-1 rounded-lg hover:bg-blue-50 transition-all duration-150"
            onClick={() => void applyBulkAssign()}
          >
            Apply assign
          </button>
          <button
            type="button"
            onClick={() => void deleteLeadsBulk(selected)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-all duration-150"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.8} />
            Delete selected
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-[#e2e8f0] bg-white shadow-sm">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-max min-w-full border-collapse table-auto">
            <thead>
              <tr className="bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-500 border-b border-[#e2e8f0]">
                <th className="text-left px-3 py-2.5 w-10 whitespace-nowrap sticky left-0 z-20 bg-[#f8fafc]">
                  <input
                    type="checkbox"
                    checked={
                      pageRows.length > 0 && selected.length === pageRows.length
                    }
                    onChange={toggleAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap sticky left-10 z-20 bg-[#f8fafc] min-w-[160px]">
                  Lead
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[110px]">
                  City
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[110px]">
                  State
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[120px]">
                  Property
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[72px]">
                  BHK
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[130px]">
                  When to Start
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[120px]">
                  Status
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[110px]">
                  Added
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[110px]">
                  Follow Up
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[120px]">
                  Platform
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap min-w-[140px]">
                  Assigned To
                </th>
                <th className="text-left px-3 py-2.5 whitespace-nowrap sticky right-0 z-20 bg-[#f8fafc] min-w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  selected={selected.includes(lead.id)}
                  onToggle={toggle}
                  allLeads={allLeads}
                  onDeleteRequest={(l) => setLeadPendingDelete(l)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-[#e2e8f0] text-[12px] text-slate-600">
          <span>
            Showing {sortedLeads.length === 0 ? 0 : (page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, sortedLeads.length)} of {sortedLeads.length}{" "}
            leads
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded-lg border border-[#e2e8f0] disabled:opacity-40 transition-all duration-150"
            >
              Prev
            </button>
            <span className="text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded-lg border border-[#e2e8f0] disabled:opacity-40 transition-all duration-150"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {leadPendingDelete ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/45"
          role="presentation"
          onClick={() => !deleteBusy && setLeadPendingDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
            className="w-full max-w-md rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2
                id="delete-lead-title"
                className="text-[16px] font-bold text-slate-900 font-head"
              >
                Delete this lead?
              </h2>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setLeadPendingDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Close"
              >
                <X className="w-5 h-5" strokeWidth={1.8} />
              </button>
            </div>
            <p className="text-[13px] text-slate-600 mb-1">
              This cannot be undone. A notification email will be sent with the lead
              details.
            </p>
            <p className="text-[13px] font-semibold text-slate-800 mb-4">
              {leadPendingDelete.Fullname}{" "}
              <span className="font-normal text-slate-500">
                · {leadPendingDelete.Phonenumber}
              </span>
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setLeadPendingDelete(null)}
                className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => void confirmDeleteOne()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {deleteBusy ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
