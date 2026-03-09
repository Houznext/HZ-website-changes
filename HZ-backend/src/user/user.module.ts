import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../authSession/auth.module';
import { AddressModule } from 'src/Address/address.module';
import { LocationDetails } from 'src/property/entities/location.entity';
import { Property } from 'src/property/entities/property.entity';
import { NotificationModule } from 'src/notifications/notification.module';
import { MailerService } from 'src/sendEmail.service';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LocationDetails, Property]),
    forwardRef(() => AuthModule),
    forwardRef(() => AddressModule),
    forwardRef(() => NotificationModule),
    S3Module,
  ],
  controllers: [UserController],
  providers: [UserService, MailerService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
