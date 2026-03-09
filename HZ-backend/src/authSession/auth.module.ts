import { Global, Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from 'src/jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { ControllerAuthGuard } from 'src/guard';

@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,ControllerAuthGuard],
  exports: [AuthService, JwtModule,ControllerAuthGuard],
})
export class AuthModule {}
