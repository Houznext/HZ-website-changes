import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Furniture } from './entities/furniture.entity';
import { FurnitureVariant } from './entities/furniture-variant.entity';
import { FurnitureImage } from './entities/furniture-image.entity';
import {
  CreateFurnitureDto,
  FilterFurnitureDto,
  ReturnFurnitureDto,
  UpdateFurnitureDto,
} from './dto/furniture.dto';
import { Category, FurnitureStatus, PriceRange, SortOption } from './enum/furniture.enum';
import { Notification } from 'src/notifications/entities/notification.entity';
import { S3Service } from 'src/common/s3/s3.service';
import { Branch } from 'src/branch/entities/branch.entity';
import { SEED_FURNITURE, buildFurnitureDto } from './furniture-seed-data';

@Injectable()
export class FurnitureService {
  constructor(
    @InjectRepository(Furniture)
    private readonly furnitureRepo: Repository<Furniture>,
    @InjectRepository(FurnitureVariant)
    private readonly variantRepo: Repository<FurnitureVariant>,
    @InjectRepository(FurnitureImage)
    private readonly imageRepo: Repository<FurnitureImage>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly s3Service: S3Service,
  ) {}

  private validateOffers(
    offers?: Array<{
      type: string;
      title: string;
      validFrom?: string;
      validTo?: string;
    }>,
  ): void {
    if (!offers || offers.length === 0) return;
    for (let i = 0; i < offers.length; i++) {
      const o = offers[i];
      if (o.validFrom && o.validTo) {
        const from = new Date(o.validFrom).getTime();
        const to = new Date(o.validTo).getTime();
        if (Number.isNaN(from) || Number.isNaN(to)) {
          throw new BadRequestException(
            `Offer at index ${i}: validFrom and validTo must be valid ISO dates`,
          );
        }
        if (to < from) {
          throw new BadRequestException(
            `Offer at index ${i}: validTo must be on or after validFrom`,
          );
        }
      }
    }
  }

  private computeBasePricingFromVariants(furniture: Furniture) {
    if (!furniture.variants || furniture.variants.length === 0) return;

    const activeVariants = furniture.variants.filter((v) => v.isActive);
    if (activeVariants.length === 0) return;

    const cheapest = activeVariants.reduce((min, v) =>
      v.sellingPrice < min.sellingPrice ? v : min,
    );

    furniture.baseMrp = Number(cheapest.mrp);
    furniture.baseSellingPrice = Number(cheapest.sellingPrice);
    furniture.baseDiscountPercent =
      cheapest.mrp > 0
        ? Number(
            (
              ((cheapest.mrp - cheapest.sellingPrice) / cheapest.mrp) *
              100
            ).toFixed(2),
          )
        : 0;
  }

  async createFurniture(
    dto: CreateFurnitureDto,
    currentUserId?: string,
  ): Promise<ReturnFurnitureDto> {
    this.validateOffers(dto.offers);

    const furniture = this.furnitureRepo.create({
      ...dto,
      createdById: currentUserId,
      updatedById: currentUserId,
    });

    // cascade create variants & variant images
    furniture.variants = dto.variants?.map((variantDto) => {
      const { images: variantImages, ...variantFields } = variantDto;
      const variant = this.variantRepo.create(variantFields);
      if (variantImages?.length) {
        variant.images = variantImages.map((imgDto, i) =>
          this.imageRepo.create({
            ...imgDto,
            furniture,
            variant,
            sortOrder: imgDto.sortOrder ?? i,
          }),
        );
      }
      return variant;
    });

    furniture.images = dto.images?.map((imgDto, i) =>
      this.imageRepo.create({
        ...imgDto,
        sortOrder: imgDto.sortOrder ?? i,
      }),
    );

    this.computeBasePricingFromVariants(furniture);

    const saved = await this.furnitureRepo.save(furniture);

    // Notification to you or ops team – replace with your adminId / branch logic
    if (currentUserId) {
      const notification = this.notificationRepo.create({
        message: `New furniture added: ${saved.name}`,
        userId: currentUserId,
      });
      await this.notificationRepo.save(notification);
    }

    const full = await this.findOne(saved.id);
    return full;
  }

