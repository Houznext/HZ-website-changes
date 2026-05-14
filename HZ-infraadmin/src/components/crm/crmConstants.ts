/** Pipeline / stage ids aligned with HZ-infrabackend CrmLeadService */

export const CRM_STAGES = [
  { id: 'new', label: 'New enquiry', border: '#2563eb', win: '5%' },
  { id: 'contacted', label: 'Contacted', border: '#6d28d9', win: '15%' },
  { id: 'site_sched', label: 'Site visit scheduled', border: '#c2410c', win: '25%' },
  { id: 'site_done', label: 'Site visited', border: '#a21caf', win: '40%' },
  { id: 'negotiation', label: 'Negotiation', border: '#92400e', win: '60%' },
  { id: 'token', label: 'Token paid', border: '#0f766e', win: '80%' },
  { id: 'booked', label: 'Booked', border: '#15803d', win: '90%' },
  { id: 'registered', label: 'Registered', border: '#15803d', win: '100%' },
  { id: 'lost', label: 'Lost', border: '#dc2626', win: '—' },
  { id: 'nurture', label: 'Nurturing', border: '#78350f', win: '—' },
  { id: 'future', label: 'Future potential', border: '#92400e', win: '—' },
] as const;

export const STAGE_BADGE_CLASS: Record<string, string> = {
  new: 's-new',
  contacted: 's-contacted',
  site_sched: 's-site',
  site_done: 's-visited',
  negotiation: 's-negotiation',
  token: 's-token',
  booked: 's-booked',
  registered: 's-registered',
  lost: 's-lost',
  nurture: 's-nurture',
  future: 's-future',
};

export const AVATAR_COLORS = ['#2563eb', '#6d28d9', '#0d9488', '#a21caf', '#ea580c', '#16a34a', '#92400e', '#1d4ed8'];

export function getAvatarColor(name: string): string {
  const c = name?.trim()?.charCodeAt(0) ?? 0;
  return AVATAR_COLORS[c % AVATAR_COLORS.length];
}

export function scoreRingClass(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200';
  if (score >= 60) return 'bg-amber-100 text-amber-900 ring-1 ring-amber-200';
  if (score >= 40) return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
}

export const SOURCES = [
  'Website enquiry',
  '99 Acres',
  'Magic Bricks',
  'Walk-in',
  'Referral',
  'Instagram',
  'Facebook',
  'Housing.com',
  'No Broker',
] as const;

export const BUDGET_RANGES = ['Under ₹30L', '₹30L–₹60L', '₹60L–₹1Cr', '₹1Cr–₹2Cr', '₹2Cr+'] as const;

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Land', 'Commercial', 'Any'] as const;

export const BHK_OPTS = ['1BHK', '2BHK', '3BHK', '4BHK+', 'Any'] as const;
