import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../../interiors/entities/customer.entity';
import { LivebuildCustomer } from '../../livebuild/entities/livebuild-customer.entity';
import { User } from '../../user/entities/user.entity';
import { CustomerIdentityService } from './customer-identity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, LivebuildCustomer, User])],
  providers: [CustomerIdentityService],
  exports: [CustomerIdentityService],
})
export class CustomerIdentityModule {}
