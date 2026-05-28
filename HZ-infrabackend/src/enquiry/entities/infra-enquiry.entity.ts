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

@Entity('infra_enquiry')
export class InfraEnquiry {
  @PrimaryGeneratedColumn('uuid')
  enquiryId: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column('text', { nullable: true })
  message: string | null;

  @Column({ type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 48, default: 'response_received' })
  status: string;

  @Column({ type: 'varchar', length: 32, default: 'website' })
  source: string;

  @Column({ type: 'uuid', nullable: true })
  crmLeadId: string | null;

  @Column({ type: 'text', nullable: true })
  adminResponse: string | null;

  @ManyToOne(() => InfraProperty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
