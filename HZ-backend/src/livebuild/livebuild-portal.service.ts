import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivebuildService } from './livebuild.service';
import { mobileSuffix10, normalizeLbMobile } from './livebuild-mobile.util';
import {
  LivebuildDpr,
  LivebuildProject,
  LivebuildRoom,
  LivebuildQuery,
} from './entities';

function readPaymentPct(pay: { pct?: number; pctOfTotal?: number }): number {
  return Number(pay.pctOfTotal ?? pay.pct ?? 0);
}

@Injectable()
export class LivebuildPortalService {
  constructor(
    private readonly core: LivebuildService,
    @InjectRepository(LivebuildProject)
    private readonly projectRepo: Repository<LivebuildProject>,
    @InjectRepository(LivebuildRoom)
    private readonly roomRepo: Repository<LivebuildRoom>,
    @InjectRepository(LivebuildQuery)
    private readonly queryRepo: Repository<LivebuildQuery>,
  ) {}

  private mapStatus(status: string): string {
    if (status === 'progress') return 'in_progress';
    if (status === 'hold') return 'on_hold';
    if (status === 'completed') return 'completed';
    return status;
  }

  private roomIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('kitchen')) return '🍳';
    if (n.includes('bed')) return '🛏️';
    if (n.includes('bath')) return '🚿';
    if (n.includes('living') || n.includes('hall')) return '🛋️';
    if (n.includes('dining')) return '🍽️';
    if (n.includes('balcon')) return '🌿';
    if (n.includes('study') || n.includes('office')) return '💼';
    if (n.includes('pooja')) return '🪔';
    return '🏠';
  }

  private parseRangeDays(range?: string): number {
    if (range === '14d') return 14;
    if (range === '30d') return 30;
    return 7;
  }

  private normalizeDate(input: string | Date): string {
    if (input instanceof Date) {
      const y = input.getUTCFullYear();
      const m = String(input.getUTCMonth() + 1).padStart(2, '0');
      const d = String(input.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const s = String(input).trim();
    const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if (iso) return iso[1];
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime())) return this.normalizeDate(parsed);
    return s;
  }

  private dprInRange(
    reportDate: string,
    anchor: Date,
    rangeDays: number,
  ): boolean {
    const end = this.normalizeDate(anchor);
    const start = new Date(anchor);
    start.setUTCDate(start.getUTCDate() - (rangeDays - 1));
    const startStr = this.normalizeDate(start);
    const d = this.normalizeDate(reportDate);
    return d >= startStr && d <= end;
  }

  private mapProjectSummary(p: LivebuildProject) {
    const pct = this.core.getEffectivePct(p);
    return {
      id: String(p.id),
      title: p.name,
      location: p.address ?? undefined,
      city: undefined,
      locality: undefined,
      status: this.mapStatus(p.status),
      overallProgress: pct,
      coverImageUrl: null,
      bhk: p.propertyType ?? undefined,
      startedAt: p.startDate ?? null,
      dueAt: p.dueDate ?? null,
      phase: p.phase,
      projectCode: p.projectCode,
    };
  }

  private roomColor(room: LivebuildRoom): string {
    if (room.status === 'hold') return 'am';
    if (room.pct >= 90) return 'tl';
    if (room.pct >= 50) return 'apt';
    if (room.pct >= 25) return 'pu';
    return 'navy';
  }

  private mapRoom(room: LivebuildRoom, lastUpdate?: string | null) {
    return {
      id: String(room.id),
      name: room.name,
      icon: this.roomIcon(room.name),
      progressPct: room.pct,
      color: this.roomColor(room),
      status: room.status,
      dimensions: room.dimensions ?? undefined,
      lastUpdate: lastUpdate ?? undefined,
    };
  }

  async myStats(mobile: string) {
    const normalized = normalizeLbMobile(mobile);
    const suffix = mobileSuffix10(mobile);
    const projects = await this.projectRepo
      .createQueryBuilder('p')
      .where(
        `p.customer_mobile = :normalized OR RIGHT(REGEXP_REPLACE(p.customer_mobile, '[^0-9]', '', 'g'), 10) = :suffix`,
        { normalized, suffix },
      )
      .getMany();
    const active = projects.filter((p) => p.status === 'progress').length;
    const completed = projects.filter((p) => p.status === 'complete' || p.pctOverride === 100 || p.overallPct >= 100).length;
    const avg =
      projects.length > 0
        ? Math.round(
            projects.reduce((s, p) => s + this.core.getEffectivePct(p), 0) /
              projects.length,
          )
        : 0;
    let pendingPaymentLabel: string | undefined;
    if (projects.length > 0) {
      const payments = await this.core.listPayments(projects[0].id, {
        isAdmin: false,
        mobile,
      });
      const upcoming = payments.find(
        (pay: { status?: string }) => pay.status === 'upcoming',
      );
      if (upcoming) {
        pendingPaymentLabel = `${readPaymentPct(upcoming)}% milestone due`;
      }
    }
    let latestUpdate: { text: string; at: string } | undefined;
    const first = projects[0];
    if (first) {
      latestUpdate = {
        text: `${first.phase ?? 'Project'} · ${this.core.getEffectivePct(first)}% complete`,
        at: (first.updatedAt ?? first.createdAt ?? new Date()).toISOString(),
      };
    }

    return {
      activeProjects: active,
      completedProjects: completed,
      totalProjects: projects.length,
      pendingPaymentLabel,
      avgProgressPct: avg,
      latestUpdate,
    };
  }

  async myProjectList(mobile: string) {
    const normalized = normalizeLbMobile(mobile);
    const suffix = mobileSuffix10(mobile);
    const projects = await this.projectRepo
      .createQueryBuilder('p')
      .where(
        `p.customer_mobile = :normalized OR RIGHT(REGEXP_REPLACE(p.customer_mobile, '[^0-9]', '', 'g'), 10) = :suffix`,
        { normalized, suffix },
      )
      .orderBy('p.id', 'ASC')
      .getMany();
    return projects.map((p) => this.mapProjectSummary(p));
  }

  private buildGraph(project: LivebuildProject, rooms: LivebuildRoom[]) {
    const start = project.startDate ? new Date(project.startDate) : new Date();
    const due = project.dueDate
      ? new Date(project.dueDate)
      : new Date(start.getTime() + 45 * 86400000);
    const totalDays = Math.max(
      1,
      Math.ceil((due.getTime() - start.getTime()) / 86400000),
    );
    const actualPct = this.core.getEffectivePct(project);
    const points = [];
    for (let i = 0; i <= Math.min(totalDays, 14); i++) {
      const targetPct = Math.min(100, Math.round((i / totalDays) * 100));
      const actual =
        i === Math.min(totalDays, 14)
          ? actualPct
          : Math.round((actualPct * i) / Math.min(totalDays, 14));
      points.push({
        dayIndex: i,
        label: `D${i}`,
        actualPct: actual,
        targetPct,
        status: rooms.some((r) => r.status === 'hold') ? 'on_hold' : 'live',
      });
    }
    return { points, totalDays, start, due };
  }

  async projectHome(projectId: number, mobile: string) {
    const ctx = { isAdmin: false, mobile };
    const raw = await this.core.getProject(projectId, ctx);
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['rooms'],
    });
    if (!project) throw new Error('Project not found');
    const rooms = project.rooms ?? [];
    const { points, totalDays, start } = this.buildGraph(project, rooms);
    const openQueries = await this.queryRepo.count({
      where: { projectId, status: 'open' },
    });
    const payments = await this.core.listPayments(projectId, ctx);
    const upcoming = Array.isArray(payments)
      ? payments.find((p: { status?: string }) => p.status === 'upcoming')
      : null;
    const daysElapsed = project.startDate
      ? Math.max(
          0,
          Math.ceil(
            (Date.now() - new Date(project.startDate).getTime()) / 86400000,
          ),
        )
      : 0;
    return {
      project: this.mapProjectSummary(project),
      graphPoints: points,
      stats: {
        completedPct: this.core.getEffectivePct(project),
        daysElapsed,
        totalDays,
        daysRemaining: Math.max(0, totalDays - daysElapsed),
        onTargetLabel:
          this.core.getEffectivePct(project) >=
          Math.round((daysElapsed / totalDays) * 100)
            ? 'On track'
            : 'Behind target',
      },
      rooms: rooms.map((r) => this.mapRoom(r, null)),
      latestUpdate: null,
      openQueriesCount: openQueries,
      paymentDuePct: upcoming ? readPaymentPct(upcoming) : 0,
      phase: project.phase,
    };
  }

  async dayProgress(
    projectId: number,
    mobile: string,
    opts: { roomId?: string; date?: string; range?: string },
  ) {
    const ctx = { isAdmin: false, mobile };
    await this.core.getProject(projectId, ctx);
    const roomRows = (await this.core.listRooms(projectId, ctx)) as LivebuildRoom[];
    const roomIdNum = opts.roomId
      ? Number(opts.roomId)
      : roomRows[0]?.id;
    if (!roomIdNum) {
      return { rooms: roomRows.map((r) => this.mapRoom(r)), workTypes: [] };
    }

    const rangeDays = this.parseRangeDays(opts.range);
    const anchor = opts.date ? new Date(opts.date) : new Date();

    const dprEntries = (await this.core.listDpr(
      projectId,
      ctx,
      undefined,
      roomIdNum,
    )) as LivebuildDpr[];

    const inRange = dprEntries.filter((d) =>
      this.dprInRange(String(d.reportDate), anchor, rangeDays),
    );

    const rwt = (await this.core.listRoomWorkTypes(roomIdNum, ctx)) as Array<{
      workTypeId: number;
      workType?: { name: string };
      pct: number;
      status?: string;
    }>;

    const workTypes = rwt.map((row) => {
      const entries = inRange
        .filter((d) => d.workTypeId === row.workTypeId)
        .sort((a, b) =>
          String(b.reportDate).localeCompare(String(a.reportDate)),
        );
      const latest = entries[0];
      const days = entries.map((e) => ({
        date: this.normalizeDate(String(e.reportDate)),
        photos: [...(e.photos ?? [])]
          .sort(
            (a, b) =>
              (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id,
          )
          .map((ph) => ({
            id: String(ph.id),
            url: ph.fileUrl,
          })),
      }));
      return {
        id: String(row.workTypeId),
        name: row.workType?.name ?? 'Work',
        progressPct: latest?.pctToday ?? row.pct ?? 0,
        status:
          row.status === 'in_progress' || row.status === 'live'
            ? 'live'
            : row.status,
        days,
      };
    });

    return {
      rooms: roomRows.map((r) => this.mapRoom(r)),
      workTypes,
    };
  }

  async roomDetail(projectId: number, roomId: number, mobile: string) {
    const ctx = { isAdmin: false, mobile };
    const room = await this.roomRepo.findOne({ where: { id: roomId, projectId } });
    if (!room) throw new Error('Room not found');
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    const materials = await this.core.listMaterials(projectId, ctx);
    const roomMaterials = (materials as Array<{ roomId?: number }>).filter(
      (m) => m.roomId === roomId,
    );

    const dayData = await this.dayProgress(projectId, mobile, {
      roomId: String(roomId),
      range: '14d',
    });

    const images = dayData.workTypes
      .flatMap((wt) =>
        (wt.days ?? []).flatMap((d) =>
          (d.photos ?? []).map((ph) => ({ ...ph, date: d.date })),
        ),
      )
      .slice(0, 24);

    const start = project?.startDate ? new Date(project.startDate) : new Date();
    const due = project?.dueDate
      ? new Date(project.dueDate)
      : new Date(start.getTime() + 45 * 86400000);
    const totalDays = Math.max(
      1,
      Math.ceil((due.getTime() - start.getTime()) / 86400000),
    );
    const graphPoints = [];
    for (let i = 0; i <= Math.min(totalDays, 10); i++) {
      graphPoints.push({
        dayIndex: i,
        label: `D${i}`,
        actualPct: Math.round((room.pct * i) / Math.min(totalDays, 10)),
        targetPct: Math.min(100, Math.round((100 * i) / totalDays)),
        status: room.status === 'hold' ? 'on_hold' : 'live',
      });
    }
    if (graphPoints.length) {
      graphPoints[graphPoints.length - 1].actualPct = room.pct;
    }

    const docs = await this.core.listDocuments(projectId, ctx);
    const design = (docs as Array<{ category: string; fileUrl: string }>).find(
      (d) => d.category === 'design',
    );

    return {
      id: String(room.id),
      name: room.name,
      progressPct: room.pct,
      graphPoints,
      workTypes: dayData.workTypes,
      materials: roomMaterials.map((m: Record<string, unknown>) => ({
        id: String(m.id),
        name: String(m.name),
        spec: String(m.specification ?? ''),
        status: String(m.status),
      })),
      images,
      vizUrl: design?.fileUrl ?? null,
    };
  }

  async paymentsPortal(projectId: number, mobile: string) {
    const ctx = { isAdmin: false, mobile };
    const rows = await this.core.listPayments(projectId, ctx);
    const paid = (rows as Array<{ status: string; pct: number }>).filter(
      (p) => p.status === 'paid',
    );
    const overallPaidPct = paid.reduce((s, p) => s + Number(p.pct), 0);
    return {
      overallPaidPct: Math.min(100, Math.round(overallPaidPct)),
      milestones: (rows as Array<Record<string, unknown>>).map((p) => ({
        id: String(p.id),
        name: String(p.label),
        progressPct: Number(p.pct),
        status: String(p.status),
        dueDate: p.dueDate ? String(p.dueDate) : null,
      })),
    };
  }

  async queriesPortal(projectId: number, mobile: string) {
    const rows = await this.core.listQueries(projectId, {
      isAdmin: false,
      mobile,
    });
    return (rows as unknown as Array<Record<string, unknown>>).map((q) => ({
      id: String(q.id),
      subject: String(q.subject),
      body: String(q.message ?? ''),
      status: String(q.status),
      createdAt: String(q.createdAt),
      roomName: (q.room as { name?: string })?.name,
      reply: q.reply ? String(q.reply) : undefined,
    }));
  }

  async propertyInfoPortal(projectId: number, mobile: string) {
    const ctx = { isAdmin: false, mobile };
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['propertyInfo', 'rooms'],
    });
    if (!project) throw new Error('Project not found');
    await this.core.getProject(projectId, ctx);

    const info = project.propertyInfo;
    const fields = [
      { label: 'Flat number', value: info?.flatNumber ?? '' },
      { label: 'Tower', value: info?.tower ?? '' },
      {
        label: 'Carpet area',
        value: info?.carpetAreaSqft ? `${info.carpetAreaSqft} sqft` : '',
      },
      {
        label: 'Total area',
        value: info?.totalAreaSqft ? `${info.totalAreaSqft} sqft` : '',
      },
      { label: 'Floor', value: info?.floor ?? '' },
      { label: 'Facing', value: info?.facing ?? '' },
      { label: 'Project code', value: project.projectCode ?? '' },
    ].filter((f) => f.value);

    const rooms = (project.rooms ?? []).map((r) => ({
      id: String(r.id),
      name: r.name,
      dimensions: r.dimensions ?? '—',
    }));

    return {
      propertyType: project.propertyType ?? undefined,
      bhk: project.propertyType ?? undefined,
      carpetArea: info?.carpetAreaSqft ? `${info.carpetAreaSqft} sq ft` : undefined,
      builtUpArea: info?.totalAreaSqft ? `${info.totalAreaSqft} sq ft` : undefined,
      address: project.address ?? undefined,
      city: undefined,
      packageName: project.phase ?? undefined,
      fields,
      designScope: info?.designScope ?? undefined,
      rooms,
      projectTitle: project.name,
      projectCode: project.projectCode ?? undefined,
    };
  }

  async materialsPortal(
    projectId: number,
    mobile: string,
    filters?: { status?: string; room?: string },
  ) {
    const rows = await this.core.listMaterials(projectId, {
      isAdmin: false,
      mobile,
    });
    let list = rows as unknown as Array<Record<string, unknown>>;
    if (filters?.status) {
      const want =
        filters.status === 'pending' ? 'not_started' : filters.status;
      list = list.filter((m) => String(m.status) === want);
    }
    if (filters?.room) {
      list = list.filter(
        (m) =>
          String((m.room as { name?: string })?.name ?? '')
            .toLowerCase()
            .includes(filters.room!.toLowerCase()),
      );
    }
    return list.map((m) => {
      const status = String(m.status);
      return {
        id: String(m.id),
        name: String(m.name),
        spec: String(m.specification ?? ''),
        category: String(m.category ?? ''),
        brand: String(m.brand ?? ''),
        qty: m.quantity != null ? String(m.quantity) : '',
        unit: String(m.unit ?? ''),
        status: status === 'not_started' ? 'pending' : status,
        room: (m.room as { name?: string })?.name,
        installedAt: m.installDate ? String(m.installDate) : null,
      };
    });
  }

  async documentsPortal(projectId: number, mobile: string) {
    const rows = await this.core.listDocuments(projectId, {
      isAdmin: false,
      mobile,
    });
    return (rows as unknown as Array<Record<string, unknown>>).map((d) => ({
      id: String(d.id),
      name: String(d.name),
      category: String(d.category),
      url: String(d.fileUrl),
      uploadedAt: d.createdAt ? String(d.createdAt) : undefined,
    }));
  }

  async vizPortal(projectId: number, mobile: string) {
    await this.core.getProject(projectId, { isAdmin: false, mobile });
    const docs = await this.core.listDocuments(projectId, {
      isAdmin: false,
      mobile,
    });
    const design = (docs as Array<{ category: string; fileUrl: string }>).find(
      (d) => d.category === 'design',
    );
    return {
      panoramaUrl: null,
      renderPct: this.core.getEffectivePct(
        (await this.projectRepo.findOne({ where: { id: projectId } }))!,
      ),
      floorPlanUrl: design?.fileUrl ?? null,
    };
  }
}
