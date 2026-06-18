export type LbProjectStatus = 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type LbProgressMethod = 'hybrid' | 'items' | 'manual';
export type LbPaymentStatus = 'paid' | 'due' | 'upcoming';
export type LbQueryStatus = 'open' | 'resolved';
export type LbWorkTypeStatus = 'active' | 'disabled';
export type LbRoomStatus = 'live' | 'hold' | 'done';
export type LbMaterialStatus = 'started' | 'procured' | 'installed';

export interface LbCustomer {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  projectCount?: number;
  activeProjectId?: string | null;
  activeProjectName?: string | null;
  overallProgressPct?: number;
  openQueries?: number;
}

export interface LbProjectSummary {
  id: string;
  code: string;
  name: string;
  customerName: string;
  customerMobile?: string;
  customerId?: string;
  propertyType?: string;
  projectType?: string;
  progressPct: number;
  phase?: string;
  status: LbProjectStatus | string;
  progressMethod?: LbProgressMethod | string;
  location?: string;
  openQueries?: number;
  days?: string;
}

export interface LbProjectStats {
  daysElapsed: number;
  totalDays: number;
  roomsCompleted: number;
  roomsTotal: number;
  workTypesActive: number;
  photosToday: number;
  openQueries: number;
}

export interface LbDashboard {
  stats: {
    activeProjects: number;
    completedProjects?: number;
    openQueries: number;
    pendingPayments: number;
    pendingMilestones?: number;
    customers: number;
  };
  projects: LbProjectSummary[];
  activity: LbActivityItem[];
  openQueries: LbQuery[];
}

export interface LbActivityItem {
  id: string;
  message: string;
  projectName?: string;
  createdAt: string;
  type?: string;
}

export interface LbProjectDetail extends LbProjectSummary {
  address?: string;
  startDate?: string;
  dueDate?: string;
  siteManagerId?: string | null;
  siteManagerName?: string | null;
  progressOverridePct?: number | null;
  progressOverrideReason?: string | null;
  onHoldReason?: string | null;
  coverImageUrl?: string | null;
  panoramaUrl?: string | null;
  customer?: LbCustomer;
  attention?: string[];
  stats?: LbProjectStats;
}

export interface LbPropertyInfo {
  id?: string;
  projectId?: string;
  flatNumber?: string;
  tower?: string;
  totalAreaSqft?: number;
  carpetAreaSqft?: number;
  balconySqft?: number;
  superBuiltUpSqft?: number;
  floor?: string;
  facing?: string;
  designScope?: string;
  scopeIncluded?: string[];
  specifications?: { label: string; value: string }[];
  notes?: string;
}

export interface LbRoom {
  id: string;
  name: string;
  roomType?: string;
  lengthFt?: number | null;
  widthFt?: number | null;
  areaSqft?: number;
  ceilingHeight?: string;
  flooring?: string;
  dimensions?: string;
  progressPct: number;
  status: LbRoomStatus | string;
  holdReason?: string | null;
  workTypes: { id: string; name: string; workTypeId?: string }[];
}

export interface LbWorkType {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  defaultRooms?: string[];
  activeProjectCount?: number;
  status: LbWorkTypeStatus | string;
  requiresPhotos?: boolean;
  sortOrder?: number;
}

export interface LbPayment {
  id: string;
  label: string;
  pctOfTotal: number;
  dueDate: string;
  status: LbPaymentStatus | string;
  paidDate?: string | null;
}

export interface LbQuery {
  id: string;
  subject: string;
  message: string;
  status: LbQueryStatus | string;
  room?: string;
  customerName?: string;
  projectName?: string;
  projectId?: string;
  createdAt: string;
  reply?: string | null;
}

export interface LbDocument {
  id: string;
  name: string;
  category: string;
  room?: string;
  workType?: string;
  uploadedAt: string;
  size?: string;
  expiryDate?: string | null;
  url?: string;
}

export interface LbMaterial {
  id: string;
  name: string;
  category: string;
  specification?: string;
  quantity: number;
  unit: string;
  room: string;
  roomId?: string;
  brand?: string;
  status: LbMaterialStatus | string;
  installDate?: string | null;
}

export interface LbDprSavedPhoto {
  id: string;
  url: string;
  fileName?: string;
}

export interface LbDprWorkTypeEntry {
  roomWorkTypeId: string;
  workTypeId: string;
  workTypeName: string;
  dprId?: string;
  previousPct?: number;
  pct?: number | null;
  doneToday?: boolean;
  notes?: string;
  photoCount?: number;
  photos?: LbDprSavedPhoto[];
}

export interface LbDprContext {
  date: string;
  roomId: string;
  roomName: string;
  workTypes: LbDprWorkTypeEntry[];
  summary?: { roomDelta?: string; projectDelta?: string };
}

export interface LbDprSubmitPayload {
  date: string;
  roomId: string;
  entries: {
    roomWorkTypeId: string;
    pct?: number;
    doneToday?: boolean;
    notes?: string;
  }[];
}

export interface LbTeamMember {
  id: string;
  name: string;
  role: string;
  initials?: string;
}

export interface LbNotificationSettings {
  dpr: boolean;
  query: boolean;
  payment: boolean;
  hold: boolean;
  doc: boolean;
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
  modelType: 'full_home' | 'floor' | 'room' | string;
  floorNumber?: number;
  roomId?: string;
  roomName?: string;
  fileUrl: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileFormat?: string;
  isPrimary: boolean;
  camera?: Lb3dCamera;
  displayOrder?: number;
  hotspots?: Lb3dHotspot[];
}

export interface CreateProjectPayload {
  name: string;
  customerFullName: string;
  customerPhone: string;
  customerMobile?: string;
  customerEmail?: string;
  propertyType?: string;
  projectType?: string;
  startDate: string;
  dueDate: string;
  address?: string;
  siteManagerId?: string;
  otpVerifiedToken?: string;
}
