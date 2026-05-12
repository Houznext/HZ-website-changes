import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, KeyRound, Pencil, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { RbacPageChrome } from '@/components/infra-admin/RbacPageChrome';
import { Modal } from '@/components/ui/Modal';
import { ROLE_SUPER_ID, useInfraOrgStore, type InfraOrgUser } from '@/stores/useInfraOrgStore';
import { STATIC_INFRA_ADMIN_EMAIL } from '@/lib/infra-admin-static-session';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';
import {
  INFRA_ORG_LEGACY_LS_KEY,
  readLegacyOrgFromLocalStorage,
} from '@/lib/infra-admin-legacy-localStorage';

function newId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function InfraUsersPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SuperAdmin';
  const users = useInfraOrgStore((s) => s.users);
  const branches = useInfraOrgStore((s) => s.branches);
  const roles = useInfraOrgStore((s) => s.roles);
  const loginReady = useInfraOrgStore((s) => s.loginReady);
  const hydrated = useInfraOrgStore((s) => s.hydrated);
  const upsertUser = useInfraOrgStore((s) => s.upsertUser);
  const removeUser = useInfraOrgStore((s) => s.removeUser);
  const flushNow = useInfraOrgStore((s) => s.flushNow);
  const hydrate = useInfraOrgStore((s) => s.hydrate);
  const canManage = useInfraPermissionStore((s) => s.canManageUsers());

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.email.localeCompare(b.email)),
    [users],
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InfraOrgUser | null>(null);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    branchId: '',
    roleIds: [] as string[],
    isActive: true,
    password: '',
    confirmPassword: '',
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      branchId: branches[0]?.id ?? '',
      roleIds: roles.filter((r) => r.id !== ROLE_SUPER_ID).slice(0, 1).map((r) => r.id),
      isActive: true,
      password: '',
      confirmPassword: '',
    });
    setOpen(true);
  };

  const openEdit = (u: InfraOrgUser) => {
    setEditing(u);
    setForm({
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      branchId: u.branchId,
      roleIds: [...u.roleIds],
      isActive: u.isActive,
      password: '',
      confirmPassword: '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!form.branchId) {
      toast.error('Select a branch');
      return;
    }
    if (!form.roleIds.length) {
      toast.error('Select at least one role');
      return;
    }
    const emailLc = form.email.trim().toLowerCase();
    const dup = users.some((u) => u.email.toLowerCase() === emailLc && u.id !== editing?.id);
    if (dup) {
      toast.error('That email is already in use');
      return;
    }

    const isNew = !editing;
    if (isNew && !form.password.trim()) {
      toast.error('Set a password so this user can sign in');
      return;
    }
    if (form.password || form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    const id = editing?.id ?? newId('user');
    upsertUser(
      {
        id,
        email: form.email.trim(),
        firstName: form.firstName.trim() || '—',
        lastName: form.lastName.trim() || '—',
        branchId: form.branchId,
        roleIds: form.roleIds,
        isActive: form.isActive,
        createdAt: editing?.createdAt,
      },
      { skipPersist: true },
    );

    const userPasswords =
      form.password.trim() ? { [id]: form.password.trim() } : undefined;

    try {
      await flushNow(userPasswords);
      toast.success(editing ? 'User updated' : 'User created');
      setOpen(false);
    } catch {
      toast.error('Could not save to server. Check you are signed in and try again.');
      await hydrate();
    }
  };

  const importLegacyFromBrowser = async () => {
    const legacy = readLegacyOrgFromLocalStorage();
    if (!legacy) {
      toast.error(`No legacy data found (browser key ${INFRA_ORG_LEGACY_LS_KEY}).`);
      return;
    }
    try {
      const res = await fetch('/api/infra-admin/org/migrate-local', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(legacy),
      });
      const data = (await res.json()) as {
        error?: string;
        imported?: { branches: number; roles: number; users: number };
      };
      if (!res.ok) {
        toast.error(data.error || 'Import failed');
        return;
      }
      await hydrate();
      try {
        localStorage.removeItem(INFRA_ORG_LEGACY_LS_KEY);
      } catch {
        /* ignore */
      }
      const im = data.imported;
      toast.success(
        im
          ? `Imported ${im.branches} branches, ${im.roles} roles, ${im.users} users. Legacy key cleared from this browser.`
          : 'Legacy data imported. Key cleared from this browser.',
      );
    } catch {
      toast.error('Import failed');
    }
  };

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id;
  const roleLabels = (ids: string[]) =>
    ids
      .map((id) => roles.find((r) => r.id === id)?.name)
      .filter(Boolean)
      .join(', ');

  return (
    <AdminLayout
      title="Users"
      subtitle="Accounts and passwords are stored on the server (data/infra-admin-org.json), not in env."
    >
      <RbacPageChrome
        title="Users"
        subtitle="Super admin assigns email, password, branch, and roles. Each user signs in with those credentials; permissions follow the role matrix on the Roles page. If you previously used org data only in this browser (localStorage), use Import legacy once to copy it into data/infra-admin-org.json."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => void importLegacyFromBrowser()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-charcoal shadow-sm hover:border-hz-blue/40 hover:text-hz-blue"
              >
                <Database className="h-4 w-4" strokeWidth={2} aria-hidden />
                Import legacy browser data
              </motion.button>
            ) : null}
            {canManage ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-hz-blue px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-hz-blue-hover"
              >
                <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
                Add user
              </motion.button>
            ) : null}
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-border bg-hzwhite shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-offwhite">
                {['User', 'Branch', 'Roles', 'Sign-in', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 font-montserrat text-[10px] font-bold uppercase text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {sorted.map((u) => {
                  const ready = loginReady[u.id] === true;
                  return (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="group border-b border-border last:border-b-0 hover:bg-offwhite/80"
                    >
                      <td className="px-3 py-2.5 font-inter text-[13px] text-charcoal">
                        <div className="font-semibold text-charcoal">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-xs text-muted">{u.email}</div>
                        {u.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase() ? (
                          <span className="mt-1 inline-block rounded bg-hz-blue-light px-2 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wide text-hz-blue">
                            Super admin
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 font-inter text-[13px] text-charcoal">{branchName(u.branchId)}</td>
                      <td className="px-3 py-2.5 font-inter text-[13px] text-muted">{roleLabels(u.roleIds) || '—'}</td>
                      <td className="px-3 py-2.5">
                        {!hydrated ? (
                          <span className="font-inter text-xs text-muted">…</span>
                        ) : (
                          <span
                            className={[
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide',
                              ready ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800',
                            ].join(' ')}
                          >
                            <KeyRound className="h-3 w-3" strokeWidth={2} aria-hidden />
                            {ready ? 'Ready' : 'Needs password'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={[
                            'inline-flex rounded-full px-2.5 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide',
                            u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600',
                          ].join(' ')}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {canManage ? (
                          <div className="flex justify-end gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                            <motion.button
                              type="button"
                              title="Edit"
                              whileHover={{ scale: 1.06 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEdit(u)}
                              className="rounded-lg border border-border bg-white p-2 text-muted hover:border-hz-blue/40 hover:text-hz-blue"
                            >
                              <Pencil className="h-4 w-4" strokeWidth={2} />
                            </motion.button>
                            <motion.button
                              type="button"
                              title="Remove"
                              whileHover={{ scale: 1.06 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                removeUser(u.id);
                                toast.success('User removed');
                              }}
                              disabled={u.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase()}
                              className="rounded-lg border border-border bg-white p-2 text-hz-red/80 hover:border-hz-red/40 hover:text-hz-red disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </motion.button>
                          </div>
                        ) : null}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </RbacPageChrome>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit user' : 'Add user'}>
        <div className="space-y-3 font-inter text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                Email
              </span>
              <input
                className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={editing?.email.toLowerCase() === STATIC_INFRA_ADMIN_EMAIL.toLowerCase()}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                First name
              </span>
              <input
                className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                Last name
              </span>
              <input
                className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                Password {editing ? '(leave blank to keep current)' : ''}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editing ? '••••••••' : 'Required for new users'}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                Confirm password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                Branch
              </span>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <span className="mb-2 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
                Roles
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((r) => {
                  const checked = form.roleIds.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={[
                        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                        checked ? 'border-hz-blue bg-hz-blue-light/60' : 'border-border hover:border-hz-blue/30',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-hz-blue"
                        checked={checked}
                        onChange={() =>
                          setForm((f) => ({
                            ...f,
                            roleIds: checked
                              ? f.roleIds.filter((id) => id !== r.id)
                              : [...f.roleIds, r.id],
                          }))
                        }
                      />
                      <span className="text-[13px] font-medium text-charcoal">{r.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-hz-blue"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <span className="text-[13px] text-charcoal">Active</span>
            </label>
          </div>
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
              onClick={() => void save()}
              className="rounded-lg bg-hz-blue px-4 py-2 font-montserrat text-xs font-bold uppercase tracking-wide text-white hover:bg-hz-blue-hover"
            >
              Save
            </motion.button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
