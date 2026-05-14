import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { InfraCrmLead } from './entities/infra-crm-lead.entity';
import { InfraCrmActivity } from './entities/infra-crm-activity.entity';
import { InfraCrmSiteVisit } from './entities/infra-crm-site-visit.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { CrmNotificationService } from './crm-notification.service';
import type { CrmNotifyAction } from './crm-notification.service';
import {
  BulkAssignDto,
  CreateActivityDto,
  CreateLeadDto,
  CreateSiteVisitDto,
  ListLeadsQueryDto,
  PatchLeadDto,
  PatchPriorityDto,
  PatchSiteVisitDto,
  PatchStageDto,
  SiteVisitListQueryDto,
  StatsQueryDto,
} from './dto/crm-lead.dto';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

@Injectable()
export class CrmLeadService {
  constructor(
    @InjectRepository(InfraCrmLead)
    private readonly leadRepo: Repository<InfraCrmLead>,
    @InjectRepository(InfraCrmActivity)
    private readonly actRepo: Repository<InfraCrmActivity>,
    @InjectRepository(InfraCrmSiteVisit)
    private readonly visitRepo: Repository<InfraCrmSiteVisit>,
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    @InjectRepository(InfraUser)
    private readonly userRepo: Repository<InfraUser>,
    private readonly notifySvc: CrmNotificationService,
  ) {}

  private fireNotify(action: CrmNotifyAction, lead: InfraCrmLead, extra?: Parameters<CrmNotificationService['notifyCrmAction']>[2]) {
    void this.notifySvc.notifyCrmAction(action, lead, extra).catch(() => undefined);
  }

  calculateLeadScore(lead: Partial<InfraCrmLead>): number {
    let score = 0;
    if (lead.budgetRange && String(lead.budgetRange).trim() && lead.budgetRange !== 'Just exploring') score += 20;

    const t = String(lead.timeline || '');
    if (t === 'Immediate' || t.includes('Immediate')) score += 20;
    else if (t === '1–3 months' || t.includes('1–3')) score += 15;
    else if (t === '3–6 months' || t.includes('3–6')) score += 10;
    else if (t === '6–12 months') score += 5;

    if (lead.priority === 'hot') score += 20;
    else if (lead.priority === 'warm') score += 10;

    const stageScores: Record<string, number> = {
      new: 5,
      contacted: 10,
      site_sched: 15,
      site_done: 18,
      negotiation: 20,
      token: 23,
      booked: 24,
      registered: 25,
      lost: 0,
      nurture: 3,
      future: 2,
    };
    score += stageScores[lead.stage || 'new'] || 0;

    if (lead.email) score += 5;
    if (lead.preferredLocality) score += 5;
    if (lead.loanRequired === 'Pre-approved') score += 5;

    return Math.min(score, 100);
  }

  private applyScore(lead: InfraCrmLead) {
    lead.leadScore = this.calculateLeadScore(lead);
  }

