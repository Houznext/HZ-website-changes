import type { ListingDraft } from '@/context/ListingFormContext';

export type PriceUnit = 'sqft' | 'sqyd' | 'acre';

export interface InsightsCompRow {
  name: string;
  area: string;
  date: string;
  price: number;
  price_per_unit: number;
}

export interface InsightsLandmarkRow {
  name: string;
  distance: string;
}

export interface PropertyInsightsForm {
  price_current: number;
  price_5y_ago: number;
  price_10y_ago: number;
  price_peak: number;
  demand_score: number;
  price_unit: PriceUnit;
  rental_yield?: number;
  cagr?: number;
  hold_period?: string;
  vacancy_rate?: number;
  new_supply?: string;
  rental_rate_monthly?: string;
  na_conversion?: 'converted' | 'not_converted' | 'patta';
  patta_available?: boolean;
  lp_number?: string;
  approval_authority?: 'HMDA' | 'DTCP' | 'RERA' | 'GHMC' | 'Panchayat' | '';
  road_width_main?: string;
  road_width_internal?: string;
  locality_rank?: string;
  sro_registrations?: string;
  infra_boost?: string;
  landmarks: InsightsLandmarkRow[];
  proj_year_1?: number;
  proj_year_2?: number;
  proj_year_3?: number;
  proj_year_4?: number;
  proj_year_5?: number;
  comps: InsightsCompRow[];
  show_insights: boolean;
  show_price_chart: boolean;
  show_demand_chart: boolean;
  show_yield_chart: boolean;
  show_projections: boolean;
  show_comps: boolean;
  _prefilledPrice?: number;
}

export function priceUnitForPropertyType(propertyType: unknown): PriceUnit {
  const t = String(propertyType ?? '');
  if (t === 'Plot') return 'sqyd';
  if (t === 'Land') return 'acre';
  return 'sqft';
}

export function projectionYears(): number[] {
  const y = new Date().getFullYear();
  return [1, 2, 3, 4, 5].map((i) => y + i);
}

export function computePrefillPrice(form: ListingDraft): number {
  const base = Number(form.basePrice) || 0;
  if (!base) return 0;
  const type = String(form.propertyType ?? '');
  if (type === 'Plot') {
    const area = Number(form.plotArea) || 0;
    return area > 0 ? Math.round(base / area) : 0;
  }
  if (type === 'Land') {
    const area = Number(form.landArea) || 0;
    return area > 0 ? Math.round(base / area) : 0;
  }
  const carpet = Number(form.carpetArea) || Number(form.builtUpArea) || 0;
  return carpet > 0 ? Math.round(base / carpet) : 0;
}

export function emptyCompRow(): InsightsCompRow {
  return { name: '', area: '', date: '', price: 0, price_per_unit: 0 };
}

export function emptyLandmarks(): InsightsLandmarkRow[] {
  return [
    { name: '', distance: '' },
    { name: '', distance: '' },
    { name: '', distance: '' },
    { name: '', distance: '' },
  ];
}

export function createDefaultInsights(propertyType: unknown, prefillPrice = 0): PropertyInsightsForm {
  return {
    price_current: prefillPrice,
    price_5y_ago: 0,
    price_10y_ago: 0,
    price_peak: 0,
    demand_score: 50,
    price_unit: priceUnitForPropertyType(propertyType),
    show_insights: true,
    show_price_chart: true,
    show_demand_chart: true,
    show_yield_chart: true,
    show_projections: true,
    show_comps: true,
    landmarks: emptyLandmarks(),
    comps: [emptyCompRow()],
    _prefilledPrice: prefillPrice || undefined,
  };
}

export function pctChange(current: number, base: number): number | null {
  if (!base || base <= 0 || !Number.isFinite(current)) return null;
  return Math.round(((current - base) / base) * 100);
}

export function showsRentalYield(type: string): boolean {
  return ['Apartment', 'Villa', 'Commercial', 'Studio', 'Row House', 'Farmhouse'].includes(type);
}

export function showsCagr(type: string): boolean {
  return type === 'Land' || type === 'Plot';
}

export function showsVacancy(type: string): boolean {
  return type === 'Apartment' || type === 'Commercial' || type === 'Studio';
}

export function showsNewSupply(type: string): boolean {
  return ['Apartment', 'Villa', 'Studio', 'Row House', 'Farmhouse'].includes(type);
}

