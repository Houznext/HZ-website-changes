import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { StaffAttendanceRecord, StaffAttendanceStatus } from './entities/attendance-record.entity';
import { User } from 'src/user/entities/user.entity';
import { UserKind } from 'src/user/enum/user.enum';
import {
  StaffApproveAttendanceDto,
  StaffClockInDto,
  StaffClockOutDto,
  StaffManualAttendanceDto,
} from './dto/attendance.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  AttendanceRequestStatus,
  AttendanceRequestType,
  StaffAttendanceRequest,
} from './entities/attendance-request.entity';
import { CreateAttendanceRequestDto, ReviewAttendanceRequestDto } from './dto/attendance-request.dto';
import { UserBranchMembership } from 'src/branch/entities/user-branch-membership.entity';

@Injectable()
export class StaffAttendanceService {
  private readonly DEFAULT_TZ = 'Asia/Kolkata';

  constructor(
    @InjectRepository(StaffAttendanceRecord)
    private readonly attendanceRepo: Repository<StaffAttendanceRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(StaffAttendanceRequest)
    private readonly requestRepo: Repository<StaffAttendanceRequest>,
    @InjectRepository(UserBranchMembership)
    private readonly membershipRepo: Repository<UserBranchMembership>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  // ------------------ Helpers ------------------

  private nowIST(): { date: string; time: string } {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.DEFAULT_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;

    return { date: `${map.year}-${map.month}-${map.day}`, time: `${map.hour}:${map.minute}` };
  }

  private calculateHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;
    if (endMin < startMin) endMin += 24 * 60;
    return Math.round(((endMin - startMin) / 60) * 100) / 100;
  }

