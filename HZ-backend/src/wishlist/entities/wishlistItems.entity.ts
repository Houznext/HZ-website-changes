import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Property } from 'src/property/entities/property.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';
import { HomeDecors } from 'src/homeDecors/entities/homeDecors.entity';
import { Electronics } from 'src/electronics/entities/electronics.entity';

@Entity()
export class WishlistItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Property, (property) => property.wishlistItems) //directly refer to product will reduce redundancy
  @JoinColumn({ name: 'propertyId' })
  property: Property;

  @ManyToOne(() => Furniture, (furniture) => furniture.wishlistItems)
  furniture: Furniture;

  @ManyToOne(() => HomeDecors, (homeDecors) => homeDecors.wishlistItems)
  homeDecors: HomeDecors;

  @ManyToOne(() => Electronics, (electronics) => electronics.wishlistItems, {
    nullable: true,
  })
  electronics: Electronics;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.wishlistItems, {
    eager: true,
  })
  wishlist: Wishlist;
}
