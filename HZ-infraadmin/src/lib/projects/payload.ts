import type { ProjectFormDraft } from '@/context/ProjectFormContext';
import type { ProjectTypeKey } from './constants';
import { TYPE_BGS, TYPE_COLORS, TYPE_GRADIENTS } from './constants';

export function buildProjectPayload(form: ProjectFormDraft, published: boolean) {
  const type = (form.projectType || 'apartment') as ProjectTypeKey;
  const banks = form.approvedBanks ?? [];
  const configurations =
    form.configurations.length > 0
      ? form.configurations
      : form.plotSizes.map((p) => ({
          type: p.dimensions || 'Plot',
          area: p.sqyds ? `${p.sqyds} sqyds` : '',
          basePrice: p.ratePerSqyd ? `₹${p.ratePerSqyd}/sqyd` : '',
          allInclusive: p.totalPrice ? `₹${p.totalPrice}` : '',
        }));

  return {
    name: String(form.name || '').trim(),
    projectType: type,
    developerName: form.developerName || undefined,
    refCode: form.refCode || undefined,
    published,
    showInSearch: form.showInSearch ?? true,
    reraVerified: form.reraVerified ?? !!form.reraNumber,
    city: form.city || undefined,
    locality: form.locality || undefined,
    reraNumber: form.reraNumber || undefined,
    totalUnits: form.totalUnits ? Number(form.totalUnits) : form.totalPlots ? Number(form.totalPlots) : undefined,
    availableUnits: form.availableUnits ? Number(form.availableUnits) : undefined,
    towers: form.towers ? Number(form.towers) : undefined,
    maxFloors: form.maxFloors ? Number(form.maxFloors) : undefined,
    possessionDate: form.possessionDate || undefined,
    status: form.status || 'New Launch',
    minPrice: form.minPrice ? Number(form.minPrice) : undefined,
    maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
    pricePerUnitLabel: form.pricePerUnitLabel || undefined,
    unitsLabel: form.unitsLabel || (form.totalPlots ? `${form.totalPlots} plots` : undefined),
    configLabel: form.configLabel || undefined,
    bankCount: banks.length,
    enquiryCount: 0,
    gradientBg: form.gradientBg || TYPE_GRADIENTS[type],
    accentColor: form.accentColor || TYPE_COLORS[type],
    constructionProgress: form.constructionProgress ? Number(form.constructionProgress) : undefined,
    visibility: published ? 'published' : form.visibility === 'archived' ? 'archived' : 'draft',
    description: form.description || undefined,
    heroImageUrl: form.heroImageUrl || undefined,
    isFeatured: form.isFeatured ?? false,
    approvedBanks: banks,
    amenities: form.amenities ?? [],
    configurations,
    infrastructure: form.infrastructure ?? [],
    legal: form.legal ?? {},
    roadWidths: [
      form.mainRoadFt ? { label: 'Main road', width: `${form.mainRoadFt} ft` } : null,
      form.internalRoadFt ? { label: 'Internal roads', width: `${form.internalRoadFt} ft` } : null,
      form.laneRoadFt ? { label: 'Lane roads', width: `${form.laneRoadFt} ft` } : null,
    ].filter(Boolean) as { label: string; width: string }[],
    landmarks: [],
    faqs: [],
    developerInfo: {
      name: form.developerName || undefined,
      founded: form.developerFounded || undefined,
      location: form.city || undefined,
      highlights: form.developerHighlights ?? [],
    },
  };
}

export function priceRangeLabel(min?: string | null, max?: string | null, fmt: (n: number) => string = (n) => String(n)) {
  const lo = min != null ? Number(min) : NaN;
  const hi = max != null ? Number(max) : NaN;
  if (!Number.isNaN(lo) && !Number.isNaN(hi)) return `${fmt(lo)} – ${fmt(hi)}`;
  if (!Number.isNaN(lo)) return `${fmt(lo)}+`;
  if (!Number.isNaN(hi)) return `Up to ${fmt(hi)}`;
  return '—';
}

export function typeBadgeStyle(type: ProjectTypeKey) {
  return { background: TYPE_BGS[type], color: TYPE_COLORS[type] };
}