export function showsLandFields(type: string): boolean {
  return type === 'Land';
}

export function showsPlotFields(type: string): boolean {
  return type === 'Plot';
}

export function showsCommercialFields(type: string): boolean {
  return type === 'Commercial';
}

export function isInsightsFormEmpty(insights: PropertyInsightsForm | null | undefined): boolean {
  if (!insights) return true;
  const hasPrice =
    insights.price_current > 0 ||
    insights.price_5y_ago > 0 ||
    insights.price_10y_ago > 0 ||
    insights.price_peak > 0;
  const hasDemand = insights.demand_score !== 50;
  const hasOptional =
    !!insights.rental_yield ||
    !!insights.cagr ||
    !!insights.hold_period ||
    !!insights.vacancy_rate ||
    !!insights.new_supply ||
    !!insights.rental_rate_monthly ||
    !!insights.na_conversion ||
    insights.patta_available ||
    !!insights.lp_number ||
    !!insights.approval_authority ||
    !!insights.road_width_main ||
    !!insights.road_width_internal ||
    !!insights.locality_rank ||
    !!insights.sro_registrations ||
    !!insights.infra_boost;
  const hasProj = projectionYears().some((_, i) => {
    const key = `proj_year_${i + 1}` as keyof PropertyInsightsForm;
    return Number(insights[key]) > 0;
  });
  const hasLm = insights.landmarks?.some((l) => l.name.trim() || l.distance.trim());
  const hasComps = insights.comps?.some((c) => c.name.trim() || c.area.trim() || c.price > 0);
  return !(hasPrice || hasDemand || hasOptional || hasProj || hasLm || hasComps);
}

