import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InfraEnquiry } from './entities/infra-enquiry.entity';
import { InfraProperty } from '../property/entities/infra-property.entity';
import { EnquiryService } from './enquiry.service';
import { EnquiryController } from './enquiry.controller';
import { InfraMailService } from '../common/mail/infra-mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([InfraEnquiry, InfraProperty])],
  controllers: [EnquiryController],
  providers: [EnquiryService, InfraMailService],
  exports: [EnquiryService],
})
export class EnquiryModule {}
