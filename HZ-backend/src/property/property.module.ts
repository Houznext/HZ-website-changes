import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyDetails } from './entities/propertyDetails.entity';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { User } from 'src/user/entities/user.entity';
import { ResidentialAttributes } from './entities/property-details/residential.entity';
import { ConstructionStatus } from './entities/property-details/constructionStatus.entity';
import { Furnishing } from './entities/property-details/furnishing.entity';
import { Highlights } from './entities/property-details/highligts.entity';
import { OccupancyDetails } from './entities/property-details/occupancy.entity';
import { PlotAttributes } from './entities/property-details/plot.entity';
import { PricingDetails } from './entities/property-details/pricingDetails.entity';
import { BasicDetails } from './entities/basicDetails.entity';
import { LocationDetails } from './entities/location.entity';
import { MediaDetails } from './entities/mediaDetails.entity';
import { Property } from './entities/property.entity';
import { CommercialAttribute } from './entities/property-details/commercialAttributes.entity';
import { Facilities } from './entities/property-details/facilities.entity';
import { MailerService } from 'src/sendEmail.service';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';
import { FlatshareAttributes } from './entities/property-details/flatshareDetails.entity';
import { S3Service } from 'src/common/s3/s3.service';
import { NotificationService } from 'src/notifications/notification.service';
import { Notification } from 'src/notifications/entities/notification.entity';
import { SmsService } from 'src/sms.service';

@Module({
  imports: [
  TypeOrmModule.forFeature([
    PropertyDetails,
    ResidentialAttributes,
    PlotAttributes,
    CommercialAttribute,
    Facilities,
    ConstructionStatus,
    Furnishing,
    PricingDetails,
    Highlights,
    OccupancyDetails,
    User,
    BasicDetails,
    LocationDetails,
    MediaDetails,
    FlatshareAttributes,
    Property,
    Project,Notification
  ]),
],
  controllers: [PropertyController],
  providers: [PropertyService, MailerService,S3Service,NotificationService, SmsService,],
  exports: [PropertyService],
})
export class PropertyModule { }
