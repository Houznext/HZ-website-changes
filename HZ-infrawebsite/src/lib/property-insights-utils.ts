import type { PropertyInsights, PropertyInsightsSegment } from '@/types/property-insights.types';
import type { PropertyType } from '@/types/property.types';

export function mapPropertyInsightsSegment(propertyType: PropertyType): PropertyInsightsSegment {
  switch (propertyType) {
    case 'Apartment':
    case 'Studio':
      return 'apartment';
    case 'Villa':
    case 'Row House':
    case 'Farmhouse':
      return 'villa';
    case 'Land':
      return 'land';
    case 'Plot':
      return 'plot';
    case 'Commercial':
      return 'commercial';
    default:
      return 'apartment';
  }
}

export function shouldShowInsights(insights: PropertyInsights | null | undefined): insights is PropertyInsights {
  return Boolean(insights && insights.show_insights);
}

export function pctChange(current: number, base: number): number | null {
  if (!base || base <= 0 || !Number.isFinite(current) || !Number.isFinite(base)) return null;
  return Math.round(((current - base) / base) * 100);
}

/** Projection calendar years: current year + 1 … + 5. */
export function projectionYears(): number[] {
  const y = new Date().getFullYear();
  return [1, 2, 3, 4, 5].map((i) => y + i);
}

/** Read projection values — prefers proj_year_1…5, falls back to legacy proj_2025…2029. */
export function getProjectionValues(insights: PropertyInsights): (number | undefined)[] {
  const fromDynamic = [
    insights.proj_year_1,
    insights.proj_year_2,
    insights.proj_year_3,
    insights.proj_year_4,
    insights.proj_year_5,
  ];
  if (fromDynamic.some((v) => v != null)) return fromDynamic;
  return [
    insights.proj_2025,
    insights.proj_2026,
    insights.proj_2027,
    insights.proj_2028,
    insights.proj_2029,
  ];
}

