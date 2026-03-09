import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderQuery } from './entities/order-query.entity';
import { OrdersService } from './order.service';
import { OrderQueryService } from './order-query.service';
import { OrdersController } from './order.controller';
import { CartItem } from 'src/cartItems/entities/cartitem.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { User } from 'src/user/entities/user.entity';
import { FurnitureVariant } from 'src/furnitures/entities/furniture-variant.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { SolarOrdersModule } from 'src/solar-orders/solar-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderQuery, Cart, CartItem, User, FurnitureVariant, Branch]),
    SolarOrdersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderQueryService],
  exports: [OrdersService, OrderQueryService],
})
export class OrdersModule { }
