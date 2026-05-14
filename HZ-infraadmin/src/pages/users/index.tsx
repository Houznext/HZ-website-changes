'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';

type UserRow = {
  id: string;
  username: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  kind: string;
};

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'STANDARD',
    kind: 'STAFF',
    branchId: '',
    branchRoleIds: '',
  });

  const load = async () => {
    try {
      const res = await adminApi.get('/infra-users');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    try {
      const branchRoleIds = f.branchRoleIds
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const body: Record<string, unknown> = {
        username: f.username,
        email: f.email || undefined,
        phone: f.phone || undefined,
        firstName: f.firstName || undefined,
        lastName: f.lastName || undefined,
        role: f.role,
        kind: f.kind,
        branchId: f.branchId || undefined,
        branchRoleIds: branchRoleIds.length ? branchRoleIds : undefined,
      };
      if (f.password) body.password = f.password;
      if (editId) {
        await adminApi.patch(`/infra-users/${editId}`, body);
        toast.success('User updated ✓');
      } else {
        await adminApi.post('/infra-users', { ...body, password: f.password });
        toast.success('User created ✓');
      }
      setOpen(false);
      setEditId(null);
      void load();
    } catch {
      toast.error('Save failed');
    }
  };

  const startEdit = (u: UserRow) => {
    setEditId(u.id);
    setF({
      username: u.username,
      email: u.email ?? '',
      phone: u.phone ?? '',
      password: '',
      firstName: '',
      lastName: '',
      role: u.role,
      kind: u.kind,
      branchId: '',
      branchRoleIds: '',
    });
    setOpen(true);
  };

  const del = async (id: string) => {
    if (!confirm('Delete user?')) return;
    try {
      await adminApi.delete(`/infra-users/${id}`);
      toast.success('Deleted');
      void load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminLayout
      title="Users"
      actions={
        <button
          type="button"
          className="btn btn-blue"
          onClick={() => {
            setEditId(null);
            setF({
              username: '',
              email: '',
              phone: '',
              password: '',
              firstName: '',
              lastName: '',
              role: 'STANDARD',
              kind: 'STAFF',
              branchId: '',
              branchRoleIds: '',
            });
            setOpen(true);
          }}
        >
          + Add user
        </button>
      }
    >
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Kind</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.username}</td>
                <td>{u.email ?? '—'}</td>
                <td>{u.phone ?? '—'}</td>
                <td>
                  <span className="bdg b-navy">{u.role}</span>
                </td>
                <td>{u.kind}</td>
                <td>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => startEdit(u)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => void del(u.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,42,68,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 16,
          }}
          onClick={() => setOpen(false)}
        >
          <div className="acard" style={{ width: '100%', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>{editId ? 'Edit user' : 'Add user'}</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <label className="label req">Username</label>
                <input className="fi" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} disabled={!!editId} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="fi" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="fi" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              </div>
              <div>
                <label className="label req">{editId ? 'New password (optional)' : 'Password'}</label>
                <input className="fi" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="label">First name</label>
                  <input className="fi" value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input className="fi" value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                <select className="fi" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STANDARD">STANDARD</option>
                </select>
              </div>
              <div>
                <label className="label">Kind</label>
                <select className="fi" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="label">Branch id</label>
                <input className="fi" value={f.branchId} onChange={(e) => setF({ ...f, branchId: e.target.value })} placeholder="UUID" />
              </div>
              <div>
                <label className="label">Branch role ids (comma)</label>
                <input className="fi" value={f.branchRoleIds} onChange={(e) => setF({ ...f, branchRoleIds: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-blue" onClick={() => void submit()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
