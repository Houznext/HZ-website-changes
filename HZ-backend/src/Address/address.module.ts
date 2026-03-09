import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AddressController } from './address.controller';
import { LocationDetails } from 'src/property/entities/location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationDetails, User]),  
    forwardRef(() => UserModule), 
  ],  
  controllers:[AddressController],
  providers: [AddressService],
  exports: [AddressService, TypeOrmModule],  
})
export class AddressModule {}
