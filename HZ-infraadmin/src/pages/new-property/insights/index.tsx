'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Check,
  Circle,
  Info,
  LineChart,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { ListingWizardHeader } from '@/components/listing/ListingWizardHeader';
import { PropertyTypeIcon } from '@/components/listing/PropertyTypeIcon';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useListingForm } from '@/context/ListingFormContext';
import {
  TYPE_GUIDES,
  computePrefillPrice,
  computeQualityScore,
  createDefaultInsights,
  emptyCompRow,
  isInsightsFormEmpty,
  pctChange,
  projectionYears,
  showsCagr,
  showsCommercialFields,
  showsLandFields,
  showsNewSupply,
  showsPlotFields,
  showsRentalYield,
  showsVacancy,
  type PropertyInsightsForm,
} from '@/lib/insightsHelpers';

const PREFILL_KEY = 'infra_insights_prefill_done';

function InsightsToggle({
  checked,
  onChange,
  label,
  sub,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className="publish-tgl-wrap tgl"
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        marginBottom: 0,
        gap: 10,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      <span className="tgl-track">
        <span className="tgl-thumb" />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="tgl-stack" style={{ fontSize: 12.5, color: 'var(--ch)', fontWeight: 500 }}>
          {label}
        </span>
        {sub ? <span className="tgl-sub">{sub}</span> : null}
      </span>
    </label>
  );
}

