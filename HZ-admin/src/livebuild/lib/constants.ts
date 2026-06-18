export const LB_PROPERTY_TYPES = [
  '2BHK Apartment',
  '3BHK Apartment',
  '4BHK Villa',
  'Villa',
  'Independent House',
  'Plot',
  'Commercial',
] as const;

export const LB_PROJECT_TYPES = ['Interior', 'Renovation', 'Construction'] as const;

export const LB_PHASES = [
  'Design',
  'Procurement',
  'Execution',
  'Finishing',
  'Handover',
] as const;

export const LB_PROJECT_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const LB_ROOM_TYPES = [
  'Bedroom',
  'Living room',
  'Kitchen',
  'Bathroom',
  'Balcony',
  'Study',
  'Other',
] as const;

export const LB_ROOM_NAMES = [
  'Master Bedroom',
  "Children's Bedroom",
  'Guest Bedroom',
  'Living Room',
  'Dining Room',
  'Kitchen',
  'Master Bath',
  'Common Bath',
  'Balcony',
  'Utility',
  'Pooja Room',
  'Study',
] as const;

export const LB_WT_CATEGORIES = [
  'Carpentry',
  'Electrical',
  'Plumbing',
  'Flooring',
  'Painting',
  'False ceiling',
  'Civil',
  'Finishing',
  'Custom',
] as const;

export const LB_DOC_CATEGORIES = [
  { id: 'warranty', label: 'Warranty slips' },
  { id: 'boq', label: 'BOQ' },
  { id: 'agreement', label: 'Agreements' },
  { id: 'design', label: 'Design files' },
  { id: 'statement', label: 'Payment statements' },
  { id: 'other', label: 'Other' },
] as const;

export const LB_DOC_UPLOAD_CATEGORIES = [
  'Warranty slip',
  'BOQ',
  'Agreement',
  'Design file',
  'Payment statement',
  'Other',
] as const;

export const LB_MATERIAL_CATEGORIES = [
  'Plywood & carpentry',
  'Electrical',
  'Flooring',
  'Tiles',
  'Painting',
  'False ceiling',
  'Plumbing',
  'Fittings',
  'Countertop',
  'Hardware',
  'Other',
] as const;

export const LB_MATERIAL_UNITS = [
  'No.',
  'sqft',
  'sqyd',
  'Mtrs',
  'Set',
  'Kg',
  'Ltrs',
  'Bags',
] as const;

export const LB_MATERIAL_STATUSES = [
  { id: 'started', label: 'Started' },
  { id: 'procured', label: 'Procured' },
  { id: 'installed', label: 'Installed' },
] as const;

/** Normalize legacy material status values for admin UI and API writes. */
export function normalizeMaterialStatus(status?: string | null): string {
  if (!status || status === 'not_started' || status === 'pending') return 'started';
  return status;
}

export const LB_PROGRESS_METHOD_LABEL: Record<string, string> = {
  hybrid: '⚡ Hybrid',
  items: '📋 Items',
  manual: '✏ Manual',
};

export const LB_STATUS_HEADER_BG: Record<string, string> = {
  in_progress: 'linear-gradient(135deg,#1a3d5c,#0f2a44)',
  completed: 'linear-gradient(135deg,#0d4f3c,#0a3d2e)',
  on_hold: 'linear-gradient(135deg,#3d2a0a,#2a1a04)',
  cancelled: 'linear-gradient(135deg,#3d1a1a,#2a0a0a)',
};

export const LB_ROOM_ICONS: Record<string, string> = {
  'Master Bedroom': '🛏',
  "Children's Bedroom": '🛏',
  'Guest Bedroom': '🛏',
  'Living Room': '🛋',
  'Dining Room': '🍽',
  Kitchen: '🍳',
  'Master Bath': '🚿',
  'Common Bath': '🚿',
  Balcony: '🌿',
  Study: '📚',
};

export function customerInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function avatarColor(name: string) {
  const palette = ['#2563eb', '#7c3aed', '#0d9488', '#d97706', '#dc2626'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return palette[h % palette.length];
}
