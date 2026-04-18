import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceContent } from './entities/service-content.entity';
import { UpdateServiceContentDto } from './dto/update-service-content.dto';

const DEFAULTS: Partial<ServiceContent>[] = [
  {
    slug: 'full-home-interiors',
    cardTitle: 'Full Home Interiors',
    cardDescription:
      'Complete turnkey interior solutions — from design to handover. Every room, every detail, managed by us.',
    cardImageUrl: '',
    cardBadge: 'Most Popular',
    heroHeadline:
      'Complete home interiors, designed and executed the right way',
    heroSubheading:
      "Designing a home is not just about how it looks — it's about how it works for your everyday life. At Houznext, we handle everything from design to execution across India.",
    heroImageUrl: '',
    heroEyebrow: 'Full Home Interiors',
    heroCta: 'Get Free Design & Estimate',
    sortOrder: 0,
    active: true,
  },
  {
    slug: 'modular-kitchen',
    cardTitle: 'Modular Kitchen & Wardrobes',
    cardDescription:
      'Smart, space-efficient kitchens and storage solutions designed for everyday living and lasting quality.',
    cardImageUrl: '',
    cardBadge: 'Storage Solutions',
    heroHeadline: 'Smart kitchens and storage designed for everyday living',
    heroSubheading:
      'A well-designed kitchen and wardrobe can completely change how your home feels and functions. We offer modular solutions that are practical, space-efficient, and built for daily use.',
    heroImageUrl: '',
    heroEyebrow: 'Modular Kitchen & Wardrobes',
    heroCta: 'Talk to our design team',
    sortOrder: 1,
    active: true,
  },
  {
    slug: '2bhk-3bhk-packages',
    cardTitle: '2BHK / 3BHK Interior Packages',
    cardDescription:
      'Clear, fixed-price packages for your home. Know exactly what you get and what you pay — before work begins.',
    cardImageUrl: '',
    cardBadge: 'Budget Friendly',
    heroHeadline: 'Interior packages that fit your home and budget',
    heroSubheading:
      'Planning interiors can feel confusing — especially pricing and scope. At Houznext we simplify this with clear packages, so you know exactly what to expect.',
    heroImageUrl: '',
    heroEyebrow: '2BHK / 3BHK Packages',
    heroCta: 'Check your home interior cost',
    sortOrder: 2,
    active: true,
  },
  {
    slug: 'commercial-interiors',
    cardTitle: 'Commercial Interiors',
    cardDescription:
      'Functional, modern office and retail spaces designed to match your business goals and team culture.',
    cardImageUrl: '',
    cardBadge: 'Commercial',
    heroHeadline: 'Interiors designed to work for your business',
    heroSubheading:
      'Commercial spaces need to be functional, efficient, and aligned with your business goals. Houznext provides commercial interior design services that are practical, modern, and comfortable.',
    heroImageUrl: '',
    heroEyebrow: 'Commercial Interiors',
    heroCta: 'Plan your commercial space',
    sortOrder: 3,
    active: true,
  },
];

@Injectable()
export class ServicesContentService implements OnModuleInit {
  constructor(
    @InjectRepository(ServiceContent)
    private repo: Repository<ServiceContent>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const d of DEFAULTS) {
        await this.repo.save(this.repo.create(d));
      }
    }
  }

  async findAll(): Promise<ServiceContent[]> {
    return this.repo.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findPublic(): Promise<ServiceContent[]> {
    return this.repo.find({
      where: { active: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<ServiceContent | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findPublicBySlug(slug: string): Promise<ServiceContent | null> {
    return this.repo.findOne({ where: { slug, active: true } });
  }

  async update(
    id: number,
    dto: UpdateServiceContentDto,
  ): Promise<ServiceContent> {
    await this.repo.update(id, dto);
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Service content ${id} not found`);
    }
    return row;
  }

  async uploadImage(
    id: number,
    field: 'cardImageUrl' | 'heroImageUrl',
    url: string,
  ): Promise<ServiceContent> {
    await this.repo.update(id, { [field]: url });
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Service content ${id} not found`);
    }
    return row;
  }
}
