import { Body, Controller, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { EnquiryService } from '../enquiry/enquiry.service';
import { RegisterCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CustomerPhoneSendDto, CustomerPhoneVerifyDto } from './dto/customer-phone.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomerGuard } from '../common/guards/customer.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customers: CustomerService,
    private readonly enquiries: EnquiryService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterCustomerDto) {
    return this.customers.register(user.sub, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: JwtPayload) {
    return this.customers.me(user.sub);
  }

  @Get('me/enquiries')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  async myEnquiries(@CurrentUser() user: JwtPayload) {
    const me = await this.customers.me(user.sub);
    const phone10 = me.phone?.replace(/\D/g, '').slice(-10) ?? null;
    return this.enquiries.listForCustomer(user.sub, phone10);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  patchMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCustomerDto) {
    return this.customers.updateMe(user.sub, dto);
  }

  @Post('me/phone/send-otp')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  sendPhoneOtp(@CurrentUser() user: JwtPayload, @Body() dto: CustomerPhoneSendDto) {
    return this.customers.requestPhoneOtp(user.sub, dto.phone);
  }

  @Post('me/phone/verify')
  @UseGuards(JwtAuthGuard, CustomerGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  verifyPhoneOtp(@CurrentUser() user: JwtPayload, @Body() dto: CustomerPhoneVerifyDto) {
    return this.customers.verifyPhoneOtp(user.sub, dto.phone, dto.otp);
  }
}
