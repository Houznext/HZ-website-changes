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
  bhk?: string;
  startedAt?: string | null;
  dueAt?: string | null;
}

export interface LbGraphPoint {
  dayIndex: number;
  label?: string;
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
}

export interface LbPayments {
  overallPaidPct: number;
  milestones: LbPaymentMilestone[];
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
}

export interface LbPropertyRoomRow {
  id: string;
  name: string;
  dimensions: string;
}

export interface LbPropertyInfo {
  propertyType?: string;
  bhk?: string;
  carpetArea?: string;
  builtUpArea?: string;
  address?: string;
  city?: string;
  packageName?: string;
  projectTitle?: string;
  projectCode?: string;
  designScope?: string;
  fields?: { label: string; value: string }[];
  rooms?: LbPropertyRoomRow[];
}

export interface LbViz {
  panoramaUrl?: string | null;
  renderPct?: number;
  floorPlanUrl?: string | null;
}

export interface LbAccountStats {
  activeProjects: number;
  completedProjects: number;
  totalProjects?: number;
  pendingPaymentLabel?: string;
  latestUpdate?: { text: string; at: string } | null;
  avgProgressPct?: number;
}
