import {
  LivebuildCustomer,
  LivebuildDpr,
  LivebuildDocument,
  LivebuildMaterial,
  LivebuildPayment,
  LivebuildProject,
  LivebuildQuery,
  LivebuildRoom,
  LivebuildWorkType,
} from './entities';

function mapStatus(status: string | null | undefined): string {
  const s = (status ?? 'progress').toLowerCase();
  if (s === 'progress' || s === 'in_progress') return 'in_progress';
  if (s === 'hold' || s === 'on_hold') return 'on_hold';
  if (s === 'completed' || s === 'complete') return 'completed';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  return s;
}

function effectivePct(project: LivebuildProject): number {
  if (project.pctOverride != null) return project.pctOverride;
  return project.overallPct ?? 0;
}

export function serializeCustomer(c: LivebuildCustomer) {
  return {
    id: String(c.id),
    fullName: c.name,
    phone: c.mobile,
    email: c.email,
    address: c.address,
    otpVerified: c.otpVerified,
  };
}

function projectDaysLabel(p: LivebuildProject): string {
  if (!p.startDate) return '—';
  const elapsed = Math.max(
    0,
    Math.ceil((Date.now() - new Date(p.startDate).getTime()) / 86400000),
  );
  let total = 60;
  if (p.dueDate) {
    total = Math.max(
      1,
      Math.ceil(
        (new Date(p.dueDate).getTime() - new Date(p.startDate).getTime()) /
          86400000,
      ),
    );
  }
  return `${elapsed}/${total}`;
}

export function serializeProjectSummary(
  p: LivebuildProject,
  extras?: { openQueries?: number },
) {
  return {
    id: String(p.id),
    code: p.projectCode,
    name: p.name,
    customerName: p.customer?.name ?? p.customerMobile ?? '—',
    customerMobile: p.customerMobile ?? undefined,
    customerId: p.customerId != null ? String(p.customerId) : undefined,
    propertyType: p.propertyType ?? undefined,
    projectType: p.projectType ?? undefined,
    progressPct: effectivePct(p),
    phase: p.phase ?? undefined,
    status: mapStatus(p.status),
    progressMethod: p.pctMethod ?? 'hybrid',
    location: p.address ?? undefined,
    openQueries: extras?.openQueries,
    days: projectDaysLabel(p),
  };
}

export type LbProjectStats = {
  daysElapsed: number;
  totalDays: number;
  roomsCompleted: number;
  roomsTotal: number;
  workTypesActive: number;
  photosToday: number;
  openQueries: number;
};

export function serializeProjectDetail(
  p: LivebuildProject,
  openQueries = 0,
  stats?: LbProjectStats,
  attention: string[] = [],
) {
  const attentionList = [...attention];
  if (openQueries > 0 && !attentionList.some((a) => a.includes('quer'))) {
    attentionList.push(`${openQueries} open queries need reply`);
  }
  return {
    ...serializeProjectSummary(p, { openQueries }),
    address: p.address ?? undefined,
    startDate: p.startDate ?? undefined,
    dueDate: p.dueDate ?? undefined,
    siteManagerId: null,
    siteManagerName: p.siteManager ?? undefined,
    progressOverridePct: p.pctOverride,
    progressOverrideReason: p.pctOverrideReason ?? undefined,
    onHoldReason: p.holdReason ?? undefined,
    customer: p.customer ? serializeCustomer(p.customer) : undefined,
    stats,
    attention: attentionList,
  };
}

export function serializeRoom(r: LivebuildRoom) {
  const wt =
    r.roomWorkTypes?.map((rwt) => ({
      id: String(rwt.id),
      name: rwt.workType?.name ?? 'Work type',
      workTypeId: String(rwt.workTypeId),
    })) ?? [];
  const dimMatch = r.dimensions?.match(/(\d+)\s*[×x]\s*(\d+)/i);
  return {
    id: String(r.id),
    name: r.name,
    roomType: r.roomType ?? undefined,
    dimensions: r.dimensions ?? undefined,
    lengthFt: dimMatch ? Number(dimMatch[1]) : null,
    widthFt: dimMatch ? Number(dimMatch[2]) : null,
    progressPct: r.pct ?? 0,
    status: r.status ?? 'live',
    holdReason: r.holdReason,
    workTypes: wt,
  };
}

