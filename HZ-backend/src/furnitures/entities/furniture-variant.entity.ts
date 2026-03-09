import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Furniture } from './furniture.entity';
import { FurnitureImage } from './furniture-image.entity';

@Entity('furniture_variant')
export class FurnitureVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Furniture, (furniture) => furniture.variants, {
    onDelete: 'CASCADE',
  })
  furniture: Furniture;

  @Column({ length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  colorName?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  colorHex?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  finish?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sizeLabel?: string;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  widthCm?: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  depthCm?: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  heightCm?: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  weightKg?: number;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  maxLoadKg?: number;

  @Column({ type: 'int', default: 0 })
  stockQty: number;

  @Column({ type: 'int', default: 0 })
  reservedQty: number;

  // Pricing
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  mrp: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  sellingPrice: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @OneToMany(() => FurnitureImage, (img) => img.variant, {
    cascade: true,
  })
  images: FurnitureImage[];
}
