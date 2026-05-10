import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => InfraProperty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property: InfraProperty;

  @CreateDateColumn()
  createdAt: Date;
}
