import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../auth/jwt.strategy';

@Injectable()
export class CustomerGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const u = req.user;
    if (!u || u.kind !== 'customer') throw new ForbiddenException('Customer only');
    return true;
  }
}
