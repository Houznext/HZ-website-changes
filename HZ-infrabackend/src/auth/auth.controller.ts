import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  CustomerEmailLoginDto,
  CustomerEmailRegisterDto,
  DeveloperLoginDto,
  GoogleAccessTokenDto,
  GoogleIdTokenDto,
  LoginDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from './jwt.strategy';

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

  /** Infra portal staff/admin (`infra_users`) — HZ-infraadmin uses this. */
  @HttpCode(200)
  @Post('login')
  async infraPortalLogin(@Body() dto: LoginDto) {
    return this.auth.infraPortalLogin(dto);
  }

  /** Legacy `infra_admin` table login (unchanged response shape). */
  @Post('legacy-admin-login')
  adminLoginLegacy(@Body() dto: AdminLoginDto) {
    return this.auth.adminLogin(dto);
  }

  @Post('admin/login')
  adminPortalLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLoginPortal(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@Req() req: { user: JwtPayload }) {
    const u = req.user;
    if (u.type === 'legacy_infra_admin') {
      return this.auth.getLegacyAdminMe(u.sub);
    }
    return this.auth.getInfraPortalMe(u.sub);
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

  @HttpCode(200)
  @Post('customer/google-access-token')
  customerGoogleAccessToken(@Body() dto: GoogleAccessTokenDto) {
    return this.auth.customerGoogleAccessToken(dto);
  }
}
