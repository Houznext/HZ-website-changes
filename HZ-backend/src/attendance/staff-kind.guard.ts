import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserKind } from 'src/user/enum/user.enum';

@Injectable()
export class StaffKindGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // depends on your Jwt strategy payload
    if (!user) throw new ForbiddenException('Unauthorized');

    // allow STAFF, and optionally ADMIN/CEO if those exist in your system
    if (user.kind !== UserKind.STAFF) {
      throw new ForbiddenException('Only staff can access this resource');
    }
    return true;
  }
}
