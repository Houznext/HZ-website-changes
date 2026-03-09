import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserBranchMembership } from './entities/user-branch-membership.entity';
import { User } from 'src/user/entities/user.entity';
import { Branch } from './entities/branch.entity';
import { AssignUserToBranchDto, SwitchBranchDto } from './dto/branch.dto';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(UserBranchMembership)
    private memberships: Repository<UserBranchMembership>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Branch) private branches: Repository<Branch>,
    @InjectRepository(BranchRole) private branchRoles: Repository<BranchRole>,
  ) {}

  async assign(dto: AssignUserToBranchDto) {
    const [user, branch] = await Promise.all([
      this.users.findOne({ where: { id: dto.userId } }),
      this.branches.findOne({ where: { id: dto.branchId } }),
    ]);
    if (!user) throw new NotFoundException('User not found');
    if (!branch) throw new NotFoundException('Branch not found');

    const roles = await this.branchRoles.find({
      where: { id: In(dto.branchRoleIds) },
    });

    const membership = this.memberships.create({
      user,
      branch,
      branchRoles: roles, // ManyToMany<BranchRole>
      isBranchHead: !!dto.isBranchHead,
      isPrimary: !!dto.isPrimary,
    });

    // ensure only one primary per user
    if (dto.isPrimary) {
      await this.memberships.update(
        { user: { id: user.id } },
        { isPrimary: false },
      );
      membership.isPrimary = true;
    }

    return this.memberships.save(membership);
  }

  async switchBranch(userId: string, dto: SwitchBranchDto) {
    const membership = await this.memberships.findOne({
      where: { user: { id: userId }, branch: { id: dto.branchId } },
      relations: ['branch'],
    });
    if (!membership) {
      throw new NotFoundException('You are not a member of this branch');
    }

    // Persist chosen branch on user (assumes user.currentBranch is a relation)
    await this.users.update(userId, { currentBranch: membership.branch });
    // Optionally mark this membership primary (comment out if not desired)
    await this.memberships.update(
      { user: { id: userId } },
      { isPrimary: false },
    );
    await this.memberships.update(
      { user: { id: userId }, branch: { id: dto.branchId } },
      { isPrimary: true },
    );

    return { message: 'Switched', branchId: membership.branch.id };
  }

  listMembers(branchId: string) {
    return this.memberships.find({
      where: { branch: { id: branchId } },
      relations: ['user', 'branch', 'branchRoles'],
      order: { id: 'ASC' },
    });
  }

  async remove(userId: string, branchId: string) {
    const res = await this.memberships.delete({
      user: { id: userId },
      branch: { id: branchId } as any,
    });
    if (!res.affected) throw new NotFoundException('Membership not found');
  }
  async updateRoles(membershipId: string, roleIds: string[]) {
  const membership = await this.memberships.findOne({
    where: { id: membershipId },
    relations: ['branchRoles'],
  });

  if (!membership) {
    throw new NotFoundException('Membership not found');
  }

  const roles = await this.branchRoles.find({
    where: { id: In(roleIds) },
  });

  membership.branchRoles = roles;
  return this.memberships.save(membership);
}
async findOne(id: string) {
  return this.memberships.findOne({
    where: {  id },
    relations: ['user', 'branch', 'branchRoles'],
  });
}

  async ensureMembership(params: {
    branchId: string;
    userId: string;
    branchRoleId: string;
    isBranchHead: boolean;
    isPrimary: boolean;
  }): Promise<UserBranchMembership> {
    const {
      branchId,
      userId,
      branchRoleId,
      isBranchHead,
      isPrimary,
    } = params;

    // 1) Check existing membership
    let membership = await this.memberships.findOne({
      // where: { id: branchId, user: { id: userId }},
      // relations: ['branchRoles'],
      where: { branch: { id: branchId }, user: { id: userId } },
    relations: ['branchRoles'],

    });

    // 2) Create if not exists
    if (!membership) {
      membership = this.memberships.create({
 user: { id: userId } as any,
      branch: { id: branchId } as any,
        isBranchHead,
        isPrimary,
        branchRoles: [{ id: branchRoleId } as any],
      });

      return this.memberships.save(membership);
    }

    // 3) Update flags
    membership.isBranchHead = isBranchHead;
    membership.isPrimary = isPrimary;

    // 4) Ensure role assignment
    const hasRole = membership.branchRoles.some(
      (r) => r.id === branchRoleId,
    );

    if (!hasRole) {
      const role = await this.branchRoles.findOne({
        where: { id: branchRoleId },
      });
      membership.branchRoles.push(role);
    }

    return this.memberships.save(membership);
  }


}
