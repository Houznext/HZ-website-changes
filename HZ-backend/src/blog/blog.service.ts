import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import {
  CreateBlogDto,
  UpdateBlogDto,
  GetAllBlogDto,
  GetByIdBlogDto,
} from './dto/blog.dto';
import { S3Service } from 'src/common/s3/s3.service';
import { SEED_BLOGS } from './blog-seed-data';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const blog = this.blogRepository.create(createBlogDto);
    return this.blogRepository.save(blog);
  }

  async findAll(query: GetAllBlogDto): Promise<{ blogs: Blog[]; total: number }> {
    const where: any = {};

    if (query.blogType) {
      const types = Array.isArray(query.blogType) ? query.blogType : [query.blogType];
      where['blogType'] = types.length === 1 ? types[0] : In(types);
    }

    if (query.blogStatus) {
      const statuses = Array.isArray(query.blogStatus) ? query.blogStatus : [query.blogStatus];
      where['blogStatus'] = statuses.length === 1 ? statuses[0] : In(statuses);
    }

    if (query.search) {
      where['title'] = ILike(`%${query.search}%`);
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const [blogs, total] = await this.blogRepository.findAndCount({
      where,
      relations: query.includeCreatedUser || query.includeUpdatedUser
        ? ['createdUser', 'updatedUser']
        : [],
      order: { [sortField]: sortOrder },
      skip: query.skip || 0,
      take: query.take || 100,
    });

    return { blogs, total };
  }

  async findOne(id: string, query: GetByIdBlogDto): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: query.includeCreatedUser || query.includeUpdatedUser
        ? ['createdUser', 'updatedUser']
        : [],
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const existing = await this.blogRepository.findOneBy({ id });
    if (!existing) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // When image URLs are changed, delete old files from S3
    if (updateBlogDto.thumbnailImageUrl !== undefined && existing.thumbnailImageUrl && updateBlogDto.thumbnailImageUrl !== existing.thumbnailImageUrl) {
      try {
        await this.s3Service.deleteFileByUrl(existing.thumbnailImageUrl);
      } catch (err) {
        console.warn('Failed to delete old blog thumbnail from S3:', err);
      }
    }
    if (updateBlogDto.CoverImageUrl !== undefined && existing.CoverImageUrl && updateBlogDto.CoverImageUrl !== existing.CoverImageUrl) {
      try {
        await this.s3Service.deleteFileByUrl(existing.CoverImageUrl);
      } catch (err) {
        console.warn('Failed to delete old blog cover image from S3:', err);
      }
    }

    const blog = await this.blogRepository.preload({
      id,
      ...updateBlogDto,
    });
    return this.blogRepository.save(blog);
  }

  async seedBlogs(): Promise<{ created: number; failed: number }> {
    let created = 0;
    let failed = 0;

    for (const dto of SEED_BLOGS) {
      try {
        const blog = this.blogRepository.create(dto);
        await this.blogRepository.save(blog);
        created++;
      } catch {
        failed++;
      }
    }

    return { created, failed };
  }

  async remove(id: string): Promise<void> {
    const blog = await this.blogRepository.findOneBy({ id });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    if (blog.thumbnailImageUrl) {
      try {
        await this.s3Service.deleteFileByUrl(blog.thumbnailImageUrl);
      } catch (err) {
        console.warn('Failed to delete blog thumbnail from S3:', err);
      }
    }
    if (blog.CoverImageUrl) {
      try {
        await this.s3Service.deleteFileByUrl(blog.CoverImageUrl);
      } catch (err) {
        console.warn('Failed to delete blog cover image from S3:', err);
      }
    }

    await this.blogRepository.remove(blog);
  }
}
