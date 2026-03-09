import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyPremiumPlan, PropertyPremiumPlanType } from './entities/property-premium-plan.entity';
import { CreatePropertyPremiumPlanDto } from './dto/create-plan.dto';
import { UpdatePropertyPremiumPlanDto } from './dto/update-plan.dto';
import { ApplyFreePromotionDto } from './dto/apply-free-promotion.dto';
import { PropertyService } from '../property/property.service';
import { PromotionTypeEnum } from '../company-onboarding/Enum/company.enum';

@Injectable()
export class PropertyPremiumPlansService implements OnModuleInit {
  constructor(
    @InjectRepository(PropertyPremiumPlan)
    private readonly planRepo: Repository<PropertyPremiumPlan>,
    private readonly propertyService: PropertyService,
  ) {}

  async onModuleInit() {
    const count = await this.planRepo.count();
    if (count > 0) return;
    await this.planRepo.save([
      this.planRepo.create({
        slug: 'featured-7-days',
        name: 'Featured – 7 days',
        planType: PropertyPremiumPlanType.FEATURED,
        promotionType: 'Featured',
        price: '499.00',
        durationDays: 7,
        description: 'Get your listing featured for 7 days.',
        isActive: true,
      }),
      this.planRepo.create({
        slug: 'featured-30-days',
        name: 'Featured – 30 days',
        planType: PropertyPremiumPlanType.FEATURED,
        promotionType: 'Featured',
        price: '1499.00',
        durationDays: 30,
        description: 'Get your listing featured for 30 days.',
        isActive: true,
      }),
      this.planRepo.create({
        slug: 'sponsored-30-days',
        name: 'Sponsored – 30 days',
        planType: PropertyPremiumPlanType.SPONSORED,
        promotionType: 'Sponsored',
        price: '2499.00',
        durationDays: 30,
        description: 'Sponsored listing for 30 days.',
        isActive: true,
      }),
    ]);
  }

  async findAllActive(): Promise<PropertyPremiumPlan[]> {
    return this.planRepo.find({
      where: { isActive: true },
      order: { price: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<PropertyPremiumPlan | null> {
    return this.planRepo.findOne({
      where: { id, isActive: true },
    });
  }

  async findBySlug(slug: string): Promise<PropertyPremiumPlan | null> {
    return this.planRepo.findOne({
      where: { slug, isActive: true },
    });
  }

  /** Admin: get plan by id or slug (active or inactive) */
  async findOneByIdOrSlug(planId?: string, planSlug?: string): Promise<PropertyPremiumPlan | null> {
    if (planId) {
      const byId = await this.planRepo.findOne({ where: { id: planId } });
      if (byId) return byId;
    }
    if (planSlug) {
      return this.planRepo.findOne({ where: { slug: planSlug } });
    }
    return null;
  }

  /**
   * Admin-only: apply a premium plan to a property without payment (e.g. collabs, partnerships).
   * Updates property promotionType, promotionExpiry, and optional promotionTags.
   */
  async applyFreePromotionToProperty(
    dto: ApplyFreePromotionDto,
    adminUserId: string,
  ): Promise<{ propertyId: string; promotionType: string[]; promotionExpiry: Date }> {
    if (!dto.planId && !dto.planSlug) {
      throw new BadRequestException('Provide either planId or planSlug');
    }
    const plan = await this.findOneByIdOrSlug(dto.planId, dto.planSlug);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    const durationDays = dto.durationDays ?? plan.durationDays;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);
    const promotionType = plan.promotionType as PromotionTypeEnum;
    await this.propertyService.updatePromotionType(
      dto.propertyId,
      [promotionType],
      expiry,
      adminUserId,
      adminUserId,
      dto.promotionTags,
    );
    return {
      propertyId: dto.propertyId,
      promotionType: [promotionType],
      promotionExpiry: expiry,
    };
  }

  /** Admin: create a new plan */
  async create(dto: CreatePropertyPremiumPlanDto): Promise<PropertyPremiumPlan> {
    const existing = await this.planRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException(`Plan with slug "${dto.slug}" already exists`);

    const plan = this.planRepo.create({
      slug: dto.slug,
      name: dto.name,
      planType: dto.planType ?? PropertyPremiumPlanType.FEATURED,
      promotionType: dto.promotionType,
      price: String(Number(dto.price).toFixed(2)),
      durationDays: dto.durationDays ?? 30,
      description: dto.description,
      isActive: dto.isActive ?? true,
      meta: dto.meta,
    });
    return this.planRepo.save(plan);
  }

  /** Admin: update plan (by id, any active/inactive) */
  async update(id: string, dto: UpdatePropertyPremiumPlanDto): Promise<PropertyPremiumPlan> {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    if (dto.slug !== undefined) {
      const existing = await this.planRepo.findOne({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new BadRequestException(`Plan with slug "${dto.slug}" already exists`);
      }
      plan.slug = dto.slug;
    }
    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.planType !== undefined) plan.planType = dto.planType;
    if (dto.promotionType !== undefined) plan.promotionType = dto.promotionType;
    if (dto.price !== undefined) plan.price = String(Number(dto.price).toFixed(2));
    if (dto.durationDays !== undefined) plan.durationDays = dto.durationDays;
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.isActive !== undefined) plan.isActive = dto.isActive;
    if (dto.meta !== undefined) plan.meta = { ...plan.meta, ...dto.meta };

    return this.planRepo.save(plan);
  }

  /** Admin: list all plans (active + inactive) */
  async findAll(): Promise<PropertyPremiumPlan[]> {
    return this.planRepo.find({
      order: { price: 'ASC', name: 'ASC' },
    });
  }
}
