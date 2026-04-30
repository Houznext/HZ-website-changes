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
import { JwtModule } from '@nestjs/jwt';
import { AnyAuthGuard } from 'src/common/guards/any-auth.guard';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentAuditLog, Order, OrderItem, User, Cart, CartItem]),
    PropertyModule,
    PropertyPremiumPlansModule,
    JwtModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, AnyAuthGuard],
  exports: [PaymentsService],
})
export class PaymentsModule { }
