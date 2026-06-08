import type { LbPropertyInfo } from './types';

export type LbPropertyCategory = 'apartment' | 'villa' | 'plot' | 'commercial';

export function getPropertyCategory(propertyType?: string | null): LbPropertyCategory {
  const p = (propertyType ?? '').toLowerCase();
  if (p === 'plot') return 'plot';
  if (p === 'commercial') return 'commercial';
  if (p.includes('villa') || p.includes('independent house')) return 'villa';
  return 'apartment';
}

export function propertyCategoryLabel(category: LbPropertyCategory): string {
  const map: Record<LbPropertyCategory, string> = {
    apartment: 'Apartment',
    villa: 'Villa / independent house',
    plot: 'Plot / land',
    commercial: 'Commercial',
  };
  return map[category];
}

type FieldKey =
  | 'flatNumber'
  | 'tower'
  | 'floor'
  | 'facing'
  | 'superBuiltUpSqft'
  | 'totalAreaSqft'
  | 'carpetAreaSqft'
  | 'balconySqft';

type FieldConfig = { label: string; show: boolean; placeholder?: string };

type CategoryUi = {
  locationTitle: string;
  areasTitle: string;
  scopeTitle: string;
  designScopeLabel: string;
  designScopePlaceholder: string;
  showScopeList: boolean;
  fields: Record<FieldKey, FieldConfig>;
  specHints: string[];
};

export const PROPERTY_CATEGORY_UI: Record<LbPropertyCategory, CategoryUi> = {
  apartment: {
    locationTitle: 'Unit & location',
    areasTitle: 'Flat dimensions & areas',
    scopeTitle: 'Design scope & specifications',
    designScopeLabel: 'Design scope summary',
    designScopePlaceholder:
      'e.g. Full home interior — modular kitchen, wardrobes, false ceiling, flooring',
    showScopeList: true,
    fields: {
      flatNumber: { label: 'Flat / unit number', show: true, placeholder: 'e.g. 1204' },
      tower: { label: 'Tower / block', show: true, placeholder: 'e.g. Tower B' },
      floor: { label: 'Floor', show: true, placeholder: 'e.g. 12' },
      facing: { label: 'Facing', show: true, placeholder: 'e.g. East' },
      superBuiltUpSqft: { label: 'Super built-up (sq ft)', show: true },
      totalAreaSqft: { label: 'Built-up area (sq ft)', show: true },
      carpetAreaSqft: { label: 'Carpet area (sq ft)', show: true },
      balconySqft: { label: 'Balcony area (sq ft)', show: true },
    },
    specHints: ['Ceiling height', 'Flooring type', 'Kitchen layout'],
  },
  villa: {
    locationTitle: 'Property location',
    areasTitle: 'Plot & built-up areas',
    scopeTitle: 'Construction scope & specifications',
    designScopeLabel: 'Scope summary',
    designScopePlaceholder:
      'e.g. G+2 villa — structure, MEP, interiors for ground and first floor',
    showScopeList: true,
    fields: {
      flatNumber: { label: 'Property / unit name', show: true, placeholder: 'e.g. Villa 7' },
      tower: { label: 'Block / wing', show: false },
      floor: { label: 'Number of floors', show: true, placeholder: 'e.g. G+2' },
      facing: { label: 'Facing', show: true, placeholder: 'e.g. North-East' },
      superBuiltUpSqft: { label: 'Built-up area (sq ft)', show: true },
      totalAreaSqft: { label: 'Plot area (sq ft)', show: true },
      carpetAreaSqft: { label: 'Usable / carpet area (sq ft)', show: true },
      balconySqft: { label: 'Garden / open area (sq ft)', show: true },
    },
    specHints: ['Parking slots', 'Setback (ft)', 'Structure type'],
  },
  plot: {
    locationTitle: 'Plot location',
    areasTitle: 'Plot dimensions',
    scopeTitle: 'Development scope & specifications',
    designScopeLabel: 'Planned development summary',
    designScopePlaceholder: 'e.g. Residential villa construction — 2400 sqft plot',
    showScopeList: true,
    fields: {
      flatNumber: { label: 'Survey / plot ID', show: true, placeholder: 'e.g. Sy. No. 45/2' },
      tower: { label: 'Layout / sector', show: true, placeholder: 'e.g. Sector 4' },
      floor: { label: 'FSI / floors allowed', show: true, placeholder: 'e.g. 1.5 FSI' },
      facing: { label: 'Facing', show: true, placeholder: 'e.g. West' },
      superBuiltUpSqft: { label: 'Permissible built-up (sq ft)', show: true },
      totalAreaSqft: { label: 'Plot area (sq ft)', show: true },
      carpetAreaSqft: { label: 'Net developable (sq ft)', show: false },
      balconySqft: { label: 'Road frontage (ft)', show: true },
    },
    specHints: ['Survey number', 'Plot dimensions (L×W)', 'Road width (ft)'],
  },
  commercial: {
    locationTitle: 'Unit & building',
    areasTitle: 'Commercial areas',
    scopeTitle: 'Fit-out scope & specifications',
    designScopeLabel: 'Scope summary',
    designScopePlaceholder:
      'e.g. Retail fit-out — flooring, ceiling, HVAC, signage, electrical',
    showScopeList: true,
    fields: {
      flatNumber: { label: 'Shop / unit number', show: true, placeholder: 'e.g. G-12' },
      tower: { label: 'Building / complex', show: true, placeholder: 'e.g. Phoenix Mall wing' },
      floor: { label: 'Floor', show: true, placeholder: 'e.g. Ground' },
      facing: { label: 'Frontage / facing', show: true, placeholder: 'e.g. Main road' },
      superBuiltUpSqft: { label: 'Super area (sq ft)', show: true },
      totalAreaSqft: { label: 'Chargeable area (sq ft)', show: true },
      carpetAreaSqft: { label: 'Carpet / leasable (sq ft)', show: true },
      balconySqft: { label: 'Common area share (sq ft)', show: false },
    },
    specHints: ['Use type (retail/office)', 'Ceiling height', 'Power load (kW)'],
  },
};

