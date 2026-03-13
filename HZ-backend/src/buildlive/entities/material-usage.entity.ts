import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { DailyUpdate } from './daily-update.entity';

@Entity('bl_material_usages')
export class MaterialUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => DailyUpdate, (update) => update.materialUsages, {
    onDelete: 'CASCADE',
  })
  dailyUpdate: DailyUpdate;

  @Column({ type: 'varchar', length: 255 })
  materialName: string;

  @Column({ type: 'float' })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'float', nullable: true })
  unitCost?: number | null;

  @Column({ type: 'float', nullable: true })
  totalCost?: number | null;
}

