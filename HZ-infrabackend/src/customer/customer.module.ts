import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraCustomer } from './entities/infra-customer.entity';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InfraCustomer]),
    forwardRef(() => OtpModule),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
