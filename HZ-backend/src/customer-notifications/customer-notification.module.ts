import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CustomerNotification } from './entities/customer-notification.entity';
import { CustomerNotificationService } from './customer-notification.service';
import { CustomerNotificationController } from './customer-notification.controller';
import { CustomerIdentityModule } from 'src/common/customer-identity/customer-identity.module';
import { Customer } from 'src/interiors/entities/customer.entity';
import { InteriorJwtGuard } from 'src/interiors/interior-jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerNotification, Customer]),
    CustomerIdentityModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hz_jwt_secret_fallback',
    }),
  ],
  controllers: [CustomerNotificationController],
  providers: [CustomerNotificationService, InteriorJwtGuard],
  exports: [CustomerNotificationService],
})
export class CustomerNotificationModule {}
