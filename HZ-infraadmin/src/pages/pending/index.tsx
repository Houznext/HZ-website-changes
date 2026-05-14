'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate, formatPrice } from '@/lib/utils';

type PropRow = {
  propertyId: string;
  propertyCode?: string | null;
  title: string;
  propertyType: string;
  city?: string | null;
  basePrice?: string | null;
  createdAt: string;
};

export default function PendingPage() {
  const [rows, setRows] = useState<PropRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get('/admin/properties/pending');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load pending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: string) => {
    try {
      await adminApi.patch(`/admin/properties/${id}/approve`);
      toast.success('Approved ✓');
      void load();
    } catch {
      toast.error('Failed');
    }
  };

  const reject = async (id: string) => {
    if (!confirm('Reject?')) return;
    try {
      await adminApi.patch(`/admin/properties/${id}/reject`);
      toast.success('Rejected');
      void load();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <AdminLayout title="Pending approval">
      <div className="info-box" style={{ marginBottom: 16, borderColor: '#fde68a', background: '#fffbeb' }}>
        These listings are waiting for admin approval before they go live.
      </div>
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>
        ) : (
          <table className="atbl">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>City</th>
                <th>Price</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.propertyId}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>#{p.propertyCode ?? p.propertyId.slice(0, 8)}</div>
                  </td>
                  <td>
                    <span className="bdg b-blue">{p.propertyType}</span>
                  </td>
                  <td>{p.city ?? '—'}</td>
                  <td>{formatPrice(Number(p.basePrice))}</td>
                  <td>{formatDate(p.createdAt)}</td>
                  <td>
                    <button type="button" className="btn btn-tl btn-sm" onClick={() => void approve(p.propertyId)}>
                      Approve
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={() => void reject(p.propertyId)}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <Link href="/listings" className="btn btn-ghost">
          ← All listings
        </Link>
      </div>
    </AdminLayout>
  );
}
