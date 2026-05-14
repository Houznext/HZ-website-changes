'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { formatDate, formatPrice } from '@/lib/utils';

type Prop = {
  propertyId: string;
  title?: string;
  propertyCode?: string;
  listedBy?: string;
  city?: string;
  basePrice?: number;
  isApproved?: boolean;
  createdAt?: string;
};

export default function DeveloperSubmissionsPage() {
  const [rows, setRows] = useState<Prop[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/admin/properties', { params: { page: 1, limit: 200 } });
        const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setRows(list.filter((p: Prop) => (p.listedBy ?? '').toLowerCase() === 'developer'));
      } catch {
        toast.error('Failed to load submissions');
      }
    })();
  }, []);

  return (
    <AdminLayout title="Developer submissions">
      <div className="warn-box" style={{ marginBottom: 14 }}>
        <span>Listings submitted with listed by Developer (from developer accounts).</span>
      </div>
      <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
        <table className="atbl">
          <thead>
            <tr>
              <th>Title</th>
              <th>Code</th>
              <th>City</th>
              <th>Price</th>
              <th>Approved</th>
              <th>Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.propertyId}>
                <td style={{ fontWeight: 600 }}>{p.title ?? '—'}</td>
                <td>{p.propertyCode ?? '—'}</td>
                <td>{p.city ?? '—'}</td>
                <td>{formatPrice(p.basePrice)}</td>
                <td>
                  <span className={`bdg ${p.isApproved ? 'b-green' : 'b-amber'}`}>{p.isApproved ? 'Yes' : 'Pending'}</span>
                </td>
                <td>{p.createdAt ? formatDate(p.createdAt) : '—'}</td>
                <td>
                  <Link href="/pending" className="btn btn-ghost btn-sm">
                    Queue
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
