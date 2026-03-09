import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyPremiumPlan } from './entities/property-premium-plan.entity';
import { PropertyPremiumPlansController } from './property-premium-plans.controller';
import { PropertyPremiumPlansService } from './property-premium-plans.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../authSession/auth.module';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyPremiumPlan]),
    UserModule,
    AuthModule,
    PropertyModule,
  ],
  controllers: [PropertyPremiumPlansController],
  providers: [PropertyPremiumPlansService],
  exports: [PropertyPremiumPlansService],
})
export class PropertyPremiumPlansModule {}