function MiniPreviewChart({
  actual,
  projections,
}: {
  actual: number[];
  projections: (number | undefined)[];
}) {
  const max = Math.max(...actual, ...projections.filter((v): v is number => v != null && v > 0), 1);
  const bars = [
    ...actual.map((v, i) => ({ v, kind: 'actual' as const, key: `a${i}` })),
    ...projections.map((v, i) => ({ v: v ?? 0, kind: 'proj' as const, key: `p${i}` })),
  ].slice(0, 8);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 72, marginTop: 10 }}>
      {bars.map((b) => {
        const h = b.v > 0 ? Math.max(8, Math.round((b.v / max) * 64)) : 12;
        const bg = b.v <= 0 ? '#e2e8f0' : b.kind === 'actual' ? 'var(--blue)' : '#f59e0b';
        return (
          <div
            key={b.key}
            style={{
              flex: 1,
              height: h,
              borderRadius: 4,
              background: bg,
              opacity: b.v <= 0 ? 0.5 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

export default function NewPropertyInsightsStep() {
  const router = useRouter();
  const { form, insights, updateInsights, resetInsights, setField } = useListingForm();
  const propertyType = String(form.propertyType ?? 'Apartment');
  const unit = insights?.price_unit ?? (propertyType === 'Plot' ? 'sqyd' : propertyType === 'Land' ? 'acre' : 'sqft');
  const [savedAgo, setSavedAgo] = useState(0);
  const [debounced, setDebounced] = useState<PropertyInsightsForm | null>(insights);
  const prefillDone = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setSavedAgo((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setSavedAgo(0);
  }, [insights]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(insights), 300);
    return () => clearTimeout(id);
  }, [insights]);

  useEffect(() => {
    if (prefillDone.current) return;
    const sessionFlag = typeof window !== 'undefined' ? sessionStorage.getItem(PREFILL_KEY) : null;
    if (sessionFlag === '1' && insights) {
      prefillDone.current = true;
      return;
    }
    const prefill = computePrefillPrice(form);
    if (!insights) {
      const draft = createDefaultInsights(propertyType, prefill);
      setField('insights', draft);
      prefillDone.current = true;
      if (typeof window !== 'undefined') sessionStorage.setItem(PREFILL_KEY, '1');
      return;
    }
    if (!insights.price_current && prefill > 0) {
      updateInsights({ price_current: prefill, _prefilledPrice: prefill });
      prefillDone.current = true;
      if (typeof window !== 'undefined') sessionStorage.setItem(PREFILL_KEY, '1');
    }
  }, [form, insights, propertyType, setField, updateInsights]);

  const data = insights ?? createDefaultInsights(propertyType);

  const isPrefilled =
    data._prefilledPrice != null && data._prefilledPrice > 0 && data.price_current === data._prefilledPrice;

  const app10 = pctChange(data.price_current, data.price_10y_ago);
  const app5 = pctChange(data.price_current, data.price_5y_ago);

  const quality = useMemo(() => computeQualityScore(data), [data]);

  const guide = TYPE_GUIDES[propertyType] ?? TYPE_GUIDES.Apartment;

  const previewKpis = useMemo(() => {
    const d = debounced ?? data;
    const a10 = pctChange(d.price_current, d.price_10y_ago);
    const yieldVal = showsCagr(propertyType)
      ? d.cagr != null
        ? `${d.cagr}%`
        : '—'
      : d.rental_yield != null
        ? `${d.rental_yield}%`
        : '—';
    const proj5 = d.proj_year_5 ?? d.proj_year_4;
    const projPct = proj5 && d.price_current ? pctChange(proj5, d.price_current) : null;
    return [
      { label: '10Y Growth', value: a10 != null ? `+${a10}%` : '—', color: '#0d9488' },
      { label: showsCagr(propertyType) ? 'CAGR' : 'Yield', value: yieldVal, color: '#2f80ed' },
      { label: 'Demand', value: `${d.demand_score}/100`, color: '#7c3aed' },
      { label: '5Y Proj.', value: projPct != null ? `+${projPct}%` : '—', color: '#d97706' },
    ];
  }, [debounced, data, propertyType]);

  const chartActual = useMemo(() => {
    const d = debounced ?? data;
    const vals = [d.price_10y_ago, d.price_5y_ago, d.price_current].filter((v) => v > 0);
    return vals.length ? vals : [0, 0, 0];
  }, [debounced, data]);

  const chartProj = useMemo(() => {
    const d = debounced ?? data;
    return [d.proj_year_1, d.proj_year_2, d.proj_year_3, d.proj_year_4, d.proj_year_5];
  }, [debounced, data]);

  const setNum = useCallback(
    (key: keyof PropertyInsightsForm, raw: string) => {
      const n = raw === '' ? 0 : Number(raw);
      updateInsights({ [key]: Number.isFinite(n) ? n : 0 } as Partial<PropertyInsightsForm>);
    },
    [updateInsights],
  );

  const skipInsights = () => {
    resetInsights();
    if (typeof window !== 'undefined') sessionStorage.removeItem(PREFILL_KEY);
    toast.success('Insights skipped — property will publish without insights section');
    void router.push('/new-property/step5');
  };

  const goNext = () => {
    if (!insights || isInsightsFormEmpty(insights)) {
      resetInsights();
    }
    void router.push('/new-property/step5');
  };

  const autoFillProjections = () => {
    if (!data.price_current) {
      toast.error('Enter current market price first');
      return;
    }
    const rate = data.cagr ?? 0;
    if (!rate) {
      toast.error('Enter CAGR % first');
      return;
    }
    const hasExisting = [1, 2, 3, 4, 5].some((i) => {
      const k = `proj_year_${i}` as keyof PropertyInsightsForm;
      return Number(data[k]) > 0;
    });
    if (hasExisting && !window.confirm('This will overwrite existing projection values. Continue?')) return;
    const updates: Partial<PropertyInsightsForm> = {};
    for (let i = 1; i <= 5; i++) {
      const v = Math.round(data.price_current * Math.pow(1 + rate / 100, i));
      (updates as Record<string, number>)[`proj_year_${i}`] = v;
    }
    updateInsights(updates);
    toast.success('5-year projections auto-filled');
  };

  const comps = data.comps?.length ? data.comps : [emptyCompRow()];
  const compCount = comps.filter((c) => c.name.trim()).length;

  const masterOff = !data.show_insights;
  const years = projectionYears();

  return (
    <AdminLayout
      hideSearch
      header={
        <ListingWizardHeader
          backHref="/new-property/step3"
          centerTitle="Property insights"
          onSaveDraft={() => toast.success('Draft saved')}
          primaryLabel="Next: Photos & Publish →"
          onPrimary={goNext}
        />
      }
    >
      <ListingStepProgress step={4} />

      <div
        className="insights-type-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          marginBottom: 14,
        }}
      >
        <PropertyTypeIcon type={propertyType} />
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--ch)' }}>
          {propertyType}
          {form.locality || form.city ? ` · ${[form.locality, form.city].filter(Boolean).join(', ')}` : ''}
        </span>
      </div>

      <div className="info-box" style={{ marginBottom: 18 }}>
        <Info size={16} strokeWidth={1.8} color="var(--blue)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#0c4a6e' }}>
          Insights appear as a graph section on the buyer-facing property page. Fields auto-adjust based on property
          type. All fields are optional.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>
        <div>
          {/* Historical price */}
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider
              icon={<TrendingUp size={16} strokeWidth={1.8} color="var(--tl)" />}
              title="Historical price data"
              subtitle={`All values in ₹/${unit}`}
              iconBackground="#ecfdf5"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Price 10y ago (₹/{unit})</label>
                <input type="number" min={0} className="fi" value={data.price_10y_ago || ''} onChange={(e) => setNum('price_10y_ago', e.target.value)} />
              </div>
              <div>
                <label className="label">Price 5y ago (₹/{unit})</label>
                <input type="number" min={0} className="fi" value={data.price_5y_ago || ''} onChange={(e) => setNum('price_5y_ago', e.target.value)} />
              </div>
              <div>
                <label className="label">Current market price (₹/{unit})</label>
                <input
                  type="number"
                  min={0}
                  className="fi"
                  style={isPrefilled ? { background: '#f0fdf4', borderColor: '#86efac' } : undefined}
                  value={data.price_current || ''}
                  onChange={(e) => {
                    const n = e.target.value === '' ? 0 : Number(e.target.value);
                    updateInsights({
                      price_current: Number.isFinite(n) ? n : 0,
                      _prefilledPrice: undefined,
                    });
                  }}
                />
                {isPrefilled ? (
                  <div style={{ fontSize: 11, color: '#15803d', marginTop: 4 }}>✓ Pre-filled from Step 3 pricing</div>
                ) : null}
              </div>
              <div>
                <label className="label">Peak locality price (₹/{unit})</label>
                <input type="number" min={0} className="fi" value={data.price_peak || ''} onChange={(e) => setNum('price_peak', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: app10 != null ? '#ecfdf5' : '#f1f5f9', color: app10 != null ? '#047857' : 'var(--mu)' }}>
                10Y appreciation: {app10 != null ? `+${app10}%` : '—'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: app5 != null ? '#ecfdf5' : '#f1f5f9', color: app5 != null ? '#047857' : 'var(--mu)' }}>
                5Y appreciation: {app5 != null ? `+${app5}%` : '—'}
              </span>
            </div>
          </div>

          {/* Demand & yield */}
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider icon={<BarChart3 size={16} strokeWidth={1.8} color="var(--blue)" />} title="Demand & yield" iconBackground="var(--blue-l)" />
            <label className="label">Demand index ({data.demand_score})</label>
            <input
              type="range"
              min={0}
              max={100}
              className="fi"
              style={{ padding: 0, height: 32 }}
              value={data.demand_score}
              onChange={(e) => updateInsights({ demand_score: Number(e.target.value) })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--mu)', marginBottom: 12 }}>
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {showsRentalYield(propertyType) ? (
                <div>
                  <label className="label">Rental yield (%)</label>
                  <input type="number" min={0} max={100} step={0.1} className="fi" value={data.rental_yield ?? ''} onChange={(e) => setNum('rental_yield', e.target.value)} />
                </div>
              ) : null}
              {showsCagr(propertyType) ? (
                <div>
                  <label className="label">Annual CAGR (%)</label>
                  <input type="number" min={0} max={100} step={0.1} className="fi" value={data.cagr ?? ''} onChange={(e) => setNum('cagr', e.target.value)} />
                </div>
              ) : null}
              {showsVacancy(propertyType) ? (
                <div>
                  <label className="label">Vacancy rate (%)</label>
                  <input type="number" min={0} max={100} step={0.1} className="fi" value={data.vacancy_rate ?? ''} onChange={(e) => setNum('vacancy_rate', e.target.value)} />
                </div>
              ) : null}
              {showsNewSupply(propertyType) ? (
                <div style={{ gridColumn: showsVacancy(propertyType) ? undefined : '1 / -1' }}>
                  <label className="label">New supply pipeline</label>
                  <input className="fi" placeholder="e.g. 3,200 units by 2027" value={data.new_supply ?? ''} onChange={(e) => updateInsights({ new_supply: e.target.value })} />
                </div>
              ) : null}
              {propertyType === 'Land' ? (
                <div>
                  <label className="label">Ideal hold period</label>
                  <input className="fi" placeholder="e.g. 3-5 years" value={data.hold_period ?? ''} onChange={(e) => updateInsights({ hold_period: e.target.value })} />
                </div>
              ) : null}
            </div>
          </div>

          {/* Projections */}
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider icon={<LineChart size={16} strokeWidth={1.8} color="#d97706" />} title="5-year price projection" iconBackground="#fef3c7" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {years.map((year, i) => {
                const key = `proj_year_${i + 1}` as keyof PropertyInsightsForm;
                const val = data[key];
                return (
                  <div key={year}>
                    <label className="label" style={{ fontSize: 10 }}>
                      {year}
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="fi"
                      value={typeof val === 'number' && val > 0 ? val : ''}
                      onChange={(e) => setNum(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px' }}>
                <label className="label">CAGR for auto-fill (%)</label>
                <input type="number" min={0} max={100} step={0.1} className="fi" value={data.cagr ?? ''} onChange={(e) => setNum('cagr', e.target.value)} />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 18 }}
                disabled={!data.price_current}
                onClick={autoFillProjections}
              >
                Auto-fill 5 years
              </button>
            </div>
          </div>

          {/* Locality */}
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider icon={<MapPin size={16} strokeWidth={1.8} color="#7c3aed" />} title="Locality & infrastructure" iconBackground="#f3e8ff" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="label">Locality rank</label>
                <input className="fi" value={data.locality_rank ?? ''} onChange={(e) => updateInsights({ locality_rank: e.target.value })} />
              </div>
              <div>
                <label className="label">SRO registrations</label>
                <input className="fi" placeholder="e.g. 1,240 in 2024" value={data.sro_registrations ?? ''} onChange={(e) => updateInsights({ sro_registrations: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Infrastructure boost</label>
                <input className="fi" value={data.infra_boost ?? ''} onChange={(e) => updateInsights({ infra_boost: e.target.value })} />
              </div>
            </div>
            <label className="label">Nearby landmarks (max 4)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(data.landmarks ?? []).slice(0, 4).map((lm, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 6 }}>
                  <input className="fi" placeholder="Landmark" value={lm.name} onChange={(e) => {
                    const next = [...(data.landmarks ?? [])];
                    next[idx] = { ...next[idx], name: e.target.value };
                    updateInsights({ landmarks: next });
                  }} />
                  <input className="fi" placeholder="Distance" value={lm.distance} onChange={(e) => {
                    const next = [...(data.landmarks ?? [])];
                    next[idx] = { ...next[idx], distance: e.target.value };
                    updateInsights({ landmarks: next });
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Type-specific */}
          {showsLandFields(propertyType) ? (
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider title="Land-specific details" iconBackground="#ecfdf5" icon={<TrendingUp size={16} strokeWidth={1.8} color="var(--tl)" />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">NA conversion status</label>
                  <select className="fi" value={data.na_conversion ?? ''} onChange={(e) => updateInsights({ na_conversion: e.target.value as PropertyInsightsForm['na_conversion'] })}>
                    <option value="">Select</option>
                    <option value="converted">Converted</option>
                    <option value="not_converted">Not converted</option>
                    <option value="patta">Patta</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <InsightsToggle checked={!!data.patta_available} onChange={(v) => updateInsights({ patta_available: v })} label="Patta available" />
                </div>
              </div>
            </div>
          ) : null}

          {showsPlotFields(propertyType) ? (
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider title="Plot-specific details" iconBackground="#ecfdf5" icon={<TrendingUp size={16} strokeWidth={1.8} color="var(--tl)" />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">LP number</label>
                  <input className="fi" value={data.lp_number ?? ''} onChange={(e) => updateInsights({ lp_number: e.target.value })} />
                </div>
                <div>
                  <label className="label">Approval authority</label>
                  <select className="fi" value={data.approval_authority ?? ''} onChange={(e) => updateInsights({ approval_authority: e.target.value as PropertyInsightsForm['approval_authority'] })}>
                    <option value="">Select</option>
                    <option value="HMDA">HMDA</option>
                    <option value="DTCP">DTCP</option>
                    <option value="RERA">RERA</option>
                    <option value="GHMC">GHMC</option>
                    <option value="Panchayat">Panchayat</option>
                  </select>
                </div>
                <div>
                  <label className="label">Road width — main</label>
                  <input className="fi" placeholder="e.g. 40ft BT" value={data.road_width_main ?? ''} onChange={(e) => updateInsights({ road_width_main: e.target.value })} />
                </div>
                <div>
                  <label className="label">Road width — internal</label>
                  <input className="fi" placeholder="e.g. 30ft CC" value={data.road_width_internal ?? ''} onChange={(e) => updateInsights({ road_width_internal: e.target.value })} />
                </div>
              </div>
            </div>
          ) : null}

          {showsCommercialFields(propertyType) ? (
            <div className="acard" style={{ marginBottom: 18 }}>
              <SectionDivider title="Commercial-specific details" iconBackground="#fef3c7" icon={<BarChart3 size={16} strokeWidth={1.8} color="var(--am)" />} />
              <div>
                <label className="label">Rental rate (₹/sqft/month)</label>
                <input className="fi" placeholder="e.g. ₹65-85/sqft/mo" value={data.rental_rate_monthly ?? ''} onChange={(e) => updateInsights({ rental_rate_monthly: e.target.value })} />
              </div>
            </div>
          ) : null}

          {/* Comps */}
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider title="Comparable sales" subtitle="Max 5 transactions" iconBackground="var(--blue-l)" icon={<BarChart3 size={16} strokeWidth={1.8} color="var(--blue)" />} />
            {comps.map((c, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 110px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                <div>
                  {idx === 0 ? <label className="label">Society / name</label> : null}
                  <input className="fi" value={c.name} onChange={(e) => {
                    const next = [...comps];
                    next[idx] = { ...next[idx], name: e.target.value };
                    updateInsights({ comps: next });
                  }} />
                </div>
                <div>
                  {idx === 0 ? <label className="label">Area</label> : null}
                  <input className="fi" value={c.area} onChange={(e) => {
                    const next = [...comps];
                    next[idx] = { ...next[idx], area: e.target.value };
                    updateInsights({ comps: next });
                  }} />
                </div>
                <div>
                  {idx === 0 ? <label className="label">Sale date</label> : null}
                  <input type="month" className="fi" value={c.date} onChange={(e) => {
                    const next = [...comps];
                    next[idx] = { ...next[idx], date: e.target.value };
                    updateInsights({ comps: next });
                  }} />
                </div>
                <div>
                  {idx === 0 ? <label className="label">Sale price (₹)</label> : null}
                  <input type="number" min={0} className="fi" value={c.price || ''} onChange={(e) => {
                    const next = [...comps];
                    next[idx] = { ...next[idx], price: Number(e.target.value) || 0 };
                    updateInsights({ comps: next });
                  }} />
                </div>
                <div>
                  {idx === 0 ? <label className="label">₹/{unit}</label> : null}
                  <input type="number" min={0} className="fi" value={c.price_per_unit || ''} onChange={(e) => {
                    const next = [...comps];
                    next[idx] = { ...next[idx], price_per_unit: Number(e.target.value) || 0 };
                    updateInsights({ comps: next });
                  }} />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  disabled={comps.length <= 1}
                  onClick={() => updateInsights({ comps: comps.filter((_, i) => i !== idx) })}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={comps.length >= 5}
              onClick={() => updateInsights({ comps: [...comps, emptyCompRow()] })}
            >
              Add comparable transaction ({compCount} of 5 used)
            </button>
          </div>

          {/* Toggles */}
          <div className="acard">
            <SectionDivider title="Display toggles" subtitle="Control what buyers see on the property page" iconBackground="#f1f5f9" icon={<Info size={16} strokeWidth={1.8} color="var(--mu)" />} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: masterOff ? 0.55 : 1 }}>
              <InsightsToggle checked={data.show_insights} onChange={(v) => updateInsights({ show_insights: v })} label="Show insights section (master)" sub="Hides entire insights block when off" />
              <InsightsToggle checked={data.show_price_chart} onChange={(v) => updateInsights({ show_price_chart: v })} label="Price history chart" />
              <InsightsToggle checked={data.show_demand_chart} onChange={(v) => updateInsights({ show_demand_chart: v })} label="Demand index chart" />
              <InsightsToggle checked={data.show_yield_chart} onChange={(v) => updateInsights({ show_yield_chart: v })} label="Yield / CAGR chart" />
              <InsightsToggle checked={data.show_projections} onChange={(v) => updateInsights({ show_projections: v })} label="5-year projections" />
              <InsightsToggle checked={data.show_comps} onChange={(v) => updateInsights({ show_comps: v })} label="Comparable sales" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 82, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Live preview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {previewKpis.map((k) => (
                <div key={k.label} style={{ background: '#f8fafc', borderRadius: 9, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--mu)', marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 800, color: k.color }}>{k.value}</div>
                </div>
              ))}
            </div>
            <MiniPreviewChart actual={chartActual} projections={chartProj} />
            <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--mu)', marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--blue)' }} /> Actual
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} /> Projection
              </span>
            </div>
          </div>

          <div className="acard" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderColor: '#86efac' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#047857' }}>Insights quality</span>
              <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 800, color: '#047857' }}>{quality.score}/5</span>
            </div>
            <div className="prog-bar" style={{ marginBottom: 12 }}>
              <div className="prog-fill" style={{ width: `${(quality.score / 5) * 100}%`, background: '#10b981' }} />
            </div>
            {quality.items.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 5, color: item.done ? '#047857' : 'var(--mu)' }}>
                {item.done ? <Check size={14} strokeWidth={2} color="#10b981" /> : <Circle size={14} strokeWidth={1.5} color="#94a3b8" />}
                {item.label}
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#065f46', marginTop: 10, marginBottom: 0 }}>
              Higher quality insights convert 2.4× more enquiries from serious buyers
            </p>
          </div>

          <div className="acard">
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{propertyType} guide</div>
            {guide.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11.5, color: 'var(--ch)', marginBottom: 8, lineHeight: 1.5 }}>
                <span style={{ color: tip.info ? 'var(--blue)' : 'var(--tl)', flexShrink: 0 }}>{tip.info ? 'ℹ' : '✓'}</span>
                {tip.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 11.5, color: 'var(--mu)' }}>
          Auto-saved to draft — {savedAgo < 5 ? 'just now' : `${savedAgo} seconds ago`}
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--mu)' }} onClick={skipInsights}>
            Skip insights & continue
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void router.push('/new-property/step3')}>
            ← Back
          </button>
          <button type="button" className="btn btn-blue btn-sm" onClick={goNext}>
            Next: Photos & Publish →
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
