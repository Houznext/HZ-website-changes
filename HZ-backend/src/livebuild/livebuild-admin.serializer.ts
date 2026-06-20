import {
  LivebuildCustomer,
  LivebuildDpr,
  LivebuildDocument,
  LivebuildMaterial,
  LivebuildPayment,
  LivebuildProject,
  LivebuildPropertyInfo,
  LivebuildQuery,
  LivebuildRoom,
  LivebuildWorkType,
  Livebuild3dModel,
  Livebuild3dHotspot,
} from './entities';
import {
  coverGradientForProject,
  resolveCoverThumbnails,
} from './livebuild-cover.util';

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
  extras?: { openQueries?: number; coverThumbnails?: string[] },
) {
  const coverThumbnails = resolveCoverThumbnails(
    p.coverImageUrl,
    extras?.coverThumbnails,
  );
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
    coverImageUrl: p.coverImageUrl ?? undefined,
    coverGradient: coverGradientForProject(p.id),
    coverThumbnails: coverThumbnails.length ? coverThumbnails : undefined,
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
    coverImageUrl: p.coverImageUrl ?? undefined,
    panoramaUrl: p.panoramaUrl ?? undefined,
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
  const dimMatch = r.dimensions?.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)/i);
  const lengthFt =
    r.lengthFt != null ? Number(r.lengthFt) : dimMatch ? Number(dimMatch[1]) : null;
  const widthFt =
    r.widthFt != null ? Number(r.widthFt) : dimMatch ? Number(dimMatch[2]) : null;
  return {
    id: String(r.id),
    name: r.name,
    roomType: r.roomType ?? undefined,
    dimensions: r.dimensions ?? undefined,
    lengthFt,
    widthFt,
    areaSqft: r.areaSqft ?? undefined,
    ceilingHeight: r.ceilingHeight ?? undefined,
    flooring: r.flooring ?? undefined,
    progressPct: r.pct ?? 0,
    status: r.status ?? 'live',
    holdReason: r.holdReason,
    workTypes: wt,
  };
}

export function serializePropertyInfo(info: LivebuildPropertyInfo) {
  return {
    id: String(info.id),
    projectId: String(info.projectId),
    flatNumber: info.flatNumber ?? undefined,
    tower: info.tower ?? undefined,
    totalAreaSqft: info.totalAreaSqft ?? undefined,
    carpetAreaSqft: info.carpetAreaSqft ?? undefined,
    balconySqft: info.balconySqft ?? undefined,
    superBuiltUpSqft: info.superBuiltUpSqft ?? undefined,
    floor: info.floor ?? undefined,
    facing: info.facing ?? undefined,
    designScope: info.designScope ?? undefined,
    scopeIncluded: info.scopeIncluded ?? [],
    specifications: info.specifications ?? [],
    notes: info.notes ?? undefined,
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
  const status = m.status ?? 'started';
  return {
    id: String(m.id),
    name: m.name,
    category: m.category,
    specification: m.specification,
    quantity: Number(m.quantity),
    unit: m.unit,
    room: m.room?.name ?? '',
    roomId: m.roomId != null ? String(m.roomId) : undefined,
    brand: m.brand,
    status:
      status === 'not_started' || status === 'pending' ? 'started' : status,
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
  coverThumbnailsByProject?: Map<number, string[]>;
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
    projects: payload.projects.map((p) =>
      serializeProjectSummary(p, {
        coverThumbnails: payload.coverThumbnailsByProject?.get(p.id),
      }),
    ),
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

function serialize3dCamera(
  posX: number | null | undefined,
  posY: number | null | undefined,
  posZ: number | null | undefined,
  targetX: number | null | undefined,
  targetY: number | null | undefined,
  targetZ: number | null | undefined,
) {
  if (posX == null || posY == null || posZ == null) return undefined;
  return {
    position: [Number(posX), Number(posY), Number(posZ)] as [number, number, number],
    target: [
      Number(targetX ?? 0),
      Number(targetY ?? 0),
      Number(targetZ ?? 0),
    ] as [number, number, number],
  };
}

export function serialize3dHotspot(h: Livebuild3dHotspot) {
  return {
    id: String(h.id),
    modelId: String(h.modelId),
    roomId: h.roomId != null ? String(h.roomId) : undefined,
    roomName: h.room?.name ?? undefined,
    label: h.label,
    position: [Number(h.positionX), Number(h.positionY), Number(h.positionZ)] as [
      number,
      number,
      number,
    ],
    camera: serialize3dCamera(
      h.cameraPosX,
      h.cameraPosY,
      h.cameraPosZ,
      h.cameraTargetX,
      h.cameraTargetY,
      h.cameraTargetZ,
    ),
    displayOrder: h.displayOrder ?? 0,
  };
}

export function serialize3dModel(m: Livebuild3dModel, withHotspots = false) {
  return {
    id: String(m.id),
    projectId: String(m.projectId),
    label: m.label,
    modelType: m.modelType ?? 'full_home',
    floorNumber: m.floorNumber ?? undefined,
    roomId: m.roomId != null ? String(m.roomId) : undefined,
    roomName: m.room?.name ?? undefined,
    fileUrl: m.fileUrl,
    fileName: m.fileName ?? undefined,
    fileSizeBytes: m.fileSizeBytes != null ? Number(m.fileSizeBytes) : undefined,
    fileFormat: m.fileFormat ?? 'glb',
    isPrimary: !!m.isPrimary,
    camera: serialize3dCamera(
      m.cameraPosX,
      m.cameraPosY,
      m.cameraPosZ,
      m.cameraTargetX,
      m.cameraTargetY,
      m.cameraTargetZ,
    ),
    displayOrder: m.displayOrder ?? 0,
    hotspots: withHotspots
      ? (m.hotspots ?? []).map(serialize3dHotspot)
      : undefined,
  };
}
