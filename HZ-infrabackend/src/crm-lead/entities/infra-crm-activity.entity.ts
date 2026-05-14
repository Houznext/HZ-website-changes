import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InfraCrmLead } from './infra-crm-lead.entity';

@Entity('infra_crm_activities')
export class InfraCrmActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InfraCrmLead, (l) => l.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leadId' })
  lead: InfraCrmLead;

  @Column()
  type: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, type: 'varchar' })
  agentName: string | null;

  @Column({ nullable: true, type: 'varchar' })
  previousStage: string | null;

  @Column({ nullable: true, type: 'varchar' })
  newStage: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
