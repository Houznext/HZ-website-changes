import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  LivebuildCustomer,
  LivebuildProject,
  LivebuildWorkType,
  LivebuildRoom,
  LivebuildRoomWorkType,
  LivebuildDpr,
  LivebuildDprPhoto,
  LivebuildPayment,
  LivebuildQuery,
  LivebuildDocument,
  LivebuildMaterial,
  LivebuildPropertyInfo,
} from './entities';
import {
  CreateCustomerDto,
  CreateDocumentMetaDto,
  CreateDprDto,
  CreateMaterialDto,
  CreatePaymentDto,
  CreateProjectDto,
  CreateQueryDto,
  CreateRoomDto,
  CreateWorkTypeDto,
  ReplyQueryDto,
  UpdateCustomerDto,
  UpdateMaterialDto,
  UpdatePaymentDto,
  UpdateProjectDto,
  UpdateRoomDto,
  UpdateRoomWorkTypeDto,
  UpdateWorkTypeDto,
  UpsertPropertyInfoDto,
} from './dto';
import {
  mobilesMatch,
  mobileSuffix10,
  normalizeLbMobile,
} from './livebuild-mobile.util';
import { LivebuildRequest } from './livebuild-auth.guard';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/sendEmail.service';
import {
  activityFromDpr,
  activityFromQuery,
  serializeCustomer,
  serializeDashboard,
  serializeDocument,
  serializeMaterial,
  serializePayment,
  LbProjectStats,
  serializeProjectDetail,
  serializeProjectSummary,
  serializeQuery,
  serializeRoom,
  serializeWorkType,
} from './livebuild-admin.serializer';

export type LbAccessContext = {
  isAdmin: boolean;
  mobile?: string;
};

@Injectable()
export class LivebuildService {
  constructor(
    @InjectRepository(LivebuildCustomer)
    private readonly customerRepo: Repository<LivebuildCustomer>,
    @InjectRepository(LivebuildProject)
    private readonly projectRepo: Repository<LivebuildProject>,
    @InjectRepository(LivebuildWorkType)
    private readonly workTypeRepo: Repository<LivebuildWorkType>,
    @InjectRepository(LivebuildRoom)
    private readonly roomRepo: Repository<LivebuildRoom>,
    @InjectRepository(LivebuildRoomWorkType)
    private readonly roomWtRepo: Repository<LivebuildRoomWorkType>,
    @InjectRepository(LivebuildDpr)
    private readonly dprRepo: Repository<LivebuildDpr>,
    @InjectRepository(LivebuildDprPhoto)
    private readonly dprPhotoRepo: Repository<LivebuildDprPhoto>,
    @InjectRepository(LivebuildPayment)
    private readonly paymentRepo: Repository<LivebuildPayment>,
    @InjectRepository(LivebuildQuery)
    private readonly queryRepo: Repository<LivebuildQuery>,
    @InjectRepository(LivebuildDocument)
    private readonly documentRepo: Repository<LivebuildDocument>,
    @InjectRepository(LivebuildMaterial)
    private readonly materialRepo: Repository<LivebuildMaterial>,
    @InjectRepository(LivebuildPropertyInfo)
    private readonly propertyRepo: Repository<LivebuildPropertyInfo>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly mailerService: MailerService,
  ) {}

  resolveAccess(req: LivebuildRequest): LbAccessContext {
    if (req.lbAdmin) return { isAdmin: true };
    if (req.lbMobile) return { isAdmin: false, mobile: req.lbMobile };
    throw new ForbiddenException('Unauthorized');
  }

  getEffectivePct(project: LivebuildProject): number {
    if (project.pctOverride != null) return project.pctOverride;
    return project.overallPct ?? 0;
  }

  private formatProject(project: LivebuildProject, isAdmin: boolean) {
    const base = {
      ...project,
      overallPct: this.getEffectivePct(project),
    };
    if (isAdmin) return base;
    const { pctOverride, pctOverrideReason, ...rest } = base as Record<string, unknown>;
    return rest;
  }

  private mobilesMatch(a: string, b: string): boolean {
    return mobilesMatch(a, b);
  }

