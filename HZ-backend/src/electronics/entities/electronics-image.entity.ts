import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Electronics } from './electronics.entity';
import { ElectronicsVariant } from './electronics-variant.entity';

@Entity('electronics_image')
export class ElectronicsImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Electronics, (e) => e.images, { onDelete: 'CASCADE' })
  electronics: Electronics;

  @ManyToOne(() => ElectronicsVariant, (v) => v.images, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  variant?: ElectronicsVariant;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  alt?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;
}
