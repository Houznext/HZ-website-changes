'use client';

import { useRouter } from 'next/router';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { useListingForm } from '@/context/ListingFormContext';

const TYPES = ['Apartment', 'Villa', 'Land', 'Plot', 'Row House', 'Commercial', 'Studio', 'Farmhouse'] as const;

export default function NewPropertyStep1() {
  const router = useRouter();
  const { form, setField } = useListingForm();

  const next = () => {
    if (!form.title || String(form.title).trim() === '') {
      alert('Title is required');
      return;
    }
    if (!form.city || !form.locality) {
      alert('City and locality are required');
      return;
    }
    if (!form.ownerName || !form.ownerPhone) {
      alert('Owner name and phone are required');
      return;
    }
    void router.push('/new-property/step2');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 22 }}>
      <ListingStepProgress step={1} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>Step 1 — Basic & owner</h2>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Property type</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${form.propertyType === t ? 'sel' : ''}`}
                  onClick={() => setField('propertyType', t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Listing for</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Buy', 'Rent'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip ${form.listingFor === t ? 'sel' : ''}`}
                  onClick={() => setField('listingFor', t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label req">Title</label>
            <input className="fi" value={String(form.title ?? '')} onChange={(e) => setField('title', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label req">City</label>
              <select className="fi" value={String(form.city ?? '')} onChange={(e) => setField('city', e.target.value)}>
                <option value="">Select</option>
                {['Hyderabad', 'Bengaluru', 'Chennai', 'Mumbai'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label req">Locality</label>
              <input className="fi" value={String(form.locality ?? '')} onChange={(e) => setField('locality', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Full address</label>
            <textarea className="fi" rows={3} value={String(form.address ?? '')} onChange={(e) => setField('address', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label className="label">Pincode</label>
              <input className="fi" value={String(form.pincode ?? '')} onChange={(e) => setField('pincode', e.target.value)} />
            </div>
            <div>
              <label className="label req">Construction status</label>
              <select
                className="fi"
                value={String(form.constructionStatus ?? '')}
                onChange={(e) => setField('constructionStatus', e.target.value)}
              >
                {['Ready to Move', 'Under Construction', 'New Launch'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Description</label>
            <textarea className="fi" rows={4} value={String(form.description ?? '')} onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="acard" style={{ marginTop: 18, border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="admin-only">Admin only</span>
            </div>
            <div className="warn-box" style={{ marginBottom: 12 }}>
              Never shown on public website — internal owner record only.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label req">Owner full name</label>
                <input className="fi" value={String(form.ownerName ?? '')} onChange={(e) => setField('ownerName', e.target.value)} />
              </div>
              <div>
                <label className="label req">Owner phone</label>
                <input className="fi" value={String(form.ownerPhone ?? '')} onChange={(e) => setField('ownerPhone', e.target.value)} />
              </div>
              <div>
                <label className="label">Owner email</label>
                <input className="fi" type="email" value={String(form.ownerEmail ?? '')} onChange={(e) => setField('ownerEmail', e.target.value)} />
              </div>
              <div>
                <label className="label">Alternate phone</label>
                <input className="fi" value={String(form.ownerAlternatePhone ?? '')} onChange={(e) => setField('ownerAlternatePhone', e.target.value)} />
              </div>
              <div>
                <label className="label">Listed by</label>
                <select className="fi" value={String(form.listedBy ?? 'Houznext')} onChange={(e) => setField('listedBy', e.target.value)}>
                  {['Houznext', 'Developer', 'Public'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Source</label>
                <select className="fi" value={String(form.leadSource ?? 'Website')} onChange={(e) => setField('leadSource', e.target.value)}>
                  {['Walk-in', 'Website', 'Developer submission', 'Referral', 'Field team'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Branch</label>
                <input className="fi" value={String(form.branch ?? '')} onChange={(e) => setField('branch', e.target.value)} placeholder="Branch id or name" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Internal notes</label>
                <textarea className="fi" rows={3} value={String(form.internalNotes ?? '')} onChange={(e) => setField('internalNotes', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-blue" onClick={next}>
              Next →
            </button>
          </div>
        </div>
        <div>
          <div className="acard" style={{ position: 'sticky', top: 80 }}>
            <div className="label">Live preview</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{String(form.title || 'Listing title')}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              {String(form.city || 'City')} · {String(form.propertyType)}
            </div>
            <div style={{ marginTop: 14, fontSize: 12 }}>
              <div>✓ Title</div>
              <div>✓ Type & listing</div>
              <div>✓ Location</div>
              <div>✓ Owner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
