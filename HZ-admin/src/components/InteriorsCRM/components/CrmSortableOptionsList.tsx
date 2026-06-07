"use client";

import { useCallback, useState } from "react";
import {
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import type { CrmSettingsListItem } from "@/src/hooks/useCrmFieldOptions";

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

function displayLabel(row: CrmSettingsListItem) {
  const l = row.label?.trim();
  return l || row.value;
}

type PanelMode = "closed" | "add" | "edit";

export type CrmSortableOptionsListProps = {
  title: string;
  description: string;
  canEdit: boolean;
  items: CrmSettingsListItem[];
  loading: boolean;
  error: string | null;
  onCreate: (dto: {
    value: string;
    label?: string;
    sortOrder?: number;
    isDefault?: boolean;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    dto: {
      value?: string;
      label?: string;
      sortOrder?: number;
      isDefault?: boolean;
    },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  valueLockedWhenBuiltin?: boolean;
};

export default function CrmSortableOptionsList({
  title,
  description,
  canEdit,
  items,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  onSetDefault,
  valueLockedWhenBuiltin = true,
}: CrmSortableOptionsListProps) {
  const [panelMode, setPanelMode] = useState<PanelMode>("closed");
  const [editing, setEditing] = useState<CrmSettingsListItem | null>(null);
  const [valueField, setValueField] = useState("");
  const [labelField, setLabelField] = useState("");
  const [defaultField, setDefaultField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setValueField("");
    setLabelField("");
    setDefaultField(false);
    setPanelMode("add");
  };

  const openEdit = (row: CrmSettingsListItem) => {
    setEditing(row);
    setValueField(row.value);
    setLabelField(row.label?.trim() || "");
    setDefaultField(row.isDefault);
    setPanelMode("edit");
  };

  const closePanel = () => {
    setPanelMode("closed");
    setEditing(null);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    const v = valueField.trim();
    if (panelMode === "add" && !v) {
      toast.error("Value is required (this is what gets stored on the lead).");
      return;
    }
    const label = labelField.trim();
    setSaving(true);
    try {
      if (panelMode === "add") {
        await onCreate({
          value: v,
          ...(label ? { label } : {}),
          sortOrder: items.length,
          ...(defaultField ? { isDefault: true } : {}),
        });
        toast.success("Option added.");
      } else if (panelMode === "edit" && editing) {
        const payload: {
          value?: string;
          label?: string;
          isDefault?: boolean;
        } = {
          label: label || editing.value,
          ...(defaultField ? { isDefault: true } : { isDefault: false }),
        };
        if (!valueLockedWhenBuiltin || !editing.isBuiltin) {
          if (v !== editing.value) payload.value = v;
        } else if (v !== editing.value) {
          toast.error("Built-in values cannot be renamed.");
          return;
        }
        await onUpdate(editing.id, payload);
        toast.success("Option updated.");
      }
      closePanel();
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: CrmSettingsListItem) => {
    if (!canEdit) return;
    if (
      !window.confirm(
        `Delete "${displayLabel(row)}"? Fails if any leads still use this value, or if it is the only option left.`,
      )
    ) {
      return;
    }
    try {
      await onDelete(row.id);
      toast.success("Option removed.");
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const handleDefaultChange = async (row: CrmSettingsListItem) => {
    if (!canEdit || row.isDefault) return;
    try {
      await onSetDefault(row.id);
      toast.success(`"${displayLabel(row)}" is now the default.`);
    } catch (e) {
      toast.error(errMessage(e));
    }
  };

  const reorderLocal = useCallback(
    (fromId: string, toId: string) => {
      if (fromId === toId) return items;
      const next = [...items];
      const fromIdx = next.findIndex((i) => i.id === fromId);
      const toIdx = next.findIndex((i) => i.id === toId);
      if (fromIdx < 0 || toIdx < 0) return items;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    },
    [items],
  );

  const handleDrop = async (targetId: string) => {
    if (!canEdit || !dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const reordered = reorderLocal(dragId, targetId);
    setDragId(null);
    setDragOverId(null);
    setReordering(true);
    try {
      await onReorder(reordered.map((i) => i.id));
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-[12.5px] text-slate-600 max-w-xl">{description}</p>
          {canEdit ? (
            <p className="text-[11px] text-slate-500 mt-1">
              Drag rows to reorder. Dropdowns in add-lead use this order. Check default for the pre-selected value.
            </p>
          ) : null}
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={1.8} />
            Add option
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
              {panelMode === "add" ? `New ${title.toLowerCase()}` : `Edit ${title.toLowerCase()}`}
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
                disabled={
                  panelMode === "edit" &&
                  valueLockedWhenBuiltin &&
                  !!editing?.isBuiltin
                }
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
            <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer">
              <input
                type="checkbox"
                checked={defaultField}
                onChange={(e) => setDefaultField(e.target.checked)}
                className="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
              />
              <span className="text-[12.5px] text-slate-700">
                Default selection when adding a new lead
              </span>
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
        {loading && !items.length ? (
          <li className="flex items-center justify-center gap-2 px-4 py-8 text-slate-500 text-[13px]">
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.8} />
            Loading…
          </li>
        ) : null}
        {!loading && !items.length ? (
          <li className="px-4 py-6 text-center text-[13px] text-slate-500">
            No options configured yet.
          </li>
        ) : null}
        {reordering ? (
          <li className="px-4 py-2 text-[11px] text-slate-500 bg-slate-50 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Saving order…
          </li>
        ) : null}
        {items.map((row) => (
          <li
            key={row.id}
            draggable={canEdit}
            onDragStart={() => setDragId(row.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragOverId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverId(row.id);
            }}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              void handleDrop(row.id);
            }}
            className={`flex items-center justify-between gap-3 px-3 py-2.5 transition-colors duration-150 ${
              dragOverId === row.id ? "bg-blue-50" : "bg-white hover:bg-slate-50"
            } ${dragId === row.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {canEdit ? (
                <span
                  className="text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" strokeWidth={1.8} />
                </span>
              ) : null}
              <label className="flex items-center gap-2 shrink-0 cursor-pointer" title="Default for new leads">
                <input
                  type="checkbox"
                  checked={row.isDefault}
                  disabled={!canEdit}
                  onChange={() => void handleDefaultChange(row)}
                  className="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
                />
              </label>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-medium text-slate-800 truncate">
                    {displayLabel(row)}
                  </span>
                  {row.isDefault ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Default
                    </span>
                  ) : null}
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
                </p>
              </div>
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
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => void handleDelete(row)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-all duration-150"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
