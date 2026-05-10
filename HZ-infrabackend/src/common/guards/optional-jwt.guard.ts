import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../auth/jwt.strategy';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtPayload;
    }>();
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) return true;
    const token = h.slice(7);
    try {
      req.user = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      /* ignore invalid optional token */
    }
    return true;
  }
}
