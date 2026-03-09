import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Electricity } from './entities/electricity.entity';
import { ElectricityService } from './electricity.service';
import { ElectricityController } from './electricity.controller';
import { CBService } from 'src/Custombuilder/service-required/entities/cb-service.entity';
 import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Electricity, CBService]),forwardRef(() => UserModule),],
  controllers: [ElectricityController],
  providers: [ElectricityService],
})
export class ElectricityModule {}
