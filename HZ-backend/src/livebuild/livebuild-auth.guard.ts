import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ControllerAuthGuard } from 'src/guard';
import { normalizeLbMobile } from './livebuild-mobile.util';

export interface LivebuildJwtPayload {
  sub: string;
  mobile: string;
}

export type LivebuildRequest = Request & {
  lbMobile?: string;
  lbAdmin?: boolean;
  user?: unknown;
};

function lbSecret(): string {
  return (
    process.env.LIVEBUILD_JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'livebuild_jwt_fallback'
  );
}

@Injectable()
export class LivebuildAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<LivebuildRequest>();

    const auth = request.headers.authorization;
    const bearer =
      typeof auth === 'string' && auth.startsWith('Bearer ')
        ? auth.slice(7)
        : null;
    if (bearer) {
      try {
        const customer = this.jwtService.verify<{
          role?: string;
          mobile?: string;
        }>(bearer, {
          secret: process.env.JWT_SECRET || 'hz_jwt_secret_fallback',
        });
        if (customer.role === 'customer') {
          const raw = customer.mobile?.trim();
          if (!raw || raw.replace(/\D/g, '').length < 10) {
            throw new UnauthorizedException(
              'Link your mobile number in My Account to use LiveBuild',
            );
          }
          request.lbMobile = normalizeLbMobile(raw);
          request.lbAdmin = false;
          return true;
        }
      } catch (e) {
        if (e instanceof UnauthorizedException) throw e;
      }
    }

    const token = request.headers['x-lb-token'];
    if (!token || Array.isArray(token)) {
      throw new UnauthorizedException(
        'Sign in to Houznext and open LiveBuild from your profile',
      );
    }
    try {
      const payload = this.jwtService.verify<LivebuildJwtPayload>(token, {
        secret: lbSecret(),
      });
      request.lbMobile = normalizeLbMobile(payload.mobile || payload.sub);
      request.lbAdmin = false;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired LiveBuild session');
    }
  }
}

@Injectable()
export class LivebuildDualAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminGuard: ControllerAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<LivebuildRequest>();
    const authHeader = request.headers.authorization;
    const hasAdminBearer =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ');

    // Admin panel uses backend JWT (JWT_SECRET). Try that before X-LB-Token so a
    // stale customer OTP token in X-LB-Token cannot block staff project views.
    if (hasAdminBearer) {
      try {
        const ok = await this.adminGuard.canActivate(context);
        if (ok) {
          request.lbAdmin = true;
          return true;
        }
      } catch {
        // Not a valid staff token; allow X-LB-Token fallback below.
      }
    }

    const lbToken = request.headers['x-lb-token'];
    if (lbToken && !Array.isArray(lbToken)) {
      try {
        const payload = this.jwtService.verify<LivebuildJwtPayload>(lbToken, {
          secret: lbSecret(),
        });
        request.lbMobile = normalizeLbMobile(payload.mobile || payload.sub);
        request.lbAdmin = false;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired LiveBuild token');
      }
    }

    const ok = await this.adminGuard.canActivate(context);
    if (ok) {
      request.lbAdmin = true;
    }
    return ok;
  }
}

export { lbSecret };
