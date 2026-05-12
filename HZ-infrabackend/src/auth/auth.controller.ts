import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  CustomerEmailLoginDto,
  CustomerEmailRegisterDto,
  DeveloperLoginDto,
  GoogleIdTokenDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidUnknownValues: false,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLogin(dto);
  }

  @HttpCode(200)
  @Post('admin/login')
  adminPortalLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLoginPortal(dto);
  }

  @Post('developer-login')
  developerLogin(@Body() dto: DeveloperLoginDto) {
    return this.auth.developerLogin(dto);
  }

  @HttpCode(200)
  @Post('customer/login-email')
  customerLoginEmail(@Body() dto: CustomerEmailLoginDto) {
    return this.auth.customerLoginEmail(dto);
  }

  @HttpCode(201)
  @Post('customer/register-email')
  customerRegisterEmail(@Body() dto: CustomerEmailRegisterDto) {
    return this.auth.customerRegisterEmail(dto);
  }

  @HttpCode(200)
  @Post('customer/google')
  customerGoogle(@Body() dto: GoogleIdTokenDto) {
    return this.auth.customerGoogle(dto);
  }
}
