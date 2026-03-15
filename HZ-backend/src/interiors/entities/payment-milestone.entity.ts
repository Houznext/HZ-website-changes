import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { InteriorProject } from './interior-project.entity';

@Entity('int_payment_milestones')
export class PaymentMilestone extends BaseEntity {
  @Column({ type: 'varchar', nullable: true, default: 'Milestone' })
  milestoneName: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  amount: number | null;

  @Column({ type: 'varchar', nullable: true })
  triggerCondition: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'pending' })
  status: string | null;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'date', nullable: true })
  paidAt: Date | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  sortOrder: number | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => InteriorProject, (p) => p.paymentMilestones, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: InteriorProject | null;
}
