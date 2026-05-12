import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { RbacPageChrome } from '@/components/infra-admin/RbacPageChrome';
import { Modal } from '@/components/ui/Modal';
import { HEADOFFICE_BRANCH_ID } from '@/lib/infra-admin-static-session';
import { useInfraOrgStore, type InfraOrgBranch } from '@/stores/useInfraOrgStore';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';

function newId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function InfraBranchesPage() {
  const branches = useInfraOrgStore((s) => s.branches);
  const users = useInfraOrgStore((s) => s.users);
  const upsertBranch = useInfraOrgStore((s) => s.upsertBranch);
  const removeBranch = useInfraOrgStore((s) => s.removeBranch);
  const canManage = useInfraPermissionStore((s) => s.hasPermission('branches', 'edit'));

  const sorted = useMemo(
    () => [...branches].sort((a, b) => a.name.localeCompare(b.name)),
    [branches],
  );

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InfraOrgBranch | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const userCount = (branchId: string) => users.filter((u) => u.branchId === branchId).length;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setCode('');
    setOpen(true);
  };

  const openEdit = (b: InfraOrgBranch) => {
    setEditing(b);
    setName(b.name);
    setCode(b.code ?? '');
    setOpen(true);
  };

  const save = () => {
    if (!name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    const id = editing?.id ?? newId('branch');
    upsertBranch({
      id,
      name: name.trim(),
      code: code.trim() || undefined,
      createdAt: editing?.createdAt,
    });
    toast.success(editing ? 'Branch updated' : 'Branch created');
    setOpen(false);
  };

  return (
    <AdminLayout title="Branches" subtitle="Stored with roles and users in data/infra-admin-org.json on the server.">
      <RbacPageChrome
        title="Branches"
        subtitle="Headoffice is the default branch and cannot be deleted. Add regional or functional branches and assign users on the Users page."
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
              Add branch
            </motion.button>
          ) : null
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((b, idx) => {
            const isHead = b.id === HEADOFFICE_BRANCH_ID;
            return (
              <motion.article
                key={b.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-hzwhite p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hz-blue-light text-hz-blue">
                      <GitBranch className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                    <div>
                      <h2 className="font-montserrat text-lg font-extrabold text-charcoal">{b.name}</h2>
                      <p className="mt-0.5 font-inter text-xs text-muted">
                        {b.code ? `Code ${b.code}` : 'No code'} · {userCount(b.id)} users
                      </p>
                    </div>
                  </div>
                  {isHead ? (
                    <span className="rounded-full bg-hz-blue-light px-2.5 py-1 font-montserrat text-[9px] font-bold uppercase tracking-wide text-hz-blue">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 line-clamp-2 font-inter text-xs leading-relaxed text-muted">
                  Branch membership drives which roles and permissions apply in session payloads (mirrors HZ-admin).
                </p>
                {canManage ? (
                  <div className="mt-4 flex gap-2 border-t border-border pt-4 opacity-90 transition-opacity group-hover:opacity-100">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openEdit(b)}
                      className="flex-1 rounded-lg border border-border bg-offwhite/80 py-2 font-montserrat text-[11px] font-bold uppercase tracking-wide text-charcoal hover:border-hz-blue/40 hover:text-hz-blue"
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isHead}
                      onClick={() => {
                        removeBranch(b.id);
                        toast.success('Branch removed');
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border bg-white py-2 font-montserrat text-[11px] font-bold uppercase tracking-wide text-hz-red/80 hover:border-hz-red/30 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Delete
                    </motion.button>
                  </div>
                ) : null}
              </motion.article>
            );
          })}
        </div>
      </RbacPageChrome>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit branch' : 'Add branch'}>
        <div className="space-y-3 font-inter text-sm">
          <label className="block">
            <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
              Name
            </span>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
              Code (optional)
            </span>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 outline-none ring-hz-blue/30 focus:ring-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. BLR"
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
              onClick={save}
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
