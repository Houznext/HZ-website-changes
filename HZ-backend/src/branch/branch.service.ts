import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import {
  BranchWithIdDto,
  CreateBranchDto,
  UpdateBranchDto,
  BranchOwnerDto,
} from './dto/branch.dto';
import * as bcrypt from 'bcrypt';
import { BranchCategory, BranchLevel, OwnerIdProofType } from './enum/branch.enum';
import { IndianState, UserKind } from 'src/user/enum/user.enum';

// adjust these paths to your actual files
import { OtpService } from 'src/otp/otp.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { BranchRoleService } from 'src/branchRole/branch-role.service';
import { Member } from 'aws-sdk/clients/ssmcontacts';
import { MembershipService } from './membership.service';
import {UserBranchMembership} from "./entities/user-branch-membership.entity"
import { PermissionResourceEnum } from 'src/permission/enum/permission.enum';
import {
  VerifyCustomerOtpDto,
  VerifyEmailDto,
} from 'src/Custombuilder/customer/dto/customer.dto';

type RequestUser = {
  id: string;
  email?: string;
  activeBranchId?: string;
  branchMembership?: {
    branchId: string;
    branchRoles: {
      id: number;
      roleName: string;
    }[];
    kind: string;
    isBranchHead: boolean;
    isPrimary: boolean;
  };
  roles?: any[];
};

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private repo: Repository<Branch>,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserBranchMembership)
private readonly membershipRepo: Repository<UserBranchMembership>,
    private readonly otpService: OtpService,

    private readonly branchRoleService: BranchRoleService,
    private readonly branchMembershipService: MembershipService,
  ) {}

  // ---------- CONFIG ----------

  private readonly allowedMap: Record<BranchLevel, BranchLevel[]> = {
    [BranchLevel.ORG]: [BranchLevel.STATE, BranchLevel.CITY],
    [BranchLevel.STATE]: [BranchLevel.CITY],
    [BranchLevel.CITY]: [BranchLevel.AREA, BranchLevel.OFFICE],
    [BranchLevel.AREA]: [BranchLevel.OFFICE],
    [BranchLevel.OFFICE]: [],
  };

  // CATEGORY → default resources the branch-head can see. ORGANIZATION = full access.
  private readonly defaultResourcesByCategory: Record<
    BranchCategory,
    PermissionResourceEnum[]
  > = {
    [BranchCategory.ORGANIZATION]: Object.values(PermissionResourceEnum),
    [BranchCategory.GENERAL]: [
      PermissionResourceEnum.BLOG,
      PermissionResourceEnum.PROPERTY,
      PermissionResourceEnum.CUSTOM_BUILDER,
      PermissionResourceEnum.COST_ESTIMATOR,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
      PermissionResourceEnum.INVOICE_ESTIMATOR,
    ],
    [BranchCategory.CUSTOM_BUILDER]: [
      PermissionResourceEnum.CUSTOM_BUILDER,
      PermissionResourceEnum.COST_ESTIMATOR,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.INVOICE_ESTIMATOR,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
      PermissionResourceEnum.PHASE,
      PermissionResourceEnum.MATERIALS,
      PermissionResourceEnum.CB_DOCUMENT,
      PermissionResourceEnum.PAYMENT_TRACKING,
      PermissionResourceEnum.DAILY_PROGRESS,
    ],
    [BranchCategory.INTERIORS]: [
      PermissionResourceEnum.COST_ESTIMATOR,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.INTERIOR_SERVICE,
      PermissionResourceEnum.INVOICE_ESTIMATOR,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.INTERIORS_AND_CONSTRUCTION]: [
      PermissionResourceEnum.CUSTOM_BUILDER,
      PermissionResourceEnum.COST_ESTIMATOR,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.INTERIOR_SERVICE,
      PermissionResourceEnum.INVOICE_ESTIMATOR,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
      PermissionResourceEnum.PHASE,
      PermissionResourceEnum.MATERIALS,
      PermissionResourceEnum.CB_DOCUMENT,
      PermissionResourceEnum.PAYMENT_TRACKING,
    ],
    [BranchCategory.LEGAL]: [
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.PROPERTY,
      PermissionResourceEnum.LEGAL_SERVICE,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.INVOICE_ESTIMATOR,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.FURNITURE]: [
      PermissionResourceEnum.FURNITURE,
      PermissionResourceEnum.FURNITURE_LEADS,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.SHIPPING,
      PermissionResourceEnum.DELIVERY,
      PermissionResourceEnum.INVOICE_ESTIMATOR,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.ELECTRONICS]: [
      PermissionResourceEnum.ELECTRONICS,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.SHIPPING,
      PermissionResourceEnum.DELIVERY,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.HOME_DECOR]: [
      PermissionResourceEnum.HOME_DECORS,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.SHIPPING,
      PermissionResourceEnum.DELIVERY,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.SERVICES]: [
      PermissionResourceEnum.COST_ESTIMATOR,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.SERVICE_CUSTOM_LEAD,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.SOLAR]: [
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.SERVICE_CUSTOM_LEAD,
      PermissionResourceEnum.SOLAR,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.PAINTING]: [
      PermissionResourceEnum.CUSTOM_BUILDER,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.PLUMBING]: [
      PermissionResourceEnum.CUSTOM_BUILDER,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.ORDERS,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.VASTU]: [
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
    [BranchCategory.PROPERTY_LISTING]: [
      PermissionResourceEnum.PROPERTY,
      PermissionResourceEnum.PROPERTY_LEAD,
      PermissionResourceEnum.CRM,
      PermissionResourceEnum.PREMIUM_PLANS,
      PermissionResourceEnum.CHAT,
      PermissionResourceEnum.HR,
      PermissionResourceEnum.ATTENDANCE,
    ],
  };

  // ---------- SMALL HELPERS ----------

  private buildPath(parent?: Branch | null, selfId?: string) {
    if (!parent) return selfId ? `${selfId}` : '';
    return `${parent.path}.${selfId ?? ''}`.replace(/\.$/, '');
  }

  private isState(level: BranchLevel) {
    return level === BranchLevel.STATE;
  }

  // ---------- HEAD OFFICE RULES ----------

  /** Head Office can exist only once and must be ORG level */
  private async ensureHeadOfficeRules(
    isHeadOffice: boolean | undefined,
    level: BranchLevel,
    currentId?: string,
  ) {
    if (isHeadOffice && level !== BranchLevel.ORG) {
      throw new BadRequestException('isHeadOffice is only valid for ORG');
    }
    if (isHeadOffice && level === BranchLevel.ORG) {
      const existing = await this.repo.findOne({
        where: { isHeadOffice: true, isActive: true },
      });
      if (existing && existing.id !== currentId) {
        throw new BadRequestException('Head Office already exists');
      }
    }
  }

  // ---------- PARENT / CHILD LEVEL RULES ----------

  private ensureAllowedTransition(
    parent: Branch | null,
    childLevel: BranchLevel,
  ) {
    if (!parent) {
      if (childLevel !== BranchLevel.ORG) {
        throw new BadRequestException(
          'parentId is required for non-ORG levels',
        );
      }
      return;
    }
    if (!this.allowedMap[parent.level].includes(childLevel)) {
      throw new BadRequestException(
        `Cannot create ${childLevel} under ${parent.level}`,
      );
    }
  }

  private async ensureNoCycle(targetId:string, newParent: Branch | null) {
    if (!newParent) return;
    let cursor: Branch | null | undefined = newParent;
    while (cursor) {
      if (cursor.id === targetId) {
        throw new BadRequestException(
          'Cannot set a branch as a descendant of itself',
        );
      }
      if (cursor.parent === undefined) {
        cursor = await this.repo.findOne({
          where: { id: cursor.id },
          relations: ['parent'],
        });
        cursor = cursor?.parent ?? null;
      } else {
        cursor = cursor.parent ?? null;
      }
    }
  }

  // ---------- STATE HQ RULES ----------

  /**
   * Enforce: (a) HQ must be a child of a STATE;
   *          (b) Only one HQ per STATE (auto-unset siblings).
   */
  private async applyStateHQRulesOnCreateOrUpdate(params: {
    nextIsStateHQ: boolean;
    nextLevel: BranchLevel;
    nextParent: Branch | null;
    currentId?: string; // undefined for create
  }) {
    const { nextIsStateHQ, nextLevel, nextParent, currentId } = params;

    if (!nextIsStateHQ) return;

    if (!nextParent || !this.isState(nextParent.level)) {
      throw new BadRequestException(
        'State HQ must be a child of a STATE branch',
      );
    }

    if (nextLevel === BranchLevel.ORG || nextLevel === BranchLevel.STATE) {
      throw new BadRequestException(
        'State HQ cannot be ORG/STATE level; choose a child node under the STATE',
      );
    }

    await this.repo
      .createQueryBuilder()
      .update(Branch)
      .set({ isStateHQ: false })
      .where(
        'parentId = :pid AND isStateHQ = true' +
          (currentId ? ' AND id != :cid' : ''),
        {
          pid: nextParent.id,
          cid: currentId,
        },
      )
      .execute();
  }

  private async autoClearHQIfInvalid(branch: Branch) {
    if (!branch.isStateHQ) return;

    const fresh = await this.repo.findOne({
      where: { id: branch.id },
      relations: ['parent'],
    });
    const parent = fresh?.parent ?? null;

    if (
      !parent ||
      !this.isState(parent.level) ||
      branch.level === BranchLevel.STATE ||
      branch.level === BranchLevel.ORG
    ) {
      branch.isStateHQ = false;
      await this.repo.save(branch);
    }
  }

  // ---------- ACTOR PERMISSIONS FOR CREATE + SCOPE ----------

  private async ensureActorCanCreateBranch(
    actor: RequestUser | undefined,
    parent: Branch | null,
    childLevel: BranchLevel,
  ) {
    if (!actor) return;

    if (!actor.activeBranchId) {
      throw new BadRequestException(
        'Active branch is required to create a new branch',
      );
    }

    const actorBranch = await this.repo.findOne({
      where: { id: actor.activeBranchId, isActive: true },
      relations: ['parent'],
    });

    if (!actorBranch) {
      throw new BadRequestException('Active branch not found for current user');
    }

    // ORG-level branch admins can create anywhere (allowedMap will still apply)
    if (actorBranch.level === BranchLevel.ORG) {
      return;
    }

    // Non-ORG must be State HQ
    if (!actorBranch.isStateHQ) {
      throw new BadRequestException(
        'Only Head Office (ORG) or State HQ admins can create new branches',
      );
    }

    const stateParent = actorBranch.parent;
    if (!stateParent || stateParent.level !== BranchLevel.STATE) {
      throw new BadRequestException(
        'State HQ must be attached under a STATE branch',
      );
    }

    if (!parent) {
      throw new BadRequestException(
        'State HQ admins must create branches under their STATE',
      );
    }

    // Check that the parent lies inside the same STATE subtree
    let cursor: Branch | null | undefined = parent;
    while (cursor) {
      if (cursor.id === stateParent.id) {
        // ok, within same state tree
        return;
      }
      if (cursor.parent === undefined) {
        cursor = await this.repo.findOne({
          where: { id: cursor.id },
          relations: ['parent'],
        });
        cursor = cursor?.parent ?? null;
      } else {
        cursor = cursor.parent ?? null;
      }
    }

    throw new BadRequestException(
      'You can only create branches inside your own STATE hierarchy',
    );
  }

  /**
   * Decide what this user can see:
   * - ORG Head (active ORG + isBranchHead) → ALL
   * - State HQ head → subtree of that STATE
   * - otherwise → subtree of their own active branch
   */
  private async resolveAccessScope(
    actor?: RequestUser,
  ): Promise<{ mode: 'ALL' } | { mode: 'SUBTREE'; root: Branch }> {
    // For seed scripts / system calls (no actor) → allow all
    if (!actor) return { mode: 'ALL' };

    if (!actor.activeBranchId) {
      throw new BadRequestException('Active branch is required');
    }

    const actorBranch = await this.repo.findOne({
      where: { id: actor.activeBranchId, isActive: true },
      relations: ['parent'],
    });
    if (!actorBranch) {
      throw new BadRequestException('Active branch not found for user');
    }

    const membership = actor.branchMembership;
    const isHeadOnActive =
      !!membership &&
      membership.branchId === actorBranch.id &&
      membership.isBranchHead;

    // ORG Head Office head → ALL
    if (actorBranch.level === BranchLevel.ORG && isHeadOnActive) {
      return { mode: 'ALL' };
    }

    // State HQ head → entire STATE subtree
    if (
      actorBranch.isStateHQ &&
      isHeadOnActive &&
      actorBranch.parent &&
      actorBranch.parent.level === BranchLevel.STATE
    ) {
      const stateRoot = actorBranch.parent;
      return { mode: 'SUBTREE', root: stateRoot };
    }

    // Everyone else → subtree of their own active branch
    return { mode: 'SUBTREE', root: actorBranch };
  }

  /**
   * Ensures the actor can manage the given branch (for branch-scoped resources like legal services).
   * Throws ForbiddenException if not allowed. No-op if actor is undefined (e.g. system).
   */
  async ensureUserCanManageBranch(
    branchId: string,
    actor?: RequestUser,
  ): Promise<void> {
    if (!actor) return;
    const branch = await this.repo.findOne({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    const scope = await this.resolveAccessScope(actor);
    if (scope.mode === 'ALL') return;
    const root = scope.root;
    if (branch.id === root.id) return;
    if (branch.path && root.path && branch.path.startsWith(root.path + '.'))
      return;
    throw new ForbiddenException('You do not have permission to manage this branch');
  }

  // ---------- PUBLIC QUERIES ----------
private async attachOwners(branches: Branch[]) {
  const branchIds = branches.map((b) => b.id);
  if (!branchIds.length) return branches as any;

  const memberships = await this.membershipRepo.find({
    where: {
      branch: { id: In(branchIds) },
      isBranchHead: true,
    },
    relations: ['branch', 'user'],
    order: { createdAt: 'DESC' }, // newest first
  });

  const ownerMap = new Map<string, any>();

  for (const m of memberships) {
    const bid = m.branch?.id;
    const u = m.user;
    if (!bid || !u) continue;

    // first one wins because we sorted DESC
    if (!ownerMap.has(bid)) {
      ownerMap.set(bid, {
        id: u.id,
        fullName: u.fullName ?? null,
        email: u.email ?? null,
        phone: u.phone ?? null,
         password:u.password ?? null,
      });
    }
  }

  return branches.map((b) => ({
    ...b,
    owner: ownerMap.get(b.id) ?? null,
  }));
}


  async findAllForUser(actor?: RequestUser) {
  const scope = await this.resolveAccessScope(actor);
  let branches: Branch[];

  if (scope.mode === 'ALL') {
    // ✅ IMPORTANT: do NOT call findAll() because it doesn't attach owners
    branches = await this.repo.find({
      // where: { isActive: true },
      relations: ['parent'],
      order: { id: 'ASC' },
    });
  } else {
    const root = scope.root;

    branches = await this.repo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.parent', 'parent')
      // .where('branch.isActive = :active', { active: true })
      .andWhere('(branch.id = :rootId OR branch.path LIKE :pathPrefix)', {
        rootId: root.id,
        pathPrefix: `${root.path}.%`,
      })
      .orderBy('branch.id', 'ASC')
      .getMany();
  }

  // ✅ Always attach owners, regardless of mode
  return this.attachOwners(branches);
}


  findAll() {
    return this.repo.find({
      where: { isActive: true },
      relations: ['parent'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!item) throw new NotFoundException('Branch not found');
    return item;
  }

  async childrenOf(parentId: string | null) {
    return this.repo.find({
      where: parentId ? { parent: { id: parentId } } : { parent: null },
      relations: ['children'],
      order: { id: 'ASC' },
    });
  }

  async getBrancheIdwithName(): Promise<BranchWithIdDto[]> {
    const branches = await this.repo.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });

    const result = branches.map((b) => ({
      branchId: b.id,
      branchName: b.name,
    }));
    return result;
  }

  async remove(id: string) {
    const b = await this.findOne(id);
    b.isActive = false;
    await this.repo.save(b);
    return { message: 'Branch archived' };
  }

  // ---------- CREATE / UPDATE ----------

  async create(dto: CreateBranchDto, actor?: RequestUser): Promise<Branch> {
    await this.ensureHeadOfficeRules(!!dto.isHeadOffice, dto.level);

    let parent: Branch | null = null;
    if (dto.parentId) {
      parent = await this.repo.findOne({
        where: { id: dto.parentId, isActive: true },
        relations: ['parent'],
      });
      if (!parent) throw new NotFoundException('Parent branch not found');
    }

    await this.ensureActorCanCreateBranch(actor, parent, dto.level);

    // Validate allowed parent→child transition
    this.ensureAllowedTransition(parent, dto.level);

    // STATE branches must map to IndianState enum
    // if (dto.level === BranchLevel.STATE) {
    //   const stateKey = (dto.name || '')
    //     .trim()
    //     .toUpperCase()
    //     .replace(/\s+/g, '_');
    //   const enumVal = (IndianState as any)[stateKey];
    //   if (!enumVal) {
    //     throw new BadRequestException(
    //       `STATE branch name "${dto.name}" must map to IndianState enum (e.g., TELANGANA, ANDHRA_PRADESH).`,
    //     );
    //   }
    // }
     if (dto.level === BranchLevel.STATE) {
      const inputName = (dto.name || '').trim();

      const enumValues = Object.values(IndianState);

      const canonicalState = enumValues.find(
        (v) => v.toLowerCase() === inputName.toLowerCase(),
      );

      if (!canonicalState) {
        throw new BadRequestException(
          `STATE branch name "${dto.name}" must map to IndianState enum (e.g., Telangana, Andhra Pradesh).`,
        );
      }
      dto.name = canonicalState;
    }

    await this.applyStateHQRulesOnCreateOrUpdate({
      nextIsStateHQ: !!dto.isStateHQ,
      nextLevel: dto.level,
      nextParent: parent,
    });

    const category =
      dto.category ??
      (dto.level === BranchLevel.ORG ? BranchCategory.ORGANIZATION : BranchCategory.GENERAL);

    const branch = this.repo.create({
      name: (dto.name || '').trim(),
      level: dto.level,
      parent: parent ?? null,
      path: '',
      isActive: true,
      isHeadOffice: !!dto.isHeadOffice,
      isStateHQ: !!dto.isStateHQ,
      category,
      stateId: dto.stateId,
      cityId: dto.cityId,
      hasFranchiseFeePaid: !!dto.hasFranchiseFeePaid,
      franchisePaymentRef: dto.franchisePaymentRef,
      ownerAadhaarNumber: dto.ownerAadhaarNumber ?? null,
      ownerPanNumber: dto.ownerPanNumber ?? null,
      ownerGstNumber: dto.ownerGstNumber ?? null,
      ownerIdProofType: dto.ownerIdProofType ?? null,
      ownerIdProofUrl: dto.ownerIdProofUrl ?? null,
      ownerPhotoUrl: dto.ownerPhotoUrl ?? null,
      ownerDateOfBirth: dto.ownerDateOfBirth ? new Date(dto.ownerDateOfBirth) : null,
      ownerAddress: dto.ownerAddress ?? null,
      branchAddress: dto.branchAddress ?? null,
      branchPhone: dto.branchPhone ?? null,
      branchEmail: dto.branchEmail ?? null,
      branchPhotoUrl: dto.branchPhotoUrl ?? null,
    });

    const saved = await this.repo.save(branch);
    saved.path = this.buildPath(parent, saved.id);
    const finalBranch = await this.repo.save(saved);

    // attach OTP-verified owner if provided
    if (dto.owner) {
      await this.attachOwnerToBranch(finalBranch, dto.owner);
    }

    return finalBranch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.repo.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const nextLevel = dto.level ?? branch.level;
    const nextIsHeadOffice = dto.isHeadOffice ?? branch.isHeadOffice;
    const nextIsStateHQ = dto.isStateHQ ?? branch.isStateHQ;

    let parentChanged = false;
    let nextParent: Branch | null = branch.parent ?? null;

    if (dto.parentId !== undefined && dto.parentId !== branch.parent?.id) {
      if (dto.parentId !== null) {
        const newParent = await this.repo.findOne({
          where: { id: dto.parentId, isActive: true },
          relations: ['parent'],
        });
        if (!newParent) throw new NotFoundException('New parent not found');

        await this.ensureNoCycle(branch.id, newParent);
        this.ensureAllowedTransition(newParent, nextLevel);
        nextParent = newParent;
      } else {
        if (nextLevel !== BranchLevel.ORG) {
          throw new BadRequestException('Only ORG can have no parent');
        }
        nextParent = null;
      }
      parentChanged = true;
    }

    await this.ensureHeadOfficeRules(nextIsHeadOffice, nextLevel, id);

    if (dto.level !== undefined) {
      this.ensureAllowedTransition(nextParent, dto.level);
      branch.level = dto.level;
    }

    await this.applyStateHQRulesOnCreateOrUpdate({
      nextIsStateHQ: nextIsStateHQ,
      nextLevel: nextLevel,
      nextParent: nextParent,
      currentId: id,
    });

    if (dto.name !== undefined) branch.name = dto.name;
    if (dto.isHeadOffice !== undefined) branch.isHeadOffice = dto.isHeadOffice;
    if (dto.isStateHQ !== undefined) branch.isStateHQ = dto.isStateHQ;
    if (dto.category !== undefined) branch.category = dto.category;
    if (dto.stateId !== undefined) branch.stateId = dto.stateId;
    if (dto.cityId !== undefined) branch.cityId = dto.cityId;
    if (dto.hasFranchiseFeePaid !== undefined)
      branch.hasFranchiseFeePaid = dto.hasFranchiseFeePaid;
    if (dto.franchisePaymentRef !== undefined)
      branch.franchisePaymentRef = dto.franchisePaymentRef;

    if (dto.ownerAadhaarNumber !== undefined) branch.ownerAadhaarNumber = dto.ownerAadhaarNumber;
    if (dto.ownerPanNumber !== undefined) branch.ownerPanNumber = dto.ownerPanNumber;
    if (dto.ownerGstNumber !== undefined) branch.ownerGstNumber = dto.ownerGstNumber;
    if (dto.ownerIdProofType !== undefined) branch.ownerIdProofType = dto.ownerIdProofType as OwnerIdProofType;
    if (dto.ownerIdProofUrl !== undefined) branch.ownerIdProofUrl = dto.ownerIdProofUrl;
    if (dto.ownerPhotoUrl !== undefined) branch.ownerPhotoUrl = dto.ownerPhotoUrl;
    if (dto.ownerDateOfBirth !== undefined)
      branch.ownerDateOfBirth = dto.ownerDateOfBirth ? new Date(dto.ownerDateOfBirth) : null;
    if (dto.ownerAddress !== undefined) branch.ownerAddress = dto.ownerAddress;
    if (dto.branchAddress !== undefined) branch.branchAddress = dto.branchAddress;
    if (dto.branchPhone !== undefined) branch.branchPhone = dto.branchPhone;
    if (dto.branchEmail !== undefined) branch.branchEmail = dto.branchEmail;
    if (dto.branchPhotoUrl !== undefined) branch.branchPhotoUrl = dto.branchPhotoUrl;

    if (parentChanged) {
      branch.parent = nextParent;
    }

    const updated = await this.repo.save(branch);

    await this.autoClearHQIfInvalid(updated);
    if (dto.owner) {
  await this.attachOwnerToBranch(updated, dto.owner);
}

    if (parentChanged) {
      await this.recomputeSubtreePaths(updated.id);
      return this.findOne(updated.id);
    }

    return this.findOne(updated.id);
  }

  // ---------- OWNER + ROLE + MEMBERSHIP ----------

  /**
   * Creates/attaches a branch-head user for the given branch.
   * 1. Ensure OTP token is valid for email/phone
   * 2. Find existing user or create new one (kind = STAFF)
   * 3. Create "Branch Super Admin" role (if not exists) with category-based permissions
   * 4. Create BranchMembership linking user ↔ branch
   */
  private async attachOwnerToBranch(
    branch: Branch,
    ownerDto: BranchOwnerDto,
  ): Promise<void> {
    let user: User | null = await this.userService.findByEmailOrPhone(
      ownerDto.email,
      ownerDto.phone,
      UserKind.STAFF,
    );
    if (!user) {
      throw new BadRequestException(
        'Owner must complete staff OTP verification and be created as a STAFF user before attaching to branch.',
      );
    }
    if (!user.isVerified) {
      throw new BadRequestException(
        'Owner phone/email is not OTP-verified. Please complete staff OTP verification first.',
      );
    }

    if (user.kind !== UserKind.STAFF) {
      user = await this.userService.updateKind(user.id, UserKind.STAFF);

    }
    const nextFullName = ownerDto.fullName?.trim();
  const nextEmail = ownerDto.email?.trim();
  const nextPhone = ownerDto.phone?.trim();

  let shouldSaveUser = false;

  if (nextFullName && nextFullName !== user.fullName) {
    user.fullName = nextFullName;
    shouldSaveUser = true;
  }
  if (nextEmail && nextEmail !== user.email) {
    // (optional) ensure no other user uses same email
    const existing = await this.userRepository.findOne({
      where: { email: nextEmail },
    });
    if (existing && existing.id !== user.id) {
      throw new BadRequestException('Email already in use by another user');
    }
    user.email = nextEmail;
    shouldSaveUser = true;
  }

  // Update phone only if provided
  if (nextPhone && nextPhone !== user.phone) {
    // (optional) ensure no other user uses same phone
    const existing = await this.userRepository.findOne({
      where: { phone: nextPhone },
    });
    if (existing && existing.id !== user.id) {
      throw new BadRequestException('Phone already in use by another user');
    }
    user.phone = nextPhone;
    shouldSaveUser = true;
  }

  // ✅ Password update only if provided (NEVER return it)
  // Add password field in BranchOwnerDto only if you really want it
  if ((ownerDto as any)?.password?.trim()) {
    const plain = (ownerDto as any).password.trim();
    const saltRounds = 10;
    user.password = await bcrypt.hash(plain, saltRounds);
    shouldSaveUser = true;
  }

  if (shouldSaveUser) {
    user = await this.userRepository.save(user);
  }

    if (!user.fullName && ownerDto.fullName) {
      user = await this.userService.updateName(user.id, ownerDto.fullName);
    }
    // Org/head office branch gets full access (ORGANIZATION); null category = GENERAL
    const category =
      branch.level === BranchLevel.ORG
        ? BranchCategory.ORGANIZATION
        : (branch.category ?? BranchCategory.GENERAL);
    const resources =
      this.defaultResourcesByCategory[category] ??
      this.defaultResourcesByCategory[BranchCategory.GENERAL];

    const role = await this.branchRoleService.getOrCreateSuperAdminRole({
      branchId: branch.id,
      roleName: 'SuperAdmin',
      resources,
    });

    await this.branchMembershipService.ensureMembership({
      branchId: branch.id,
      userId: user.id,
      branchRoleId: role.id,
      isBranchHead: true,
      isPrimary: true,
    });
    await this.userService.sendBranchWelcomeNotification(user, branch);
  }

  // ---------- PATH RECOMPUTE AFTER MOVE ----------

  /** Recompute path for node and all its descendants after a move */
  private async recomputeSubtreePaths(rootId: string) {
    const all = await this.repo.find({ relations: ['parent'] });
    const byId = new Map<string, Branch>(all.map((b) => [b.id, b]));
    const childrenByParent = new Map<string | null, Branch[]>();

    for (const n of all) {
      const key = n.parent ? n.parent.id : null;
      const arr = childrenByParent.get(key) ?? [];
      arr.push(n);
      childrenByParent.set(key, arr);
    }

    const root = byId.get(rootId);
    if (!root) return;

    const queue: Branch[] = [root];
    while (queue.length) {
      const node = queue.shift()!;
      const parent = node.parent ?? null;
      node.path = this.buildPath(parent, node.id);
      await this.repo.save(node);

      const kids = childrenByParent.get(node.id) ?? [];
      queue.push(...kids);
    }
  }

  async verifyStaffEmail({ email, phone }: VerifyEmailDto) {
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    if (phone) {
      const existingPhoneUser = await this.userRepository.findOne({
        where: { phone },
      });
      if (existingPhoneUser?.isVerified) {
        return {
          type: 'phone',
          status: 'already_verified',
          message: 'Phone number is already verified',
          phone,
        };
      }
      const resp = await this.otpService.sendOtp({ phone });
      return {
        type: 'phone',
        status: 'otp_sent',
        message: 'OTP sent successfully via SMS',
        phone,
        response: resp,
      };
    }
    if (email) {
      const existingEmailUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingEmailUser?.isVerified) {
        return {
          type: 'email',
          status: 'already_verified',
          message: 'Email is already verified',
          email,
        };
      }
      const resp = await this.otpService.sendOtp({ email });
      return {
        type: 'email',
        status: 'otp_sent',
        message: 'OTP sent successfully via Email',
        email,
        response: resp,
      };
    }
  }

  async verifyStaffOtp({ email, otp, phone }: VerifyCustomerOtpDto) {
    if (!email && !phone) {
      throw new BadRequestException(
        'Either email or phone must be provided for OTP verification',
      );
    }
    const verified = await this.otpService.verifyOtp({ email, phone, otp });
    if (!verified?.email && !verified?.phone) {
      throw new BadRequestException('Invalid OTP');
    }
    const where = email ? { email } : { phone };
    let user = await this.userRepository.findOne({ where });

    if (user) {
      user.isVerified = true;
      user.kind = UserKind.STAFF;
      await this.userRepository.save(user);
      return { message: 'Existing user verified as STAFF', user };
    }
    user = this.userRepository.create({
      email: email || null,
      phone: phone || null,
      isVerified: true,
      username: `staff_${Date.now()}`,
      password: '',
      kind: UserKind.STAFF,
    });
    await this.userRepository.save(user);

    return { message: 'New STAFF user created', user };
  }
  async restore(id: string): Promise<Branch> {
  const branch = await this.repo.findOne({
    where: { id },
    relations: ['parent'],
  });

  if (!branch) throw new NotFoundException('Branch not found');

  if (branch.isActive) {
    return branch; // already active
  }

  // Optional safety: don't restore if parent is inactive
  if (branch.parent && branch.parent.isActive === false) {
    throw new BadRequestException(
      'Cannot restore branch while its parent is inactive. Restore parent first.',
    );
  }

  branch.isActive = true;
  await this.repo.save(branch);
  return this.findOne(id);
}
async hardDeleteOnlyBranch(id: string) {
  const branch = await this.repo.findOne({
    where: { id },
    relations: ['parent'],
  });
  if (!branch) throw new NotFoundException('Branch not found');

  // Safety (recommended): only allow hard delete after soft delete
  if (branch.isActive) {
    throw new BadRequestException(
      'Hard delete allowed only after archiving (isActive=false).',
    );
  }

  // 1) find direct children
  const children = await this.repo.find({
    where: { parent: { id: branch.id } },
    relations: ['parent'],
  });

  const newParent = branch.parent ?? null;

  // 2) re-parent children to deleted branch's parent
  if (children.length) {
    await this.repo
      .createQueryBuilder()
      .update(Branch)
      .set({ parent: newParent })
      .where('parentId = :id', { id: branch.id })
      .execute();
  }

  // 3) remove memberships for this branch (otherwise FK error)
  await this.membershipRepo
    .createQueryBuilder()
    .delete()
    .from(UserBranchMembership)
    .where('branchId = :id', { id: branch.id })
    .execute();

  // 4) delete the branch itself
  await this.repo.delete(branch.id);

  // 5) recompute paths for re-parented children subtrees
  // because their path still contains the deleted branch id
  for (const child of children) {
    await this.recomputeSubtreePaths(child.id);
  }

  return { message: 'Branch hard deleted (children kept and re-parented)' };
}


}
