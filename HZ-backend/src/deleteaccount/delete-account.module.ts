import { Module } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/blog/entities/blog.entity';
import { Testimonials } from 'src/testimonials/entity/testimonials.entity';
import { Wishlist } from 'src/wishlist/entities/wishlist.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CostEstimator } from 'src/cost-estimator/entities/cost-estimator.entity';
import { DeleteAccountController } from './delete-account.controller';
import { DeleteAccountService } from './delete-account.service';
import { Project } from 'src/company-onboarding/entities/company-projects.entity';
import { Company } from 'src/company-onboarding/entities/company.entity';
import { LocationDetails } from 'src/common/location/location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Blog,
      Testimonials,
      LocationDetails,
      Wishlist,
      Cart,
      CostEstimator,
      Project,
      Company,
    ]),
  ],
  providers: [DeleteAccountService],
  controllers: [DeleteAccountController],
})
export class DeleteAccountModule {}
