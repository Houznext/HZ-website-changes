import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';
import { AuditAction } from './entities/audit-log.entity';
import { RequestUser } from 'src/guard';

const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method?.toUpperCase();

    const action = METHOD_TO_ACTION[method];
    if (!action) {
      return next.handle();
    }

    const reqUser: RequestUser | undefined = request.user;
    const path: string = request.originalUrl || request.url;
    const ipAddress =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      null;
    const userAgent = request.headers['user-agent'] || null;

    const resource = this.extractResource(path);
    const resourceId = request.params?.id || request.params?.userId || null;
    const branchId =
      reqUser?.activeBranchId || request.params?.branchId || null;

    return next.handle().pipe(
      tap((responseBody) => {
        const newValue =
          responseBody && typeof responseBody === 'object'
            ? this.sanitize(responseBody)
            : null;

        this.auditLogService.log({
          userId: reqUser?.id ?? null,
          action,
          resource,
          resourceId: newValue?.id ?? resourceId,
          branchId,
          httpMethod: method,
          path,
          newValue,
          ipAddress,
          userAgent,
        });
      }),
    );
  }

  private extractResource(path: string): string {
    const segments = path.replace(/^\/api\//, '/').split('/').filter(Boolean);
    return segments[0] || 'unknown';
  }

  private sanitize(obj: any): Record<string, any> | null {
    try {
      const str = JSON.stringify(obj);
      if (str.length > 5000) return { _truncated: true, id: obj.id };
      const parsed = JSON.parse(str);
      delete parsed.password;
      delete parsed.passwordResetToken;
      delete parsed.token;
      delete parsed.access_token;
      return parsed;
    } catch {
      return null;
    }
  }
}
