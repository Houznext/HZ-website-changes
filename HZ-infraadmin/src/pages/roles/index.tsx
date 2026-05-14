'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';

const RESOURCES = [
  'property',
  'property_approval',
  'property_media',
  'project',
  'project_milestone',
  'crm_lead',
  'enquiry',
  'site_visit',
  'news',
  'hero_cms',
  'rera_docs',
  'developer_submission',
  'user',
  'role',
  'branch',
  'permission',
  'settings',
  'audit_log',
] as const;

type RoleRow = {
  id: string;
  roleName: string;
  isBranchHead: boolean;
  branch?: { id: string; name: string };
  permissions?: { resource: string; view: boolean; create: boolean; edit: boolean; delete: boolean }[];
};

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [edit, setEdit] = useState<RoleRow | null>(null);
  const [matrix, setMatrix] = useState<Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>>(
    {},
  );

  const load = async () => {
    try {
      const res = await adminApi.get('/infra-branch-roles');
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load roles');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const grouped = useMemo(() => {
    const m: Record<string, RoleRow[]> = {};
    for (const r of roles) {
      const key = r.branch?.name ?? 'Unknown branch';
      if (!m[key]) m[key] = [];
      m[key].push(r);
    }
    return m;
  }, [roles]);

  const openMatrix = (r: RoleRow) => {
    setEdit(r);
    const init: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {};
    for (const res of RESOURCES) {
      const p = r.permissions?.find((x) => x.resource === res);
      init[res] = {
        view: !!p?.view,
        create: !!p?.create,
        edit: !!p?.edit,
        delete: !!p?.delete,
      };
    }
    setMatrix(init);
  };

  const selectAll = () => {
    const next = { ...matrix };
    for (const res of RESOURCES) next[res] = { view: true, create: true, edit: true, delete: true };
    setMatrix(next);
  };

  const savePerms = async () => {
    if (!edit) return;
    try {
      const permissions = RESOURCES.map((resource) => ({ resource, ...matrix[resource] }));
      await adminApi.patch(`/infra-branch-roles/${edit.id}/permissions`, { permissions });
      toast.success('Permissions saved');
      setEdit(null);
      void load();
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <AdminLayout title="Roles & permissions">
      {Object.entries(grouped).map(([branchName, list]) => (
        <div key={branchName} className="acard" style={{ marginBottom: 14 }}>
          <h3 style={{ fontFamily: 'Montserrat', marginBottom: 10 }}>{branchName}</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {list.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                <div>
                  <strong>{r.roleName}</strong>
                  {r.isBranchHead ? (
                    <span className="bdg b-teal" style={{ marginLeft: 8 }}>
                      Branch head
                    </span>
                  ) : null}
                  <div style={{ fontSize: 11, color: '#64748b' }}>{r.permissions?.length ?? 0} permissions</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-blue btn-sm" onClick={() => openMatrix(r)}>
                    Edit permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {edit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, overflow: 'auto', padding: 20 }} onClick={() => setEdit(null)}>
          <div className="acard" style={{ maxWidth: 900, margin: '20px auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Montserrat' }}>{edit.roleName}</h3>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={selectAll}>
              Select all
            </button>
            <table className="atbl" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>View</th>
                  <th>Create</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((res) => (
                  <tr key={res}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{res}</td>
                    {(['view', 'create', 'edit', 'delete'] as const).map((k) => (
                      <td key={k}>
                        <input
                          type="checkbox"
                          checked={!!matrix[res]?.[k]}
                          onChange={(e) =>
                            setMatrix({
                              ...matrix,
                              [res]: { ...matrix[res], [k]: e.target.checked },
                            })
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-blue" onClick={() => void savePerms()}>
                Save permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
