import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Furniture } from './furniture.entity';
import { FurnitureVariant } from './furniture-variant.entity';

@Entity('furniture_image')
export class FurnitureImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Furniture, (f) => f.images, { onDelete: 'CASCADE' })
  furniture: Furniture;

  @ManyToOne(() => FurnitureVariant, (v) => v.images, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  variant?: FurnitureVariant;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  alt?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'varchar', length: 7, nullable: true })
  colorHex?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  angle?: string; // "front", "side", "top", "zoom"

  @Column({ type: 'varchar', length: 50, nullable: true })
  viewType?: string; // "in-room", "studio", etc.
}
