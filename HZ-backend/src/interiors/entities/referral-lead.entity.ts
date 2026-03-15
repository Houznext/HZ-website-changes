import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';

@Entity('int_referral_leads')
export class ReferralLead extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  referredName: string | null;

  @Column({ type: 'varchar', nullable: true, default: '' })
  referredMobile: string | null;

  @Column({ type: 'varchar', nullable: true })
  referredEmail: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'sent' })
  status: string | null;

  @Column({ type: 'uuid', nullable: true })
  convertedProjectId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cashbackAmount: number | null;

  @Column({ type: 'boolean', nullable: true, default: false })
  cashbackPaid: boolean | null;

  @Column({ type: 'uuid', nullable: true })
  referrerId: string | null;

  @ManyToOne(() => Customer, (c) => c.referralLeads, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'referrerId' })
  referrer: Customer | null;
}
