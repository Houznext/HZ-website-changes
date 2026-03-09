import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  CreateAdminUserWithBranchDto,
  CreateUserDto,
  LoginUserDto,
  ReturnUserAdminDto,
  ReturnUserDto,
  UpdateUserDto,
  userTokenReponse,
  ReturnAdminUserWithBranchDto,
  GetUsersFilterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/user.dto';
import * as crypto from 'crypto';
import { MailerService } from 'src/sendEmail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Property } from 'src/property/entities/property.entity';
import { AuthService } from 'src/authSession/auth.service';
import * as bcrypt from 'bcrypt';
import { LocationDetails } from 'src/property/entities/location.entity';
import { isAdmin } from 'src/common/utils/role..utils';
import { Branch } from 'src/branch/entities/branch.entity';
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';
import { BranchCategory, BranchLevel } from 'src/branch/enum/branch.enum';
import { IndianState, UserKind, UserRole } from './enum/user.enum';
import { BranchRole } from 'src/branchRole/entities/branch-role.entity';
import { BranchRolePermission } from 'src/branch-role-permission/entities/branch-role.-permission.entity';
import { getAllResources } from 'src/permission/enum/permission.enum';
import { NotificationService } from 'src/notifications/notification.service';
import { plainToInstance } from 'class-transformer';
import { BranchMembershipLite } from 'src/branch-role-permission/dto/branch-role-permission.dto';
import { AddressDto } from 'src/Address/dto/address.dto';
import { GetAdminUsersOverviewFilterDto, UserOverviewDto, UserOverviewResponseDto } from './dto/user-admin.dto';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(LocationDetails)
    private addressRepository: Repository<LocationDetails>,

    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly notificationService: NotificationService,
    private readonly mailerService: MailerService,
    private readonly s3Service: S3Service,

    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  // ---------- READS ----------
  async findAll(filters: GetUsersFilterDto): Promise<ReturnUserDto[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.currentBranch', 'currentBranch')
      .leftJoinAndSelect('user.branchMemberships', 'branchMemberships')
      .leftJoinAndSelect('branchMemberships.branch', 'branch')
      .leftJoinAndSelect('branchMemberships.branchRoles', 'branchRoles')
      .leftJoinAndSelect('branchRoles.permissions', 'branchRolePermissions')
      .leftJoinAndSelect('user.locations', 'locations');

    if (filters.kind) {
      qb.andWhere('user.kind = :kind', { kind: filters.kind });
    }
    if (filters.createdById) {
      qb.andWhere('user.createdById = :createdById', {
        createdById: filters.createdById,
      });
    }
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';

    qb.orderBy(`user.${sortBy}`, sortOrder);

    const users = await qb.getMany();

    return users.map((user) => this.mapToReturnUserDto(user));
  }


  //admin findall overview  

