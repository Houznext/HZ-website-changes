import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import { InfraAdmin } from '../admin/entities/infra-admin.entity';
import { InfraDeveloper } from '../developer/entities/infra-developer.entity';
import { InfraCustomer } from '../customer/entities/infra-customer.entity';
import {
  AdminLoginDto,
  CustomerEmailLoginDto,
  CustomerEmailRegisterDto,
  DeveloperLoginDto,
  GoogleIdTokenDto,
} from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(InfraAdmin)
    private readonly adminRepo: Repository<InfraAdmin>,
    @InjectRepository(InfraDeveloper)
    private readonly devRepo: Repository<InfraDeveloper>,
    @InjectRepository(InfraCustomer)
    private readonly customerRepo: Repository<InfraCustomer>,
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
      type: 'admin',
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
    if (!customer) throw new UnauthorizedException('Invalid email or password');
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
}
