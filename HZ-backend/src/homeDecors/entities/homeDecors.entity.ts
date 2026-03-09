import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { HomeDecorsCategory } from '../enum/homeDecors.enum';
import { Reviews } from 'src/reviews/entities/reviews.entity';
import { WishlistItems } from 'src/wishlist/entities/wishlistItems.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity()
export class HomeDecors {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  branchId?: string;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  slug: string;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  /** MRP / original price; selling price is calculated at display and order time */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text' })
  prodDetails: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercentage: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hsnCode: string;

  @Column({ type: 'boolean', default: false })
  gstInclusive: boolean;

  @Column({
    type: 'enum',
    enum: HomeDecorsCategory,
    nullable: false,
  })
  category: HomeDecorsCategory;

  @Column('simple-array')
  images: string[];

  @Column({ type: 'varchar', length: 50 })
  design: string;

  @Column({ type: 'varchar', length: 30 })
  color: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  shape: string;

  @Column({ type: 'int', default: 0 })
  productQuantity: number;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ type: 'jsonb', nullable: true })
  otherProperties: {
    [key: string]: string;
  };

  @Column({ type: 'varchar', length: 50 })
  deliveryTime: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assembly: string;

  @Column({ type: 'boolean', default: false })
  customizeOptions: boolean;

  @Column({ type: 'varchar', length: 50 })
  warranty: string;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({ type: 'varchar', length: 100 })
  deliveryLocations: string;

  /** Product-level offers (same structure as electronics/furniture) */
  @Column({ type: 'jsonb', nullable: true })
  offers: Array<{
    type: string;
    title: string;
    description?: string;
    code?: string;
    validFrom?: string;
    validTo?: string;
  }>;

  @Column({ type: 'simple-array', nullable: true })
  applicableCouponCodes: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  returnPolicy: string;

  @Column({ type: 'boolean', default: false })
  isCODAvailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  shippingDetails: { weight?: number; dimensions?: string };

  @Column({ type: 'varchar', length: 200, nullable: true })
  metaTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  searchTags: string[];

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @OneToMany(() => Reviews, (review) => review.homeDecor)
  reviews: Reviews[];

  @OneToMany(() => WishlistItems, (wishlist) => wishlist.homeDecors)
  wishlistItems: WishlistItems[];
}
