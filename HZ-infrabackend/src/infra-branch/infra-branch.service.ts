import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { InfraBranch } from './entities/infra-branch.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { InfraUserBranchMembership } from './entities/infra-user-branch-membership.entity';
import { InfraBranchRole } from '../infra-branch-role/entities/infra-branch-role.entity';
import {
  AssignInfraUserToBranchDto,
  CreateInfraBranchDto,
  UpdateInfraBranchDto,
  UpdateInfraBranchMembershipRolesDto,
} from './dto/infra-branch.dto';

const TREE_RELATIONS = [
  'children',
  'children.children',
  'children.children.children',
  'children.children.children.children',
  'branchRoles',
] as const;

@Injectable()
export class InfraBranchService {
  constructor(
    @InjectRepository(InfraBranch)
    private readonly branchRepo: Repository<InfraBranch>,
    @InjectRepository(InfraUserBranchMembership)
    private readonly membershipRepo: Repository<InfraUserBranchMembership>,
    @InjectRepository(InfraUser)
    private readonly userRepo: Repository<InfraUser>,
    @InjectRepository(InfraBranchRole)
    private readonly branchRoleRepo: Repository<InfraBranchRole>,
  ) {}

  async create(dto: CreateInfraBranchDto, createdById?: string): Promise<InfraBranch> {
    let parent: InfraBranch | null = null;
    if (dto.parentId) {
      parent = await this.branchRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent branch not found');
    }
    const branch = this.branchRepo.create({
      name: dto.name,
      level: dto.level,
      parent: parent ?? undefined,
      path: 'temp',
      category: dto.category ?? null,
      stateId: dto.stateId ?? null,
      cityId: dto.cityId ?? null,
      branchAddress: dto.branchAddress ?? null,
      branchPhone: dto.branchPhone ?? null,
      branchEmail: dto.branchEmail ?? null,
      isHeadOffice: dto.isHeadOffice ?? false,
      isStateHQ: dto.isStateHQ ?? false,
      isActive: dto.isActive ?? true,
      createdById: createdById ?? null,
    });
    const saved = await this.branchRepo.save(branch);
    saved.path = parent ? `${parent.path}.${saved.id}` : saved.id;
    return this.branchRepo.save(saved);
  }

  findAll(): Promise<InfraBranch[]> {
    return this.branchRepo.find({
      order: { createdAt: 'ASC' },
      relations: ['parent', 'branchRoles'],
    });
  }

  async getTree(): Promise<InfraBranch[]> {
    return this.branchRepo.find({
      where: { parent: IsNull() },
      relations: [...TREE_RELATIONS],
      order: { createdAt: 'ASC' },
    });
  }

  async getHierarchy(): Promise<
    {
      id: string;
      name: string;
      level: string;
      path: string;
      parentId: string | null;
      depth: number;
      isActive: boolean;
    }[]
  > {
    const rows = await this.branchRepo.find({
      relations: ['parent'],
      order: { path: 'ASC' },
    });
    return rows.map((b) => ({
      id: b.id,
      name: b.name,
      level: b.level,
      path: b.path,
      parentId: b.parent?.id ?? null,
      depth: b.path.split('.').filter(Boolean).length,
      isActive: b.isActive,
    }));
  }

  async findOne(id: string): Promise<InfraBranch> {
    const b = await this.branchRepo.findOne({
      where: { id },
      relations: ['parent', 'children', 'branchRoles', 'branchRoles.permissions'],
    });
    if (!b) throw new NotFoundException('Branch not found');
    return b;
  }

  async update(id: string, dto: UpdateInfraBranchDto): Promise<InfraBranch> {
    const branch = await this.branchRepo.findOne({ where: { id }, relations: ['parent'] });
    if (!branch) throw new NotFoundException('Branch not found');
    if (dto.parentId !== undefined && dto.parentId !== branch.parent?.id) {
      throw new BadRequestException('Changing parent is not supported via PATCH; recreate branch.');
    }
    if (dto.name !== undefined) branch.name = dto.name;
    if (dto.level !== undefined) branch.level = dto.level;
    if (dto.category !== undefined) branch.category = dto.category;
    if (dto.stateId !== undefined) branch.stateId = dto.stateId;
    if (dto.cityId !== undefined) branch.cityId = dto.cityId;
    if (dto.branchAddress !== undefined) branch.branchAddress = dto.branchAddress;
    if (dto.branchPhone !== undefined) branch.branchPhone = dto.branchPhone;
    if (dto.branchEmail !== undefined) branch.branchEmail = dto.branchEmail;
    if (dto.isActive !== undefined) branch.isActive = dto.isActive;
    if (dto.isHeadOffice !== undefined) branch.isHeadOffice = dto.isHeadOffice;
    if (dto.isStateHQ !== undefined) branch.isStateHQ = dto.isStateHQ;
    return this.branchRepo.save(branch);
  }

  async remove(id: string): Promise<{ message: string }> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    branch.isActive = false;
    await this.branchRepo.save(branch);
    return { message: 'Branch deactivated' };
  }

  async assignUser(dto: AssignInfraUserToBranchDto): Promise<InfraUserBranchMembership> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    let m = await this.membershipRepo.findOne({
      where: { user: { id: user.id }, branch: { id: branch.id } },
      relations: ['branchRoles'],
    });
    if (!m) {
      m = this.membershipRepo.create({
        user,
        branch,
        isBranchHead: dto.isBranchHead ?? false,
        isPrimary: dto.isPrimary ?? false,
      });
    } else {
      m.isBranchHead = dto.isBranchHead ?? m.isBranchHead;
      m.isPrimary = dto.isPrimary ?? m.isPrimary;
    }
    const saved = await this.membershipRepo.save(m);
    if (dto.branchRoleIds?.length) {
      const roles = await this.branchRoleRepo.find({ where: { id: In(dto.branchRoleIds) } });
      saved.branchRoles = roles;
      await this.membershipRepo.save(saved);
    }
    return this.membershipRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['branch', 'branchRoles', 'branchRoles.permissions', 'user'],
    });
  }

  async listUsersInBranch(branchId: string) {
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return this.membershipRepo.find({
      where: { branch: { id: branchId } },
      relations: ['user', 'branchRoles'],
    });
  }

  async updateUserRolesInBranch(
    branchId: string,
    userId: string,
    dto: UpdateInfraBranchMembershipRolesDto,
  ): Promise<InfraUserBranchMembership> {
    const m = await this.membershipRepo.findOne({
      where: { branch: { id: branchId }, user: { id: userId } },
      relations: ['branchRoles', 'user', 'branch'],
    });
    if (!m) throw new NotFoundException('Membership not found');
    const roles = await this.branchRoleRepo.find({ where: { id: In(dto.branchRoleIds) } });
    m.branchRoles = roles;
    if (dto.isBranchHead !== undefined) m.isBranchHead = dto.isBranchHead;
    if (dto.isPrimary !== undefined) m.isPrimary = dto.isPrimary;
    await this.membershipRepo.save(m);
    return this.membershipRepo.findOneOrFail({
      where: { id: m.id },
      relations: ['branch', 'branchRoles', 'branchRoles.permissions', 'user'],
    });
  }

  async removeUserFromBranch(branchId: string, userId: string): Promise<{ message: string }> {
    const m = await this.membershipRepo.findOne({
      where: { branch: { id: branchId }, user: { id: userId } },
    });
    if (!m) throw new NotFoundException('Membership not found');
    await this.membershipRepo.remove(m);
    return { message: 'User removed from branch' };
  }
}
