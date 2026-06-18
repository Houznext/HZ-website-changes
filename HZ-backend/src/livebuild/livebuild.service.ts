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
  Livebuild3dModel,
  Livebuild3dHotspot,
  LivebuildAdminSettings,
  DEFAULT_LIVEBUILD_NOTIFICATION_PREFS,
  LivebuildNotificationPrefs,
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
  Create3dHotspotDto,
  Create3dModelMetaDto,
  ReplyQueryDto,
  UpdateCustomerDto,
  UpdateMaterialDto,
  UpdatePaymentDto,
  UpdateProjectDto,
  UpdateProjectCustomerMobileDto,
  UpdateRoomDto,
  UpdateRoomWorkTypeDto,
  UpdateWorkTypeDto,
  Update3dHotspotDto,
  Update3dModelDto,
  UpsertPropertyInfoDto,
  UpdateNotificationSettingsDto,
} from './dto';
import {
  mobilesMatch,
  mobileSuffix10,
  normalizeLbMobile,
} from './livebuild-mobile.util';
import { LivebuildRequest } from './livebuild-auth.guard';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/sendEmail.service';
import { CustomerIdentityService } from '../common/customer-identity/customer-identity.service';
import { LivebuildOtpService } from './livebuild-otp.service';
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
  serializePropertyInfo,
  serialize3dModel,
  serialize3dHotspot,
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
    @InjectRepository(Livebuild3dModel)
    private readonly model3dRepo: Repository<Livebuild3dModel>,
    @InjectRepository(Livebuild3dHotspot)
    private readonly hotspot3dRepo: Repository<Livebuild3dHotspot>,
    @InjectRepository(LivebuildAdminSettings)
    private readonly adminSettingsRepo: Repository<LivebuildAdminSettings>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly mailerService: MailerService,
    private readonly otpService: LivebuildOtpService,
    private readonly customerIdentity: CustomerIdentityService,
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

  async recalcRoomPctFromWorkTypes(roomId: number): Promise<void> {
    const result = await this.roomWtRepo
      .createQueryBuilder('rwt')
      .select('COALESCE(ROUND(AVG(rwt.pct)), 0)', 'avg')
      .where('rwt.room_id = :roomId', { roomId })
      .getRawOne<{ avg: string }>();
    const avg = Number(result?.avg ?? 0);
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) return;
    await this.roomRepo.update(roomId, { pct: avg });
    await this.recalcHybridPct(room.projectId);
  }

  private async rollupProjectPctFromRooms(projectId: number): Promise<void> {
    const result = await this.roomRepo
      .createQueryBuilder('r')
      .select('COALESCE(ROUND(AVG(r.pct)), 0)', 'avg')
      .where('r.project_id = :projectId', { projectId })
      .getRawOne<{ avg: string }>();
    await this.projectRepo.update(projectId, {
      overallPct: Number(result?.avg ?? 0),
    });
  }

  async recalcHybridPct(projectId: number): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project || project.pctMethod !== 'hybrid' || project.pctOverride != null) return;
    await this.rollupProjectPctFromRooms(projectId);
  }

  async recalcItemsPct(projectId: number): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project || project.pctMethod !== 'items' || project.pctOverride != null) return;

    const rooms = await this.roomRepo.find({ where: { projectId } });
    for (const room of rooms) {
      const total = await this.materialRepo.count({
        where: { projectId, roomId: room.id },
      });
      const installed = await this.materialRepo.count({
        where: { projectId, roomId: room.id, status: 'installed' },
      });
      const pct = total === 0 ? 0 : Math.round((installed / total) * 100);
      await this.roomRepo.update(room.id, { pct });
    }

    await this.rollupProjectPctFromRooms(projectId);
  }

  private async rollupProjectPctIfAuto(projectId: number): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project || project.pctOverride != null) return;
    if (project.pctMethod === 'hybrid' || project.pctMethod === 'items') {
      await this.rollupProjectPctFromRooms(projectId);
    }
  }

  private async recalcProjectPctIfAuto(projectId: number): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project || project.pctOverride != null) return;
    if (project.pctMethod === 'hybrid') {
      await this.recalcHybridPct(projectId);
    } else if (project.pctMethod === 'items') {
      await this.recalcItemsPct(projectId);
    }
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
        dto.progressOverridePct != null ? Number(dto.progressOverridePct) : null;
      if (project.pctMethod === 'manual' && project.pctOverride != null) {
        project.overallPct = project.pctOverride;
      }
    }
    if ('progressOverrideReason' in dto) {
      project.pctOverrideReason = (dto.progressOverrideReason as string) || null;
    }
    if ('onHoldReason' in dto) {
      project.holdReason = (dto.onHoldReason as string) || null;
    }
    if (dto.coverImageUrl !== undefined) {
      project.coverImageUrl = dto.coverImageUrl ?? null;
    }
    if (dto.panoramaUrl !== undefined) {
      project.panoramaUrl = dto.panoramaUrl ?? null;
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

    let existingCustomer = await this.customerIdentity.findLivebuildByMobile(
      customerMobile,
    );
    let lbCustomer: LivebuildCustomer | null = existingCustomer;
    if (existingCustomer) {
      if (dto.customerFullName?.trim()) existingCustomer.name = dto.customerFullName.trim();
      if (dto.customerEmail !== undefined) existingCustomer.email = dto.customerEmail || null;
      if (dto.address !== undefined) existingCustomer.address = dto.address || null;
      if (dto.otpVerifiedToken) existingCustomer.otpVerified = true;
      lbCustomer = await this.customerRepo.save(existingCustomer);
      customerId = lbCustomer.id;
      await this.customerIdentity.syncPortalFromLivebuild(lbCustomer);
    } else if (dto.customerFullName?.trim()) {
      lbCustomer = await this.customerRepo.save(
        this.customerRepo.create({
          name: dto.customerFullName.trim(),
          mobile: customerMobile,
          email: dto.customerEmail ?? null,
          address: dto.address ?? null,
          otpVerified: !!dto.otpVerifiedToken,
        }),
      );
      customerId = lbCustomer.id;
      await this.customerIdentity.syncPortalFromLivebuild(lbCustomer);
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
    await this.customerIdentity.syncPortalCustomer({
      mobile: customerMobile,
      fullName: dto.customerFullName?.trim() || lbCustomer?.name || null,
      email: dto.customerEmail ?? lbCustomer?.email ?? null,
      otpVerified: Boolean(dto.otpVerifiedToken || lbCustomer?.otpVerified),
    });
    const portal = await this.customerIdentity.findPortalByMobile(customerMobile);
    if (portal) {
      try {
        await this.customerIdentity.ensureStoreUserForPortalCustomer(portal.id);
      } catch {
        // mobile may be missing until customer completes profile
      }
    }
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
    const patch = dto as UpdateProjectDto & Record<string, unknown>;
    if (
      patch.customerMobile !== undefined ||
      patch.customerPhone !== undefined ||
      patch.otpVerifiedToken !== undefined
    ) {
      throw new BadRequestException(
        'Use PATCH /livebuild/projects/:id/customer-mobile to update customer mobile',
      );
    }
    this.applyAdminProjectPatch(project, patch);
    if (patch.customerId !== undefined) {
      const raw = patch.customerId;
      if (raw === null || raw === undefined) {
        project.customerId = null;
      } else {
        const cid = Number(raw);
        if (!Number.isFinite(cid)) {
          throw new BadRequestException('Invalid customerId');
        }
        const customer = await this.customerRepo.findOne({ where: { id: cid } });
        if (!customer) throw new NotFoundException('Customer not found');
        project.customerId = cid;
        project.customerMobile = customer.mobile;
      }
    }
    const saved = await this.projectRepo.save(project);
    await this.recalcProjectPctIfAuto(id);
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

  async updateProjectCustomerMobile(
    id: number,
    dto: UpdateProjectCustomerMobileDto,
  ) {
    if (!dto.otpVerifiedToken?.trim()) {
      throw new BadRequestException('OTP verification is required');
    }

    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!project) throw new NotFoundException('Project not found');

    const raw =
      dto.customerMobile ?? dto.phone ?? dto.mobile ?? '';
    if (!String(raw).trim()) {
      if (project.customerMobile?.trim()) {
        throw new BadRequestException(
          'Customer mobile cannot be removed. Verify a new number with OTP to change it.',
        );
      }
      throw new BadRequestException('Mobile number is required');
    }

    const newMobile = normalizeLbMobile(String(raw));
    this.otpService.assertOtpVerifiedToken(dto.otpVerifiedToken, newMobile);

    if (
      project.customerMobile?.trim() &&
      mobilesMatch(project.customerMobile, newMobile)
    ) {
      const openQueries = await this.queryRepo.count({
        where: { projectId: id, status: 'open' },
      });
      const { stats, attention } = await this.buildProjectOverviewMeta(
        id,
        project,
      );
      return serializeProjectDetail(
        project,
        openQueries,
        stats,
        attention,
      );
    }

    const previousMobile = project.customerMobile;
    project.customerMobile = newMobile;

    const existingCustomer = await this.customerIdentity.findLivebuildByMobile(
      newMobile,
    );
    if (existingCustomer) {
      existingCustomer.otpVerified = true;
      await this.customerRepo.save(existingCustomer);
      project.customerId = existingCustomer.id;
      await this.customerIdentity.syncPortalFromLivebuild(existingCustomer);
    } else if (project.customerId) {
      const linked = await this.customerRepo.findOne({
        where: { id: project.customerId },
      });
      if (
        linked &&
        (!previousMobile || mobilesMatch(linked.mobile, previousMobile))
      ) {
        linked.mobile = newMobile;
        linked.otpVerified = true;
        const savedLinked = await this.customerRepo.save(linked);
        await this.customerIdentity.syncPortalFromLivebuild(savedLinked);
      }
    } else {
      await this.customerIdentity.syncPortalCustomer({
        mobile: newMobile,
        otpVerified: true,
        fullName: project.customer?.name ?? null,
        email: project.customer?.email ?? null,
      });
    }

    await this.projectRepo.save(project);

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
    const saved = await this.customerRepo.save(
      this.customerRepo.create({
        name: dto.name ?? dto.fullName ?? 'Customer',
        mobile,
        email: dto.email ?? null,
        address: dto.address ?? null,
        otpVerified: dto.otpVerified ?? false,
      }),
    );
    const synced = await this.customerIdentity.afterLivebuildCustomerSaved(saved);
    return serializeCustomer(synced);
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
    const { workTypeIds, ...patch } = dto;
    if (patch.lengthFt != null && patch.widthFt != null) {
      patch.dimensions =
        patch.dimensions ?? `${patch.lengthFt}×${patch.widthFt} ft`;
      if (patch.areaSqft == null) {
        patch.areaSqft = Math.round(Number(patch.lengthFt) * Number(patch.widthFt));
      }
    }
    const room = await this.roomRepo.save(
      this.roomRepo.create({
        ...patch,
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
    const { workTypeIds, ...patch } = dto;
    if (patch.lengthFt != null && patch.widthFt != null) {
      patch.dimensions = `${patch.lengthFt}×${patch.widthFt} ft`;
      if (patch.areaSqft == null) {
        patch.areaSqft = Math.round(Number(patch.lengthFt) * Number(patch.widthFt));
      }
    }
    if (patch.pct != null) room.pct = Number(patch.pct);
    Object.assign(room, patch);
    const saved = await this.roomRepo.save(room);
    await this.rollupProjectPctIfAuto(saved.projectId);
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
    await this.recalcRoomPctFromWorkTypes(roomId);
    return saved;
  }

  async updateRoomWorkType(id: number, dto: UpdateRoomWorkTypeDto) {
    const rwt = await this.roomWtRepo.findOne({ where: { id }, relations: ['room'] });
    if (!rwt) throw new NotFoundException('Room work type not found');
    Object.assign(rwt, dto);
    const saved = await this.roomWtRepo.save(rwt);
    if (dto.pct != null) {
      await this.recalcRoomPctFromWorkTypes(rwt.roomId);
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
    await this.recalcRoomPctFromWorkTypes(rwt.roomId);
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
    await this.recalcRoomPctFromWorkTypes(roomId);
  }

  async listSettingsTeam() {
    const projects = await this.projectRepo.find({
      select: ['id', 'projectCode', 'siteManager'],
      order: { id: 'ASC' },
    });
    const byManager = new Map<
      string,
      { name: string; role: string; projectCodes: string[] }
    >();
    for (const p of projects) {
      const name = p.siteManager?.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = byManager.get(key);
      if (existing) {
        existing.projectCodes.push(p.projectCode);
      } else {
        byManager.set(key, {
          name,
          role: 'Site Manager',
          projectCodes: [p.projectCode],
        });
      }
    }
    return Array.from(byManager.values()).map((m, i) => ({
      id: String(i + 1),
      name: m.name,
      role:
        m.projectCodes.length > 1
          ? `${m.role} · ${m.projectCodes.length} projects`
          : `${m.role} · ${m.projectCodes[0]}`,
      initials: m.name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    }));
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

    if (patch.paidDate !== undefined) {
      patch.paidDate = patch.paidDate?.trim() ? patch.paidDate.trim() : null;
      if (patch.paidDate && patch.status == null && payment.status !== 'paid') {
        patch.status = 'paid';
      }
      if (!patch.paidDate && patch.status == null && payment.status === 'paid') {
        patch.status = 'upcoming';
      }
    }

    if (patch.status === 'paid') {
      const nextPaid =
        patch.paidDate !== undefined ? patch.paidDate : payment.paidDate;
      if (!nextPaid) {
        patch.paidDate = new Date().toISOString().slice(0, 10);
      }
    }

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
    let relatedWorkType = meta.relatedWorkType ?? null;
    if (!relatedWorkType && meta.workTypeId != null && meta.workTypeId !== '') {
      const wt = await this.workTypeRepo.findOne({
        where: { id: Number(meta.workTypeId) },
      });
      relatedWorkType = wt?.name ?? null;
    }
    const roomId =
      meta.roomId != null && meta.roomId !== ''
        ? Number(meta.roomId)
        : undefined;
    return this.documentRepo.save(
      this.documentRepo.create({
        projectId,
        name: meta.name,
        category: meta.category,
        roomId: Number.isFinite(roomId) ? roomId : undefined,
        relatedWorkType,
        expiryDate: meta.expiryDate || null,
        uploadedBy: meta.uploadedBy,
        fileUrl: publicUrl,
        fileName: file.originalname,
        fileSize: file.size,
      }),
    );
  }

  async uploadProjectCover(
    projectId: number,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
  ) {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Cover must be JPEG, PNG, or WebP');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Cover image must be under 10MB');
    }
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = this.s3Service.normalizeObjectKey(
      `livebuild/${projectId}/cover/${Date.now()}-${safeName}`,
    );
    const { publicUrl } = await this.s3Service.uploadObject(
      key,
      file.buffer,
      file.mimetype,
    );
    if (project.coverImageUrl) {
      await this.s3Service.deleteFileByUrl(project.coverImageUrl).catch(() => undefined);
    }
    project.coverImageUrl = publicUrl;
    await this.projectRepo.save(project);
    return { coverImageUrl: publicUrl };
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
    const status =
      !dto.status || dto.status === 'not_started' || dto.status === 'pending'
        ? 'started'
        : dto.status;
    const saved = await this.materialRepo.save(
      this.materialRepo.create({ ...dto, projectId, status }),
    );
    await this.recalcItemsPct(projectId);
    const full = await this.materialRepo.findOne({
      where: { id: saved.id },
      relations: ['room', 'workType'],
    });
    return serializeMaterial(full!);
  }

  async updateMaterial(id: number, dto: UpdateMaterialDto) {
    const material = await this.materialRepo.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');
    const patch = { ...dto } as UpdateMaterialDto;
    if (patch.status != null) {
      patch.status =
        patch.status === 'not_started' || patch.status === 'pending'
          ? 'started'
          : patch.status;
    }
    Object.assign(material, patch);
    const saved = await this.materialRepo.save(material);
    await this.recalcItemsPct(material.projectId);
    const full = await this.materialRepo.findOne({
      where: { id: saved.id },
      relations: ['room', 'workType'],
    });
    return serializeMaterial(full!);
  }

  async deleteMaterial(id: number) {
    const material = await this.materialRepo.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material not found');
    const projectId = material.projectId;
    await this.materialRepo.delete(id);
    await this.recalcItemsPct(projectId);
    return { deleted: true };
  }

  // —— Property info ——
  async getPropertyInfo(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const info = await this.propertyRepo.findOne({ where: { projectId } });
    return info ? serializePropertyInfo(info) : null;
  }

  async upsertPropertyInfo(projectId: number, dto: UpsertPropertyInfoDto) {
    let info = await this.propertyRepo.findOne({ where: { projectId } });
    if (!info) {
      info = this.propertyRepo.create({ projectId, ...dto });
    } else {
      Object.assign(info, dto);
    }
    const saved = await this.propertyRepo.save(info);
    return serializePropertyInfo(saved);
  }

  private parseOptionalNum(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private parseBool(v: unknown): boolean {
    if (typeof v === 'boolean') return v;
    if (v === 'true' || v === '1' || v === 1) return true;
    return false;
  }

  async list3dModels(projectId: number, ctx: LbAccessContext) {
    await this.assertProjectAccess(projectId, ctx);
    const rows = await this.model3dRepo.find({
      where: { projectId },
      relations: ['room', 'hotspots', 'hotspots.room'],
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    return rows.map((m) => serialize3dModel(m, true));
  }

  async upload3dModel(
    projectId: number,
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    meta: Create3dModelMetaDto,
  ) {
    await this.assertProjectAccess(projectId, { isAdmin: true });
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    if (!['glb', 'gltf'].includes(ext)) {
      throw new BadRequestException('3D models must be GLB or GLTF format');
    }
    if (file.size > 150 * 1024 * 1024) {
      throw new BadRequestException('3D model must be under 150MB');
    }
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = this.s3Service.normalizeObjectKey(
      `livebuild/${projectId}/3d/${Date.now()}-${safeName}`,
    );
    const mime =
      ext === 'gltf' ? 'model/gltf+json' : 'model/gltf-binary';
    const { publicUrl } = await this.s3Service.uploadObject(
      key,
      file.buffer,
      mime,
    );

    const existingCount = await this.model3dRepo.count({ where: { projectId } });
    const isPrimary = this.parseBool(meta.isPrimary) || existingCount === 0;
    if (isPrimary) {
      await this.model3dRepo.update({ projectId }, { isPrimary: false });
    }

    const roomId = this.parseOptionalNum(meta.roomId);
    const saved = await this.model3dRepo.save(
      this.model3dRepo.create({
        projectId,
        label: meta.label.trim(),
        modelType: meta.modelType ?? 'full_home',
        floorNumber: this.parseOptionalNum(meta.floorNumber),
        roomId: roomId ?? undefined,
        fileUrl: publicUrl,
        fileName: file.originalname,
        fileSizeBytes: file.size,
        fileFormat: ext,
        isPrimary,
        cameraPosX: this.parseOptionalNum(meta.cameraPosX),
        cameraPosY: this.parseOptionalNum(meta.cameraPosY),
        cameraPosZ: this.parseOptionalNum(meta.cameraPosZ),
        cameraTargetX: this.parseOptionalNum(meta.cameraTargetX),
        cameraTargetY: this.parseOptionalNum(meta.cameraTargetY),
        cameraTargetZ: this.parseOptionalNum(meta.cameraTargetZ),
      }),
    );

    const full = await this.model3dRepo.findOne({
      where: { id: saved.id },
      relations: ['room', 'hotspots', 'hotspots.room'],
    });
    return serialize3dModel(full!, true);
  }

  async update3dModel(id: number, dto: Update3dModelDto) {
    const model = await this.model3dRepo.findOne({ where: { id } });
    if (!model) throw new NotFoundException('3D model not found');
    if (dto.isPrimary === true) {
      await this.model3dRepo.update(
        { projectId: model.projectId },
        { isPrimary: false },
      );
    }
    Object.assign(model, dto);
    const saved = await this.model3dRepo.save(model);
    const full = await this.model3dRepo.findOne({
      where: { id: saved.id },
      relations: ['room', 'hotspots', 'hotspots.room'],
    });
    return serialize3dModel(full!, true);
  }

  async delete3dModel(id: number) {
    const model = await this.model3dRepo.findOne({ where: { id } });
    if (!model) throw new NotFoundException('3D model not found');
    await this.s3Service.deleteFileByUrl(model.fileUrl).catch(() => undefined);
    await this.model3dRepo.delete(id);
    return { deleted: true };
  }

  async create3dHotspot(modelId: number, dto: Create3dHotspotDto) {
    const model = await this.model3dRepo.findOne({ where: { id: modelId } });
    if (!model) throw new NotFoundException('3D model not found');
    const saved = await this.hotspot3dRepo.save(
      this.hotspot3dRepo.create({
        modelId,
        label: dto.label,
        roomId: dto.roomId ?? null,
        positionX: dto.positionX ?? 0,
        positionY: dto.positionY ?? 0,
        positionZ: dto.positionZ ?? 0,
        cameraPosX: dto.cameraPosX ?? null,
        cameraPosY: dto.cameraPosY ?? null,
        cameraPosZ: dto.cameraPosZ ?? null,
        cameraTargetX: dto.cameraTargetX ?? null,
        cameraTargetY: dto.cameraTargetY ?? null,
        cameraTargetZ: dto.cameraTargetZ ?? null,
        displayOrder: dto.displayOrder ?? 0,
      }),
    );
    const full = await this.hotspot3dRepo.findOne({
      where: { id: saved.id },
      relations: ['room'],
    });
    return serialize3dHotspot(full!);
  }

  async update3dHotspot(id: number, dto: Update3dHotspotDto) {
    const hotspot = await this.hotspot3dRepo.findOne({ where: { id } });
    if (!hotspot) throw new NotFoundException('Hotspot not found');
    Object.assign(hotspot, dto);
    const saved = await this.hotspot3dRepo.save(hotspot);
    const full = await this.hotspot3dRepo.findOne({
      where: { id: saved.id },
      relations: ['room'],
    });
    return serialize3dHotspot(full!);
  }

  async delete3dHotspot(id: number) {
    const result = await this.hotspot3dRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Hotspot not found');
    return { deleted: true };
  }

  async seed3dHotspotsFromRooms(modelId: number) {
    const model = await this.model3dRepo.findOne({ where: { id: modelId } });
    if (!model) throw new NotFoundException('3D model not found');
    const rooms = await this.roomRepo.find({
      where: { projectId: model.projectId },
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    const existing = await this.hotspot3dRepo.find({ where: { modelId } });
    const existingRoomIds = new Set(
      existing.map((h) => h.roomId).filter(Boolean) as number[],
    );
    const cols = Math.ceil(Math.sqrt(Math.max(rooms.length, 1)));
    let idx = existing.length;
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      if (existingRoomIds.has(room.id)) continue;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = (col - (cols - 1) / 2) * 2.5;
      const z = (row - (Math.ceil(rooms.length / cols) - 1) / 2) * 2.5;
      await this.hotspot3dRepo.save(
        this.hotspot3dRepo.create({
          modelId,
          roomId: room.id,
          label: room.name,
          positionX: x,
          positionY: 1.2,
          positionZ: z,
          cameraPosX: x,
          cameraPosY: 2.5,
          cameraPosZ: z + 3,
          cameraTargetX: x,
          cameraTargetY: 1,
          cameraTargetZ: z,
          displayOrder: idx++,
        }),
      );
    }
    const full = await this.model3dRepo.findOne({
      where: { id: modelId },
      relations: ['room', 'hotspots', 'hotspots.room'],
    });
    return serialize3dModel(full!, true);
  }

  async get3dVizPayload(projectId: number) {
    const models = await this.model3dRepo.find({
      where: { projectId },
      relations: ['room', 'hotspots', 'hotspots.room'],
      order: { displayOrder: 'ASC', id: 'ASC' },
    });
    const serialized = models.map((m) => serialize3dModel(m, true));
    const primary =
      serialized.find((m) => m.isPrimary) ?? serialized[0] ?? null;
    return { models: serialized, primaryModel: primary };
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

  async getNotificationSettings(): Promise<LivebuildNotificationPrefs> {
    let row = await this.adminSettingsRepo.findOne({ where: { id: 1 } });
    if (!row) {
      row = this.adminSettingsRepo.create({
        id: 1,
        notifications: { ...DEFAULT_LIVEBUILD_NOTIFICATION_PREFS },
      });
      row = await this.adminSettingsRepo.save(row);
    }
    return { ...DEFAULT_LIVEBUILD_NOTIFICATION_PREFS, ...row.notifications };
  }

  async updateNotificationSettings(
    dto: UpdateNotificationSettingsDto,
  ): Promise<LivebuildNotificationPrefs> {
    const current = await this.getNotificationSettings();
    const next: LivebuildNotificationPrefs = {
      dpr: dto.dpr ?? current.dpr,
      query: dto.query ?? current.query,
      payment: dto.payment ?? current.payment,
      hold: dto.hold ?? current.hold,
      doc: dto.doc ?? current.doc,
    };
    await this.adminSettingsRepo.save({ id: 1, notifications: next });
    return next;
  }
}
