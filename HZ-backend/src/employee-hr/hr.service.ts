// src/hr/hr.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EmployeeHrDetails } from './entity/employee-hr.entity';
import { CreateHrDetailsDto ,UpdateHrDetailsDto,ListHrDetailsQueryDto} from './dto/employee-hr.dto';

import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(EmployeeHrDetails)
    private readonly hrRepo: Repository<EmployeeHrDetails>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  
  private applyPatch<T extends object>(entity: T, dto: Partial<T>): void {
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined) {
        (entity as any)[key] = value;
      }
    });
  }

 
  async upsertForUser(
    userId: string,
    dto: CreateHrDetailsDto | UpdateHrDetailsDto,
    options?: { allowBranchChange?: boolean },
  ): Promise<EmployeeHrDetails> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let hr = await this.hrRepo.findOne({
      where: { user: { id: userId } },
      relations: ['branch', 'user'],
    });

    if (!hr) {
      hr = this.hrRepo.create({ user });
    }

    
    if (options?.allowBranchChange && dto.branchId) {
      const branch = await this.branchRepo.findOne({
        where: { id: dto.branchId },
      });
      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
      hr.branch = branch;
    }

    
    const { branchId, ...rest } = dto as any;

    this.applyPatch(hr, rest);

    return this.hrRepo.save(hr);
  }

  async findByUserId(userId: string): Promise<EmployeeHrDetails> {
    const hr = await this.hrRepo.findOne({
      where: { user: { id: userId } },
      relations: ['branch', 'user'],
    });
    if (!hr) throw new NotFoundException('HR details not found');
    return hr;
  }

  async findAll(query: ListHrDetailsQueryDto): Promise<EmployeeHrDetails[]> {
    const qb = this.hrRepo
      .createQueryBuilder('hr')
      .leftJoinAndSelect('hr.user', 'user')
      .leftJoinAndSelect('hr.branch', 'branch');

    this.applyFilters(qb, query);

    return qb.getMany();
  }

  private applyFilters(
    qb: SelectQueryBuilder<EmployeeHrDetails>,
    query: ListHrDetailsQueryDto,
  ) {
    const { branchId, employmentType, search } = query;

    if (branchId) {
      qb.andWhere('branch.id = :branchId', { branchId });
    }

    if (employmentType) {
      qb.andWhere('hr.employmentType = :employmentType', { employmentType });
    }

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(user.firstName) LIKE :q OR LOWER(user.lastName) LIKE :q OR LOWER(user.email) LIKE :q OR CAST(user.phone AS text) LIKE :q)',
        { q },
      );
    }
  }
}
