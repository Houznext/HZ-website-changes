// src/furniture/entities/furniture.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnySubCategory, Category, FurnitureStatus } from '../enum/furniture.enum';
import { Reviews } from 'src/reviews/entities/reviews.entity';
import { WishlistItems } from 'src/wishlist/entities/wishlistItems.entity';
import { FurnitureVariant } from './furniture-variant.entity';
import { FurnitureImage } from './furniture-image.entity';
import { Branch } from 'src/branch/entities/branch.entity';

@Entity('furniture')
export class Furniture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  branchId?: string;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branchId' })
  branch?: Branch;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, unique: true })
  slug: string;

  @Column({ type: 'enum', enum: Category })
  category: Category;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subCategory?: AnySubCategory;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  highlights?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  // Pricing on product level is usually derived from default variant
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  baseMrp: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  baseSellingPrice: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  baseDiscountPercent: number; // (mrp - selling)/mrp * 100

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({
    type: 'enum',
    enum: FurnitureStatus,
    default: FurnitureStatus.DRAFT,
  })
  status: FurnitureStatus;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isCustomizable: boolean;

  @Column({ type: 'text', nullable: true })
  customizationDescription?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deliveryTime?: string; // "3-7 business days"

  @Column({ type: 'varchar', length: 100, nullable: true })
  warranty?: string; // "3 years on structure"

  @Column({ type: 'varchar', length: 200, nullable: true })
  assembly?: string; // "Carpenter assembly provided by OneCasa"

  @Column({ type: 'varchar', length: 200, nullable: true })
  returnPolicy?: string;

  /** Product-level offers (bank offer, partner offer, etc.) with optional validity */
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  offers?: Array<{
    type: string;
    title: string;
    description?: string;
    code?: string;
    validFrom?: string; // ISO date string
    validTo?: string;   // ISO date string
  }>;

  /** Coupon codes that can be applied to this product (for display / checkout; works with COD too) */
  @Column({ type: 'simple-array', nullable: true })
  applicableCouponCodes?: string[];

  /** Currency for display (e.g. INR) */
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currencyCode: string;

  /** GST / tax percentage applicable */
  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  taxPercentage: number;

  /** HSN code for GST */
  @Column({ type: 'varchar', length: 20, nullable: true })
  hsnCode?: string;

  /** Whether displayed price is GST inclusive */
  @Column({ type: 'boolean', default: false })
  gstInclusive: boolean;

  /** Cash on Delivery available; coupons can still apply to order total when payment is COD */
  @Column({ type: 'boolean', default: false })
  isCODAvailable: boolean;

  /** Delivery coverage (e.g. "All India", "Metro cities only") */
  @Column({ type: 'varchar', length: 200, nullable: true })
  deliveryLocations?: string;

  /** Shipping weight (kg) and dimensions for display / logistics */
  @Column({ type: 'jsonb', nullable: true })
  shippingDetails?: { weight?: number; dimensions?: string };

  @Column({ type: 'varchar', length: 200, nullable: true })
  metaTitle?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription?: string;

  @Column({ type: 'simple-array', nullable: true })
  searchTags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  otherProperties?: Record<string, any>; // generic specs like style, roomType, etc.

  // Seller / operator info
  @Column({ type: 'uuid', nullable: true })
  sellerId?: string; // user with userKind='SELLER'

  @Column({ type: 'uuid', nullable: true })
  createdById?: string; // staff or seller

  @Column({ type: 'uuid', nullable: true })
  updatedById?: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  // Relations

  @OneToMany(() => FurnitureVariant, (variant) => variant.furniture, {
    cascade: true,
  })
  variants: FurnitureVariant[];

  @OneToMany(() => FurnitureImage, (img) => img.furniture, {
    cascade: true,
  })
  images: FurnitureImage[];

  @OneToMany(() => Reviews, (review) => review.furniture)
  reviews: Reviews[];

  @OneToMany(() => WishlistItems, (wishlist) => wishlist.furniture)
  wishlistItems: WishlistItems[];
}
