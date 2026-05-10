import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InfraProperty } from '../../property/entities/infra-property.entity';

@Entity('infra_site_visit')
export class InfraSiteVisit {
  @PrimaryGeneratedColumn('uuid')
  visitId: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  preferredDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  preferredSlot: string | null;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => InfraProperty, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
