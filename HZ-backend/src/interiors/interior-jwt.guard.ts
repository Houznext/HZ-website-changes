import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface InteriorJwtPayload {
  sub: string;
  role: string;
  mobile?: string;
  email?: string;
}

@Injectable()
export class InteriorJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const auth = request.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    try {
      const secret = process.env.JWT_SECRET || 'hz_jwt_secret_fallback';
      const payload = this.jwtService.verify<InteriorJwtPayload>(token, { secret });
      (request as Request & { user: InteriorJwtPayload }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
