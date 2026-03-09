import { User } from 'src/user/entities/user.entity';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WishlistItems } from './wishlistItems.entity';

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.wishlist)
  user: User;

  @OneToMany(() => WishlistItems, (wishlistItems) => wishlistItems.wishlist)
  wishlistItems: WishlistItems[];
}
