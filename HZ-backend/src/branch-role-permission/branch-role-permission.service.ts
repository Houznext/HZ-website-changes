import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { DataSource, Repository } from 'typeorm';
import { BranchRolePermission } from './entities/branch-role.-permission.entity';
import { CreateBranchRolePermissionDto, UpdateBranchRolePermissionDto } from './dto/branch-role-permission.dto';

@Injectable()
export class BranchRolePermissionService {
  constructor(
    private readonly ds: DataSource,
    @InjectRepository(BranchRolePermission) private readonly repo: Repository<BranchRolePermission>,
    @InjectRepository(BranchRole) private readonly brRepo: Repository<BranchRole>,
  ) {}

  async create(dto: CreateBranchRolePermissionDto) {
    const br = await this.brRepo.findOne({ where: { id: dto.branchRoleId } });
    if (!br) throw new NotFoundException('BranchRole not found');

    const dup = await this.repo.findOne({ where: { branchRole: { id: br.id }, resource: dto.resource }, relations: { branchRole: true } });
    if (dup) throw new ConflictException('Permission for this resource already exists on this role');

    const perm = this.repo.create({
      branchRole: br,
      resource: dto.resource,
      view: !!dto.view, create: !!dto.create, edit: !!dto.edit, delete: !!dto.delete,
    });
    return this.repo.save(perm);
  }

  async findAll(params?: { branchRoleId?: number; resource?: string }) {
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.branchRole', 'br')
      .orderBy('p.id', 'DESC');
    if (params?.branchRoleId) qb.andWhere('br.id = :rid', { rid: params.branchRoleId });
    if (params?.resource) qb.andWhere('p.resource ILIKE :re', { re: `%${params.resource}%` });
    return qb.getMany();
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: { branchRole: true } });
    if (!p) throw new NotFoundException('Permission not found');
    return p;
  }

  async update(id: string, dto: UpdateBranchRolePermissionDto) {
    const p = await this.findOne(id);

    return this.ds.transaction(async (m) => {
      if (dto.branchRoleId && dto.branchRoleId !== p.branchRole.id) {
        const br = await m.findOne(BranchRole, { where: { id: dto.branchRoleId } });
        if (!br) throw new NotFoundException('BranchRole not found');
        p.branchRole = br;
      }
      if (dto.resource && dto.resource !== p.resource) {
        const dup = await m.findOne(BranchRolePermission, {
          where: { branchRole: { id: p.branchRole.id }, resource: dto.resource },
          relations: { branchRole: true },
        });
        if (dup) throw new ConflictException('Permission for this resource already exists on this role');
        p.resource = dto.resource;
      }
      if (dto.view !== undefined) p.view = dto.view;
      if (dto.create !== undefined) p.create = dto.create;
      if (dto.edit !== undefined) p.edit = dto.edit;
      if (dto.delete !== undefined) p.delete = dto.delete;

      await m.save(p);
      return this.findOne(id);
    });
  }

  async remove(id: string) {
    const p = await this.findOne(id);
    await this.repo.delete(p.id);
    return { success: true };
  }
}
