import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Units } from './property-type-units.entity';
import { SizeWithUnit } from '../Interfaces/size.interface';

@Entity()
export class FlooringPlans {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text", { array: true, nullable: true })
  floorplan: string[];

  @Column({ nullable: true })
  mediaUrl: string;

  @Column('jsonb', { nullable: true })
  BuiltupArea: SizeWithUnit;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  TotalPrice: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  pricePerSft: number;

  @Column('bigint', { nullable: true })
emiStartsAt: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  floorNumber: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Units, (unit) => unit.flooringPlans)
  unit: Units;
}