export function emptyPropertyInfo(): LbPropertyInfo {
  return {
    flatNumber: '',
    tower: '',
    totalAreaSqft: undefined,
    carpetAreaSqft: undefined,
    balconySqft: undefined,
    superBuiltUpSqft: undefined,
    floor: '',
    facing: '',
    designScope: '',
    scopeIncluded: [],
    specifications: [],
    notes: '',
  };
}

export function buildPropertyInfoPayload(form: LbPropertyInfo): Partial<LbPropertyInfo> {
  return {
    ...form,
    totalAreaSqft: form.totalAreaSqft ? Number(form.totalAreaSqft) : undefined,
    carpetAreaSqft: form.carpetAreaSqft ? Number(form.carpetAreaSqft) : undefined,
    balconySqft: form.balconySqft ? Number(form.balconySqft) : undefined,
    superBuiltUpSqft: form.superBuiltUpSqft ? Number(form.superBuiltUpSqft) : undefined,
    scopeIncluded: (form.scopeIncluded ?? []).filter(Boolean),
    specifications: (form.specifications ?? []).filter(
      (s) => s.label.trim() || s.value.trim(),
    ),
  };
}

/** Customer-facing area/info tiles keyed by category */
export function customerAreaTiles(
  category: LbPropertyCategory,
  info: {
    carpetArea?: string;
    builtUpArea?: string;
    superBuiltUpArea?: string;
    floorTower?: string;
    unitNumber?: string;
    facing?: string;
    balconySqft?: number;
  },
): { label: string; value?: string; unit?: string }[] {
  const ui = PROPERTY_CATEGORY_UI[category];
  const tiles: { label: string; value?: string; unit?: string }[] = [];

  if (ui.fields.carpetAreaSqft.show && info.carpetArea) {
    tiles.push({ label: ui.fields.carpetAreaSqft.label.replace(' (sq ft)', ''), value: info.carpetArea, unit: 'sqft' });
  }
  if (ui.fields.totalAreaSqft.show && info.builtUpArea) {
    tiles.push({ label: ui.fields.totalAreaSqft.label.replace(' (sq ft)', ''), value: info.builtUpArea, unit: 'sqft' });
  }
  if (ui.fields.superBuiltUpSqft.show && info.superBuiltUpArea) {
    tiles.push({ label: ui.fields.superBuiltUpSqft.label.replace(' (sq ft)', ''), value: info.superBuiltUpArea, unit: 'sqft' });
  }
  if (ui.fields.flatNumber.show && info.unitNumber) {
    tiles.push({ label: ui.fields.flatNumber.label, value: info.unitNumber });
  }
  if ((ui.fields.tower.show || category === 'plot') && info.floorTower) {
    tiles.push({ label: category === 'plot' ? 'Location' : ui.fields.tower.label, value: info.floorTower });
  } else if (ui.fields.floor.show && info.floorTower) {
    tiles.push({ label: 'Floor / location', value: info.floorTower });
  }
  if (ui.fields.facing.show && info.facing) {
    tiles.push({ label: ui.fields.facing.label, value: info.facing });
  }
  return tiles;
}

export type PropertyCategoryFeatures = {
  adminRoomsHeading: string;
  adminRoomsSub: string;
  addRoomLabel: string;
};

export const PROPERTY_CATEGORY_FEATURES: Record<LbPropertyCategory, PropertyCategoryFeatures> = {
  apartment: {
    adminRoomsHeading: 'Rooms & progress',
    adminRoomsSub: 'Track interior progress room by room',
    addRoomLabel: 'Add room',
  },
  villa: {
    adminRoomsHeading: 'Areas & floors',
    adminRoomsSub: 'Track villa construction by floor or area',
    addRoomLabel: 'Add area / floor',
  },
  plot: {
    adminRoomsHeading: 'Site phases (optional)',
    adminRoomsSub: 'Add phases such as Earthwork, Foundation, or Structure if tracking by stage',
    addRoomLabel: 'Add phase',
  },
  commercial: {
    adminRoomsHeading: 'Zones & areas',
    adminRoomsSub: 'Track fit-out progress by zone or floor area',
    addRoomLabel: 'Add zone',
  },
};
