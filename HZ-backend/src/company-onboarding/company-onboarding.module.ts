import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Project } from './entities/company-projects.entity';
import { Sellers } from './entities/company-property-sellers.entity';
import { PropertyType } from './entities/project-property-type.entity';
import { DeveloperInformation } from './entities/developer-information.entity';
import { Units } from './entities/property-type-units.entity';
import { FlooringPlans } from './entities/units-floor-planing.entity';
import { LocationDetails } from 'src/property/entities/location.entity';
import { ConstructionStatus } from 'src/property/entities/property-details/constructionStatus.entity';
import { MediaDetails } from 'src/property/entities/mediaDetails.entity';
import { CompanyOnboardingController } from './company-onboarding.controller';
import { CompanyOnboardingService } from './company-onboarding.service';
import { User } from 'src/user/entities/user.entity';
import { Otp } from 'src/otp/entities/otp.entity';
import { OtpService } from 'src/otp/otp.service';
import { MailerService } from 'src/sendEmail.service';
import { SmsService } from 'src/sms.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Company,
      Project,
      Sellers,
      PropertyType,
      DeveloperInformation,
      Units,
      FlooringPlans,
      LocationDetails,
      ConstructionStatus,
      MediaDetails,
      User,
      Otp,
      Notification
    ]),
    S3Module,
  ],
  providers: [CompanyOnboardingService, OtpService, MailerService, SmsService,NotificationService],
  controllers: [CompanyOnboardingController],
  exports: [CompanyOnboardingService],
})
export class CompanyOnboardingModule {}
