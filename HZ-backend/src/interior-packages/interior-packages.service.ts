import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InteriorPackage } from './entities/interior-package.entity';
import {
  CreateInteriorPackageDto,
  UpdateInteriorPackageDto,
} from './dto/interior-package.dto';

@Injectable()
export class InteriorPackagesService implements OnModuleInit {
  constructor(
    @InjectRepository(InteriorPackage)
    private readonly repo: Repository<InteriorPackage>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      const { DEFAULT_PACKAGES } = await import('./interior-packages.seed');
      for (const pkg of DEFAULT_PACKAGES) {
        await this.repo.save(this.repo.create(pkg));
      }
    }
  }

  findAll(activeOnly = false): Promise<InteriorPackage[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.repo.find({ where, order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  findOne(id: string): Promise<InteriorPackage | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateInteriorPackageDto): Promise<InteriorPackage> {
    const pkg = this.repo.create(dto);
    return this.repo.save(pkg);
  }

  async update(id: string, dto: UpdateInteriorPackageDto): Promise<InteriorPackage | null> {
    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
