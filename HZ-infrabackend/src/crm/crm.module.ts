import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraCRMLead } from './entities/infra-crm-lead.entity';
import { CrmService } from './crm.service';
import { AdminCrmController } from './admin-crm.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InfraCRMLead])],
  controllers: [AdminCrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
