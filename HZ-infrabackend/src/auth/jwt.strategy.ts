import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';
import { mapMembershipsToPortalPayload } from './infra-membership.mapper';

export type JwtPayload = {
  sub: string;
  kind: 'customer' | 'admin' | 'developer';
  role?: string;
  email?: string;
  adminId?: string;
  type?: string;
  branchMemberships?: ReturnType<typeof mapMembershipsToPortalPayload>;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(InfraUserBranchMembership)
    private readonly membershipRepo: Repository<InfraUserBranchMembership>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || process.env.INFRA_JWT_SECRET || 'dev-secret-change-me',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');

    if (payload.type === 'infra_user') {
      const memberships = await this.membershipRepo.find({
        where: { user: { id: payload.sub } },
        relations: ['branch', 'branchRoles', 'branchRoles.permissions'],
      });
      return {
        ...payload,
        branchMemberships: mapMembershipsToPortalPayload(memberships),
      };
    }

    return payload;
  }
}
