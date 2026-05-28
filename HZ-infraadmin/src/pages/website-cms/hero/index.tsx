'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CloudUpload, GripVertical, Plus, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { uploadHeroImage } from '@/lib/uploadMedia';

const API_PUBLIC = (process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001').replace(/\/$/, '');

function padSlots(urls: string[]): (string | null)[] {
  const out: (string | null)[] = urls.slice(0, 4).map((u) => u || null);
  while (out.length < 4) out.push(null);
  return out.slice(0, 4);
}

function previewSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${API_PUBLIC}${url}` : `${API_PUBLIC}/${url}`;
}

type HeroMetric = { value: string; label: string; accent?: boolean };

const DEFAULT_POPULAR_TAGS = [
  '2BHK Hyderabad',
  'Villas Kokapet',
  'Plots Bengaluru',
  'Ready to move Mumbai',
  'Apartments Chennai',
];

const DEFAULT_METRICS: HeroMetric[] = [
  { value: '1,200+', label: 'Listed properties' },
  { value: '48', label: 'Active projects' },
  { value: '4', label: 'Cities' },
  { value: 'RERA', label: 'All verified', accent: true },
];

export default function WebsiteHeroCmsPage() {
  const [headline, setHeadline] = useState("India's most trusted\nproperty platform.");
  const [subheadline, setSubheadline] = useState(
    'Buy · Sell · Land · Villa · Apartment · Plot — verified by Houznext',
  );
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [heroOpacity, setHeroOpacity] = useState(18);
  const [busy, setBusy] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropSlot, setDropSlot] = useState<number | null>(null);
  const [popularTags, setPopularTags] = useState<string[]>([...DEFAULT_POPULAR_TAGS]);
  const [newPopularTag, setNewPopularTag] = useState('');
  const [metrics, setMetrics] = useState<HeroMetric[]>([...DEFAULT_METRICS]);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get('/admin/site-config/hero');
      const d = res.data as {
        heroHeadline?: string;
        heroSubheadline?: string;
        heroImageUrls?: string[];
        heroOpacity?: number;
        heroPopularTags?: string[];
        heroMetrics?: HeroMetric[];
      };
      if (d.heroHeadline) setHeadline(d.heroHeadline);
      if (d.heroSubheadline) setSubheadline(d.heroSubheadline);
      if (Array.isArray(d.heroImageUrls)) setSlots(padSlots(d.heroImageUrls));
      if (typeof d.heroOpacity === 'number') setHeroOpacity(d.heroOpacity);
      if (Array.isArray(d.heroPopularTags) && d.heroPopularTags.length) {
        setPopularTags(d.heroPopularTags);
      }
      if (Array.isArray(d.heroMetrics) && d.heroMetrics.length) {
        setMetrics(d.heroMetrics);
      }
    } catch {
      toast.error('Failed to load hero CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const uploadToSlot = async (slot: number, file: File) => {
    if (!/image\/(jpeg|png|webp)/i.test(file.type)) {
      toast.error('Use JPG, PNG, or WebP');
      return;
    }
    setBusy(true);
    try {
      const r = await uploadHeroImage(file);
      if (!r.url) throw new Error('No URL');
      setSlots((prev) => {
        const next = [...prev];
        next[slot] = r.url!;
        return next;
      });
      toast.success(`Image ${slot + 1} uploaded`);
    } catch {
      toast.error('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const onFilePick = (slot: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) void uploadToSlot(slot, f);
    };
    input.click();
  };

  const onDropFile = (slot: number, e: React.DragEvent) => {
    e.preventDefault();
    setDropSlot(null);
    const f = e.dataTransfer.files?.[0];
    if (f) void uploadToSlot(slot, f);
  };

  const reorderSlots = (from: number, to: number) => {
    if (from === to) return;
    setSlots((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/hero', {
        heroHeadline: headline,
        heroSubheadline: subheadline,
        heroImageUrls: slots.filter((u): u is string => !!u?.trim()),
        heroOpacity,
        heroPopularTags: popularTags.map((t) => t.trim()).filter(Boolean),
        heroMetrics: metrics
          .map((m) => ({
            value: m.value.trim(),
            label: m.label.trim(),
            accent: !!m.accent,
          }))
          .filter((m) => m.value && m.label),
      });
      toast.success('Website hero saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  const overlayPreview = 0.9 - ((Math.min(40, Math.max(5, heroOpacity)) - 5) / 35) * 0.22;
  const headlineLines = headline.split('\n');

  return (
    <AdminLayout title="Website Hero">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 720 }}>
        Controls the infra website home hero: headline, subheadline, background carousel, overlay darkness,{' '}
        <strong>Popular</strong> search tabs, and bottom <strong>metrics</strong> row in the search widget.
      </p>

      <div className="cms-grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div className="acard" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Headline</label>
          <p style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 6 }}>
            Stays on one line until you press Enter. First line is white; additional lines use accent colour on the site.
          </p>
          <textarea
            className="fi"
            rows={2}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                /* allow default newline */
              }
            }}
            style={{
              width: '100%',
              resize: 'vertical',
              minHeight: 56,
              paddingLeft: 14,
              paddingRight: 14,
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
            }}
            placeholder="India's most trusted"
          />

          <label className="label" style={{ marginTop: 16 }}>
            Subheadline
          </label>
          <input
            className="fi"
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            style={{ width: '100%', paddingLeft: 14, paddingRight: 14 }}
          />

          <label className="label" style={{ marginTop: 16 }}>
            Overlay darkness ({heroOpacity}) — same as live site
          </label>
          <input
            type="range"
            min={5}
            max={40}
            value={heroOpacity}
            onChange={(e) => setHeroOpacity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div className="acard" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Hero background images (4 slots)</label>
          <p style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 12 }}>
            Drag images between slots to reorder. Carousel changes every 4 seconds on the website.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {slots.map((url, idx) => (
              <div
                key={idx}
                draggable={!!url}
                onDragStart={() => setDragIdx(idx)}
                onDragEnd={() => {
                  setDragIdx(null);
                  setDropSlot(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropSlot(idx);
                }}
                onDragLeave={() => setDropSlot(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragIdx != null && e.dataTransfer.files.length === 0) {
                    reorderSlots(dragIdx, idx);
                    setDragIdx(null);
                    setDropSlot(null);
                    return;
                  }
                  onDropFile(idx, e);
                }}
                className={`upzone${dropSlot === idx ? ' drag' : ''}`}
                style={{
                  position: 'relative',
                  minHeight: 140,
                  padding: 8,
                  borderRadius: 12,
                  border: '2px dashed #cbd5e1',
                  background: '#f8fafc',
                }}
              >
                {url ? (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 2,
                        cursor: 'grab',
                        color: 'var(--mu)',
                      }}
                      title="Drag to reorder"
                    >
                      <GripVertical size={16} />
                    </div>
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() =>
                        setSlots((prev) => {
                          const next = [...prev];
                          next[idx] = null;
                          return next;
                        })
                      }
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
                    <img
                      src={previewSrc(url)}
                      alt={`Hero ${idx + 1}`}
                      style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8 }}
                    />
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onFilePick(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      width: '100%',
                      minHeight: 120,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--mu)',
                      fontSize: 12,
                    }}
                  >
                    <CloudUpload size={28} strokeWidth={1.5} />
                    <span>Drop or click — slot {idx + 1}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="acard" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Popular search tabs</label>
          <p style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 12 }}>
            Pills below the search bar. Edit text, remove with ×, or add new tabs.
          </p>
          {popularTags.map((tag, idx) => (
            <div key={`tag-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input
                className="fi"
                value={tag}
                onChange={(e) => {
                  const next = [...popularTags];
                  next[idx] = e.target.value;
                  setPopularTags(next);
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-tl btn-sm"
                aria-label="Remove tab"
                onClick={() => setPopularTags((prev) => prev.filter((_, i) => i !== idx))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <input
              className="fi"
              value={newPopularTag}
              onChange={(e) => setNewPopularTag(e.target.value)}
              placeholder="New popular tab text"
              style={{ flex: '1 1 200px', minWidth: 160 }}
            />
            <button
              type="button"
              className="btn btn-tl btn-sm"
              onClick={() => {
                const t = newPopularTag.trim();
                if (!t) {
                  toast.error('Enter tab text');
                  return;
                }
                if (popularTags.length >= 12) {
                  toast.error('Maximum 12 popular tabs');
                  return;
                }
                setPopularTags((prev) => [...prev, t]);
                setNewPopularTag('');
              }}
            >
              <Plus size={14} /> Add tab
            </button>
          </div>
        </div>

        <div className="acard" style={{ gridColumn: '1 / -1' }}>
          <label className="label">Hero metrics (bottom row)</label>
          {metrics.map((m, idx) => (
            <div
              key={`metric-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr auto auto',
                gap: 8,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <input
                className="fi"
                value={m.value}
                onChange={(e) => {
                  const next = [...metrics];
                  next[idx] = { ...next[idx], value: e.target.value };
                  setMetrics(next);
                }}
              />
              <input
                className="fi"
                value={m.label}
                onChange={(e) => {
                  const next = [...metrics];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setMetrics(next);
                }}
              />
              <label style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="checkbox"
                  checked={!!m.accent}
                  onChange={(e) => {
                    const next = [...metrics];
                    next[idx] = { ...next[idx], accent: e.target.checked };
                    setMetrics(next);
                  }}
                />
                Teal accent
              </label>
              <button
                type="button"
                className="btn btn-tl btn-sm"
                disabled={metrics.length <= 1}
                onClick={() => setMetrics((prev) => prev.filter((_, i) => i !== idx))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-tl btn-sm"
            disabled={metrics.length >= 6}
            onClick={() => setMetrics((prev) => [...prev, { value: '', label: '' }])}
          >
            <Plus size={14} /> Add metric
          </button>
        </div>

        <div className="acard">
          <div className="label">Live preview</div>
          <div
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              height: 200,
              background: '#0a1628',
            }}
          >
            {slots.find(Boolean) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewSrc(slots.find(Boolean)!)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : null}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, #050d18, #0f2a44)',
                opacity: overlayPreview,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#fff',
                  lineHeight: 1.15,
                  maxWidth: '100%',
                }}
              >
                {headlineLines.map((line, i) => (
                  <span key={i}>
                    {i > 0 ? <br /> : null}
                    <span style={i > 0 ? { color: '#f5a623' } : undefined}>{line}</span>
                  </span>
                ))}
              </div>
              <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.85)', maxWidth: 320 }}>{subheadline}</p>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save website hero'}
      </button>
    </AdminLayout>
  );
}




