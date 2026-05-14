import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InfraCrmActivity } from './infra-crm-activity.entity';
import { InfraCrmSiteVisit } from './infra-crm-site-visit.entity';

@Entity('infra_crm_leads')
export class InfraCrmLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ nullable: true, type: 'varchar' })
  alternatePhone: string | null;

  @Column({ default: 'Apartment' })
  propertyType: string;

  @Column({ nullable: true, type: 'varchar' })
  bhkPreference: string | null;

  @Column({ nullable: true, type: 'varchar' })
  budgetRange: string | null;

  @Column({ nullable: true, type: 'varchar' })
  preferredCity: string | null;

  @Column({ nullable: true, type: 'varchar' })
  preferredLocality: string | null;

  @Column({ default: 'Self use' })
  purpose: string;

  @Column({ default: 'Yes' })
  loanRequired: string;

  @Column({ nullable: true, type: 'varchar' })
  loanStatus: string | null;

  @Column({ default: '3–6 months' })
  timeline: string;

  @Column({ default: 'new' })
  stage: string;

  @Column({ default: 'cold' })
  priority: string;

  @Column({ type: 'int', default: 0 })
  leadScore: number;

  @Column({ default: 'Website enquiry' })
  source: string;

  @Column({ nullable: true, type: 'varchar' })
  assignedTo: string | null;

  @Column({ nullable: true, type: 'varchar' })
  assignedAgentId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  nextFollowUpAt: Date | null;

  @Column({ default: 'Phone call' })
  followUpMethod: string;

  @Column('uuid', { array: true, nullable: true })
  linkedPropertyIds: string[] | null;

  @Column({ nullable: true, type: 'varchar' })
  tokenAmount: string | null;

  @Column({ type: 'timestamp', nullable: true })
  tokenPaidAt: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  bookedPropertyId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  registrationAmount: string | null;

  @Column({ type: 'timestamp', nullable: true })
  registeredAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  internalNotes: string | null;

  @Column({ nullable: true, type: 'varchar' })
  lostReason: string | null;

  @OneToMany(() => InfraCrmActivity, (a) => a.lead, { cascade: true })
  activities: InfraCrmActivity[];

  @OneToMany(() => InfraCrmSiteVisit, (v) => v.lead, { cascade: true })
  siteVisits: InfraCrmSiteVisit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
