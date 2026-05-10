import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraProject } from './entities/infra-project.entity';
import { InfraProjectMilestone } from './entities/infra-project-milestone.entity';
import { CreateProjectDto, MilestoneDto, UpdateProjectDto } from './dto/project.dto';

function toDec(n?: number): string | null {
  if (n === undefined || n === null || Number.isNaN(n)) return null;
  return String(n);
}

function slugify(name: string, id: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return `${base || 'project'}-${id.slice(0, 8)}`;
}

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(InfraProject)
    private readonly repo: Repository<InfraProject>,
    @InjectRepository(InfraProjectMilestone)
    private readonly msRepo: Repository<InfraProjectMilestone>,
  ) {}

  async list(featured?: boolean, limit = 20) {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').take(Math.min(50, limit));
    if (featured) qb.andWhere('p.isFeatured = true');
    return qb.getMany();
  }

  async bySlug(slug: string): Promise<InfraProject> {
    const p = await this.repo.findOne({
      where: { slug },
      relations: { milestones: true },
    });
    if (!p) throw new NotFoundException('Project not found');
    if (p.milestones?.length) {
      p.milestones.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return p;
  }

  async create(dto: CreateProjectDto): Promise<InfraProject> {
    let p = this.repo.create({
      name: dto.name,
      city: dto.city ?? null,
      locality: dto.locality ?? null,
      reraNumber: dto.reraNumber ?? null,
      totalUnits: dto.totalUnits ?? null,
      availableUnits: dto.availableUnits ?? null,
      towers: dto.towers ?? null,
      maxFloors: dto.maxFloors ?? null,
      possessionDate: dto.possessionDate ?? null,
      status: dto.status,
      minPrice: toDec(dto.minPrice),
      maxPrice: toDec(dto.maxPrice),
      description: dto.description ?? null,
      heroImageUrl: dto.heroImageUrl ?? null,
      isFeatured: dto.isFeatured ?? false,
    });
    p = await this.repo.save(p);
    p.slug = slugify(p.name, p.projectId);
    return this.repo.save(p);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<InfraProject> {
    const p = await this.repo.findOne({ where: { projectId: id } });
    if (!p) throw new NotFoundException('Project not found');
    Object.assign(p, {
      ...dto,
      minPrice: dto.minPrice !== undefined ? toDec(dto.minPrice) : p.minPrice,
      maxPrice: dto.maxPrice !== undefined ? toDec(dto.maxPrice) : p.maxPrice,
    });
    if (dto.name) p.slug = slugify(dto.name, p.projectId);
    return this.repo.save(p);
  }

  async addMilestones(projectId: string, items: MilestoneDto[]) {
    const p = await this.repo.findOne({ where: { projectId } });
    if (!p) throw new NotFoundException('Project not found');
    const rows = items.map((m, i) =>
      this.msRepo.create({
        label: m.label,
        date: m.date ?? null,
        isCompleted: m.isCompleted ?? false,
        isCurrent: m.isCurrent ?? false,
        description: m.description ?? null,
        sortOrder: m.sortOrder ?? i,
        project: p,
      }),
    );
    await this.msRepo.save(rows);
    return this.bySlug(p.slug!);
  }
}
