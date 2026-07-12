import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Furniture } from 'src/furnitures/entities/furniture.entity';

@Entity()
export class WishlistItems {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Furniture, (furniture) => furniture.wishlistItems)
  furniture: Furniture;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.wishlistItems, {
    eager: true,
  })
  wishlist: Wishlist;
}
