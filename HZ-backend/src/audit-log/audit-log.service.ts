import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  branchId?: string | null;
  httpMethod?: string;
  path?: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  isSelfTransaction?: boolean;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<void> {
    const entry = this.auditLogRepository.create({
      userId: dto.userId ?? null,
      action: dto.action,
      resource: dto.resource,
      resourceId: dto.resourceId ?? null,
      branchId: dto.branchId ?? null,
      httpMethod: dto.httpMethod ?? 'UNKNOWN',
      path: dto.path ?? null,
      oldValue: dto.oldValue ?? null,
      newValue: dto.newValue ?? null,
      ipAddress: dto.ipAddress ?? null,
      userAgent: dto.userAgent ?? null,
      isSelfTransaction: dto.isSelfTransaction ?? false,
    });

    try {
      await this.auditLogRepository.save(entry);
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  async findByResource(
    resource: string,
    resourceId: string,
    take = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { resource, resourceId },
      order: { createdAt: 'DESC' },
      take,
      relations: ['user'],
    });
  }

  async findByUser(userId: string, take = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take,
    });
  }

  async findByBranch(branchId: string, take = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { branchId },
      order: { createdAt: 'DESC' },
      take,
      relations: ['user'],
    });
  }

  async findSelfTransactions(take = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { isSelfTransaction: true },
      order: { createdAt: 'DESC' },
      take,
      relations: ['user'],
    });
  }
}
