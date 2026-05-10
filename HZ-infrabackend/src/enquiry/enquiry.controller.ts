import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnquiryService } from './enquiry.service';
import { CreateEnquiryDto } from './dto/enquiry.dto';

@ApiTags('enquiries')
@Controller('enquiries')
export class EnquiryController {
  constructor(private readonly enquiries: EnquiryService) {}

  @Post()
  create(@Body() dto: CreateEnquiryDto) {
    return this.enquiries.create(dto);
  }
}
