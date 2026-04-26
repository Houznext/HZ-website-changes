import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { dataSourceOptions } from 'db/datasource';
import { PropertyModule } from './property/property.module';
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
import { CustomerModule } from './livebuild/customer/customer.module';
import { LocationModule } from './livebuild/location/location.module';
import { LivebuildModule } from './livebuild/custom-builder.module';
import { DailyProgressModule } from './livebuild/daily-progress/daily-progress.module';
import { CustomPropertyModule } from './livebuild/custom-property/custom-property.module';
import { CBServiceModule } from './livebuild/service-required/cb-service.module';
import { CostEstimatorModule } from './cost-estimator/cost-estimator.module';
import { ControllerAuthGuard } from './guard';
import { BorewellModule } from './livebuild/services/borewell/borewell.module';
import { BrickMasonryModule } from './livebuild/services/brickMasonry/brickMasonry.module';
import { CentringModule } from './livebuild/services/centring/centring.module';
import { DocumentDraftingModule } from './livebuild/services/documentDrafting/documentDrafting.module';
import { ElectricityModule } from './livebuild/services/electricity/electricity.module';
import { FallCeilingModule } from './livebuild/services/fallCeiling/fallCeiling.module';
import { FlooringModule } from './livebuild/services/flooring/flooring.module';
import { PaintingModule } from './livebuild/services/painting/painting.module';
import { PlumbingModule } from './livebuild/services/plumbing/plumbing.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CRMLeadModule } from './crm/crm.module';
import { AwardModule } from './company-onboarding/Awards/awards.module';
import { CompanyAddressModule } from './company-onboarding/CompanyAddress/companyaddress.module';
import { InteriorServiceModule } from './livebuild/services/interior/interior.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { DeleteAccountModule } from './deleteaccount/delete-account.module';
import { PropertyLeadModule } from './property/propertyLead/property-lead.module';
import { InvoiceEstimatorModule } from './invoice-estimator/invoice-estimator.module';
import { WhatsAppModule } from './whatsappSend/whatsapp.module';
import { UnifiedPropertyListingModule } from './unified-property-listing/unified-property-listing.module';
import { QueryModule } from './livebuild/Query/query.module';
import { S3Module } from './common/s3/s3.module';
import { PackageModule } from './livebuild/package/package.module';
import { ContactUsModule } from './contactus/contact-us.module';
import { ResourceModule } from './ResourceName/resource.module';
import { CbDocumentModule } from './livebuild/cbdocument/cbdocument.module';
import { PhaseModule } from './livebuild/phase/phase.module';
import { MaterialsModule } from './livebuild/Materials/materials.module';
import { PaymentTrackingModule } from './livebuild/payment-tracking/payment-tracking.module';
import { CityModule } from './geography/city/city.module';
import { StateModule } from './geography/state/state.module';
import { OrdersModule } from './orders/order.module';
import { HouznextRewardsModule } from './houznext-rewards/houznext-rewards.module';
import { PropertyPremiumPlansModule } from './property-premium-plans/property-premium-plans.module';
import { ChatModule } from './chat/chat.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { RealtimeModule } from "./realtime/realtime.module";
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

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
      migrations: [],
      migrationsRun: false,
    }),
    ScheduleModule.forRoot(),
    RealtimeModule,
    AuthModule,
    UserModule,
    S3Module,
    NotificationModule,

    TasksModule,
    PropertyModule,
    BlogModule,
    OtpModule,
    TestimonialModule,
    AddressModule,
    BuilderLeadsModule,
    UnifiedPropertyListingModule,
    FurnitureModule,
    CartModule,
    OrdersModule,
    CareerAdminModule,
    CareerModule,
    WhatsAppModule,
    CustomerModule,
    LocationModule,
    LivebuildModule,
    QueryModule,
    DailyProgressModule,
    CustomPropertyModule,
    CBServiceModule,
    CostEstimatorModule,
    BorewellModule,
    BrickMasonryModule,
    CentringModule,
    DocumentDraftingModule,
    ElectricityModule,
    FallCeilingModule,

    FlooringModule,

    PaintingModule,
    PlumbingModule,
    InteriorServiceModule,
    ReviewsModule,
    WishlistModule,
    CRMLeadModule,
    AwardModule,
    CompanyAddressModule,
    DeleteAccountModule,
    PropertyLeadModule,
    PropertyPremiumPlansModule,
    InvoiceEstimatorModule,
    PackageModule,
    StateModule,
    ResourceModule,
    ContactUsModule,
    CbDocumentModule,
    PhaseModule,
    MaterialsModule,
    PaymentTrackingModule,
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
export class AppModule { }
