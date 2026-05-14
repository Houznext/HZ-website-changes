import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InfraBranch } from '../infra-branch/entities/infra-branch.entity';
import { InfraBranchRole } from './entities/infra-branch-role.entity';
import { InfraBranchRolePermission } from '../infra-branch-role-permission/entities/infra-branch-role-permission.entity';
import {
  CreateInfraBranchRoleDto,
  UpdateInfraBranchRoleDto,
  UpsertInfraBranchRolePermissionsDto,
} from './dto/infra-branch-role.dto';
import { getAllInfraResources } from '../infra-permission/enum/infra-permission.enum';

@Injectable()
export class InfraBranchRoleService {
  constructor(
    @InjectRepository(InfraBranchRole)
    private readonly roleRepo: Repository<InfraBranchRole>,
    @InjectRepository(InfraBranch)
    private readonly branchRepo: Repository<InfraBranch>,
    @InjectRepository(InfraBranchRolePermission)
    private readonly permRepo: Repository<InfraBranchRolePermission>,
    private readonly dataSource: DataSource,
  ) {}

  private assertValidResource(resource: string) {
    const valid = getAllInfraResources();
    if (!valid.includes(resource as (typeof valid)[number])) {
      throw new BadRequestException(`Invalid permission resource: ${resource}`);
    }
  }

  async seedDefaultPermissions(role: InfraBranchRole, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(InfraBranchRolePermission) : this.permRepo;
    const allResources = getAllInfraResources();
    let rows: Partial<InfraBranchRolePermission>[];

    switch (role.roleName) {
      case 'Super Admin':
        rows = allResources.map((resource) => ({
          branchRole: role,
          resource,
          view: true,
          create: true,
          edit: true,
          delete: true,
        }));
        break;
      case 'Admin':
        rows = allResources.map((resource) => ({
          branchRole: role,
          resource,
          view: true,
          create: true,
          edit: true,
          delete: false,
        }));
        break;
      case 'Sales Executive':
        rows = [
          { branchRole: role, resource: 'crm_lead', view: true, create: true, edit: true, delete: false },
          { branchRole: role, resource: 'enquiry', view: true, create: true, edit: true, delete: false },
          { branchRole: role, resource: 'site_visit', view: true, create: true, edit: true, delete: false },
          { branchRole: role, resource: 'property', view: true, create: false, edit: false, delete: false },
        ];
        break;
      case 'Property Manager':
        rows = [
          { branchRole: role, resource: 'property', view: true, create: true, edit: true, delete: false },
          { branchRole: role, resource: 'property_approval', view: true, create: false, edit: true, delete: false },
          { branchRole: role, resource: 'project', view: true, create: true, edit: true, delete: false },
          { branchRole: role, resource: 'rera_docs', view: true, create: true, edit: true, delete: false },
        ];
        break;
      default:
        rows = allResources.map((resource) => ({
          branchRole: role,
          resource,
          view: true,
          create: false,
          edit: false,
          delete: false,
        }));
    }

    await repo.save(rows.map((r) => repo.create(r)));
  }

  async create(dto: CreateInfraBranchRoleDto): Promise<InfraBranchRole> {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    const existing = await this.roleRepo.findOne({
      where: { branch: { id: dto.branchId }, roleName: dto.roleName },
    });
    if (existing) throw new ConflictException('Role name already exists for this branch');

    return this.dataSource.transaction(async (manager) => {
      const role = manager.create(InfraBranchRole, {
        branch,
        roleName: dto.roleName,
        isBranchHead: !!dto.isBranchHead,
      });
      const saved = await manager.save(role);
      if (dto.permissions?.length) {
        for (const p of dto.permissions) this.assertValidResource(p.resource);
        const perms = dto.permissions.map((p) =>
          manager.create(InfraBranchRolePermission, {
            branchRole: saved,
            resource: p.resource,
            view: !!p.view,
            create: !!p.create,
            edit: !!p.edit,
            delete: !!p.delete,
          }),
        );
        await manager.save(perms);
      } else if (dto.seedDefaultPermissions !== false) {
        await this.seedDefaultPermissions(saved, manager);
      }
      return manager.findOneOrFail(InfraBranchRole, {
        where: { id: saved.id },
        relations: ['permissions', 'branch'],
      });
    });
  }

  findByBranch(branchId: string) {
    return this.roleRepo.find({
      where: { branch: { id: branchId } },
      relations: ['permissions', 'branch'],
      order: { roleName: 'ASC' },
    });
  }

  findAll(branchId?: string) {
    if (branchId) return this.findByBranch(branchId);
    return this.roleRepo.find({
      relations: ['permissions', 'branch'],
      order: { roleName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<InfraBranchRole> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions', 'branch'],
    });
    if (!role) throw new NotFoundException('Branch role not found');
    return role;
  }

  async update(id: string, dto: UpdateInfraBranchRoleDto): Promise<InfraBranchRole> {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['branch'] });
    if (!role) throw new NotFoundException('Branch role not found');
    if (dto.roleName) {
      const dup = await this.roleRepo.findOne({
        where: { branch: { id: role.branch.id }, roleName: dto.roleName },
      });
      if (dup && dup.id !== id) throw new ConflictException('Role name already exists for this branch');
      role.roleName = dto.roleName;
    }
    if (dto.isBranchHead !== undefined) role.isBranchHead = dto.isBranchHead;
    await this.roleRepo.save(role);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Branch role not found');
    return this.dataSource.transaction(async (manager) => {
      await manager.delete(InfraBranchRolePermission, { branchRole: { id } });
      await manager.delete(InfraBranchRole, { id });
      return { message: 'Branch role deleted' };
    });
  }

  async upsertPermissions(id: string, dto: UpsertInfraBranchRolePermissionsDto): Promise<InfraBranchRole> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Branch role not found');
    for (const p of dto.permissions) this.assertValidResource(p.resource);

    return this.dataSource.transaction(async (manager) => {
      const permRepo = manager.getRepository(InfraBranchRolePermission);
      const existing = await permRepo.find({ where: { branchRole: { id } } });
      const mapExisting = new Map(existing.map((e) => [e.resource, e]));
      const toSave: InfraBranchRolePermission[] = [];
      const seen = new Set<string>();

      for (const p of dto.permissions) {
        seen.add(p.resource);
        const prev = mapExisting.get(p.resource);
        if (prev) {
          prev.view = !!p.view;
          prev.create = !!p.create;
          prev.edit = !!p.edit;
          prev.delete = !!p.delete;
          toSave.push(prev);
        } else {
          toSave.push(
            permRepo.create({
              branchRole: { id } as never,
              resource: p.resource,
              view: !!p.view,
              create: !!p.create,
              edit: !!p.edit,
              delete: !!p.delete,
            }),
          );
        }
      }
      if (toSave.length) await permRepo.save(toSave);
      if (dto.replaceMissing !== false) {
        const toRemove = existing.filter((e) => !seen.has(e.resource));
        if (toRemove.length) await permRepo.remove(toRemove);
      }
      return manager.findOneOrFail(InfraBranchRole, {
        where: { id },
        relations: ['permissions', 'branch'],
      });
    });
  }
}
