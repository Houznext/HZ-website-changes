import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/user/dto/user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT token' })
  async login(
    @Body() loginDto: LoginUserDto,
  ): Promise<{ access_token: string }> {
    return this.authService.loginUser(loginDto);
  }
}
