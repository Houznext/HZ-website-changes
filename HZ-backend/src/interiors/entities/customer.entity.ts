import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { ReferralLead } from './referral-lead.entity';
import { InteriorProject } from './interior-project.entity';

@Entity('int_customers')
export class Customer extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: '' })
  fullName: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  mobile: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  city: string | null;

  @Column({ type: 'varchar', nullable: true })
  locality: string | null;

  @Column({ type: 'varchar', nullable: true })
  otpCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', unique: true, nullable: true })
  referralCode: string | null;

  @Column({ type: 'uuid', nullable: true })
  referredById: string | null;

  @OneToMany(() => ReferralLead, (lead) => lead.referrer)
  referralLeads: ReferralLead[];

  @OneToMany(() => InteriorProject, (project) => project.customer)
  projects: InteriorProject[];

  @BeforeInsert()
  setReferralCode(): void {
    if (this.referralCode) return;
    const prefix = (this.fullName || 'XX').slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X') || 'XX';
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    this.referralCode = `${prefix}${digits}`;
  }
}
