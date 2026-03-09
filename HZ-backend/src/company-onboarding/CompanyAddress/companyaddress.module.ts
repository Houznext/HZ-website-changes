import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressController } from './companyaddress.controller';
import { AddressService } from './companyaddress.service';
import { Company } from '../entities/company.entity';
import { LocationDetails } from 'src/property/entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationDetails, Company])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class CompanyAddressModule {}
