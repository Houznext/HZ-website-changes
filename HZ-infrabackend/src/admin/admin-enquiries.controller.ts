import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { EnquiryService } from '../enquiry/enquiry.service';

@ApiTags('admin-enquiries')
@Controller('admin/enquiries')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminEnquiriesController {
  constructor(private readonly enquiries: EnquiryService) {}

  @Get()
  list() {
    return this.enquiries.adminList();
  }
}
