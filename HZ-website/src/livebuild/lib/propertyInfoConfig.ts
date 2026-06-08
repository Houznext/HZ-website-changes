export type LbPropertyCategory = 'apartment' | 'villa' | 'plot' | 'commercial';

export function getPropertyCategory(propertyType?: string | null): LbPropertyCategory {
  const p = (propertyType ?? '').toLowerCase();
  if (p === 'plot') return 'plot';
  if (p === 'commercial') return 'commercial';
  if (p.includes('villa') || p.includes('independent house')) return 'villa';
  return 'apartment';
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

type FieldConfig = { label: string; show: boolean };

type CategoryUi = {
  areasTitle: string;
  scopeTitle: string;
  fields: Record<FieldKey, FieldConfig>;
};

export const PROPERTY_CATEGORY_UI: Record<LbPropertyCategory, CategoryUi> = {
  apartment: {
    areasTitle: 'Flat dimensions & areas',
    scopeTitle: 'Design scope & specifications',
    fields: {
      flatNumber: { label: 'Unit number', show: true },
      tower: { label: 'Tower / block', show: true },
      floor: { label: 'Floor', show: true },
      facing: { label: 'Facing', show: true },
      superBuiltUpSqft: { label: 'Super built-up', show: true },
      totalAreaSqft: { label: 'Built-up area', show: true },
      carpetAreaSqft: { label: 'Carpet area', show: true },
      balconySqft: { label: 'Balcony area', show: true },
    },
  },
  villa: {
    areasTitle: 'Plot & built-up areas',
    scopeTitle: 'Construction scope & specifications',
    fields: {
      flatNumber: { label: 'Property / unit', show: true },
      tower: { label: 'Block / wing', show: false },
      floor: { label: 'Floors', show: true },
      facing: { label: 'Facing', show: true },
      superBuiltUpSqft: { label: 'Built-up area', show: true },
      totalAreaSqft: { label: 'Plot area', show: true },
      carpetAreaSqft: { label: 'Usable area', show: true },
      balconySqft: { label: 'Garden / open area', show: true },
    },
  },
  plot: {
    areasTitle: 'Plot dimensions',
    scopeTitle: 'Development scope & specifications',
    fields: {
      flatNumber: { label: 'Survey / plot ID', show: true },
      tower: { label: 'Layout / sector', show: true },
      floor: { label: 'FSI / floors allowed', show: true },
      facing: { label: 'Facing', show: true },
      superBuiltUpSqft: { label: 'Permissible built-up', show: true },
      totalAreaSqft: { label: 'Plot area', show: true },
      carpetAreaSqft: { label: 'Net developable', show: false },
      balconySqft: { label: 'Road frontage', show: true },
    },
  },
  commercial: {
    areasTitle: 'Commercial areas',
    scopeTitle: 'Fit-out scope & specifications',
    fields: {
      flatNumber: { label: 'Shop / unit number', show: true },
      tower: { label: 'Building / complex', show: true },
      floor: { label: 'Floor', show: true },
      facing: { label: 'Frontage / facing', show: true },
      superBuiltUpSqft: { label: 'Super area', show: true },
      totalAreaSqft: { label: 'Chargeable area', show: true },
      carpetAreaSqft: { label: 'Carpet / leasable', show: true },
      balconySqft: { label: 'Common area share', show: false },
    },
  },
};

export function propertyTypeBadgeLabel(propertyType?: string): string {
  const cat = getPropertyCategory(propertyType);
  if (cat === 'plot') return 'Plot';
  if (cat === 'commercial') return 'Commercial';
  if (cat === 'villa') return 'Villa';
  return 'Apartment';
}

export function customerAreaTiles(
  category: LbPropertyCategory,
  info: {
    carpetArea?: string;
    builtUpArea?: string;
    superBuiltUpArea?: string;
    balconyArea?: string;
    floorTower?: string;
    unitNumber?: string;
    facing?: string;
  },
): { label: string; value?: string; unit?: string; kind: 'area' | 'info' }[] {
  const ui = PROPERTY_CATEGORY_UI[category];
  const tiles: { label: string; value?: string; unit?: string; kind: 'area' | 'info' }[] = [];

  if (ui.fields.carpetAreaSqft.show && info.carpetArea) {
    tiles.push({ label: ui.fields.carpetAreaSqft.label, value: info.carpetArea, unit: 'sqft', kind: 'area' });
  }
  if (ui.fields.totalAreaSqft.show && info.builtUpArea) {
    tiles.push({ label: ui.fields.totalAreaSqft.label, value: info.builtUpArea, unit: 'sqft', kind: 'area' });
  }
  if (ui.fields.superBuiltUpSqft.show && info.superBuiltUpArea) {
    tiles.push({ label: ui.fields.superBuiltUpSqft.label, value: info.superBuiltUpArea, unit: 'sqft', kind: 'area' });
  }
  if (ui.fields.balconySqft.show && info.balconyArea) {
    tiles.push({ label: ui.fields.balconySqft.label, value: info.balconyArea, unit: category === 'plot' ? 'ft' : 'sqft', kind: 'area' });
  }
  if (ui.fields.flatNumber.show && info.unitNumber) {
    tiles.push({ label: ui.fields.flatNumber.label, value: info.unitNumber, kind: 'info' });
  }
  if (ui.fields.tower.show && info.floorTower) {
    tiles.push({ label: ui.fields.tower.label, value: info.floorTower, kind: 'info' });
  } else if (ui.fields.floor.show && info.floorTower) {
    tiles.push({ label: ui.fields.floor.label, value: info.floorTower, kind: 'info' });
  }
  if (ui.fields.facing.show && info.facing) {
    tiles.push({ label: ui.fields.facing.label, value: info.facing, kind: 'info' });
  }
  return tiles;
}

export type PropertyCategoryFeatures = {
  showRoomProgressHome: boolean;
  showRoomDimensionsPropertyInfo: boolean;
  roomProgressTitle: string;
  roomDimensionsTitle: string;
  vizHomeTitle: string;
  vizHomeCta: string;
  propertyInfoQuickSub: string;
  showBhkBadge: boolean;
};

export const PROPERTY_CATEGORY_FEATURES: Record<LbPropertyCategory, PropertyCategoryFeatures> = {
  apartment: {
    showRoomProgressHome: true,
    showRoomDimensionsPropertyInfo: true,
    roomProgressTitle: 'Room-wise progress',
    roomDimensionsTitle: 'Room-wise dimensions',
    vizHomeTitle: '3D Floor Visualisation',
    vizHomeCta: 'View 3D Floor Plan',
    propertyInfoQuickSub: 'Flat details & dimensions',
    showBhkBadge: true,
  },
  villa: {
    showRoomProgressHome: true,
    showRoomDimensionsPropertyInfo: true,
    roomProgressTitle: 'Area-wise progress',
    roomDimensionsTitle: 'Room & area dimensions',
    vizHomeTitle: '3D Villa Visualisation',
    vizHomeCta: 'View 3D walkthrough',
    propertyInfoQuickSub: 'Plot, built-up & scope',
    showBhkBadge: true,
  },
  plot: {
    showRoomProgressHome: false,
    showRoomDimensionsPropertyInfo: false,
    roomProgressTitle: 'Construction phases',
    roomDimensionsTitle: 'Phase breakdown',
    vizHomeTitle: 'Site Visualisation',
    vizHomeCta: 'View site plan & 3D',
    propertyInfoQuickSub: 'Plot dimensions & scope',
    showBhkBadge: false,
  },
  commercial: {
    showRoomProgressHome: true,
    showRoomDimensionsPropertyInfo: true,
    roomProgressTitle: 'Zone-wise progress',
    roomDimensionsTitle: 'Zones & leasable areas',
    vizHomeTitle: '3D Space Visualisation',
    vizHomeCta: 'View commercial layout',
    propertyInfoQuickSub: 'Unit areas & fit-out scope',
    showBhkBadge: false,
  },
};

export function shouldShowRoomProgressHome(
  category: LbPropertyCategory,
  roomCount: number,
): boolean {
  if (roomCount > 0) return true;
  return PROPERTY_CATEGORY_FEATURES[category].showRoomProgressHome;
}

export function shouldShowRoomDimensionsTable(
  category: LbPropertyCategory,
  roomCount: number,
): boolean {
  if (roomCount === 0) return false;
  return PROPERTY_CATEGORY_FEATURES[category].showRoomDimensionsPropertyInfo;
}
