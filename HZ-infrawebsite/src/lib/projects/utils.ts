import type { InfraProject } from '@/types/infra.types';
import {
  TYPE_BGS,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  STATUS_CLASS,
  STATUS_LABELS,
  type ProjectTypeKey,
} from './constants';
import { formatPrice } from '@/lib/format';

export function projectTypeKey(p: InfraProject): ProjectTypeKey {
  const t = (p.projectType || 'apartment').toLowerCase();
  if (t === 'villa') return 'villa';
  if (t === 'venture') return 'venture';
  if (t === 'villaplot') return 'villaplot';
  return 'apartment';
}

export function projectTypeLabel(p: InfraProject): string {
  return TYPE_LABELS[projectTypeKey(p)];
}

export function projectTypeIcon(p: InfraProject): string {
  return TYPE_ICONS[projectTypeKey(p)];
}

export function projectTypeColor(p: InfraProject): string {
  return p.accentColor || TYPE_COLORS[projectTypeKey(p)];
}

export function projectTypeBg(p: InfraProject): string {
  return p.gradientBg || `linear-gradient(135deg,${TYPE_BGS[projectTypeKey(p)]},#fff)`;
}

export function projectStatusClass(status: string): string {
  return STATUS_CLASS[status] || 'st-sold';
}

export function projectStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

export function projectPriceRange(p: InfraProject): string {
  if (p.minPrice && p.maxPrice) {
    return `${formatPrice(p.minPrice)} – ${formatPrice(p.maxPrice)}`;
  }
  return formatPrice(p.minPrice || p.maxPrice);
}

export function projectStartingPrice(p: InfraProject): string {
  return formatPrice(p.minPrice || p.maxPrice);
}

export function projectLocation(p: InfraProject): string {
  return [p.locality, p.city].filter(Boolean).join(', ');
}

export function projectSlug(p: InfraProject): string {
  return p.slug || p.projectId;
}

export type BudgetFilter = '' | '5000000' | '10000000' | '20000000' | '20000001';

export const BUDGET_OPTIONS: { value: BudgetFilter; label: string; max?: number; min?: number }[] = [
  { value: '', label: 'Any budget' },
  { value: '5000000', label: 'Under ₹50L', max: 5000000 },
  { value: '10000000', label: '₹50L–₹1Cr', max: 10000000, min: 5000000 },
  { value: '20000000', label: '₹1Cr–₹2Cr', max: 20000000, min: 10000000 },
  { value: '20000001', label: '₹2Cr+', min: 20000000 },
];

export function filterProjects(
  items: InfraProject[],
  opts: {
    type?: ProjectTypeKey | 'all';
    city?: string;
    status?: string;
    budget?: BudgetFilter;
    q?: string;
  },
): InfraProject[] {
  return items.filter((p) => {
    if (opts.type && opts.type !== 'all' && projectTypeKey(p) !== opts.type) return false;
    if (opts.city && opts.city !== 'all' && p.city !== opts.city) return false;
    if (opts.status && opts.status !== 'any' && p.status !== opts.status) return false;
    if (opts.budget) {
      const opt = BUDGET_OPTIONS.find((b) => b.value === opts.budget);
      const min = Number(p.minPrice || 0);
      const max = Number(p.maxPrice || p.minPrice || 0);
      if (opt?.max != null && min > opt.max) return false;
      if (opt?.min != null && max < opt.min) return false;
    }
    if (opts.q) {
      const q = opts.q.toLowerCase();
      const hay = [p.name, p.developerName, p.locality, p.city, p.refCode].filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function countByType(items: InfraProject[]): Record<ProjectTypeKey | 'all', number> {
  return {
    all: items.length,
    apartment: items.filter((p) => projectTypeKey(p) === 'apartment').length,
    villa: items.filter((p) => projectTypeKey(p) === 'villa').length,
    venture: items.filter((p) => projectTypeKey(p) === 'venture').length,
    villaplot: items.filter((p) => projectTypeKey(p) === 'villaplot').length,
  };
}

export function mapPropertyTypeToProjectType(propertyType?: string): ProjectTypeKey | undefined {
  if (!propertyType) return undefined;
  const t = propertyType.toLowerCase();
  if (t === 'apartment') return 'apartment';
  if (t === 'villa') return 'villa';
  if (t === 'plot' || t === 'land') return 'venture';
  return undefined;
}
