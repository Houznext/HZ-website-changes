import type { PropertyInsights } from './property-insights.types';

export const SEED_INSIGHTS_APARTMENT_GACHIBOWLI: PropertyInsights = {
  price_current: 4724,
  price_5y_ago: 4000,
  price_10y_ago: 3200,
  price_peak: 5200,
  demand_score: 87,
  price_unit: 'sqft',
  rental_yield: 3.8,
  locality_rank: '#2 in Hyderabad',
  sro_registrations: '1,284 units',
  infra_boost: 'Metro Phase III · 2025',
  vacancy_rate: '4.2%',
  new_supply: '3,200 units by 2026',
  proj_2025: 5100,
  proj_2026: 5400,
  proj_2027: 5800,
  proj_2028: 6200,
  proj_2029: 6800,
  comps: [
    { name: 'Prestige Towers 3BHK', area: '1,380 sqft', date: 'Nov 2024', price: '₹65L', price_per_unit: '₹4,710/sqft' },
    { name: 'Skyview Residency 3BHK', area: '1,420 sqft', date: 'Oct 2024', price: '₹67L', price_per_unit: '₹4,718/sqft' },
    { name: 'Green Heights 3BHK', area: '1,500 sqft', date: 'Sep 2024', price: '₹71L', price_per_unit: '₹4,733/sqft' },
  ],
  show_insights: true,
  show_price_chart: true,
  show_demand_chart: true,
  show_yield_chart: true,
  show_projections: true,
  show_comps: true,
};

export const SEED_INSIGHTS_VILLA_KOKAPET: PropertyInsights = {
  price_current: 13650,
  price_5y_ago: 7500,
  price_10y_ago: 5200,
  price_peak: 15000,
  demand_score: 91,
  price_unit: 'sqft',
  rental_yield: 2.4,
  locality_rank: '#1 for villas in Hyderabad',
  sro_registrations: '186 transactions',
  infra_boost: 'Financial District expansion · 2025',
  proj_2025: 14800,
  proj_2026: 16200,
  proj_2027: 17800,
  proj_2028: 19200,
  proj_2029: 20800,
  comps: [
    { name: 'Prestige Villas 4BHK', area: '280 sqyd', date: 'Nov 2024', price: '₹2.4Cr', price_per_unit: '₹12,800/sqft' },
    { name: 'Heritage Gardens Villa', area: '240 sqyd', date: 'Oct 2024', price: '₹2.1Cr', price_per_unit: '₹13,100/sqft' },
  ],
  show_insights: true,
  show_price_chart: true,
  show_demand_chart: true,
  show_yield_chart: true,
  show_projections: true,
  show_comps: true,
};

export const SEED_INSIGHTS_LAND_SHAMSHABAD: PropertyInsights = {
  price_current: 27,
  price_5y_ago: 13,
  price_10y_ago: 8,
  price_peak: 32,
  demand_score: 74,
  price_unit: 'acre',
  cagr: 16,
  hold_period: '3–5 years',
  locality_rank: '#3 near ORR zone',
  sro_registrations: '94 land sales',
  infra_boost: 'Pharma City · 4.2km',
  proj_2025: 31,
  proj_2026: 36,
  proj_2027: 42,
  proj_2028: 48,
  proj_2029: 51,
  comps: [
    { name: 'Survey No. 142 · 2 acres', area: '2 acres', date: 'Nov 2024', price: '₹56L', price_per_unit: '₹28L/acre' },
    { name: 'Survey No. 98 · 1.5 acres', area: '1.5 acres', date: 'Sep 2024', price: '₹40L', price_per_unit: '₹26.6L/acre' },
  ],
  show_insights: true,
  show_price_chart: true,
  show_demand_chart: true,
  show_yield_chart: false,
  show_projections: true,
  show_comps: true,
};

export const SEED_INSIGHTS_PLOT_BACHUPALLY: PropertyInsights = {
  price_current: 3135,
  price_5y_ago: 1700,
  price_10y_ago: 1100,
  price_peak: 3500,
  demand_score: 82,
  price_unit: 'sqyd',
  cagr: 18,
  locality_rank: '#2 in North Hyderabad',
  sro_registrations: '286 plots registered',
  infra_boost: 'Outer Ring Road widening · 2025',
  proj_2025: 3500,
  proj_2026: 3900,
  proj_2027: 4300,
  proj_2028: 4700,
  proj_2029: 5175,
  comps: [
    { name: 'Sai Homes Phase 2 · 150sqyd', area: '150 sqyd', date: 'Nov 2024', price: '₹4.6L', price_per_unit: '₹3,067/sqyd' },
    { name: 'Green Meadows · 200sqyd', area: '200 sqyd', date: 'Oct 2024', price: '₹6.3L', price_per_unit: '₹3,150/sqyd' },
  ],
  show_insights: true,
  show_price_chart: true,
  show_demand_chart: true,
  show_yield_chart: true,
  show_projections: true,
  show_comps: true,
};

export const SEED_INSIGHTS_COMMERCIAL_HITEC: PropertyInsights = {
  price_current: 11100,
  price_5y_ago: 8000,
  price_10y_ago: 5800,
  price_peak: 12000,
  demand_score: 95,
  price_unit: 'sqft',
  rental_yield: 7.2,
  rental_rate_monthly: '₹65–₹85/sqft/mo',
  locality_rank: '#1 commercial zone, Hyderabad',
  sro_registrations: '148 commercial transactions',
  infra_boost: '2 new SEZs · 2026',
  vacancy_rate: '1.8%',
  proj_2025: 12000,
  proj_2026: 13200,
  proj_2027: 14400,
  proj_2028: 15400,
  proj_2029: 16400,
  comps: [
    { name: 'Mindspace Offices 2,000sqft', area: '2,000 sqft', date: 'Nov 2024', price: '₹2.2Cr', price_per_unit: '₹11,000/sqft' },
    { name: 'Raheja IT Park Suite', area: '1,800 sqft', date: 'Oct 2024', price: '₹1.9Cr', price_per_unit: '₹10,556/sqft' },
  ],
  show_insights: true,
  show_price_chart: true,
  show_demand_chart: true,
  show_yield_chart: true,
  show_projections: true,
  show_comps: true,
};

export function seedInsightsFor(
  propertyType: string,
  locality: string,
): PropertyInsights | null {
  const loc = locality.toLowerCase();
  if (propertyType === 'Apartment' && loc.includes('gachibowli')) return SEED_INSIGHTS_APARTMENT_GACHIBOWLI;
  if (propertyType === 'Villa' && loc.includes('kokapet')) return SEED_INSIGHTS_VILLA_KOKAPET;
  if (propertyType === 'Land' && loc.includes('shamshabad')) return SEED_INSIGHTS_LAND_SHAMSHABAD;
  if (propertyType === 'Plot' && loc.includes('bachupally')) return SEED_INSIGHTS_PLOT_BACHUPALLY;
  if (propertyType === 'Commercial' && (loc.includes('hitec') || loc.includes('hitech'))) {
    return SEED_INSIGHTS_COMMERCIAL_HITEC;
  }
  return null;
}
