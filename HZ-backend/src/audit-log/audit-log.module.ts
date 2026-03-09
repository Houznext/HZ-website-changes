import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { AuditLogController } from './audit-log.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/authSession/auth.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogInterceptor],
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule {}
