'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';

export default function HeroCmsPage() {
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroOpacity, setHeroOpacity] = useState(18);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/site-config/hero');
        setHeroImageUrl(res.data?.heroImageUrl ?? '');
        setHeroOpacity(typeof res.data?.heroOpacity === 'number' ? res.data.heroOpacity : 18);
      } catch {
        toast.error('Failed to load hero config');
      }
    })();
  }, []);

  const save = async () => {
    try {
      await adminApi.patch('/admin/site-config/hero', { heroImageUrl: heroImageUrl || null, heroOpacity });
      toast.success('Hero updated');
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <AdminLayout title="Hero image CMS">
      <div className="acard" style={{ maxWidth: 520 }}>
        <label className="label">Hero image URL</label>
        <input className="fi" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://…" />
        <label className="label" style={{ marginTop: 12 }}>
          Overlay opacity ({heroOpacity})
        </label>
        <input type="range" min={5} max={40} value={heroOpacity} onChange={(e) => setHeroOpacity(Number(e.target.value))} style={{ width: '100%' }} />
        {heroImageUrl ? (
          <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImageUrl} alt="Hero preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', opacity: heroOpacity / 40 }} />
          </div>
        ) : null}
        <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} onClick={() => void save()}>
          Save hero
        </button>
      </div>
    </AdminLayout>
  );
}
