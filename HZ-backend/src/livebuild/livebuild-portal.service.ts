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
import {
  coverGradientForProject,
  resolveCoverThumbnails,
  thumbnailsByProjectFromDprs,
} from './livebuild-cover.util';
import {
  averagePct,
  buildGraphPoints,
  projectGraphTimeline,
  roomPctFromWorkTypes,
  workTypePctAtDate,
} from './livebuild-graph.util';

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
    @InjectRepository(LivebuildDpr)
    private readonly dprRepo: Repository<LivebuildDpr>,
  ) {}

  private formatFileSize(bytes?: number | null): string {
    if (bytes == null || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private parseBhkLabel(name?: string | null): string | undefined {
    if (!name) return undefined;
    const m = name.match(/(\d)\s*bhk/i);
    if (m) return `${m[1]} BHK`;
    return undefined;
  }

  private propertyCategory(
    propertyType?: string | null,
  ): 'apartment' | 'villa' | 'plot' | 'commercial' {
    const p = (propertyType ?? '').toLowerCase();
    if (p === 'plot') return 'plot';
    if (p === 'commercial') return 'commercial';
    if (p.includes('villa') || p.includes('independent house')) return 'villa';
    return 'apartment';
  }

  private propertyTypeBadgeLabel(propertyType?: string | null): string {
    const cat = this.propertyCategory(propertyType);
    if (cat === 'plot') return 'Plot';
    if (cat === 'commercial') return 'Commercial';
    if (cat === 'villa') return 'Villa';
    return 'Apartment';
  }

  private parseRoomDimensions(room: LivebuildRoom): {
    lengthWidth: string;
    areaSqft: number | null;
  } {
    if (room.lengthFt != null && room.widthFt != null) {
      const l = Number(room.lengthFt);
      const w = Number(room.widthFt);
      return {
        lengthWidth: `${l} × ${w} ft`,
        areaSqft: room.areaSqft ?? Math.round(l * w),
      };
    }
    const dim = room.dimensions ?? '';
    const m = dim.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const l = parseFloat(m[1]);
      const w = parseFloat(m[2]);
      return {
        lengthWidth: `${l} × ${w} ft`,
        areaSqft: room.areaSqft ?? Math.round(l * w),
      };
    }
    return { lengthWidth: dim || '—', areaSqft: room.areaSqft ?? null };
  }

  private projectDaysLeft(dueDate?: string | null): number | null {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((due.getTime() - today.getTime()) / 86400000));
  }

  private projectDurationDays(
    startDate?: string | null,
    dueDate?: string | null,
  ): number | null {
    if (!startDate || !dueDate) return null;
    const start = new Date(startDate);
    const due = new Date(dueDate);
    return Math.max(
      1,
      Math.ceil((due.getTime() - start.getTime()) / 86400000) + 1,
    );
  }

  private mapMaterialItem(m: Record<string, unknown>) {
    const raw = String(m.status);
    const status =
      raw === 'not_started' || raw === 'pending' ? 'started' : raw;
    const workTypeName = (m.workType as { name?: string })?.name;
    return {
      id: String(m.id),
      name: String(m.name),
      spec: String(m.specification ?? ''),
      category: String(m.category ?? workTypeName ?? ''),
      brand: String(m.brand ?? '—'),
      qty: m.quantity != null ? String(m.quantity) : '',
      unit: String(m.unit ?? ''),
      status,
      room: (m.room as { name?: string })?.name,
      installedAt: m.installDate ? String(m.installDate) : null,
    };
  }

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

  private projectTimeline(p: LivebuildProject): {
    daysElapsed: number;
    totalDays: number;
  } {
    const start = p.startDate ? new Date(p.startDate) : new Date();
    const due = p.dueDate
      ? new Date(p.dueDate)
      : new Date(start.getTime() + 45 * 86400000);
    const totalDays = Math.max(
      1,
      Math.ceil((due.getTime() - start.getTime()) / 86400000),
    );
    const daysElapsed = p.startDate
      ? Math.min(
          totalDays,
          Math.max(
            0,
            Math.ceil(
              (Date.now() - new Date(p.startDate).getTime()) / 86400000,
            ),
          ),
        )
      : 0;
    return { daysElapsed, totalDays };
  }

  private latestUpdateForProject(
    p: LivebuildProject,
    latestDpr?: LivebuildDpr & { workType?: { name?: string } },
  ): { text: string; at: string | null } {
    const pct = this.core.getEffectivePct(p);
    if (latestDpr) {
      const wt = latestDpr.workType?.name;
      const note = latestDpr.notes?.trim();
      const text =
        note ||
        (wt ? `${wt} updated` : `${p.phase ?? 'Site'} progress logged`);
      return {
        text,
        at: (latestDpr.createdAt ?? latestDpr.reportDate)?.toString() ?? null,
      };
    }
    if (
      p.status === 'complete' ||
      p.overallPct >= 100 ||
      p.pctOverride === 100
    ) {
      const when = p.dueDate ?? p.updatedAt?.toISOString?.() ?? null;
      return {
        text: when
          ? `Completed on ${new Date(when).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
          : 'Project completed',
        at: when,
      };
    }
    return {
      text: `${p.phase ?? 'Project'} · ${pct}% complete`,
      at: p.updatedAt?.toISOString?.() ?? null,
    };
  }

  private mapProjectSummary(
    p: LivebuildProject,
    roomCount = 0,
    latestDpr?: LivebuildDpr,
    coverThumbnails?: string[],
  ) {
    const pct = this.core.getEffectivePct(p);
    const { daysElapsed, totalDays } = this.projectTimeline(p);
    const latest = this.latestUpdateForProject(p, latestDpr as LivebuildDpr & { workType?: { name?: string } });
    const thumbnails = resolveCoverThumbnails(p.coverImageUrl, coverThumbnails);
    return {
      id: String(p.id),
      title: p.name,
      location: p.address ?? undefined,
      city: undefined,
      locality: undefined,
      status: this.mapStatus(p.status),
      overallProgress: pct,
      coverImageUrl: p.coverImageUrl ?? null,
      coverGradient: coverGradientForProject(p.id),
      coverThumbnails: thumbnails.length ? thumbnails : undefined,
      bhk: this.parseBhkLabel(p.name),
      propertyType: p.propertyType ?? undefined,
      propertyLabel: p.propertyType ?? undefined,
      projectType: p.projectType ?? 'Interior',
      startedAt: p.startDate ?? null,
      dueAt: p.dueDate ?? null,
      phase: p.phase,
      projectCode: p.projectCode,
      roomCount,
      daysElapsed,
      totalDays,
      daysLabel: `${daysElapsed}/${totalDays}`,
      latestUpdate: latest,
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
    const progressPct = roomPctFromWorkTypes(room.roomWorkTypes ?? [], room.pct ?? 0);
    return {
      id: String(room.id),
      name: room.name,
      icon: this.roomIcon(room.name),
      progressPct,
      color: this.roomColor({ ...room, pct: progressPct }),
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
      .leftJoinAndSelect('p.rooms', 'rooms')
      .where(
        `p.customer_mobile = :normalized OR RIGHT(REGEXP_REPLACE(p.customer_mobile, '[^0-9]', '', 'g'), 10) = :suffix`,
        { normalized, suffix },
      )
      .orderBy('p.id', 'ASC')
      .getMany();

    const ids = projects.map((p) => p.id);
    const latestByProject = new Map<number, LivebuildDpr>();
    let thumbnailsByProject = new Map<number, string[]>();
    if (ids.length > 0) {
      const dprs = await this.dprRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.workType', 'wt')
        .leftJoinAndSelect('d.photos', 'photos')
        .where('d.project_id IN (:...ids)', { ids })
        .orderBy('d.report_date', 'DESC')
        .addOrderBy('d.created_at', 'DESC')
        .addOrderBy('photos.display_order', 'ASC')
        .getMany();
      for (const d of dprs) {
        if (!latestByProject.has(d.projectId)) {
          latestByProject.set(d.projectId, d);
        }
      }
      thumbnailsByProject = thumbnailsByProjectFromDprs(dprs);
    }

    return projects.map((p) =>
      this.mapProjectSummary(
        p,
        p.rooms?.length ?? 0,
        latestByProject.get(p.id),
        thumbnailsByProject.get(p.id),
      ),
    );
  }

  private async buildGraph(project: LivebuildProject, rooms: LivebuildRoom[]) {
    const timeline = projectGraphTimeline(project);
    const { totalDays, elapsedDay } = timeline;
    const onHold = rooms.some((r) => r.status === 'hold');
    const dprs = await this.dprRepo.find({
      where: { projectId: project.id },
      order: { reportDate: 'ASC', createdAt: 'ASC' },
    });

    const currentRoomPcts = rooms.map((room) => {
      const wts = room.roomWorkTypes ?? [];
      return roomPctFromWorkTypes(wts, room.pct ?? 0);
    });
    const currentActualPct = currentRoomPcts.length
      ? averagePct(currentRoomPcts)
      : this.core.getEffectivePct(project);

    const points = buildGraphPoints({
      timeline,
      onHold,
      currentActualPct,
      actualAtDay: (_dayIndex, dateStr, elapsed) => {
        const roomPcts = rooms.map((room) => {
          const wts = room.roomWorkTypes ?? [];
          if (!wts.length) return room.pct ?? 0;
          const wtPcts = wts.map((wt) => {
            if (_dayIndex === elapsed) return Number(wt.pct ?? 0);
            return workTypePctAtDate(
              wt.workTypeId,
              dateStr,
              dprs.filter((d) => d.roomId === room.id),
            );
          });
          return averagePct(wtPcts);
        });
        return roomPcts.length ? averagePct(roomPcts) : currentActualPct;
      },
    });

    return { points, totalDays, start: timeline.start };
  }

  async projectHome(projectId: number, mobile: string) {
    const ctx = { isAdmin: false, mobile };
    const raw = await this.core.getProject(projectId, ctx);
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['rooms', 'rooms.roomWorkTypes'],
    });
    if (!project) throw new Error('Project not found');
    const rooms = project.rooms ?? [];
    const { points, totalDays, start } = await this.buildGraph(project, rooms);
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
      project: this.mapProjectSummary(project, rooms.length),
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

    const explicitDate = opts.date ? this.normalizeDate(opts.date) : null;
    const rangeDays =
      explicitDate && !opts.range ? 1 : this.parseRangeDays(opts.range);
    const anchor = explicitDate
      ? new Date(`${explicitDate}T12:00:00.000Z`)
      : new Date();

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
    const room = await this.roomRepo.findOne({
      where: { id: roomId, projectId },
      relations: ['roomWorkTypes', 'roomWorkTypes.workType'],
    });
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

    const timeline = projectGraphTimeline(project ?? {});
    const { totalDays } = timeline;
    const roomDprs = await this.dprRepo.find({
      where: { projectId, roomId },
      order: { reportDate: 'ASC', createdAt: 'ASC' },
    });
    const workTypes = room.roomWorkTypes ?? [];
    const progressPct = roomPctFromWorkTypes(workTypes, room.pct ?? 0);

    const graphPoints = buildGraphPoints({
      timeline,
      onHold: room.status === 'hold',
      currentActualPct: progressPct,
      actualAtDay: (dayIndex, dateStr, elapsed) => {
        if (!workTypes.length) {
          if (dayIndex === elapsed) return progressPct;
          return elapsed > 0
            ? Math.round((progressPct * dayIndex) / elapsed)
            : 0;
        }
        const wtPcts = workTypes.map((wt) => {
          if (dayIndex === elapsed) return Number(wt.pct ?? 0);
          return workTypePctAtDate(wt.workTypeId, dateStr, roomDprs);
        });
        return averagePct(wtPcts);
      },
    });

    const docs = await this.core.listDocuments(projectId, ctx);
    const design = (docs as Array<{ category: string; fileUrl: string }>).find(
      (d) => d.category === 'design',
    );

    return {
      id: String(room.id),
      name: room.name,
      progressPct,
      graphPoints,
      totalDays,
      startDate: project?.startDate ?? null,
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
    const milestones = (rows as Array<Record<string, unknown>>).map((p) => ({
      id: String(p.id),
      name: String(p.label),
      progressPct: Number(p.pct),
      status: String(p.status),
      dueDate: p.dueDate ? String(p.dueDate) : null,
      paidDate: p.paidDate ? String(p.paidDate) : null,
    }));
    const paidRows = milestones.filter((p) => p.status === 'paid');
    const pendingRows = milestones.filter((p) => p.status !== 'paid');
    const overallPaidPct = Math.min(
      100,
      Math.round(paidRows.reduce((s, p) => s + p.progressPct, 0)),
    );
    const pendingPct = Math.min(
      100,
      Math.round(pendingRows.reduce((s, p) => s + p.progressPct, 0)),
    );
    const nextDue =
      milestones.find((p) => p.status === 'due') ??
      milestones.find((p) => p.status === 'upcoming') ??
      null;

    const docs = await this.core.listDocuments(projectId, ctx);
    const statement = (
      docs as Array<{ category: string; fileUrl: string }>
    ).find((d) => d.category === 'statement' || d.category === 'payment');

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      select: ['projectCode', 'name', 'siteManager'],
    });
    const payEmail =
      process.env.LIVEBUILD_PAYMENTS_EMAIL?.trim() || 'accounts@houznext.com';
    const payWhatsApp = process.env.LIVEBUILD_PAYMENTS_WHATSAPP?.replace(
      /\D/g,
      '',
    );
    let payNowUrl: string | null = null;
    if (nextDue && project) {
      const subject = encodeURIComponent(
        `Payment — ${project.projectCode} — ${nextDue.name}`,
      );
      const body = encodeURIComponent(
        [
          'Hello,',
          '',
          `I would like to pay for: ${nextDue.name}`,
          `Project: ${project.name} (${project.projectCode})`,
          `Amount: ${Math.round(nextDue.progressPct)}% of total project cost`,
          project.siteManager ? `Site manager: ${project.siteManager}` : '',
          '',
          'Thank you.',
        ]
          .filter(Boolean)
          .join('\n'),
      );
      if (payWhatsApp && payWhatsApp.length >= 10) {
        const text = decodeURIComponent(body);
        payNowUrl = `https://wa.me/${payWhatsApp}?text=${encodeURIComponent(text)}`;
      } else {
        payNowUrl = `mailto:${payEmail}?subject=${subject}&body=${body}`;
      }
    }

    return {
      overallPaidPct,
      pendingPct,
      totalMilestones: milestones.length,
      paidMilestonesCount: paidRows.length,
      pendingMilestonesCount: pendingRows.length,
      milestones,
      nextDue,
      statementUrl: statement?.fileUrl ?? null,
      payNowUrl,
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
    const bhk = this.parseBhkLabel(project.name);
    const locationParts = [
      project.address,
      [
        info?.tower,
        info?.floor ? `Floor ${info.floor}` : null,
        info?.flatNumber ? `Unit ${info.flatNumber}` : null,
      ]
        .filter(Boolean)
        .join(', '),
    ].filter(Boolean);

    const scopeIncluded =
      info?.scopeIncluded?.length
        ? info.scopeIncluded
        : info?.designScope
          ? info.designScope
              .split(/[,—–-]/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

    const specifications =
      info?.specifications?.length
        ? info.specifications
        : [
            { label: 'Package notes', value: info?.notes ?? '—' },
          ].filter((s) => s.value && s.value !== '—');

    const rooms = (project.rooms ?? [])
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((r) => {
        const dims = this.parseRoomDimensions(r);
        return {
          id: String(r.id),
          name: r.name,
          icon: this.roomIcon(r.name),
          dimensions: r.dimensions ?? dims.lengthWidth,
          lengthWidth: dims.lengthWidth,
          areaSqft: dims.areaSqft,
          areaLabel: dims.areaSqft != null ? `${dims.areaSqft} sqft` : '—',
          ceilingHeight: r.ceilingHeight ?? '—',
          flooring: r.flooring ?? '—',
        };
      });

    const durationDays = this.projectDurationDays(
      project.startDate,
      project.dueDate,
    );
    const daysLeft = this.projectDaysLeft(project.dueDate);
    const propertyCategory = this.propertyCategory(project.propertyType);

    return {
      propertyType: project.propertyType ?? undefined,
      propertyCategory,
      bhk,
      apartmentLabel: this.propertyTypeBadgeLabel(project.propertyType),
      projectTypeLabel: project.projectType
        ? `${project.projectType} project`
        : 'Interior project',
      carpetArea: info?.carpetAreaSqft
        ? `${info.carpetAreaSqft}`
        : undefined,
      builtUpArea: info?.totalAreaSqft ? `${info.totalAreaSqft}` : undefined,
      superBuiltUpArea: info?.superBuiltUpSqft
        ? `${info.superBuiltUpSqft}`
        : info?.totalAreaSqft && info?.balconySqft
          ? `${info.totalAreaSqft + info.balconySqft}`
          : undefined,
      balconyArea: info?.balconySqft ? `${info.balconySqft}` : undefined,
      floorTower:
        info?.floor || info?.tower
          ? `${info?.floor ? `Floor ${info.floor}` : ''}${info?.floor && info?.tower ? ' · ' : ''}${info?.tower ?? ''}`
          : undefined,
      unitNumber: info?.flatNumber ?? undefined,
      facing: info?.facing ? `${info.facing} facing` : undefined,
      address: project.address ?? undefined,
      locationLine: locationParts.join(' · ') || undefined,
      packageName: project.phase ?? undefined,
      projectTitle: project.name,
      projectCode: project.projectCode ?? undefined,
      designScope: info?.designScope ?? undefined,
      scopeIncluded,
      specifications,
      rooms,
      timeline: {
        startDate: project.startDate ?? null,
        dueDate: project.dueDate ?? null,
        durationDays,
        daysLeft,
      },
    };
  }

  async materialsPortal(
    projectId: number,
    mobile: string,
    filters?: { status?: string; room?: string },
  ) {
    const ctx = { isAdmin: false, mobile };
    const rows = await this.core.listMaterials(projectId, ctx);
    const allItems = (rows as unknown as Array<Record<string, unknown>>).map(
      (m) => this.mapMaterialItem(m),
    );

    let items = allItems;
    if (filters?.status && filters.status !== 'all') {
      const want =
        filters.status === 'pending' || filters.status === 'not_started'
          ? 'started'
          : filters.status;
      items = items.filter((m) => m.status === want);
    }
    if (filters?.room && filters.room !== 'all') {
      items = items.filter(
        (m) =>
          String(m.room ?? '')
            .toLowerCase()
            .includes(filters.room!.toLowerCase()),
      );
    }

    const stats = {
      total: allItems.length,
      installed: allItems.filter((m) => m.status === 'installed').length,
      procured: allItems.filter((m) => m.status === 'procured').length,
      started: allItems.filter((m) => m.status === 'started').length,
    };

    const roomOptions = Array.from(
      new Set(allItems.map((m) => m.room).filter(Boolean) as string[]),
    ).sort();

    const docs = await this.core.listDocuments(projectId, ctx);
    const boq = (docs as Array<{ category: string; fileUrl: string }>).find(
      (d) => d.category === 'boq',
    );

    return {
      stats,
      roomOptions,
      boqPdfUrl: boq?.fileUrl ?? null,
      items,
    };
  }

  async documentsPortal(projectId: number, mobile: string) {
    const rows = await this.core.listDocuments(projectId, {
      isAdmin: false,
      mobile,
    });
    const items = (rows as unknown as Array<Record<string, unknown>>).map(
      (d) => ({
        id: String(d.id),
        name: String(d.name),
        category: String(d.category ?? 'other').toLowerCase(),
        url: String(d.fileUrl),
        uploadedAt: d.createdAt ? String(d.createdAt) : undefined,
        roomName: (d.room as { name?: string })?.name ?? 'General',
        workType: d.relatedWorkType ? String(d.relatedWorkType) : undefined,
        expiryDate: d.expiryDate ? String(d.expiryDate) : null,
        fileSize: d.fileSize != null ? Number(d.fileSize) : null,
        fileSizeLabel: this.formatFileSize(
          d.fileSize != null ? Number(d.fileSize) : null,
        ),
      }),
    );

    const countFor = (cat: string) =>
      items.filter((d) => d.category === cat).length;

    const categoryCounts = {
      all: items.length,
      warranty: countFor('warranty'),
      boq: countFor('boq'),
      agreement: countFor('agreement'),
      design: countFor('design'),
      other: items.filter(
        (d) =>
          !['warranty', 'boq', 'agreement', 'design'].includes(d.category),
      ).length,
    };

    return { items, categoryCounts };
  }

  async vizPortal(projectId: number, mobile: string) {
    const ctx = { isAdmin: false, mobile };
    await this.core.getProject(projectId, ctx);
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['propertyInfo', 'rooms'],
    });
    const docs = await this.core.listDocuments(projectId, ctx);
    const design = (docs as Array<{ category: string; fileUrl: string }>).find(
      (d) => d.category === 'design' || d.category === 'floor_plan',
    );
    const info = project?.propertyInfo;
    const rooms = (project?.rooms ?? []).map((r) => this.mapRoom(r));
    const floorPlanTitle = project
      ? `${this.parseBhkLabel(project.name) ?? 'Project'} Floor Plan`
      : 'Floor Plan';
    const designSpecs = [
      { label: 'Style', value: project?.name ?? 'Interior design' },
      {
        label: 'Scope',
        value: info?.designScope ?? 'Full home interior',
      },
      {
        label: 'Floor',
        value: info?.floor ? `Floor ${info.floor}` : '—',
      },
      {
        label: 'Facing',
        value: info?.facing ?? '—',
      },
    ];

    const viz3d = await this.core.get3dVizPayload(projectId);

    return {
      panoramaUrl: project?.panoramaUrl ?? null,
      renderPct: project
        ? this.core.getEffectivePct(project)
        : 0,
      floorPlanUrl: design?.fileUrl ?? null,
      floorPlanPdfUrl: design?.fileUrl ?? null,
      floorPlanTitle,
      rooms,
      designSpecs,
      models: viz3d.models,
      primaryModel: viz3d.primaryModel,
      modelUrl: viz3d.primaryModel?.fileUrl ?? null,
      hotspots: viz3d.primaryModel?.hotspots ?? [],
    };
  }
}
