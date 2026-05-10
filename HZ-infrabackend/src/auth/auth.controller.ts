import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto, DeveloperLoginDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
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
}
