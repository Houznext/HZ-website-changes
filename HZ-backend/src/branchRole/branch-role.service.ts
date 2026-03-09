import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, In } from 'typeorm';

import { BranchRole } from './entities/branch-role.entity';
import { Branch } from 'src/branch/entities/branch.entity';

import { PermissionResourceEnum } from 'src/permission/enum/permission.enum';
import { RESOURCE_GROUPS } from 'src/user/dto/user.dto';

import { BranchRolePermission } from 'src/branch-role-permission/entities/branch-role.-permission.entity';
import {
  CreateBranchRoleDto,
  UpdateBranchRoleDto,
  UpsertPermissionsDto,
} from './dtos/branch-role.dto';

@Injectable()
export class BranchRoleService {
  constructor(
    @InjectRepository(BranchRole)
    private readonly branchRoleRepo: Repository<BranchRole>,

    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,

    @InjectRepository(BranchRolePermission)
    private readonly brPermRepo: Repository<BranchRolePermission>,

    private readonly dataSource: DataSource,
  ) {}

  // ---------- CREATE ----------
  async create(dto: CreateBranchRoleDto): Promise<BranchRole> {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

    const existing = await this.branchRoleRepo.findOne({
      where: { branch: { id: dto.branchId }, roleName: dto.roleName },
    });
    if (existing) throw new ConflictException('Role name already exists for this branch');

    return this.dataSource.transaction(async (manager) => {
      const role = manager.create(BranchRole, {
        branch,
        roleName: dto.roleName,
        isBranchHead: !!dto.isBranchHead,
      });

      const savedRole = await manager.save(role);

      if (dto.permissions?.length) {
        const perms = dto.permissions.map((p) => {
          this.assertValidResource(p.resource as PermissionResourceEnum);
          return manager.create(BranchRolePermission, {
            branchRole: savedRole, // ✅ FK set here
            resource: p.resource,
            view: !!p.view,
            create: !!p.create,
            edit: !!p.edit,
            delete: !!p.delete,
          });
        });
        await manager.save(perms);
      } else if (dto.seedDefaultPermissions !== false) {
        await this.ensureDefaultPermissionsForBranchRole(manager, savedRole);
      }

      return manager.findOne(BranchRole, {
        where: { id: savedRole.id },
        relations: ['permissions', 'branch'],
      });
    });
  }

  // ---------- READ ----------
  async findAll(branchId?: string) {
    if (branchId) {
      return this.branchRoleRepo.find({
        where: { branch: { id: branchId } },
        relations: ['permissions', 'branch'],
        order: { roleName: 'ASC' },
      });
    }
    return this.branchRoleRepo.find({
      relations: ['permissions', 'branch'],
      order: { roleName: 'ASC' },
    });
  }

  async findOne(id: string) {
    const role = await this.branchRoleRepo.findOne({
      where: { id },
      relations: ['permissions', 'branch'],
    });
    if (!role) throw new NotFoundException('BranchRole not found');
    return role;
  }

  // ---------- UPDATE ----------
  async update(id: string, dto: UpdateBranchRoleDto) {
    const role = await this.branchRoleRepo.findOne({
      where: { id },
      relations: ['branch'],
    });
    if (!role) throw new NotFoundException('BranchRole not found');

    if (dto.roleName) {
      const dup = await this.branchRoleRepo.findOne({
        where: { branch: { id: role.branch.id }, roleName: dto.roleName },
      });
      if (dup && dup.id !== id) {
        throw new ConflictException('Role name already exists for this branch');
      }
    }

    role.roleName = dto.roleName ?? role.roleName;
    role.isBranchHead = dto.isBranchHead ?? role.isBranchHead;

    await this.branchRoleRepo.save(role);
    return this.findOne(id);
  }

  // ---------- DELETE ----------
  async remove(id: string) {
    const role = await this.branchRoleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('BranchRole not found');

    return this.dataSource.transaction(async (manager) => {
      await manager.delete(BranchRolePermission, { branchRole: { id } }); // ✅ correct FK filter
      await manager.delete(BranchRole, { id });
      return { message: 'BranchRole deleted' };
    });
  }

