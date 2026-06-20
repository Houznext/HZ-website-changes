export type LbProjectStatus = 'in_progress' | 'completed' | 'on_hold' | string;

export interface LbCustomer {
  id: string;
  fullName?: string;
  mobile?: string;
  email?: string;
}

export interface LbAuthResponse {
  token: string;
  customer?: LbCustomer;
}

export interface LbProjectSummary {
  id: string;
  title: string;
  location?: string;
  city?: string;
  locality?: string;
  status: LbProjectStatus;
  overallProgress: number;
  coverImageUrl?: string | null;
  coverGradient?: string;
  coverThumbnails?: string[];
  bhk?: string;
  propertyType?: string;
  propertyLabel?: string;
  projectType?: string;
  phase?: string;
  projectCode?: string;
  roomCount?: number;
  daysElapsed?: number;
  totalDays?: number;
  daysLabel?: string;
  startedAt?: string | null;
  dueAt?: string | null;
  latestUpdate?: { text: string; at?: string | null };
}

export interface LbGraphPoint {
  dayIndex: number;
  label?: string;
  dayName?: string;
  date?: string;
  actualPct: number;
  targetPct?: number;
  status?: 'live' | 'on_hold' | string;
}

export interface LbRoomSummary {
  id: string;
  name: string;
  icon?: string;
  progressPct: number;
  color?: 'apt' | 'pu' | 'am' | 'navy' | 'red' | string;
  status?: string;
  lastUpdate?: string | null;
}

export interface LbProjectHome {
  project: LbProjectSummary;
  graphPoints?: LbGraphPoint[];
  stats?: {
    completedPct: number;
    daysElapsed: number;
    totalDays: number;
    daysRemaining: number;
    onTargetLabel?: string;
  };
  rooms?: LbRoomSummary[];
  latestUpdate?: { text: string; at: string } | null;
  openQueriesCount?: number;
  paymentDuePct?: number;
}

export interface LbDprPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface LbDprDayEntry {
  date: string;
  photos: LbDprPhoto[];
}

export interface LbWorkTypeProgress {
  id: string;
  name: string;
  progressPct: number;
  status?: string;
  days?: LbDprDayEntry[];
}

export interface LbDayProgress {
  rooms: LbRoomSummary[];
  workTypes: LbWorkTypeProgress[];
}

export interface LbRoomDetail {
  id: string;
  name: string;
  progressPct: number;
  graphPoints?: LbGraphPoint[];
  totalDays?: number;
  startDate?: string | null;
  workTypes?: LbWorkTypeProgress[];
  materials?: LbMaterialItem[];
  images?: LbDprPhoto[];
  vizUrl?: string | null;
}

export interface LbPaymentMilestone {
  id: string;
  name: string;
  progressPct: number;
  status: string;
  dueDate?: string | null;
  paidDate?: string | null;
}

export interface LbPaymentDue {
  id: string;
  name: string;
  progressPct: number;
  status: string;
  dueDate?: string | null;
}

export interface LbPayments {
  overallPaidPct: number;
  pendingPct?: number;
  totalMilestones?: number;
  paidMilestonesCount?: number;
  pendingMilestonesCount?: number;
  milestones: LbPaymentMilestone[];
  nextDue?: LbPaymentDue | null;
  statementUrl?: string | null;
  payNowUrl?: string | null;
}

export interface LbQuery {
  id: string;
  subject: string;
  body?: string;
  status: string;
  createdAt: string;
  roomName?: string;
  reply?: string;
}

export interface LbMaterialItem {
  id: string;
  name: string;
  spec?: string;
  category?: string;
  brand?: string;
  qty?: string;
  unit?: string;
  status: string;
  room?: string;
  installedAt?: string | null;
}

export interface LbDocument {
  id: string;
  name: string;
  category?: string;
  url: string;
  uploadedAt?: string;
  roomName?: string;
  workType?: string;
  expiryDate?: string | null;
  fileSize?: number | null;
  fileSizeLabel?: string;
}

export interface LbDocumentsResponse {
  items: LbDocument[];
  categoryCounts: LbDocumentCategoryCounts;
}

export interface LbDocumentCategoryCounts {
  all: number;
  warranty: number;
  boq: number;
  agreement: number;
  design: number;
  other: number;
}

export interface LbPropertyRoomRow {
  id: string;
  name: string;
  icon?: string;
  dimensions: string;
  lengthWidth?: string;
  areaSqft?: number | null;
  areaLabel?: string;
  ceilingHeight?: string;
  flooring?: string;
}

export interface LbPropertyTimeline {
  startDate?: string | null;
  dueDate?: string | null;
  durationDays?: number | null;
  daysLeft?: number | null;
}

export interface LbMaterialsStats {
  total: number;
  installed: number;
  procured: number;
  started: number;
}

export interface LbMaterialsResponse {
  stats: LbMaterialsStats;
  roomOptions: string[];
  boqPdfUrl?: string | null;
  items: LbMaterialItem[];
}

export interface LbPropertyInfo {
  propertyType?: string;
  propertyCategory?: 'apartment' | 'villa' | 'plot' | 'commercial';
  bhk?: string;
  apartmentLabel?: string;
  projectTypeLabel?: string;
  carpetArea?: string;
  builtUpArea?: string;
  superBuiltUpArea?: string;
  balconyArea?: string;
  floorTower?: string;
  unitNumber?: string;
  facing?: string;
  address?: string;
  locationLine?: string;
  city?: string;
  packageName?: string;
  projectTitle?: string;
  projectCode?: string;
  designScope?: string;
  scopeIncluded?: string[];
  specifications?: { label: string; value: string }[];
  fields?: { label: string; value: string }[];
  rooms?: LbPropertyRoomRow[];
  timeline?: LbPropertyTimeline;
}

export interface Lb3dCamera {
  position: [number, number, number];
  target: [number, number, number];
}

export interface Lb3dHotspot {
  id: string;
  modelId: string;
  roomId?: string;
  roomName?: string;
  label: string;
  position: [number, number, number];
  camera?: Lb3dCamera;
  displayOrder?: number;
}

export interface Lb3dModel {
  id: string;
  projectId: string;
  label: string;
  modelType: string;
  floorNumber?: number;
  roomId?: string;
  roomName?: string;
  fileUrl: string;
  isPrimary: boolean;
  camera?: Lb3dCamera;
  hotspots?: Lb3dHotspot[];
}

export interface LbViz {
  panoramaUrl?: string | null;
  renderPct?: number;
  floorPlanUrl?: string | null;
  floorPlanPdfUrl?: string | null;
  floorPlanTitle?: string;
  rooms?: LbRoomSummary[];
  designSpecs?: { label: string; value: string }[];
  modelUrl?: string | null;
  models?: Lb3dModel[];
  primaryModel?: Lb3dModel | null;
  hotspots?: Lb3dHotspot[];
}

export interface LbAccountStats {
  activeProjects: number;
  completedProjects: number;
  totalProjects?: number;
  pendingPaymentLabel?: string;
  latestUpdate?: { text: string; at: string } | null;
  avgProgressPct?: number;
}
