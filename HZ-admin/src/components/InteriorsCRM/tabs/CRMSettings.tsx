"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { usePermissionStore } from "@/src/stores/usePermissions";
import {
  useCrmLeadStatusDefinitions,
  type CrmLeadStatusDefinition,
} from "@/src/hooks/useCrmLeadStatusDefinitions";

function errMessage(e: unknown): string {
  if (e && typeof e === "object" && "body" in e) {
    const body = (e as { body?: { message?: unknown } }).body;
    const m = body?.message;
    if (typeof m === "string") return m;
    if (Array.isArray(m)) return m.join(", ");
  }
  if (e instanceof Error) return e.message;
  return "Request failed";
}

function displayLabel(row: CrmLeadStatusDefinition) {
  const l = row.label?.trim();
  return l || row.value;
}

type PanelMode = "closed" | "add" | "edit";

export default function CRMSettings() {
  const { hasPermission } = usePermissionStore();
  const canEdit = hasPermission("crm", "edit");
  const { items, loading, error, create, update, delete: deleteDef } =
    useCrmLeadStatusDefinitions();

  const [panelMode, setPanelMode] = useState<PanelMode>("closed");
  const [editing, setEditing] = useState<CrmLeadStatusDefinition | null>(null);
  const [valueField, setValueField] = useState("");
  const [labelField, setLabelField] = useState("");
  const [sortField, setSortField] = useState("");
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.value.localeCompare(b.value),
      ),
    [items],
  );

  const openAdd = () => {
    setEditing(null);
    setValueField("");
    setLabelField("");
    const next =
      items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) + 1 : 0;
    setSortField(String(next));
    setPanelMode("add");
  };

  const openEdit = (row: CrmLeadStatusDefinition) => {
    setEditing(row);
    setValueField(row.value);
    setLabelField(row.label?.trim() || "");
    setSortField(String(row.sortOrder));
    setPanelMode("edit");
  };

  const closePanel = () => {
    setPanelMode("closed");
    setEditing(null);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    const v = valueField.trim();
    const sortOrder = parseInt(sortField, 10);
    if (panelMode === "add") {
      if (!v) {
        toast.error("Value is required (this is what gets stored on the lead).");
        return;
      }
    }
    if (Number.isNaN(sortOrder) || sortOrder < 0) {
      toast.error("Sort order must be a non-negative integer.");
      return;
    }
    const label = labelField.trim();
    setSaving(true);
    try {
      if (panelMode === "add") {
        await create({
          value: v,
          ...(label ? { label } : {}),
          sortOrder,
        });
        toast.success("Status added.");
      } else if (panelMode === "edit" && editing) {
        const payload: { value?: string; label?: string; sortOrder?: number } = {
          sortOrder,
          label: labelField.trim() || editing.value,
        };
        if (!editing.isBuiltin && v !== editing.value) {
          payload.value = v;
        }
        await update(editing.id, payload);
        toast.success("Status updated.");
      }
      closePanel();
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: CrmLeadStatusDefinition) => {
    if (!canEdit || row.isBuiltin) return;
    if (
      !window.confirm(
        `Delete status "${displayLabel(row)}"? This only works if no leads use this value.`,
      )
    ) {
      return;
    }
    try {
      await deleteDef(row.id);
      toast.success("Status removed.");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-1">
            Lead statuses
          </p>
          <p className="text-[12.5px] text-slate-600 max-w-xl">
            Values are stored on leads and used in reports. You can change labels and order anytime;
            changing the stored value is only allowed for custom statuses and only when no lead
            still uses the old value.
          </p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            Add status
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      {panelMode !== "closed" ? (
        <div className="rounded-xl border border-[#2563eb]/25 bg-blue-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-slate-800">
              {panelMode === "add" ? "New status" : "Edit status"}
            </p>
            <button
              type="button"
              onClick={closePanel}
              className="p-1 rounded-lg text-slate-500 hover:bg-white/80"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Value (stored on lead)
              </span>
              <input
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] text-slate-800 disabled:bg-slate-100"
                value={valueField}
                onChange={(e) => setValueField(e.target.value)}
                disabled={panelMode === "edit" && !!editing?.isBuiltin}
                placeholder="e.g. Qualified — revisit"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Label (optional)
              </span>
              <input
                className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] text-slate-800"
                value={labelField}
                onChange={(e) => setLabelField(e.target.value)}
                placeholder="Shown in lists; defaults to value"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Sort order
              </span>
              <input
                type="number"
                min={0}
                className="w-full max-w-[200px] rounded-lg border border-[#e2e8f0] px-3 py-2 text-[13px] text-slate-800"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || !canEdit}
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] text-white px-4 py-2 text-[12.5px] font-semibold shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save
            </button>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <ul className="divide-y divide-[#f1f5f9] border border-[#e2e8f0] rounded-xl overflow-hidden">
        {loading && !sorted.length ? (
          <li className="flex items-center justify-center gap-2 px-4 py-8 text-slate-500 text-[13px]">
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.8} />
            Loading statuses…
          </li>
        ) : null}
        {!loading && !sorted.length ? (
          <li className="px-4 py-6 text-center text-[13px] text-slate-500">
            No statuses returned. Check your connection or CRM permissions.
          </li>
        ) : null}
        {sorted.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 transition-colors duration-150"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] font-medium text-slate-800 truncate">
                  {displayLabel(row)}
                </span>
                {row.isBuiltin ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Built-in
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Value: <span className="font-mono">{row.value}</span>
                <span> · order {row.sortOrder}</span>
              </p>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => openEdit(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 disabled:opacity-40 transition-all duration-150"
                title="Edit"
              >
                <Pencil className="w-4 h-4" strokeWidth={1.8} />
              </button>
              {!row.isBuiltin ? (
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleDelete(row)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-all duration-150"
                  title="Delete custom status"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
