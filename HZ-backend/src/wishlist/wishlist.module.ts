import { TypeOrmModule } from "@nestjs/typeorm";
import { WishlistController } from "./wishlist.controller";
import { WishlistService } from "./wishlist.service";
import { Wishlist } from "./entities/wishlist.entity";
import { Module } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { WishlistItems } from "./entities/wishlistItems.entity";
import { Furniture } from "src/furnitures/entities/furniture.entity";
import { HomeDecors } from "src/homeDecors/entities/homeDecors.entity";
import { Property } from "src/property/entities/property.entity";
import { Electronics } from "src/electronics/entities/electronics.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist, User, WishlistItems, Property, HomeDecors, Furniture, Electronics])
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService], 
})

export class WishlistModule {}