import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { EnquiryService } from '../enquiry/enquiry.service';
import { UpdateEnquiryDto } from '../enquiry/dto/update-enquiry.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEnquiryDto) {
    return this.enquiries.adminUpdate(id, dto);
  }
}