  private async assertProjectAccess(
    projectId: number,
    ctx: LbAccessContext,
  ): Promise<LivebuildProject> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (
      !ctx.isAdmin &&
      !this.mobilesMatch(project.customerMobile, ctx.mobile ?? '')
    ) {
      throw new ForbiddenException('Project not accessible');
    }
    return project;
  }

  slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async getNextProjectCode(): Promise<{ nextCode: string }> {
    const rows = await this.dataSource.query(
      `SELECT 'HZLB-' || LPAD(
        CASE WHEN is_called THEN last_value + 1 ELSE last_value END::TEXT,
        4, '0'
      ) AS next_code FROM livebuild_project_code_seq`,
    );
    return { nextCode: rows[0]?.next_code ?? 'HZLB-0001' };
  }

  private async assignProjectCode(): Promise<string> {
    const rows = await this.dataSource.query(
      `SELECT 'HZLB-' || LPAD(nextval('livebuild_project_code_seq')::TEXT, 4, '0') AS code`,
    );
    return rows[0].code;
  }

  async recalcHybridPct(projectId: number): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project || project.pctMethod !== 'hybrid' || project.pctOverride != null) return;
    const result = await this.roomRepo
      .createQueryBuilder('r')
      .select('COALESCE(ROUND(AVG(r.pct)), 0)', 'avg')
      .where('r.project_id = :projectId', { projectId })
      .getRawOne<{ avg: string }>();
    await this.projectRepo.update(projectId, {
      overallPct: Number(result?.avg ?? 0),
    });
  }

  // —— Projects ——
  async listProjectsAdmin(q?: string) {
    const qb = this.projectRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.customer', 'customer')
      .orderBy('p.id', 'ASC');
    const term = q?.trim().toLowerCase();
    if (term) {
      qb.andWhere(
        `(LOWER(p.name) LIKE :q OR LOWER(p.project_code) LIKE :q OR LOWER(p.customer_mobile) LIKE :q OR LOWER(customer.name) LIKE :q)`,
        { q: `%${term}%` },
      );
    }
    const projects = await qb.getMany();
    return projects.map((p) => serializeProjectSummary(p));
  }

  async listMyProjects(mobile: string) {
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
    return projects.map((p) => this.formatProject(p, false));
  }

  async getProject(id: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(id, ctx);
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['customer', 'rooms', 'propertyInfo'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (ctx.isAdmin) {
      const openQueries = await this.queryRepo.count({
        where: { projectId: id, status: 'open' },
      });
      const { stats, attention } = await this.buildProjectOverviewMeta(id, project);
      return serializeProjectDetail(project, openQueries, stats, attention);
    }
    return this.formatProject(project, false);
  }

  private statusToDb(status: string): string {
    const s = status.toLowerCase();
    if (s === 'in_progress') return 'progress';
    if (s === 'on_hold') return 'hold';
    if (s === 'completed') return 'completed';
    if (s === 'cancelled') return 'canceled';
    return status;
  }

  private async buildProjectOverviewMeta(
    projectId: number,
    project: LivebuildProject,
  ): Promise<{ stats: LbProjectStats; attention: string[] }> {
    const today = new Date().toISOString().slice(0, 10);
    const rooms = await this.roomRepo.find({ where: { projectId } });
    const openQueries = await this.queryRepo.count({
      where: { projectId, status: 'open' },
    });
    const duePayments = await this.paymentRepo.count({
      where: { projectId, status: 'due' },
    });
    const dprToday = await this.dprRepo.count({
      where: { projectId, reportDate: today },
    });
    const photosToday = await this.dprPhotoRepo
      .createQueryBuilder('ph')
      .innerJoin('ph.dpr', 'd')
      .where('d.project_id = :projectId', { projectId })
      .andWhere('d.report_date = :today', { today })
      .getCount();
    const workTypesActive = await this.roomWtRepo
      .createQueryBuilder('rwt')
      .innerJoin('rwt.room', 'room')
      .where('room.project_id = :projectId', { projectId })
      .getCount();

    let daysElapsed = 0;
    let totalDays = 60;
    if (project.startDate) {
      daysElapsed = Math.max(
        0,
        Math.ceil(
          (Date.now() - new Date(project.startDate).getTime()) / 86400000,
        ),
      );
    }
    if (project.startDate && project.dueDate) {
      totalDays = Math.max(
        1,
        Math.ceil(
          (new Date(project.dueDate).getTime() -
            new Date(project.startDate).getTime()) /
            86400000,
        ),
      );
    }

    const attention: string[] = [];
    if (openQueries > 0) {
      attention.push(`${openQueries} open queries need reply`);
    }
    if (duePayments > 0) {
      attention.push(`${duePayments} milestone payment${duePayments > 1 ? 's' : ''} overdue`);
    }
    if (dprToday === 0) {
      attention.push('No DPR submitted today');
    }

    return {
      stats: {
        daysElapsed,
        totalDays,
        roomsCompleted: rooms.filter((r) => r.status === 'done').length,
        roomsTotal: rooms.length,
        workTypesActive,
        photosToday,
        openQueries,
      },
      attention,
    };
  }

  private applyAdminProjectPatch(
    project: LivebuildProject,
    dto: UpdateProjectDto & Record<string, unknown>,
  ) {
    if (dto.name != null) project.name = dto.name;
    if (dto.propertyType !== undefined) project.propertyType = dto.propertyType ?? null;
    if (dto.projectType !== undefined) project.projectType = dto.projectType ?? null;
    if (dto.siteManager !== undefined) project.siteManager = dto.siteManager ?? null;
    if (dto.address !== undefined) project.address = dto.address ?? null;
    if (dto.startDate !== undefined) project.startDate = dto.startDate ?? null;
    if (dto.dueDate !== undefined) project.dueDate = dto.dueDate ?? null;
    if (dto.phase !== undefined) project.phase = dto.phase ?? project.phase;
    if (dto.pctMethod != null) project.pctMethod = dto.pctMethod;
    if (dto.overallPct != null) project.overallPct = dto.overallPct;
    if (dto.pctOverride !== undefined) project.pctOverride = dto.pctOverride ?? null;
    if (dto.pctOverrideReason !== undefined) {
      project.pctOverrideReason = dto.pctOverrideReason ?? null;
    }
    if (dto.holdReason !== undefined) project.holdReason = dto.holdReason ?? null;
    if (dto.status != null) project.status = this.statusToDb(String(dto.status));
    const progressMethod = dto.progressMethod as string | undefined;
    if (progressMethod != null) project.pctMethod = progressMethod;
    if ('progressOverridePct' in dto) {
      project.pctOverride =
        dto.progressOverridePct === null || dto.progressOverridePct === ''
          ? null
          : Number(dto.progressOverridePct);
    }
    if ('progressOverrideReason' in dto) {
      project.pctOverrideReason = (dto.progressOverrideReason as string) || null;
    }
    if ('onHoldReason' in dto) {
      project.holdReason = (dto.onHoldReason as string) || null;
    }
  }

  async createProject(dto: CreateProjectDto) {
    const projectCode = await this.assignProjectCode();
    let customerMobile = dto.customerMobile ?? dto.customerPhone;
    let customerId = dto.customerId ?? null;

    if (customerId) {
      const customer = await this.customerRepo.findOne({ where: { id: customerId } });
      if (customer) customerMobile = customer.mobile;
    }

    if (!customerMobile) {
      throw new BadRequestException('customerMobile or customerId required');
    }
    customerMobile = normalizeLbMobile(customerMobile);

    const existingCustomer = await this.customerRepo.findOne({
      where: { mobile: customerMobile },
    });
    if (existingCustomer) {
      if (dto.customerFullName?.trim()) existingCustomer.name = dto.customerFullName.trim();
      if (dto.customerEmail !== undefined) existingCustomer.email = dto.customerEmail || null;
      if (dto.address !== undefined) existingCustomer.address = dto.address || null;
      if (dto.otpVerifiedToken) existingCustomer.otpVerified = true;
      await this.customerRepo.save(existingCustomer);
      customerId = existingCustomer.id;
    } else if (dto.customerFullName?.trim()) {
      const created = await this.customerRepo.save(
        this.customerRepo.create({
          name: dto.customerFullName.trim(),
          mobile: customerMobile,
          email: dto.customerEmail ?? null,
          address: dto.address ?? null,
          otpVerified: !!dto.otpVerifiedToken,
        }),
      );
      customerId = created.id;
    }

    const project = this.projectRepo.create({
      name: dto.name,
      propertyType: dto.propertyType ?? null,
      projectType: dto.projectType ?? null,
      siteManager: dto.siteManager ?? null,
      address: dto.address ?? null,
      startDate: dto.startDate ?? null,
      dueDate: dto.dueDate ?? null,
      status: dto.status ?? 'progress',
      phase: dto.phase ?? 'Design',
      pctMethod: dto.pctMethod ?? 'hybrid',
      overallPct: dto.overallPct ?? 0,
      pctOverride: dto.pctOverride ?? null,
      pctOverrideReason: dto.pctOverrideReason ?? null,
      holdReason: dto.holdReason ?? null,
      projectCode,
      customerMobile,
      customerId,
    });
    const saved = await this.projectRepo.save(project);
    const full = await this.projectRepo.findOne({
      where: { id: saved.id },
      relations: ['customer'],
    });
    const { stats, attention } = await this.buildProjectOverviewMeta(
      saved.id,
      full!,
    );
    return serializeProjectDetail(full!, 0, stats, attention);
  }

  async updateProject(id: number, dto: UpdateProjectDto) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    this.applyAdminProjectPatch(project, dto as UpdateProjectDto & Record<string, unknown>);
    const saved = await this.projectRepo.save(project);
    if (saved.pctMethod === 'hybrid' && saved.pctOverride == null) {
      await this.recalcHybridPct(id);
    }
    const full = await this.projectRepo.findOne({
      where: { id },
      relations: ['customer'],
    });
    const openQueries = await this.queryRepo.count({
      where: { projectId: id, status: 'open' },
    });
    const { stats, attention } = await this.buildProjectOverviewMeta(id, full!);
    return serializeProjectDetail(full!, openQueries, stats, attention);
  }

  async deleteProject(id: number, deletedBy?: string) {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const [roomCount, paymentCount, queryCount, materialCount] = await Promise.all([
      this.roomRepo.count({ where: { projectId: id } }),
      this.paymentRepo.count({ where: { projectId: id } }),
      this.queryRepo.count({ where: { projectId: id } }),
      this.materialRepo.count({ where: { projectId: id } }),
    ]);

    const emailPayload = {
      projectCode: project.projectCode,
      projectName: project.name,
      customerName: project.customer?.name ?? project.customerMobile ?? '—',
      customerEmail: project.customer?.email,
      customerMobile: project.customerMobile,
      siteManager: project.siteManager,
      address: project.address,
      propertyType: project.propertyType,
      projectType: project.projectType,
      status: project.status ?? 'progress',
      phase: project.phase,
      progressPct: this.getEffectivePct(project),
      progressMethod: project.pctMethod,
      startDate: project.startDate,
      dueDate: project.dueDate,
      roomCount,
      paymentCount,
      queryCount,
      materialCount,
      deletedBy: deletedBy ?? 'Admin',
    };

    const result = await this.projectRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Project not found');

    try {
      await this.mailerService.notifyLivebuildProjectDeleted(emailPayload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(
        `[LiveBuild] Project ${id} deleted but notification email failed: ${msg}`,
      );
    }

    return { deleted: true };
  }

  // —— Customers ——
  async listCustomers() {
    const customers = await this.customerRepo.find({ order: { id: 'ASC' } });
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const projectCount = await this.projectRepo.count({
          where: { customerId: c.id },
        });
        const active = await this.projectRepo.findOne({
          where: { customerId: c.id, status: 'progress' },
          order: { updatedAt: 'DESC' },
        });
        const openQueries = active
          ? await this.queryRepo.count({
              where: { projectId: active.id, status: 'open' },
            })
          : 0;
        return {
          ...serializeCustomer(c),
          projectCount,
          activeProjectId: active ? String(active.id) : null,
          activeProjectName: active?.name ?? null,
          overallProgressPct: active
            ? active.pctOverride ?? active.overallPct ?? 0
            : 0,
          openQueries,
        };
      }),
    );
    return enriched;
  }

  async getCustomer(id: number) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async createCustomer(dto: CreateCustomerDto & { fullName?: string; phone?: string }) {
    const mobile = normalizeLbMobile(dto.mobile ?? dto.phone ?? '');
    return serializeCustomer(
      await this.customerRepo.save(
        this.customerRepo.create({
          name: dto.name ?? dto.fullName ?? 'Customer',
          mobile,
          email: dto.email ?? null,
          address: dto.address ?? null,
          otpVerified: dto.otpVerified ?? false,
        }),
      ),
    );
  }

  async updateCustomer(id: number, dto: UpdateCustomerDto) {
    const customer = await this.getCustomer(id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  // —— Work types ——
  async listWorkTypes() {
    const rows = await this.workTypeRepo.find({
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    const counts = await this.roomWtRepo
      .createQueryBuilder('rwt')
      .select('rwt.work_type_id', 'workTypeId')
      .addSelect('COUNT(DISTINCT room.project_id)', 'cnt')
      .innerJoin('rwt.room', 'room')
      .groupBy('rwt.work_type_id')
      .getRawMany<{ workTypeId: string; cnt: string }>();
    const countMap = new Map(
      counts.map((c) => [Number(c.workTypeId), Number(c.cnt)]),
    );
    return rows.map((wt) => serializeWorkType(wt, countMap.get(wt.id) ?? 0));
  }

  async createWorkType(dto: CreateWorkTypeDto) {
    const saved = await this.workTypeRepo.save(this.workTypeRepo.create(dto));
    return serializeWorkType(saved);
  }

  async updateWorkType(id: number, dto: UpdateWorkTypeDto) {
    const wt = await this.workTypeRepo.findOne({ where: { id } });
    if (!wt) throw new NotFoundException('Work type not found');
    Object.assign(wt, dto);
    return serializeWorkType(await this.workTypeRepo.save(wt));
  }

  async deleteWorkType(id: number) {
    const result = await this.workTypeRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Work type not found');
    return { deleted: true };
  }

  // —— Rooms ——
  async listRooms(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const rooms = await this.roomRepo.find({
      where: { projectId },
      relations: ['roomWorkTypes', 'roomWorkTypes.workType'],
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    return ctx.isAdmin ? rooms.map(serializeRoom) : rooms;
  }

  async createRoom(projectId: number, dto: CreateRoomDto) {
    const dimensions =
      dto.dimensions ??
      (dto.lengthFt && dto.widthFt ? `${dto.lengthFt}×${dto.widthFt} ft` : null);
    const { workTypeIds, lengthFt, widthFt, ...rest } = dto;
    const room = await this.roomRepo.save(
      this.roomRepo.create({
        ...rest,
        dimensions,
        projectId,
      }),
    );
    if (workTypeIds?.length) {
      for (const workTypeId of workTypeIds) {
        await this.addRoomWorkType(room.id, workTypeId);
      }
    }
    await this.recalcHybridPct(projectId);
    const full = await this.roomRepo.findOne({
      where: { id: room.id },
      relations: ['roomWorkTypes', 'roomWorkTypes.workType'],
    });
    return serializeRoom(full!);
  }

  async updateRoom(id: number, dto: UpdateRoomDto) {
    const room = await this.roomRepo.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    if (dto.lengthFt && dto.widthFt) {
      dto.dimensions = `${dto.lengthFt}×${dto.widthFt} ft`;
    }
    Object.assign(room, dto);
    const saved = await this.roomRepo.save(room);
    await this.recalcHybridPct(saved.projectId);
    const full = await this.roomRepo.findOne({
      where: { id: saved.id },
      relations: ['roomWorkTypes', 'roomWorkTypes.workType'],
    });
    return serializeRoom(full!);
  }

  async deleteRoom(id: number, removedBy?: string) {
    const room = await this.roomRepo.findOne({
      where: { id },
      relations: ['roomWorkTypes', 'roomWorkTypes.workType', 'project', 'project.customer'],
    });
    if (!room) throw new NotFoundException('Room not found');

    const project = room.project;
    const customer = project?.customer;
    const workTypeNames =
      room.roomWorkTypes?.map((rwt) => rwt.workType?.name).filter(Boolean) as string[] ?? [];

    const emailPayload = project
      ? {
          projectCode: project.projectCode,
          projectName: project.name,
          customerName: customer?.name ?? 'Customer',
          customerEmail: customer?.email,
          siteManager: project.siteManager,
          projectAddress: project.address,
          roomName: room.name,
          roomType: room.roomType,
          dimensions: room.dimensions,
          progressPct: room.pct ?? 0,
          status: room.status ?? 'live',
          workTypeNames,
          removedBy: removedBy ?? 'Admin',
        }
      : null;

    const projectId = room.projectId;
    await this.roomRepo.delete(id);
    await this.recalcHybridPct(projectId);

    if (emailPayload) {
      try {
        await this.mailerService.notifyLivebuildRoomRemoved(emailPayload);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(
          `[LiveBuild] Room ${id} deleted but notification email failed: ${msg}`,
        );
      }
    }

    return { deleted: true };
  }

  // —— Room work types ——
  async listRoomWorkTypes(roomId: number, ctx: LbAccessContext) {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    await this.assertProjectAccess(room.projectId, ctx);
    return this.roomWtRepo.find({
      where: { roomId },
      relations: ['workType'],
      order: { id: 'ASC' },
    });
  }

  async addRoomWorkType(roomId: number, workTypeId: number) {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    const wt = await this.workTypeRepo.findOne({ where: { id: workTypeId } });
    if (!wt) throw new NotFoundException('Work type not found');
    const existing = await this.roomWtRepo.findOne({
      where: { roomId, workTypeId },
    });
    if (existing) {
      throw new BadRequestException('Work type is already assigned to this room');
    }
    const saved = await this.roomWtRepo.save(
      this.roomWtRepo.create({ roomId, workTypeId, pct: 0, status: 'not_started' }),
    );
    await this.recalcHybridPct(room.projectId);
    return saved;
  }

  async updateRoomWorkType(id: number, dto: UpdateRoomWorkTypeDto) {
    const rwt = await this.roomWtRepo.findOne({ where: { id }, relations: ['room'] });
    if (!rwt) throw new NotFoundException('Room work type not found');
    Object.assign(rwt, dto);
    const saved = await this.roomWtRepo.save(rwt);
    if (dto.pct != null) {
      await this.roomRepo.update(rwt.roomId, { pct: dto.pct });
      await this.recalcHybridPct(rwt.room.projectId);
    }
    return saved;
  }

  async deleteRoomWorkType(id: number) {
    const rwt = await this.roomWtRepo.findOne({
      where: { id },
      relations: ['room', 'workType'],
    });
    if (!rwt) throw new NotFoundException('Room work type not found');
    const projectId = rwt.room.projectId;
    const result = await this.roomWtRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Room work type not found');
    await this.recalcHybridPct(projectId);
    return { deleted: true };
  }

  // —— DPR ——
  private normalizeReportDate(input: string | Date): string {
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
    if (!Number.isNaN(parsed.getTime())) {
      return this.normalizeReportDate(parsed);
    }
    return s;
  }

  private async applyDprPctToRoomWorkType(
    roomId: number,
    workTypeId: number,
    projectId: number,
    pct: number,
  ) {
    await this.roomWtRepo
      .createQueryBuilder()
      .update()
      .set({ pct })
      .where('room_id = :roomId AND work_type_id = :workTypeId', {
        roomId,
        workTypeId,
      })
      .execute();
    await this.recalcHybridPct(projectId);
  }

  async buildDprContext(projectId: number, date: string, roomId: number) {
    const reportDate = this.normalizeReportDate(date);
    const room = await this.roomRepo.findOne({
      where: { id: roomId, projectId },
      relations: ['roomWorkTypes', 'roomWorkTypes.workType'],
    });
    if (!room) throw new NotFoundException('Room not found');
    const existing = await this.dprRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.photos', 'photos')
      .leftJoinAndSelect('d.workType', 'workType')
      .where('d.project_id = :projectId', { projectId })
      .andWhere('d.room_id = :roomId', { roomId })
      .andWhere('d.report_date = :reportDate', { reportDate })
      .getMany();
    return {
      date: reportDate,
      roomId: String(roomId),
      roomName: room.name,
      workTypes: (room.roomWorkTypes ?? []).map((rwt) => {
        const dpr = existing.find((d) => d.workTypeId === rwt.workTypeId);
        const photos = [...(dpr?.photos ?? [])].sort(
          (a, b) =>
            (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id,
        );
        return {
          roomWorkTypeId: String(rwt.id),
          workTypeId: String(rwt.workTypeId),
          workTypeName: rwt.workType?.name ?? 'Work type',
          dprId: dpr ? String(dpr.id) : undefined,
          previousPct: rwt.pct ?? 0,
          pct: dpr?.pctToday ?? null,
          doneToday: dpr?.doneToday ?? false,
          notes: dpr?.notes ?? '',
          photoCount: photos.length,
          photos: photos.map((p) => ({
            id: String(p.id),
            url: p.fileUrl,
            fileName: p.fileName ?? undefined,
          })),
        };
      }),
    };
  }

  async listDpr(
    projectId: number,
    ctx: LbAccessContext,
    date?: string,
    roomId?: number,
  ) {
    await this.assertProjectAccess(projectId, ctx);
    if (date && roomId) {
      return this.buildDprContext(projectId, date, roomId);
    }
    const qb = this.dprRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.photos', 'photos')
      .leftJoinAndSelect('d.workType', 'workType')
      .leftJoinAndSelect('d.room', 'room')
      .where('d.project_id = :projectId', { projectId })
      .orderBy('d.report_date', 'DESC')
      .addOrderBy('d.id', 'DESC');
    if (date) {
      qb.andWhere('d.report_date = :date', {
        date: this.normalizeReportDate(date),
      });
    }
    if (roomId) qb.andWhere('d.room_id = :roomId', { roomId });
    return qb.getMany();
  }

  async createDpr(projectId: number, dto: CreateDprDto) {
    await this.assertProjectAccess(projectId, { isAdmin: true });
    const reportDate = this.normalizeReportDate(dto.date);
    const dpr = await this.dprRepo.save(
      this.dprRepo.create({
        projectId,
        roomId: dto.roomId,
        workTypeId: dto.workTypeId,
        reportDate,
        pctToday: dto.pct ?? null,
        notes: dto.notes ?? null,
        doneToday: dto.doneToday ?? false,
        submittedBy: dto.submittedBy,
      }),
    );
    if (dto.pct != null && !Number.isNaN(dto.pct)) {
      await this.applyDprPctToRoomWorkType(
        dto.roomId,
        dto.workTypeId,
        projectId,
        dto.pct,
      );
    }
    return dpr;
  }

  async submitDprBatch(
    projectId: number,
    payload: { date: string; roomId: string; entries: string },
    files: { fieldname: string; buffer: Buffer; mimetype: string; size: number; originalname: string }[],
  ) {
    await this.assertProjectAccess(projectId, { isAdmin: true });
    let entries: {
      roomWorkTypeId: string;
      pct?: number | null;
      doneToday?: boolean;
      notes?: string;
    }[];
    try {
      entries = JSON.parse(payload.entries || '[]');
    } catch {
      throw new BadRequestException('Invalid DPR entries payload');
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new BadRequestException('At least one work type entry is required');
    }
    const reportDate = this.normalizeReportDate(payload.date);
    const roomId = Number(payload.roomId);
    if (!roomId || Number.isNaN(roomId)) {
      throw new BadRequestException('roomId is required');
    }

    for (const entry of entries) {
      const rwt = await this.roomWtRepo.findOne({
        where: { id: Number(entry.roomWorkTypeId) },
        relations: ['room'],
      });
      if (!rwt || rwt.room.projectId !== projectId) continue;

      const pct =
        entry.pct != null && !Number.isNaN(Number(entry.pct))
          ? Number(entry.pct)
          : null;

      let dpr = await this.dprRepo
        .createQueryBuilder('d')
        .where('d.project_id = :projectId', { projectId })
        .andWhere('d.room_id = :roomId', { roomId: rwt.roomId })
        .andWhere('d.work_type_id = :workTypeId', { workTypeId: rwt.workTypeId })
        .andWhere('d.report_date = :reportDate', { reportDate })
        .getOne();

      if (dpr) {
        if (pct != null) dpr.pctToday = pct;
        dpr.doneToday = entry.doneToday ?? false;
        if (entry.notes !== undefined) dpr.notes = entry.notes || null;
        dpr = await this.dprRepo.save(dpr);
        if (pct != null) {
          await this.applyDprPctToRoomWorkType(
            rwt.roomId,
            rwt.workTypeId,
            projectId,
            pct,
          );
        }
      } else {
        dpr = await this.createDpr(projectId, {
          roomId: rwt.roomId,
          workTypeId: rwt.workTypeId,
          date: reportDate,
          pct: pct ?? undefined,
          doneToday: entry.doneToday,
          notes: entry.notes,
          submittedBy: 'Admin',
        });
      }

      const photoFiles = files.filter((f) =>
        f.fieldname.startsWith(`photos_${entry.roomWorkTypeId}`),
      );
      if (photoFiles.length) {
        await this.uploadDprPhotos(dpr.id, photoFiles);
      }
    }
    return { ok: true, message: 'DPR submitted' };
  }

  async listDprPhotos(dprId: number, ctx: LbAccessContext) {
    const dpr = await this.dprRepo.findOne({ where: { id: dprId } });
    if (!dpr) throw new NotFoundException('DPR not found');
    await this.assertProjectAccess(dpr.projectId, ctx);
    return this.dprPhotoRepo.find({
      where: { dprId },
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
  }

  async uploadDprPhotos(
    dprId: number,
    files: { buffer: Buffer; mimetype: string; size: number; originalname: string }[],
  ) {
    const dpr = await this.dprRepo.findOne({
      where: { id: dprId },
      relations: ['workType'],
    });
    if (!dpr) throw new NotFoundException('DPR not found');

    const existing = await this.dprPhotoRepo.count({ where: { dprId } });
    if (existing + files.length > 10) {
      throw new BadRequestException('Maximum 10 photos per DPR work type entry');
    }

    const slug = this.slugify(dpr.workType?.name ?? 'work');
    const saved: LivebuildDprPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        throw new BadRequestException('DPR photos must be JPEG or PNG');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException('Each photo must be under 10MB');
      }
      const n = existing + i + 1;
      const key = this.s3Service.normalizeObjectKey(
        `livebuild/${dpr.projectId}/dpr/${dprId}/${slug}/photo-${n}.jpg`,
      );
      const { publicUrl } = await this.s3Service.uploadObject(
        key,
        file.buffer,
        file.mimetype,
      );
      saved.push(
        await this.dprPhotoRepo.save(
          this.dprPhotoRepo.create({
            dprId,
            fileUrl: publicUrl,
            fileName: file.originalname,
            fileSize: file.size,
            displayOrder: n,
          }),
        ),
      );
    }
    return saved;
  }

  async deleteDprPhoto(id: number) {
    const photo = await this.dprPhotoRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Photo not found');
    await this.s3Service.deleteFileByUrl(photo.fileUrl);
    await this.dprPhotoRepo.delete(id);
    return { deleted: true };
  }

  // —— Payments ——
  private formatPayment(payment: LivebuildPayment, isAdmin: boolean) {
    if (isAdmin) return payment;
    return {
      id: payment.id,
      projectId: payment.projectId,
      label: payment.label,
      pct: payment.pct,
      dueDate: payment.dueDate,
      status: payment.status,
      paidDate: payment.paidDate,
      displayOrder: payment.displayOrder,
      createdAt: payment.createdAt,
    };
  }

  async listPayments(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const payments = await this.paymentRepo.find({
      where: { projectId },
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    return ctx.isAdmin
      ? payments.map(serializePayment)
      : payments.map((p) => this.formatPayment(p, false));
  }

  async createPayment(projectId: number, dto: CreatePaymentDto) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(
        'Project not found. Re-open it from LiveBuild → All Projects.',
      );
    }

    const pct = Number(dto.pct ?? dto.pctOfTotal);
    if (Number.isNaN(pct)) {
      throw new BadRequestException('Payment percentage (pct) is required');
    }

    const saved = await this.paymentRepo.save(
      this.paymentRepo.create({
        projectId: project.id,
        label: dto.label.trim(),
        pct,
        dueDate: dto.dueDate?.trim() || null,
        status: dto.status ?? 'upcoming',
        paidDate: dto.paidDate?.trim() || null,
        displayOrder: dto.displayOrder ?? 0,
      }),
    );
    return serializePayment(saved);
  }

  async updatePayment(id: number, dto: UpdatePaymentDto) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');
    const patch = { ...dto } as UpdatePaymentDto & { pctOfTotal?: number };
    if (patch.pct == null && patch.pctOfTotal != null) {
      patch.pct = patch.pctOfTotal;
    }
    delete (patch as { pctOfTotal?: number }).pctOfTotal;
    Object.assign(payment, patch);
    return serializePayment(await this.paymentRepo.save(payment));
  }

  async deletePayment(id: number) {
    const result = await this.paymentRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Payment not found');
    return { deleted: true };
  }

  // —— Queries ——
  async listQueries(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const rows = await this.queryRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
      relations: ['room', 'project', 'project.customer'],
    });
    return ctx.isAdmin ? rows.map(serializeQuery) : rows;
  }

  async createQuery(projectId: number, dto: CreateQueryDto, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const count = await this.queryRepo.count({ where: { projectId } });
    const queryCode = `Q${String(count + 1).padStart(3, '0')}`;
    return this.queryRepo.save(
      this.queryRepo.create({
        projectId,
        roomId: dto.roomId,
        subject: dto.subject,
        message: dto.message,
        customerName: dto.customerName,
        queryCode,
        status: 'open',
      }),
    );
  }

  async replyQuery(id: number, dto: ReplyQueryDto) {
    const query = await this.queryRepo.findOne({
      where: { id },
      relations: ['room', 'project', 'project.customer'],
    });
    if (!query) throw new NotFoundException('Query not found');
    query.reply = dto.reply;
    query.repliedBy = dto.repliedBy ?? 'Admin';
    query.repliedAt = new Date();
    query.status = 'resolved';
    const saved = await this.queryRepo.save(query);
    return serializeQuery(saved);
  }

  async deleteQuery(id: number) {
    const result = await this.queryRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Query not found');
    return { deleted: true };
  }

  // —— Documents ——
  async listDocuments(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const rows = await this.documentRepo.find({
      where: { projectId },
      relations: ['room'],
      order: { createdAt: 'DESC' },
    });
    return ctx.isAdmin ? rows.map(serializeDocument) : rows;
  }

  async uploadDocument(
    projectId: number,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    meta: CreateDocumentMetaDto,
  ) {
    const allowed = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Documents must be PDF, JPEG, or PNG');
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException('Document must be under 20MB');
    }
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = this.s3Service.normalizeObjectKey(
      `livebuild/${projectId}/documents/${Date.now()}-${safeName}`,
    );
    const { publicUrl } = await this.s3Service.uploadObject(
      key,
      file.buffer,
      file.mimetype,
    );
    return this.documentRepo.save(
      this.documentRepo.create({
        projectId,
        name: meta.name,
        category: meta.category,
        roomId: meta.roomId,
        relatedWorkType: meta.relatedWorkType,
        expiryDate: meta.expiryDate,
        uploadedBy: meta.uploadedBy,
        fileUrl: publicUrl,
        fileName: file.originalname,
        fileSize: file.size,
      }),
    );
  }

  async deleteDocument(id: number) {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.s3Service.deleteFileByUrl(doc.fileUrl);
    await this.documentRepo.delete(id);
    return { deleted: true };
  }

  // —— Materials ——
  async listMaterials(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const rows = await this.materialRepo.find({
      where: { projectId },
      relations: ['room', 'workType'],
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    return ctx.isAdmin ? rows.map(serializeMaterial) : rows;
  }

  async createMaterial(projectId: number, dto: CreateMaterialDto) {
    const saved = await this.materialRepo.save(
      this.materialRepo.create({ ...dto, projectId }),
    );
    const full = await this.materialRepo.findOne({
      where: { id: saved.id },
      relations: ['room', 'workType'],
    });
    return serializeMaterial(full!);
  }

  async updateMaterial(id: number, dto: UpdateMaterialDto) {
    const material = await this.materialRepo.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');
    Object.assign(material, dto);
    const saved = await this.materialRepo.save(material);
    const full = await this.materialRepo.findOne({
      where: { id: saved.id },
      relations: ['room', 'workType'],
    });
    return serializeMaterial(full!);
  }

  async deleteMaterial(id: number) {
    const result = await this.materialRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Material not found');
    return { deleted: true };
  }

  // —— Property info ——
  async getPropertyInfo(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    return this.propertyRepo.findOne({ where: { projectId } });
  }

  async upsertPropertyInfo(projectId: number, dto: UpsertPropertyInfoDto) {
    let info = await this.propertyRepo.findOne({ where: { projectId } });
    if (!info) {
      info = this.propertyRepo.create({ projectId, ...dto });
    } else {
      Object.assign(info, dto);
    }
    return this.propertyRepo.save(info);
  }

  // —— Dashboard ——
  async getDashboard() {
    const [
      activeProjects,
      completedProjects,
      openQueries,
      pendingPayments,
      pendingMilestones,
      totalCustomers,
      recentDpr,
      recentQueries,
      openQueriesList,
    ] = await Promise.all([
      this.projectRepo.count({ where: { status: 'progress' } }),
      this.projectRepo.count({ where: { status: 'completed' } }),
      this.queryRepo.count({ where: { status: 'open' } }),
      this.paymentRepo.count({ where: { status: 'due' } }),
      this.paymentRepo.count({
        where: [{ status: 'due' }, { status: 'upcoming' }],
      }),
      this.customerRepo.count(),
      this.dprRepo.find({
        order: { createdAt: 'DESC' },
        take: 8,
        relations: ['project', 'room', 'workType'],
      }),
      this.queryRepo.find({
        where: { status: 'open' },
        order: { createdAt: 'DESC' },
        take: 8,
        relations: ['project'],
      }),
      this.queryRepo.find({
        where: { status: 'open' },
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['room', 'project', 'project.customer'],
      }),
    ]);

    const projects = await this.projectRepo.find({
      order: { updatedAt: 'DESC' },
      take: 10,
      relations: ['customer'],
    });

    const recentActivity = [
      ...recentDpr.map(activityFromDpr),
      ...recentQueries.map(activityFromQuery),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);

    return serializeDashboard({
      activeProjects,
      completedProjects,
      openQueries,
      pendingPayments,
      pendingMilestones,
      totalCustomers,
      projects,
      recentActivity,
      openQueriesList,
    });
  }
}
