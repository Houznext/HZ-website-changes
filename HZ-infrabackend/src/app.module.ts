import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { buildTypeOrmOptions } from './db/datasource';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { CustomerModule } from './customer/customer.module';
import { PropertyModule } from './property/property.module';
import { ProjectModule } from './project/project.module';
import { EnquiryModule } from './enquiry/enquiry.module';
import { CrmModule } from './crm/crm.module';
import { AdminModule } from './admin/admin.module';
import { SavedModule } from './saved/saved.module';
import { DeveloperModule } from './developer/developer.module';
import { NewsModule } from './news/news.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { SiteVisitModule } from './site-visit/site-visit.module';
import { S3Module } from './s3/s3.module';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => buildTypeOrmOptions(),
    }),
    AuthModule,
    OtpModule,
    CustomerModule,
    PropertyModule,
    ProjectModule,
    EnquiryModule,
    CrmModule,
    AdminModule,
    SavedModule,
    DeveloperModule,
    NewsModule,
    SiteConfigModule,
    SiteVisitModule,
    S3Module,
  ],
})
export class AppModule {}
