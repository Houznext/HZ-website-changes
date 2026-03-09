
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeHrDetails } from './entity/employee-hr.entity';
import { EmployeePayslip } from './employee-payslip/entity/employee-payslip.entity';
import { EmployeeLeave } from './employee-leave/entity/employee-leave.entity';
import { HrService } from './hr.service';
import { HrPayslipService } from './hr-payslip.service';
import { HrLeaveService } from './hr-leave.service';
import { HrController } from './hr.controller';
import { HrPayslipController } from './hr-payslip.controller';
import { HrLeaveController } from './hr-leave.controller';
import { User } from 'src/user/entities/user.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeHrDetails,
      EmployeePayslip,
      EmployeeLeave,
      User,
      Branch,
    ]),
    S3Module,
  ],
  controllers: [HrController, HrPayslipController, HrLeaveController],
  providers: [HrService, HrPayslipService, HrLeaveService],
})
export class HrModule {}
