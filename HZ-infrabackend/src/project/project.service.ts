import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/jwt.strategy';
import { ConstructionStatus, ProjectType } from '../common/enums/infra.enums';
import { InfraMailService, ProjectAlertAction } from '../common/mail/infra-mail.service';
import { InfraProject } from './entities/infra-project.entity';
import { InfraProjectMilestone } from './entities/infra-project-milestone.entity';
import { CreateProjectDto, MilestoneDto, UpdateProjectDto } from './dto/project.dto';

export interface ListProjectFilters {
  featured?: boolean;
  published?: boolean;
  projectType?: ProjectType;
  city?: string;
  status?: ConstructionStatus;
  minPrice?: number;
  maxPrice?: number;
  showInSearch?: boolean;
  limit?: number;
}

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

function mapDtoToEntity(dto: CreateProjectDto | UpdateProjectDto, existing?: InfraProject): Partial<InfraProject> {
  const out: Partial<InfraProject> = {};
  const scalarKeys: (keyof CreateProjectDto)[] = [
    'name',
    'projectType',
    'developerName',
    'refCode',
    'published',
    'showInSearch',
    'reraVerified',
    'city',
    'locality',
    'reraNumber',
    'totalUnits',
    'availableUnits',
    'towers',
    'maxFloors',
    'possessionDate',
    'status',
    'pricePerUnitLabel',
    'unitsLabel',
    'configLabel',
    'bankCount',
    'enquiryCount',
    'gradientBg',
    'accentColor',
    'constructionProgress',
    'visibility',
    'description',
    'heroImageUrl',
    'isFeatured',
  ];
  for (const key of scalarKeys) {
    if (dto[key] !== undefined) {
      (out as Record<string, unknown>)[key] = dto[key];
    }
  }
  if (dto.minPrice !== undefined) out.minPrice = toDec(dto.minPrice);
  if (dto.maxPrice !== undefined) out.maxPrice = toDec(dto.maxPrice);
  if (dto.approvedBanks !== undefined) out.approvedBanks = dto.approvedBanks;
  if (dto.amenities !== undefined) out.amenities = dto.amenities;
  if (dto.configurations !== undefined) out.configurations = dto.configurations as InfraProject['configurations'];
  if (dto.infrastructure !== undefined) out.infrastructure = dto.infrastructure as InfraProject['infrastructure'];
  if (dto.legal !== undefined) out.legal = dto.legal;
  if (dto.roadWidths !== undefined) out.roadWidths = dto.roadWidths;
  if (dto.landmarks !== undefined) out.landmarks = dto.landmarks;
  if (dto.faqs !== undefined) out.faqs = dto.faqs;
  if (dto.developerInfo !== undefined) out.developerInfo = dto.developerInfo;
  if (existing && dto.name && dto.name !== existing.name) {
    out.slug = slugify(dto.name, existing.projectId);
  }
  return out;
}

@Injectable()
export class ProjectService implements OnModuleInit {
  private readonly log = new Logger(ProjectService.name);

  constructor(
    @InjectRepository(InfraProject)
    private readonly repo: Repository<InfraProject>,
    @InjectRepository(InfraProjectMilestone)
    private readonly msRepo: Repository<InfraProjectMilestone>,
    private readonly mail: InfraMailService,
  ) {}

  private notifyProject(action: ProjectAlertAction, entity: InfraProject, actor?: JwtPayload | null): void {
    void this.mail
      .sendProjectAlert({
        action,
        projectId: entity.projectId,
        refCode: entity.refCode,
        name: entity.name,
        projectType: String(entity.projectType),
        city: entity.city,
        locality: entity.locality,
        developerName: entity.developerName,
        status: entity.status,
        published: entity.published,
        minPrice: entity.minPrice,
        maxPrice: entity.maxPrice,
        actorEmail: actor?.email,
        actorKind: actor?.kind,
        actorId: actor?.sub,
      })
      .catch((err) => this.log.warn(`Project alert failed: ${(err as Error).message}`));
  }

