import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { Reviews } from './entities/reviews.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { User } from 'src/user/entities/user.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reviews, Furniture, User, OrderItem]),
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService],
})
export class ReviewsModule {}
