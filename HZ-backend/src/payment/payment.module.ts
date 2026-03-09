import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentAuditLog } from './entities/payment-audit-log.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CartItem } from 'src/cartItems/entities/cartitem.entity';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { User } from 'src/user/entities/user.entity';
import { PropertyModule } from 'src/property/property.module';
import { PropertyPremiumPlansModule } from 'src/property-premium-plans/property-premium-plans.module';
import { SolarOrdersModule } from 'src/solar-orders/solar-orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentAuditLog, Order, OrderItem, User, Cart, CartItem]),
    PropertyModule,
    PropertyPremiumPlansModule,
    SolarOrdersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
