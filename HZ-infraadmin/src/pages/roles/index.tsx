import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { RbacPageChrome } from '@/components/infra-admin/RbacPageChrome';
import { Modal } from '@/components/ui/Modal';
import {
  INFRA_ADMIN_RESOURCES,
  buildEmptyPermissions,
  buildFullPermissions,
  type InfraPermissionRow,
} from '@/lib/infra-admin-resources';
import { ROLE_SUPER_ID, useInfraOrgStore } from '@/stores/useInfraOrgStore';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';

function newId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function togglePerm(
  rows: InfraPermissionRow[],
  resource: string,
  action: keyof Pick<InfraPermissionRow, 'create' | 'view' | 'edit' | 'delete'>,
): InfraPermissionRow[] {
  return rows.map((p) =>
    p.resource === resource ? { ...p, [action]: !p[action] } : p,
  );
}

export default function InfraRolesPage() {
  const roles = useInfraOrgStore((s) => s.roles);
  const upsertRole = useInfraOrgStore((s) => s.upsertRole);
  const removeRole = useInfraOrgStore((s) => s.removeRole);
  const canManage = useInfraPermissionStore((s) => s.hasPermission('roles', 'edit'));

  const sorted = useMemo(
    () => [...roles].sort((a, b) => a.name.localeCompare(b.name)),
    [roles],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => {
    const fallback = sorted[0]?.id ?? null;
    const id = selectedId ?? fallback;
    if (!id) return undefined;
    return sorted.find((r) => r.id === id) ?? sorted[0];
  }, [sorted, selectedId]);

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const openCreate = () => {
    setNewName('');
    setNewDesc('');
    setOpen(true);
  };

  const createRole = () => {
    if (!newName.trim()) {
      toast.error('Role name is required');
      return;
    }
    const id = newId('role');
    upsertRole({
      id,
      name: newName.trim(),
      description: newDesc.trim() || undefined,
      permissions: buildEmptyPermissions(),
    });
    setSelectedId(id);
    toast.success('Role created');
    setOpen(false);
  };

  const persistMatrix = (next: InfraPermissionRow[]) => {
    if (!selected) return;
    if (selected.id === ROLE_SUPER_ID) return;
    upsertRole({
      id: selected.id,
      name: selected.name,
      description: selected.description,
      permissions: next,
      createdAt: selected.createdAt,
    });
  };

  const setAllForResource = (resource: string, value: boolean) => {
    if (!selected || selected.id === ROLE_SUPER_ID) return;
    const next = selected.permissions.map((p) =>
      p.resource === resource
        ? { ...p, create: value, view: value, edit: value, delete: value }
        : p,
    );
    persistMatrix(next);
  };

  return (
    <AdminLayout title="Roles & permissions" subtitle="Fine-grained access by resource (persisted on the server).">
      <RbacPageChrome
        title="Roles & permissions"
        subtitle="Super Admin is fully provisioned and locked. Other roles can be edited and assigned on the Users page."
        actions={
          canManage ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-hz-blue px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:bg-hz-blue-hover"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              New role
            </motion.button>
          ) : null
        }
      >
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-2">
            {sorted.map((r, idx) => {
              const active = selected?.id === r.id;
              return (
                <motion.button
                  key={r.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.18 }}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedId(r.id)}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                    active
                      ? 'border-hz-blue bg-hz-blue-light/70 shadow-sm'
                      : 'border-border bg-hzwhite hover:border-hz-blue/35',
                  ].join(' ')}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                    <Shield className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-montserrat text-sm font-bold text-charcoal">{r.name}</div>
                    <div className="truncate font-inter text-[11px] text-muted">
                      {r.id === ROLE_SUPER_ID ? 'All permissions' : `${r.permissions.filter((p) => p.view).length} resources with view`}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </aside>

          <section className="min-w-0 rounded-2xl border border-border bg-hzwhite p-4 shadow-sm sm:p-5">
            {!selected ? (
              <p className="font-inter text-sm text-muted">No roles yet.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="font-montserrat text-xl font-extrabold text-charcoal">{selected.name}</h2>
                    {selected.description ? (
                      <p className="mt-1 max-w-2xl font-inter text-sm text-muted">{selected.description}</p>
                    ) : (
                      <p className="mt-1 font-inter text-sm text-muted">No description</p>
                    )}
                  </div>
                  {canManage && selected.id !== ROLE_SUPER_ID ? (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        removeRole(selected.id);
                        setSelectedId(null);
                        toast.success('Role removed');
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 font-montserrat text-[11px] font-bold uppercase tracking-wide text-hz-red/80 hover:border-hz-red/30"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      Delete role
                    </motion.button>
                  ) : null}
                </div>

                {selected.id === ROLE_SUPER_ID ? (
                  <div className="mt-4 rounded-xl border border-hz-blue/25 bg-hz-blue-light/40 p-4 font-inter text-sm text-charcoal">
                    Super Admin always has full create / view / edit / delete across every resource. This matrix is
                    fixed for parity with HZ-admin.
                  </div>
                ) : null}

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-offwhite">
                        <th className="px-2 py-2 font-montserrat text-[10px] font-bold uppercase text-muted">Resource</th>
                        {(['create', 'view', 'edit', 'delete'] as const).map((a) => (
                          <th key={a} className="px-2 py-2 text-center font-montserrat text-[10px] font-bold uppercase text-muted">
                            {a}
                          </th>
                        ))}
                        <th className="px-2 py-2 text-center font-montserrat text-[10px] font-bold uppercase text-muted">
                          Row
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {INFRA_ADMIN_RESOURCES.map((res, i) => {
                        const row = selected.permissions.find((p) => p.resource === res);
                        const locked = selected.id === ROLE_SUPER_ID;
                        const cells = row
                          ? (['create', 'view', 'edit', 'delete'] as const).map((a) => (
                              <td key={a} className="px-2 py-2 text-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-hz-blue"
                                  checked={!!row[a]}
                                  disabled={locked || !canManage}
                                  onChange={() => persistMatrix(togglePerm(selected.permissions, res, a))}
                                />
                              </td>
                            ))
                          : null;
                        return (
                          <motion.tr
                            key={res}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.015, duration: 0.16 }}
                            className="border-b border-border last:border-b-0 hover:bg-offwhite/70"
                          >
                            <td className="px-2 py-2 font-mono text-[12px] font-medium text-charcoal">{res}</td>
                            {cells}
                            <td className="px-2 py-2 text-center">
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                disabled={locked || !canManage}
                                onClick={() => {
                                  const allOn = row
                                    ? row.create && row.view && row.edit && row.delete
                                    : false;
                                  setAllForResource(res, !allOn);
                                }}
                                className="rounded-md border border-border bg-white px-2 py-1 font-montserrat text-[9px] font-bold uppercase tracking-wide text-muted hover:border-hz-blue/40 hover:text-hz-blue disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                All
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {canManage && selected.id !== ROLE_SUPER_ID ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => persistMatrix(buildFullPermissions())}
                      className="rounded-lg border border-border bg-offwhite px-3 py-2 font-montserrat text-[11px] font-bold uppercase tracking-wide text-charcoal hover:border-hz-blue/40"
                    >
                      Grant all
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => persistMatrix(buildEmptyPermissions())}
                      className="rounded-lg border border-border bg-white px-3 py-2 font-montserrat text-[11px] font-bold uppercase tracking-wide text-muted hover:border-hz-blue/40"
                    >
                      Clear all
                    </motion.button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </RbacPageChrome>

      <Modal open={open} onClose={() => setOpen(false)} title="New role">
        <div className="space-y-3 font-inter text-sm">
          <label className="block">
            <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
              Name
            </span>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
              Description (optional)
            </span>
            <textarea
              className="min-h-[88px] w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </label>
          <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border bg-white px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-muted hover:bg-offwhite"
            >
              Cancel
            </button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createRole}
              className="rounded-lg bg-hz-blue px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-white hover:bg-hz-blue-hover"
            >
              Create
            </motion.button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
