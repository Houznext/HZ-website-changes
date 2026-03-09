import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { CityService } from './city.service';
import { CityController } from './city.controller';
import { State } from 'src/geography/state/entities/state.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([State, City]), UserModule],
  providers: [CityService],
  controllers: [CityController],
  exports: [TypeOrmModule, CityService],
})
export class CityModule {}
