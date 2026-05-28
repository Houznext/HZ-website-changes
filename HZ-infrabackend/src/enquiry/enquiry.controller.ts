import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EnquiryService } from './enquiry.service';
import { CreateEnquiryDto } from './dto/enquiry.dto';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('enquiries')
@Controller('enquiries')
export class EnquiryController {
  constructor(private readonly enquiries: EnquiryService) {}

  @Post()
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth()
  create(
    @Body() dto: CreateEnquiryDto,
    @Req() req: { user?: JwtPayload },
  ) {
    const user = req.user;
    if (user?.kind === 'customer' && user.sub) {
      dto.customerId = user.sub;
    }
    return this.enquiries.create(dto);
  }
}