  private applyPriceRangeFilter(
    qb: SelectQueryBuilder<Furniture>,
    priceRange: PriceRange,
  ) {
    switch (priceRange) {
      case PriceRange.Under20000:
        qb.andWhere('variant.sellingPrice < :max', { max: 20000 });
        break;
      case PriceRange.Between20000And29999:
        qb.andWhere('variant.sellingPrice BETWEEN :min AND :max', {
          min: 20000,
          max: 29999,
        });
        break;
      case PriceRange.Between30000And39999:
        qb.andWhere('variant.sellingPrice BETWEEN :min AND :max', {
          min: 30000,
          max: 39999,
        });
        break;
      case PriceRange.Between40000And49999:
        qb.andWhere('variant.sellingPrice BETWEEN :min AND :max', {
          min: 40000,
          max: 49999,
        });
        break;
      case PriceRange.Above50000:
        qb.andWhere('variant.sellingPrice > :min', { min: 50000 });
        break;
    }
  }

  async findAll(
    filter: FilterFurnitureDto,
  ): Promise<{
    data: ReturnFurnitureDto[];
    total: number;
    currentPage: number;
    totalPages: number;
    stats: {
      totalProducts: number;
      totalStock: number;
      activeProducts: number;
      outOfStock: number;
      featuredCount: number;
      avgPrice: number;
    };
  }> {
    const {
      category,
      brand,
      priceRange,
      subCategory,
      color,
      material,
      sort,
      q,
      page = 1,
      limit = 20,
      branchId,
    } = filter;

    const pageLimit =
      Number.isFinite(Number(limit)) && Number(limit) >= 1
        ? Math.floor(Number(limit))
        : 20;
    const pageNum =
      Number.isFinite(Number(page)) && Number(page) >= 1
        ? Math.floor(Number(page))
        : 1;

    const qb = this.furnitureRepo
      .createQueryBuilder('furniture')
      .leftJoinAndSelect('furniture.variants', 'variant')
      .leftJoinAndSelect('variant.images', 'variantImage')
      .leftJoinAndSelect('furniture.images', 'image')
      .where('furniture.status != :draft', { draft: 'draft' });

    if (branchId) {
      qb.andWhere('furniture.branchId = :branchId', { branchId });
    }

    if (category) {
      const catEnum = Object.values(Category).find(
        (value) => value === category,
      );
      if (!catEnum) {
        throw new BadRequestException(`Invalid category: ${category}`);
      }
      qb.andWhere('furniture.category = :category', { category: catEnum });
    }
    if (subCategory) {
    qb.andWhere('furniture.subCategory = :subCategory', {
      subCategory,
    });
  }

    if (brand) {
      qb.andWhere('LOWER(furniture.brand) = LOWER(:brand)', { brand });
    }

    if (q) {
      qb.andWhere(
        '(LOWER(furniture.name) LIKE LOWER(:q) OR LOWER(furniture.description) LIKE LOWER(:q))',
        { q: `%${q}%` },
      );
    }

    if (priceRange) {
      this.applyPriceRangeFilter(qb, priceRange);
    }

    if (color) {
      qb.andWhere(
        '(LOWER(variant.colorName) = LOWER(:color) OR LOWER(variant.colorHex) = LOWER(:color))',
        { color },
      );
    }

    if (material) {
      qb.andWhere('LOWER(variant.material) = LOWER(:material)', { material });
    }

    switch (sort) {
      case SortOption.Popularity:
        qb.orderBy('furniture.ratingCount', 'DESC');
        break;
      case SortOption.Latest:
        qb.orderBy('furniture.createdDate', 'DESC');
        break;
      case SortOption.PriceLowHigh:
        qb.orderBy('variant.sellingPrice', 'ASC');
        break;
      case SortOption.PriceHighLow:
        qb.orderBy('variant.sellingPrice', 'DESC');
        break;
      default:
        qb.orderBy('furniture.id', 'DESC');
    }

    qb.skip((pageNum - 1) * pageLimit).take(pageLimit);

    const [list, total] = await qb.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(total / pageLimit));

    // Global stats (ignores pagination)
    const statsQb = this.furnitureRepo
      .createQueryBuilder('furniture')
      .leftJoin('furniture.variants', 'variant')
      .where('furniture.status != :draft', { draft: 'draft' });

    if (branchId) {
      statsQb.andWhere('furniture.branchId = :branchId', { branchId });
    }

    if (category) {
      const catEnum = Object.values(Category).find(
        (value) => value === category,
      );
      if (!catEnum) {
        throw new BadRequestException(`Invalid category: ${category}`);
      }
      statsQb.andWhere('furniture.category = :category', { category: catEnum });
    }
    if (subCategory) {
      statsQb.andWhere('furniture.subCategory = :subCategory', {
        subCategory,
      });
    }

    if (brand) {
      statsQb.andWhere('LOWER(furniture.brand) = LOWER(:brand)', { brand });
    }

