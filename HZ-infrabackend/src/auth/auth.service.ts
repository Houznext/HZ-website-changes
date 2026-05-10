import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InfraAdmin } from '../admin/entities/infra-admin.entity';
import { InfraDeveloper } from '../developer/entities/infra-developer.entity';
import { AdminLoginDto, DeveloperLoginDto } from './dto/auth.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(InfraAdmin)
    private readonly adminRepo: Repository<InfraAdmin>,
    @InjectRepository(InfraDeveloper)
    private readonly devRepo: Repository<InfraDeveloper>,
    private readonly jwt: JwtService,
  ) {}

  async adminLogin(dto: AdminLoginDto): Promise<{ accessToken: string; admin: InfraAdmin }> {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
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
}
