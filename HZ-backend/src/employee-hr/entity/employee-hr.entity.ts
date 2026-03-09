
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { EmployeeLeave } from '../employee-leave/entity/employee-leave.entity';
import { EmployeePayslip } from '../employee-payslip/entity/employee-payslip.entity';



// src/employee-hr/entity/employee-hr.entity.ts
@Entity('employee_hr_details')
export class EmployeeHrDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.hrDetails, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Branch, { nullable: true, eager: true })
  @JoinColumn()
  branch?: Branch;

  @Column({ nullable: true })
  employeeCode?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  designation?: string;

  @Column({ type: 'varchar', nullable: true })
employmentType?: string;

  @Column({ type: 'date', nullable: true })
  joiningDate?: Date;

  @Column({ type: 'date', nullable: true })
  relievingDate?: Date;

  @Index({ unique: true })
  @Column({ nullable: true, length: 12 })
  aadhaarNumber?: string;

  @Index({ unique: true })
  @Column({ nullable: true, length: 10 })
  panNumber?: string;

  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  accountHolderName?: string;

  @Column({ nullable: true })
  accountNumber?: string;

  @Column({ nullable: true })
  ifscCode?: string;

  @Column({ nullable: true })
  upiId?: string;

  // Emergency
  @Column({ nullable: true })
  emergencyContactName?: string;

  @Column({ nullable: true })
  emergencyContactPhone?: string;

  // 💰 Salary
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  baseSalary?: number;

  @Column({ nullable: true })
  salaryCurrency?: string;

  // 🏝 Leave balances (add these 👇)
  @Column({ type: 'int', default: 10 })
  casualLeaveBalance?: number;

  @Column({ type: 'int', default: 10 })
  sickLeaveBalance?: number;

  // (Optional – if you want more)
  // @Column({ type: 'int', default: 0 })
  // earnedLeaveBalance?: number;
  //
  // @Column({ type: 'int', default: 0 })
  // compOffBalance?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EmployeePayslip, (payslip) => payslip.employee)
  payslips?: EmployeePayslip[];

  @OneToMany(() => EmployeeLeave, (leave) => leave.employee)
  leaves?: EmployeeLeave[];
}
