import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ExistingUser,
  ReturnOtpDto,
  SendOtpDto,
  userStatus,
  VerifyOtpDto,
  VerifyPasswordDto,
} from './dto/otp.dto';
import { ReturnUserDto } from 'src/user/dto/user.dto';
@Controller('otp')
@ApiTags('Otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}
  @Post('send')
  @ApiOperation({ summary: 'Send Otp to User' })
  @ApiResponse({
    status: 200,
    description: 'Otp sent successfully.',
    type: ReturnOtpDto,
  })
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<ReturnOtpDto> {
    return this.otpService.sendOtp(sendOtpDto);
  }
  @Post('verify')
  @ApiOperation({ summary: 'Verify Otp' })
  @ApiResponse({
    status: 200,
    description: 'Verified Otp successfully.',
    type: ReturnOtpDto,
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<ReturnOtpDto> {
    return this.otpService.verifyOtp(verifyOtpDto);
  }

  @Post('verify-password')
  @ApiOperation({ summary: 'Verify Password' })
  @ApiResponse({
    status: 200,
    description: 'Verified Password successfully.',
    type: ReturnOtpDto,
  })
  async verifyPassword(
    @Body() verifyPassword: VerifyPasswordDto,
  ): Promise<{ message: string; token?: string; user?: ReturnUserDto }> {
    return this.otpService.validateUser(verifyPassword);
  }

  @Post('check-user')
  @ApiOperation({ summary: 'check User exists' })
  @ApiResponse({
    status: 200,
    description: 'User exists.',
    type: userStatus,
  })
  @HttpCode(200)
  async existingUser(@Body() existingUser: ExistingUser): Promise<userStatus> {
    return this.otpService.existingUser(existingUser);
  }

  @Post('resend')
  @ApiOperation({ summary: 'Resend Otp to User' })
  @ApiResponse({
    status: 200,
    description: 'Otp sent successfully.',
    type: ReturnOtpDto,
  })
  async resendOtp(@Body() sendOtpDto: SendOtpDto): Promise<ReturnOtpDto> {
    return this.otpService.resendOtp(sendOtpDto);
  }
}
