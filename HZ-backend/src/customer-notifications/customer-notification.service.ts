import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerNotification } from './entities/customer-notification.entity';
import {
  CustomerNotificationResourceType,
  CustomerNotificationType,
} from './enums/customer-notification.enum';
import { CustomerIdentityService } from 'src/common/customer-identity/customer-identity.service';
import { mobileSuffix10 } from 'src/common/phone.util';
import { Customer } from 'src/interiors/entities/customer.entity';

export type CreateCustomerNotificationInput = {
  mobile: string | number | null | undefined;
  type: CustomerNotificationType;
  title: string;
  summary: string;
  href: string;
  resourceType?: CustomerNotificationResourceType | null;
  resourceId?: string | null;
  meta?: Record<string, unknown> | null;
  customerId?: string | null;
};

@Injectable()
export class CustomerNotificationService {
  constructor(
    @InjectRepository(CustomerNotification)
    private readonly repo: Repository<CustomerNotification>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly customerIdentity: CustomerIdentityService,
  ) {}

  /** Fire-and-forget safe create; returns null if mobile invalid. */
  async createForMobile(
    input: CreateCustomerNotificationInput,
  ): Promise<CustomerNotification | null> {
    try {
      const suffix = mobileSuffix10(String(input.mobile ?? ''));
      if (suffix.length !== 10) return null;

      let customerId = input.customerId ?? null;
      if (!customerId) {
        const portal = await this.customerIdentity.findPortalByMobile(suffix);
        customerId = portal?.id ?? null;
      }

      const row = this.repo.create({
        mobileSuffix: suffix,
        customerId,
        type: input.type,
        title: input.title,
        summary: input.summary,
        href: input.href,
        resourceType: input.resourceType ?? null,
        resourceId: input.resourceId ?? null,
        meta: input.meta ?? null,
        isRead: false,
      });
      return await this.repo.save(row);
    } catch (err) {
      console.warn('customer notification create failed:', err);
      return null;
    }
  }

  /** Non-blocking wrapper for admin write paths. */
  enqueue(input: CreateCustomerNotificationInput, label = 'customer notify') {
    void this.createForMobile(input).catch((err) =>
      console.warn(`[${label}]`, err),
    );
  }

  private async resolveMobileSuffix(
    customerId: string,
    jwtMobile?: string,
  ): Promise<string> {
    if (jwtMobile) {
      const fromJwt = mobileSuffix10(jwtMobile);
      if (fromJwt.length === 10) return fromJwt;
    }
    const customer = await this.customerRepo.findOne({ where: { id: customerId } });
    if (!customer?.mobile) {
      throw new BadRequestException(
        'Link a mobile number to view notifications',
      );
    }
    const suffix = mobileSuffix10(customer.mobile);
    if (suffix.length !== 10) {
      throw new BadRequestException(
        'Link a mobile number to view notifications',
      );
    }
    return suffix;
  }

  async listForCustomer(
    customerId: string,
    jwtMobile: string | undefined,
    opts?: { limit?: number; offset?: number; unreadOnly?: boolean },
  ) {
    const suffix = await this.resolveMobileSuffix(customerId, jwtMobile);
    const limit = Math.min(Math.max(opts?.limit ?? 30, 1), 100);
    const offset = Math.max(opts?.offset ?? 0, 0);

    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.mobileSuffix = :suffix', { suffix })
      .orderBy('n.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (opts?.unreadOnly) {
      qb.andWhere('n.isRead = false');
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, limit, offset };
  }

  async unreadCount(customerId: string, jwtMobile?: string) {
    const suffix = await this.resolveMobileSuffix(customerId, jwtMobile);
    const count = await this.repo.count({
      where: { mobileSuffix: suffix, isRead: false },
    });
    return { count };
  }

  async markRead(
    id: string,
    customerId: string,
    jwtMobile?: string,
  ): Promise<CustomerNotification> {
    const suffix = await this.resolveMobileSuffix(customerId, jwtMobile);
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Notification not found');
    if (row.mobileSuffix !== suffix) {
      throw new ForbiddenException('Not allowed');
    }
    row.isRead = true;
    return this.repo.save(row);
  }

  async markAllRead(customerId: string, jwtMobile?: string) {
    const suffix = await this.resolveMobileSuffix(customerId, jwtMobile);
    await this.repo.update(
      { mobileSuffix: suffix, isRead: false },
      { isRead: true },
    );
    return { ok: true };
  }
}
