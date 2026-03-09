import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { StaffAttendanceRecord } from './entities/attendance-record.entity';
import { StaffAttendanceService } from './attendance.service';
import { StaffAttendanceController } from './attendance.controller';
import { User } from 'src/user/entities/user.entity';
import {StaffAttendanceRequest} from "./entities/attendance-request.entity"
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffAttendanceRecord, User,  StaffAttendanceRequest, UserBranchMembership]),

   
    CacheModule.register({
      ttl: 60,        
      isGlobal: false 
    }),
  ],
  controllers: [StaffAttendanceController],
  providers: [StaffAttendanceService],
  exports: [StaffAttendanceService],
})
export class StaffAttendanceModule {}
