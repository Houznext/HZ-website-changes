'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { AlertTriangle, Building2, CreditCard, FileText, Lock, ShoppingBag } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { ListingWizardHeader } from '@/components/listing/ListingWizardHeader';
import { PropertyCard } from '@/components/listing/PropertyCard';
import { PropertyTypeIcon } from '@/components/listing/PropertyTypeIcon';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useListingForm } from '@/context/ListingFormContext';

const TYPES = ['Apartment', 'Villa', 'Land', 'Plot', 'Row House', 'Commercial', 'Studio', 'Farmhouse'] as const;
const ic = { size: 18, strokeWidth: 1.8, fill: 'none' as const };

export default function NewPropertyStep1() {
  const router = useRouter();
  const { form, setField } = useListingForm();

  const next = () => {
    if (!form.propertyType) {
      toast.error('Select a property type');
      return;
    }
    if (!form.title || String(form.title).trim() === '') {
      toast.error('Title is required');
      return;
    }
    if (!form.city || !form.locality) {
      toast.error('City and locality are required');
      return;
    }
    if (!form.ownerName || !form.ownerPhone) {
      toast.error('Owner name and phone are required');
      return;
    }
    void router.push('/new-property/step2');
  };

  const typeOk = !!form.propertyType;
  const titleOk = !!(form.title && String(form.title).trim());
  const locOk = !!(form.city && form.locality);
  const ownerOk = !!(form.ownerName && form.ownerPhone);

  return (
    <AdminLayout
      hideSearch
      header={
        <ListingWizardHeader
          backHref="/listings"
          centerTitle="Add new property"
          onSaveDraft={() => toast.success('Draft saved')}
          primaryLabel="Next: Property details →"
          onPrimary={next}
        />
      }
    >
      <ListingStepProgress step={1} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div>
          <div className="acard" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #f0f4f8' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: 'var(--blue-l)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Building2 size={18} strokeWidth={1.8} color="var(--blue)" />
              </div>
              <div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700, color: 'var(--ch)' }}>Property type</div>
                <div style={{ fontSize: 12, color: 'var(--mu)' }}>Select the type — fields will change accordingly</div>
              </div>
            </div>
            <div className="chip-grid" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${form.propertyType === t ? 'sel' : ''}`}
                  onClick={() => setField('propertyType', t)}
                >
                  <span className="pt-icon" style={{ color: form.propertyType === t ? 'var(--blue)' : 'var(--mu)' }}>
                    <PropertyTypeIcon type={t} />
                  </span>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="label req">Listing for</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['Buy', 'Rent'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${form.listingFor === t ? 'sel' : ''}`}
                    onClick={() => setField('listingFor', t)}
                  >
                    {t === 'Buy' ? <ShoppingBag {...ic} color="currentColor" /> : <CreditCard {...ic} color="currentColor" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider
              icon={<FileText size={16} strokeWidth={1.8} color="var(--blue)" />}
              title="Property details"
              subtitle="Basic listing information"
              iconBackground="var(--blue-l)"
            />
            <div style={{ marginBottom: 16 }}>
              <label className="label req">Property title</label>
              <input
                className="fi"
                style={{ width: '100%' }}
                value={String(form.title ?? '')}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g. Skyline Heights — 3BHK Tower A, Gachibowli"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label req">City</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.city ?? '')} onChange={(e) => setField('city', e.target.value)}>
                  <option value="">Select city</option>
                  {['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label req">Locality / Area</label>
                <input
                  className="fi"
                  value={String(form.locality ?? '')}
                  onChange={(e) => setField('locality', e.target.value)}
                  placeholder="e.g. Gachibowli, Madhapur"
                />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Full address</label>
              <textarea
                className="fi"
                rows={2}
                value={String(form.address ?? '')}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Street address, landmark…"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label className="label">Pincode</label>
                <input className="fi" type="number" value={String(form.pincode ?? '')} onChange={(e) => setField('pincode', e.target.value)} placeholder="500032" />
              </div>
              <div>
                <label className="label req">Construction status</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.constructionStatus ?? '')} onChange={(e) => setField('constructionStatus', e.target.value)}>
                  {['Ready to Move', 'Under Construction', 'New Launch'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Property description</label>
              <textarea
                className="fi"
                rows={3}
                value={String(form.description ?? '')}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Describe the property — surroundings, highlights, access…"
              />
            </div>
          </div>

          <div className="acard card-owner" style={{ marginBottom: 18, border: '1.5px solid #fde68a' }}>
            <div className="sdiv" style={{ marginTop: 0 }}>
              <div className="sdiv-icon" style={{ background: '#fef9c3' }}>
                <Lock size={16} strokeWidth={1.8} color="#ca8a04" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="sdiv-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Owner / Seller information
                  <span className="admin-only">
                    <Lock size={9} strokeWidth={1.8} />
                    Admin only
                  </span>
                </div>
                <div className="sdiv-sub">Visible only in Admin — never shown on website</div>
              </div>
              <div className="sdiv-line" />
            </div>

            <div className="warn-box" style={{ marginBottom: 14 }}>
              <AlertTriangle size={18} strokeWidth={1.8} color="#ca8a04" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: '#92400e' }}>
                Owner contact details are stored for internal use only. They are never displayed to website visitors or buyers.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label req">Owner full name</label>
                <input className="fi" value={String(form.ownerName ?? '')} onChange={(e) => setField('ownerName', e.target.value)} placeholder="Full name of property owner" />
              </div>
              <div>
                <label className="label req">Owner phone</label>
                <input className="fi" type="tel" value={String(form.ownerPhone ?? '')} onChange={(e) => setField('ownerPhone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Owner email</label>
                <input className="fi" type="email" value={String(form.ownerEmail ?? '')} onChange={(e) => setField('ownerEmail', e.target.value)} placeholder="owner@email.com" />
              </div>
              <div>
                <label className="label">Alternate phone</label>
                <input className="fi" type="tel" value={String(form.ownerAlternatePhone ?? '')} onChange={(e) => setField('ownerAlternatePhone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label className="label">Listed by</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.listedBy ?? 'Houznext')} onChange={(e) => setField('listedBy', e.target.value)}>
                  {['Houznext', 'Developer', 'Public'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Source / How acquired</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.leadSource ?? 'Website')} onChange={(e) => setField('leadSource', e.target.value)}>
                  {['Walk-in', 'Website', 'Developer submission', 'Referral', 'Field team'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Branch</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.branch ?? '')} onChange={(e) => setField('branch', e.target.value)}>
                  <option value="">Select branch</option>
                  {['Hyderabad HQ', 'Bengaluru', 'Chennai', 'Mumbai'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Internal notes (admin only)</label>
              <textarea
                className="fi"
                rows={2}
                value={String(form.internalNotes ?? '')}
                onChange={(e) => setField('internalNotes', e.target.value)}
                placeholder="Any notes about the owner, negotiation status, deal terms…"
              />
            </div>
          </div>

          <div style={{ paddingTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => void router.push('/listings')}>
              ← Back
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.success('Draft saved')}>
                Save draft
              </button>
              <button type="button" className="btn btn-blue btn-sm" onClick={next}>
                Next: Property details →
              </button>
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 82, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Live preview
            </div>
            <PropertyCard form={form} />
          </div>

          <div className="acard" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#15803d' }}>✓</span>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#15803d' }}>Step 1 complete when:</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { ok: typeOk, label: 'Property type selected' },
                { ok: titleOk, label: 'Title entered' },
                { ok: locOk, label: 'City & locality set' },
                { ok: ownerOk, label: 'Owner name & phone' },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#64748b' }}>
                  {row.ok ? <span style={{ color: '#16a34a' }}>✓</span> : <span style={{ color: '#cbd5e1' }}>○</span>}
                  {row.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
