import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

export enum AttendanceRequestType {
  FORGOT_CLOCK_IN = 'FORGOT_CLOCK_IN',
  FORGOT_CLOCK_OUT = 'FORGOT_CLOCK_OUT',
  FORGOT_BOTH = 'FORGOT_BOTH',
  CORRECTION = 'CORRECTION', // optional: adjust wrong times
}

export enum AttendanceRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('staff_attendance_requests')
@Index(['userId', 'date', 'type', 'status'])
export class StaffAttendanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Request is for which date
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: AttendanceRequestType })
  type: AttendanceRequestType;

  // What staff claims the times should be (optional based on type)
  @Column({ type: 'time', name: 'requested_clock_in_time', nullable: true })
  requestedClockInTime: string | null;

  @Column({ type: 'time', name: 'requested_clock_out_time', nullable: true })
  requestedClockOutTime: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'text', name: 'work_log', nullable: true })
  workLog: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({
    type: 'enum',
    enum: AttendanceRequestStatus,
    default: AttendanceRequestStatus.PENDING,
  })
  status: AttendanceRequestStatus;

  // Admin action
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'action_by_id' })
  actionBy: User | null;

  @Column({ name: 'action_by_id', type: 'uuid', nullable: true })
  actionById: string | null;

  @Column({ type: 'text', name: 'action_notes', nullable: true })
  actionNotes: string | null;

  @Column({ type: 'timestamp', name: 'action_at', nullable: true })
  actionAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