  private toPlain(lead: InfraCrmLead) {
    return {
      id: lead.id,
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      alternatePhone: lead.alternatePhone,
      propertyType: lead.propertyType,
      bhkPreference: lead.bhkPreference,
      budgetRange: lead.budgetRange,
      preferredCity: lead.preferredCity,
      preferredLocality: lead.preferredLocality,
      purpose: lead.purpose,
      loanRequired: lead.loanRequired,
      loanStatus: lead.loanStatus,
      timeline: lead.timeline,
      stage: lead.stage,
      priority: lead.priority,
      leadScore: lead.leadScore,
      source: lead.source,
      assignedTo: lead.assignedTo,
      assignedAgentId: lead.assignedAgentId,
      nextFollowUpAt: lead.nextFollowUpAt,
      followUpMethod: lead.followUpMethod,
      linkedPropertyIds: lead.linkedPropertyIds ?? [],
      tokenAmount: lead.tokenAmount,
      tokenPaidAt: lead.tokenPaidAt,
      bookedPropertyId: lead.bookedPropertyId,
      registrationAmount: lead.registrationAmount,
      registeredAt: lead.registeredAt,
      notes: lead.notes,
      internalNotes: lead.internalNotes,
      lostReason: lead.lostReason,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  async listAgents() {
    const users = await this.userRepo.find({ take: 200, order: { createdAt: 'DESC' } });
    return users.map((u) => ({
      id: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username,
      email: u.email,
    }));
  }

  async listLeads(q: ListLeadsQueryDto) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 25));
    const qb = this.leadRepo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC');
    if (q.stage) qb.andWhere('l.stage = :stage', { stage: q.stage });
    if (q.priority) qb.andWhere('l.priority = :priority', { priority: q.priority });
    if (q.propertyType) qb.andWhere('l.propertyType = :pt', { pt: q.propertyType });
    if (q.budgetRange) qb.andWhere('l.budgetRange = :br', { br: q.budgetRange });
    if (q.source) qb.andWhere('l.source = :src', { src: q.source });
    if (q.assignedTo) qb.andWhere('l.assignedTo = :as', { as: q.assignedTo });
    if (q.q?.trim()) {
      const s = `%${q.q.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('LOWER(l.fullName) LIKE :s', { s })
            .orWhere('LOWER(l.phone) LIKE :s', { s })
            .orWhere('LOWER(l.email) LIKE :s', { s })
            .orWhere('LOWER(l.preferredCity) LIKE :s', { s });
        }),
      );
    }
    if (q.tab === 'hot') qb.andWhere(`l.priority = 'hot'`);
    if (q.tab === 'site_visit') qb.andWhere(`l.stage IN ('site_sched','site_done')`);
    if (q.tab === 'negotiation') qb.andWhere(`l.stage = 'negotiation'`);
    if (q.tab === 'token_booked') qb.andWhere(`l.stage IN ('token','booked')`);
    if (q.tab === 'registered') qb.andWhere(`l.stage = 'registered'`);
    if (q.tab === 'lost_nurture') qb.andWhere(`l.stage IN ('lost','nurture')`);

    const [rows, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data: rows.map((l) => this.toPlain(l)), total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async getOne(id: string) {
    const lead = await this.leadRepo.findOne({ where: { id }, relations: { activities: true, siteVisits: true } });
    if (!lead) throw new NotFoundException('Lead not found');
    const acts = [...(lead.activities || [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const visits = [...(lead.siteVisits || [])].sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));
    const ids = lead.linkedPropertyIds || [];
    let linked: Array<{ id: string; title: string; propertyCode: string | null; basePrice: string | null }> = [];
    if (ids.length) {
      const props = await this.propRepo.find({ where: { propertyId: In(ids) } });
      linked = props.map((p) => ({
        id: p.propertyId,
        title: p.title,
        propertyCode: p.propertyCode,
        basePrice: p.basePrice,
      }));
    }
    return { lead: this.toPlain(lead), activities: acts, siteVisits: visits, linkedProperties: linked };
  }

  async create(dto: CreateLeadDto): Promise<InfraCrmLead> {
    const lead = this.leadRepo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email ?? null,
      alternatePhone: dto.alternatePhone ?? null,
      propertyType: dto.propertyType ?? 'Apartment',
      bhkPreference: dto.bhkPreference ?? null,
      budgetRange: dto.budgetRange ?? null,
      preferredCity: dto.preferredCity ?? null,
      preferredLocality: dto.preferredLocality ?? null,
      purpose: dto.purpose ?? 'Self use',
      loanRequired: dto.loanRequired ?? 'Yes',
      timeline: dto.timeline ?? '3–6 months',
      stage: dto.stage ?? 'new',
      priority: dto.priority ?? 'cold',
      source: dto.source ?? 'Website enquiry',
      assignedTo: dto.assignedTo ?? null,
      assignedAgentId: dto.assignedAgentId ?? null,
      nextFollowUpAt: dto.nextFollowUpAt ? new Date(dto.nextFollowUpAt) : null,
      followUpMethod: dto.followUpMethod ?? 'Phone call',
      linkedPropertyIds: dto.linkedPropertyIds?.length ? dto.linkedPropertyIds : null,
      notes: dto.notes ?? null,
      internalNotes: dto.internalNotes ?? null,
    });
    this.applyScore(lead);
    const saved = await this.leadRepo.save(lead);
    const act = this.actRepo.create({
      lead: saved,
      type: 'created',
      content: 'Lead created',
      agentName: dto.assignedTo ?? null,
    });
    await this.actRepo.save(act);
    this.fireNotify('created', saved);
    return saved;
  }

  async patch(id: string, dto: PatchLeadDto): Promise<InfraCrmLead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    const { nextFollowUpAt, tokenPaidAt, registeredAt, linkedPropertyIds, ...rest } = dto;
    Object.assign(lead, rest);
    if (nextFollowUpAt !== undefined) lead.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : null;
    if (tokenPaidAt !== undefined) lead.tokenPaidAt = tokenPaidAt ? new Date(tokenPaidAt) : null;
    if (registeredAt !== undefined) lead.registeredAt = registeredAt ? new Date(registeredAt) : null;
    if (linkedPropertyIds !== undefined) lead.linkedPropertyIds = linkedPropertyIds?.length ? linkedPropertyIds : null;
    this.applyScore(lead);
    const saved = await this.leadRepo.save(lead);
    this.fireNotify('updated', saved);
    return saved;
  }

  async patchStage(id: string, dto: PatchStageDto): Promise<InfraCrmLead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    const prev = lead.stage;
    lead.stage = dto.stage;
    if (dto.tokenAmount !== undefined) lead.tokenAmount = dto.tokenAmount;
    if (dto.tokenPaidAt !== undefined) lead.tokenPaidAt = dto.tokenPaidAt ? new Date(dto.tokenPaidAt) : null;
    if (dto.bookedPropertyId !== undefined) lead.bookedPropertyId = dto.bookedPropertyId ?? null;
    if (dto.stage === 'registered' && !lead.registeredAt) lead.registeredAt = new Date();
    this.applyScore(lead);
    const saved = await this.leadRepo.save(lead);
    const act = this.actRepo.create({
      lead: saved,
      type: 'stage_change',
      content: `Stage ${prev} → ${dto.stage}`,
      agentName: dto.agentName ?? null,
      previousStage: prev,
      newStage: dto.stage,
    });
    await this.actRepo.save(act);
    this.fireNotify('stage_changed', saved, { previousStage: prev, newStage: dto.stage, agentName: dto.agentName });
    if (dto.stage === 'token' && (dto.tokenAmount || saved.tokenAmount)) {
      this.fireNotify('token_paid', saved, { agentName: dto.agentName });
    }
    if (dto.stage === 'registered') this.fireNotify('registered', saved, { agentName: dto.agentName });
    return saved;
  }

  async patchPriority(id: string, dto: PatchPriorityDto): Promise<InfraCrmLead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    lead.priority = dto.priority;
    this.applyScore(lead);
    const saved = await this.leadRepo.save(lead);
    this.fireNotify('priority_changed', saved, { agentName: dto.agentName });
    return saved;
  }

  async remove(id: string): Promise<void> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    const snap = { ...lead };
    await this.leadRepo.delete({ id });
    this.fireNotify('deleted', snap as InfraCrmLead);
  }

  async addActivity(leadId: string, dto: CreateActivityDto, agentName?: string): Promise<InfraCrmActivity> {
    const lead = await this.leadRepo.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    const act = this.actRepo.create({
      lead,
      type: dto.type,
      content: dto.content,
      agentName: dto.agentName ?? agentName ?? null,
      previousStage: dto.previousStage ?? null,
      newStage: dto.newStage ?? null,
    });
    const saved = await this.actRepo.save(act);
    await this.leadRepo.update({ id: leadId }, { updatedAt: new Date() });
    this.fireNotify('activity_logged', lead, { note: dto.content.slice(0, 500), agentName: saved.agentName ?? undefined });
    return saved;
  }

  async listActivities(leadId: string) {
    return this.actRepo.find({
      where: { lead: { id: leadId } },
      order: { createdAt: 'DESC' },
    });
  }

  async createSiteVisit(dto: CreateSiteVisitDto): Promise<InfraCrmSiteVisit> {
    const lead = await this.leadRepo.findOne({ where: { id: dto.leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    const v = this.visitRepo.create({
      lead,
      propertyId: dto.propertyId ?? null,
      propertyTitle: dto.propertyTitle ?? null,
      scheduledAt: new Date(dto.scheduledAt),
      status: dto.status ?? 'scheduled',
      agentName: dto.agentName ?? null,
      notes: dto.notes ?? null,
    });
    const saved = await this.visitRepo.save(v);
    this.fireNotify('site_visit_scheduled', lead, { agentName: dto.agentName, note: dto.notes });
    return saved;
  }

  async listSiteVisits(q: SiteVisitListQueryDto) {
    const qb = this.visitRepo.createQueryBuilder('v').leftJoinAndSelect('v.lead', 'l').orderBy('v.scheduledAt', 'ASC');
    if (q.from) qb.andWhere('v.scheduledAt >= :from', { from: new Date(q.from) });
    if (q.to) qb.andWhere('v.scheduledAt <= :to', { to: new Date(q.to) });
    if (q.agentName) qb.andWhere('v.agentName = :an', { an: q.agentName });
    const rows = await qb.getMany();
    return rows.map((v) => ({
      id: v.id,
      scheduledAt: v.scheduledAt,
      status: v.status,
      agentName: v.agentName,
      propertyId: v.propertyId,
      propertyTitle: v.propertyTitle,
      notes: v.notes,
      feedback: v.feedback,
      lead: v.lead
        ? { id: v.lead.id, fullName: v.lead.fullName, phone: v.lead.phone }
        : null,
    }));
  }

  async patchSiteVisit(id: string, dto: PatchSiteVisitDto): Promise<InfraCrmSiteVisit> {
    const v = await this.visitRepo.findOne({ where: { id }, relations: { lead: true } });
    if (!v) throw new NotFoundException('Site visit not found');
    const prevStatus = v.status;
    Object.assign(v, {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : v.scheduledAt,
    });
    const saved = await this.visitRepo.save(v);
    const lead = v.lead;
    if (dto.status === 'completed' && prevStatus !== 'completed') {
      this.fireNotify('site_visit_completed', lead, { note: dto.notes ?? undefined, agentName: dto.agentName });
    } else {
      this.fireNotify('site_visit_updated', lead, { note: dto.notes ?? undefined, agentName: dto.agentName });
    }
    return saved;
  }

  async bulkAssign(dto: BulkAssignDto) {
    const leads = await this.leadRepo.find({ where: { id: In(dto.leadIds) } });
    for (const l of leads) {
      if (dto.assignedTo !== undefined) l.assignedTo = dto.assignedTo;
      if (dto.assignedAgentId !== undefined) l.assignedAgentId = dto.assignedAgentId;
      this.applyScore(l);
      await this.leadRepo.save(l);
      this.fireNotify('updated', l, { agentName: dto.agentName });
    }
    return { updated: leads.length };
  }

  async stats(_q?: StatsQueryDto) {
    const total = await this.leadRepo.count();
    const hotLeads = await this.leadRepo.count({ where: { priority: 'hot' } });
    const siteVisitLeads = await this.leadRepo
      .createQueryBuilder('l')
      .where(`l.stage IN ('site_sched','site_done')`)
      .getCount();
    const tokenPaid = await this.leadRepo.count({ where: { stage: 'token' } });
    const registered = await this.leadRepo.count({ where: { stage: 'registered' } });
    const now = new Date();
    const sod = startOfDay(now);
    const eod = endOfDay(now);
    const followUpsDue = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.nextFollowUpAt IS NOT NULL')
      .andWhere('l.nextFollowUpAt < :now', { now: sod })
      .getCount();

    const stageRows = await this.leadRepo.createQueryBuilder('l').select('l.stage', 'stage').addSelect('COUNT(*)', 'c').groupBy('l.stage').getRawMany<{ stage: string; c: string }>();
    const stageCounts: Record<string, number> = {};
    for (const r of stageRows) stageCounts[r.stage] = Number(r.c);

    const srcRows = await this.leadRepo.createQueryBuilder('l').select('l.source', 'source').addSelect('COUNT(*)', 'c').groupBy('l.source').getRawMany<{ source: string; c: string }>();
    const sourceCounts: Record<string, number> = {};
    for (const r of srcRows) sourceCounts[r.source] = Number(r.c);

    const todayVisits = await this.visitRepo
      .createQueryBuilder('v')
      .where('v.scheduledAt BETWEEN :s AND :e', { s: sod, e: eod })
      .getCount();

    const overdueLeads = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.nextFollowUpAt IS NOT NULL AND l.nextFollowUpAt < :sod', { sod })
      .orderBy('l.nextFollowUpAt', 'ASC')
      .take(10)
      .getMany();

    const recent = await this.leadRepo.find({ order: { createdAt: 'DESC' }, take: 8 });

    const pipelineValue = total * 4500000;
    const weightedValue = Math.round(pipelineValue * 0.35);
    const avgDealSize = registered > 0 ? Math.round(pipelineValue / registered) : 0;
    const conversionRate = total > 0 ? Math.round((registered / total) * 1000) / 10 : 0;
    const avgDaysToClose = 42;

    return {
      totalLeads: total,
      hotLeads,
      siteVisits: siteVisitLeads,
      siteVisitsToday: todayVisits,
      tokenPaid,
      registered,
      followUpsDue,
      overdueCount: followUpsDue,
      openLeadsCount: total,
      stageCounts,
      sourceCounts,
      pipelineValue,
      weightedValue,
      avgDealSize,
      conversionRate,
      avgDaysToClose,
      overdueLeadsPreview: overdueLeads.map((l) => this.toPlain(l)),
      recentLeads: recent.map((l) => this.toPlain(l)),
    };
  }

  async pipeline() {
    const stages = ['new', 'contacted', 'site_sched', 'site_done', 'negotiation', 'token', 'booked', 'registered', 'lost', 'nurture', 'future'];
    const out: Record<string, InfraCrmLead[]> = {};
    for (const s of stages) {
      out[s] = await this.leadRepo.find({ where: { stage: s }, order: { updatedAt: 'DESC' }, take: 200 });
    }
    return out;
  }

  async followUps() {
    const now = new Date();
    const sod = startOfDay(now);
    const eod = endOfDay(now);
    const week = new Date(sod);
    week.setDate(week.getDate() + 7);

    const overdue = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.nextFollowUpAt IS NOT NULL AND l.nextFollowUpAt < :sod', { sod })
      .orderBy('l.nextFollowUpAt', 'ASC')
      .getMany();

    const today = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.nextFollowUpAt BETWEEN :s AND :e', { s: sod, e: eod })
      .orderBy('l.nextFollowUpAt', 'ASC')
      .getMany();

    const upcoming = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.nextFollowUpAt > :e', { e: eod })
      .andWhere('l.nextFollowUpAt <= :w', { w: week })
      .orderBy('l.nextFollowUpAt', 'ASC')
      .getMany();

    return {
      overdue: overdue.map((l) => this.toPlain(l)),
      today: today.map((l) => this.toPlain(l)),
      upcoming: upcoming.map((l) => this.toPlain(l)),
    };
  }

  /** Used when a website enquiry creates a CRM row */
  async createFromEnquiry(params: {
    fullName: string;
    phone: string;
    email: string | null;
    propertyId: string;
  }): Promise<InfraCrmLead> {
    return this.create({
      fullName: params.fullName,
      phone: params.phone,
      email: params.email ?? undefined,
      source: 'Website enquiry',
      linkedPropertyIds: [params.propertyId],
      propertyType: 'Apartment',
    });
  }
}
