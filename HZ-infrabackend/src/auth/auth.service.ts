import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { InfraAdmin } from '../admin/entities/infra-admin.entity';
import { InfraDeveloper } from '../developer/entities/infra-developer.entity';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import { InfraUser } from '../infra-user/entities/infra-user.entity';
import { InfraBranch } from '../infra-branch/entities/infra-branch.entity';
import { InfraBranchRole } from '../infra-branch-role/entities/infra-branch-role.entity';
import { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';
import { InfraBranchRolePermission } from '../infra-branch-role-permission/entities/infra-branch-role-permission.entity';
import {
  AdminLoginDto,
  CreateInfraUserDto,
  CustomerEmailLoginDto,
  CustomerEmailRegisterDto,
  DeveloperLoginDto,
  GoogleAccessTokenDto,
  GoogleIdTokenDto,
  LoginDto,
} from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';
import { InfraUserKind, InfraUserRole } from './enum/infra-user.enum';
import { InfraBranchCategory, InfraBranchLevel } from '../infra-branch/enum/infra-branch.enum';
import { getAllInfraResources } from '../infra-permission/enum/infra-permission.enum';
import { mapMembershipsToPortalPayload } from './infra-membership.mapper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(InfraAdmin)
    private readonly adminRepo: Repository<InfraAdmin>,
    @InjectRepository(InfraDeveloper)
    private readonly devRepo: Repository<InfraDeveloper>,
    @InjectRepository(InfraCustomer)
    private readonly customerRepo: Repository<InfraCustomer>,
    @InjectRepository(InfraUser)
    private readonly infraUserRepo: Repository<InfraUser>,
    @InjectRepository(InfraUserBranchMembership)
    private readonly infraMembershipRepo: Repository<InfraUserBranchMembership>,
    @InjectRepository(InfraBranch)
    private readonly infraBranchRepo: Repository<InfraBranch>,
    @InjectRepository(InfraBranchRole)
    private readonly infraBranchRoleRepo: Repository<InfraBranchRole>,
    @InjectRepository(InfraBranchRolePermission)
    private readonly infraBranchRolePermRepo: Repository<InfraBranchRolePermission>,
    private readonly jwt: JwtService,
  ) {}

  private async signCustomerAccessToken(c: InfraCustomer): Promise<string> {
    return this.jwt.signAsync({
      sub: c.customerId,
      customerId: c.customerId,
      kind: 'customer',
      phone: c.phone ?? undefined,
      email: c.email ?? undefined,
      name: c.name ?? undefined,
    });
  }

  private mapPortalJwtRole(role: InfraUserRole): 'admin' | 'sales_rep' {
    return role === InfraUserRole.ADMIN ? 'admin' : 'sales_rep';
  }

  /** Infra portal staff/admin login (`infra_users`). */
  async infraPortalLogin(dto: LoginDto): Promise<{
    access_token: string;
    user: {
      id: string;
      username: string;
      email: string | null;
      role: string;
      kind: string;
      firstName: string | null;
      lastName: string | null;
      branchMemberships: ReturnType<typeof mapMembershipsToPortalPayload>;
    };
  }> {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Provide email or phone');
    }
    const user = dto.email
      ? await this.infraUserRepo.findOne({
          where: { email: dto.email.trim().toLowerCase() },
        })
      : await this.infraUserRepo.findOne({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    const memberships = await this.infraMembershipRepo.find({
      where: { user: { id: user.id } },
      relations: ['branch', 'branchRoles', 'branchRoles.permissions'],
    });
    const branchMemberships = mapMembershipsToPortalPayload(memberships);

    const payload: JwtPayload = {
      sub: user.id,
      kind: 'admin',
      role: this.mapPortalJwtRole(user.role),
      email: user.email ?? undefined,
      adminId: user.id,
      type: 'infra_user',
    };
    const access_token = await this.jwt.signAsync(payload, { expiresIn: '30d' });

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        kind: user.kind,
        firstName: user.firstName,
        lastName: user.lastName,
        branchMemberships,
      },
    };
  }

  async getInfraPortalMe(userId: string) {
    const user = await this.infraUserRepo.findOne({
      where: { id: userId },
      relations: ['currentBranch'],
    });
    if (!user) throw new UnauthorizedException();
    const memberships = await this.infraMembershipRepo.find({
      where: { user: { id: userId } },
      relations: ['branch', 'branchRoles', 'branchRoles.permissions'],
    });
    const { passwordHash, ...rest } = user;
    void passwordHash;
    return {
      ...rest,
      branchMemberships: mapMembershipsToPortalPayload(memberships),
    };
  }

  /** `infra_admin` row for legacy JWT (`type: legacy_infra_admin`). */
  async getLegacyAdminMe(adminId: string) {
    const admin = await this.adminRepo.findOne({ where: { adminId } });
    if (!admin) throw new UnauthorizedException();
    const { passwordHash, ...rest } = admin;
    void passwordHash;
    return {
      ...rest,
      branchMemberships: [] as ReturnType<typeof mapMembershipsToPortalPayload>,
    };
  }

  async createInfraPortalUser(dto: CreateInfraUserDto, _createdById?: string): Promise<InfraUser> {
    if (dto.email) {
      const existing = await this.infraUserRepo.findOne({
        where: { email: dto.email.trim().toLowerCase() },
      });
      if (existing) throw new ConflictException('Email already exists');
    }
    const existingUsername = await this.infraUserRepo.findOne({ where: { username: dto.username } });
    if (existingUsername) throw new ConflictException('Username already exists');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.infraUserRepo.create({
      username: dto.username.trim(),
      email: dto.email?.trim().toLowerCase() ?? null,
      phone: dto.phone ?? null,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      passwordHash,
      role: (dto.role as InfraUserRole) || InfraUserRole.STANDARD,
      kind: (dto.kind as InfraUserKind) || InfraUserKind.STAFF,
      states: (dto.states as never) ?? null,
    });
    const saved = await this.infraUserRepo.save(user);

    if (dto.branchId) {
      const branch = await this.infraBranchRepo.findOne({ where: { id: dto.branchId } });
      if (branch) {
        const membership = this.infraMembershipRepo.create({
          user: saved,
          branch,
          isBranchHead: dto.isBranchHead ?? false,
          isPrimary: dto.isPrimary ?? false,
        });
        const savedMembership = await this.infraMembershipRepo.save(membership);
        if (dto.branchRoleIds?.length) {
          const roles = await this.infraBranchRoleRepo.find({
            where: { id: In(dto.branchRoleIds) },
          });
          savedMembership.branchRoles = roles;
          await this.infraMembershipRepo.save(savedMembership);
        }
      }
    }

    return saved;
  }

  /** Seeds head office, Super Admin role (all resources), and first portal user. */
  async seedInfraPortalAdmin(
    email: string,
    password: string,
    username: string,
  ): Promise<void> {
    const existing = await this.infraUserRepo.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      console.log('Infra portal admin already exists — skipping');
      return;
    }

    let headOffice = await this.infraBranchRepo.findOne({ where: { isHeadOffice: true } });
    if (!headOffice) {
      const ho = this.infraBranchRepo.create({
        name: 'Head Office',
        level: InfraBranchLevel.ORG,
        path: 'temp',
        isHeadOffice: true,
        isActive: true,
        category: InfraBranchCategory.HEADOFFICE,
      });
      headOffice = await this.infraBranchRepo.save(ho);
      headOffice.path = headOffice.id;
      await this.infraBranchRepo.save(headOffice);
    }

    let superRole = await this.infraBranchRoleRepo.findOne({
      where: { branch: { id: headOffice.id }, roleName: 'Super Admin' },
      relations: ['branch', 'permissions'],
    });
    if (!superRole) {
      superRole = this.infraBranchRoleRepo.create({
        branch: headOffice,
        roleName: 'Super Admin',
        isBranchHead: true,
        permissions: [],
      });
      superRole = await this.infraBranchRoleRepo.save(superRole);
      const savedSuper = superRole;
      const perms = getAllInfraResources().map((resource) =>
        this.infraBranchRolePermRepo.create({
          branchRole: { id: savedSuper.id } as InfraBranchRole,
          resource,
          view: true,
          create: true,
          edit: true,
          delete: true,
        }),
      );
      await this.infraBranchRolePermRepo.save(perms);
      superRole = await this.infraBranchRoleRepo.findOneOrFail({
        where: { id: superRole.id },
        relations: ['permissions'],
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.infraUserRepo.save(
      this.infraUserRepo.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: InfraUserRole.ADMIN,
        kind: InfraUserKind.ADMIN,
        isVerified: true,
        firstName: 'Infra',
        lastName: 'Admin',
      }),
    );

    const membership = this.infraMembershipRepo.create({
      user,
      branch: headOffice,
      isBranchHead: true,
      isPrimary: true,
      branchRoles: [superRole],
    });
    await this.infraMembershipRepo.save(membership);

    console.log(`✓ Infra portal admin created: ${email}`);
    console.log(`✓ Head office branch: ${headOffice.id}`);
  }

  async adminLogin(dto: AdminLoginDto): Promise<{ accessToken: string; admin: InfraAdmin }> {
    const emailRaw = dto.email.trim();
    const admin = await this.adminRepo
      .createQueryBuilder('a')
      .where('LOWER(a.email) = LOWER(:email)', { email: emailRaw })
      .getOne();
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const password = typeof dto.password === 'string' ? dto.password : String(dto.password ?? '');
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload: JwtPayload = {
      sub: admin.adminId,
      kind: 'admin',
      role: admin.role,
      email: admin.email,
      adminId: admin.adminId,
      type: 'legacy_infra_admin',
    };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, admin };
  }

  async adminLoginPortal(dto: AdminLoginDto): Promise<{
    admin: { adminId: string; email: string; name: string | null; role: string };
    token: string;
  }> {
    const { accessToken, admin } = await this.adminLogin(dto);
    return {
      admin: {
        adminId: admin.adminId,
        email: admin.email,
        name: admin.name ?? null,
        role: admin.role,
      },
      token: accessToken,
    };
  }

  async developerLogin(dto: DeveloperLoginDto): Promise<{ accessToken: string }> {
    const dev = await this.devRepo.findOne({ where: { email: dto.email } });
    if (!dev) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, dev.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const accessToken = await this.jwt.signAsync({
      sub: dev.developerId,
      kind: 'developer',
    } satisfies JwtPayload);
    return { accessToken };
  }

  async customerLoginEmail(
    dto: CustomerEmailLoginDto,
  ): Promise<{ accessToken: string; customer: InfraCustomer }> {
    const email = dto.email.trim().toLowerCase();
    const customer = await this.customerRepo
      .createQueryBuilder('c')
      .where('LOWER(c.email) = LOWER(:email)', { email })
      .getOne();
    if (!customer) {
      throw new NotFoundException('No account for this email. Sign up to create one.');
    }
    if (!customer.passwordHash) {
      throw new UnauthorizedException('Use Google or OTP to sign in');
    }
    const ok = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');
    const accessToken = await this.signCustomerAccessToken(customer);
    return { accessToken, customer };
  }

  async customerRegisterEmail(
    dto: CustomerEmailRegisterDto,
  ): Promise<{ accessToken: string; customer: InfraCustomer }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.customerRepo
      .createQueryBuilder('c')
      .where('LOWER(c.email) = LOWER(:email)', { email })
      .getOne();
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const customer = this.customerRepo.create({
      email,
      passwordHash,
      name: dto.name?.trim() || null,
      phone: null,
      googleSub: null,
      isVerified: true,
    });
    await this.customerRepo.save(customer);
    const accessToken = await this.signCustomerAccessToken(customer);
    return { accessToken, customer };
  }

  async customerGoogle(
    dto: GoogleIdTokenDto,
  ): Promise<{ accessToken: string; customer: InfraCustomer }> {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new UnauthorizedException('GOOGLE_CLIENT_ID is not configured');
    }
    const client = new OAuth2Client(clientId);
    let email: string;
    let sub: string;
    let name: string | undefined;
    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload.sub) {
        throw new UnauthorizedException('Invalid Google token');
      }
      email = payload.email.toLowerCase();
      sub = payload.sub;
      name = payload.name ?? undefined;
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    let customer = await this.customerRepo.findOne({ where: { googleSub: sub } });
    if (!customer) {
      customer = await this.customerRepo
        .createQueryBuilder('c')
        .where('LOWER(c.email) = LOWER(:email)', { email })
        .getOne();
    }

    if (customer) {
      customer.email = email;
      if (!customer.googleSub) customer.googleSub = sub;
      if (name && !customer.name) customer.name = name;
      customer.isVerified = true;
      await this.customerRepo.save(customer);
    } else {
      customer = this.customerRepo.create({
        email,
        googleSub: sub,
        name: name ?? null,
        phone: null,
        passwordHash: null,
        isVerified: true,
      });
      await this.customerRepo.save(customer);
    }

    const accessToken = await this.signCustomerAccessToken(customer);
    return { accessToken, customer };
  }

  async customerGoogleAccessToken(
    dto: GoogleAccessTokenDto,
  ): Promise<{ accessToken: string; customer: InfraCustomer }> {
    const trimmed = dto.accessToken?.trim();
    if (!trimmed) {
      throw new BadRequestException('Missing access token');
    }
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${trimmed}` },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Invalid or expired Google session');
    }
    const body = (await res.json()) as { email?: string; name?: string; sub?: string };
    if (!body.email) {
      throw new UnauthorizedException('Google account has no email');
    }
    const email = body.email.trim().toLowerCase();
    const sub = body.sub;
    const name = body.name?.trim() || null;

    let customer = sub
      ? await this.customerRepo.findOne({ where: { googleSub: sub } })
      : null;
    if (!customer) {
      customer = await this.customerRepo
        .createQueryBuilder('c')
        .where('LOWER(c.email) = LOWER(:email)', { email })
        .getOne();
    }

    if (customer) {
      customer.email = email;
      if (sub && !customer.googleSub) customer.googleSub = sub;
      if (name && !customer.name) customer.name = name;
      customer.isVerified = true;
      await this.customerRepo.save(customer);
    } else {
      customer = this.customerRepo.create({
        email,
        googleSub: sub ?? null,
        name,
        phone: null,
        passwordHash: null,
        isVerified: true,
      });
      await this.customerRepo.save(customer);
    }

    const accessToken = await this.signCustomerAccessToken(customer);
    return { accessToken, customer };
  }
}
