import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraProperty } from './entities/infra-property.entity';
import { InfraPropertyMedia } from './entities/infra-property-media.entity';
import { InfraPropertyDetails } from './entities/infra-property-details.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { JwtPayload } from '../auth/jwt.strategy';

function toDec(n?: number): string | null {
  if (n === undefined || n === null || Number.isNaN(n)) return null;
  return String(n);
}

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return `${base || 'property'}-${id.slice(0, 8)}`;
}

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(InfraProperty)
    private readonly propRepo: Repository<InfraProperty>,
    @InjectRepository(InfraPropertyMedia)
    private readonly mediaRepo: Repository<InfraPropertyMedia>,
    @InjectRepository(InfraPropertyDetails)
    private readonly detailsRepo: Repository<InfraPropertyDetails>,
  ) {}

  async list(filters: FilterPropertyDto, publicOnly: boolean) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 12));
    const qb = this.propRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.media', 'm')
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (publicOnly) {
      qb.andWhere('p.isApproved = true').andWhere('p.isActive = true');
    }

    if (filters.city) qb.andWhere('p.city = :city', { city: filters.city });
    if (filters.type) qb.andWhere('p.propertyType = :type', { type: filters.type });
    if (filters.bhk) qb.andWhere('p.bhkType = :bhk', { bhk: filters.bhk });
    if (filters.listingFor) qb.andWhere('p.listingFor = :lf', { lf: filters.listingFor });
    if (filters.status) qb.andWhere('p.constructionStatus = :cs', { cs: filters.status });
    if (filters.minPrice !== undefined) {
      qb.andWhere('CAST(p.basePrice AS DECIMAL) >= :minP', { minP: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('CAST(p.basePrice AS DECIMAL) <= :maxP', { maxP: filters.maxPrice });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findBySlug(slug: string): Promise<InfraProperty> {
    const p = await this.propRepo.findOne({
      where: { slug },
      relations: { media: true, details: true },
    });
    if (!p || !p.isActive) throw new NotFoundException('Property not found');
    if (!p.isApproved) throw new NotFoundException('Property not found');
    return p;
  }

  async findById(id: string): Promise<InfraProperty> {
    const p = await this.propRepo.findOne({
      where: { propertyId: id },
      relations: { media: true, details: true },
    });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }

  async create(dto: CreatePropertyDto, user?: JwtPayload): Promise<InfraProperty> {
    const listedBy =
      dto.listedBy ??
      (user?.kind === 'developer' ? 'developer' : user?.kind === 'customer' ? 'public' : 'public');
    const listedByUserId =
      user?.kind === 'customer' || user?.kind === 'developer' ? user.sub : null;

    const entity = this.propRepo.create({
      title: dto.title,
      propertyType: dto.propertyType,
      listingFor: dto.listingFor,
      constructionStatus: dto.constructionStatus,
      bhkType: dto.bhkType ?? null,
      carpetArea: toDec(dto.carpetArea),
      areaUnit: dto.areaUnit ?? null,
      basePrice: toDec(dto.basePrice),
      pricePerUnit: toDec(dto.pricePerUnit),
      city: dto.city ?? null,
      locality: dto.locality ?? null,
      address: dto.address ?? null,
      latitude: toDec(dto.latitude),
      longitude: toDec(dto.longitude),
      reraNumber: dto.reraNumber ?? null,
      facing: dto.facing ?? null,
      floor: dto.floor ?? null,
      totalFloors: dto.totalFloors ?? null,
      furnishingStatus: dto.furnishingStatus ?? null,
      description: dto.description ?? null,
      amenities: dto.amenities ?? null,
      highlights: dto.highlights ?? null,
      possessionDate: dto.possessionDate ?? null,
      listedBy,
      listedByUserId,
      isApproved: listedBy === 'houznext',
      isActive: true,
      isFeatured: dto.isFeatured ?? false,
    });

    let saved = await this.propRepo.save(entity);
    saved.slug = slugify(saved.title, saved.propertyId);
    saved = await this.propRepo.save(saved);

    if (dto.mediaUrls?.length) {
      const media = dto.mediaUrls.map((url, i) =>
        this.mediaRepo.create({ url, sortOrder: i, property: saved }),
      );
      await this.mediaRepo.save(media);
    }

    const hasDetails = await this.detailsRepo.findOne({
      where: { property: { propertyId: saved.propertyId } },
    });
    if (!hasDetails) {
      const details = this.detailsRepo.create({
        property: saved,
        additionalNotes: null,
      });
      await this.detailsRepo.save(details);
    }

    return this.findById(saved.propertyId);
  }

  async update(id: string, dto: UpdatePropertyDto, user: JwtPayload): Promise<InfraProperty> {
    const p = await this.findById(id);
    if (user.kind === 'admin') {
      /* admin may edit any */
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
      basePrice: dto.basePrice !== undefined ? toDec(dto.basePrice) : p.basePrice,
      pricePerUnit: dto.pricePerUnit !== undefined ? toDec(dto.pricePerUnit) : p.pricePerUnit,
      latitude: dto.latitude !== undefined ? toDec(dto.latitude) : p.latitude,
      longitude: dto.longitude !== undefined ? toDec(dto.longitude) : p.longitude,
    });
    if (dto.title) p.slug = slugify(dto.title, p.propertyId);
    await this.propRepo.save(p);
    return this.findById(id);
  }

  async adminList() {
    return this.propRepo.find({
      relations: { media: true },
      order: { createdAt: 'DESC' },
    });
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
    p.approvedBy = adminId;
    p.approvedAt = new Date();
    await this.propRepo.save(p);
    return p;
  }

  async reject(id: string): Promise<InfraProperty> {
    const p = await this.findById(id);
    p.isApproved = false;
    p.isActive = false;
    await this.propRepo.save(p);
    return p;
  }

  async adminDelete(id: string): Promise<void> {
    const r = await this.propRepo.delete({ propertyId: id });
    if (!r.affected) throw new NotFoundException('Property not found');
  }
}
