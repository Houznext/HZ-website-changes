import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/user/enum/user.enum';
import {
  Between,
  Brackets,
  FindOptionsWhere,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { CRMLead } from './entities/crm.entity';
import { LeadStatusLog } from './entities/leadStatus.entity';
import { User } from 'src/user/entities/user.entity';

import {
  CreateCrmLeadDto,
  UpdateCrmLeadDto,
  UpdateCrmLeadstatusDto,
  QueryCrmLeadDto,
  ReturnCrmLeadDto,
  FindLeadsDto,
} from './dto/crm.dto';
import { LeadStatus } from './enums/crm.enum';

import { MailerService } from 'src/sendEmail.service';
import { NotificationService } from 'src/notifications/notification.service';
import { USER_NOTIFICATION_TEMPLATE } from '../emailTemplates';
import { RequestUser } from 'src/guard';
import { WhatsAppMsgService } from 'src/whatsApp.service';
import { SmsService } from 'src/sms.service';
import { BulkMessageChannel } from './dto/crm.dto';

@Injectable()
export class CrmLeadService {
  constructor(
    @InjectRepository(CRMLead)
    private readonly crmRepo: Repository<CRMLead>,
    @InjectRepository(LeadStatusLog)
    private readonly logRepo: Repository<LeadStatusLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
    private readonly mailerService: MailerService,
    private readonly whatsAppService: WhatsAppMsgService,
    private readonly smsService: SmsService,
  ) {}

  

  private getRoleContext(
    currentUser: RequestUser,
    branchIdOverride?: string,
  ): {
    isSuperAdmin: boolean;
    isBranchHead: boolean;
    effectiveBranchId?: string;
  } {
    const isSuperAdmin = currentUser.role === UserRole.ADMIN;
    const isBranchHead = currentUser.branchMembership?.isBranchHead ?? false;

    if (isSuperAdmin && isBranchHead) {
     
      return {
        isSuperAdmin,
        isBranchHead,
        effectiveBranchId: branchIdOverride, 
      };
    }

    const effectiveBranchId =
      branchIdOverride ??
      currentUser.branchMembership?.branchId ??
      currentUser.activeBranchId;

    if (!effectiveBranchId) {
      throw new BadRequestException('No branch context for current user.');
    }

    return { isSuperAdmin, isBranchHead, effectiveBranchId };
  }

  private ensureBranchMatch(lead: CRMLead, branchId: string) {
    if (!lead || lead.branchId !== branchId) {
      throw new NotFoundException('Lead not found in your active branch.');
    }
  }

  private async appendStatusLog(
    leadId: string,
    status: LeadStatus,
    branchId: string,
    opts?: { at?: Date; changedById?: string; changeReason?: string },
  ) {
    const payload: Partial<LeadStatusLog> = {
      lead: { id: leadId } as any,
      status,
      branchId,
      branch: { id: branchId } as any,
    };

    if (opts?.at) (payload as any).changedAt = opts.at;
    if (opts?.changedById)
      (payload as any).changedBy = { id: opts.changedById } as any;
    if (opts?.changeReason) (payload as any).changeReason = opts.changeReason;

    return this.logRepo.save(payload);
  }

  private toReturnDto(lead: CRMLead): ReturnCrmLeadDto {
    return {
      id: lead.id,
      Fullname: lead.Fullname,
      Phonenumber: lead.Phonenumber,
      email: lead.email,
      platform: lead.platform as any,
      serviceType: lead.serviceType as any,
      propertytype: lead.propertytype,
      paintingPackage: lead.paintingPackage as any,
      paintingType: lead.paintingType as any,
      bhk: lead.bhk,
      review: lead.review,
      city: lead.city,
      state: lead.state,
      package: lead.package,
      leadstatus: lead.leadstatus,
      rooms: lead.rooms as any,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      phase: lead.phase,
      visitDoneAt: lead.visitDoneAt,
      followUpDate: lead.followUpDate,
      visitScheduledAt: lead.visitScheduledAt,
      areaName: lead.areaName,
      houseNo: lead.houseNo,
      apartmentName: lead.apartmentName,
      paintArea: lead.paintArea,
      branchId: lead.branchId,
      assignedTo: lead.assignedTo ? lead.assignedTo.fullName : null,
      assignedBy: lead.assignedBy ? lead.assignedBy.fullName : null,
      rejectionReason: lead.rejectionReason ?? null,
      isFuturePotential: lead.isFuturePotential ?? false,
      createdBy: lead.createdBy ? (lead.createdBy as any).fullName : null,
    };
  }

  private applyQueryFilters(
    qb: SelectQueryBuilder<CRMLead>,
    q: QueryCrmLeadDto & { branchId: string },
  ) {
    if (q.branchId) {
      qb.andWhere('crm.branchId = :branchId', { branchId: q.branchId });
    }

    if (q.status) {
      qb.andWhere('crm.leadstatus = :status', { status: q.status });
    }

    if (q.assignedToId) {
      qb.andWhere('assignedTo.id = :assignedToId', {
        assignedToId: q.assignedToId,
      });
    }

    if (q.search) {
      const like = `%${q.search.trim()}%`;
      qb.andWhere(
        new Brackets((b) =>
          b
            .where('crm."Fullname" ILIKE :like', { like })
            .orWhere('crm."Phonenumber" ILIKE :like', { like })
            .orWhere('crm.email ILIKE :like', { like })
            .orWhere('crm.city ILIKE :like', { like }),
        ),
      );
    }

    if (q.startDate && q.endDate) {
      const start = new Date(q.startDate);
      const end = new Date(q.endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException(
          'Invalid date format in filters. Use ISO string.',
        );
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('crm.createdAt BETWEEN :start AND :end', { start, end });
    }

    return qb;
  }

 

  
  async createFromUser(
    currentUser: RequestUser,
    dto: CreateCrmLeadDto,
  ): Promise<CRMLead> {
    const { effectiveBranchId } = this.getRoleContext(
      currentUser,
      dto.branchId,
    );

    const payload: CreateCrmLeadDto = {
      ...dto,
      branchId: effectiveBranchId,
      createdById: currentUser.id,
    };

    return this.create(payload);
  }

  // bulk create using currentUser
  async createMoreFromUser(
    currentUser: RequestUser,
    body: { leads: CreateCrmLeadDto[]; branchId: string; createdById?: string },
  ): Promise<CRMLead[]> {
    const { leads, branchId } = body;

    if (!leads || !Array.isArray(leads) || !leads.length) {
      throw new BadRequestException(
        'Request body must contain a non-empty "leads" array.',
      );
    }

    const { effectiveBranchId } = this.getRoleContext(currentUser, branchId);

    const enriched: CreateCrmLeadDto[] = leads
      .filter((lead) => lead.Fullname?.trim())
      .map((lead) => ({
        ...lead,
        branchId: lead.branchId ?? effectiveBranchId,
        createdById: currentUser.id,
      }));

    if (!enriched.length) {
      throw new BadRequestException('No valid leads provided.');
    }

    return this.createMoreleads(enriched);
  }

  // your original create logic reused by both
  async create(dto: CreateCrmLeadDto): Promise<CRMLead> {
    if (!dto.branchId) {
      throw new BadRequestException('branchId is required.');
    }

    const where: FindOptionsWhere<CRMLead>[] = [
      {
        Fullname: dto.Fullname,
        Phonenumber: dto.Phonenumber,
        branchId: dto.branchId,
      },
    ];
    if (dto.email) {
      where.push({
        Fullname: dto.Fullname,
        Phonenumber: dto.Phonenumber,
        email: dto.email,
        branchId: dto.branchId,
      } as any);
    }

    const existing = await this.crmRepo.findOne({ where });
    if (existing) {
      throw new ConflictException(
        'A lead with the provided details already exists in this branch.',
      );
    }

    const lead = this.crmRepo.create({
      ...dto,
      branch: { id: dto.branchId } as any,
      createdBy: dto.createdById
        ? ({ id: dto.createdById } as any)
        : undefined,
      assignedTo: dto.assignedToId
        ? ({ id: dto.assignedToId } as any)
        : undefined,
      isFuturePotential: dto.isFuturePotential ?? false,
    });

    const created = await this.crmRepo.save(lead);

    await this.appendStatusLog(
      created.id,
      created.leadstatus ?? LeadStatus.New,
      created.branchId,
      { at: created.createdAt, changedById: dto.createdById },
    );

    const formattedDate = created.createdAt.toLocaleString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (created.assignedTo) {
      await this.notificationService.createNotification({
        userId: created.assignedTo.id,
        message: `New lead "${created.Fullname}" assigned on ${formattedDate}.`,
      });
      await this.mailerService.sendUserNotification(
        created.assignedTo,
        'New Lead Assigned',
        USER_NOTIFICATION_TEMPLATE,
      );
    }

    await this.mailerService.notifyAdminsAboutLead(created);

    return created;
  }

  async createMoreleads(dtos: CreateCrmLeadDto[]): Promise<CRMLead[]> {
    const toCreate: CRMLead[] = [];

    for (const dto of dtos) {
      if (!dto.branchId)
        throw new BadRequestException('Each lead needs a branchId.');

      const where: FindOptionsWhere<CRMLead>[] = [
        {
          Fullname: dto.Fullname,
          Phonenumber: dto.Phonenumber,
          branchId: dto.branchId,
        },
      ];
      if (dto.email) {
        where.push({
          Fullname: dto.Fullname,
          Phonenumber: dto.Phonenumber,
          email: dto.email,
          branchId: dto.branchId,
        } as any);
      }

      const exists = await this.crmRepo.findOne({ where });
      if (!exists) {
        const lead = this.crmRepo.create({
          ...dto,
          branch: { id: dto.branchId } as any,
          createdBy: dto.createdById
            ? ({ id: dto.createdById } as any)
            : undefined,
          assignedTo: dto.assignedToId
            ? ({ id: dto.assignedToId } as any)
            : undefined,
          isFuturePotential: dto.isFuturePotential ?? false,
        });
        toCreate.push(lead);
      }
    }

    if (!toCreate.length) {
      throw new ConflictException('All provided leads already exist.');
    }

    const saved = await this.crmRepo.save(toCreate);

    await Promise.all(
      saved.map((l) =>
        this.appendStatusLog(
          l.id,
          l.leadstatus ?? LeadStatus.New,
          l.branchId,
          {
            at: l.createdAt,
            changedById: l.createdBy?.id,
          },
        ),
      ),
    );

    return saved;
  }

  

  async findAll(
    currentUser: RequestUser,
    q: QueryCrmLeadDto,
  ): Promise<{
    data: ReturnCrmLeadDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;

    const { isSuperAdmin, isBranchHead, effectiveBranchId } =
      this.getRoleContext(currentUser, q.branchId);

    const qb = this.crmRepo
      .createQueryBuilder('crm')
      .leftJoinAndSelect('crm.assignedTo', 'assignedTo')
      .leftJoinAndSelect('crm.assignedBy', 'assignedBy')
      .leftJoinAndSelect('crm.createdBy', 'createdBy');

    const branchForFilter =
      isSuperAdmin && isBranchHead ? effectiveBranchId : effectiveBranchId;

    this.applyQueryFilters(qb, {
      ...q,
      branchId: branchForFilter,
    });

    qb.orderBy('crm.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map((r) => this.toReturnDto(r)),
      total,
      page,
      limit,
    };
  }

  async findLeadsByUser(
    currentUser: RequestUser,
    args: FindLeadsDto,
  ): Promise<CRMLead[]> {
    const { userId, branchId, startDate, endDate, isFuturePotential } = args;

    const { isSuperAdmin, isBranchHead, effectiveBranchId } =
      this.getRoleContext(currentUser, branchId);

    // Org-level SuperAdmin + BranchHead: access ALL leads in branch
    const where: FindOptionsWhere<CRMLead> = {
      branchId: effectiveBranchId,
    } as any;

    if (isFuturePotential === true) {
      (where as any).isFuturePotential = true;
    }

    if (!(isSuperAdmin && isBranchHead)) {
      // Non-org users: only their created leads
      const targetUserId = userId || currentUser.id;
      (where as any).createdBy = { id: targetUserId } as any;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException(
          'Invalid date format. Please use YYYY-MM-DD or ISO.',
        );
      }

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      (where as any).createdAt = Between(start, end);
    }

    return this.crmRepo.find({
      where,
      relations: ['assignedTo', 'assignedBy', 'createdBy'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: string, branchId: string): Promise<CRMLead> {
    const lead = await this.crmRepo.findOne({
      where: { id, branchId },
      relations: ['assignedTo', 'assignedBy'],
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  

  async remove(
    currentUser: RequestUser,
   id: string,
    branchId: string,
  ): Promise<void> {
    const { effectiveBranchId } = this.getRoleContext(currentUser, branchId);

    const lead = await this.crmRepo.findOne({ where: { id } });
    this.ensureBranchMatch(lead, effectiveBranchId);
    await this.crmRepo.delete(id);
  }

  async deleteMoreLeads(
    currentUser: RequestUser,
    ids: string[],
    branchId: string,
  ): Promise<void> {
    if (!ids?.length) return;

    const { effectiveBranchId } = this.getRoleContext(currentUser, branchId);

    const leads = await this.crmRepo.findBy({ id: In(ids) });
    if (leads.some((l) => l.branchId !== effectiveBranchId)) {
      throw new BadRequestException(
        'One or more leads are outside your branch.',
      );
    }

    await this.crmRepo.delete(ids);
  }

  async update(
   id: string,
    dto: UpdateCrmLeadDto,
    currentUser: RequestUser,
  ): Promise<CRMLead> {
    const { effectiveBranchId } = this.getRoleContext(
      currentUser,
      dto.actorBranchId || dto.branchId,
    );

    const lead = await this.crmRepo.findOne({
      where: { id },
      relations: ['assignedTo', 'assignedBy'],
    });
    this.ensureBranchMatch(lead, effectiveBranchId);

    // Guard: prevent branch move through PATCH unless equals current branch
    if (
      dto.branchId !== undefined &&
      dto.branchId !== null &&
      dto.branchId !== lead.branchId
    ) {
      throw new BadRequestException(
        'Branch change is not allowed in this endpoint.',
      );
    }

    // Handle reassignment
    if (dto.assignedToId) {
      const newAssignee = await this.userRepo.findOne({
        where: { id: dto.assignedToId },
      });
      if (!newAssignee) throw new NotFoundException('Assigned user not found');
      lead.assignedTo = newAssignee;
      lead.assignedBy = { id: currentUser.id } as any;

      await this.notificationService.createNotification({
        userId: newAssignee.id,
        message: `You have been assigned lead "${lead.Fullname}".`,
      });
      await this.mailerService.sendUserNotification(
        newAssignee,
        'New Lead Assigned',
        USER_NOTIFICATION_TEMPLATE,
      );
    }

    // Apply partial fields
    Object.assign(lead, {
      Fullname: dto.Fullname ?? lead.Fullname,
      Phonenumber: dto.Phonenumber ?? lead.Phonenumber,
      email: dto.email ?? lead.email,
      propertytype: dto.propertytype ?? lead.propertytype,
      platform: dto.platform ?? lead.platform,
      bhk: dto.bhk ?? lead.bhk,
      serviceType: dto.serviceType ?? lead.serviceType,
      review: dto.review ?? lead.review,
      city: dto.city ?? lead.city,
      state: dto.state ?? lead.state,
      category: dto.category ?? lead.category,
      monthly_bill: dto.monthly_bill ?? lead.monthly_bill,
      pincode: dto.pincode ?? lead.pincode,
      phase: dto.phase ?? lead.phase,
      houseNo: dto.houseNo ?? lead.houseNo,
      paintingPackage: dto.paintingPackage ?? lead.paintingPackage,
      paintingType: dto.paintingType ?? lead.paintingType,
      paintArea: dto.paintArea ?? lead.paintArea,
      apartmentName: dto.apartmentName ?? lead.apartmentName,
      areaName: dto.areaName ?? lead.areaName,
      isFuturePotential: dto.isFuturePotential ?? lead.isFuturePotential,
    });

    if (dto.visitScheduledAt) {
      lead.visitScheduledAt = new Date(dto.visitScheduledAt);
    }

    if (dto.leadstatus && dto.leadstatus !== lead.leadstatus) {
      lead.leadstatus = dto.leadstatus;
      lead.followUpDate = null;
      lead.visitScheduledAt = null;
      lead.visitDoneAt = null;
      await this.appendStatusLog(lead.id, lead.leadstatus, lead.branchId, {
        changedById: currentUser.id,
      });
    }

    return this.crmRepo.save(lead);
  }

  // -------------------------
  // Status transitions
  // -------------------------

  async updateStatus(
   id: string,
    dto: UpdateCrmLeadstatusDto,
    currentUser: RequestUser,
  ): Promise<CRMLead> {
    const { effectiveBranchId } = this.getRoleContext(
      currentUser,
      dto.actorBranchId,
    );

    const lead = await this.crmRepo.findOne({
      where: { id },
      relations: ['assignedTo'],
    });
    this.ensureBranchMatch(lead, effectiveBranchId);

    lead.followUpDate = null;
    lead.visitScheduledAt = null;
    lead.visitDoneAt = null;

    let at: Date | undefined;

    switch (dto.leadstatus) {
      case LeadStatus.Follow_up: {
        if (!dto.followUpDate)
          throw new BadRequestException(
            'followUpDate is required for Follow-up',
          );
        lead.followUpDate = new Date(dto.followUpDate);
        at = lead.followUpDate;
        break;
      }
      case LeadStatus.Visit_Scheduled: {
        if (!dto.visitScheduledAt)
          throw new BadRequestException(
            'visitScheduledAt is required for Visit Scheduled',
          );
        lead.visitScheduledAt = new Date(dto.visitScheduledAt);
        at = lead.visitScheduledAt;
        break;
      }
      case LeadStatus.Visit_Done: {
        if (!dto.visitDoneAt)
          throw new BadRequestException(
            'visitDoneAt is required for Visit Done',
          );
        lead.visitDoneAt = new Date(dto.visitDoneAt);
        at = lead.visitDoneAt;
        break;
      }
      case LeadStatus.completed: {
        if (dto.review?.trim()) {
          lead.review = dto.review.trim();
        }
        at = new Date();
        break;
      }
      case LeadStatus.NotInterested:
      case LeadStatus.Rejected:
      case LeadStatus.Lost: {
        if (dto.rejectionReason?.trim()) {
          lead.rejectionReason = dto.rejectionReason.trim();
        }
        at = new Date();
        break;
      }
      default:
        at = undefined;
        break;
    }

    lead.leadstatus = dto.leadstatus;

    const updated = await this.crmRepo.save(lead);

    await this.appendStatusLog(updated.id, updated.leadstatus, updated.branchId, {
      at,
      changedById: currentUser.id,
      changeReason: dto.rejectionReason?.trim() || undefined,
    });

    const formatDate = (d?: Date | null) =>
      d
        ? d.toLocaleString('default', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'N/A';

    let dateToFormat: Date | null = null;
    switch (updated.leadstatus) {
      case LeadStatus.Follow_up:
        dateToFormat = updated.followUpDate;
        break;
      case LeadStatus.Visit_Scheduled:
        dateToFormat = updated.visitScheduledAt;
        break;
      case LeadStatus.Visit_Done:
        dateToFormat = updated.visitDoneAt;
        break;
      default:
        dateToFormat = updated.updatedAt ?? null;
        break;
    }

    if (
      [LeadStatus.Follow_up, LeadStatus.SiteVisit, LeadStatus.Interested].includes(
        updated.leadstatus,
      )
    ) {
      const formatted = formatDate(dateToFormat);
      if (updated.assignedTo) {
        await this.notificationService.createNotification({
          userId: updated.assignedTo.id,
          message: `Lead "${updated.Fullname}" status updated to ${updated.leadstatus} on ${formatted}.`,
        });

        await this.mailerService.sendUserNotification(
          updated.assignedTo,
          'Lead Status Updated',
          `The lead "${updated.Fullname}" was updated to ${updated.leadstatus}.`,
        );
      }
    }

    return updated;
  }
  async findOneById(
  currentUser: RequestUser,
  id: string,
  branchId?: string,
): Promise<CRMLead> {
  const { effectiveBranchId } = this.getRoleContext(
    currentUser,
    branchId,
  );

  const lead = await this.crmRepo.findOne({
    where: {
      id,
      branchId: effectiveBranchId,
    },
    relations: [
      'assignedTo',
      'assignedBy',
      'createdBy',
      'branch',
      'statusLogs',
    ],
    order: {
      statusLogs: {
        // createdAt: 'DESC',
      },
    },
  });

  if (!lead) {
    throw new BadRequestException('CRM lead not found');
  }

  return lead;
}


  

  async assignLeadToUser(
    currentUser: RequestUser,
    leadId: string,
    assignedToId: string,
    adminId: string,
    branchId: string,
  ) {
    const { effectiveBranchId } = this.getRoleContext(currentUser, branchId);

    const lead = await this.crmRepo.findOne({
      where: { id: leadId },
      relations: ['assignedTo', 'assignedBy'],
    });
    this.ensureBranchMatch(lead, effectiveBranchId);

    const assignedUser = await this.userRepo.findOne({
      where: { id: assignedToId },
    });
    if (!assignedUser) throw new NotFoundException('Assigned user not found');

    const adminUser = await this.userRepo.findOne({ where: { id: adminId } });
    if (!adminUser) throw new NotFoundException('Admin user not found');

    lead.assignedTo = assignedUser;
    lead.assignedBy = adminUser;

    const saved = await this.crmRepo.save(lead);

    await this.notificationService.createNotification({
      userId: assignedUser.id,
      message: `New lead assigned: "${lead.Fullname}".`,
    });
    await this.mailerService.sendUserNotification(
      assignedUser,
      'New Lead Assigned',
      USER_NOTIFICATION_TEMPLATE,
    );

    return {
      ...saved,
      assignedTo: assignedUser.fullName,
      assignedBy: adminUser.fullName,
    };
  }

  // -------------------------
  // Timeline
  // -------------------------

  async getTimeline(
    currentUser: RequestUser,
    leadId: string,
    branchId?: string,
  ) {
    const { effectiveBranchId } = this.getRoleContext(currentUser, branchId);

    const lead = await this.crmRepo.findOne({
      where: { id: leadId },
      relations: ['statusLogs', 'statusLogs.changedBy', 'createdBy'],
    });
    this.ensureBranchMatch(lead, effectiveBranchId);

    const ordered = (lead.statusLogs || [])
      .filter((l) =>
        effectiveBranchId ? l.branchId === effectiveBranchId : true,
      )
      .sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());

    const steps: { status: string; at: Date; changedBy?: string }[] = [];

    for (const log of ordered) {
      if (!steps.length || steps[steps.length - 1].status !== log.status) {
        const changedBy =
          log.changedBy && typeof (log.changedBy as any).fullName === 'string'
            ? (log.changedBy as any).fullName
            : undefined;
        steps.push({ status: log.status, at: log.changedAt, changedBy });
      }
    }

    if (!steps.length) {
      const createdByName =
        lead.createdBy && typeof (lead.createdBy as any).fullName === 'string'
          ? (lead.createdBy as any).fullName
          : undefined;
      steps.push({
        status: lead.leadstatus,
        at: lead.createdAt ?? new Date(),
        changedBy: createdByName,
      });
    } else if (steps[steps.length - 1].status !== lead.leadstatus) {
      const at =
        lead.leadstatus === LeadStatus.Follow_up
          ? lead.followUpDate
          : lead.leadstatus === LeadStatus.Visit_Scheduled
          ? lead.visitScheduledAt
          : lead.leadstatus === LeadStatus.Visit_Done
          ? lead.visitDoneAt
          : lead.updatedAt ?? new Date();
      steps.push({ status: lead.leadstatus, at: at ?? new Date() });
    }

    return { leadId, currentStatus: lead.leadstatus, steps };
  }

  async bulkSendToLeads(
    currentUser: RequestUser,
    leadIds: string[],
    channel: BulkMessageChannel,
    branchId?: string,
    customMessage?: string,
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    if (!leadIds?.length) {
      throw new BadRequestException('At least one lead ID is required.');
    }

    const { effectiveBranchId } = this.getRoleContext(
      currentUser,
      branchId,
    );

    const leads = await this.crmRepo.find({
      where: { id: In(leadIds) },
    });

    const validLeads = leads.filter((l) => l.branchId === effectiveBranchId);
    if (validLeads.length !== leads.length) {
      throw new BadRequestException(
        'Some leads are outside your branch scope.',
      );
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] };
    const message =
      customMessage?.trim() ||
      `Hello! Houznext has new offers and services for you. Contact us for more details.`;

    for (const lead of validLeads) {
      const phone = lead.Phonenumber?.replace(/\D/g, '').slice(-10);
      if (!phone || phone.length !== 10) {
        results.failed++;
        results.errors.push(`Invalid phone for lead ${lead.Fullname}`);
        continue;
      }
      const formattedPhone = `91${phone}`;

      try {
        if (channel === 'whatsapp' || channel === 'both') {
          await this.whatsAppService.sendMessage(
            formattedPhone,
            customMessage?.trim()
              ? `Hello ${lead.Fullname},\n\n${customMessage}`
              : message,
          );
        }
        if (channel === 'sms' || channel === 'both') {
          await this.smsService.sendSms(
            formattedPhone,
            customMessage?.trim()
              ? `Hi ${lead.Fullname}, ${customMessage}`
              : message,
          );
        }
        results.sent++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(
          `${lead.Fullname}: ${err?.message || 'Send failed'}`,
        );
      }
    }

    return results;
  }
}
