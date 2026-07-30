'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { RecentListingsContent } from '@/lib/homepageCmsTypes';

const EMPTY_FORM: RecentListingsContent = {
  eyebrow: '',
  title: '',
  subtitle: '',
  viewAllLabel: '',
  emptyMessage: '',
};

export default function RecentListingsCmsPage() {
  const [form, setForm] = useState<RecentListingsContent>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<RecentListingsContent>('/admin/site-config/recent-listings');
      setForm({ ...EMPTY_FORM, ...res.data });
    } catch {
      toast.error('Failed to load recent listings CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/recent-listings', form);
      toast.success('Recent listings section saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Recent listings">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Heading copy for the <strong>Recent Listings</strong> section on the home page (below Browse by type,
        above Featured projects). Property cards themselves come from live approved listings, newest first.
      </p>
      <div className="acard" style={{ padding: 16, maxWidth: 640 }}>
        <label className="label">Eyebrow</label>
        <input
          className="fi"
          value={form.eyebrow}
          onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Title</label>
        <input
          className="fi"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Subtitle</label>
        <textarea
          className="fi"
          rows={2}
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          style={{ width: '100%', marginBottom: 12, resize: 'vertical' }}
        />
        <label className="label">View all button label</label>
        <input
          className="fi"
          value={form.viewAllLabel}
          onChange={(e) => setForm((f) => ({ ...f, viewAllLabel: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Empty state message</label>
        <input
          className="fi"
          value={form.emptyMessage}
          onChange={(e) => setForm((f) => ({ ...f, emptyMessage: e.target.value }))}
          style={{ width: '100%' }}
          placeholder="No Recent Listings Available."
        />
      </div>
      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save section'}
      </button>
    </AdminLayout>
  );
}
