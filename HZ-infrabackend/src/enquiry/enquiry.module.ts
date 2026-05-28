import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraEnquiry } from './entities/infra-enquiry.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { EnquiryService } from './enquiry.service';
import { EnquiryController } from './enquiry.controller';
import { InfraMailService } from '../common/mail/infra-mail.service';
import { CrmLeadModule } from '../crm-lead/crm-lead.module';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';

@Module({
  imports: [TypeOrmModule.forFeature([InfraEnquiry, InfraProperty]), CrmLeadModule],
  controllers: [EnquiryController],
  providers: [EnquiryService, InfraMailService, OptionalJwtGuard],
  exports: [EnquiryService],
})
export class EnquiryModule {}
