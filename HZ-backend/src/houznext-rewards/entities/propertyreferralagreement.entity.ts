import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Property } from 'src/property/entities/property.entity';
import { User } from 'src/user/entities/user.entity';
import { BrokerageModel, ReferAndEarnStatus } from '../enum/refer-and-earn.enum';

@Entity('property_referral_agreements')
export class PropertyReferralAgreement {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Property, (p: any) => p.referralAgreements, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  property: Property;

  @Column({
    type: 'enum',
    enum: ReferAndEarnStatus,
    default: ReferAndEarnStatus.PENDING,
  })
  status: ReferAndEarnStatus;

  @Column({ type: 'enum', enum: BrokerageModel })
  brokerageModel: BrokerageModel;

  @Column({ type: 'numeric', nullable: true })
  brokerageValue?: number;
   @Column({ type: 'numeric', nullable: true })
 referrerValue?: number;

  @Column({ type: 'numeric', nullable: true })
  minBrokerageAmount?: number;

  @Column({ type: 'numeric', nullable: true })
  referrerSharePercent?: number;

  @Column({ type: 'numeric', nullable: true })
  referrerMaxCredits?: number;

  @Column({ type: 'boolean', default: true })
  hideOwnerContactFromPublic: boolean;

  @Column({ type: 'timestamp', nullable: true })
  effectiveFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  effectiveTo?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  approvedBy?: User;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
