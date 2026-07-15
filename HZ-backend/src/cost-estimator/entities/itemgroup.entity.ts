import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { CostEstimator } from './cost-estimator.entity';
@Entity()
export class ItemGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('jsonb')
  items: {
    id?: number;
    item_name: string;
    description: string;
    pricing_mode?: 'unit' | 'area';
    quantity: number;
    unit_price: number;
    discount?: number;
    amount: number;
    area?: number;
    gst_enabled?: boolean;
    gst_percentage?: number | null;
  }[];

  @Column('int', { default: 0 })
  order: number;

  @ManyToOne(() => CostEstimator, (costEstimator) => costEstimator.itemGroups, {
    onDelete: 'CASCADE',
  })
  costEstimator: CostEstimator;
}