async getAdminUsersOverview(
  filters: GetAdminUsersOverviewFilterDto,
): Promise<UserOverviewResponseDto> {
  const {
    branchId,
    kind,
    search,
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    page = 1,
    limit = 20,
  } = filters;

  const qb = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.currentBranch', 'currentBranch')
    .leftJoinAndSelect('user.branchMemberships', 'branchMemberships')
    .leftJoinAndSelect('branchMemberships.branch', 'branch')
    .leftJoinAndSelect('branchMemberships.branchRoles', 'branchRoles')
    .leftJoin('user.properties', 'properties')
    .leftJoin('user.orders', 'orders')
    .leftJoin('user.wishlist', 'wishlist')
    // 🔧 FIX: correct relation name on Wishlist -> wishlistItems (NOT items)
    .leftJoin('wishlist.wishlistItems', 'wishlistItems')
    .leftJoin('user.customBuilders', 'customBuilders')
    .leftJoin('user.crmLeads', 'crmLeads')
    .select([
      'user.id',
      'user.firstName',
      'user.lastName',
      'user.email',
      'user.phone',
      'user.profile',
      'user.kind',
      'user.role',
      'user.isVerified',
      'user.createdAt',

      'currentBranch.id',
      'currentBranch.name',

      'branchMemberships.id',
      'branchMemberships.isPrimary',

      'branch.id',
      'branch.name',

      'branchRoles.id',
      'branchRoles.roleName',
    ])
    .addSelect('COUNT(DISTINCT properties.propertyId)', 'totalProperties')
    .addSelect('COUNT(DISTINCT orders.id)', 'totalOrders')
    .addSelect('COALESCE(SUM(orders.grandTotal), 0)', 'totalSpent')
    .addSelect('COUNT(DISTINCT wishlistItems.id)', 'wishlistCount')
    .addSelect('COUNT(DISTINCT customBuilders.id)', 'customBuilderCount')
    .addSelect('COUNT(DISTINCT crmLeads.id)', 'crmLeadCount')
    .groupBy('user.id')
    .addGroupBy('currentBranch.id')
    .addGroupBy('currentBranch.name')
    .addGroupBy('branchMemberships.id')
    .addGroupBy('branchMemberships.isPrimary')
    .addGroupBy('branch.id')
    .addGroupBy('branch.name')
    .addGroupBy('branchRoles.id')
    .addGroupBy('branchRoles.roleName');

  // Filter by branch (either currentBranch or any membership branch)
  if (branchId) {
    qb.andWhere(
      '(currentBranch.id = :branchId OR branch.id = :branchId)',
      { branchId },
    );
  }

  // Filter by kind
  if (kind) {
    qb.andWhere('user.kind = :kind', { kind });
  }

  // Search filter
  if (search) {
    qb.andWhere(
      '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
      { search: `%${search}%` },
    );
  }

  // Get total count before pagination – clone WITHOUT skip/take
  const totalQb = qb.clone();
  const totalResult = await totalQb.getRawMany();
  const total = totalResult.length;

  // Sorting
  if (sortBy === 'totalOrders') {
    qb.orderBy('totalOrders', sortOrder);
  } else if (sortBy === 'totalSpent') {
    qb.orderBy('totalSpent', sortOrder);
  } else if (sortBy === 'firstName') {
    qb.orderBy('user.firstName', sortOrder);
  } else {
    qb.orderBy(`user.${sortBy}`, sortOrder);
  }

  // Pagination
  qb.skip((page - 1) * limit).take(limit);

  const results = await qb.getRawAndEntities();

  const users: UserOverviewDto[] = results.entities.map((user, index) => {
    const raw = results.raw[index];
    const primaryMembership = user.branchMemberships?.find((m) => m.isPrimary);

    return {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      profile: user.profile,
      kind: user.kind,
      role: user.role ?? UserRole.STANDARD,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      branchName:
        user.currentBranch?.name || primaryMembership?.branch?.name || null,
      branchId:
        user.currentBranch?.id || primaryMembership?.branch?.id || null,
      branchRoles:
        primaryMembership?.branchRoles?.map((r) => r.roleName) || [],
      totalProperties: parseInt(raw.totalProperties, 10) || 0,
      totalOrders: parseInt(raw.totalOrders, 10) || 0,
      totalSpent: parseFloat(raw.totalSpent) || 0,
      wishlistCount: parseInt(raw.wishlistCount, 10) || 0,
      customBuilderCount: parseInt(raw.customBuilderCount, 10) || 0,
      crmLeadCount: parseInt(raw.crmLeadCount, 10) || 0,
    };
  });

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

  async findOne(id: string): Promise<ReturnUserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['locations'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.mapToReturnUserDto(user);
  }

  async remove(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.profile) {
      try {
        await this.s3Service.deleteFileByUrl(user.profile);
      } catch (err) {
        console.warn('Failed to delete user profile from S3:', err);
      }
    }
    await this.userRepository.delete(userId);
    return { message: 'User deleted successfully' };
  }

  // ---------- WEBSITE SIGNUP (GLOBAL: CUSTOMER) ----------

  async create(createUserDto: CreateUserDto): Promise<userTokenReponse> {
    const { email, fullName, password, phone, agent } = createUserDto;

    const firstName = (fullName?.split(' ')[0] || '').trim();
    const lastName = (fullName?.split(' ').slice(1).join(' ') || '').trim();

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or phone already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(password!, 10);
    const username = this.generateUsername(email, phone, firstName, lastName);

    const user = this.userRepository.create({
      email,
      username,
      firstName: firstName || null,
      lastName: lastName || null,
      fullName: fullName || null,
      password: hashedPassword,
      phone,
      agent: !!agent,
      kind: UserKind.CUSTOMER,
      role: UserRole.STANDARD,
    });
    await this.userRepository.save(user);

    const token = await this.authService.generateJwt(user);
    return {
      user: this.mapToReturnUserDto(user),
      token: token.access_token,
    };
  }

  // ---------- LOGIN ----------

  async loginUser(createUserDto: LoginUserDto): Promise<userTokenReponse> {
    const { email, phone, password } = createUserDto;

    if (!email && !phone) {
      throw new BadRequestException('Email or Phone is required to login');
    }

    const user = await this.userRepository.findOne({
      where: [{ email }, { phone }],
      relations: ['locations'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const memberships = await this.userRepository.manager
      .getRepository(UserBranchMembership)
      .find({
        where: { user: { id: user.id } },
        relations: ['branch', 'branchRoles', 'branchRoles.permissions'],
      });

    const branchMemberships = memberships.map((m) => ({
      branchId: m.branch.id,
      branchName: m.branch.name,
      level: m.branch.level,
      isBranchHead: m.isBranchHead,
      isPrimary: m.isPrimary,
      // branchRoleIds: m.branchRoles?.map((r) => r.id) ?? [],
      branchRoles: m.branchRoles.map((r) => ({
        id: r.id,
        roleName: r.roleName,
        // permissions: r.permissions?.map(p => p.resource) ?? []
      })),

      permissions:
        m.branchRoles
          ?.flatMap((r) => r.permissions ?? [])
          .map((p) => ({
            id: p.id,
            resource: p.resource,
            view: p.view,
            create: p.create,
            edit: p.edit,
            delete: p.delete,
          })) ?? [],
    }));

    const primaryMembership = memberships.find((m) => m.isPrimary);
    const activeBranchId =
      createUserDto.branchId ||
      primaryMembership?.branch?.id ||
      memberships[0]?.branch?.id;

    const token = await this.authService.generateJwt(user, activeBranchId);
    return {
      user: this.mapToReturnUserDto(user),
      token: token.access_token,
      branchMemberships,
    };
  }

  // ---------- UPDATE PROFILE ----------

  async updatePersonalInfo(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ReturnUserDto> {
    if (!id) throw new BadRequestException('ID is required to update profile');

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['locations'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // When profile is changed or removed, delete the old file from S3 (so DB and S3 stay in sync)
    if (
      updateUserDto.profile !== undefined &&
      user.profile &&
      updateUserDto.profile !== user.profile
    ) {
      try {
        await this.s3Service.deleteFileByUrl(user.profile);
      } catch (err) {
        console.warn('Failed to delete old profile from S3:', err);
      }
    }

    Object.assign(user, updateUserDto);
    const { addresses } = updateUserDto;

    if (addresses?.length) {
      for (const addressDto of addresses) {
        const existingAddress = user.locations.find(
          (addr) =>
            addr.country === addressDto.country &&
            addr.city === addressDto.city &&
            addr.state === addressDto.state &&
            addr.zipCode === addressDto.zipCode,
        );

        if (existingAddress) {
          Object.assign(existingAddress, addressDto);
          await this.addressRepository.save(existingAddress);
        } else {
          const newAddress = this.addressRepository.create(addressDto);
          newAddress.user = user;
          await this.addressRepository.save(newAddress);
        }
      }
    }

    const updatedUser = await this.userRepository.save(user);
    return this.mapToReturnUserDto(updatedUser);
  }

  // ---------- FINDS ----------

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException(`User with phone number ${phone} not found`);
    }
    return user;
  }

  // ---------- ADMIN: CREATE STAFF + MEMBERSHIP + ROLES (BRANCH-SCOPED) ----------

  async createAdminUserWithBranch(
    dto: CreateAdminUserWithBranchDto,
  ): Promise<ReturnAdminUserWithBranchDto> {
    const { user: u, membership: m } = dto;
    console.log('user detail', u);

    return this.userRepository.manager.transaction(async (manager) => {
      // 1) Uniqueness
      const existing = await manager.getRepository(User).findOne({
        where: [{ email: u.email }, { phone: u.phone }],
      });
      if (existing) {
        throw new ConflictException(
          'User with this email or phone already exists',
        );
      }

      // 2) Create user
      const username = this.generateUsername(
        u.email,
        u.phone,
        u.firstName,
        u.lastName,
      );
      const hashed = await bcrypt.hash(u.password, 10);
      console.log('email for user creation', u.email);

      const user = manager.getRepository(User).create({
        email: u.email,
        username,
        firstName: u.firstName,
        lastName: u.lastName,
        password: hashed,
        phone: u.phone,
        states: u.states,
        kind: m.kind ?? UserKind.STAFF,
        role: UserRole.STANDARD,
      });

      await manager.getRepository(User).save(user);

      // 3) Branch + roles (BRANCH-SCOPED)
      const branch = await manager.getRepository(Branch).findOne({
        where: { id: m.branchId, isActive: true },
        relations: ['parent'],
      });
      if (!branch) throw new NotFoundException('Branch not found or inactive');

      // NOTE: we use BranchRole now (not Role) and assign to "branchRoles"
      const branchRoles = await manager.getRepository(BranchRole).find({
        where: { id: In(m.branchRoleIds) },
        relations: ['permissions', 'branch'],
      });
      if (!branchRoles.length)
        throw new NotFoundException('No valid branchRoles provided');
      if (branchRoles.length !== m.branchRoleIds.length) {
        throw new BadRequestException('One or more branchRoleIds are invalid');
      }

      const crossBranch = branchRoles.find((r) => r.branch.id !== branch.id);
      if (crossBranch) {
        throw new BadRequestException(
          'All branchRoleIds must belong to the target branch',
        );
      }

      // 4) Ensure user.states covers the STATE of the target branch
      const stateAncestor = await this.getStateAncestor(manager, branch);
      if (stateAncestor) {
        const stateKey = (stateAncestor.name || '')
          .toUpperCase()
          .replace(/\s+/g, '_');
        const stateEnumVal = (IndianState as any)[stateKey] as
          | IndianState
          | undefined;
        if (stateEnumVal && !(user.states ?? []).includes(stateEnumVal)) {
          user.states = [...new Set([...(user.states ?? []), stateEnumVal])];
          await manager.getRepository(User).save(user);
        }
      }

      // 5) Primary membership handling
      let isPrimary = m.isPrimary !== false;
      if ((branch as any).isStateHQ && m.isPrimary === undefined) {
        isPrimary = true;
      }
      if (isPrimary) {
        await manager
          .getRepository(UserBranchMembership)
          .update({ user: { id: user.id } as any }, { isPrimary: false });
      }

      // 6) Branch Head policy: ensure only one head per branch
      const isBranchHead = !!m.isBranchHead;
      if (isBranchHead) {
        await this.enforceSingleHeadPerBranch(manager, branch.id, user.id);
      }

      // 7) Create membership (use "branchRoles", not "roles")
      const membership = manager.getRepository(UserBranchMembership).create({
        user,
        branch,
        branchRoles,
        isBranchHead,
        isPrimary,
      });

      await manager.getRepository(UserBranchMembership).save(membership);

      // 8) Set currentBranch ONLY if primary
      if (isPrimary) {
        await manager
          .getRepository(User)
          .update(user.id, { currentBranch: branch });
      }

      // ✅ Return both user and membership details
      return this.mapToReturnUserAdminDto(user, membership);
    });
  }

  // ---------- PASSWORD ----------

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }

  // ---------- FORGOT PASSWORD ----------

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Return success message even if user not found (security best practice)
      return {
        message:
          'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (1 hour from now)
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = tokenExpiry;
    await this.userRepository.save(user);

    // Create reset URL (frontend URL)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    const emailHtml = `
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f7; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h1>
            </div>
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hello <strong>${user.firstName || user.email}</strong>,</p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3586FF 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">This link will expire in <strong>1 hour</strong>.</p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">OneCasa - One Roof Every Solution</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.mailerService.sendMail(
        user.email,
        'Password Reset - OneCasa',
        `Reset your password using this link: ${resetUrl}`,
        emailHtml,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Clear the token if email fails
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException(
        'Failed to send password reset email. Please try again.',
      );
    }

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.passwordResetToken = :token', { token: hashedToken })
      .andWhere('user.passwordResetExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException(
        'Invalid or expired password reset token. Please request a new one.',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully.' };
  }

  // ---------- HELPERS ----------

  /** Walk up to the STATE ancestor; returns the STATE branch or null if none. */
  private async getStateAncestor(
    manager: EntityManager,
    branch: Branch,
  ): Promise<Branch | null> {
    let cursor: Branch | null = branch;
    // ensure parent is loaded while we climb
    while (cursor) {
      if (cursor.level === BranchLevel.STATE) return cursor;
      if (!cursor.parent) {
        const reloaded = await manager.getRepository(Branch).findOne({
          where: { id: cursor.id },
          relations: ['parent'],
        });
        cursor = reloaded?.parent ?? null;
      } else {
        cursor = cursor.parent;
      }
    }
    return null;
  }

  /** Optional policy: allow only one HEAD per branch — auto-unset previous heads. */
  private async enforceSingleHeadPerBranch(
    manager: EntityManager,
    branchId: string,
    newHeadUserId: string,
  ) {
    await manager.getRepository(UserBranchMembership).update(
      {
        branch: { id: branchId },
        isBranchHead: true,
        user: { id: Not(newHeadUserId) } as any,
      },
      { isBranchHead: false },
    );
  }

  private generateUsername(
    email?: string | null,
    phone?: string | null,
    firstName?: string | null,
    lastName?: string | null,
  ): string {
    const f = (firstName || '').trim();
    const l = (lastName || '').trim();
    if (f && l) {
      return `${f}.${l}.${email ? email.slice(0, 5) : (phone ?? '').slice(-4)}`;
    } else {
      return email ? email.split('@')[0] : (phone ?? '').slice(-4);
    }
  }

  private mapToReturnUserDto(user: User): ReturnUserDto {
    const {
      id,
      username,
      email,
      firstName,
      lastName,
      createdAt,
      updatedAt,
      phone,
      profile,
      locations = [],
      kind,
      role,
      branchMemberships = [],
    } = user;

    const addresses: AddressDto[] = locations.map((address) => ({
      id: address.id,
      country: address.country,
      state: address.state,
      city: address.city,
      zipCode: address.zipCode,
      area: address.area,
      name: address.name,
      phone: address.phone,
      landmark: address.landmark,
      isDefault: address.isDefault,
    }));

    const branchMembershipLite: BranchMembershipLite[] = branchMemberships.map(
      (m) => ({
        branchId: m.branch?.id,
        branchName: m.branch?.name,
        level: m.branch?.level,
        isBranchHead: m.isBranchHead,
        isPrimary: m.isPrimary,
        branchRoles: (m.branchRoles ?? []).map((r) => ({
          id: r.id,
          roleName: r.roleName,
        })),
        // assuming each BranchRole has `permissions` relation;
        // cast to any so you don't fight TS here – entities will match BranchPermissionLite shape
        permissions: (m.branchRoles ?? []).flatMap(
          (r) => r.permissions ?? [],
        ) as any,
      }),
    );

    return {
      id,
      profile: profile ?? '',
      username,
      firstName: firstName ?? undefined,
      lastName: lastName ?? '',
      phone: phone ?? '',
      email: email ?? '',
      createdAt,
      updatedAt,
      kind,
      role: role ?? UserRole.STANDARD,
      addresses,
      branchMemberships: branchMembershipLite,
    };
  }

  private mapToReturnUserAdminDto(
    user: User,
    membership: UserBranchMembership,
  ): ReturnAdminUserWithBranchDto {
    return {
      user: {
        id: user.id,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        states: user.states ?? [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        createdById: user.createdById ?? null,
      },
      membership: {
        branchId: membership.branch.id,
        // branchRoleIds: membership.branchRoles?.map((r) => r.id) ?? [],
        branchRoles: membership.branchRoles.map((r) => ({
          id: r.id,
          roleName: r.roleName,
          // permissions: r.permissions?.map(p => p.resource) ?? []
        })),

        kind: user.kind,
        isBranchHead: membership.isBranchHead,
        isPrimary: membership.isPrimary,
      },
    };
  }

  async getPostedPropertyCount(userId: string): Promise<{ count: number }> {
    const count = await this.propertyRepository.count({
      where: { postedByUser: { id: userId }, isPosted: true },
    });
    return { count };
  }

  async updateAdminUserWithBranch(
    userId: string,
    dto: CreateAdminUserWithBranchDto,
  ): Promise<ReturnAdminUserWithBranchDto> {
    const { user: u, membership: m } = dto;

    return this.userRepository.manager.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const branchRepo = manager.getRepository(Branch);
      const membershipRepo = manager.getRepository(UserBranchMembership);
      const branchRoleRepo = manager.getRepository(BranchRole);

      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user)
        throw new NotFoundException(`User with id ${userId} not found`);

      const branch = await branchRepo.findOne({ where: { id: m.branchId } });
      if (!branch)
        throw new NotFoundException(`Branch with id ${m.branchId} not found`);

      Object.assign(user, {
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        states: u.states,
        kind: m.kind ?? user.kind,
        updatedAt: new Date(),
      });
      await userRepo.save(user);

      const membership = await membershipRepo.findOne({
        where: { user: { id: user.id }, branch: { id: branch.id } },
        relations: ['branch', 'branchRoles'],
      });

      if (!membership) {
        throw new NotFoundException(
          `Membership not found for userId ${userId} and branchId ${branch.id}`,
        );
      }

      membership.isBranchHead = m.isBranchHead ?? membership.isBranchHead;
      membership.isPrimary = m.isPrimary ?? membership.isPrimary;

      if (m.branchRoleIds && m.branchRoleIds.length > 0) {
        const branchRoles = await branchRoleRepo.find({
          where: { id: In(m.branchRoleIds) },
        });
        membership.branchRoles = branchRoles;
      }

      await membershipRepo.save(membership);

      return this.mapToReturnUserAdminDto(user, membership);
    });
  }

  async getAdminUsersByBranchId(
    branchId: string,
  ): Promise<ReturnAdminUserWithBranchDto[]> {
    const memberships = await this.userRepository.manager
      .getRepository(UserBranchMembership)
      .find({
        where: { branch: { id: branchId },
      user: {
          kind: UserKind.STAFF, 
        }, },
        relations: ['user', 'branch', 'branchRoles'],
      });

    if (!memberships.length) {
      return [];
    }

    return memberships.map((membership) => ({
      user: {
        id: membership.user.id,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        email: membership.user.email,
        phone: membership.user.phone,
        states: membership.user.states,
        createdAt: membership.user.createdAt,
        updatedAt: membership.user.updatedAt,
      },
      membership: {
        branchId: membership.branch.id,
        // branchRoleIds: membership.branchRoles?.map((r) => r.id) || [],
        branchRoles: membership.branchRoles.map((r) => ({
          id: r.id,
          roleName: r.roleName,
          // permissions: r.permissions?.map(p => p.resource) ?? []
        })),

        kind: membership.user.kind,
        isBranchHead: membership.isBranchHead,
        isPrimary: membership.isPrimary,
      },
    }));
  }

  // ---------------------------------------------------------------------------
async findByEmailOrPhone(
  email?: string,
  phone?: string,
  userKind: UserKind = UserKind.STAFF, // default to STAFF
): Promise<User | null> {
  email = email?.trim() || undefined;
  phone = phone?.trim() || undefined;

  if (!email && !phone) {
    throw new BadRequestException('Email or phone is required');
  }

  const staffQb = this.userRepository
    .createQueryBuilder('user')
    .where('user.kind = :userKind', { userKind });

  if (email && phone) {
    staffQb.andWhere('(user.email = :email OR user.phone = :phone)', {
      email,
      phone,
    });
  } else if (email) {
    staffQb.andWhere('user.email = :email', { email });
  } else if (phone) {
    staffQb.andWhere('user.phone = :phone', { phone });
  }

  const staffUser = await staffQb.getOne();
  if (staffUser) return staffUser;

  const generalQb = this.userRepository.createQueryBuilder('user');

  if (email && phone) {
    generalQb.where('user.email = :email OR user.phone = :phone', {
      email,
      phone,
    });
  } else if (email) {
    generalQb.where('user.email = :email', { email });
  } else if (phone) {
    generalQb.where('user.phone = :phone', { phone });
  }

  return generalQb.getOne();
}



  async createBranchOwnerUser(payload: {
    fullName: string;
    email?: string;
    phone: string;
    password?: string;
    kind: UserKind;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
  }): Promise<User> {
    const {
      fullName,
      email,
      phone,
      password,
      kind,
      isPhoneVerified,
      isEmailVerified,
    } = payload;

    // Check duplicates
    const existing = await this.findByEmailOrPhone(email, phone,UserKind.STAFF);
    if (existing) {
      throw new BadRequestException(
        'User already exists with this email/phone (createBranchOwnerUser should not be called in this case)',
      );
    }

    // Basic name split (you can change this if your schema is different)
    let firstName: string | undefined;
    let lastName: string | undefined;
    if (fullName) {
      const parts = fullName.trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || undefined;
    }

    let passwordHash: string | undefined;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    const user = this.userRepository.create({
      firstName,
      lastName,
      fullName: fullName || undefined,
      email,
      phone,
      kind,
      password: passwordHash,
      isVerified: isPhoneVerified || isEmailVerified,
      // any other defaults like: isActive: true,
    });

    return this.userRepository.save(user);
  }

  async updateKind(userId: string, kind: UserKind): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.kind = kind;
    return this.userRepository.save(user);
  }

  async updateName(userId: string, fullName: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const parts = (fullName || '').trim().split(' ');
    user.firstName = parts[0] || user.firstName;
    user.lastName = parts.slice(1).join(' ') || user.lastName;
    user.fullName = fullName;

    return this.userRepository.save(user);
  }

  async sendBranchWelcomeNotification(
    user: User,
    branch: { id: string; name: string },
  ): Promise<void> {
    const message = `Welcome to ${branch.name}!`;

    await this.notificationService.createNotification({
      userId: user.id,
      message,
    });
  }

  async seedAdmin(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    orgName?: string;
  }): Promise<{ message: string; userId: string; branchId: string }> {
    const orgName = dto.orgName || 'OneCasa';

    return this.userRepository.manager.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const branchRepo = manager.getRepository(Branch);
      const branchRoleRepo = manager.getRepository(BranchRole);
      const permRepo = manager.getRepository(BranchRolePermission);
      const membershipRepo = manager.getRepository(UserBranchMembership);

      let branch = await branchRepo.findOne({
        where: { level: BranchLevel.ORG, name: orgName },
      });
      if (!branch) {
        branch = branchRepo.create({
          name: orgName,
          level: BranchLevel.ORG,
          category: BranchCategory.ORGANIZATION,
          isActive: true,
          isHeadOffice: true,
          path: '',
        });
        branch = await branchRepo.save(branch);
        branch.path = branch.id;
        await branchRepo.save(branch);
      }

      let superAdminRole = await branchRoleRepo.findOne({
        where: { branch: { id: branch.id }, roleName: 'SuperAdmin' },
        relations: ['permissions'],
      });
      if (!superAdminRole) {
        superAdminRole = await branchRoleRepo.save(
          branchRoleRepo.create({
            roleName: 'SuperAdmin',
            branch: { id: branch.id } as any,
            isBranchHead: true,
          }),
        );
        const allResources = getAllResources();
        const perms = allResources.map((resource) =>
          permRepo.create({
            branchRole: { id: superAdminRole!.id } as any,
            resource,
            view: true,
            create: true,
            edit: true,
            delete: true,
          }),
        );
        await permRepo.save(perms);
      }

      let user = await userRepo.findOne({ where: { email: dto.email } });
      if (user) {
        throw new ConflictException('A user with this email already exists');
      }

      const hashed = await bcrypt.hash(dto.password, 10);
      const username = `${dto.firstName}.${dto.lastName}.admin`.toLowerCase();

      user = userRepo.create({
        email: dto.email,
        username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName: `${dto.firstName} ${dto.lastName}`,
        password: hashed,
        phone: dto.phone,
        kind: UserKind.STAFF,
        role: UserRole.ADMIN,
        isVerified: true,
        currentBranch: branch,
      });
      user = await userRepo.save(user);

      const membership = membershipRepo.create({
        user,
        branch,
        branchRoles: [superAdminRole],
        isBranchHead: true,
        isPrimary: true,
      });
      await membershipRepo.save(membership);

      return {
        message: 'Admin user created successfully',
        userId: user.id,
        branchId: branch.id,
      };
    });
  }
}
