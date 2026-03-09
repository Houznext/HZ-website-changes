import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ReferralCase } from './referralcase.entity';

@Entity('referral_case_step_logs')
export class ReferralCaseStepLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReferralCase, (ref) => ref.stepLogs)
  referralCase: ReferralCase;

  @Column({ type: 'int' })
  fromStep: number;

  @Column({ type: 'int' })
  toStep: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  updatedBy?: User;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;
}
