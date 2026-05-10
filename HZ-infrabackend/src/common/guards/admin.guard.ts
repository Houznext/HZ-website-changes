import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../auth/jwt.strategy';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const u = req.user;
    if (!u || u.kind !== 'admin') throw new ForbiddenException('Admin only');
    if (u.role && u.role !== 'admin' && u.role !== 'sales_rep') {
      throw new ForbiddenException('Invalid admin role');
    }
    return true;
  }
}