export function serializeWorkType(
  wt: LivebuildWorkType,
  activeProjectCount = 0,
) {
  return {
    id: String(wt.id),
    name: wt.name,
    category: wt.category ?? 'General',
    description: wt.description,
    defaultRooms: wt.defaultRooms ?? [],
    status: wt.status === 'disabled' ? 'disabled' : 'active',
    requiresPhotos: wt.requiresPhotos,
    sortOrder: wt.displayOrder,
    activeProjectCount,
  };
}

export function serializePayment(p: LivebuildPayment) {
  return {
    id: String(p.id),
    label: p.label,
    pctOfTotal: Number(p.pct),
    dueDate: p.dueDate ?? '',
    status: p.status ?? 'upcoming',
    paidDate: p.paidDate,
  };
}

export function serializeQuery(q: LivebuildQuery) {
  return {
    id: String(q.id),
    subject: q.subject,
    message: q.message,
    status: q.status ?? 'open',
    room: q.room?.name ?? undefined,
    customerName: q.customerName ?? q.project?.customer?.name,
    projectName: q.project?.name,
    projectId: String(q.projectId),
    createdAt:
      q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
    reply: q.reply,
  };
}

export function serializeDocument(d: LivebuildDocument) {
  return {
    id: String(d.id),
    name: d.name,
    category: d.category,
    room: d.room?.name ?? undefined,
    workType: d.relatedWorkType ?? undefined,
    uploadedAt:
      d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
    expiryDate: d.expiryDate,
    url: d.fileUrl ?? undefined,
  };
}

export function serializeMaterial(m: LivebuildMaterial) {
  return {
    id: String(m.id),
    name: m.name,
    category: m.category,
    specification: m.specification,
    quantity: Number(m.quantity),
    unit: m.unit,
    room: m.room?.name ?? '',
    brand: m.brand,
    status: m.status ?? 'not_started',
    installDate: m.installDate,
  };
}

export function serializeDashboard(payload: {
  activeProjects: number;
  completedProjects: number;
  openQueries: number;
  pendingPayments: number;
  pendingMilestones: number;
  totalCustomers: number;
  projects: LivebuildProject[];
  recentActivity: { id: string; message: string; projectName?: string; createdAt: string; type?: string }[];
  openQueriesList: LivebuildQuery[];
}) {
  return {
    stats: {
      activeProjects: payload.activeProjects,
      completedProjects: payload.completedProjects,
      openQueries: payload.openQueries,
      pendingPayments: payload.pendingPayments,
      pendingMilestones: payload.pendingMilestones,
      customers: payload.totalCustomers,
    },
    projects: payload.projects.map((p) => serializeProjectSummary(p)),
    activity: payload.recentActivity,
    openQueries: payload.openQueriesList.map(serializeQuery),
  };
}

export function activityFromDpr(d: LivebuildDpr): {
  id: string;
  message: string;
  projectName?: string;
  createdAt: string;
  type: string;
} {
  const parts = [
    d.workType?.name,
    d.room?.name ? `in ${d.room.name}` : null,
  ].filter(Boolean);
  return {
    id: `dpr-${d.id}`,
    message: `DPR: ${parts.join(' ') || 'Update submitted'}`,
    projectName: d.project?.name,
    createdAt:
      d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
    type: 'dpr',
  };
}

export function activityFromQuery(q: LivebuildQuery): {
  id: string;
  message: string;
  projectName?: string;
  createdAt: string;
  type: string;
} {
  return {
    id: `query-${q.id}`,
    message: `Query: ${q.subject}`,
    projectName: q.project?.name,
    createdAt:
      q.createdAt instanceof Date ? q.createdAt.toISOString() : String(q.createdAt),
    type: 'query',
  };
}
