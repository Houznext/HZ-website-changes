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

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.wishlistItems, {
    eager: true,
  })
  wishlist: Wishlist;
}
