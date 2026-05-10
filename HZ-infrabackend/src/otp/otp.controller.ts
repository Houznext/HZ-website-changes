import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(private readonly otp: OtpService) {}

  @Post('send')
  send(@Body() dto: SendOtpDto) {
    return this.otp.send(dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyOtpDto) {
    return this.otp.verify(dto);
  }
}
