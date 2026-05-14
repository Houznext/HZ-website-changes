import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { CreateInfraUserDto } from '../auth/dto/auth.dto';
import { InfraUser } from './entities/infra-user.entity';
import { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';
import { InfraUserListQueryDto, UpdateInfraUserDto } from './dto/infra-user.dto';
import { InfraUserKind, InfraUserRole } from '../auth/enum/infra-user.enum';

@Injectable()
export class InfraUserService {
  constructor(
    @InjectRepository(InfraUser)
    private readonly userRepo: Repository<InfraUser>,
    @InjectRepository(InfraUserBranchMembership)
    private readonly membershipRepo: Repository<InfraUserBranchMembership>,
    private readonly auth: AuthService,
  ) {}

  create(dto: CreateInfraUserDto) {
    return this.auth.createInfraPortalUser(dto);
  }

  async findAll(query?: InfraUserListQueryDto): Promise<InfraUser[]> {
    const qb = this.userRepo.createQueryBuilder('u');
    if (query?.email) {
      qb.andWhere('LOWER(u.email) = LOWER(:email)', { email: query.email.trim() });
    } else if (query?.search?.trim()) {
      const s = `%${query.search.trim()}%`;
      qb.andWhere(
        '(u.username ILIKE :s OR u.email ILIKE :s OR u.firstName ILIKE :s OR u.lastName ILIKE :s OR u.phone ILIKE :s)',
        { s },
      );
    }
    qb.orderBy('u.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<InfraUser> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['currentBranch', 'branchMemberships', 'branchMemberships.branch'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateInfraUserDto): Promise<InfraUser> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (dto.email && dto.email.trim().toLowerCase() !== (user.email ?? '').toLowerCase()) {
      const dup = await this.userRepo.findOne({ where: { email: dto.email.trim().toLowerCase() } });
      if (dup) throw new ConflictException('Email already exists');
    }
    if (dto.username && dto.username.trim() !== user.username) {
      const dup = await this.userRepo.findOne({ where: { username: dto.username.trim() } });
      if (dup) throw new ConflictException('Username already exists');
    }
    if (dto.username !== undefined) user.username = dto.username.trim();
    if (dto.email !== undefined) user.email = dto.email?.trim().toLowerCase() ?? null;
    if (dto.phone !== undefined) user.phone = dto.phone ?? null;
    if (dto.firstName !== undefined) user.firstName = dto.firstName ?? null;
    if (dto.lastName !== undefined) user.lastName = dto.lastName ?? null;
    if (dto.kind !== undefined) user.kind = dto.kind as InfraUserKind;
    if (dto.role !== undefined) user.role = dto.role as InfraUserRole;
    if (dto.states !== undefined) user.states = dto.states as InfraUser['states'];
    if (dto.password) user.passwordHash = await bcrypt.hash(dto.password, 12);
    return this.userRepo.save(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.remove(user);
    return { message: 'User deleted' };
  }

  async getUsersByBranch(branchId: string) {
    const rows = await this.membershipRepo.find({
      where: { branch: { id: branchId } },
      relations: ['user', 'branchRoles'],
    });
    return rows.map((m) => ({
      membershipId: m.id,
      user: m.user,
      isBranchHead: m.isBranchHead,
      isPrimary: m.isPrimary,
      branchRoles: (m.branchRoles ?? []).map((r) => ({ id: r.id, roleName: r.roleName })),
    }));
  }
}
