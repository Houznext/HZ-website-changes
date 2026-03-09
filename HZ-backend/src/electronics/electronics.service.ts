import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateElectronicsDto,
  ReturnElectronicsDto,
  UpdateElectronicsDto,
} from './dto/electronics.dto';
import { Electronics } from './entities/electronics.entity';
import { ElectronicsVariant } from './entities/electronics-variant.entity';
import { ElectronicsImage } from './entities/electronics-image.entity';
import { ElectronicsCategory, SortOption } from './enum/electronics.enum';
import { Notification } from 'src/notifications/entities/notification.entity';
import { S3Service } from 'src/common/s3/s3.service';
import { Branch } from 'src/branch/entities/branch.entity';
import { SEED_ELECTRONICS, buildElectronicsDto } from './electronics-seed-data';

@Injectable()
export class ElectronicsService {
  constructor(
    @InjectRepository(Electronics)
    private readonly electronicsRepository: Repository<Electronics>,
    @InjectRepository(ElectronicsVariant)
    private readonly variantRepo: Repository<ElectronicsVariant>,
    @InjectRepository(ElectronicsImage)
    private readonly imageRepo: Repository<ElectronicsImage>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly s3Service: S3Service,
  ) {}

  private validateOffers(
    offers?: Array<{
      type?: string;
      title?: string;
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

  private computeBasePricingFromVariants(electronics: Electronics) {
    if (!electronics.variants || electronics.variants.length === 0) return;
    const activeVariants = electronics.variants.filter((v) => v.isActive);
    if (activeVariants.length === 0) return;
    const cheapest = activeVariants.reduce((min, v) => {
      const price = Number(v.originalPrice);
      const minPrice = Number(min.originalPrice);
      return price < minPrice ? v : min;
    });
    electronics.baseOriginalPrice = Number(cheapest.originalPrice);
    electronics.baseDiscount = Number(cheapest.discount);
  }

  private toReturnDto(e: Electronics): ReturnElectronicsDto {
    const basePrice = Number(e.baseOriginalPrice ?? 0);
    const discount = Number(e.baseDiscount ?? 0);
    const currentPrice =
      discount > 0
        ? parseFloat(
            (basePrice - basePrice * (discount / 100)).toFixed(2),
          )
        : basePrice;

    return {
      id: e.id,
      name: e.name,
      slug: e.slug,
      isFeatured: e.isFeatured,
      baseOriginalPrice: basePrice,
      baseDiscount: discount,
      currencyCode: e.currencyCode,
      taxPercentage: Number(e.taxPercentage ?? 0),
      hsnCode: e.hsnCode,
      gstInclusive: e.gstInclusive,
      offers: e.offers,
      applicableCouponCodes: e.applicableCouponCodes,
      prodDetails: e.prodDetails,
      category: e.category,
      brand: e.brand,
      modelNumber: e.modelNumber,
      warranty: e.warranty,
      energyRating: e.energyRating,
      stockAlertThreshold: e.stockAlertThreshold,
      technicalSpecifications: e.technicalSpecifications,
      deliveryTime: e.deliveryTime,
      installationRequired: e.installationRequired,
      installationGuide: e.installationGuide,
      smartFeatures: e.smartFeatures,
      powerConsumption: e.powerConsumption,
      returnPolicy: e.returnPolicy,
      isPublished: e.isPublished,
      isCODAvailable: e.isCODAvailable,
      shippingDetails: e.shippingDetails,
      metaTitle: e.metaTitle,
      metaDescription: e.metaDescription,
      searchTags: e.searchTags,
      deliveryLocations: e.deliveryLocations,
      createdDate: e.createdDate,
      updatedDate: e.updatedDate,
      createdById: e.createdById,
      updatedById: e.updatedById,
      variants:
        e.variants?.map((v) => ({
          id: v.id,
          sku: v.sku,
          color: v.color,
          sizeLabel: v.sizeLabel,
          originalPrice: Number(v.originalPrice),
          discount: Number(v.discount),
          stockQuantity: v.stockQuantity,
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
            })) ?? [],
        })) ?? [],
      images:
        e.images?.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        })) ?? [],
    } as ReturnElectronicsDto & { currentPrice?: number; originalPrice?: number; discount?: number; SKU?: string; color?: string; stockQuantity?: number; images?: string[] };
  }

  async createElectronics(
    createElectronicsDto: CreateElectronicsDto,
  ): Promise<Electronics> {
    this.validateOffers(createElectronicsDto.offers);

    const dto = { ...createElectronicsDto };
    if (!dto.slug && dto.name) {
      dto.slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const electronics = this.electronicsRepository.create({
      ...dto,
      variants: undefined,
      images: undefined,
    });

    electronics.variants = dto.variants?.map((variantDto) => {
      const { images: variantImages, ...variantFields } = variantDto;
      const variant = this.variantRepo.create(variantFields);
      if (variantImages?.length) {
        variant.images = variantImages.map((imgDto, i) =>
          this.imageRepo.create({
            ...imgDto,
            electronics,
            variant,
            sortOrder: imgDto.sortOrder ?? i,
          }),
        );
      }
      return variant;
    });

    electronics.images = dto.images?.map((imgDto, i) =>
      this.imageRepo.create({
        ...imgDto,
        sortOrder: imgDto.sortOrder ?? i,
      }),
    );

    this.computeBasePricingFromVariants(electronics);

    const saved = await this.electronicsRepository.save(electronics);

    const notification = this.notificationRepository.create({
      message: 'New Electronic Item added',
      userId: createElectronicsDto.createdById,
    });
    await this.notificationRepository.save(notification);

    return this.findOne(saved.id);
  }

  async findAll(
    categories?: string[],
    sort?: SortOption,
    minPrice?: number,
    maxPrice?: number,
    search?: string,
    discount?: number,
    page?: number,
    brand?: string[],
    installationRequired?: boolean,
    isPublished?: boolean,
    isFeatured?: boolean,
    limit?: number,
    branchId?: string,
  ): Promise<{
    data: ReturnElectronicsDto[];
    total: number;
    currentPage: number;
    totalPages: number;
    allCategories: string[];
    allColors: string[];
    maximumPrice: number;
  }> {
    const pageLimit =
      Number.isFinite(Number(limit)) && Number(limit) >= 1
        ? Math.floor(Number(limit))
        : 10;
    const pageNum =
      Number.isFinite(Number(page)) && Number(page) >= 1
        ? Math.floor(Number(page))
        : 1;
    const skip = (pageNum - 1) * pageLimit;

    const query = this.electronicsRepository
      .createQueryBuilder('electronics')
      .leftJoinAndSelect('electronics.variants', 'variant')
      .leftJoinAndSelect('variant.images', 'variantImage')
      .leftJoinAndSelect('electronics.images', 'image');

    if (branchId) {
      query.andWhere('electronics.branchId = :branchId', { branchId });
    }

    if (categories && categories.length > 0) {
      const validCategories = categories.map((category) => {
        const categoryLowerCase = category?.toLowerCase();
        const categoryEnum = Object.values(ElectronicsCategory).find(
          (value) => value.toLowerCase() === categoryLowerCase,
        );
        if (!categoryEnum) {
          throw new HttpException(
            `Invalid category: ${category}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        return categoryEnum;
      });
      query.andWhere('electronics.category IN (:...categories)', {
        categories: validCategories,
      });
    }

    const parsedMinPrice =
      minPrice !== undefined
        ? parseFloat(minPrice as unknown as string)
        : undefined;
    const parsedMaxPrice =
      maxPrice !== undefined
        ? parseFloat(maxPrice as unknown as string)
        : undefined;
    const fallbackMinPrice = !isNaN(parsedMinPrice) ? parsedMinPrice : 0;
    const fallbackMaxPrice = !isNaN(parsedMaxPrice) ? parsedMaxPrice : 1000000;

    query.andWhere(
      '(electronics.baseOriginalPrice - (electronics.baseOriginalPrice * (electronics.baseDiscount / 100))) BETWEEN :minPrice AND :maxPrice',
      { minPrice: fallbackMinPrice, maxPrice: fallbackMaxPrice },
    );

    if (search) {
      query.andWhere('LOWER(electronics.name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    const parsedDiscount =
      discount !== undefined
        ? parseFloat(discount as unknown as string)
        : undefined;
    const fallbackDiscount = !isNaN(parsedDiscount) ? parsedDiscount : 0;
    query.andWhere('electronics.baseDiscount >= :discount', {
      discount: fallbackDiscount,
    });

    if (brand && brand.length > 0) {
      query.andWhere('electronics.brand IN (:...brand)', { brand });
    }

    if (installationRequired !== undefined) {
      query.andWhere(
        'electronics.installationRequired = :installationRequired',
        { installationRequired },
      );
    }

    if (isPublished !== undefined) {
      query.andWhere('electronics.isPublished = :isPublished', {
        isPublished,
      });
    }

    if (isFeatured !== undefined) {
      query.andWhere('electronics.isFeatured = :isFeatured', { isFeatured });
    }

    if (sort) {
      switch (sort) {
        case SortOption.PRICE_ASC:
          query.orderBy('electronics.baseOriginalPrice', 'ASC');
          break;
        case SortOption.PRICE_DESC:
          query.orderBy('electronics.baseOriginalPrice', 'DESC');
          break;
        case SortOption.NEWEST:
          query.orderBy('electronics.createdDate', 'DESC');
          break;
        case SortOption.OLDEST:
          query.orderBy('electronics.createdDate', 'ASC');
          break;
        default:
          query.orderBy('electronics.createdDate', 'DESC');
      }
    } else {
      query.orderBy('electronics.createdDate', 'DESC');
    }

    query.skip(skip).take(pageLimit);

    const total = await query.getCount();
    const totalPages = Math.ceil(total / pageLimit);
    const data = await query.getMany();

    const allCategoriesQuery = await this.electronicsRepository
      .createQueryBuilder('electronics')
      .select('DISTINCT electronics.category', 'category')
      .getRawMany();
    const allCategories = allCategoriesQuery.map((row) => row.category);

    const allColorsQuery = await this.variantRepo
      .createQueryBuilder('variant')
      .select('DISTINCT variant.color', 'color')
      .where('variant.color IS NOT NULL')
      .getRawMany();
    const allColors = allColorsQuery.map((row) => row.color);

    const maxPriceQb = this.electronicsRepository.createQueryBuilder('electronics');
    if (categories && categories.length > 0) {
      const validCats = categories.map((c) => {
        const enumVal = Object.values(ElectronicsCategory).find(
          (v) => v.toLowerCase() === c?.toLowerCase(),
        );
        return enumVal;
        }).filter(Boolean);
      if (validCats.length) maxPriceQb.andWhere('electronics.category IN (:...categories)', { categories: validCats });
    }
    if (search) {
      maxPriceQb.andWhere('LOWER(electronics.name) LIKE :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }
    maxPriceQb.andWhere('electronics.baseDiscount >= :discount', {
      discount: fallbackDiscount,
    });
    const maxPriceResult = await maxPriceQb
      .select('MAX(electronics.baseOriginalPrice)', 'maxPrice')
      .getRawOne();
    const maximumPrice = parseFloat(maxPriceResult?.maxPrice || '0');

    return {
      data: data.map((e) => this.toReturnDto(e)),
      total,
      currentPage: pageNum,
      totalPages,
      allCategories,
      allColors,
      maximumPrice,
    };
  }

  async findOne(id: string): Promise<Electronics> {
    const electronics = await this.electronicsRepository.findOne({
      where: { id },
      relations: ['variants', 'variants.images', 'images'],
    });
    if (!electronics) {
      throw new NotFoundException(
        `Electronics item with id ${id} not found`,
      );
    }
    this.computeBasePricingFromVariants(electronics);
    return electronics;
  }

  async update(
    id: string,
    updateElectronicsDto: UpdateElectronicsDto,
  ): Promise<Electronics> {
    if (updateElectronicsDto.offers !== undefined) {
      this.validateOffers(updateElectronicsDto.offers);
    }

    const electronics = await this.electronicsRepository.findOne({
      where: { id },
      relations: ['variants', 'variants.images', 'images'],
    });

    if (!electronics) {
      throw new NotFoundException(
        `Electronics item with id ${id} not found`,
      );
    }

    Object.assign(electronics, updateElectronicsDto, {
      variants: undefined,
      images: undefined,
    });

    if (updateElectronicsDto.variants) {
      const existingVariants = await this.variantRepo.find({
        where: { electronics: { id: electronics.id } },
        relations: ['images'],
      });
      for (const v of existingVariants) {
        for (const img of v.images ?? []) {
          if (img.url) {
            try {
              await this.s3Service.deleteFileByUrl(img.url);
            } catch (err) {
              console.warn(
                'Failed to delete variant image from S3:',
                err,
              );
            }
          }
        }
      }
      await this.variantRepo.delete({ electronics: { id: electronics.id } });
      electronics.variants = updateElectronicsDto.variants.map((variantDto) => {
        const { images: variantImages, ...variantFields } = variantDto;
        const variant = this.variantRepo.create(variantFields);
        if (variantImages?.length) {
          variant.images = variantImages.map((imgDto, i) =>
            this.imageRepo.create({
              ...imgDto,
              electronics,
              variant,
              sortOrder: imgDto.sortOrder ?? i,
            }),
          );
        }
        return variant;
      });
    }

    if (updateElectronicsDto.images) {
      const existingImages = await this.imageRepo.find({
        where: { electronics: { id: electronics.id }, variant: null },
      });
      const productImages = existingImages.filter((img) => !img.variant);
      for (const img of productImages) {
        if (img.url) {
          try {
            await this.s3Service.deleteFileByUrl(img.url);
          } catch (err) {
            console.warn(
              'Failed to delete electronics image from S3:',
              err,
            );
          }
        }
      }
      await this.imageRepo.delete({ electronics: { id: electronics.id } });
      electronics.images = updateElectronicsDto.images.map((imgDto, i) =>
        this.imageRepo.create({
          ...imgDto,
          sortOrder: imgDto.sortOrder ?? i,
        }),
      );
    }

    this.computeBasePricingFromVariants(electronics);
    const saved = await this.electronicsRepository.save(electronics);

    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const electronics = await this.electronicsRepository.findOne({
      where: { id },
      relations: ['images', 'variants', 'variants.images'],
    });
    if (!electronics) {
      throw new NotFoundException(
        `Electronics item with id ${id} not found`,
      );
    }
    const allImages = [
      ...(electronics.images ?? []),
      ...(electronics.variants ?? []).flatMap((v) => v.images ?? []),
    ];
    for (const img of allImages) {
      if (img?.url) {
        try {
          await this.s3Service.deleteFileByUrl(img.url);
        } catch (err) {
          console.warn(
            'Failed to delete electronics image from S3:',
            err,
          );
        }
      }
    }
    const result = await this.electronicsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Electronics item with id ${id} not found`,
      );
    }
  }

  async seedElectronics(userId: string, branchId?: string): Promise<{ created: number; failed: number }> {
    if (!branchId) {
      const orgBranch = await this.electronicsRepository.manager
        .getRepository(Branch)
        .findOne({ where: { level: 'ORG' as any } });
      branchId = orgBranch?.id;
    }
    let created = 0;
    let failed = 0;
    for (let i = 0; i < SEED_ELECTRONICS.length; i++) {
      const item = SEED_ELECTRONICS[i];
      try {
        const dto = { ...buildElectronicsDto(item, userId, i), branchId } as CreateElectronicsDto;
        await this.createElectronics(dto);
        created++;
      } catch (err) {
        console.error(`[SeedElectronics] Failed "${item.name}":`, err?.message ?? err);
        failed++;
      }
    }
    return { created, failed };
  }
}