    if (q) {
      statsQb.andWhere(
        '(LOWER(furniture.name) LIKE LOWER(:q) OR LOWER(furniture.description) LIKE LOWER(:q))',
        { q: `%${q}%` },
      );
    }

    if (priceRange) {
      this.applyPriceRangeFilter(statsQb, priceRange);
    }

    if (color) {
      statsQb.andWhere(
        '(LOWER(variant.colorName) = LOWER(:color) OR LOWER(variant.colorHex) = LOWER(:color))',
        { color },
      );
    }

    if (material) {
      statsQb.andWhere('LOWER(variant.material) = LOWER(:material)', {
        material,
      });
    }

    const rawStats = await statsQb
      .select([
        'COUNT(DISTINCT furniture.id) AS totalProducts',
        'SUM(CASE WHEN furniture.status = :active THEN 1 ELSE 0 END) AS activeProducts',
        'SUM(CASE WHEN furniture.status = :outOfStock THEN 1 ELSE 0 END) AS outOfStock',
        'SUM(CASE WHEN furniture."isFeatured" = true THEN 1 ELSE 0 END) AS featuredCount',
        'COALESCE(SUM(variant."stockQty"), 0) AS totalStock',
        'COALESCE(AVG(furniture."baseSellingPrice"), 0) AS avgPrice',
      ])
      .setParameters({
        active: FurnitureStatus.ACTIVE,
        outOfStock: FurnitureStatus.OUT_OF_STOCK,
      })
      .getRawOne();

    console.log('[FurnitureService] findAll', {
      filter,
      count: list.length,
      total,
      page: pageNum,
      limit: pageLimit,
    });