  // ---------- PERMISSIONS UPSERT ----------
  async upsertPermissions(id: string, dto: UpsertPermissionsDto) {
    const role = await this.branchRoleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('BranchRole not found');

    for (const p of dto.permissions)
      this.assertValidResource(p.resource as PermissionResourceEnum);

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.find(BranchRolePermission, {
        where: { branchRole: { id } },
      });

      const mapExisting = new Map(existing.map((e) => [e.resource, e]));
      const toSave: BranchRolePermission[] = [];
      const seen = new Set<string>();

      for (const p of dto.permissions) {
        const prev = mapExisting.get(p.resource);
        seen.add(p.resource);

        if (prev) {
          prev.view = !!p.view;
          prev.create = !!p.create;
          prev.edit = !!p.edit;
          prev.delete = !!p.delete;
          toSave.push(prev);
        } else {
          toSave.push(
            manager.create(BranchRolePermission, {
              branchRole: { id } as any, // ✅ FK set
              resource: p.resource,
              view: !!p.view,
              create: !!p.create,
              edit: !!p.edit,
              delete: !!p.delete,
            }),
          );
        }
      }

      if (toSave.length) await manager.save(toSave);

      if (dto.replaceMissing !== false) {
        const toRemove = existing.filter((e) => !seen.has(e.resource));
        if (toRemove.length) await manager.remove(BranchRolePermission, toRemove);
      }

      return manager.findOne(BranchRole, {
        where: { id },
        relations: ['permissions', 'branch'],
      });
    });
  }

  async deletePermission(id: string, resource: string) {
    const role = await this.branchRoleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('BranchRole not found');

    this.assertValidResource(resource as PermissionResourceEnum);

    const perm = await this.brPermRepo.findOne({
      where: { branchRole: { id }, resource },
    });
    if (!perm) throw new NotFoundException('Permission not found for this resource');

    await this.brPermRepo.delete(perm.id);
    return this.findOne(id);
  }

  // ---------- HELPERS ----------
  private assertValidResource(resource: PermissionResourceEnum) {
    const valid = Object.values(PermissionResourceEnum) as string[];
    if (!valid.includes(resource as unknown as string)) {
      throw new BadRequestException(
        `Resource "${resource}" is not a valid permission-controlled entity.`,
      );
    }
  }

  private async ensureDefaultPermissionsForBranchRole(
    manager: EntityManager,
    role: BranchRole,
  ) {
    const byRole: Record<string, string[]> = {
      OrgAdmin: Object.keys(RESOURCE_GROUPS),
      BranchAdmin: ['company_property', 'property', 'careers'],
      SalesExecutive: ['property', 'property_lead', 'crm'],
      CBManager: ['custom_builder', 'cb_query', 'custom_builder_project_manager'],
    };

    const expand = (keys: string[]) =>
      keys.flatMap((k) => (RESOURCE_GROUPS[k] ? RESOURCE_GROUPS[k] : [k]));

    const keys = byRole[role.roleName] ?? [];
    if (!keys.length) return;

    const resources = expand(keys);

    for (const r of resources)
      this.assertValidResource(r as PermissionResourceEnum);

    const existing = await manager.find(BranchRolePermission, {
      where: { branchRole: { id: role.id } },
    });
    const existingSet = new Set(existing.map((e) => e.resource));

    const toCreate = resources
      .filter((r) => !existingSet.has(r))
      .map((resource) =>
        manager.create(BranchRolePermission, {
          branchRole: role, // ✅ FK set
          resource,
          view: true,
          create: true,
          edit: true,
          delete: true,
        }),
      );

    if (toCreate.length) await manager.save(toCreate);
  }

  // ✅ This is what your BranchService is calling
  async getOrCreateSuperAdminRole(params: {
    branchId: string;
    roleName: string;
    resources: PermissionResourceEnum[];
  }): Promise<BranchRole> {
    const { branchId, roleName, resources } = params;

    let role = await this.branchRoleRepo.findOne({
      where: { branch: { id: branchId }, roleName },
      relations: ['permissions'],
    });

    if (role) {
      await this.syncPermissions(role.id, resources);
      return this.findOne(role.id);
    }

    // create role
    role = await this.branchRoleRepo.save(
      this.branchRoleRepo.create({
        roleName,
        branch: { id: branchId } as any,
        isBranchHead: true,
      }),
    );

    // create permissions
    await this.createPermissions(role.id, resources);

    return this.findOne(role.id);
  }

  // ✅ FIXED: no more id misuse
  private async syncPermissions(roleId: string, resources: PermissionResourceEnum[]) {
    const existing = await this.brPermRepo.find({
      where: { branchRole: { id: roleId } },
    });

    const existingSet = new Set(existing.map((p) => p.resource));
    const targetSet = new Set(resources);

    const toAdd = resources.filter((r) => !existingSet.has(r));
    const toRemove = existing
      .filter((p) => !targetSet.has(p.resource as PermissionResourceEnum))
      .map((p) => p.resource);

    if (toAdd.length) {
      await this.brPermRepo.save(
        toAdd.map((resource) =>
          this.brPermRepo.create({
            branchRole: { id: roleId } as any, // ✅ FK set
            resource,
            view: true,
            create: true,
            edit: true,
            delete: true,
          }),
        ),
      );
    }

    if (toRemove.length) {
      await this.brPermRepo.delete({
        branchRole: { id: roleId } as any, // ✅ FK set
        resource: In(toRemove as any),
      });
    }
  }

  // ✅ FIXED: create permissions with proper FK
  private async createPermissions(roleId: string, resources: PermissionResourceEnum[]) {
    const rows = resources.map((resource) =>
      this.brPermRepo.create({
        branchRole: { id: roleId } as any, // ✅ FK set
        resource,
        view: true,
        create: true,
        edit: true,
        delete: true,
      }),
    );

    await this.brPermRepo.save(rows);
  }
}
