import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchLegalService as BranchLegalServiceEntity } from './entities/branch-legal-service.entity';
import {
  CreateBranchLegalServiceDto,
  UpdateBranchLegalServiceDto,
} from '../branch/dto/branch-legal-service.dto';
import { BranchService } from '../branch/branch.service';

type RequestUser = {
  id: string;
  activeBranchId?: string;
  branchMembership?: { branchId: string; isBranchHead?: boolean };
};

@Injectable()
export class BranchLegalServiceService {
  constructor(
    @InjectRepository(BranchLegalServiceEntity)
    private readonly repo: Repository<BranchLegalServiceEntity>,
    private readonly branchService: BranchService,
  ) {}

  /**
   * List legal services for a branch. Optional activeOnly for public listing.
   */
  async findAllByBranch(
    branchId: string,
    activeOnly = false,
    actor?: RequestUser,
  ): Promise<BranchLegalServiceEntity[]> {
    if (actor) {
      await (this.branchService as any).ensureUserCanManageBranch(branchId, actor);
    }
    const qb = this.repo
      .createQueryBuilder('ls')
      .where('ls.branchId = :branchId', { branchId })
      .orderBy('ls.sortOrder', 'ASC')
      .addOrderBy('ls.createdAt', 'ASC');
    if (activeOnly) {
      qb.andWhere('ls.isActive = :active', { active: true });
    }
    return qb.getMany();
  }

  /**
   * Public listing: active legal services for a branch (no auth required for read).
   * Use this for the legal services page when showing offerings by branch.
   */
  async findActiveByBranch(
    branchId: string,
  ): Promise<BranchLegalServiceEntity[]> {
    return this.repo.find({
      where: { branchId, isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, branchId: string): Promise<BranchLegalServiceEntity> {
    const item = await this.repo.findOne({
      where: { id, branchId },
    });
    if (!item) {
      throw new NotFoundException('Legal service not found');
    }
    return item;
  }

  async create(
    branchId: string,
    dto: CreateBranchLegalServiceDto,
    actor?: RequestUser,
  ): Promise<BranchLegalServiceEntity> {
    if (actor) {
      await (this.branchService as any).ensureUserCanManageBranch(branchId, actor);
    }
    const entity = this.repo.create({
      branchId,
      title: dto.title,
      kind: dto.kind,
      features: dto.features ?? [],
      price: String(Number(dto.price).toFixed(2)),
      originalPrice: dto.originalPrice != null ? String(Number(dto.originalPrice).toFixed(2)) : null,
      gstPercent: dto.gstPercent != null ? String(Number(dto.gstPercent).toFixed(2)) : '18',
      gstInclusive: dto.gstInclusive ?? true,
      buttonText: dto.buttonText ?? 'Book Now',
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      imageUrls: dto.imageUrls ?? [],
      couponCode: dto.couponCode ?? null,
      discountType: dto.discountType ?? null,
      discountValue: dto.discountValue != null ? String(Number(dto.discountValue).toFixed(2)) : null,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
      validTo: dto.validTo ? new Date(dto.validTo) : null,
      createdById: actor?.id ?? null,
      updatedById: actor?.id ?? null,
    });
    return this.repo.save(entity);
  }

  async update(
    id: string,
    branchId: string,
    dto: UpdateBranchLegalServiceDto,
    actor?: RequestUser,
  ): Promise<BranchLegalServiceEntity> {
    if (actor) {
      await (this.branchService as any).ensureUserCanManageBranch(branchId, actor);
    }
    const item = await this.findOne(id, branchId);
    if (dto.title !== undefined) item.title = dto.title;
    if (dto.kind !== undefined) item.kind = dto.kind;
    if (dto.features !== undefined) item.features = dto.features;
    if (dto.price !== undefined) item.price = String(Number(dto.price).toFixed(2));
    if (dto.originalPrice !== undefined) {
      item.originalPrice = dto.originalPrice == null ? null : String(Number(dto.originalPrice).toFixed(2));
    }
    if (dto.gstPercent !== undefined) item.gstPercent = String(Number(dto.gstPercent).toFixed(2));
    if (dto.gstInclusive !== undefined) item.gstInclusive = dto.gstInclusive;
    if (dto.buttonText !== undefined) item.buttonText = dto.buttonText;
    if (dto.sortOrder !== undefined) item.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) item.isActive = dto.isActive;
    if (dto.imageUrls !== undefined) item.imageUrls = dto.imageUrls;
    if (dto.couponCode !== undefined) item.couponCode = dto.couponCode || null;
    if (dto.discountType !== undefined) item.discountType = dto.discountType || null;
    if (dto.discountValue !== undefined) {
      item.discountValue = dto.discountValue == null ? null : String(Number(dto.discountValue).toFixed(2));
    }
    if (dto.validFrom !== undefined) item.validFrom = dto.validFrom ? new Date(dto.validFrom) : null;
    if (dto.validTo !== undefined) item.validTo = dto.validTo ? new Date(dto.validTo) : null;
    item.updatedById = actor?.id ?? item.updatedById ?? null;
    return this.repo.save(item);
  }

  async remove(id: string, branchId: string, actor?: RequestUser): Promise<void> {
    if (actor) {
      await (this.branchService as any).ensureUserCanManageBranch(branchId, actor);
    }
    const item = await this.findOne(id, branchId);
    await this.repo.remove(item);
  }
}
