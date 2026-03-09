import { Module } from '@nestjs/common';
import { UnifiedPropertyListingController } from './unified-property-listing.controller';
import { UnifiedPropertyListingService } from './unified-property-listing.service';
import { PropertyModule } from 'src/property/property.module';
import { CompanyOnboardingModule } from 'src/company-onboarding/company-onboarding.module';

@Module({
  imports: [PropertyModule, CompanyOnboardingModule],
  controllers: [UnifiedPropertyListingController],
  providers: [UnifiedPropertyListingService],
})
export class UnifiedPropertyListingModule {}
