import { TypeOrmModule } from "@nestjs/typeorm";
import { WishlistController } from "./wishlist.controller";
import { WishlistService } from "./wishlist.service";
import { Wishlist } from "./entities/wishlist.entity";
import { Module } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { WishlistItems } from "./entities/wishlistItems.entity";
import { Furniture } from "src/furnitures/entities/furniture.entity";
import { Property } from "src/property/entities/property.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, User, WishlistItems, Property, Furniture])
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService], 
})

export class WishlistModule {}