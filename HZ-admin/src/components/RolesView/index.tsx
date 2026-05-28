"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, ShieldCheck, Pencil, Trash2 } from "lucide-react";
import apiClient from "@/src/utils/apiClient";
import Button from "@/src/common/Button";
import Modal from "@/src/common/Modal";
import Loader from "@/src/common/Loader";
import BranchRoleForm from "@/src/components/BranchesView/BranchRoleForm";
import { UserRole } from "@/src/components/BranchesView/BranchRoleForm";
import CheckboxInput from "@/src/common/FormElements/CheckBoxInput";

type Branch = { id: string | number; name: string; level?: string };

type BranchRoleRow = {
  id: string;
  roleName: string;
  isBranchHead: boolean;
  branch?: { id: string; name: string };
  permissions?: { resource: string }[];
};

type RoleFormState = {
  branchId: string;
  roleName: string;
  isBranchHead: boolean;
};

const emptyForm = (): RoleFormState => ({
  branchId: "",
  roleName: "",
  isBranchHead: false,
});

export default function RolesView() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<BranchRoleRow[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<BranchRoleRow | null>(null);
  const [form, setForm] = useState<RoleFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BranchRoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permRole, setPermRole] = useState<BranchRoleRow | null>(null);

  const loadBranches = useCallback(async () => {
    try {
      const res = await apiClient.get(apiClient.URLS.branches, {}, true);
      setBranches(Array.isArray(res.body) ? res.body : []);
    } catch {
      toast.error("Failed to load branches");
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setLoadingRoles(true);
      const qs =
        branchFilter !== "ALL"
          ? `?branchId=${encodeURIComponent(branchFilter)}&_=${Date.now()}`
          : `?_=${Date.now()}`;
      const res = await apiClient.get(`${apiClient.URLS.branchroles}${qs}`, {}, true);
      setRoles(Array.isArray(res.body) ? res.body : []);
    } catch {
      toast.error("Failed to load roles");
      setRoles([]);
    } finally {
      setLoadingRoles(false);
      setLoading(false);
    }
  }, [branchFilter]);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  const filteredRoles = useMemo(() => {
    if (!query.trim()) return roles;
    const q = query.toLowerCase();
    return roles.filter(
      (r) =>
        r.roleName.toLowerCase().includes(q) ||
        r.branch?.name?.toLowerCase().includes(q),
    );
  }, [roles, query]);

  const grouped = useMemo(() => {
    const m: Record<string, BranchRoleRow[]> = {};
    for (const r of filteredRoles) {
      const key = r.branch?.name ?? "Unknown branch";
      if (!m[key]) m[key] = [];
      m[key].push(r);
    }
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRoles]);

  const openCreate = () => {
    setEditingRole(null);
    setForm({
      ...emptyForm(),
      branchId: branchFilter !== "ALL" ? branchFilter : "",
    });
    setNameModalOpen(true);
  };

  const openEditName = (role: BranchRoleRow) => {
    setEditingRole(role);
    setForm({
      branchId: role.branch?.id ?? "",
      roleName: role.roleName,
      isBranchHead: !!role.isBranchHead,
    });
    setNameModalOpen(true);
  };

  const saveRoleName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.roleName.trim()) {
      toast.error("Role name is required");
      return;
    }
    if (!editingRole && !form.branchId) {
      toast.error("Select a branch");
      return;
    }

    try {
      setSaving(true);
      if (editingRole) {
        await apiClient.patch(
          `${apiClient.URLS.branchroles}/${editingRole.id}`,
          {
            roleName: form.roleName.trim(),
            isBranchHead: form.isBranchHead,
          },
          true,
        );
        toast.success("Role updated");
      } else {
        await apiClient.post(
          apiClient.URLS.branchroles,
          {
            branchId: form.branchId,
            roleName: form.roleName.trim(),
            isBranchHead: form.isBranchHead,
            seedDefaultPermissions: false,
          },
          true,
        );
        toast.success("Role created");
      }
      setNameModalOpen(false);
      setEditingRole(null);
      void loadRoles();
    } catch (err: unknown) {
      const msg =
        (err as { body?: { message?: string } })?.body?.message ??
        "Failed to save role";
      toast.error(typeof msg === "string" ? msg : "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiClient.delete(`${apiClient.URLS.branchroles}/${deleteTarget.id}`, true);
      toast.success("Role deleted");
      setDeleteTarget(null);
      void loadRoles();
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  const roleNameSuggestions = Object.values(UserRole);

  if (loading && !roles.length && !branches.length) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="page-hd">
        <div>
          <h1>Roles</h1>
          <p>Add, rename, or remove branch role names. Use permissions to configure access.</p>
        </div>
        <Button type="button" className="btn btn-blue" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add role
        </Button>
      </div>

      <div className="acard" style={{ marginBottom: 16 }}>
        <div className="br-toolbar" style={{ padding: 0 }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Branch</label>
            <select
              className="fi"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="ALL">All branches</option>
              {branches.map((b) => (
                <option key={String(b.id)} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Search</label>
            <input
              className="fi"
              placeholder="Search role or branch…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loadingRoles ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : grouped.length === 0 ? (
        <div className="acard br-empty">
          <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No roles found</p>
          <Button type="button" className="btn btn-blue btn-sm" style={{ marginTop: 12 }} onClick={openCreate}>
            Add role
          </Button>
        </div>
      ) : (
        grouped.map(([branchName, list]) => (
          <div key={branchName} className="acard" style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--br-m)", marginBottom: 12 }}>{branchName}</h3>
            {list.map((r) => (
              <div key={r.id} className="br-role-row">
                <div>
                  <strong>{r.roleName}</strong>
                  {r.isBranchHead ? (
                    <span className="bdg b-teal" style={{ marginLeft: 8 }}>
                      Branch head
                    </span>
                  ) : null}
                  <div style={{ fontSize: 11, color: "var(--br-mu)", marginTop: 4 }}>
                    {r.permissions?.length ?? 0} permissions
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Button
                    type="button"
                    className="btn btn-blue btn-sm"
                    onClick={() => {
                      setPermRole(r);
                      setPermModalOpen(true);
                    }}
                  >
                    Permissions
                  </Button>
                  <Button type="button" className="btn btn-ghost btn-sm" onClick={() => openEditName(r)}>
                    <Pencil className="w-3.5 h-3.5" /> Rename
                  </Button>
                  <Button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteTarget(r)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      <Modal
        isOpen={nameModalOpen}
        closeModal={() => {
          setNameModalOpen(false);
          setEditingRole(null);
        }}
        title={editingRole ? "Edit role name" : "Add role"}
        isCloseRequired={false}
        className="md:max-w-[480px] max-w-[92%] br-admin-root"
        rootCls="z-[99999]"
      >
        <form onSubmit={saveRoleName} className="p-4 space-y-4">
          {!editingRole && (
            <div>
              <label className="label req">Branch</label>
              <select
                className="fi"
                required
                value={form.branchId}
                onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={String(b.id)} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label req">Role name</label>
            <input
              className="fi"
              list="role-name-suggestions"
              required
              value={form.roleName}
              onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}
              placeholder="e.g. BranchManager"
            />
            <datalist id="role-name-suggestions">
              {roleNameSuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <CheckboxInput
            label="Branch head role"
            name="isBranchHead"
            checked={form.isBranchHead}
            onChange={(checked) => setForm((f) => ({ ...f, isBranchHead: checked }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setNameModalOpen(false);
                setEditingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn btn-blue" disabled={saving}>
              {saving ? "Saving…" : editingRole ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        closeModal={() => setDeleteTarget(null)}
        title="Delete role"
        isCloseRequired={false}
        className="md:max-w-[440px] max-w-[92%] br-admin-root"
        rootCls="z-[99999]"
      >
        <div className="p-4">
          <p style={{ fontSize: 13, color: "var(--br-mu)", marginBottom: 16 }}>
            Delete role <strong>{deleteTarget?.roleName}</strong> from{" "}
            <strong>{deleteTarget?.branch?.name}</strong>? Users assigned this role may lose access.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" className="btn btn-danger" disabled={deleting} onClick={() => void confirmDelete()}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={permModalOpen && !!permRole}
        closeModal={() => {
          setPermModalOpen(false);
          setPermRole(null);
        }}
        title={permRole ? `Permissions — ${permRole.roleName}` : "Permissions"}
        isCloseRequired={false}
        className="md:max-w-[900px] max-w-[95%] br-admin-root"
        rootCls="z-[99999]"
      >
        {permRole?.branch?.id ? (
          <BranchRoleForm
            branchId={permRole.branch.id}
            role={permRole}
            branchHasHead={false}
            onClose={() => {
              setPermModalOpen(false);
              setPermRole(null);
            }}
            onSuccess={() => {
              setPermModalOpen(false);
              setPermRole(null);
              void loadRoles();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
