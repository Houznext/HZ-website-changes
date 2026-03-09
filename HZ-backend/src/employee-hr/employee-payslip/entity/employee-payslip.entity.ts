
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { EmployeeHrDetails } from '../../entity/employee-hr.entity';

export enum PayslipStatus {
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  PAID = 'PAID',
}

@Entity('employee_payslips')
@Unique(['employee', 'month', 'year']) 
export class EmployeePayslip {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmployeeHrDetails, (hr) => hr.payslips, {
    onDelete: 'CASCADE',
    eager: true,
  })
  employee: EmployeeHrDetails;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  grossEarnings: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalDeductions: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  netPay: number;

  @Column({ type: 'date' })
  payDate: Date;

  @Column({ nullable: true })
  payslipNumber?: string;

  @Column({ nullable: true })
  pdfUrl?: string; 

  @Column({ type: 'varchar', default: PayslipStatus.GENERATED })
status: string;  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
