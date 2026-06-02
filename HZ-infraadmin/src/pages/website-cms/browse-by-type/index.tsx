'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CloudUpload, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { uploadBrowseTypeImage } from '@/lib/uploadMedia';
import type { BrowseByTypeSection } from '@/lib/homepageCmsTypes';

const API_PUBLIC = (process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001').replace(/\/$/, '');

const TYPES = [
  { key: 'Land', label: 'Land', hint: 'Open land, agriculture, parcels' },
  { key: 'Villa', label: 'Villa', hint: 'Independent homes & gated villas' },
  { key: 'Apartment', label: 'Apartment', hint: 'Flats & high-rise living' },
  { key: 'Plot', label: 'Plot', hint: 'Residential & layout plots' },
] as const;

type TypeKey = (typeof TYPES)[number]['key'];

function previewSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${API_PUBLIC}${url}` : `${API_PUBLIC}/${url}`;
}

export default function BrowseByTypeCmsPage() {
  const [sectionTitle, setSectionTitle] = useState('Browse by type');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [images, setImages] = useState<Record<TypeKey, string | null>>({
    Land: null,
    Villa: null,
    Apartment: null,
    Plot: null,
  });
  const [cards, setCards] = useState<BrowseByTypeSection['cards']>({
    Land: { title: 'Land', desc: '', countLabel: '', href: '/buy?type=Land' },
    Villa: { title: 'Villa', desc: '', countLabel: '', href: '/buy?type=Villa' },
    Apartment: { title: 'Apartment', desc: '', countLabel: '', href: '/buy?type=Apartment' },
    Plot: { title: 'Plot', desc: '', countLabel: '', href: '/buy?type=Plot' },
  });
  const [busy, setBusy] = useState(false);
  const [dragKey, setDragKey] = useState<TypeKey | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<BrowseByTypeSection>('/admin/site-config/browse-by-type');
      const d = res.data;
      setSectionTitle(d.sectionTitle ?? 'Browse by type');
      setSectionSubtitle(d.sectionSubtitle ?? '');
      setImages({
        Land: d.images?.Land ?? null,
        Villa: d.images?.Villa ?? null,
        Apartment: d.images?.Apartment ?? null,
        Plot: d.images?.Plot ?? null,
      });
      if (d.cards) setCards(d.cards);
    } catch {
      toast.error('Failed to load browse-by-type CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadFor = async (key: TypeKey, file: File) => {
    if (!/image\/(jpeg|png|webp)/i.test(file.type)) {
      toast.error('Use JPG, PNG, or WebP');
      return;
    }
    setBusy(true);
    try {
      const r = await uploadBrowseTypeImage(file);
      if (!r.url) throw new Error('No URL');
      setImages((prev) => ({ ...prev, [key]: r.url! }));
      toast.success(`${key} image uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const pickFile = (key: TypeKey) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) void uploadFor(key, f);
    };
    input.click();
  };

  const onDrop = (key: TypeKey, e: React.DragEvent) => {
    e.preventDefault();
    setDragKey(null);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadFor(key, f);
  };

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/browse-by-type', {
        sectionTitle,
        sectionSubtitle,
        images,
        cards,
      });
      toast.success('Browse by type saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Browse by type">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Section heading, card copy, and images for the four home page cards (Land, Villa, Apartment, Plot).
      </p>

      <div className="acard" style={{ padding: 16, marginBottom: 16, maxWidth: 720 }}>
        <label className="label">Section title</label>
        <input className="fi" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} style={{ width: '100%' }} />
        <label className="label" style={{ marginTop: 12 }}>
          Section subtitle
        </label>
        <textarea
          className="fi"
          rows={2}
          value={sectionSubtitle}
          onChange={(e) => setSectionSubtitle(e.target.value)}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {TYPES.map(({ key, label, hint }) => (
          <div key={key} className="acard" style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 4 }}>
              {label}
            </div>
            <p style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 10 }}>{hint}</p>
            <div
              className={`upzone${dragKey === key ? ' drag' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragKey(key);
              }}
              onDragLeave={() => setDragKey(null)}
              onDrop={(e) => onDrop(key, e)}
              style={{
                position: 'relative',
                minHeight: 140,
                borderRadius: 12,
                border: '2px dashed #cbd5e1',
                background: '#f8fafc',
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              {images[key] ? (
                <>
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setImages((prev) => ({ ...prev, [key]: null }))}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <X size={14} />
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewSrc(images[key]!)} alt={label} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => pickFile(key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    minHeight: 140,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--mu)',
                    fontSize: 12,
                  }}
                >
                  <CloudUpload size={28} strokeWidth={1.5} />
                  <span>Drop or click to upload</span>
                </button>
              )}
            </div>
            <label className="label">Card title</label>
            <input
              className="fi"
              value={cards[key].title}
              onChange={(e) => setCards((prev) => ({ ...prev, [key]: { ...prev[key], title: e.target.value } }))}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <label className="label">Description</label>
            <textarea
              className="fi"
              rows={2}
              value={cards[key].desc}
              onChange={(e) => setCards((prev) => ({ ...prev, [key]: { ...prev[key], desc: e.target.value } }))}
              style={{ width: '100%', marginBottom: 8, resize: 'vertical' }}
            />
            <label className="label">Count label (e.g. 120+ listings)</label>
            <input
              className="fi"
              value={cards[key].countLabel}
              onChange={(e) => setCards((prev) => ({ ...prev, [key]: { ...prev[key], countLabel: e.target.value } }))}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <label className="label">Link (href)</label>
            <input
              className="fi"
              value={cards[key].href}
              onChange={(e) => setCards((prev) => ({ ...prev, [key]: { ...prev[key], href: e.target.value } }))}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save browse by type'}
      </button>
    </AdminLayout>
  );
}