export function sanitizeInsightsForPayload(insights: PropertyInsightsForm): Record<string, unknown> {
  const num = (v: unknown, fallback = 0): number => {
    const n = typeof v === 'string' ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const landmarks = (insights.landmarks || [])
    .filter((l) => l.name.trim() && l.distance.trim())
    .slice(0, 4);
  const comps = (insights.comps || [])
    .filter((c) => c.name.trim() && c.area.trim() && c.date.trim() && num(c.price) > 0)
    .slice(0, 5)
    .map((c) => ({
      name: c.name.trim(),
      area: c.area.trim(),
      date: c.date.trim(),
      price: num(c.price),
      price_per_unit: num(c.price_per_unit),
    }));

  const out: Record<string, unknown> = {
    price_current: num(insights.price_current),
    price_5y_ago: num(insights.price_5y_ago),
    price_10y_ago: num(insights.price_10y_ago),
    price_peak: num(insights.price_peak),
    demand_score: Math.min(100, Math.max(0, num(insights.demand_score, 50))),
    price_unit: insights.price_unit || 'sqft',
    show_insights: insights.show_insights !== false,
    show_price_chart: insights.show_price_chart !== false,
    show_demand_chart: insights.show_demand_chart !== false,
    show_yield_chart: insights.show_yield_chart !== false,
    show_projections: insights.show_projections !== false,
    show_comps: insights.show_comps !== false,
  };

  const rentalYield = num(insights.rental_yield);
  if (insights.rental_yield != null && String(insights.rental_yield) !== '') {
    out.rental_yield = rentalYield;
  }
  const cagr = num(insights.cagr);
  if (insights.cagr != null && String(insights.cagr) !== '') {
    out.cagr = cagr;
  }
  if (insights.hold_period?.trim()) out.hold_period = insights.hold_period.trim();
  if (insights.vacancy_rate != null && String(insights.vacancy_rate) !== '') {
    out.vacancy_rate = Math.min(100, Math.max(0, num(insights.vacancy_rate)));
  }
  if (insights.new_supply?.trim()) out.new_supply = insights.new_supply.trim();
  if (insights.rental_rate_monthly?.trim()) out.rental_rate_monthly = insights.rental_rate_monthly.trim();
  if (insights.na_conversion) {
    out.na_conversion = insights.na_conversion;
  }
  if (insights.patta_available != null) out.patta_available = Boolean(insights.patta_available);
  if (insights.lp_number?.trim()) out.lp_number = insights.lp_number.trim();
  if (insights.approval_authority) {
    out.approval_authority = insights.approval_authority;
  }
  if (insights.road_width_main?.trim()) out.road_width_main = insights.road_width_main.trim();
  if (insights.road_width_internal?.trim()) out.road_width_internal = insights.road_width_internal.trim();
  if (insights.locality_rank?.trim()) out.locality_rank = insights.locality_rank.trim();
  if (insights.sro_registrations?.trim()) out.sro_registrations = insights.sro_registrations.trim();
  if (insights.infra_boost?.trim()) out.infra_boost = insights.infra_boost.trim();
  if (landmarks.length) out.landmarks = landmarks;
  for (let i = 1; i <= 5; i++) {
    const key = `proj_year_${i}` as keyof PropertyInsightsForm;
    const v = insights[key];
    const n = num(v);
    if (n > 0) out[`proj_year_${i}`] = n;
  }
  if (comps.length) out.comps = comps;
  return out;
}

export type GuideTip = { text: string; info?: boolean };

export const TYPE_GUIDES: Record<string, GuideTip[]> = {
  Apartment: [
    { text: 'Enter ₹/sqft for all price fields' },
    { text: 'Rental yield: gross annual (rent × 12 ÷ price)' },
    { text: 'Compare with 2-3BHK transactions nearby' },
    { text: 'Mention Metro / school / office proximity' },
    { text: 'Vacancy below 5% is a positive signal', info: true },
  ],
  Studio: [
    { text: 'Enter ₹/sqft for all price fields' },
    { text: 'Rental yield: gross annual (rent × 12 ÷ price)' },
    { text: 'Compare with studio transactions nearby' },
    { text: 'Mention Metro / school / office proximity' },
    { text: 'Vacancy below 5% is a positive signal', info: true },
  ],
  Villa: [
    { text: 'Price in ₹/sqft (built-up, not plot area)' },
    { text: 'Villa premium over apartments helps decision' },
    { text: 'Community name, phases, gated status matter' },
    { text: 'Construction cost helps investors budget' },
    { text: 'Villa yield is lower than apt but appreciates faster', info: true },
  ],
  'Row House': [
    { text: 'Price in ₹/sqft (built-up, not plot area)' },
    { text: 'Villa premium over apartments helps decision' },
    { text: 'Community name, phases, gated status matter' },
    { text: 'Construction cost helps investors budget' },
    { text: 'Villa yield is lower than apt but appreciates faster', info: true },
  ],
  Farmhouse: [
    { text: 'Price in ₹/sqft (built-up, not plot area)' },
    { text: 'Villa premium over apartments helps decision' },
    { text: 'Community name, phases, gated status matter' },
    { text: 'Construction cost helps investors budget' },
    { text: 'Villa yield is lower than apt but appreciates faster', info: true },
  ],
  Land: [
    { text: 'Price in ₹/acre — be consistent' },
    { text: 'NA conversion status is critical for buyers' },
    { text: 'Patta availability signals clear title' },
    { text: 'Road access type (BT/CC/mud) matters a lot' },
    { text: 'Land has no rental yield — use CAGR instead', info: true },
  ],
  Plot: [
    { text: 'Always use ₹/sqyd for plots' },
    { text: 'LP number confirms HMDA/DTCP approval' },
    { text: 'Road width (BT/CC) significantly affects price' },
    { text: 'Infrastructure completion % signals readiness' },
    { text: 'Plots have no yield — CAGR is the key metric', info: true },
  ],
  Commercial: [
    { text: 'Commercial yield is 6-8% vs 3-4% for apts' },
    { text: 'Vacancy rate below 5% is excellent signal' },
    { text: 'Anchor tenants (IT companies) drive demand' },
    { text: 'Pre-leased % shows investor confidence' },
    { text: 'SEZ/STPI status can add 15-20% premium', info: true },
  ],
};

export function computeQualityScore(insights: PropertyInsightsForm): {
  score: number;
  items: { label: string; done: boolean }[];
} {
  const hasCurrent = insights.price_current > 0;
  const hasHistorical = insights.price_5y_ago > 0 || insights.price_10y_ago > 0 || insights.price_peak > 0;
  const hasDemand = insights.demand_score > 0;
  const hasProj = projectionYears().some((_, i) => {
    const key = `proj_year_${i + 1}` as keyof PropertyInsightsForm;
    return Number(insights[key]) > 0;
  });
  const hasComps = insights.comps?.some((c) => c.name.trim() && c.price > 0);
  const items = [
    { label: 'Current market price', done: hasCurrent },
    { label: 'Historical price data', done: hasHistorical },
    { label: 'Demand score', done: hasDemand },
    { label: '5-year projections', done: !!hasProj },
    { label: 'Comparable sales', done: !!hasComps },
  ];
  const score = items.filter((i) => i.done).length;
  return { score, items };
}

export function apiInsightsToForm(raw: Record<string, unknown>, propertyType: unknown): PropertyInsightsForm {
  const unit = priceUnitForPropertyType(propertyType);
  const num = (v: unknown) => {
    const n = typeof v === 'string' ? parseFloat(v) : Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const landmarksRaw = Array.isArray(raw.landmarks) ? raw.landmarks : [];
  const landmarks = emptyLandmarks().map((empty, i) => {
    const l = landmarksRaw[i] as { name?: string; distance?: string } | undefined;
    return l ? { name: String(l.name ?? ''), distance: String(l.distance ?? '') } : empty;
  });
  const compsRaw = Array.isArray(raw.comps) ? raw.comps : [];
  const comps: InsightsCompRow[] = compsRaw.length
    ? compsRaw.map((c) => {
        const row = c as Record<string, unknown>;
        return {
          name: String(row.name ?? ''),
          area: String(row.area ?? ''),
          date: String(row.date ?? ''),
          price: num(row.price),
          price_per_unit: num(row.price_per_unit),
        };
      })
    : [emptyCompRow()];

  return {
    price_current: num(raw.price_current),
    price_5y_ago: num(raw.price_5y_ago),
    price_10y_ago: num(raw.price_10y_ago),
    price_peak: num(raw.price_peak),
    demand_score: num(raw.demand_score) || 50,
    price_unit: (raw.price_unit as PriceUnit) || unit,
    rental_yield: raw.rental_yield != null ? num(raw.rental_yield) : undefined,
    cagr: raw.cagr != null ? num(raw.cagr) : undefined,
    hold_period: raw.hold_period != null ? String(raw.hold_period) : undefined,
    vacancy_rate: raw.vacancy_rate != null ? num(raw.vacancy_rate) : undefined,
    new_supply: raw.new_supply != null ? String(raw.new_supply) : undefined,
    rental_rate_monthly: raw.rental_rate_monthly != null ? String(raw.rental_rate_monthly) : undefined,
    na_conversion: raw.na_conversion as PropertyInsightsForm['na_conversion'],
    patta_available: raw.patta_available != null ? Boolean(raw.patta_available) : undefined,
    lp_number: raw.lp_number != null ? String(raw.lp_number) : undefined,
    approval_authority: (raw.approval_authority as PropertyInsightsForm['approval_authority']) ?? '',
    road_width_main: raw.road_width_main != null ? String(raw.road_width_main) : undefined,
    road_width_internal: raw.road_width_internal != null ? String(raw.road_width_internal) : undefined,
    locality_rank: raw.locality_rank != null ? String(raw.locality_rank) : undefined,
    sro_registrations: raw.sro_registrations != null ? String(raw.sro_registrations) : undefined,
    infra_boost: raw.infra_boost != null ? String(raw.infra_boost) : undefined,
    landmarks,
    proj_year_1: raw.proj_year_1 != null ? num(raw.proj_year_1) : num(raw.proj_2025) || undefined,
    proj_year_2: raw.proj_year_2 != null ? num(raw.proj_year_2) : num(raw.proj_2026) || undefined,
    proj_year_3: raw.proj_year_3 != null ? num(raw.proj_year_3) : num(raw.proj_2027) || undefined,
    proj_year_4: raw.proj_year_4 != null ? num(raw.proj_year_4) : num(raw.proj_2028) || undefined,
    proj_year_5: raw.proj_year_5 != null ? num(raw.proj_year_5) : num(raw.proj_2029) || undefined,
    comps,
    show_insights: raw.show_insights !== false,
    show_price_chart: raw.show_price_chart !== false,
    show_demand_chart: raw.show_demand_chart !== false,
    show_yield_chart: raw.show_yield_chart !== false,
    show_projections: raw.show_projections !== false,
    show_comps: raw.show_comps !== false,
  };
}
