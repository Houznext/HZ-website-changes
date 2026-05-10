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

@Entity('infra_crm_lead')
export class InfraCRMLead {
  @PrimaryGeneratedColumn('uuid')
  leadId: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  budget: string | null;

  @Column({ default: 'new' })
  stage: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string | null;

  @Column({ type: 'text', nullable: true })
  lastContactNote: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastContactedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  nextFollowUpAt: Date | null;

  @ManyToOne(() => InfraProperty, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
