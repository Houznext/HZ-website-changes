import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../auth/jwt.strategy';

@Injectable()
export class DeveloperGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const u = req.user;
    if (!u || u.kind !== 'developer') throw new ForbiddenException('Developer only');
    return true;
  }
}
