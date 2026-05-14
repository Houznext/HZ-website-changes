import type { PropertyType } from '@/types/property.types';

export function num(v?: string | number | null): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Display price — no green; uses teal only where caller applies class. */
export function formatPriceInr(amount?: string | number | null): string {
  const n = num(amount);
  if (!n) return '₹—';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatArea(area?: string | number | null, unit?: string | null): string {
  const a = num(area);
  if (!a) return '—';
  return `${a.toLocaleString('en-IN')} ${unit || 'sqft'}`;
}

export function formatPSF(basePrice?: string | number | null, area?: string | number | null, unit = 'sqft'): string {
  const p = num(basePrice);
  const a = num(area);
  if (!p || !a) return '';
  const psf = Math.round(p / a);
  const u = unit === 'sqyd' || unit === 'sqyds' ? 'sqyd' : 'sqft';
  return `₹${psf.toLocaleString('en-IN')}/${u}`;
}

export function getPropertyGradient(type: string): string {
  const gradients: Record<string, string> = {
    Apartment: 'linear-gradient(135deg, #e8f1fd, #c7d9f5)',
    Villa: 'linear-gradient(135deg, #fce7f3, #f0d4e8)',
    Land: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    Plot: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
    'Row House': 'linear-gradient(135deg, #fce7f3, #f0d4e8)',
    Commercial: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    Studio: 'linear-gradient(135deg, #ccfbf1, #a7f3d0)',
    Farmhouse: 'linear-gradient(135deg, #ccfbf1, #99f6e4)',
  };
  return gradients[type] || gradients.Apartment;
}

export function estimateEMI(principal: number, ltvPercent = 80, ratePercent = 8.5, tenureYears = 20): number {
  const p = principal * (ltvPercent / 100);
  const r = ratePercent / 12 / 100;
  const n = tenureYears * 12;
  if (!p || !r || !n) return 0;
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

export function propertyImageUrls(p: {
  coverImageUrl?: string | null;
  photoUrls?: string[] | null;
  media?: { url: string }[] | null;
}): string[] {
  const from = [...(p.photoUrls || []), ...(p.media?.map((m) => m.url) || [])].filter(Boolean);
  const u = Array.from(new Set(from));
  if (p.coverImageUrl && !u.includes(p.coverImageUrl)) u.unshift(p.coverImageUrl);
  return u;
}

export function showEmiBlock(propertyType: PropertyType | string): boolean {
  return ['Apartment', 'Villa', 'Studio', 'Row House', 'Farmhouse'].includes(String(propertyType));
}
