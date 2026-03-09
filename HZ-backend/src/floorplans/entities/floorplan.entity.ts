import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('floorplans')
export class Floorplan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  planId: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  variantId?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  propertyId?: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  customBuilderId?: string;

  @Column({ type: 'text' })
  svgData: string;

  @Column({ type: 'jsonb', nullable: true })
  placedPlan?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  warnings?: string[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
