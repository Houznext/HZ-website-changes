import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraSavedProperty } from './entities/infra-saved.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { SavedService } from './saved.service';
import { SavedController } from './saved.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraSavedProperty, InfraProperty])],
  controllers: [SavedController],
  providers: [SavedService],
})
export class SavedModule {}
