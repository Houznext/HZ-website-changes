'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { FeaturedProjectsContent } from '@/lib/homepageCmsTypes';

export default function FeaturedProjectsCmsPage() {
  const [form, setForm] = useState<FeaturedProjectsContent>({
    eyebrow: '',
    title: '',
    subtitle: '',
    viewAllLabel: '',
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<FeaturedProjectsContent>('/admin/site-config/featured-projects');
      setForm(res.data);
    } catch {
      toast.error('Failed to load featured projects CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/featured-projects', form);
      toast.success('Featured projects section saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="RERA / Featured projects">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Heading copy for the <strong>RERA Registered Projects</strong> section on the home page.
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
          style={{ width: '100%' }}
        />
      </div>
      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save section'}
      </button>
    </AdminLayout>
  );
}
