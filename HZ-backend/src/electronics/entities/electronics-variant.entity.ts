import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Electronics } from './electronics.entity';
import { ElectronicsImage } from './electronics-image.entity';

@Entity('electronics_variant')
export class ElectronicsVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Electronics, (electronics) => electronics.variants, {
    onDelete: 'CASCADE',
  })
  electronics: Electronics;

  @Column({ length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  color?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sizeLabel?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQty: number;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @OneToMany(() => ElectronicsImage, (img) => img.variant, {
    cascade: true,
  })
  images: ElectronicsImage[];
}
