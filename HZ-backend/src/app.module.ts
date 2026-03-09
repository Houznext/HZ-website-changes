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
import { FurnitureLeadModule } from './furnitureleads/furniture-lead.module';
import { NotificationModule } from './notifications/notification.module';
import { ServiceCustomLeadModule } from './servicecustomlead/servicecustomlead.module';
import { HomeDecorsModule } from './homeDecors/homeDecors.module';
import { CareerAdminModule } from './careers/admin/careerAdmin.module';
import { CareerModule } from './careers/career/career.module';
import { CustomerModule } from './Custombuilder/customer/customer.module';
import { LocationModule } from './Custombuilder/location/location.module';
import { CustomBuilderModule } from './Custombuilder/custom-builder.module';
import { DailyProgressModule } from './Custombuilder/daily-progress/daily-progress.module';
import { CustomPropertyModule } from './Custombuilder/custom-property/custom-property.module';
import { CBServiceModule } from './Custombuilder/service-required/cb-service.module';
import { CostEstimatorModule } from './cost-estimator/cost-estimator.module';
import { ControllerAuthGuard } from './guard';
import { BorewellModule } from './Custombuilder/services/borewell/borewell.module';
import { BrickMasonryModule } from './Custombuilder/services/brickMasonry/brickMasonry.module';
import { CentringModule } from './Custombuilder/services/centring/centring.module';
import { DocumentDraftingModule } from './Custombuilder/services/documentDrafting/documentDrafting.module';
import { ElectricityModule } from './Custombuilder/services/electricity/electricity.module';
import { FallCeilingModule } from './Custombuilder/services/fallCeiling/fallCeiling.module';
import { FlooringModule } from './Custombuilder/services/flooring/flooring.module';
import { PaintingModule } from './Custombuilder/services/painting/painting.module';
import { PlumbingModule } from './Custombuilder/services/plumbing/plumbing.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { CRMLeadModule } from './crm/crm.module';
import { CompanyOnboardingModule } from './company-onboarding/company-onboarding.module';
import { AwardModule } from './company-onboarding/Awards/awards.module';
import { CompanyAddressModule } from './company-onboarding/CompanyAddress/companyaddress.module';
import { InteriorServiceModule } from './Custombuilder/services/interior/interior.module';
import { ElectronicsModule } from './electronics/electronics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { DeleteAccountModule } from './deleteaccount/delete-account.module';
import { PropertyLeadModule } from './property/propertyLead/property-lead.module';
import { InvoiceEstimatorModule } from './invoice-estimator/invoice-estimator.module';
import { WhatsAppModule } from './whatsappSend/whatsapp.module';
import { UnifiedPropertyListingModule } from './unified-property-listing/unified-property-listing.module';
import { QueryModule } from './Custombuilder/Query/query.module';
import { S3Module } from './common/s3/s3.module';
import { PackageModule } from './Custombuilder/package/package.module';
import { ContactUsModule } from './contactus/contact-us.module';
import { ResourceModule } from './ResourceName/resource.module';
import { CbDocumentModule } from './Custombuilder/cbdocument/cbdocument.module';
import { PhaseModule } from './Custombuilder/phase/phase.module';
import { MaterialsModule } from './Custombuilder/Materials/materials.module';
import { PaymentTrackingModule } from './Custombuilder/payment-tracking/payment-tracking.module';
import { BranchModule } from './branch/branch.module';
import { CityModule } from './geography/city/city.module';
import { StateModule } from './geography/state/state.module';
import { ReferralModule } from './Referral/referral.module';
import { BranchRoleModule } from './branchRole/branch-role.module';
import { BranchRolePermissionModule } from './branch-role-permission/branch-role-permission.module';
import { HrModule } from './employee-hr/hr.module';
import { OrdersModule } from './orders/order.module';
import { ReferAndEarnModule } from './referandearn/referandearn.module';
import { PropertyPremiumPlansModule } from './property-premium-plans/property-premium-plans.module';
import { ChatModule } from './chat/chat.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { RealtimeModule } from "./realtime/realtime.module";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StaffAttendanceModule } from "./attendance/attendance.module"
import { SolarOrdersModule } from './solar-orders/solar-orders.module';
import { FloorplansModule } from './floorplans/floorplans.module';
import { ShiprocketModule } from './shiprocket/shiprocket.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './audit-log/audit-log.interceptor';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      autoLoadEntities: true,
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
    PropertyModule,
    CartModule,
    FurnitureLeadModule,
    ServiceCustomLeadModule,
    OrdersModule,
    HomeDecorsModule,
    CareerAdminModule,
    CareerModule,
    WhatsAppModule,
    CustomerModule,
    LocationModule,
    CustomBuilderModule,
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
    BrickMasonryModule,
    DocumentDraftingModule,
    InteriorServiceModule,
    CostEstimatorModule,
    ReviewsModule,
    WishlistModule,
    CRMLeadModule,
    AwardModule,
    CompanyAddressModule,
    CompanyOnboardingModule,
    DeleteAccountModule,
    ElectronicsModule,
    PropertyLeadModule,
    PropertyPremiumPlansModule,
    InvoiceEstimatorModule,
    PackageModule,
    StateModule,
    ReferralModule,
    ResourceModule,
    ContactUsModule,
    CbDocumentModule,
    PhaseModule,
    MaterialsModule,
    PaymentTrackingModule,
    BranchModule,
    CityModule,
    HrModule,
    ReferAndEarnModule,
    ChatModule,
    ChatbotModule,
    BranchRolePermissionModule,
    BranchRoleModule,
    StaffAttendanceModule,
    SolarOrdersModule,
    FloorplansModule,
    ShiprocketModule,
    AuditLogModule,
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
