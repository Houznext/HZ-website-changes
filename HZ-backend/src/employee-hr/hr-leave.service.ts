
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EmployeeHrDetails } from './entity/employee-hr.entity';
import {
  EmployeeLeave,
  LeaveStatus,
} from './employee-leave/entity/employee-leave.entity';
import {
  ApplyLeaveDto,
  ListLeavesQueryDto,
  UpdateLeaveStatusDto,
} from './employee-leave/dto/employee-leave.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class HrLeaveService {
  constructor(
    @InjectRepository(EmployeeHrDetails)
    private readonly hrRepo: Repository<EmployeeHrDetails>,
    @InjectRepository(EmployeeLeave)
    private readonly leaveRepo: Repository<EmployeeLeave>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // private async getHrForUser(userId: string): Promise<EmployeeHrDetails> {
  //   const hr = await this.hrRepo.findOne({
  //     where: { user: { id: userId } },
  //     relations: ['user', 'branch'],
  //   });
  //   // if (!hr) throw new NotFoundException('HR details not found for user');
  //   return hr;
  // }
 private async getHrForUser(userId: string): Promise<EmployeeHrDetails | null> {
  const hr = await this.hrRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user', 'branch'],
  });
  return hr ?? null;
}


  async listForUser(
    userId: string,
    query: ListLeavesQueryDto,
  ): Promise<EmployeeLeave[]> {
    const hr = await this.getHrForUser(userId);
    if (!hr) return [];

    const qb = this.leaveRepo
      .createQueryBuilder('l')
      .where('l.employeeId = :employeeId', { employeeId: hr.id });

    this.applyFilters(qb, query);
    return qb
      .orderBy('l.fromDate', 'DESC')
      .addOrderBy('l.toDate', 'DESC')
      .getMany();
  }

  async listForBranch(
    branchId: string,
    query: ListLeavesQueryDto,
  ): Promise<EmployeeLeave[]> {
    const qb = this.leaveRepo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.employee', 'hr')
      .leftJoinAndSelect('hr.user', 'user')
      .leftJoinAndSelect('hr.branch', 'branch')
      .where('branch.id = :branchId', { branchId });

    this.applyFilters(qb, query);

    return qb
      .orderBy('l.fromDate', 'DESC')
      .addOrderBy('l.toDate', 'DESC')
      .getMany();
  }

  private applyFilters(
    qb: SelectQueryBuilder<EmployeeLeave>,
    query: ListLeavesQueryDto,
  ) {
    const { fromDate, toDate, status, type } = query;

    if (status) qb.andWhere('l.status = :status', { status });
    if (type) qb.andWhere('l.type = :type', { type });
    if (fromDate) qb.andWhere('l.fromDate >= :fromDate', { fromDate });
    if (toDate) qb.andWhere('l.toDate <= :toDate', { toDate });
  }

  async applyLeave(
    userId: string,
    dto: ApplyLeaveDto,
  ): Promise<EmployeeLeave> {
    const hr = await this.getHrForUser(userId);

    if (dto.days <= 0) {
      throw new BadRequestException('Days must be greater than 0');
    }

    
    // if (dto.type === 'CASUAL' && (hr.casualLeaveBalance ?? 0) < dto.days) {
    //   throw new BadRequestException('Insufficient casual leave balance');
    // }
    // if (dto.type === 'SICK' && (hr.sickLeaveBalance ?? 0) < dto.days) {
    //   throw new BadRequestException('Insufficient sick leave balance');
    // }

    const leave = this.leaveRepo.create({
      employee: hr,
      type: dto.type,
      fromDate: new Date(dto.fromDate),
      toDate: new Date(dto.toDate),
      days: dto.days,
      status: LeaveStatus.APPLIED,
      reason: dto.reason,
    });

    return this.leaveRepo.save(leave);
  }

  async updateLeaveStatus(
    leaveId: number,
    dto: UpdateLeaveStatusDto,
    approverId: string,
  ): Promise<EmployeeLeave> {
    const leave = await this.leaveRepo.findOne({ where: { id: leaveId } });
    if (!leave) throw new NotFoundException('Leave not found');

    
    leave.status = dto.status;
    leave.approverId = approverId;
    leave.approvedAt =
      dto.status === LeaveStatus.APPROVED ||
      dto.status === LeaveStatus.REJECTED
        ? new Date()
        : null;

    

    return this.leaveRepo.save(leave);
  }
}
