import { Entity, Column, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DailyUpdate } from './daily-update.entity';

@Entity('int_material_usages')
export class MaterialUsage extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  materialName: string | null;

  @Column({ type: 'varchar', nullable: true })
  brandName: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  quantity: number | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  unit: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost: number | null;

  @Column({ type: 'uuid', nullable: true })
  dailyUpdateId: string | null;

  @ManyToOne(() => DailyUpdate, (d) => d.materialUsages, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dailyUpdateId' })
  dailyUpdate: DailyUpdate | null;

  @BeforeInsert()
  @BeforeUpdate()
  computeTotalCost(): void {
    if (this.quantity != null && this.unitCost != null) {
      this.totalCost = Number((Number(this.quantity) * Number(this.unitCost)).toFixed(2));
    }
  }
}