    return {
      data: list.map((f) => this.toReturnDto(f)),
      total,
      currentPage: pageNum,
      totalPages,
      stats: {
        totalProducts: Number(
          rawStats?.totalProducts ?? rawStats?.totalproducts ?? total,
        ),
        totalStock: Number(
          rawStats?.totalStock ?? rawStats?.totalstock ?? 0,
        ),
        activeProducts: Number(
          rawStats?.activeProducts ?? rawStats?.activeproducts ?? 0,
        ),
        outOfStock: Number(
          rawStats?.outOfStock ?? rawStats?.outofstock ?? 0,
        ),
        featuredCount: Number(
          rawStats?.featuredCount ?? rawStats?.featuredcount ?? 0,
        ),
        avgPrice: Number(
          rawStats?.avgPrice ?? rawStats?.avgprice ?? 0,
        ),
      },
    };
  }

  async findOne(id: string): Promise<ReturnFurnitureDto> {
    const furniture = await this.furnitureRepo.findOne({
      where: { id },
      relations: ['variants', 'variants.images', 'images'],
    });

    if (!furniture) {
      throw new NotFoundException('Furniture not found');
    }

    this.computeBasePricingFromVariants(furniture);

    return this.toReturnDto(furniture);
  }

  async update(
    id: string,
    dto: UpdateFurnitureDto,
    currentUserId?: string,
  ): Promise<ReturnFurnitureDto> {
    if (dto.offers !== undefined) {
      this.validateOffers(dto.offers);
    }

    const furniture = await this.furnitureRepo.findOne({
      where: { id },
      relations: ['variants', 'images'],
    });

    if (!furniture) {
      throw new NotFoundException('Furniture not found');
    }

    // Basic fields
    Object.assign(furniture, dto, { updatedById: currentUserId });

    // Variants – replace with variant-level images
    if (dto.variants) {
      const existingVariants = await this.variantRepo.find({
        where: { furniture: { id: furniture.id } },
        relations: ['images'],
      });
      for (const v of existingVariants) {
        for (const img of v.images ?? []) {
          if (img.url) {
            try {
              await this.s3Service.deleteFileByUrl(img.url);
            } catch (err) {
              console.warn('Failed to delete variant image from S3:', err);
            }
          }
        }
      }
      await this.variantRepo.delete({ furniture: { id: furniture.id } });
      furniture.variants = dto.variants.map((variantDto) => {
        const { images: variantImages, ...variantFields } = variantDto;
        const variant = this.variantRepo.create(variantFields);
        if (variantImages?.length) {
          variant.images = variantImages.map((imgDto, i) =>
            this.imageRepo.create({
              ...imgDto,
              furniture,
              variant,
              sortOrder: imgDto.sortOrder ?? i,
            }),
          );
        }
        return variant;
      });
    }

    // Images – delete old files from S3 before replacing
    if (dto.images) {
      const existingImages = await this.imageRepo.find({
        where: { furniture: { id: furniture.id } },
      });
      for (const img of existingImages) {
        if (img.url) {
          try {
            await this.s3Service.deleteFileByUrl(img.url);
          } catch (err) {
            console.warn('Failed to delete furniture image from S3:', err);
          }
        }
      }
      await this.imageRepo.delete({ furniture: { id: furniture.id } });
      furniture.images = dto.images.map((imgDto) =>
        this.imageRepo.create({ ...imgDto }),
      );
    }

    this.computeBasePricingFromVariants(furniture);

    const saved = await this.furnitureRepo.save(furniture);
    return this.toReturnDto(saved);
  }

  async remove(id: string): Promise<void> {
    const furniture = await this.furnitureRepo.findOne({
      where: { id },
      relations: ['images', 'variants', 'variants.images'],
    });
    if (!furniture) {
      throw new NotFoundException('Furniture not found');
    }
    const allImages = [
      ...(furniture.images ?? []),
      ...(furniture.variants ?? []).flatMap((v) => v.images ?? []),
    ];
    for (const img of allImages) {
      if (img?.url) {
        try {
          await this.s3Service.deleteFileByUrl(img.url);
        } catch (err) {
          console.warn('Failed to delete furniture image from S3:', err);
        }
      }
    }
    const res = await this.furnitureRepo.delete(id);
    if (!res.affected) {
      throw new NotFoundException('Furniture not found');
    }
  }

  private toReturnDto(f: Furniture): ReturnFurnitureDto {
    return {
      id: f.id,
      name: f.name,
      slug: f.slug,
      category: f.category,
      subCategory: f.subCategory,
      description: f.description,
      highlights: f.highlights,
      brand: f.brand,
      tags: f.tags,
      baseMrp: Number(f.baseMrp ?? 0),
      baseSellingPrice: Number(f.baseSellingPrice ?? 0),
      baseDiscountPercent: Number(f.baseDiscountPercent ?? 0),
      ratingCount: f.ratingCount,
      averageRating: Number(f.averageRating ?? 0),
      status: f.status,
      isFeatured: f.isFeatured,
      isCustomizable: f.isCustomizable,
      customizationDescription: f.customizationDescription,
      deliveryTime: f.deliveryTime,
      warranty: f.warranty,
      assembly: f.assembly,
      returnPolicy: f.returnPolicy,
      offers: f.offers,
      applicableCouponCodes: f.applicableCouponCodes,
      otherProperties: f.otherProperties,
      sellerId: f.sellerId,
      createdDate: f.createdDate,
      updatedDate: f.updatedDate,
      variants:
        f.variants?.map((v) => ({
          id: v.id,
          sku: v.sku,
          colorName: v.colorName,
          colorHex: v.colorHex,
          material: v.material,
          finish: v.finish,
          sizeLabel: v.sizeLabel,
          widthCm: v.widthCm,
          depthCm: v.depthCm,
          heightCm: v.heightCm,
          weightKg: v.weightKg,
          maxLoadKg: v.maxLoadKg,
          stockQty: v.stockQty,
          reservedQty: v.reservedQty,
          mrp: Number(v.mrp),
          sellingPrice: Number(v.sellingPrice),
          discountPercent: Number(v.discountPercent),
          isDefault: v.isDefault,
          isActive: v.isActive,
          attributes: v.attributes,
          images:
            v.images?.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
              colorHex: img.colorHex,
              angle: img.angle,
              viewType: img.viewType,
            })) ?? [],
        })) ?? [],
      images:
        f.images?.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
          colorHex: img.colorHex,
          angle: img.angle,
          viewType: img.viewType,
        })) ?? [],
    };
  }

  async seedFurniture(userId?: string, branchId?: string): Promise<{ created: number; failed: number }> {
    if (!branchId) {
      const orgBranch = await this.furnitureRepo.manager
        .getRepository(Branch)
        .findOne({ where: { level: 'ORG' as any } });
      branchId = orgBranch?.id;
    }
    let created = 0;
    let failed = 0;
    for (let i = 0; i < SEED_FURNITURE.length; i++) {
      const item = SEED_FURNITURE[i];
      try {
        const dto = { ...buildFurnitureDto(item, i), branchId } as CreateFurnitureDto;
        await this.createFurniture(dto, userId);
        created++;
      } catch (err) {
        console.error(`[SeedFurniture] Failed "${item.name}":`, err?.message ?? err);
        failed++;
      }
    }
    return { created, failed };
  }
}
