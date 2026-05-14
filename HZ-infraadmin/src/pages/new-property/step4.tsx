'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Check, CloudUpload, Eye, Image as ImageIcon, Plus, Tag, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { ListingWizardHeader } from '@/components/listing/ListingWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useListingForm } from '@/context/ListingFormContext';
import { uploadPropertyImage } from '@/lib/uploadMedia';
import { INFRA_WHATSAPP_DISPLAY } from '@/lib/infra-public-contact';

const HIGHLIGHTS = ['3BHK', 'East facing', 'Pool', 'Lift', 'RERA', 'Vastu', 'Power backup', 'Gym', 'Gated', 'Dec 2026', 'Smart home'] as const;

function PublishToggle({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub: string;
}) {
  return (
    <label className="publish-tgl-wrap tgl" style={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer', marginBottom: 0, gap: 10 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
      <span className="tgl-track">
        <span className="tgl-thumb" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="tgl-stack" style={{ fontSize: 12.5, color: 'var(--ch)', fontWeight: 500 }}>
          {label}
        </span>
        <span className="tgl-sub">{sub}</span>
      </span>
    </label>
  );
}

export default function NewPropertyStep4() {
  const router = useRouter();
  const { form, setField } = useListingForm();
  const photos = (form.photoUrls as string[]) ?? [];
  const highlights = (form.highlights as string[]) ?? [];
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hlInput, setHlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => /image\/(jpeg|png|webp)/i.test(f.type));
    if (!list.length) {
      toast.error('Use JPG, PNG, or WebP');
      return;
    }
    setUploading(true);
    let acc = [...photos];
    for (const file of list) {
      try {
        const r = await uploadPropertyImage(file);
        if (r.url) {
          acc = [...acc, r.url];
          setField('photoUrls', acc);
          const cov = String(form.coverImageUrl ?? '');
          if (!cov || !acc.includes(cov)) setField('coverImageUrl', acc[0] ?? '');
        }
      } catch {
        toast.error('Image upload failed');
      }
    }
    setUploading(false);
  };

  const openPicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = true;
    input.onchange = () => {
      if (input.files?.length) void processFiles(input.files);
    };
    input.click();
  };

  const removePhoto = (url: string) => {
    const next = photos.filter((u) => u !== url);
    setField('photoUrls', next);
    const cov = String(form.coverImageUrl ?? '');
    if (cov === url || !next.includes(cov)) setField('coverImageUrl', next[0] ?? '');
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= photos.length || to >= photos.length) return;
    const next = photos.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setField('photoUrls', next);
    const cov = String(form.coverImageUrl ?? '');
    if (!cov || !next.includes(cov)) setField('coverImageUrl', next[0] ?? '');
  };

  const toggleHl = (h: string) => {
    if (highlights.includes(h)) setField('highlights', highlights.filter((x) => x !== h));
    else if (highlights.length < 4) setField('highlights', [...highlights, h]);
    else toast.error('Maximum 4 highlights allowed');
  };

  const addCustomHl = () => {
    const t = hlInput.trim();
    if (!t) return;
    if (highlights.includes(t)) {
      setHlInput('');
      return;
    }
    if (highlights.length >= 4) {
      toast.error('Maximum 4 highlights allowed');
      return;
    }
    setField('highlights', [...highlights, t]);
    setHlInput('');
  };

  const typeOk = !!form.propertyType;
  const titleOk = !!(form.title && String(form.title).trim());
  const ownerOk = !!(form.ownerName && form.ownerPhone);
  const priceOk = !!(form.basePrice && Number(form.basePrice) > 0);
  const photosOk = photos.length >= 3;

  const slotsLeft = Math.max(0, 20 - photos.length);

  return (
    <AdminLayout
      hideSearch
      header={
        <ListingWizardHeader
          backHref="/new-property/step3"
          centerTitle="Photos & publish settings"
          onSaveDraft={() => toast.success('Draft saved')}
          primaryLabel="Review listing →"
          onPrimary={() => void router.push('/new-property/review')}
        />
      }
    >
      <ListingStepProgress step={4} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div>
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider
              icon={<ImageIcon size={16} strokeWidth={1.8} color="#7c3aed" />}
              title="Property photos"
              subtitle="Min 3 · Max 20 · JPG or PNG · Max 8MB each"
              iconBackground="#f3e8ff"
            />
            <div
              className={`upzone${dragOver ? ' drag' : ''}`}
              onClick={() => void openPicker()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.length) void processFiles(e.dataTransfer.files);
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CloudUpload width={20} height={20} strokeWidth={1.8} color="var(--blue)" />
              </div>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700, color: 'var(--ch)', marginBottom: 4 }}>Drop photos here or click to upload</div>
              <div style={{ fontSize: 12, color: 'var(--mu)' }}>First photo becomes the cover image · Drag to reorder</div>
            </div>
            {uploading ? <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 8 }}>Uploading…</div> : null}
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 14 }} onDragEnd={() => setDragIdx(null)}>
              {photos.map((url, idx) => (
                <div
                  key={url + idx}
                  className={`up-thumb${url === form.coverImageUrl ? ' cover' : ''}`}
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx != null) reorder(dragIdx, idx);
                    setDragIdx(null);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {url === form.coverImageUrl ? <span className="prev-cover-lbl">COVER</span> : null}
                  <button type="button" className="rm" aria-label="Remove" onClick={(e) => { e.stopPropagation(); removePhoto(url); }}>
                    <X width={8} height={8} strokeWidth={2.5} color="#fff" />
                  </button>
                </div>
              ))}
              {photos.length < 20 ? (
                <button type="button" className="up-thumb" style={{ borderStyle: 'dashed', borderWidth: 2 }} onClick={() => void openPicker()}>
                  <Plus width={18} height={18} strokeWidth={1.8} color="#94a3b8" />
                </button>
              ) : null}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--mu)', marginTop: 10 }}>
              {photos.length} photos uploaded · {slotsLeft} slots remaining · First photo is the cover — drag to reorder
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<Tag size={16} strokeWidth={1.8} color="var(--blue)" />} title="Property highlights (chips)" subtitle="Shown as small tags on the listing card — max 4" iconBackground="var(--blue-l)" />
            <div className="chip-grid" style={{ marginBottom: 10 }}>
              {HIGHLIGHTS.map((h) => (
                <button key={h} type="button" className={`chip ${highlights.includes(h) ? 'sel' : ''}`} onClick={() => toggleHl(h)}>
                  {h}
                </button>
              ))}
            </div>
            <label className="label">Custom highlight</label>
            <input
              className="fi"
              placeholder="Type custom highlight + Enter"
              value={hlInput}
              onChange={(e) => setHlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomHl();
                }
              }}
            />
            <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 10 }}>{highlights.length} selected (max 4)</div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 82, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Publish settings</div>
            <label className="label" style={{ marginBottom: 10 }}>
              Approval status
            </label>
            <select className="fi" style={{ marginBottom: 10 }} value={String(form.approvalStatus ?? 'pending')} onChange={(e) => setField('approvalStatus', e.target.value)}>
              <option value="approved">Approved — go live immediately</option>
              <option value="pending">Pending — needs review first</option>
              <option value="draft">Draft — save only, don&apos;t publish</option>
            </select>

            <PublishToggle checked={!!form.isFeatured} onChange={(v) => setField('isFeatured', v)} label="Featured listing" sub="Show in 'Curated for you' on homepage" />
            <PublishToggle checked={!!form.isZeroBrokerage} onChange={(v) => setField('isZeroBrokerage', v)} label="Zero brokerage badge" sub="Display zero brokerage on the card" />
            <PublishToggle
              checked={form.enableWhatsappEnquiry !== false}
              onChange={(v) => setField('enableWhatsappEnquiry', v)}
              label="Enable WhatsApp enquiry"
              sub={`Opens wa.me chat to ${INFRA_WHATSAPP_DISPLAY}`}
            />
          </div>

          <div className="acard" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Check size={16} strokeWidth={1.8} color="#15803d" />
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#15803d' }}>Ready to publish</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: '#166534' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {typeOk ? <Check size={14} strokeWidth={1.8} color="var(--tl)" /> : <span style={{ width: 14 }} />}
                Property type set
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {titleOk ? <Check size={14} strokeWidth={1.8} color="var(--tl)" /> : <span style={{ width: 14 }} />}
                Title & location set
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {ownerOk ? <Check size={14} strokeWidth={1.8} color="var(--tl)" /> : <span style={{ width: 14 }} />}
                Owner info saved
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {photosOk ? <Check size={14} strokeWidth={1.8} color="var(--tl)" /> : <span style={{ width: 14 }} />}
                3 photos uploaded
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {priceOk ? <Check size={14} strokeWidth={1.8} color="var(--tl)" /> : <span style={{ width: 14 }} />}
                Price set
              </span>
            </div>
            <button type="button" className="btn btn-tl btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 14, gap: 8 }} onClick={() => void router.push('/new-property/review')}>
              <Eye size={16} strokeWidth={1.8} />
              Review & submit
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void router.push('/new-property/step3')}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.success('Draft saved')}>
            Save draft
          </button>
          <button type="button" className="btn btn-blue btn-sm" onClick={() => void router.push('/new-property/review')}>
            Review listing →
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
