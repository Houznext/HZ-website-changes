import { Module } from '@nestjs/common';
import { PropertyModule } from '../property/property.module';
import { EnquiryModule } from '../enquiry/enquiry.module';
import { AdminPropertiesController } from './admin-properties.controller';
import { AdminEnquiriesController } from './admin-enquiries.controller';

@Module({
  imports: [PropertyModule, EnquiryModule],
  controllers: [AdminPropertiesController, AdminEnquiriesController],
})
export class AdminModule {}
