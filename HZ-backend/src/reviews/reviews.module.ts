import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { Reviews } from './entities/reviews.entity';
import { Property } from 'src/property/entities/property.entity';
import { HomeDecors } from 'src/homeDecors/entities/homeDecors.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { User } from 'src/user/entities/user.entity';
import { Electronics } from 'src/electronics/entities/electronics.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reviews,
      Property,
      HomeDecors,
      Furniture,
      User,
      Electronics,
      OrderItem,
    ]),
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewsModule {}
