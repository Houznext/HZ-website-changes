import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScopeTemplate } from './entities/scope-template.entity';
import { QcCheckpointTemplate } from './entities/qc-checkpoint-template.entity';
import {
  ScopeOfWork,
  ScopeStatus,
} from './entities/scope-of-work.entity';
import { DailyUpdate } from './entities/daily-update.entity';
import { LabourEntry } from './entities/labour-entry.entity';
import { MaterialUsage } from './entities/material-usage.entity';
import {
  QcItem,
  QcStatus,
} from './entities/qc-item.entity';
import {
  SnagItem,
  SnagStatus,
  SnagSeverity,
} from './entities/snag-item.entity';
import { Dpr } from './entities/dpr.entity';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class BuildliveService {
  constructor(
    @InjectRepository(ScopeTemplate)
    private readonly scopeTemplateRepo: Repository<ScopeTemplate>,
    @InjectRepository(QcCheckpointTemplate)
    private readonly qcTemplateRepo: Repository<QcCheckpointTemplate>,
    @InjectRepository(ScopeOfWork)
    private readonly scopeRepo: Repository<ScopeOfWork>,
    @InjectRepository(DailyUpdate)
    private readonly updateRepo: Repository<DailyUpdate>,
    @InjectRepository(LabourEntry)
    private readonly labourRepo: Repository<LabourEntry>,
    @InjectRepository(MaterialUsage)
    private readonly materialRepo: Repository<MaterialUsage>,
    @InjectRepository(QcItem)
    private readonly qcItemRepo: Repository<QcItem>,
    @InjectRepository(SnagItem)
    private readonly snagRepo: Repository<SnagItem>,
    @InjectRepository(Dpr)
    private readonly dprRepo: Repository<Dpr>,
  ) {}

  // Templates
  async getAllTemplates() {
    return this.scopeTemplateRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: ['checkpointTemplates'],
    });
  }

  async createCustomTemplate(dto: {
    name: string;
    iconName?: string;
    unit?: string;
    description?: string;
    defaultWeightage?: number;
    checkpoints: string[];
  }) {
    const slug = slugify(dto.name);

    const template = this.scopeTemplateRepo.create({
      name: dto.name,
      slug,
      iconName: dto.iconName ?? null,
      unit: dto.unit ?? null,
      description: dto.description ?? null,
      defaultWeightage: dto.defaultWeightage ?? 10,
      sortOrder: 0,
      isActive: true,
      isCustom: true,
    });
    const savedTemplate = await this.scopeTemplateRepo.save(template);

    const checkpoints = (dto.checkpoints || []).map((name, index) =>
      this.qcTemplateRepo.create({
        scopeTemplate: savedTemplate,
        checkpointName: name,
        isMandatory: true,
        sequence: index,
      }),
    );
    await this.qcTemplateRepo.save(checkpoints);

    return this.scopeTemplateRepo.findOne({
      where: { id: savedTemplate.id },
      relations: ['checkpointTemplates'],
    });
  }

  // Scopes
  async getScopesByProject(projectId: string) {
    return this.scopeRepo.find({
      where: { projectId },
      relations: ['template', 'qcItems', 'snagItems', 'dailyUpdates'],
      order: { createdAt: 'ASC' },
    });
  }

  async createScope(
    projectId: string,
    dto: {
      templateId: string;
      customName?: string;
      assignedVendorName?: string;
      assignedVendorPhone?: string;
      weightage?: number;
      plannedStartDate?: string;
      plannedEndDate?: string;
      scopeArea?: string;
    },
  ) {
    const template = await this.scopeTemplateRepo.findOne({
      where: { id: dto.templateId },
      relations: ['checkpointTemplates'],
    });
    if (!template) {
      throw new Error('Scope template not found');
    }

    const scope = this.scopeRepo.create({
      projectId,
      template,
      customName: dto.customName ?? null,
      assignedVendorName: dto.assignedVendorName ?? null,
      assignedVendorPhone: dto.assignedVendorPhone ?? null,
      weightage: dto.weightage ?? template.defaultWeightage ?? 10,
      plannedStartDate: dto.plannedStartDate
        ? new Date(dto.plannedStartDate)
        : null,
      plannedEndDate: dto.plannedEndDate
        ? new Date(dto.plannedEndDate)
        : null,
      scopeArea: dto.scopeArea ?? null,
      status: ScopeStatus.NOT_STARTED,
      overallProgress: 0,
    });

    const savedScope = await this.scopeRepo.save(scope);

    // Auto-create QC items from template checkpoints
    const qcItems = (template.checkpointTemplates || []).map((checkpoint) =>
      this.qcItemRepo.create({
        scope: savedScope,
        checkpointName: checkpoint.checkpointName,
        status: QcStatus.PENDING,
        sequence: checkpoint.sequence,
        isMandatory: checkpoint.isMandatory,
      }),
    );
    await this.qcItemRepo.save(qcItems);

    return this.scopeRepo.findOne({
      where: { id: savedScope.id },
      relations: ['template', 'qcItems'],
    });
  }

  async updateScope(scopeId: string, dto: Partial<ScopeOfWork>) {
    const scope = await this.scopeRepo.findOne({ where: { id: scopeId } });
    if (!scope) {
      throw new Error('Scope not found');
    }
    Object.assign(scope, dto);
    return this.scopeRepo.save(scope);
  }

  // Updates
  async getUpdatesByScope(scopeId: string) {
    return this.updateRepo.find({
      where: { scope: { id: scopeId } as any },
      relations: ['labourEntries', 'materialUsages'],
      order: { updateDate: 'DESC' },
    });
  }

  async createUpdate(
    scopeId: string,
    dto: {
      updateDate: string;
      progressDelta: number;
      supervisorName: string;
      workDoneToday?: string;
      tomorrowPlan?: string;
      blockerNote?: string;
      labourEntries?: Array<{
        tradeType: string;
        count: number;
        hoursWorked?: number;
        wagePerDay?: number;
      }>;
      materialUsages?: Array<{
        materialName: string;
        quantity: number;
        unit: string;
        unitCost?: number;
      }>;
    },
  ) {
    const scope = await this.scopeRepo.findOne({ where: { id: scopeId } });
    if (!scope) {
      throw new Error('Scope not found');
    }

    const progressDelta = dto.progressDelta ?? 0;
    const cumulativeProgress = Math.min(
      100,
      (scope.overallProgress || 0) + progressDelta,
    );

    // Material costs
    const materialEntities: MaterialUsage[] = [];
    let totalExpenditureToday = 0;
    for (const m of dto.materialUsages || []) {
      const totalCost =
        m.unitCost != null ? m.unitCost * (m.quantity ?? 0) : null;
      if (totalCost != null) {
        totalExpenditureToday += totalCost;
      }
      const entity = this.materialRepo.create({
        materialName: m.materialName,
        quantity: m.quantity,
        unit: m.unit,
        unitCost: m.unitCost ?? null,
        totalCost,
      });
      materialEntities.push(entity);
    }

    const labourEntities: LabourEntry[] = [];
    for (const l of dto.labourEntries || []) {
      const entity = this.labourRepo.create({
        tradeType: l.tradeType,
        count: l.count,
        hoursWorked: l.hoursWorked ?? 8,
        wagePerDay: l.wagePerDay ?? null,
      });
      labourEntities.push(entity);
    }

    const dailyUpdate = this.updateRepo.create({
      scope,
      updateDate: new Date(dto.updateDate),
      progressDelta,
      cumulativeProgress,
      supervisorName: dto.supervisorName,
      workDoneToday: dto.workDoneToday ?? null,
      tomorrowPlan: dto.tomorrowPlan ?? null,
      blockerNote: dto.blockerNote ?? null,
      totalExpenditureToday,
    });

    const savedUpdate = await this.updateRepo.save(dailyUpdate);

    for (const labour of labourEntities) {
      labour.dailyUpdate = savedUpdate;
    }
    for (const material of materialEntities) {
      material.dailyUpdate = savedUpdate;
    }
    await this.labourRepo.save(labourEntities);
    await this.materialRepo.save(materialEntities);

    // Auto-create snag if blocker note is present
    if (dto.blockerNote && dto.blockerNote.trim().length > 0) {
      const snag = this.snagRepo.create({
        scope,
        title: 'Auto-generated blocker',
        description: dto.blockerNote,
        raisedBy: dto.supervisorName,
        severity: SnagSeverity.MEDIUM,
        status: SnagStatus.OPEN,
      });
      await this.snagRepo.save(snag);
    }

    // Update scope dates and progress
    if (!scope.actualStartDate) {
      scope.actualStartDate = new Date();
    }
    scope.overallProgress = cumulativeProgress;
    scope.status =
      cumulativeProgress >= 100 ? ScopeStatus.COMPLETED : ScopeStatus.IN_PROGRESS;
    await this.scopeRepo.save(scope);

    await this.recalculateProjectProgress(scope.projectId);

    return this.updateRepo.findOne({
      where: { id: savedUpdate.id },
      relations: ['labourEntries', 'materialUsages'],
    });
  }

  async recalculateProjectProgress(projectId: string) {
    const scopes = await this.scopeRepo.find({ where: { projectId } });
    if (!scopes.length) return 0;

    let totalWeight = 0;
    let weightedProgress = 0;
    for (const s of scopes) {
      const weight = s.weightage || 0;
      totalWeight += weight;
      weightedProgress += (s.overallProgress || 0) * weight;
    }
    const overall =
      totalWeight > 0 ? Math.round((weightedProgress / totalWeight) * 100) / 100 : 0;
    return overall;
  }

  // QC
  async getQcByScope(scopeId: string) {
    return this.qcItemRepo.find({
      where: { scope: { id: scopeId } as any },
      order: { sequence: 'ASC', createdAt: 'ASC' },
    });
  }

  async updateQcItem(
    qcItemId: string,
    dto: {
      status: QcStatus;
      checkedBy: string;
      failureNote?: string;
      photoUrl?: string;
    },
  ) {
    const item = await this.qcItemRepo.findOne({ where: { id: qcItemId } });
    if (!item) {
      throw new Error('QC item not found');
    }
    item.status = dto.status;
    item.checkedBy = dto.checkedBy;
    item.failureNote = dto.failureNote ?? null;
    item.photoUrl = dto.photoUrl ?? null;
    item.checkedAt = new Date();
    return this.qcItemRepo.save(item);
  }

  // Snags
  async getSnagsByScope(scopeId: string) {
    return this.snagRepo.find({
      where: { scope: { id: scopeId } as any },
      order: { raisedAt: 'DESC' },
    });
  }

  async createSnag(
    scopeId: string,
    dto: {
      title: string;
      description: string;
      raisedBy: string;
      severity?: SnagSeverity;
    },
  ) {
    const scope = await this.scopeRepo.findOne({ where: { id: scopeId } });
    if (!scope) {
      throw new Error('Scope not found');
    }
    const snag = this.snagRepo.create({
      scope,
      title: dto.title,
      description: dto.description,
      raisedBy: dto.raisedBy,
      severity: dto.severity ?? SnagSeverity.MEDIUM,
      status: SnagStatus.OPEN,
    });
    return this.snagRepo.save(snag);
  }

  async updateSnag(
    snagId: string,
    dto: { status: SnagStatus; resolutionNote?: string; resolvedBy?: string },
  ) {
    const snag = await this.snagRepo.findOne({ where: { id: snagId } });
    if (!snag) {
      throw new Error('Snag not found');
    }
    snag.status = dto.status;
    snag.resolutionNote = dto.resolutionNote ?? snag.resolutionNote;
    if (dto.status === SnagStatus.RESOLVED) {
      snag.resolvedBy = dto.resolvedBy ?? snag.resolvedBy ?? null;
      snag.resolvedAt = new Date();
    }
    return this.snagRepo.save(snag);
  }

  // Dashboard & DPR
  async getProjectDashboard(projectId: string) {
    const scopes = await this.scopeRepo.find({
      where: { projectId },
      relations: ['dailyUpdates', 'snagItems'],
    });

    const overallProgress = await this.recalculateProjectProgress(projectId);

    const scopeSummary = {
      total: scopes.length,
      completed: scopes.filter((s) => s.status === ScopeStatus.COMPLETED).length,
      inProgress: scopes.filter((s) => s.status === ScopeStatus.IN_PROGRESS).length,
      blocked: scopes.filter((s) => s.status === ScopeStatus.BLOCKED).length,
      notStarted: scopes.filter((s) => s.status === ScopeStatus.NOT_STARTED).length,
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const todayUpdatesCount = scopes.reduce((sum, s) => {
      return (
        sum +
        (s.dailyUpdates || []).filter(
          (u) => u.updateDate.toISOString().split('T')[0] === todayStr,
        ).length
      );
    }, 0);

    const openSnags = scopes.reduce(
      (sum, s) => sum + (s.snagItems || []).filter((sn) => sn.status !== SnagStatus.RESOLVED).length,
      0,
    );

    // Trend data: group by date per scope
    const datesSet = new Set<string>();
    const perScope: Record<string, number[]> = {};

    for (const scope of scopes) {
      const updates = [...(scope.dailyUpdates || [])].sort(
        (a, b) => a.updateDate.getTime() - b.updateDate.getTime(),
      );
      const map = new Map<string, number>();
      for (const u of updates) {
        const d = u.updateDate.toISOString().split('T')[0];
        datesSet.add(d);
        map.set(d, u.cumulativeProgress);
      }
      perScope[scope.id] = []; // will be filled after dates array built
      (perScope as any)[`${scope.id}__map`] = map;
    }

    const dates = Array.from(datesSet).sort();
    for (const scope of scopes) {
      const map: Map<string, number> = (perScope as any)[`${scope.id}__map`];
      perScope[scope.id] = dates.map((d) => map.get(d) ?? 0);
      delete (perScope as any)[`${scope.id}__map`];
    }

    const scopesMapped = scopes.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      name: s.customName || s.template?.name,
      status: s.status,
      overallProgress: s.overallProgress,
      weightage: s.weightage,
    }));

    return {
      overallProgress,
      scopeSummary,
      todayUpdatesCount,
      openSnags,
      scopes: scopesMapped,
      trendData: {
        dates,
        perScope,
      },
    };
  }

  async getDprHistory(projectId: string) {
    return this.dprRepo.find({
      where: { projectId },
      order: { reportDate: 'DESC' },
    });
  }

  async generateDpr(projectId: string, date: string | Date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dashboard = await this.getProjectDashboard(projectId);

    const dpr = this.dprRepo.create({
      projectId,
      reportDate: new Date(d.toISOString().split('T')[0]),
      reportData: dashboard,
      pdfS3Url: null,
      sentToCustomer: false,
      sentAt: null,
    });
    return this.dprRepo.save(dpr);
  }
}

