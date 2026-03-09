
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeHrDetails } from '../../entity/employee-hr.entity';

export enum LeaveType {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  EARNED = 'EARNED',
  COMP_OFF = 'COMP_OFF',
  LOP = 'LOP',
}

export enum LeaveStatus {
  APPLIED = 'APPLIED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('employee_leaves')
export class EmployeeLeave {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmployeeHrDetails, (hr) => hr.leaves, {
    onDelete: 'CASCADE',
    eager: true,
  })
  employee: EmployeeHrDetails;


  @Column({ type: 'varchar', nullable: true })
  type: string | null;


  @Column({ type: 'date' })
  fromDate: Date;

  @Column({ type: 'date' })
  toDate: Date;

  @Column({ type: 'int' })
  days: number;


  @Column({ type: 'varchar', default: LeaveStatus.APPLIED })
  status: string;

  @Column({ nullable: true })
  reason?: string;

  @Column({ type: 'uuid', nullable: true })
  approverId?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
