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

export enum StaffAttendanceStatus {
  CLOCKED_IN = 'CLOCKED_IN',
  CLOCKED_OUT = 'CLOCKED_OUT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

@Entity('staff_attendance_records')
@Index(['userId', 'date'], { unique: true })
export class StaffAttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // YYYY-MM-DD in IST
  @Column({ type: 'date' })
  date: string;

  // HH:mm in IST
  @Column({ type: 'time', name: 'clock_in_time', nullable: true })
  clockInTime: string | null;

  @Column({ type: 'time', name: 'clock_out_time', nullable: true })
  clockOutTime: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'worked_hours', default: 0 })
  workedHours: number;

  @Column({
    type: 'enum',
    enum: StaffAttendanceStatus,
    default: StaffAttendanceStatus.PENDING_APPROVAL,
  })
  status: StaffAttendanceStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', name: 'clock_in_location', nullable: true })
  clockInLocation: string | null;

  @Column({ type: 'varchar', name: 'clock_out_location', nullable: true })
  clockOutLocation: string | null;

  @Column({ type: 'varchar', name: 'timezone', default: 'Asia/Kolkata' })
  timezone: string;

  // Admin approval (optional)
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy: User | null;

  @Column({ name: 'approved_by_id', type: 'uuid', nullable: true })
  approvedById: string | null;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;
  @Column({ type: 'text', name: 'work_log', nullable: true })
workLog: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
