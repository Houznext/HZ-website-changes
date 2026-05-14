import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfraCrmLead } from './infra-crm-lead.entity';

@Entity('infra_crm_site_visits')
export class InfraCrmSiteVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InfraCrmLead, (l) => l.siteVisits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: InfraCrmLead;

  @Column({ nullable: true, type: 'varchar' })
  propertyId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  propertyTitle: string | null;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ default: 'scheduled' })
  status: string;

  @Column({ nullable: true, type: 'varchar' })
  agentName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  feedback: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
