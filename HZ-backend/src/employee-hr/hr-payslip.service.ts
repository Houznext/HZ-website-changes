
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EmployeeHrDetails } from './entity/employee-hr.entity';
import {
  EmployeePayslip,
  PayslipStatus,
} from './employee-payslip/entity/employee-payslip.entity';
import {
  CreatePayslipDto,
  ListPayslipsQueryDto,
  UpdatePayslipDto,
} from './employee-payslip/dto/employee-payslip.dto';
import { User } from 'src/user/entities/user.entity';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
export class HrPayslipService {
  constructor(
    @InjectRepository(EmployeeHrDetails)
    private readonly hrRepo: Repository<EmployeeHrDetails>,
    @InjectRepository(EmployeePayslip)
    private readonly payslipRepo: Repository<EmployeePayslip>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly s3Service: S3Service,
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
    query: ListPayslipsQueryDto,
  ): Promise<EmployeePayslip[]> {
    const hr = await this.getHrForUser(userId);
      if (!hr) return [];

    const qb = this.payslipRepo
      .createQueryBuilder('p')
      .where('p.employeeId = :employeeId', { employeeId: hr.id });

    this.applyFilters(qb, query);

    return qb.orderBy('p.year', 'DESC')
      .addOrderBy('p.month', 'DESC')
      .getMany();
  }

  async listForBranch(
    branchId: string,
    query: ListPayslipsQueryDto,
  ): Promise<EmployeePayslip[]> {
    const qb = this.payslipRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.employee', 'hr')
      .leftJoinAndSelect('hr.user', 'user')
      .leftJoinAndSelect('hr.branch', 'branch')
      .where('branch.id = :branchId', { branchId });

    this.applyFilters(qb, query);

    return qb.orderBy('p.year', 'DESC')
      .addOrderBy('p.month', 'DESC')
      .getMany();
  }

  private applyFilters(
    qb: SelectQueryBuilder<EmployeePayslip>,
    query: ListPayslipsQueryDto,
  ) {
    const { month, year, status } = query;

    if (month) qb.andWhere('p.month = :month', { month });
    if (year) qb.andWhere('p.year = :year', { year });
    if (status) qb.andWhere('p.status = :status', { status });
  }

  async getOne(id: number): Promise<EmployeePayslip> {
    const slip = await this.payslipRepo.findOne({ where: { id } });
    if (!slip) throw new NotFoundException('Payslip not found');
    return slip;
  }

  async createForUser(
    userId: string,
    dto: CreatePayslipDto,
  ): Promise<EmployeePayslip> {
    const hr = await this.getHrForUser(userId);

    const exists = await this.payslipRepo.findOne({
      where: {
        employee: { id: hr.id },
        month: dto.month,
        year: dto.year,
      },
    });

    if (exists) {
      throw new BadRequestException(
        'Payslip already exists for this month and year',
      );
    }

    const payslip = this.payslipRepo.create({
      employee: hr,
      month: dto.month,
      year: dto.year,
      grossEarnings: dto.grossEarnings,
      totalDeductions: dto.totalDeductions,
      netPay: dto.netPay,
      payDate: new Date(dto.payDate),
      payslipNumber: dto.payslipNumber,
      pdfUrl: dto.pdfUrl,
      status: PayslipStatus.GENERATED,
    });

    return this.payslipRepo.save(payslip);
  }

  async updatePayslip(
    id: number,
    dto: UpdatePayslipDto,
  ): Promise<EmployeePayslip> {
    const slip = await this.getOne(id);

    if (dto.pdfUrl !== undefined && slip.pdfUrl && dto.pdfUrl !== slip.pdfUrl) {
      try {
        await this.s3Service.deleteFileByUrl(slip.pdfUrl);
      } catch (err) {
        console.warn('Failed to delete old payslip pdf from S3:', err);
      }
    }

    if (dto.status !== undefined) slip.status = dto.status;
    if (dto.pdfUrl !== undefined) slip.pdfUrl = dto.pdfUrl;

    return this.payslipRepo.save(slip);
  }

  async deletePayslip(id: number): Promise<void> {
    const slip = await this.getOne(id);
    if (slip.pdfUrl) {
      try {
        await this.s3Service.deleteFileByUrl(slip.pdfUrl);
      } catch (err) {
        console.warn('Failed to delete payslip pdf from S3:', err);
      }
    }
    await this.payslipRepo.delete(id);
  }
}
