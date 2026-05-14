'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, FileText, Monitor, ShieldCheck, Sparkles } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { ListingWizardHeader } from '@/components/listing/ListingWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useListingForm } from '@/context/ListingFormContext';

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

const FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'];
const PARKING = ['No parking', '1 covered', '2 covered', 'Open parking'];
const FURNISHING = ['Unfurnished', 'Semi-furnished', 'Fully furnished'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = ['2025', '2026', '2027', '2028'];

function ToggleRow({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className="tgl" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8, userSelect: 'none' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
      <span className="tgl-track">
        <span className="tgl-thumb" />
      </span>
      <div className="tgl-stack">
        <div style={{ fontSize: 12.5, color: 'var(--ch)', fontWeight: 500 }}>{label}</div>
        {sub ? <div className="tgl-sub">{sub}</div> : null}
      </div>
    </label>
  );
}

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

  const accent = isVilla ? 'rose' : isLand ? 'amber' : isPlot ? 'teal' : 'blue';

  const possessionParts = String(form.possessionDate ?? '').split(' ');
  const pMonth = MONTHS.includes(possessionParts[0] ?? '') ? possessionParts[0] : 'Jan';
  const pYear = YEARS.includes(possessionParts[1] ?? '') ? possessionParts[1] : '2026';
  const setPossession = (month: string, year: string) => setField('possessionDate', `${month} ${year}`);

  const typeTitle =
    pt === 'Villa' || pt === 'Row House' || pt === 'Farmhouse'
      ? (
          <>
            Property specifics — <span style={{ color: '#db2777' }}>{pt}</span>
          </>
        )
      : isLand
        ? (
            <>
              Property specifics — <span style={{ color: 'var(--am)' }}>Land</span>
            </>
          )
        : isPlot
          ? (
              <>
                Property specifics — <span style={{ color: 'var(--tl)' }}>Plot</span>
              </>
            )
          : (
              <>
                Property specifics — <span style={{ color: 'var(--blue)' }}>{pt}</span>
              </>
            );

  return (
    <AdminLayout
      hideSearch
      header={
        <ListingWizardHeader
          backHref="/new-property"
          centerTitle={typeTitle}
          onSaveDraft={() => toast.success('Draft saved')}
          primaryLabel="Next: Pricing & Docs →"
          onPrimary={next}
        />
      }
    >
      <ListingStepProgress step={2} accent={accent} />

      {isApt && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
          <div>
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider
                icon={<Building2 size={16} strokeWidth={1.8} color="var(--blue)" />}
                title="Size & configuration"
                iconBackground="var(--blue-l)"
              />
              <div style={{ marginBottom: 12 }}>
                <label className="label req">BHK type</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.bhkType ?? '3BHK')} onChange={(e) => setField('bhkType', e.target.value)}>
                  {BHK.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label req">Carpet area (sqft)</label>
                  <input type="number" className="fi" value={String(form.carpetArea ?? '')} onChange={(e) => setField('carpetArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 1450" />
                </div>
                <div>
                  <label className="label">Built-up area (sqft)</label>
                  <input type="number" className="fi" value={String(form.builtUpArea ?? '')} onChange={(e) => setField('builtUpArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 1680" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Super built-up area (sqft)</label>
                  <input type="number" className="fi" value={String(form.superBuiltUpArea ?? '')} onChange={(e) => setField('superBuiltUpArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 1920" />
                </div>
              </div>
            </div>

            <div className="acard">
              <SectionDivider
                icon={<Monitor size={16} strokeWidth={1.8} color="#7c3aed" />}
                title="Floor & unit details"
                iconBackground="#f3e8ff"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Floor number</label>
                  <input type="number" className="fi" value={String(form.floorNumber ?? '')} onChange={(e) => setField('floorNumber', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="label">Total floors in building</label>
                  <input type="number" className="fi" value={String(form.totalFloors ?? '')} onChange={(e) => setField('totalFloors', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 22" />
                </div>
                <div>
                  <label className="label">Tower name</label>
                  <input className="fi" value={String(form.towerName ?? '')} onChange={(e) => setField('towerName', e.target.value)} placeholder="e.g. Tower A" />
                </div>
                <div>
                  <label className="label">Facing direction</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.facing ?? '')} onChange={(e) => setField('facing', e.target.value)}>
                    <option value="">Select</option>
                    {FACINGS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Parking</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.parkingType ?? '')} onChange={(e) => setField('parkingType', e.target.value)}>
                    <option value="">Select</option>
                    {PARKING.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Furnishing status</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.furnishingStatus ?? '')} onChange={(e) => setField('furnishingStatus', e.target.value)}>
                    <option value="">Select</option>
                    {FURNISHING.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="label">Possession date</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="fi" style={{ flex: 1 }} value={pMonth} onChange={(e) => setPossession(e.target.value, pYear)}>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select className="fi" style={{ flex: 1 }} value={pYear} onChange={(e) => setPossession(pMonth, e.target.value)}>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="label">Linked project (optional)</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.linkedProjectId ?? '')} onChange={(e) => setField('linkedProjectId', e.target.value)}>
                  <option value="">None — standalone unit</option>
                  <option value="skyline">Skyline Heights</option>
                  <option value="green">Green Valley Villas</option>
                  <option value="nova">Nova Commercial Park</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider
                icon={<ShieldCheck size={16} strokeWidth={1.8} color="#16a34a" />}
                title="Amenities"
                subtitle="Select all that apply"
                iconBackground="#f0fdf4"
              />
              <div className="chip-grid">
                {AMENITIES.map((a) => (
                  <button key={a} type="button" className={`chip ${((form.amenities as string[]) ?? []).includes(a) ? 'sel-tl' : ''}`} onClick={() => toggleAmenity(a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="acard">
              <SectionDivider
                icon={<ShieldCheck size={16} strokeWidth={1.8} color="var(--tl)" />}
                title="Verification status"
                subtitle="Shown as trust badges on listing"
                iconBackground="#ccfbf1"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ToggleRow checked={!!form.isReraVerified} onChange={(v) => setField('isReraVerified', v)} label="RERA Verified" sub="Shows verified badge on listing" />
                <ToggleRow checked={!!form.isTitleClear} onChange={(v) => setField('isTitleClear', v)} label="Title Clear" sub="Encumbrance certificate verified" />
                <ToggleRow checked={form.isHouznextVerified !== false} onChange={(v) => setField('isHouznextVerified', v)} label="Houznext Verified" sub="Property visited by Houznext team" />
              </div>
            </div>
          </div>
        </div>
      )}

      {isVilla && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="acard">
            <SectionDivider icon={<Sparkles size={16} strokeWidth={1.8} color="#db2777" />} title="Villa size & layout" iconBackground="#fce7f3" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label req">BHK type</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.bhkType ?? '3BHK')} onChange={(e) => setField('bhkType', e.target.value)}>
                  {['3BHK', '4BHK', '5BHK', '5BHK+'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label req">Plot area (sqyds)</label>
                <input type="number" className="fi" value={String(form.plotArea ?? '')} onChange={(e) => setField('plotArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 200" />
              </div>
              <div>
                <label className="label">Built-up area (sqft)</label>
                <input type="number" className="fi" value={String(form.builtUpArea ?? '')} onChange={(e) => setField('builtUpArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 3200" />
              </div>
              <div>
                <label className="label">Carpet area (sqft)</label>
                <input type="number" className="fi" value={String(form.carpetArea ?? '')} onChange={(e) => setField('carpetArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 2800" />
              </div>
              <div>
                <label className="label">Number of floors</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.numberOfFloors ?? '')} onChange={(e) => setField('numberOfFloors', e.target.value)}>
                  {['G+0 (Ground only)', 'G+1', 'G+2', 'G+3', 'G+4+'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Facing</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.facing ?? '')} onChange={(e) => setField('facing', e.target.value)}>
                  <option value="">Select</option>
                  {['East', 'West', 'North', 'South', 'North-East'].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Parking</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.parkingType ?? '')} onChange={(e) => setField('parkingType', e.target.value)}>
                  {['1 car garage', '2 car garage', '3 car garage', 'Open parking'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Furnishing status</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.furnishingStatus ?? '')} onChange={(e) => setField('furnishingStatus', e.target.value)}>
                  {FURNISHING.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Possession date</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="fi" style={{ flex: 1 }} value={pMonth} onChange={(e) => setPossession(e.target.value, pYear)}>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select className="fi" style={{ flex: 1 }} value={pYear} onChange={(e) => setPossession(pMonth, e.target.value)}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="#16a34a" />} title="Features & amenities" iconBackground="#f0fdf4" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <ToggleRow checked={!!form.isGatedCommunity} onChange={(v) => setField('isGatedCommunity', v)} label="Gated community" />
                <ToggleRow checked={!!form.isVastuCompliant} onChange={(v) => setField('isVastuCompliant', v)} label="Vastu compliant" />
                <ToggleRow checked={!!form.hasPrivatePool} onChange={(v) => setField('hasPrivatePool', v)} label="Private swimming pool" />
                <ToggleRow checked={!!form.hasGarden} onChange={(v) => setField('hasGarden', v)} label="Garden / lawn area" />
                <ToggleRow checked={!!form.hasSmartHome} onChange={(v) => setField('hasSmartHome', v)} label="Smart home automation" />
                <ToggleRow checked={!!form.hasEVCharging} onChange={(v) => setField('hasEVCharging', v)} label="EV charging point" />
              </div>
            </div>
            <div className="acard">
              <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="var(--tl)" />} title="Verification status" subtitle="Shown as trust badges on listing" iconBackground="#ccfbf1" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ToggleRow checked={!!form.isReraVerified} onChange={(v) => setField('isReraVerified', v)} label="RERA Verified" sub="Shows verified badge on listing" />
                <ToggleRow checked={!!form.isTitleClear} onChange={(v) => setField('isTitleClear', v)} label="Title Clear" sub="Encumbrance certificate verified" />
                <ToggleRow checked={form.isHouznextVerified !== false} onChange={(v) => setField('isHouznextVerified', v)} label="Houznext Verified" sub="Property visited by Houznext team" />
              </div>
            </div>
          </div>
        </div>
      )}

      {isLand && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider icon={<Building2 size={16} strokeWidth={1.8} color="var(--am)" />} title="Land area & dimensions" iconBackground="#fffbeb" />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label className="label req">Land area</label>
                  <input type="number" className="fi" value={String(form.landArea ?? '')} onChange={(e) => setField('landArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="label req">Unit</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.areaUnit ?? 'Sqyds')} onChange={(e) => setField('areaUnit', e.target.value)}>
                    {['Sqyds', 'Sqft', 'Acres', 'Guntas', 'Cents'].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label className="label">Road width (ft)</label>
                  <input className="fi" value={String(form.roadWidth ?? '')} onChange={(e) => setField('roadWidth', e.target.value)} placeholder="e.g. 33" />
                </div>
                <div>
                  <label className="label">Facing</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.facing ?? '')} onChange={(e) => setField('facing', e.target.value)}>
                    <option value="">Select</option>
                    {FACINGS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="acard">
              <SectionDivider icon={<FileText size={16} strokeWidth={1.8} color="#ca8a04" />} title="Legal & approval" iconBackground="#fef9c3" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label req">Land use type</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.landUseType ?? '')} onChange={(e) => setField('landUseType', e.target.value)}>
                    <option value="">Select</option>
                    {['Residential', 'Agricultural', 'Commercial', 'Industrial', 'Mixed use'].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label req">Approval authority</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.approvalAuthority ?? '')} onChange={(e) => setField('approvalAuthority', e.target.value)}>
                    {['HMDA', 'HUDA', 'BDA (Bengaluru)', 'DTCP', 'Gram Panchayat', 'Municipal', 'CMDA (Chennai)'].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Survey number</label>
                  <input className="fi" value={String(form.surveyNumber ?? '')} onChange={(e) => setField('surveyNumber', e.target.value)} placeholder="Government survey no." />
                </div>
                <div>
                  <label className="label">Layout name</label>
                  <input className="fi" value={String(form.layoutName ?? '')} onChange={(e) => setField('layoutName', e.target.value)} placeholder="e.g. HMDA Layout Sector 4" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <ToggleRow checked={!!form.isEcVerified} onChange={(v) => setField('isEcVerified', v)} label="EC Verified (Encumbrance Certificate)" />
                <ToggleRow checked={!!form.isTitleClear} onChange={(v) => setField('isTitleClear', v)} label="Title clear" />
                <ToggleRow checked={!!form.isPattaAvailable} onChange={(v) => setField('isPattaAvailable', v)} label="Patta available" />
                <ToggleRow checked={!!form.isCornerPlot} onChange={(v) => setField('isCornerPlot', v)} label="Corner plot" />
              </div>
            </div>
          </div>
          <div className="acard">
            <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="#16a34a" />} title="Utilities & features" iconBackground="#f0fdf4" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div>
                <label className="label">Water source</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.waterSource ?? '')} onChange={(e) => setField('waterSource', e.target.value)}>
                  {['None', 'Borewell', 'Municipal supply', 'Both'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Electricity</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.electricity ?? '')} onChange={(e) => setField('electricity', e.target.value)}>
                  {['Not available', 'EB connection available', 'Street lighting only'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Zone type</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.zoneType ?? '')} onChange={(e) => setField('zoneType', e.target.value)}>
                  {['Residential zone', 'Commercial zone', 'Industrial zone', 'Agricultural zone'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="info-box" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 12, color: '#0c4a6e' }}>
                Land listing tip: Properties with EC verification and clear title show a trust badge and rank higher in search results. Upload the EC document in Step 3.
              </span>
            </div>
          </div>
        </div>
      )}

      {isPlot && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider icon={<Building2 size={16} strokeWidth={1.8} color="var(--tl)" />} title="Plot dimensions" iconBackground="#ccfbf1" />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div>
                  <label className="label req">Plot area</label>
                  <input type="number" className="fi" value={String(form.plotArea ?? '')} onChange={(e) => setField('plotArea', e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 200" />
                </div>
                <div>
                  <label className="label req">Unit</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.areaUnit ?? 'Sqyds')} onChange={(e) => setField('areaUnit', e.target.value)}>
                    {['Sqyds', 'Sqft'].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div>
                  <label className="label">Plot number</label>
                  <input className="fi" value={String(form.plotNumber ?? '')} onChange={(e) => setField('plotNumber', e.target.value)} placeholder="Plot No. 42" />
                </div>
                <div>
                  <label className="label">Layout / Scheme name</label>
                  <input className="fi" value={String(form.layoutName ?? '')} onChange={(e) => setField('layoutName', e.target.value)} placeholder="e.g. Greenfields Enclave" />
                </div>
                <div>
                  <label className="label">Road width (ft)</label>
                  <input className="fi" value={String(form.roadWidth ?? '')} onChange={(e) => setField('roadWidth', e.target.value)} placeholder="e.g. 33" />
                </div>
                <div>
                  <label className="label">Facing</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.facing ?? '')} onChange={(e) => setField('facing', e.target.value)}>
                    {['East', 'West', 'North', 'South'].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="acard">
              <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="#ca8a04" />} title="Approval details" iconBackground="#fef9c3" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label req">Approval type</label>
                  <select className="fi" style={{ width: '100%' }} value={String(form.approvalType ?? '')} onChange={(e) => setField('approvalType', e.target.value)}>
                    {['HMDA Approved', 'RERA Approved', 'DTCP Approved', 'BDA Approved', 'LP Scheme', 'Unapproved'].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Approval number</label>
                  <input className="fi" value={String(form.approvalNumber ?? '')} onChange={(e) => setField('approvalNumber', e.target.value)} placeholder="e.g. HMDA/LP/2022/452" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="label">Possession</label>
                <select className="fi" style={{ width: '100%' }} value={String(form.possessionDate ?? '')} onChange={(e) => setField('possessionDate', e.target.value)}>
                  {['Immediate', 'On registration', 'Within 1 month', 'Within 3 months', 'Future date'].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="#16a34a" />} title="Features" iconBackground="#f0fdf4" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <ToggleRow checked={!!form.isGatedLayout} onChange={(v) => setField('isGatedLayout', v)} label="Gated layout" />
                <ToggleRow checked={!!form.isCornerPlot} onChange={(v) => setField('isCornerPlot', v)} label="Corner plot" />
                <ToggleRow checked={!!form.hasCompoundWall} onChange={(v) => setField('hasCompoundWall', v)} label="Compound wall" />
                <ToggleRow checked={!!form.isReadyToRegister} onChange={(v) => setField('isReadyToRegister', v)} label="Ready to register" />
                <ToggleRow checked={!!form.hasEBConnection} onChange={(v) => setField('hasEBConnection', v)} label="EB connection available" />
                <ToggleRow checked={!!form.hasBorewell} onChange={(v) => setField('hasBorewell', v)} label="Borewell / water supply" />
                <ToggleRow checked={!!form.hasDrainage} onChange={(v) => setField('hasDrainage', v)} label="Drainage connection" />
              </div>
            </div>
            <div className="acard">
              <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="var(--tl)" />} title="Verification" iconBackground="#ccfbf1" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ToggleRow checked={!!form.isTitleClear} onChange={(v) => setField('isTitleClear', v)} label="Title clear / EC Verified" />
                <ToggleRow checked={!!form.isReraVerified} onChange={(v) => setField('isReraVerified', v)} label="RERA registered" />
                <ToggleRow checked={form.isHouznextVerified !== false} onChange={(v) => setField('isHouznextVerified', v)} label="Houznext Verified" />
              </div>
            </div>
          </div>
        </div>
      )}

      {!isApt && !isVilla && !isLand && !isPlot && (
        <div className="acard">Configure fields for {pt} (defaults).</div>
      )}

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={back}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.success('Draft saved')}>
            Save draft
          </button>
          <button type="button" className="btn btn-blue btn-sm" onClick={next}>
            Next: Pricing & Docs →
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
