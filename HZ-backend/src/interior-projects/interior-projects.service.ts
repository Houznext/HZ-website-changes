import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { InteriorProject } from './entities/interior-project.entity';
import { InteriorProjectsSettings } from './entities/interior-projects-settings.entity';
import { CreateInteriorProjectDto } from './dto/create-interior-project.dto';
import { UpdateInteriorProjectDto } from './dto/update-interior-project.dto';
import { UpdateDisplayTotalDto } from './dto/update-display-total.dto';

@Injectable()
export class InteriorProjectsService {
  constructor(
    @InjectRepository(InteriorProject)
    private repo: Repository<InteriorProject>,
    @InjectRepository(InteriorProjectsSettings)
    private settingsRepo: Repository<InteriorProjectsSettings>,
  ) {}

  async create(dto: CreateInteriorProjectDto) {
    const project = this.repo.create(dto);
    return this.repo.save(project);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    package?: string;
    propertyType?: string;
    search?: string;
    sort?: string;
    featured?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.package) where.package = query.package;
    if (query.propertyType) where.propertyType = query.propertyType;
    if (query.search) where.title = Like(`%${query.search}%`);

    let order: any = { createdAt: 'DESC' };
    if (query.sort === 'oldest') order = { createdAt: 'ASC' };
    if (query.sort === 'cost-high') order = { costInLakhs: 'DESC' };
    if (query.sort === 'cost-low') order = { costInLakhs: 'ASC' };
    if (query.sort === 'days') order = { deliveryDays: 'ASC' };
    if (query.sort === 'sortOrder') order = { sortOrder: 'ASC' };

    const [data, total] = await this.repo.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublic(query: {
    page?: number;
    limit?: number;
    package?: string;
    propertyType?: string;
    sort?: string;
    featured?: string;
  }) {
    return this.findAll({ ...query, status: 'Live' });
  }

  async findOne(id: number) {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async findPublicOne(id: number) {
    const project = await this.repo.findOne({
      where: { id, status: 'Live' },
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async findForLandingPage(citySlug: string, limit = 4) {
    const safeLimit = Math.min(Math.max(limit, 1), 12);
    const projects = await this.repo.find({
      where: { status: 'Live', showOnLandingPage: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    return projects
      .filter((project) =>
        (project.landingPageCities || []).includes(citySlug),
      )
      .slice(0, safeLimit);
  }

  async update(id: number, dto: UpdateInteriorProjectDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { success: true };
  }

  async getOrCreateSettings(): Promise<InteriorProjectsSettings> {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1, displayTotalProjects: null });
      settings = await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async stats() {
    const total = await this.repo.count();
    const live = await this.repo.count({ where: { status: 'Live' } });
    const draft = await this.repo.count({ where: { status: 'Draft' } });
    const featured = await this.repo.count({ where: { featured: true } });
    const settings = await this.getOrCreateSettings();
    const displayTotal =
      settings.displayTotalProjects != null
        ? settings.displayTotalProjects
        : total;
    return {
      total,
      displayTotal,
      displayTotalOverride: settings.displayTotalProjects,
      live,
      draft,
      featured,
    };
  }

  async updateDisplayTotal(dto: UpdateDisplayTotalDto) {
    await this.getOrCreateSettings();
    await this.settingsRepo.update(1, {
      displayTotalProjects: dto.displayTotalProjects ?? null,
    });
    return this.stats();
  }

  async publicStats() {
    const { displayTotal } = await this.stats();
    return { displayTotal };
  }
}
