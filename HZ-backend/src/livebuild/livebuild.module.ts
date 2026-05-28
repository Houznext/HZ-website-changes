import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  LivebuildCustomer,
  LivebuildProject,
  LivebuildWorkType,
  LivebuildRoom,
  LivebuildRoomWorkType,
  LivebuildDpr,
  LivebuildDprPhoto,
  LivebuildPayment,
  LivebuildQuery,
  LivebuildDocument,
  LivebuildMaterial,
  LivebuildPropertyInfo,
  LivebuildOtp,
} from './entities';
import { LivebuildController } from './livebuild.controller';
import { LivebuildService } from './livebuild.service';
import { LivebuildOtpService } from './livebuild-otp.service';
import { LivebuildSeedService } from './livebuild.seed';
import { LivebuildPortalService } from './livebuild-portal.service';
import {
  LivebuildAuthGuard,
  LivebuildDualAuthGuard,
} from './livebuild-auth.guard';
import { S3Module } from 'src/common/s3/s3.module';
import { SmsService } from 'src/sms.service';
import { User } from 'src/user/entities/user.entity';
import { MailerService } from 'src/sendEmail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LivebuildCustomer,
      LivebuildProject,
      LivebuildWorkType,
      LivebuildRoom,
      LivebuildRoomWorkType,
      LivebuildDpr,
      LivebuildDprPhoto,
      LivebuildPayment,
      LivebuildQuery,
      LivebuildDocument,
      LivebuildMaterial,
      LivebuildPropertyInfo,
      LivebuildOtp,
      User,
    ]),
    JwtModule.register({
      secret:
        process.env.LIVEBUILD_JWT_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        'livebuild_jwt_fallback',
      signOptions: { expiresIn: '30d' },
    }),
    S3Module,
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [LivebuildController],
  providers: [
    LivebuildService,
    LivebuildOtpService,
    LivebuildPortalService,
    LivebuildSeedService,
    LivebuildAuthGuard,
    LivebuildDualAuthGuard,
    SmsService,
    MailerService,
  ],
  exports: [LivebuildService],
})
export class LivebuildModule {}
