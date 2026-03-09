import { Module } from "@nestjs/common";
import { Cart } from "./entities/cart.entity";
import { User } from "src/user/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartItem } from "src/cartItems/entities/cartitem.entity";



@Module({
    imports: [TypeOrmModule.forFeature([Cart, User,CartItem])],
    controllers: [CartController],
    providers: [CartService],
})
export class CartModule { }