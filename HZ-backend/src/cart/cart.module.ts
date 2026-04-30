import { Module } from "@nestjs/common";
import { Cart } from "./entities/cart.entity";
import { User } from "src/user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartItem } from "src/cartItems/entities/cartitem.entity";
import { JwtModule } from '@nestjs/jwt';
import { AnyAuthGuard } from 'src/common/guards/any-auth.guard';



@Module({
    imports: [TypeOrmModule.forFeature([Cart, User, CartItem]), JwtModule],
    controllers: [CartController],
    providers: [CartService, AnyAuthGuard],
    exports: [CartService],
})
export class CartModule { }