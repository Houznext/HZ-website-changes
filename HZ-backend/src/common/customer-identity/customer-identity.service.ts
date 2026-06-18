import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Customer } from '../../interiors/entities/customer.entity';
import { LivebuildCustomer } from '../../livebuild/entities/livebuild-customer.entity';
import { User } from '../../user/entities/user.entity';
import { UserKind, UserRole } from '../../user/enum/user.enum';
import {
  mobileSuffix10,
  normalizeLbMobile,
  normalizePortalMobile,
  sqlMobileSuffixMatch,
} from '../phone.util';

export type PortalCustomerSyncInput = {
  mobile: string;
  fullName?: string | null;
  email?: string | null;
  otpVerified?: boolean;
};

@Injectable()
export class CustomerIdentityService {
  constructor(
    @InjectRepository(Customer)
    private readonly portalRepo: Repository<Customer>,
    @InjectRepository(LivebuildCustomer)
    private readonly livebuildRepo: Repository<LivebuildCustomer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  requireSuffix10(mobile: string): string {
    const suffix = normalizePortalMobile(mobile);
    if (suffix.length !== 10) {
      throw new BadRequestException('Enter a valid 10-digit mobile number');
    }
    return suffix;
  }

  async findPortalByMobile(mobile: string): Promise<Customer | null> {
    const suffix = mobileSuffix10(mobile);
    if (suffix.length !== 10) return null;
    return this.portalRepo
      .createQueryBuilder('c')
      .where(sqlMobileSuffixMatch('c.mobile'), { mobileSuffix: suffix })
      .getOne();
  }

  async findLivebuildByMobile(mobile: string): Promise<LivebuildCustomer | null> {
    const suffix = mobileSuffix10(mobile);
    if (suffix.length !== 10) return null;
    return this.livebuildRepo
      .createQueryBuilder('c')
      .where(sqlMobileSuffixMatch('c.mobile'), { mobileSuffix: suffix })
      .getOne();
  }

  isPortalCustomerRegistered(customer: Customer | null): boolean {
    return Boolean(
      customer &&
        customer.isVerified &&
        (customer.fullName ?? '').trim().length > 0,
    );
  }

  isLivebuildCustomerRegistered(customer: LivebuildCustomer | null): boolean {
    return Boolean(
      customer &&
        customer.otpVerified &&
        (customer.name ?? '').trim().length > 0,
    );
  }

  async isRegisteredOnPlatform(mobile: string): Promise<boolean> {
    const [portal, livebuild] = await Promise.all([
      this.findPortalByMobile(mobile),
      this.findLivebuildByMobile(mobile),
    ]);
    if (
      this.isPortalCustomerRegistered(portal) ||
      this.isLivebuildCustomerRegistered(livebuild)
    ) {
      return true;
    }
    if (livebuild?.otpVerified) return true;
    if (portal?.isVerified) return true;
    return false;
  }

  /** Upsert int_customers from LiveBuild / admin data so website login reuses the same person. */
  async syncPortalCustomer(input: PortalCustomerSyncInput): Promise<Customer> {
    const suffix = this.requireSuffix10(input.mobile);
    let portal = await this.findPortalByMobile(suffix);
    const livebuild = await this.findLivebuildByMobile(suffix);

    const nameFromInput = input.fullName?.trim() || '';
    const nameFromLb = livebuild?.name?.trim() || '';

    if (!portal) {
      portal = this.portalRepo.create({
        fullName: nameFromInput || nameFromLb || '',
        mobile: suffix,
        email: input.email ?? livebuild?.email ?? null,
        isVerified: Boolean(input.otpVerified || livebuild?.otpVerified),
      });
      return this.portalRepo.save(portal);
    }

    if (nameFromInput && !(portal.fullName ?? '').trim()) {
      portal.fullName = nameFromInput;
    } else if (nameFromLb && !(portal.fullName ?? '').trim()) {
      portal.fullName = nameFromLb;
    }
    if (input.email && !portal.email) portal.email = input.email;
    else if (livebuild?.email && !portal.email) portal.email = livebuild.email;
    if (input.otpVerified || livebuild?.otpVerified) portal.isVerified = true;
    if (portal.mobile !== suffix) portal.mobile = suffix;

    return this.portalRepo.save(portal);
  }

  /**
   * Store cart/orders use the `user` table. Portal customers get a linked store User
   * by mobile (same person as LiveBuild / quotations — not property/infra listings).
   */
  async ensureStoreUserForPortalCustomer(portalCustomerId: string): Promise<User> {
    const portal = await this.portalRepo.findOne({ where: { id: portalCustomerId } });
    if (!portal) throw new NotFoundException('Customer not found');

    const suffix = portal.mobile ? normalizePortalMobile(portal.mobile) : '';
    if (suffix.length !== 10) {
      throw new BadRequestException(
        'A verified mobile number is required to use the Houznext store',
      );
    }

    let user = await this.userRepo
      .createQueryBuilder('u')
      .where(sqlMobileSuffixMatch('u.phone'), { mobileSuffix: suffix })
      .getOne();

    if (!user) {
      const username = `store_${suffix}`;
      const byUsername = await this.userRepo.findOne({ where: { username } });
      if (byUsername) {
        user = byUsername;
      } else {
        const fullName = (portal.fullName ?? '').trim();
        user = await this.userRepo.save(
          this.userRepo.create({
            username,
            password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10),
            phone: suffix,
            fullName: fullName || null,
            firstName: fullName.split(' ')[0] || null,
            lastName: fullName.split(' ').slice(1).join(' ') || null,
            email: portal.email,
            isVerified: true,
            kind: UserKind.CUSTOMER,
            role: UserRole.STANDARD,
          }),
        );
      }
    }

    let dirty = false;
    if (!user.fullName && (portal.fullName ?? '').trim()) {
      user.fullName = portal.fullName!.trim();
      dirty = true;
    }
    if (!user.email && portal.email) {
      user.email = portal.email;
      dirty = true;
    }
    if (user.phone !== suffix) {
      user.phone = suffix;
      dirty = true;
    }
    if (dirty) {
      user = await this.userRepo.save(user);
    }

    return user;
  }

  async syncPortalFromLivebuild(lb: LivebuildCustomer): Promise<Customer> {
    const saved = await this.syncPortalCustomer({
      mobile: lb.mobile,
      fullName: lb.name,
      email: lb.email,
      otpVerified: lb.otpVerified,
    });
    if (saved.mobile && normalizePortalMobile(saved.mobile).length === 10) {
      try {
        await this.ensureStoreUserForPortalCustomer(saved.id);
      } catch {
        // store user is optional until checkout
      }
    }
    return saved;
  }

  /** Ensure livebuild_customers row uses +91 format and sync portal. */
  async afterLivebuildCustomerSaved(
    lb: LivebuildCustomer,
  ): Promise<LivebuildCustomer> {
    const normalized = normalizeLbMobile(lb.mobile);
    if (lb.mobile !== normalized) {
      lb.mobile = normalized;
      lb = await this.livebuildRepo.save(lb);
    }
    await this.syncPortalFromLivebuild(lb);
    return lb;
  }
}
