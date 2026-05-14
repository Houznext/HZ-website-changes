'use client';

import { useRouter } from 'next/router';
import { useListingForm } from '@/context/ListingFormContext';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';

const BHK = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '4BHK+', 'Studio'] as const;
const AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Covered Parking',
  'Clubhouse',
  '24hr Security',
  'Power Backup',
  'CCTV',
  'Children Play Area',
  'Vastu Compliant',
  'Lift',
  'Solar/EV',
  'Jogging Track',
] as const;

export default function NewPropertyStep2() {
  const router = useRouter();
  const { form, setField } = useListingForm();
  const pt = String(form.propertyType ?? 'Apartment');

  const toggleAmenity = (a: string) => {
    const cur = (form.amenities as string[]) ?? [];
    if (cur.includes(a)) setField('amenities', cur.filter((x) => x !== a));
    else setField('amenities', [...cur, a]);
  };

  const next = () => void router.push('/new-property/step3');
  const back = () => void router.push('/new-property');

  const isApt = ['Apartment', 'Studio'].includes(pt);
  const isVilla = ['Villa', 'Row House', 'Farmhouse'].includes(pt);
  const isLand = pt === 'Land';
  const isPlot = pt === 'Plot';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 22 }}>
      <ListingStepProgress step={2} />
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>Step 2 — Property specifics</h2>

      {isApt && (
        <div className="acard">
          <div style={{ marginBottom: 12 }}>
            <div className="label req">BHK</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BHK.map((b) => (
                <button key={b} type="button" className={`chip ${form.bhkType === b ? 'sel' : ''}`} onClick={() => setField('bhkType', b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label req">Carpet area (sqft)</label>
              <input type="number" className="fi" value={String(form.carpetArea ?? '')} onChange={(e) => setField('carpetArea', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Built-up area</label>
              <input type="number" className="fi" value={String(form.builtUpArea ?? '')} onChange={(e) => setField('builtUpArea', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Floor no.</label>
              <input type="number" className="fi" value={String(form.floorNumber ?? '')} onChange={(e) => setField('floorNumber', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Total floors</label>
              <input type="number" className="fi" value={String(form.totalFloors ?? '')} onChange={(e) => setField('totalFloors', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Facing</label>
              <input className="fi" value={String(form.facing ?? '')} onChange={(e) => setField('facing', e.target.value)} />
            </div>
            <div>
              <label className="label">Furnishing</label>
              <input className="fi" value={String(form.furnishingStatus ?? '')} onChange={(e) => setField('furnishingStatus', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="label">Amenities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AMENITIES.map((a) => (
                <button key={a} type="button" className={`chip ${((form.amenities as string[]) ?? []).includes(a) ? 'sel-tl' : ''}`} onClick={() => toggleAmenity(a)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            <label className="tgl">
              <input type="checkbox" checked={!!form.isReraVerified} onChange={(e) => setField('isReraVerified', e.target.checked)} style={{ display: 'none' }} />
              <span className="tgl-track">
                <span className="tgl-thumb" />
              </span>
              RERA verified
            </label>
            <label className="tgl">
              <input type="checkbox" checked={!!form.isTitleClear} onChange={(e) => setField('isTitleClear', e.target.checked)} style={{ display: 'none' }} />
              <span className="tgl-track">
                <span className="tgl-thumb" />
              </span>
              Title clear
            </label>
            <label className="tgl">
              <input type="checkbox" checked={form.isHouznextVerified !== false} onChange={(e) => setField('isHouznextVerified', e.target.checked)} style={{ display: 'none' }} />
              <span className="tgl-track">
                <span className="tgl-thumb" />
              </span>
              Houznext verified
            </label>
          </div>
        </div>
      )}

      {isVilla && (
        <div className="acard">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">BHK</label>
              <select className="fi" value={String(form.bhkType ?? '')} onChange={(e) => setField('bhkType', e.target.value)}>
                {['3BHK', '4BHK', '5BHK', '5BHK+'].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label req">Plot area (sqyds)</label>
              <input type="number" className="fi" value={String(form.plotArea ?? '')} onChange={(e) => setField('plotArea', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
          </div>
        </div>
      )}

      {isLand && (
        <div className="acard">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label req">Land area</label>
              <input type="number" className="fi" value={String(form.landArea ?? '')} onChange={(e) => setField('landArea', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Unit</label>
              <select className="fi" value={String(form.areaUnit ?? 'Sqyds')} onChange={(e) => setField('areaUnit', e.target.value)}>
                {['Sqyds', 'Sqft', 'Acres', 'Guntas', 'Cents'].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Road width</label>
              <input className="fi" value={String(form.roadWidth ?? '')} onChange={(e) => setField('roadWidth', e.target.value)} />
            </div>
            <div>
              <label className="label">Facing</label>
              <input className="fi" value={String(form.facing ?? '')} onChange={(e) => setField('facing', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {isPlot && (
        <div className="acard">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label req">Plot area</label>
              <input type="number" className="fi" value={String(form.plotArea ?? '')} onChange={(e) => setField('plotArea', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div>
              <label className="label">Plot number</label>
              <input className="fi" value={String(form.plotNumber ?? '')} onChange={(e) => setField('plotNumber', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {!isApt && !isVilla && !isLand && !isPlot && (
        <div className="acard">Configure fields for {pt} (defaults).</div>
      )}

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-ghost" onClick={back}>
          ← Back
        </button>
        <button type="button" className="btn btn-blue" onClick={next}>
          Next →
        </button>
      </div>
    </div>
  );
}
