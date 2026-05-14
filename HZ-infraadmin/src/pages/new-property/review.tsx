'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, ChevronLeft, Pencil } from 'lucide-react';
import adminApi from '@/lib/axios';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PropertyCard } from '@/components/listing/PropertyCard';
import { useListingForm } from '@/context/ListingFormContext';
import { buildCreatePropertyPayload } from '@/lib/buildListingPayload';
import { formatPrice } from '@/lib/utils';

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: 9, padding: '11px 13px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch)' }}>{value}</div>
    </div>
  );
}

export default function NewPropertyReview() {
  const router = useRouter();
  const { form, resetForm, editingPropertyId } = useListingForm();
  const [busy, setBusy] = useState(false);

  const base = Number(form.basePrice) || 0;
  const gst = Number(form.gstPercent) || 0;
  const reg = Number(form.registrationPercent) || 0;
  const maint = Number(form.maintenanceDeposit) || 0;
  const other = Number(form.otherCharges) || 0;
  const totalCost = base + (base * gst) / 100 + (base * reg) / 100 + maint + other;
  const carpet = Number(form.carpetArea) || Number(form.builtUpArea) || 0;
  const ppsf = carpet > 0 && base ? base / carpet : 0;

  const photos = (form.photoUrls as string[]) ?? [];
  const cover = String(form.coverImageUrl ?? '');
  const ordered = cover && photos.includes(cover) ? [cover, ...photos.filter((u) => u !== cover)] : photos;
  const showPhotos = ordered.slice(0, 3);

  const runSubmit = async (asDraft?: boolean) => {
    setBusy(true);
    try {
      const merged = asDraft ? { ...form, approvalStatus: 'draft' } : form;
      const payload = buildCreatePropertyPayload(merged);
      let code: string;
      if (editingPropertyId) {
        const res = await adminApi.patch(`/admin/properties/${editingPropertyId}`, payload);
        code = String(res.data?.propertyCode ?? res.data?.propertyId ?? editingPropertyId);
      } else {
        const res = await adminApi.post('/admin/properties', payload);
        code = String(res.data?.propertyCode ?? res.data?.propertyId ?? 'new');
      }
      const titleEnc = encodeURIComponent(String(form.title || 'Your listing'));
      resetForm();
      void router.push(`/new-property/success?code=${encodeURIComponent(String(code))}&title=${titleEnc}`);
    } catch (e: unknown) {
      console.error(e);
      toast.error('Submit failed — check required fields');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      hideSearch
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: '100%' }}>
          <Link href="/new-property/step4" className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
            <ChevronLeft size={15} strokeWidth={1.8} />
            Back to edit
          </Link>
          <div style={{ flex: 1, textAlign: 'center', minWidth: 160 }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>Review listing before publishing</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
            <Link href="/new-property" className="btn btn-ghost btn-sm">
              <Pencil size={14} strokeWidth={1.8} />
              Edit details
            </Link>
            <button type="button" className="btn btn-tl btn-sm" disabled={busy} onClick={() => void runSubmit()}>
              <Check size={14} strokeWidth={1.8} />
              {busy ? 'Publishing…' : 'Confirm & publish'}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="acard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f4f8', marginBottom: 14, paddingBottom: 12 }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700 }}>Basic details</span>
              <Link href="/new-property" className="btn btn-ghost btn-sm">
                <Pencil size={14} strokeWidth={1.8} />
                Edit
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <Cell label="Type" value={String(form.propertyType ?? '—')} />
              <Cell label="Listing for" value={String(form.listingFor ?? '—')} />
              <Cell label="Status" value={String(form.constructionStatus ?? '—')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Cell label="Title" value={String(form.title ?? '—')} />
              </div>
              <Cell label="City" value={String(form.city ?? '—')} />
              <Cell label="Locality" value={String(form.locality ?? '—')} />
              <Cell label="Pincode" value={String(form.pincode ?? '—')} />
            </div>
          </div>

          <div className="acard card-owner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f4f8', marginBottom: 14, paddingBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700 }}>Owner details</span>
                <span className="admin-only">Admin only</span>
              </div>
              <Link href="/new-property" className="btn btn-ghost btn-sm">
                <Pencil size={14} strokeWidth={1.8} />
                Edit
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ gridColumn: 'span 1', background: '#fffbeb', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>Owner name</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch)' }}>{String(form.ownerName ?? '—')}</div>
              </div>
              <div style={{ gridColumn: 'span 1', background: '#fffbeb', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>Phone</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch)' }}>{String(form.ownerPhone ?? '—')}</div>
              </div>
              <div style={{ gridColumn: 'span 1', background: '#fffbeb', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>Listed by</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ch)' }}>{String(form.listedBy ?? '—')}</div>
              </div>
            </div>
          </div>

          <div className="acard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f4f8', marginBottom: 14, paddingBottom: 12 }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700 }}>Pricing</span>
              <Link href="/new-property/step3" className="btn btn-ghost btn-sm">
                <Pencil size={14} strokeWidth={1.8} />
                Edit
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <div style={{ background: '#f8fafc', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>Base price</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--ch)' }}>{formatPrice(Math.round(base))}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>Per sqft</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{ppsf ? `₹${Math.round(ppsf).toLocaleString('en-IN')}` : '—'}</div>
              </div>
              <Cell label="RERA no." value={String(form.reraNumber || '—')} />
              <div style={{ background: '#f8fafc', borderRadius: 9, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif', color: 'var(--mu)', marginBottom: 3 }}>Total cost</div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--tl)' }}>{formatPrice(Math.round(totalCost))}</div>
              </div>
            </div>
          </div>

          <div className="acard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f4f8', marginBottom: 14, paddingBottom: 12 }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700 }}>Photos</span>
              <Link href="/new-property/step4" className="btn btn-ghost btn-sm">
                <Pencil size={14} strokeWidth={1.8} />
                Edit
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {showPhotos.length ? (
                showPhotos.map((url, i) => (
                  <div key={url + i} className={`up-thumb${url === cover || (!cover && i === 0) ? ' cover' : ''}`} style={{ width: 100, height: 72 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {url === cover || (!cover && i === 0) ? <span className="prev-cover-lbl">COVER</span> : null}
                  </div>
                ))
              ) : (
                <span style={{ fontSize: 13, color: 'var(--mu)' }}>No photos yet</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 82, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mu)', marginBottom: 12 }}>How it looks on website</div>
            <PropertyCard form={form} />
          </div>

          <div className="acard" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <p style={{ fontSize: 12, color: '#0c4a6e', marginBottom: 12 }}>Property will go to Pending review first. Admin can approve from the listings dashboard.</p>
            <button type="button" className="btn btn-tl btn-lg" style={{ width: '100%', justifyContent: 'center', gap: 8 }} disabled={busy} onClick={() => void runSubmit()}>
              <Check size={16} strokeWidth={1.8} />
              {busy ? 'Submitting…' : 'Submit listing'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={busy} onClick={() => void runSubmit(true)}>
              Save as draft instead
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
