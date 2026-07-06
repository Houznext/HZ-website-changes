export interface PropertyInsightsComp {
  name: string;
  area: string;
  date: string;
  /** Total sale price — number (admin) or formatted string (legacy seed). */
  price: number | string;
  /** Per-unit price — number (admin) or formatted string (legacy seed). */
  price_per_unit: number | string;
}

export interface PropertyInsightsLandmark {
  name: string;
  distance: string;
}

export interface PropertyInsights {
  price_current: number;
  price_5y_ago: number;
  price_10y_ago: number;
  price_peak: number;
  demand_score: number;
  price_unit: 'sqft' | 'sqyd' | 'acre';

  rental_yield?: number;
  cagr?: number;
  hold_period?: string;
  vacancy_rate?: number | string;
  new_supply?: string;
  rental_rate_monthly?: string;

  na_conversion?: 'converted' | 'not_converted' | 'patta';
  patta_available?: boolean;

  lp_number?: string;
  approval_authority?: 'HMDA' | 'DTCP' | 'RERA' | 'GHMC' | 'Panchayat';
  road_width_main?: string;
  road_width_internal?: string;

  locality_rank?: string;
  sro_registrations?: string;
  infra_boost?: string;

  landmarks?: PropertyInsightsLandmark[];

  /** Dynamic-year projections (current year + 1 … + 5). */
  proj_year_1?: number;
  proj_year_2?: number;
  proj_year_3?: number;
  proj_year_4?: number;
  proj_year_5?: number;

  /** Legacy hardcoded-year projections (seed data). */
  proj_2025?: number;
  proj_2026?: number;
  proj_2027?: number;
  proj_2028?: number;
  proj_2029?: number;

  comps?: PropertyInsightsComp[];

  show_insights: boolean;
  show_price_chart?: boolean;
  show_demand_chart?: boolean;
  show_yield_chart?: boolean;
  show_projections?: boolean;
  show_comps?: boolean;

  last_updated?: string;
  updated_by?: string;
}
