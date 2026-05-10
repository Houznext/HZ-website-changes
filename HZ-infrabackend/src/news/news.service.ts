import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraNews } from './entities/infra-news.entity';
import { CreateNewsDto, UpdateNewsDto } from './dto/news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(InfraNews)
    private readonly repo: Repository<InfraNews>,
  ) {}

  list() {
    return this.repo.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
    });
  }

  async bySlug(slug: string): Promise<InfraNews> {
    const a = await this.repo.findOne({ where: { slug, published: true } });
    if (!a) throw new NotFoundException('Article not found');
    return a;
  }

  adminList() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  create(dto: CreateNewsDto) {
    const n = this.repo.create({
      ...dto,
      published: dto.published ?? false,
    });
    return this.repo.save(n);
  }

  async update(id: string, dto: UpdateNewsDto) {
    const n = await this.repo.findOne({ where: { articleId: id } });
    if (!n) throw new NotFoundException('Article not found');
    Object.assign(n, dto);
    return this.repo.save(n);
  }
}
