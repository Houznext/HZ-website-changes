import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { InfraProperty } from './entities/infra-property.entity';
import { InfraPropertyMedia } from './entities/infra-property-media.entity';
import { InfraPropertyDetails } from './entities/infra-property-details.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { JwtPayload } from '../auth/jwt.strategy';
import { ListingFor } from '../common/enums/infra.enums';
import { InfraMailService, PropertyAlertAction } from '../common/mail/infra-mail.service';
import { infraBusinessWhatsappE164 } from '../common/infra-public-contact';
import { sanitizeYoutubeVideoUrl } from '../common/youtube-url';
import {
  buildPropertySearchBlob,
  fuzzyTokenVariants,
  normalizeSearchText,
  parsePropertySearchQuery,
  scorePropertyMatch,
} from './property-search.util';

function toDec(n?: number | string | null): string | null {
  if (n === undefined || n === null || n === '') return null;
  const num = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(num)) return null;
  return String(num);
}

@Injectable()
export class PropertyService {
  private readonly log = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    @InjectRepository(InfraPropertyMedia)
    private readonly mediaRepo: Repository<InfraPropertyMedia>,
    @InjectRepository(InfraPropertyDetails)
    private readonly detailsRepo: Repository<InfraPropertyDetails>,
    private readonly mail: InfraMailService,
  ) {}

  private notifyProperty(action: PropertyAlertAction, entity: InfraProperty, actor?: JwtPayload | null): void {
    void this.mail
      .sendPropertyAlert({
        action,
        propertyId: entity.propertyId,
        propertyCode: entity.propertyCode,
        title: entity.title,
        propertyType: String(entity.propertyType),
        city: entity.city,
        locality: entity.locality,
        basePrice: entity.basePrice,
        isApproved: entity.isApproved,
        isActive: entity.isActive,
        listedBy: entity.listedBy,
        ownerName: entity.ownerName,
        ownerPhone: entity.ownerPhone,
        actorEmail: actor?.email,
        actorKind: actor?.kind,
        actorId: actor?.sub,
      })
      .catch((err) => this.log.warn(`Property alert failed: ${(err as Error).message}`));
  }

  private async generatePropertyCode(): Promise<{ code: string; seq: number }> {
    const result = await this.propRepo
      .createQueryBuilder('p')
      .select('MAX(p.propertySeq)', 'max')
      .getRawOne<{ max: string | null }>();
    const next = (parseInt(result?.max || '0', 10) || 0) + 1;
    if (next > 99999) throw new BadRequestException('Property code limit reached');
    return { code: `HZI-P${String(next).padStart(5, '0')}`, seq: next };
  }

  private generateSlug(title: string, propertyId: string): string {
    const suffix = propertyId.replace(/-/g, '').slice(0, 6);
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)
      .replace(/(^-|-$)/g, '');
    return `${base || 'property'}-${suffix}`;
  }

  private calculateTotalCost(dto: CreatePropertyDto): number {
    const base = Number(dto.basePrice) || 0;
    const gst = base * (Number(dto.gstPercent) || 5) / 100;
    const reg = base * (Number(dto.registrationPercent) || 1) / 100;
    const maint = Number(dto.maintenanceDeposit) || 0;
    const other = Number(dto.otherCharges) || 0;
    return base + gst + reg + maint + other;
  }

  private calculatePricePerUnit(dto: CreatePropertyDto): number {
    const base = Number(dto.basePrice) || 0;
    if (!base) return 0;
    const typesUseCarpet = ['Apartment', 'Villa', 'Row House', 'Studio', 'Farmhouse', 'Commercial'];
    if (typesUseCarpet.includes(String(dto.propertyType))) {
      const area = Number(dto.carpetArea) || Number(dto.builtUpArea) || 0;
      return area > 0 ? Math.round(base / area) : 0;
    }
    const area = Number(dto.plotArea) || Number(dto.landArea) || 0;
    return area > 0 ? Math.round(base / area) : 0;
  }

  private mergeImageUrls(p: InfraProperty): string[] {
    const fromCol = [...(p.photoUrls || [])].filter(Boolean);
    const fromMedia = [...(p.media || [])]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((m) => m.url)
      .filter(Boolean);
    return Array.from(new Set([...fromCol, ...fromMedia]));
  }

  /** Public-safe JSON (no owner / internal fields). */
  toPublic(p: InfraProperty): Record<string, unknown> {
    const urls = this.mergeImageUrls(p);
    const media = urls.map((url, i) => ({
      mediaId: `sync-${i}`,
      url,
      kind: 'image',
      sortOrder: i,
    }));
    return {
      propertyId: p.propertyId,
      propertyCode: p.propertyCode,
      slug: p.slug,
      title: p.title,
      propertyType: p.propertyType,
      listingFor: p.listingFor,
      constructionStatus: p.constructionStatus,
      city: p.city,
      locality: p.locality,
      address: p.address,
      pincode: p.pincode,
      latitude: p.latitude,
      longitude: p.longitude,
      bhkType: p.bhkType,
      carpetArea: p.carpetArea,
      builtUpArea: p.builtUpArea,
      superBuiltUpArea: p.superBuiltUpArea,
      plotArea: p.plotArea,
      landArea: p.landArea,
      areaUnit: p.areaUnit,
      floorNumber: p.floorNumber,
      totalFloors: p.totalFloors,
      towerName: p.towerName,
      facing: p.facing,
      parkingType: p.parkingType,
      furnishingStatus: p.furnishingStatus,
      possessionDate: p.possessionDate,
      landUseType: p.landUseType,
      approvalAuthority: p.approvalAuthority,
      approvalType: p.approvalType,
      approvalNumber: p.approvalNumber,
      surveyNumber: p.surveyNumber,
      layoutName: p.layoutName,
      roadWidth: p.roadWidth,
      zoneType: p.zoneType,
      waterSource: p.waterSource,
      electricity: p.electricity,
      plotNumber: p.plotNumber,
      isCornerPlot: p.isCornerPlot,
      isGatedLayout: p.isGatedLayout,
      hasCompoundWall: p.hasCompoundWall,
      isReadyToRegister: p.isReadyToRegister,
      hasEBConnection: p.hasEBConnection,
      hasBorewell: p.hasBorewell,
      hasDrainage: p.hasDrainage,
      isPattaAvailable: p.isPattaAvailable,
      isTitleClear: p.isTitleClear,
      isGatedCommunity: p.isGatedCommunity,
      isVastuCompliant: p.isVastuCompliant,
      hasPrivatePool: p.hasPrivatePool,
      hasGarden: p.hasGarden,
      hasSmartHome: p.hasSmartHome,
      hasEVCharging: p.hasEVCharging,
      numberOfFloors: p.numberOfFloors,
      basePrice: p.basePrice,
      pricePerUnit: p.pricePerUnit,
      gstPercent: p.gstPercent,
      registrationPercent: p.registrationPercent,
      maintenanceDeposit: p.maintenanceDeposit,
      otherCharges: p.otherCharges,
      totalCost: p.totalCost,
      reraNumber: p.reraNumber,
      reraExpiry: p.reraExpiry,
      promoterName: p.promoterName,
      isReraVerified: p.isReraVerified,
      isEcVerified: p.isEcVerified,
      isHouznextVerified: p.isHouznextVerified,
      photoUrls: urls,
      coverImageUrl: p.coverImageUrl || urls[0] || null,
      reraCertUrl: p.reraCertUrl,
      ecCertUrl: p.ecCertUrl,
      floorPlanUrl: p.floorPlanUrl,
      brochureUrl: p.brochureUrl,
      youtubeVideoUrl: p.youtubeVideoUrl,
      amenities: p.amenities,
      highlights: p.highlights,
      isApproved: p.isApproved,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isZeroBrokerage: p.isZeroBrokerage,
      enableWhatsappEnquiry: p.enableWhatsappEnquiry,
      businessWhatsappE164: infraBusinessWhatsappE164(),
      linkedProjectId: p.linkedProjectId,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      media,
    };
  }

  async list(filters: FilterPropertyDto, publicOnly: boolean) {
    const q = filters.q?.trim();
    if (q && q.length >= 2) {
      return this.searchPublic(q, {
        hintType: filters.hintType ?? filters.propertyType ?? filters.type,
        page: filters.page,
        limit: filters.limit,
        city: filters.city,
        type: filters.propertyType ?? filters.type,
        types: filters.types,
        bhk: filters.bhk,
        bhkTypes: filters.bhkTypes,
        status: filters.status,
        statuses: filters.statuses,
        furnishing: filters.furnishing,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        listingFor: filters.listingFor,
        isFeatured: filters.isFeatured,
        sortBy: filters.sortBy,
      });
    }

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const qb = this.propRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.media', 'm')
      .skip((page - 1) * limit)
      .take(limit);

    if (publicOnly) {
      qb.andWhere('p.isApproved = true').andWhere('p.isActive = true');
    }

    const type = filters.propertyType ?? filters.type;
    if (filters.city) qb.andWhere('p.city = :city', { city: filters.city });
    const typesCsv = filters.types?.trim();
    if (typesCsv) {
      const types = typesCsv.split(',').map((t) => t.trim()).filter(Boolean);
      if (types.length) qb.andWhere('p.propertyType IN (:...types)', { types });
    } else if (type) {
      qb.andWhere('p.propertyType = :ptype', { ptype: type });
    }
    const bhkCsv = filters.bhkTypes?.trim();
    if (bhkCsv) {
      const bhks = bhkCsv.split(',').map((b) => b.trim()).filter(Boolean);
      if (bhks.length) {
        qb.andWhere(
          new Brackets((sub) => {
            bhks.forEach((b, i) => {
              const norm = b === '5+' ? '5BHK+' : b;
              const param = `bhkMulti${i}`;
              if (i === 0) sub.where(`p.bhkType = :${param}`, { [param]: norm });
              else sub.orWhere(`p.bhkType = :${param}`, { [param]: norm });
            });
          }),
        );
      }
    } else if (filters.bhk) {
      qb.andWhere('p.bhkType = :bhk', { bhk: filters.bhk });
    }
    if (filters.listingFor) qb.andWhere('p.listingFor = :lf', { lf: filters.listingFor });
    const statusCsv = filters.statuses?.trim();
    if (statusCsv) {
      const statuses = statusCsv.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length) qb.andWhere('p.constructionStatus IN (:...statuses)', { statuses });
    } else if (filters.status) {
      qb.andWhere('p.constructionStatus = :cs', { cs: filters.status });
    }
    const furnCsv = filters.furnishing?.trim();
    if (furnCsv) {
      const furnishing = furnCsv.split(',').map((f) => f.trim()).filter(Boolean);
      if (furnishing.length) qb.andWhere('p.furnishingStatus IN (:...furnishing)', { furnishing });
    }
    if (filters.isFeatured === true) {
      qb.andWhere('p.isFeatured = true');
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere('CAST(p.basePrice AS DECIMAL) >= :minP', { minP: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('CAST(p.basePrice AS DECIMAL) <= :maxP', { maxP: filters.maxPrice });
    }

    const sort = filters.sortBy || 'newest';
    if (sort === 'price_asc') qb.orderBy('CAST(p.basePrice AS DECIMAL)', 'ASC', 'NULLS LAST');
    else if (sort === 'price_desc') qb.orderBy('CAST(p.basePrice AS DECIMAL)', 'DESC', 'NULLS LAST');
    else if (sort === 'oldest') qb.orderBy('p.createdAt', 'ASC');
    else qb.orderBy('p.createdAt', 'DESC');

    const [rows, total] = await qb.getManyAndCount();
    const data = rows.map((p) => this.toPublic(p));
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, items: data, total, page, limit, totalPages };
  }

  async searchPublic(
    rawQuery: string,
    opts?: {
      hintType?: string;
      page?: number;
      limit?: number;
      city?: string;
      type?: string;
      types?: string;
      bhk?: string;
      bhkTypes?: string;
      minPrice?: number;
      maxPrice?: number;
      status?: string;
      statuses?: string;
      furnishing?: string;
      listingFor?: string;
      isFeatured?: boolean;
      sortBy?: string;
    },
  ) {
    const parsed = parsePropertySearchQuery(rawQuery);
    const page = Math.max(1, opts?.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts?.limit ?? 20));

    const searchTokens = [
      ...new Set([
        ...parsed.tokens,
        ...parsed.locationTokens,
        ...parsed.tokens.flatMap((t) => fuzzyTokenVariants(t)),
      ]),
    ].slice(0, 14);

    const qb = this.propRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.media', 'm')
      .leftJoinAndSelect('p.details', 'd')
      .where('p.isApproved = true')
      .andWhere('p.isActive = true');

    const textFields = [
      'p.title',
      'p.city',
      'p.locality',
      'p.address',
      'p.description',
      'p.landUseType',
      'p.layoutName',
      'p.zoneType',
      'p.bhkType',
      'p.towerName',
      'p.surveyNumber',
      'p.approvalAuthority',
      'p.approvalType',
      'p.propertyCode',
      'p.slug',
      'd.additionalNotes',
    ];

    if (searchTokens.length || parsed.propertyIdHint || parsed.propertyCodeHint) {
      qb.andWhere(
        new Brackets((sub) => {
          searchTokens.forEach((tok, i) => {
            const pat = `%${tok}%`;
            sub.orWhere(
              new Brackets((inner) => {
                textFields.forEach((field) => {
                  inner.orWhere(`LOWER(${field}) LIKE :tok${i}`, { [`tok${i}`]: pat });
                });
                inner.orWhere(`LOWER(CAST(p.propertyType AS TEXT)) LIKE :tok${i}`, { [`tok${i}`]: pat });
                inner.orWhere(`LOWER(CAST(p.propertyId AS TEXT)) LIKE :tok${i}`, { [`tok${i}`]: pat });
                inner.orWhere(`LOWER(COALESCE(array_to_string(p.amenities, ' '), '')) LIKE :tok${i}`, {
                  [`tok${i}`]: pat,
                });
                inner.orWhere(`LOWER(COALESCE(array_to_string(p.highlights, ' '), '')) LIKE :tok${i}`, {
                  [`tok${i}`]: pat,
                });
              }),
            );
          });
          const compact = normalizeSearchText(rawQuery).replace(/\s+/g, '');
          if (compact.length >= 2) {
            sub.orWhere('LOWER(COALESCE(p.propertyCode, \'\')) LIKE :compact', {
              compact: `%${compact}%`,
            });
          }
          if (parsed.propertyIdHint) {
            sub.orWhere('CAST(p.propertyId AS TEXT) ILIKE :pid', {
              pid: `%${parsed.propertyIdHint}%`,
            });
          }
          if (parsed.propertyCodeHint) {
            const digits = parsed.propertyCodeHint.replace(/\D/g, '');
            if (digits) {
              sub.orWhere('LOWER(COALESCE(p.propertyCode, \'\')) LIKE :codeDigits', {
                codeDigits: `%${digits}%`,
              });
            }
          }
        }),
      );
    }

    const candidates = await qb.take(150).getMany();

    let scored = candidates
      .map((p) => {
        const score = scorePropertyMatch(
          {
            ...p,
            additionalNotes: (p as InfraProperty & { details?: InfraPropertyDetails }).details
              ?.additionalNotes,
          },
          parsed,
          opts?.hintType ?? opts?.type,
        );
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!scored.length && candidates.length) {
      scored = candidates.map((p) => ({ p, score: 1 }));
    }

    let rows = scored.map((x) => x.p);

    if (opts?.city) {
      const city = opts.city.toLowerCase();
      rows = rows.filter((p) => p.city?.toLowerCase().includes(city) || p.locality?.toLowerCase().includes(city));
    }
    if (opts?.types) {
      const types = opts.types.split(',').map((t) => t.trim()).filter(Boolean);
      if (types.length) rows = rows.filter((p) => types.includes(String(p.propertyType)));
    } else if (opts?.type) {
      rows = rows.filter((p) => String(p.propertyType) === opts.type);
    }
    if (opts?.bhkTypes) {
      const bhks = opts.bhkTypes.split(',').map((b) => (b.trim() === '5+' ? '5BHK+' : b.trim())).filter(Boolean);
      if (bhks.length) rows = rows.filter((p) => bhks.includes(String(p.bhkType ?? '')));
    } else if (opts?.bhk) {
      rows = rows.filter((p) => p.bhkType === opts.bhk);
    }
    if (opts?.statuses) {
      const statuses = opts.statuses.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length) rows = rows.filter((p) => statuses.includes(String(p.constructionStatus)));
    } else if (opts?.status) {
      rows = rows.filter((p) => String(p.constructionStatus) === opts.status);
    }
    if (opts?.furnishing) {
      const furnishing = opts.furnishing.split(',').map((f) => f.trim()).filter(Boolean);
      if (furnishing.length) rows = rows.filter((p) => furnishing.includes(String(p.furnishingStatus ?? '')));
    }
    if (opts?.listingFor) rows = rows.filter((p) => String(p.listingFor) === opts.listingFor);
    if (opts?.isFeatured === true) rows = rows.filter((p) => p.isFeatured);
    if (opts?.minPrice !== undefined) {
      rows = rows.filter((p) => Number(p.basePrice ?? 0) >= opts.minPrice!);
    }
    if (opts?.maxPrice !== undefined) {
      rows = rows.filter((p) => Number(p.basePrice ?? 0) <= opts.maxPrice!);
    }

    const sort = opts?.sortBy || 'relevance';
    if (sort === 'price_asc') {
      rows.sort((a, b) => Number(a.basePrice ?? 0) - Number(b.basePrice ?? 0));
    } else if (sort === 'price_desc') {
      rows.sort((a, b) => Number(b.basePrice ?? 0) - Number(a.basePrice ?? 0));
    } else if (sort === 'oldest') {
      rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else if (sort !== 'relevance') {
      rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const total = rows.length;
    const slice = rows.slice((page - 1) * limit, page * limit);
    const data = slice.map((p) => this.toPublic(p));
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, items: data, total, page, limit, totalPages };
  }

  async findBySlug(slug: string): Promise<Record<string, unknown>> {
    const p = await this.propRepo.findOne({
      where: { slug },
      relations: { media: true, details: true },
    });
    if (!p || !p.isActive || !p.isApproved) throw new NotFoundException('Property not found');
    return this.toPublic(p);
  }

  async findBySlugs(slugs: string[]): Promise<Record<string, unknown>[]> {
    const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))].slice(0, 24);
    if (!unique.length) return [];
    const rows = await this.propRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.media', 'm')
      .where('p.slug IN (:...slugs)', { slugs: unique })
      .andWhere('p.isApproved = true')
      .andWhere('p.isActive = true')
      .getMany();
    const order = new Map(unique.map((s, i) => [s, i]));
    rows.sort((a, b) => (order.get(a.slug ?? '') ?? 0) - (order.get(b.slug ?? '') ?? 0));
    return rows.map((p) => this.toPublic(p));
  }

  async findById(id: string): Promise<InfraProperty> {
    const p = await this.propRepo.findOne({
      where: { propertyId: id },
      relations: { media: true, details: true },
    });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }

  /** Admin GET :id — no relations (avoids circular JSON via media.property / details.property). */
  async findByIdForAdmin(id: string): Promise<InfraProperty> {
    const p = await this.propRepo.findOne({ where: { propertyId: id } });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }

  private applyDtoToEntity(
    dto: CreatePropertyDto,
    entity: InfraProperty,
    opts: { propertyCode: string; propertySeq: number },
  ) {
    entity.title = dto.title;
    entity.propertyType = dto.propertyType;
    entity.listingFor = dto.listingFor ?? entity.listingFor ?? ListingFor.Buy;
    entity.constructionStatus = dto.constructionStatus;
    entity.bhkType = dto.bhkType ?? null;
    entity.carpetArea = toDec(dto.carpetArea);
    entity.builtUpArea = toDec(dto.builtUpArea);
    entity.superBuiltUpArea = toDec(dto.superBuiltUpArea);
    entity.plotArea = toDec(dto.plotArea);
    entity.landArea = toDec(dto.landArea);
    entity.areaUnit = dto.areaUnit ?? null;
    entity.basePrice = toDec(dto.basePrice);
    entity.pricePerUnit = toDec(this.calculatePricePerUnit(dto));
    entity.gstPercent = toDec(dto.gstPercent ?? 5);
    entity.registrationPercent = toDec(dto.registrationPercent ?? 1);
    entity.maintenanceDeposit = toDec(dto.maintenanceDeposit);
    entity.otherCharges = toDec(dto.otherCharges);
    entity.totalCost = toDec(this.calculateTotalCost(dto));
    entity.city = dto.city ?? null;
    entity.locality = dto.locality ?? null;
    entity.address = dto.address ?? null;
    entity.pincode = dto.pincode ?? null;
    entity.latitude = toDec(dto.latitude);
    entity.longitude = toDec(dto.longitude);
    entity.reraNumber = dto.reraNumber ?? null;
    entity.reraExpiry = dto.reraExpiry ?? null;
    entity.promoterName = dto.promoterName ?? null;
    entity.facing = dto.facing ?? null;
    entity.floorNumber = dto.floorNumber ?? dto.floor ?? null;
    entity.totalFloors = dto.totalFloors ?? null;
    entity.towerName = dto.towerName ?? null;
    entity.parkingType = dto.parkingType ?? null;
    entity.furnishingStatus = dto.furnishingStatus ?? null;
    entity.description = dto.description ?? null;
    entity.amenities = dto.amenities ?? null;
    entity.highlights = dto.highlights ?? null;
    entity.possessionDate = dto.possessionDate ?? null;
    entity.photoUrls = dto.photoUrls ?? null;
    entity.coverImageUrl = dto.coverImageUrl ?? null;
    entity.reraCertUrl = dto.reraCertUrl ?? null;
    entity.ecCertUrl = dto.ecCertUrl ?? null;
    entity.floorPlanUrl = dto.floorPlanUrl ?? null;
    entity.brochureUrl = dto.brochureUrl ?? null;
    entity.youtubeVideoUrl = sanitizeYoutubeVideoUrl(dto.youtubeVideoUrl);
    entity.landUseType = dto.landUseType ?? null;
    entity.approvalAuthority = dto.approvalAuthority ?? null;
    entity.approvalType = dto.approvalType ?? null;
    entity.approvalNumber = dto.approvalNumber ?? null;
    entity.surveyNumber = dto.surveyNumber ?? null;
    entity.layoutName = dto.layoutName ?? null;
    entity.roadWidth = dto.roadWidth ?? null;
    entity.zoneType = dto.zoneType ?? null;
    entity.waterSource = dto.waterSource ?? null;
    entity.electricity = dto.electricity ?? null;
    entity.plotNumber = dto.plotNumber ?? null;
    entity.numberOfFloors = dto.numberOfFloors ?? null;
    entity.linkedProjectId = dto.linkedProjectId ?? null;
    entity.isCornerPlot = dto.isCornerPlot ?? false;
    entity.isGatedLayout = dto.isGatedLayout ?? false;
    entity.hasCompoundWall = dto.hasCompoundWall ?? false;
    entity.isReadyToRegister = dto.isReadyToRegister ?? false;
    entity.hasEBConnection = dto.hasEBConnection ?? false;
    entity.hasBorewell = dto.hasBorewell ?? false;
    entity.hasDrainage = dto.hasDrainage ?? false;
    entity.isPattaAvailable = dto.isPattaAvailable ?? false;
    entity.isTitleClear = dto.isTitleClear ?? false;
    entity.isGatedCommunity = dto.isGatedCommunity ?? false;
    entity.isVastuCompliant = dto.isVastuCompliant ?? false;
    entity.hasPrivatePool = dto.hasPrivatePool ?? false;
    entity.hasGarden = dto.hasGarden ?? false;
    entity.hasSmartHome = dto.hasSmartHome ?? false;
    entity.hasEVCharging = dto.hasEVCharging ?? false;
    entity.isReraVerified = dto.isReraVerified ?? false;
    entity.isEcVerified = dto.isEcVerified ?? false;
    entity.isHouznextVerified = dto.isHouznextVerified ?? false;
    entity.isFeatured = dto.isFeatured ?? false;
    entity.isZeroBrokerage = dto.isZeroBrokerage ?? false;
    entity.enableWhatsappEnquiry = dto.enableWhatsappEnquiry ?? true;
    entity.ownerName = dto.ownerName ?? null;
    entity.ownerPhone = dto.ownerPhone ?? null;
    entity.ownerEmail = dto.ownerEmail ?? null;
    entity.ownerAlternatePhone = dto.ownerAlternatePhone ?? null;
    entity.leadSource = dto.leadSource ?? null;
    entity.branch = dto.branch ?? null;
    entity.internalNotes = dto.internalNotes ?? null;
    if (dto.listedBy) entity.listedBy = dto.listedBy;
    entity.propertyCode = opts.propertyCode;
    entity.propertySeq = opts.propertySeq;
  }

  private setApprovalFromStatus(entity: InfraProperty, approvalStatus?: string) {
    const st = approvalStatus || 'pending';
    if (st === 'approved') {
      entity.isApproved = true;
      entity.isActive = true;
      entity.approvedAt = new Date();
    } else if (st === 'draft') {
      entity.isApproved = false;
      entity.isActive = false;
    } else {
      entity.isApproved = false;
      entity.isActive = true;
    }
  }

  async create(dto: CreatePropertyDto, user?: JwtPayload): Promise<InfraProperty> {
    const listedBy =
      dto.listedBy ??
      (user?.kind === 'developer' ? 'developer' : user?.kind === 'customer' ? 'public' : 'public');
    const listedByUserId =
      user?.kind === 'customer' || user?.kind === 'developer' ? user.sub : null;

    const { code, seq } = await this.generatePropertyCode();
    const entity = this.propRepo.create({
      listedBy,
      listedByUserId,
    });
    this.applyDtoToEntity(dto, entity, { propertyCode: code, propertySeq: seq });
    this.setApprovalFromStatus(entity, dto.approvalStatus ?? 'pending');
    if (entity.isApproved && user?.sub) entity.approvedBy = user.sub;

    let saved = await this.propRepo.save(entity);
    saved.slug = this.generateSlug(saved.title, saved.propertyId);
    saved = await this.propRepo.save(saved);

    if (dto.mediaUrls?.length) {
      const media = dto.mediaUrls.map((url, i) =>
        this.mediaRepo.create({ url, sortOrder: i, property: saved }),
      );
      await this.mediaRepo.save(media);
    }

    await this.ensureDetails(saved);
    const out = await this.findById(saved.propertyId);
    this.notifyProperty('created', out, user ?? null);
    return out;
  }

  /** Admin-only create (full payload + approvalStatus). */
  async adminCreate(dto: CreatePropertyDto, adminId: string): Promise<InfraProperty> {
    const { code, seq } = await this.generatePropertyCode();
    const entity = this.propRepo.create({
      listedBy: dto.listedBy || 'houznext',
      listedByUserId: null,
    });
    this.applyDtoToEntity(dto, entity, { propertyCode: code, propertySeq: seq });
    this.setApprovalFromStatus(entity, dto.approvalStatus);
    if (entity.isApproved) {
      entity.approvedBy = adminId;
      entity.approvedAt = new Date();
    }

    let saved = await this.propRepo.save(entity);
    saved.slug = this.generateSlug(saved.title, saved.propertyId);
    saved = await this.propRepo.save(saved);

    if (dto.mediaUrls?.length) {
      const media = dto.mediaUrls.map((url, i) =>
        this.mediaRepo.create({ url, sortOrder: i, property: saved }),
      );
      await this.mediaRepo.save(media);
    }

    await this.ensureDetails(saved);
    const out = await this.findById(saved.propertyId);
    this.notifyProperty('created', out, { sub: adminId, kind: 'admin' });
    return out;
  }

  private async ensureDetails(p: InfraProperty) {
    const hasDetails = await this.detailsRepo.findOne({
      where: { property: { propertyId: p.propertyId } },
    });
    if (!hasDetails) {
      const details = this.detailsRepo.create({
        property: p,
        additionalNotes: null,
      });
      await this.detailsRepo.save(details);
    }
  }

  async update(id: string, dto: UpdatePropertyDto, user: JwtPayload): Promise<InfraProperty> {
    const p = await this.findById(id);
    if (user.kind === 'admin') {
      /* ok */
    } else if (user.kind === 'customer' && p.listedByUserId !== user.sub) {
      throw new ForbiddenException('Not your listing');
    } else if (
      user.kind === 'developer' &&
      (p.listedBy !== 'developer' || p.listedByUserId !== user.sub)
    ) {
      throw new ForbiddenException('Not your listing');
    } else if (user.kind !== 'customer' && user.kind !== 'developer' && user.kind !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }

    Object.assign(p, {
      ...dto,
      carpetArea: dto.carpetArea !== undefined ? toDec(dto.carpetArea) : p.carpetArea,
      builtUpArea: dto.builtUpArea !== undefined ? toDec(dto.builtUpArea) : p.builtUpArea,
      superBuiltUpArea: dto.superBuiltUpArea !== undefined ? toDec(dto.superBuiltUpArea) : p.superBuiltUpArea,
      plotArea: dto.plotArea !== undefined ? toDec(dto.plotArea) : p.plotArea,
      landArea: dto.landArea !== undefined ? toDec(dto.landArea) : p.landArea,
      basePrice: dto.basePrice !== undefined ? toDec(dto.basePrice) : p.basePrice,
      pricePerUnit: dto.pricePerUnit !== undefined ? toDec(dto.pricePerUnit) : p.pricePerUnit,
      latitude: dto.latitude !== undefined ? toDec(dto.latitude) : p.latitude,
      longitude: dto.longitude !== undefined ? toDec(dto.longitude) : p.longitude,
      floorNumber:
        dto.floorNumber !== undefined
          ? dto.floorNumber
          : dto.floor !== undefined
            ? dto.floor
            : p.floorNumber,
    });
    if (dto.youtubeVideoUrl !== undefined) {
      p.youtubeVideoUrl = sanitizeYoutubeVideoUrl(dto.youtubeVideoUrl);
    }
    if (dto.title) p.slug = this.generateSlug(dto.title, p.propertyId);
    if (dto.approvalStatus) this.setApprovalFromStatus(p, dto.approvalStatus);
    if (dto.basePrice !== undefined || dto.gstPercent !== undefined || dto.registrationPercent !== undefined) {
      const cp: CreatePropertyDto = {
        title: p.title,
        propertyType: p.propertyType,
        listingFor: p.listingFor,
        constructionStatus: p.constructionStatus,
        basePrice: Number(p.basePrice) || 0,
        gstPercent: Number(p.gstPercent) || 5,
        registrationPercent: Number(p.registrationPercent) || 1,
        maintenanceDeposit: Number(p.maintenanceDeposit) || 0,
        otherCharges: Number(p.otherCharges) || 0,
        carpetArea: Number(p.carpetArea) || undefined,
        builtUpArea: Number(p.builtUpArea) || undefined,
        plotArea: Number(p.plotArea) || undefined,
        landArea: Number(p.landArea) || undefined,
      };
      p.totalCost = toDec(this.calculateTotalCost(cp));
      p.pricePerUnit = toDec(this.calculatePricePerUnit(cp));
    }
    await this.propRepo.save(p);
    const out = await this.findById(id);
    this.notifyProperty('updated', out, user);
    return out;
  }

  async adminList(filters: FilterPropertyDto) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const qb = this.propRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.media', 'm')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const type = filters.propertyType ?? filters.type;
    if (filters.city) qb.andWhere('p.city = :city', { city: filters.city });
    if (type) qb.andWhere('p.propertyType = :ptype', { ptype: type });
    const [items, total] = await qb.getManyAndCount();
    return { data: items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async pendingList() {
    return this.propRepo.find({
      where: { isApproved: false, isActive: true },
      relations: { media: true },
      order: { createdAt: 'ASC' },
    });
  }

  async approve(id: string, adminId: string): Promise<InfraProperty> {
    const p = await this.findById(id);
    p.isApproved = true;
    p.isActive = true;
    p.approvedBy = adminId;
    p.approvedAt = new Date();
    await this.propRepo.save(p);
    this.notifyProperty('approved', p, { sub: adminId, kind: 'admin' });
    return p;
  }

  async reject(id: string): Promise<InfraProperty> {
    const p = await this.findById(id);
    p.isApproved = false;
    p.isActive = false;
    await this.propRepo.save(p);
    this.notifyProperty('rejected', p, null);
    return p;
  }

  async adminDelete(id: string, actor?: JwtPayload | null): Promise<{ message: string }> {
    const p = await this.propRepo.findOne({ where: { propertyId: id } });
    if (!p) throw new NotFoundException('Property not found');
    await this.propRepo.delete({ propertyId: id });
    this.notifyProperty('deleted', p, actor);
    return { message: 'Property deleted' };
  }
}
