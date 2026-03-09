import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  ValueTransformer,
} from 'typeorm';
import { Reviews } from 'src/reviews/entities/reviews.entity';
import { WishlistItems } from 'src/wishlist/entities/wishlistItems.entity';
import { ElectronicsCategory } from '../enum/electronics.enum';
import { ElectronicsVariant } from './electronics-variant.entity';
import { ElectronicsImage } from './electronics-image.entity';
import { Branch } from 'src/branch/entities/branch.entity';

const decimalTransformer: ValueTransformer = {
  to(value: number): string {
    return value ? value.toString() : null;
  },
  from(value: string): number {
    return value ? parseFloat(value) : null;
  },
};

@Entity()
export class Electronics {
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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  baseOriginalPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, transformer: decimalTransformer })
  baseDiscount: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currencyCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, transformer: decimalTransformer })
  taxPercentage: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hsnCode: string;

  @Column({ type: 'boolean', default: false })
  gstInclusive: boolean;

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

  @Column({ type: 'text' })
  prodDetails: string;

  @Column({
    type: 'enum',
    enum: ElectronicsCategory,
    nullable: false,
  })
  category: ElectronicsCategory;

  @Column({ type: 'varchar', length: 100 })
  brand: string;

  @Column({ type: 'varchar', length: 50 })
  modelNumber: string;

  @Column({ type: 'varchar', length: 50 })
  warranty: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  energyRating: string;

  @Column({ type: 'int', default: 10 })
  stockAlertThreshold: number;

  

  @Column({ type: 'jsonb', nullable: true })
  technicalSpecifications: {
    [key: string]: string;
  };

  @Column({ type: 'varchar', length: 50 })
  deliveryTime: string;

  @Column({ type: 'boolean', default: false })
  installationRequired: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  installationGuide: string;

  @Column({ type: 'boolean', default: false })
  smartFeatures: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  powerConsumption: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  returnPolicy: string;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ type: 'boolean', default: false })
  isCODAvailable: boolean;

  @Column({ type: 'jsonb', nullable: true })
  shippingDetails: {
    weight: number;
    dimensions: string;
  };

  @Column({ type: 'varchar', length: 200, nullable: true })
  metaTitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  metaDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  searchTags: string[];

  @Column({ type: 'varchar', length: 100 })
  deliveryLocations: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @OneToMany(() => ElectronicsVariant, (v) => v.electronics, { cascade: true })
  variants: ElectronicsVariant[];

  @OneToMany(() => ElectronicsImage, (img) => img.electronics, { cascade: true })
  images: ElectronicsImage[];

  @OneToMany(() => Reviews, (review) => review.electronics)
  reviews: Reviews[];

  @OneToMany(() => WishlistItems, (wishlist) => wishlist.electronics)
  wishlistItems: WishlistItems[];
}