  async onModuleInit() {
    await this.seedProjectsIfEmpty();
  }

  async list(filters: ListProjectFilters = {}) {
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
    const qb = this.repo.createQueryBuilder('p').orderBy('p.createdAt', 'DESC').take(limit);

    if (filters.published !== false) {
      qb.andWhere('p.published = :published', { published: filters.published ?? true });
    }
    if (filters.showInSearch !== false) {
      qb.andWhere('p.showInSearch = :showInSearch', { showInSearch: filters.showInSearch ?? true });
    }
    if (filters.featured) qb.andWhere('p.isFeatured = true');
    if (filters.projectType) qb.andWhere('p.projectType = :projectType', { projectType: filters.projectType });
    if (filters.city) qb.andWhere('p.city = :city', { city: filters.city });
    if (filters.status) qb.andWhere('p.status = :status', { status: filters.status });
    if (filters.minPrice != null) {
      qb.andWhere('CAST(p.maxPrice AS DECIMAL) >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice != null) {
      qb.andWhere('CAST(p.minPrice AS DECIMAL) <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    return qb.getMany();
  }

  async adminList(q?: string) {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.milestones', 'm')
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('m.sortOrder', 'ASC');

    const query = q?.trim();
    if (query) {
      qb.andWhere(
        '(p.name ILIKE :q OR p.refCode ILIKE :q OR p.city ILIKE :q OR p.locality ILIKE :q OR p.developerName ILIKE :q)',
        { q: `%${query}%` },
      );
    }

    const items = await qb.getMany();
    for (const p of items) {
      if (p.milestones?.length) {
        p.milestones.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }
    return items;
  }

  async findById(id: string): Promise<InfraProject> {
    const p = await this.repo.findOne({
      where: { projectId: id },
      relations: { milestones: true },
    });
    if (!p) throw new NotFoundException('Project not found');
    if (p.milestones?.length) {
      p.milestones.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return p;
  }

  async bySlug(slug: string): Promise<InfraProject> {
    const p = await this.repo.findOne({
      where: { slug, published: true },
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
      ...mapDtoToEntity(dto),
      projectType: dto.projectType ?? ProjectType.Apartment,
      published: dto.published ?? true,
      showInSearch: dto.showInSearch ?? true,
      reraVerified: dto.reraVerified ?? false,
      bankCount: dto.bankCount ?? 0,
      enquiryCount: dto.enquiryCount ?? 0,
      visibility: dto.visibility ?? 'published',
      isFeatured: dto.isFeatured ?? false,
    });
    p = await this.repo.save(p);
    p.slug = slugify(p.name, p.projectId);
    return this.repo.save(p);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<InfraProject> {
    const p = await this.repo.findOne({ where: { projectId: id } });
    if (!p) throw new NotFoundException('Project not found');
    Object.assign(p, mapDtoToEntity(dto, p));
    await this.repo.save(p);
    return this.findById(id);
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
    return this.findById(projectId);
  }

  async adminDelete(id: string, actor?: JwtPayload | null): Promise<{ message: string }> {
    const p = await this.repo.findOne({ where: { projectId: id } });
    if (!p) throw new NotFoundException('Project not found');
    await this.repo.delete({ projectId: id });
    this.notifyProject('deleted', p, actor);
    return { message: 'Project deleted' };
  }

  async seedProjectsIfEmpty() {
    const count = await this.repo.count();
    if (count > 0) return;

    const seeds = buildSeedProjects();
    for (const seed of seeds) {
      const { milestones, ...projectData } = seed;
      let project = this.repo.create(projectData);
      project = await this.repo.save(project);
      project.slug = slugify(project.name, project.projectId);
      await this.repo.save(project);

      if (milestones?.length) {
        const rows = milestones.map((m, i) =>
          this.msRepo.create({
            ...m,
            sortOrder: m.sortOrder ?? i,
            project,
          }),
        );
        await this.msRepo.save(rows);
      }
    }
  }
}

type SeedProject = Omit<Partial<InfraProject>, 'milestones'> & {
  milestones?: Partial<InfraProjectMilestone>[];
};

function buildSeedProjects(): SeedProject[] {
  const banks6 = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'LIC Housing Finance', 'PNB Housing'];
  const banks5 = ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'];
  const banks4 = ['SBI', 'HDFC Bank', 'ICICI Bank', 'LIC Housing Finance'];
  const banks3 = ['SBI', 'HDFC Bank', 'ICICI Bank'];
  const aptAmenities = [
    'Swimming Pool',
    'Gymnasium',
    'Covered Parking',
    'Clubhouse',
    '24hr Security',
    'Power Backup',
    'CCTV',
    'Children Play Area',
    'Vastu Compliant',
    'Lift / Elevator',
  ];
  const villaAmenities = [
    'Gated Community',
    'Clubhouse',
    'Swimming Pool',
    '24hr Security',
    'Landscaped Gardens',
    'Power Backup',
    'CCTV Surveillance',
    'Vastu Compliant',
  ];
  const infraFeatures = [
    { label: 'BT roads (main roads)', status: 'Done' },
    { label: 'Internal CC roads', status: 'Done' },
    { label: 'Compound wall', status: 'Done' },
    { label: 'EB connection (streetlights)', status: 'Done' },
    { label: 'Underground drainage', status: 'In progress' },
    { label: 'Water sump & supply', status: 'Upcoming' },
    { label: 'Entrance gate & security', status: 'Upcoming' },
  ];
  const aptMilestones = [
    { label: 'Land acquisition & approvals', date: 'Jan 2023', isCompleted: true, sortOrder: 0 },
    { label: 'Foundation & piling', date: 'Mar 2023', isCompleted: true, sortOrder: 1 },
    { label: 'Slab casting (floors 1–8)', date: 'Nov 2023', isCompleted: true, sortOrder: 2 },
    { label: 'Slab casting (floors 9–18)', date: 'Aug 2024', isCompleted: false, isCurrent: true, sortOrder: 3 },
    { label: 'Brick work & plastering', date: 'Apr 2025', isCompleted: false, sortOrder: 4 },
    { label: 'Finishing & fitments', date: 'Sep 2025', isCompleted: false, sortOrder: 5 },
    { label: 'Possession & handover', date: 'Dec 2026', isCompleted: false, sortOrder: 6 },
  ];

  return [
    {
      refCode: 'HZI-PR-0014',
      name: 'Skyline Heights',
      projectType: ProjectType.Apartment,
      developerName: 'Vertex Developers',
      city: 'Hyderabad',
      locality: 'Gachibowli',
      status: ConstructionStatus.UnderConstruction,
      minPrice: '4800000',
      maxPrice: '9450000',
      pricePerUnitLabel: '₹4,200/sqft',
      unitsLabel: '248 units',
      configLabel: '2, 3 & 4 BHK',
      totalUnits: 248,
      availableUnits: 12,
      towers: 3,
      maxFloors: 18,
      possessionDate: 'Dec 2026',
      reraNumber: 'P02400012345',
      reraVerified: true,
      bankCount: 6,
      enquiryCount: 84,
      gradientBg: 'linear-gradient(135deg,#e8f1fd,#c7d9f5)',
      accentColor: '#2563eb',
      constructionProgress: 62,
      approvedBanks: banks6,
      amenities: aptAmenities,
      configurations: [
        { type: '2 BHK', area: '980–1,050 sqft', basePrice: '₹41.2L – ₹44.1L', allInclusive: '₹46.8L', availability: 'Available' },
        { type: '3 BHK', area: '1,380–1,520 sqft', basePrice: '₹58.0L – ₹63.8L', allInclusive: '₹67.2L', availability: '12 left' },
        { type: '4 BHK', area: '1,920–2,100 sqft', basePrice: '₹80.6L – ₹88.2L', allInclusive: '₹94.5L', availability: 'Only 3 left' },
      ],
      landmarks: [
        { name: 'Hitech City Metro', distance: '2.4 km' },
        { name: 'Inorbit Mall', distance: '1.8 km' },
        { name: 'KIMS Hospital', distance: '3.1 km' },
        { name: 'ORR Gachibowli Exit', distance: '1.2 km' },
      ],
      faqs: [
        { q: 'What is the RERA number for Skyline Heights?', a: 'The RERA registration number is P02400012345, registered with TSRERA (Telangana).' },
        { q: 'When is the possession date?', a: 'Possession is scheduled for December 2026 as per RERA filing.' },
        { q: 'What banks have approved this project?', a: '6 banks have approved the project including SBI, HDFC, ICICI, Axis Bank, LIC Housing Finance, and PNB Housing Finance.' },
      ],
      developerInfo: {
        name: 'Vertex Developers',
        founded: '2009',
        location: 'Hyderabad',
        highlights: ['18 projects delivered', '4,200+ homes', 'RERA compliant'],
      },
      description:
        "Skyline Heights is a premium residential project in the heart of Gachibowli, Hyderabad's fastest-growing IT corridor. Spread across 4.2 acres with 3 iconic towers, it offers 2BHK, 3BHK, and 4BHK apartments designed for the modern professional.",
      isFeatured: true,
      published: true,
      showInSearch: true,
      visibility: 'published',
      milestones: aptMilestones,
    },
    {
      refCode: 'HZI-PR-0013',
      name: 'Green Valley Villas',
      projectType: ProjectType.Villa,
      developerName: 'Heritage Builders',
      city: 'Hyderabad',
      locality: 'Kokapet',
      status: ConstructionStatus.ReadyToMove,
      minPrice: '14000000',
      maxPrice: '28000000',
      pricePerUnitLabel: '₹5,000/sqft',
      unitsLabel: '64 villas',
      configLabel: '3, 4 BHK',
      totalUnits: 64,
      availableUnits: 8,
      possessionDate: 'Ready',
      reraNumber: 'P02400098765',
      reraVerified: true,
      bankCount: 5,
      enquiryCount: 42,
      gradientBg: 'linear-gradient(135deg,#fce7f3,#f0d4e8)',
      accentColor: '#be185d',
      approvedBanks: banks5,
      amenities: villaAmenities,
      configurations: [
        { type: '3 BHK Villa', area: '2,800 sqft', basePrice: '₹1.4Cr', allInclusive: '₹1.55Cr', availability: 'Available' },
        { type: '4 BHK Villa', area: '3,600 sqft', basePrice: '₹2.2Cr', allInclusive: '₹2.8Cr', availability: '6 left' },
      ],
      landmarks: [
        { name: 'Financial District', distance: '3.2 km' },
        { name: 'ORR Kokapet Exit', distance: '1.5 km' },
      ],
      developerInfo: { name: 'Heritage Builders', founded: '2012', location: 'Hyderabad', highlights: ['12 villa projects', 'Premium gated communities'] },
      description: 'Green Valley Villas offers spacious 3 and 4 BHK independent villas in Kokapet with premium finishes and a gated community lifestyle.',
      isFeatured: true,
      published: true,
      showInSearch: true,
      visibility: 'published',
    },
    {
      refCode: 'HZI-PR-0012',
      name: 'ORR Prime Venture',
      projectType: ProjectType.Venture,
      developerName: 'Greenfield Infra',
      city: 'Hyderabad',
      locality: 'Shamshabad',
      status: ConstructionStatus.ReadyToMove,
      minPrice: '1850000',
      maxPrice: '5800000',
      pricePerUnitLabel: '₹3,200/sqyd',
      unitsLabel: '249 plots',
      configLabel: '100–400 sqyds',
      totalUnits: 249,
      availableUnits: 84,
      reraVerified: false,
      bankCount: 4,
      enquiryCount: 128,
      gradientBg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
      accentColor: '#ca8a04',
      constructionProgress: 78,
      approvedBanks: banks4,
      infrastructure: infraFeatures,
      configurations: [
        { type: '30×40 ft', area: '133 sqyds', basePrice: '₹18.5L – ₹21L', availability: 'Available' },
        { type: '40×60 ft', area: '267 sqyds', basePrice: '₹37.2L – ₹42L', availability: 'Available' },
      ],
      legal: {
        approvalAuthority: 'HMDA',
        lpNumber: '142/LO/2023',
        surveyNumbers: 'Sy. 142, 143, 144',
        landUse: 'Residential (NA)',
        ecStatus: 'Clear title',
      },
      roadWidths: [
        { label: 'Main road', width: '60 ft (BT)' },
        { label: 'Internal roads', width: '40 ft (CC)' },
        { label: 'Lane roads', width: '30 ft' },
      ],
      landmarks: [{ name: 'ORR Exit 14', distance: '4 km' }, { name: 'Airport', distance: '8 km' }],
      developerInfo: { name: 'Greenfield Infra', founded: '2010', location: 'Hyderabad', highlights: ['HMDA approved layouts', '22+ ventures'] },
      description: 'ORR Prime Venture is an HMDA-approved plotted development near Shamshabad with excellent connectivity to the ORR and airport.',
      published: true,
      showInSearch: true,
      visibility: 'published',
    },
    {
      refCode: 'HZI-PR-0011',
      name: 'Serene Greens',
      projectType: ProjectType.VillaPlot,
      developerName: 'ABS Ventures',
      city: 'Bengaluru',
      locality: 'Devanahalli',
      status: ConstructionStatus.NewLaunch,
      minPrice: '2800000',
      maxPrice: '7200000',
      pricePerUnitLabel: '₹4,100/sqyd',
      unitsLabel: '186 plots',
      configLabel: '133–300 sqyds',
      totalUnits: 186,
      availableUnits: 142,
      reraVerified: true,
      bankCount: 3,
      enquiryCount: 56,
      gradientBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
      accentColor: '#16a34a',
      approvedBanks: banks3,
      infrastructure: infraFeatures.slice(0, 5),
      roadWidths: [
        { label: 'Main road', width: '50 ft' },
        { label: 'Internal roads', width: '30 ft' },
      ],
      legal: { approvalAuthority: 'BDA', lpNumber: 'BDA/2024/089', ecStatus: 'Clear title' },
      description: 'Serene Greens offers villa plots in Devanahalli near the airport corridor with green surroundings and gated community infrastructure.',
      published: true,
      showInSearch: true,
      visibility: 'published',
    },
    {
      refCode: 'HZI-PR-0010',
      name: 'Metro Heights — Tower B',
      projectType: ProjectType.Apartment,
      developerName: 'NCC Urban',
      city: 'Hyderabad',
      locality: 'Kondapur',
      status: ConstructionStatus.UnderConstruction,
      minPrice: '5200000',
      maxPrice: '8800000',
      pricePerUnitLabel: '₹4,800/sqft',
      unitsLabel: '180 units',
      configLabel: '2, 3 BHK',
      totalUnits: 180,
      availableUnits: 24,
      towers: 1,
      maxFloors: 15,
      possessionDate: 'Mar 2027',
      reraVerified: true,
      bankCount: 7,
      enquiryCount: 61,
      gradientBg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
      accentColor: '#2563eb',
      constructionProgress: 45,
      approvedBanks: [...banks6, 'Kotak Mahindra'],
      amenities: aptAmenities.slice(0, 8),
      configurations: [
        { type: '2 BHK', area: '1,050–1,150 sqft', basePrice: '₹50.4L – ₹55.2L', availability: 'Available' },
        { type: '3 BHK', area: '1,450–1,600 sqft', basePrice: '₹69.6L – ₹76.8L', availability: '18 left' },
      ],
      description: 'Metro Heights Tower B is a premium apartment tower in Kondapur with metro connectivity and modern amenities.',
      published: true,
      showInSearch: true,
      visibility: 'published',
      milestones: aptMilestones.slice(0, 5),
    },
    {
      refCode: 'HZI-PR-0009',
      name: 'Coastal Orchards',
      projectType: ProjectType.Villa,
      developerName: 'Coastal Developers',
      city: 'Chennai',
      locality: 'ECR',
      status: ConstructionStatus.UnderConstruction,
      minPrice: '11000000',
      maxPrice: '19000000',
      pricePerUnitLabel: '₹4,200/sqft',
      unitsLabel: '38 villas',
      configLabel: '3, 4 BHK',
      totalUnits: 38,
      availableUnits: 14,
      possessionDate: 'Jun 2027',
      reraVerified: true,
      bankCount: 5,
      enquiryCount: 28,
      gradientBg: 'linear-gradient(135deg,#fdf4ff,#e9d5ff)',
      accentColor: '#be185d',
      constructionProgress: 35,
      approvedBanks: banks5,
      amenities: villaAmenities,
      configurations: [
        { type: '3 BHK Villa', area: '2,400 sqft', basePrice: '₹1.1Cr', availability: 'Available' },
        { type: '4 BHK Villa', area: '3,200 sqft', basePrice: '₹1.9Cr', availability: '8 left' },
      ],
      description: 'Coastal Orchards brings luxury villas to the ECR corridor with sea breeze, landscaped gardens, and premium community amenities.',
      published: true,
      showInSearch: true,
      visibility: 'published',
    },
    {
      refCode: 'HZI-PR-0008',
      name: 'Whitefield Layout',
      projectType: ProjectType.Venture,
      developerName: 'Prestige Ventures',
      city: 'Bengaluru',
      locality: 'Whitefield',
      status: ConstructionStatus.ReadyToMove,
      minPrice: '3200000',
      maxPrice: '8600000',
      pricePerUnitLabel: '₹3,800/sqyd',
      unitsLabel: '312 plots',
      configLabel: '150–400 sqyds',
      totalUnits: 312,
      availableUnits: 96,
      reraVerified: true,
      bankCount: 6,
      enquiryCount: 94,
      gradientBg: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
      accentColor: '#ca8a04',
      constructionProgress: 92,
      approvedBanks: banks6,
      infrastructure: infraFeatures.map((f) => ({ ...f, status: f.status === 'Upcoming' ? 'Done' : f.status })),
      roadWidths: [
        { label: 'Main road', width: '80 ft (BT)' },
        { label: 'Internal roads', width: '40 ft (CC)' },
      ],
      legal: { approvalAuthority: 'BMRDA', lpNumber: 'WF/2022/045', ecStatus: 'Clear title' },
      description: 'Whitefield Layout is a ready-to-build plotted development in Whitefield with full infrastructure and bank loan approvals.',
      published: true,
      showInSearch: true,
      visibility: 'published',
    },
    {
      refCode: 'HZI-PR-0007',
      name: 'Palm Meadows',
      projectType: ProjectType.VillaPlot,
      developerName: 'Sumadhura Group',
      city: 'Hyderabad',
      locality: 'Kompally',
      status: ConstructionStatus.NewLaunch,
      minPrice: '2200000',
      maxPrice: '5500000',
      pricePerUnitLabel: '₹3,600/sqyd',
      unitsLabel: '144 plots',
      configLabel: '120–250 sqyds',
      totalUnits: 144,
      availableUnits: 118,
      reraVerified: true,
      bankCount: 4,
      enquiryCount: 38,
      gradientBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
      accentColor: '#16a34a',
      approvedBanks: banks4,
      infrastructure: infraFeatures.slice(0, 4),
      roadWidths: [
        { label: 'Main road', width: '40 ft' },
        { label: 'Internal roads', width: '30 ft' },
      ],
      legal: { approvalAuthority: 'DTCP', lpNumber: 'DTCP/KP/2024/12', ecStatus: 'Clear title' },
      description: 'Palm Meadows offers affordable villa plots in Kompally with gated community infrastructure and easy ORR access.',
      published: true,
      showInSearch: true,
      visibility: 'published',
    },
  ];
}
