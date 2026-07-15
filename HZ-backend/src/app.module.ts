import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { runPreTypeOrmSynchronizePatches } from '../db/preTypeOrmSyncPatches';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { dataSourceOptions } from 'db/datasource';
import { BlogModule } from './blog/blog.module';
import { OtpModule } from './otp/otp.module';
import { MailerService } from './sendEmail.service';
import { TestimonialModule } from './testimonials/testimonials.module';
import { AuthModule } from './authSession/auth.module';
import { AddressModule } from './Address/address.module';
import { BuilderLeadsModule } from './builderleads/builder.module';
import { FurnitureModule } from './furnitures/furniture.module';
import { ConfigModule } from '@nestjs/config';
import { CartModule } from './cart/cart.module';
import { NotificationModule } from './notifications/notification.module';
import { CareerAdminModule } from './careers/admin/careerAdmin.module';
import { CareerModule } from './careers/career/career.module';
import { CostEstimatorModule } from './cost-estimator/cost-estimator.module';
import { ControllerAuthGuard } from './guard';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CRMLeadModule } from './crm/crm.module';
import { AwardModule } from './company-onboarding/Awards/awards.module';
import { CompanyAddressModule } from './company-onboarding/CompanyAddress/companyaddress.module';
import { CompanyOnboardingModule } from './company-onboarding/company-onboarding.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { DeleteAccountModule } from './deleteaccount/delete-account.module';
import { PropertyLeadModule } from './property-lead/property-lead.module';
import { InvoiceEstimatorModule } from './invoice-estimator/invoice-estimator.module';
import { WhatsAppModule } from './whatsappSend/whatsapp.module';
import { S3Module } from './common/s3/s3.module';
import { ContactUsModule } from './contactus/contact-us.module';
import { ResourceModule } from './ResourceName/resource.module';
import { CityModule } from './geography/city/city.module';
import { StateModule } from './geography/state/state.module';
import { OrdersModule } from './orders/order.module';
import { PaymentsModule } from './payment/payment.module';
import { HouznextRewardsModule } from './houznext-rewards/houznext-rewards.module';
import { ChatModule } from './chat/chat.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { RealtimeModule } from './realtime/realtime.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FloorplansModule } from './floorplans/floorplans.module';
import { ShiprocketModule } from './shiprocket/shiprocket.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { InteriorModule } from './interiors/interior.module';
import { InteriorPackagesModule } from './interior-packages/interior-packages.module';
import { BranchModule } from './branch/branch.module';
import { BranchRoleModule } from './branchRole/branch-role.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './audit-log/audit-log.interceptor';
import { InteriorProjectsModule } from './interior-projects/interior-projects.module';
import { HeroCarouselModule } from './hero-carousel/hero-carousel.module';
import { ServicesContentModule } from './services-content/services-content.module';
import { CmsModule } from './cms/cms.module';
import { SiteCmsModule } from './site-cms/site-cms.module';
import { PageSeoModule } from './page-seo/page-seo.module';
import { LivebuildModule } from './livebuild/livebuild.module';
import { CustomerNotificationModule } from './customer-notifications/customer-notification.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        await runPreTypeOrmSynchronizePatches(url);
        return {
          ...dataSourceOptions,
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
          migrations: [],
          migrationsRun: false,
        };
      },
    }),
    ScheduleModule.forRoot(),
    RealtimeModule,
    AuthModule,
    UserModule,
    S3Module,
    NotificationModule,
    CustomerNotificationModule,
    TasksModule,
    BlogModule,
    OtpModule,
    TestimonialModule,
    AddressModule,
    BuilderLeadsModule,
    FurnitureModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    CareerAdminModule,
    CareerModule,
    WhatsAppModule,
    CostEstimatorModule,
    ReviewsModule,
    WishlistModule,
    CRMLeadModule,
    AwardModule,
    CompanyAddressModule,
    CompanyOnboardingModule,
    DeleteAccountModule,
    PropertyLeadModule,
    InvoiceEstimatorModule,
    StateModule,
    ResourceModule,
    ContactUsModule,
    CityModule,
    HouznextRewardsModule,
    ChatModule,
    ChatbotModule,
    FloorplansModule,
    ShiprocketModule,
    AuditLogModule,
    InteriorModule,
    InteriorPackagesModule,
    BranchModule,
    BranchRoleModule,
    InteriorProjectsModule,
    HeroCarouselModule,
    ServicesContentModule,
    CmsModule,
    SiteCmsModule,
    PageSeoModule,
    LivebuildModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailerService,
    ControllerAuthGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