  private async ensureStaff(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.kind !== UserKind.STAFF) throw new BadRequestException('Only STAFF users can use staff attendance');
    return user;
  }

  private isOrgSuperAdminHead(authUser: any) {
    const m = authUser?.branchMemberships?.[0];
    return (
      m?.level === 'ORG' &&
      m?.isBranchHead === true &&
      (m?.branchRoles || []).some((r: any) => r?.roleName === 'SuperAdmin')
    );
  }

  private async getPrimaryBranchIdFromDb(userId: string) {
    const membership = await this.membershipRepo.findOne({
      where: { user: { id: userId }, isPrimary: true } as any,
      relations: { branch: true } as any,
    });
    return membership?.branch?.id || null;
  }

  private async resolveBranchId(authUser: any, branchIdFromQuery?: string) {
    const userId = authUser?.sub || authUser?.id;
    if (!userId) throw new BadRequestException('Invalid session user');

    const sessionBranchId =
      authUser?.branchMemberships?.[0]?.branchId || (await this.getPrimaryBranchIdFromDb(userId));

    if (!sessionBranchId) throw new BadRequestException('Branch not found for this user');

    const orgAllowed = this.isOrgSuperAdminHead(authUser);
    const effectiveBranchId = orgAllowed ? (branchIdFromQuery || sessionBranchId) : sessionBranchId;

    return { userId, effectiveBranchId, orgAllowed };
  }

  private async getStaffUserIdsForBranch(branchId: string) {
    const members = await this.membershipRepo.find({
      where: { branch: { id: branchId }, user: { kind: UserKind.STAFF } } as any,
      relations: { user: true } as any,
      select: { user: { id: true } } as any,
    });

    return members.map((m) => m.user?.id).filter(Boolean) as string[];
  }

  private async assertSameBranchOrThrow(authUser: any, targetStaffUserId: string, branchIdFromQuery?: string) {
    const { effectiveBranchId } = await this.resolveBranchId(authUser, branchIdFromQuery);

    const targetMembership = await this.membershipRepo.findOne({
      where: { user: { id: targetStaffUserId }, isPrimary: true } as any,
      relations: { branch: true } as any,
    });

    const staffBranchId = targetMembership?.branch?.id;
    if (!staffBranchId) throw new BadRequestException('Target user has no branch mapping');

    // if (String(staffBranchId) !== String(effectiveBranchId)) {
    //   throw new BadRequestException('You cannot act on another branch data');
    // }

    return effectiveBranchId;
  }

  // ------------------ STAFF endpoints ------------------

  async clockIn(userId: string, dto: StaffClockInDto) {
    await this.ensureStaff(userId);

    const { date: today, time: nowTime } = this.nowIST();
    const date = dto.date || today;
    const clockInTime = dto.clockInTime || nowTime;

    const existing = await this.attendanceRepo.findOne({ where: { userId, date } });
    if (existing?.clockInTime) throw new ConflictException('Already clocked in for this date');

    const record =
      existing ||
      this.attendanceRepo.create({
        userId,
        date,
        timezone: this.DEFAULT_TZ,
      });

    record.clockInTime = clockInTime;
    record.clockInLocation = dto.location || record.clockInLocation || null;
    record.notes = dto.notes || record.notes || null;
    record.status = StaffAttendanceStatus.CLOCKED_IN;

    const saved = await this.attendanceRepo.save(record);
    await this.cache.del(`staff_today_status:${userId}`);
    return saved;
  }

  async clockOut(userId: string, dto: StaffClockOutDto) {
    await this.ensureStaff(userId);

    const { date: today, time: nowTime } = this.nowIST();
    const record = await this.attendanceRepo.findOne({ where: { userId, date: today } });

    if (!record?.clockInTime) throw new NotFoundException('No clock-in found for today');
    if (record.clockOutTime) throw new ConflictException('Already clocked out for today');

    if (!dto.workLog || dto.workLog.trim().length < 5) {
      throw new BadRequestException('Work log is required at clock-out');
    }

    const clockOutTime = dto.clockOutTime || nowTime;

    record.clockOutTime = clockOutTime;
    record.clockOutLocation = dto.location || record.clockOutLocation || null;
    record.notes = dto.notes || record.notes || null;
    record.workLog = dto.workLog.trim();
    record.workedHours = this.calculateHours(record.clockInTime, clockOutTime);
    record.status = StaffAttendanceStatus.PENDING_APPROVAL;

    const saved = await this.attendanceRepo.save(record);
    await this.cache.del(`staff_today_status:${userId}`);
    return saved;
  }

  async todayStatus(userId: string) {
    await this.ensureStaff(userId);

    const cacheKey = `staff_today_status:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const { date: today } = this.nowIST();
    const record = await this.attendanceRepo.findOne({ where: { userId, date: today } });

    const result = {
      date: today,
      hasClockedIn: !!record?.clockInTime,
      hasClockedOut: !!record?.clockOutTime,
      record: record || null,
    };

    await this.cache.set(cacheKey, result, 60);
    return result;
  }

  async myHistory(userId: string, from?: string, to?: string) {
    await this.ensureStaff(userId);

    const where: any = { userId };
    if (from) where.date = Between(from, to || from);

    return this.attendanceRepo.find({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
      relations: ['approvedBy'],
    });
  }

  // ------------------ ADMIN/HR endpoints (branch aware) ------------------

  async listAllBranchWise(
    authUser: any,
    branchIdFromQuery?: string,
    from?: string,
    to?: string,
    status?: StaffAttendanceStatus,
  ) {
    const { effectiveBranchId } = await this.resolveBranchId(authUser, branchIdFromQuery);

    const userIds = await this.getStaffUserIdsForBranch(effectiveBranchId);
    if (!userIds.length) return [];

    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .leftJoinAndSelect('a.approvedBy', 'approvedBy')
      .where('a.userId IN (:...userIds)', { userIds });

    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });
    if (status) qb.andWhere('a.status = :status', { status });

    qb.orderBy('a.date', 'DESC');
    return qb.getMany();
  }

  async approve(recordId: string, adminId: string, authUser: any, dto: StaffApproveAttendanceDto) {
    const record = await this.attendanceRepo.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Attendance record not found');

    // ✅ branch-safe
    await this.assertSameBranchOrThrow(authUser, record.userId);

    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    record.status = dto.status === 'APPROVED' ? StaffAttendanceStatus.APPROVED : StaffAttendanceStatus.REJECTED;
    record.approvedById = adminId;
    record.approvedAt = new Date();
    record.approvalNotes = dto.approvalNotes || null;

    const saved = await this.attendanceRepo.save(record);
    await this.cache.del(`staff_today_status:${record.userId}`);
    return saved;
  }

  async manualUpsert(adminId: string, authUser: any, dto: StaffManualAttendanceDto) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const staff = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!staff) throw new NotFoundException('User not found');
    if (staff.kind !== UserKind.STAFF) throw new BadRequestException('Manual attendance only for STAFF');

    // ✅ branch-safe
    await this.assertSameBranchOrThrow(authUser, dto.userId);

    if (!dto.clockInTime && !dto.clockOutTime) throw new BadRequestException('Provide clockInTime or clockOutTime');

    if (dto.clockOutTime && (!dto.workLog || dto.workLog.trim().length < 5)) {
      throw new BadRequestException('Work log is required when setting clock-out');
    }

    let record = await this.attendanceRepo.findOne({ where: { userId: dto.userId, date: dto.date } });
    if (!record) {
      record = this.attendanceRepo.create({
        userId: dto.userId,
        date: dto.date,
        timezone: dto.timezone || this.DEFAULT_TZ,
      });
    }

    if (dto.clockInTime) record.clockInTime = dto.clockInTime;
    if (dto.clockOutTime) record.clockOutTime = dto.clockOutTime;

    if (dto.location) {
      if (dto.clockInTime) record.clockInLocation = dto.location;
      if (dto.clockOutTime) record.clockOutLocation = dto.location;
    }

    if (dto.notes) record.notes = dto.notes;
    if (dto.workLog) record.workLog = dto.workLog.trim();

    if (record.clockInTime && record.clockOutTime) {
      record.workedHours = this.calculateHours(record.clockInTime, record.clockOutTime);
      record.status = dto.status || StaffAttendanceStatus.APPROVED;
    } else {
      record.workedHours = record.workedHours || 0;
      record.status = dto.status || StaffAttendanceStatus.CLOCKED_IN;
    }

    record.approvedById = adminId;
    record.approvedAt = new Date();
    record.approvalNotes = dto.notes || record.approvalNotes || 'Manual update';

    const saved = await this.attendanceRepo.save(record);
    await this.cache.del(`staff_today_status:${dto.userId}`);
    return saved;
  }

  // ------------------ Requests ------------------

  async createRequest(staffUserId: string, dto: CreateAttendanceRequestDto) {
    await this.ensureStaff(staffUserId);

    if (dto.type === AttendanceRequestType.FORGOT_CLOCK_IN && !dto.requestedClockInTime) {
      throw new BadRequestException('requestedClockInTime required');
    }
    if (dto.type === AttendanceRequestType.FORGOT_CLOCK_OUT && !dto.requestedClockOutTime) {
      throw new BadRequestException('requestedClockOutTime required');
    }
    if (dto.type === AttendanceRequestType.FORGOT_BOTH && (!dto.requestedClockInTime || !dto.requestedClockOutTime)) {
      throw new BadRequestException('Both requestedClockInTime and requestedClockOutTime required');
    }

    const req = this.requestRepo.create({
      userId: staffUserId,
      date: dto.date,
      type: dto.type,
      requestedClockInTime: dto.requestedClockInTime || null,
      requestedClockOutTime: dto.requestedClockOutTime || null,
      reason: dto.reason || null,
      workLog: dto.workLog || null,
      location: dto.location || null,
      status: AttendanceRequestStatus.PENDING,
    });

    return this.requestRepo.save(req);
  }

  async listMyRequests(userId: string) {
    await this.ensureStaff(userId);
    return this.requestRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['actionBy'],
    });
  }

  async listRequestsBranchWise(
    authUser: any,
    branchIdFromQuery?: string,
    status?: AttendanceRequestStatus,
    from?: string,
    to?: string,
  ) {
    const { effectiveBranchId } = await this.resolveBranchId(authUser, branchIdFromQuery);

    const userIds = await this.getStaffUserIdsForBranch(effectiveBranchId);
    if (!userIds.length) return [];

    const qb = this.requestRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('r.actionBy', 'actionBy')
      .where('r.userId IN (:...userIds)', { userIds });

    if (status) qb.andWhere('r.status = :status', { status });
    if (from) qb.andWhere('r.date >= :from', { from });
    if (to) qb.andWhere('r.date <= :to', { to });

    qb.orderBy('r.createdAt', 'DESC');
    return qb.getMany();
  }

  async approveRequest(requestId: string, adminId: string, authUser: any, dto: ReviewAttendanceRequestDto) {
    const admin = await this.userRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const req = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');

    // ✅ branch-safe
    await this.assertSameBranchOrThrow(authUser, req.userId);

    if (req.status !== AttendanceRequestStatus.PENDING) {
      throw new BadRequestException('Only PENDING requests can be approved');
    }

    req.status = AttendanceRequestStatus.APPROVED;
    req.actionById = adminId;
    req.actionAt = new Date();
    req.actionNotes = dto.actionNotes || 'Approved';
    await this.requestRepo.save(req);

    let record = await this.attendanceRepo.findOne({ where: { userId: req.userId, date: req.date } });
    if (!record) {
      record = this.attendanceRepo.create({ userId: req.userId, date: req.date, timezone: this.DEFAULT_TZ });
    }

    if (req.requestedClockInTime) record.clockInTime = req.requestedClockInTime;
    if (req.requestedClockOutTime) record.clockOutTime = req.requestedClockOutTime;

    if (req.location) {
      if (req.requestedClockInTime) record.clockInLocation = req.location;
      if (req.requestedClockOutTime) record.clockOutLocation = req.location;
    }

    if (req.reason) record.notes = req.reason;
    if (req.workLog) record.workLog = req.workLog;

    if (record.clockInTime && record.clockOutTime) {
      record.workedHours = this.calculateHours(record.clockInTime, record.clockOutTime);
    } else {
      record.workedHours = record.workedHours || 0;
    }

    record.approvedById = adminId;
    record.approvedAt = new Date();
    record.approvalNotes = req.actionNotes;
    record.status = StaffAttendanceStatus.APPROVED;

    const savedRecord = await this.attendanceRepo.save(record);

    await this.cache.del(`staff_today_status:${req.userId}`);
    return { request: req, attendance: savedRecord };
  }

  async rejectRequest(requestId: string, adminId: string, authUser: any, dto: ReviewAttendanceRequestDto) {
    const req = await this.requestRepo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');

    // ✅ branch-safe
    await this.assertSameBranchOrThrow(authUser, req.userId);

    req.status = AttendanceRequestStatus.REJECTED;
    req.actionById = adminId;
    req.actionAt = new Date();
    req.actionNotes = dto.actionNotes || 'Rejected';

    return this.requestRepo.save(req);
  }
   async historyByUser(userId: string, from?: string, to?: string) {
  const where: any = { userId };
  if (from && to) where.date = Between(from, to);

  return this.attendanceRepo.find({
    where,
    order: { date: 'DESC', createdAt: 'DESC' },
    relations: ['approvedBy'],
  });
}
}
