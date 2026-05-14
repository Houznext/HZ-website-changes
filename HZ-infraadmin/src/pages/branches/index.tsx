'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';

type Branch = {
  id: string;
  name: string;
  level: string;
  children?: Branch[];
};

type Membership = {
  id: string;
  isBranchHead?: boolean;
  user?: { id: string; username: string; email?: string | null };
  branchRoles?: { id: string; roleName: string }[];
};

type InfraUserRow = { id: string; username: string; email?: string | null };

type BranchRole = { id: string; roleName: string };

function Tree({ nodes, depth, selectedId, onPick }: { nodes: Branch[]; depth: number; selectedId: string | null; onPick: (b: Branch) => void }) {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: depth ? 16 : 0 }}>
      {nodes.map((b) => {
        const active = selectedId === b.id;
        return (
          <li key={b.id} style={{ margin: '4px 0' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                width: '100%',
                background: active ? 'rgba(47,128,237,0.12)' : undefined,
              }}
              onClick={() => onPick(b)}
            >
              <span
                className={`bdg ${
                  b.level === 'ORG'
                    ? 'b-navy'
                    : b.level === 'STATE'
                      ? 'b-blue'
                      : b.level === 'CITY'
                        ? 'b-teal'
                        : b.level === 'AREA'
                          ? 'b-amber'
                          : 'b-gray'
                }`}
              >
                {b.level}
              </span>
              <span style={{ marginLeft: 8 }}>{b.name}</span>
            </button>
            {b.children?.length ? <Tree nodes={b.children} depth={depth + 1} selectedId={selectedId} onPick={onPick} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function BranchesPage() {
  const [tree, setTree] = useState<Branch[]>([]);
  const [sel, setSel] = useState<Branch | null>(null);
  const [users, setUsers] = useState<Membership[]>([]);
  const [allUsers, setAllUsers] = useState<InfraUserRow[]>([]);
  const [branchRoles, setBranchRoles] = useState<BranchRole[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assign, setAssign] = useState({ userId: '', branchRoleIds: [] as string[], isBranchHead: false });

  const loadTree = async () => {
    try {
      const res = await adminApi.get('/infra-branches/tree');
      setTree(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load branches');
    }
  };

  useEffect(() => {
    void loadTree();
  }, []);

  const loadBranchUsers = async (id: string) => {
    try {
      const res = await adminApi.get(`/infra-branches/${id}/users`);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    if (sel?.id) void loadBranchUsers(sel.id);
  }, [sel?.id]);

  useEffect(() => {
    if (!assignOpen || !sel?.id) return;
    (async () => {
      try {
        const [uRes, rRes] = await Promise.all([adminApi.get('/infra-users'), adminApi.get(`/infra-branch-roles/by-branch/${sel.id}`)]);
        setAllUsers(Array.isArray(uRes.data) ? uRes.data : []);
        setBranchRoles(Array.isArray(rRes.data) ? rRes.data : []);
      } catch {
        toast.error('Failed to load users or roles');
      }
    })();
  }, [assignOpen, sel?.id]);

  const toggleRole = (id: string) => {
    setAssign((a) => ({
      ...a,
      branchRoleIds: a.branchRoleIds.includes(id) ? a.branchRoleIds.filter((x) => x !== id) : [...a.branchRoleIds, id],
    }));
  };

  const assignUser = async () => {
    if (!sel || !assign.userId) {
      toast.error('Select a user');
      return;
    }
    try {
      await adminApi.post('/infra-branches/assign-user', {
        userId: assign.userId,
        branchId: sel.id,
        branchRoleIds: assign.branchRoleIds.length ? assign.branchRoleIds : undefined,
        isBranchHead: assign.isBranchHead,
      });
      toast.success('Assigned');
      setAssignOpen(false);
      setAssign({ userId: '', branchRoleIds: [], isBranchHead: false });
      void loadBranchUsers(sel.id);
    } catch {
      toast.error('Assign failed');
    }
  };

  return (
    <AdminLayout title="Branches">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="acard">
          <h3 style={{ fontFamily: 'Montserrat', marginBottom: 8 }}>Tree</h3>
          <Tree nodes={tree} depth={0} selectedId={sel?.id ?? null} onPick={setSel} />
        </div>
        <div className="acard">
          {!sel ? (
            <p style={{ color: '#64748b' }}>Select a branch</p>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Montserrat' }}>{sel.name}</h3>
              <p className="bdg b-gray" style={{ marginTop: 8 }}>
                {sel.level}
              </p>
              <button type="button" className="btn btn-blue btn-sm" style={{ marginTop: 12 }} onClick={() => setAssignOpen(true)}>
                Assign user
              </button>
              <h4 style={{ marginTop: 16, fontSize: 12 }}>Users</h4>
              <table className="atbl">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Roles</th>
                    <th>Head</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.user?.username ?? '—'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{m.user?.email ?? ''}</div>
                      </td>
                      <td>{m.branchRoles?.map((r) => r.roleName).join(', ') || '—'}</td>
                      <td>{m.isBranchHead ? <span className="bdg b-teal">Yes</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {assignOpen && sel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setAssignOpen(false)}
        >
          <div className="acard" style={{ width: 440, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3>Assign to {sel.name}</h3>
            <label className="label">User</label>
            <select className="fi" value={assign.userId} onChange={(e) => setAssign({ ...assign, userId: e.target.value })}>
              <option value="">Select user</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} {u.email ? `(${u.email})` : ''}
                </option>
              ))}
            </select>
            <label className="label" style={{ marginTop: 12 }}>
              Roles
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {branchRoles.map((r) => (
                <button key={r.id} type="button" className={`chip ${assign.branchRoleIds.includes(r.id) ? 'sel-tl' : ''}`} onClick={() => toggleRole(r.id)}>
                  {r.roleName}
                </button>
              ))}
            </div>
            <label className="tgl" style={{ marginTop: 14 }}>
              <input
                type="checkbox"
                checked={assign.isBranchHead}
                onChange={(e) => setAssign({ ...assign, isBranchHead: e.target.checked })}
                style={{ display: 'none' }}
              />
              <span className="tgl-track">
                <span className="tgl-thumb" />
              </span>
              Branch head
            </label>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setAssignOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-blue" onClick={() => void assignUser()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