export function formatCompPrice(price: number | string, unit: string): string {
  if (typeof price === 'string') return price;
  if (unit === 'acre') return `₹${price}L`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${Math.round(price / 100000)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatCompPricePerUnit(price: number | string, unit: string): string {
  if (typeof price === 'string') return price;
  return `₹${price.toLocaleString('en-IN')}/${unit}`;
}

export function formatVacancyRate(rate?: number | string): string | null {
  if (rate == null || rate === '') return null;
  if (typeof rate === 'number') return `${rate}%`;
  return rate;
}

export function formatPct(n: number | null, prefix = '+'): string | null {
  if (n == null || !Number.isFinite(n)) return null;
  return `${prefix}${n}%`;
}

export function formatPriceUnitValue(value: number, unit: string): string {
  if (unit === 'acre') return `₹${value}L/acre`;
  return `₹${value.toLocaleString('en-IN')}/${unit}`;
}

export function formatPeakPrice(value: number, unit: string): string {
  if (unit === 'acre') return `₹${value}L/acre`;
  return `₹${value.toLocaleString('en-IN')}/${unit}`;
}

export function buildHistoryData(insights: PropertyInsights) {
  const p10 = insights.price_10y_ago;
  const p5 = insights.price_5y_ago;
  const pCur = insights.price_current;
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;
  const years: string[] = [];
  const actual: number[] = [];

  for (let i = 0; i <= 10; i++) {
    const year = startYear + i;
    years.push(String(year));
    if (i === 0) actual.push(p10);
    else if (i === 5) actual.push(p5);
    else if (i === 10) actual.push(pCur);
    else if (i < 5) actual.push(Math.round(p10 + ((p5 - p10) * i) / 5));
    else actual.push(Math.round(p5 + ((pCur - p5) * (i - 5)) / 5));
  }

  return { years, actual };
}

export function buildProjectionChartData(insights: PropertyInsights) {
  const { years, actual } = buildHistoryData(insights);
  const projYears = projectionYears().map(String);
  const projValues = getProjectionValues(insights);

  const allLabels = [...years, ...projYears];
  const actualDataset = [...actual, ...projYears.map(() => null as number | null)];
  const projDataset: (number | null)[] = Array(years.length - 1).fill(null);
  projDataset.push(actual[actual.length - 1] ?? null);
  for (const v of projValues) projDataset.push(v ?? null);

  return { allLabels, actualDataset, projDataset };
}

export function generateDemandData(score: number): number[] {
  const variance = Math.floor(score * 0.15);
  return Array.from({ length: 12 }, (_, i) => {
    const offset = Math.sin(i * 0.8) * variance;
    return Math.min(100, Math.max(40, Math.round(score + offset)));
  });
}

export function generateYieldData(currentYield: number): number[] {
  const base = Math.max(0, currentYield - 1);
  return [
    +(base + 0.4).toFixed(1),
    +base.toFixed(1),
    +(base + 0.2).toFixed(1),
    +(base + 0.6).toFixed(1),
    +(base + 0.9).toFixed(1),
    +currentYield.toFixed(1),
  ];
}

export function generateCagrTrendData(cagr: number): number[] {
  const base = Math.max(0, cagr - 4);
  return [
    Math.max(0, base),
    Math.max(0, base + 1),
    Math.max(0, base + 2),
    Math.max(0, base + 3),
    Math.max(0, base + 3.5),
    Math.max(0, cagr),
  ].map((v) => +v.toFixed(1));
}

export function computeYoYBands(insights: PropertyInsights) {
  const years = projectionYears();
  const values = getProjectionValues(insights);

  return years.map((year, i) => {
    const val = values[i];
    if (val == null) return null;
    const prev = i === 0 ? insights.price_current : values[i - 1];
    if (prev == null || prev <= 0) return null;
    const pct = Math.round(((val - prev) / prev) * 100);
    return { year, value: val, yoy: `+${pct}%`, opacity: 0.55 + i * 0.09 };
  });
}

export function hasAnyProjection(insights: PropertyInsights): boolean {
  return getProjectionValues(insights).some((v) => v != null);
}

export function vacancyColor(rate?: number | string): string {
  if (rate == null || rate === '') return '#0d9488';
  const n = typeof rate === 'number' ? rate : parseFloat(String(rate).replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n)) return '#0d9488';
  return n > 10 ? '#d97706' : '#0d9488';
}

type IndicatorRow = { label: string; value: string; color: string };

export function buildIndicatorRows(
  segment: PropertyInsightsSegment,
  insights: PropertyInsights,
): IndicatorRow[] {
  const app10 = pctChange(insights.price_current, insights.price_10y_ago);
  const app5 = pctChange(insights.price_current, insights.price_5y_ago);
  const unit = insights.price_unit;
  const rows: IndicatorRow[] = [];

  const push = (label: string, value: string | null | undefined, color: string) => {
    if (value) rows.push({ label, value, color });
  };

  if (segment === 'apartment') {
    push('Price appreciation (10Y)', formatPct(app10), '#0d9488');
    push('Avg transaction price', formatPriceUnitValue(insights.price_current, unit), '#2f80ed');
    push('Peak price in locality', formatPeakPrice(insights.price_peak, unit), '#2f80ed');
    push('SRO registrations (2024)', insights.sro_registrations, '#2f80ed');
    push('Vacancy rate', formatVacancyRate(insights.vacancy_rate), vacancyColor(insights.vacancy_rate));
    push('New supply pipeline', insights.new_supply, '#d97706');
    push('Infrastructure boost', insights.infra_boost, '#0d9488');
    push('Locality rank', insights.locality_rank, '#0d9488');
  } else if (segment === 'villa') {
    push('Price appreciation (5Y)', formatPct(app5), '#0d9488');
    push('Current price (built-up)', formatPriceUnitValue(insights.price_current, unit), '#2f80ed');
    push('Peak villa price', formatPeakPrice(insights.price_peak, unit), '#2f80ed');
    push('Rental yield', insights.rental_yield != null ? `${insights.rental_yield}% annual` : null, '#2f80ed');
    push('SRO registrations', insights.sro_registrations, '#2f80ed');
    push('Infrastructure boost', insights.infra_boost, '#0d9488');
    push('Locality rank', insights.locality_rank, '#0d9488');
  } else if (segment === 'land') {
    push('Price appreciation (10Y)', formatPct(app10), '#0d9488');
    push('Current price', formatPriceUnitValue(insights.price_current, unit), '#2f80ed');
    push('Peak zone price', formatPeakPrice(insights.price_peak, unit), '#2f80ed');
    push('Ideal holding period', insights.hold_period, '#2f80ed');
    push('SRO registrations', insights.sro_registrations, '#2f80ed');
    push('Infrastructure boost', insights.infra_boost, '#0d9488');
    push('Locality rank', insights.locality_rank, '#0d9488');
  } else if (segment === 'plot') {
    push('Price appreciation (10Y)', formatPct(app10), '#0d9488');
    push('Current price', formatPriceUnitValue(insights.price_current, unit), '#2f80ed');
    push('Peak layout price', formatPeakPrice(insights.price_peak, unit), '#2f80ed');
    push('Annual CAGR', insights.cagr != null ? `${insights.cagr}%` : null, '#0d9488');
    push('SRO registrations', insights.sro_registrations, '#2f80ed');
    push('Infrastructure boost', insights.infra_boost, '#0d9488');
    push('Locality rank', insights.locality_rank, '#0d9488');
  } else {
    push('Price appreciation (10Y)', formatPct(app10), '#0d9488');
    push('Current price', formatPriceUnitValue(insights.price_current, unit), '#2f80ed');
    push('Rental yield', insights.rental_yield != null ? `${insights.rental_yield}% annual` : null, '#0d9488');
    push('Monthly rental rate', insights.rental_rate_monthly, '#2f80ed');
    push('Vacancy rate', formatVacancyRate(insights.vacancy_rate), vacancyColor(insights.vacancy_rate));
    push('SRO registrations', insights.sro_registrations, '#2f80ed');
    push('Infrastructure boost', insights.infra_boost, '#0d9488');
    push('Locality rank', insights.locality_rank, '#0d9488');
  }

  return rows;
}

export function insightsDescription(segment: PropertyInsightsSegment): string {
  switch (segment) {
    case 'apartment':
    case 'villa':
      return 'Historical price appreciation and AI-powered 5-year projection based on SRO registration data and demand index.';
    case 'land':
      return 'Land price appreciation trends and projection for this zone. Based on IGRS registration data, NA conversion status, and infrastructure pipeline.';
    case 'plot':
      return 'Plot appreciation trends for HMDA/DTCP approved layouts. Based on SRO registrations, layout completion status, and demand index.';
    case 'commercial':
      return 'Commercial property appreciation and rental yield trends. Based on transaction data, vacancy rates, and IT corridor demand.';
    default:
      return 'Historical price appreciation since 2015 and AI-powered projection for next 5 years based on Houznext portfolio data.';
  }
}

export function compsTitleSuffix(segment: PropertyInsightsSegment): string {
  switch (segment) {
    case 'apartment':
      return '· 2BHK/3BHK Apartment';
    case 'villa':
      return '· Gated Villa';
    case 'land':
      return '· Land Transactions';
    case 'plot':
      return '· Approved Plot';
    case 'commercial':
      return '· Commercial Office';
    default:
      return '';
  }
}

export function segmentDisplayLabel(segment: PropertyInsightsSegment): string {
  switch (segment) {
    case 'apartment':
      return 'Apartment';
    case 'villa':
      return 'Villa';
    case 'land':
      return 'Land';
    case 'plot':
      return 'Plot';
    case 'commercial':
      return 'Commercial';
    default:
      return 'Property';
  }
}

export function buildKpiCards(segment: PropertyInsightsSegment, insights: PropertyInsights) {
  const app10 = pctChange(insights.price_current, insights.price_10y_ago);
  const app5 = pctChange(insights.price_current, insights.price_5y_ago);
  const projValues = getProjectionValues(insights);
  const lastProj = projValues[4];
  const proj5 = lastProj != null ? pctChange(lastProj, insights.price_current) : null;

  const yieldLabel =
    segment === 'land'
      ? 'Holding Period'
      : segment === 'plot' && insights.rental_yield == null
        ? 'Annual CAGR'
        : segment === 'plot'
          ? 'Rental Yield / CAGR'
          : 'Rental Yield / CAGR';

  let yieldVal = '—';
  let yieldSub = '';
  if (segment === 'land') {
    yieldVal = insights.hold_period || (insights.cagr != null ? `+${insights.cagr}% CAGR` : '—');
    yieldSub = insights.hold_period ? 'Ideal for flip gains' : 'Capital gain trend';
  } else if (segment === 'plot' && insights.cagr != null) {
    yieldVal = `${insights.cagr}%`;
    yieldSub = 'Annual capital gain';
  } else if (insights.rental_yield != null) {
    yieldVal = `${insights.rental_yield}%`;
    yieldSub = 'Annual gross yield';
  } else if (insights.cagr != null) {
    yieldVal = `${insights.cagr}%`;
    yieldSub = 'Annual CAGR';
  }

  return [
    {
      label: segment === 'villa' ? '5Y Appreciation' : '10Y Appreciation',
      value: formatPct(segment === 'villa' ? app5 : app10) || '—',
      sub:
        segment === 'villa' && app5 != null
          ? `5-year growth`
          : app10 != null
            ? `Since ${new Date().getFullYear() - 10}`
            : '',
      color: '#0d9488',
    },
    {
      label: yieldLabel,
      value: yieldVal,
      sub: yieldSub,
      color: '#2f80ed',
    },
    {
      label: 'Demand Index',
      value: `${insights.demand_score}/100`,
      sub: insights.demand_score >= 85 ? 'High demand zone' : insights.demand_score >= 70 ? 'Moderate demand' : 'Emerging demand',
      color: '#7c3aed',
    },
    {
      label: '5Y Projection',
      value: proj5 != null ? formatPct(proj5) || '—' : '—',
      sub: lastProj != null ? `by ${projectionYears()[4]} · AI model` : 'Projection unavailable',
      color: '#d97706',
    },
  ];
}
