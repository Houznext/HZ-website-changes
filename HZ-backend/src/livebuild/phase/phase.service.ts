import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomBuilder } from '../entities/custom-builder.entity';
import { DailyProgress } from '../daily-progress/entities/daily-progress.entity';
import {
  AutoGeneratePhasesDto,
  CreatePhaseDto,
  UpdatePhaseDto,
} from './dto/phase.dto';
import { Phase } from './entities/phase.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepo: Repository<Phase>,
    @InjectRepository(CustomBuilder)
    private cbRepo: Repository<CustomBuilder>,
    @InjectRepository(DailyProgress)
    private logRepo: Repository<DailyProgress>,
  ) {}

  async list(cbId: string) {
    return this.phaseRepo.find({
      where: { customBuilder: { id: cbId } },
      order: { order: 'ASC' },
    });
  }

  async create(cbId: string, dto: CreatePhaseDto) {
    const cb = await this.cbRepo.findOne({ where: { id: cbId } });
    if (!cb) throw new NotFoundException('CustomBuilder not found');

    const phase = this.phaseRepo.create({ ...dto, customBuilder: cb });
    return this.phaseRepo.save(phase);
  }

 
 

async bulkReplace(cbId: string, dtos: CreatePhaseDto[]) {
  if (!dtos.length) {
    throw new BadRequestException('Body must be a non-empty array of phases');
  }

  const cb = await this.cbRepo.findOne({ where: { id: cbId }, relations: ['phases'] });
  if (!cb) throw new NotFoundException('CustomBuilder not found');

  if (cb.phases?.length) {
    await this.phaseRepo.remove(cb.phases);
  }

  const entities = this.phaseRepo.create(dtos.map(dto => ({
    ...dto,
    customBuilder: cb,
  })));

  await this.phaseRepo.save(entities);

  return this.list(cbId);
}



  async update(phaseId: number, dto: UpdatePhaseDto) {
    const phase = await this.phaseRepo.findOne({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Phase not found');
    Object.assign(phase, dto);
    return this.phaseRepo.save(phase);
  }

  async remove(phaseId: number) {
    const phase = await this.phaseRepo.findOne({ where: { id: phaseId } });
    if (!phase) throw new NotFoundException('Phase not found');
    await this.phaseRepo.remove(phase);
    return { success: true };
  }

  // ---- Auto generation ----
  private ResidentialBuckets: Record<string, string[]> = {
    Documentation: ['document_drafting'],
    Foundation: ['borewells', 'brick_masonry', 'centring'],
    Structure: ['brick_masonry', 'centring'],
    Services: ['electricity', 'plumbing'],
    Finishes: ['painting', 'flooring', 'fall_ceiling'],
    Interiors: ['interior_service'],
  };

  private CommercialBuckets: Record<string, string[]> = {
    Documentation: ['document_drafting'],
    Foundation: ['borewells', 'centring'],
    Structure: ['brick_masonry', 'centring'],
    'MEP & Services': ['hvac', 'fire_safety', 'elevator', 'electricity', 'plumbing'],
    'Envelope & Facade': ['glazing_facade', 'painting'],
    Infrastructure: ['parking_infra', 'borewells'],
    'Signage & Finishing': ['signage', 'flooring', 'fall_ceiling', 'interior_service'],
  };

  async autoGenerate(cbId: string, body: AutoGeneratePhasesDto) {
    const cb = await this.cbRepo.findOne({
      where: { id: cbId },
      relations: ['servicesRequired', 'propertyInformation'],
    });
    if (!cb) throw new NotFoundException('CustomBuilder not found');

    const estimates: Record<
      string,
      { estimatedDays: number; estimatedCost?: number }
    > = cb.servicesRequired?.serviceEstimates || {};

    const isCommercial =
      cb.propertyInformation?.construction_type === 'Commercial';
    const buckets = isCommercial
      ? this.CommercialBuckets
      : this.ResidentialBuckets;

    let phases: CreatePhaseDto[] = [];

    if (body.mode === 'weighted') {
      const entries = Object.entries(buckets);
      let order = 1;
      for (const [name, services] of entries) {
        const uniqueServices = [...new Set(services)];
        const plannedDays = uniqueServices.reduce(
          (s, srv) => s + (estimates[srv]?.estimatedDays || 0),
          0,
        );
        const plannedCost = uniqueServices.reduce(
          (s, srv) => s + (estimates[srv]?.estimatedCost || 0),
          0,
        );
        if (plannedDays > 0 || plannedCost > 0 || uniqueServices.length > 0) {
          phases.push({ order: order++, name, plannedDays, plannedCost });
        }
      }
      if (!phases.length) {
        const totalDays = Object.values(estimates).reduce(
          (s, e) => s + (e?.estimatedDays || 0),
          0,
        );
        const totalCost = Object.values(estimates).reduce(
          (s, e) => s + (e?.estimatedCost || 0),
          0,
        );
        phases = [
          {
            order: 1,
            name: 'Overall',
            plannedDays: totalDays,
            plannedCost: totalCost,
          },
        ];
      }
    } else {
      const names = body.names?.length
        ? body.names
        : ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'];
      const totalDays = Object.values(estimates).reduce(
        (s, e) => s + (e?.estimatedDays || 0),
        0,
      );
      const base = Math.floor(totalDays / names.length);
      let rem = totalDays % names.length;
      phases = names.map((name, i) => ({
        order: i + 1,
        name,
        plannedDays: base + (rem-- > 0 ? 1 : 0),
        plannedCost: null,
      }));
    }

    return this.bulkReplace(cbId, phases);
  }

  // Recompute actuals after any log change
  async recompute(cbId: string) {
    const phases = await this.phaseRepo.find({
      where: { customBuilder: { id: cbId } },
    });
    for (const p of phases) {
      const logs = await this.logRepo.find({ where: { phaseId: p.id } });
      const uniqueDays = new Set<number>();
      let cost = 0;
      for (const l of logs) {
        if (l.day) uniqueDays.add(l.day);
        if (l.expensesIncurred) cost += Number(l.expensesIncurred);
      }
      await this.phaseRepo.update(p.id, {
        actualDays: uniqueDays.size,
        actualCost: cost,
      });
    }
    return this.list(cbId);
  }

  async inferPhaseIdFromWorkType(
    cbId: string,
    workType?: string | string[] | null,
  ) {
    const wt = Array.isArray(workType) ? workType[0] : workType;
    if (!wt) return null;
    const phases = await this.list(cbId);

    const findPhase = (name: string) =>
      phases.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))
        ?.id ?? null;

    if (['document_drafting'].includes(wt))
      return findPhase('Documentation') ?? findPhase('Handover');
    if (['borewells', 'brickMasonry', 'brick_masonry', 'centring'].includes(wt))
      return findPhase('Foundation') ?? findPhase('Structure');
    if (['plumbing', 'electricity'].includes(wt))
      return findPhase('MEP') ?? findPhase('Services');
    if (['hvac', 'fire_safety', 'elevator'].includes(wt))
      return findPhase('MEP');
    if (['glazing_facade'].includes(wt))
      return findPhase('Envelope') ?? findPhase('Finishes');
    if (['parking_infra'].includes(wt))
      return findPhase('Infrastructure') ?? findPhase('Foundation');
    if (['signage'].includes(wt))
      return findPhase('Signage') ?? findPhase('Finishes');
    if (['flooring', 'painting', 'fallCeiling', 'fall_ceiling', 'interior_service'].includes(wt))
      return findPhase('Finishes') ?? findPhase('Signage');
    return phases[0]?.id ?? null;
  }
}
