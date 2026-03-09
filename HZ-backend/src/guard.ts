import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

import { User } from './user/entities/user.entity';
import { UserRole } from './user/enum/user.enum';

export const PERMISSIONS_KEY = 'permissions';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export const Permissions = (resource: string, action: PermissionAction) =>
  SetMetadata(PERMISSIONS_KEY, { resource, action });

/**
 * Mark a handler as admin-portal-only.
 * The guard will reject CUSTOMER-kind users from hitting it.
 */
export const ADMIN_PORTAL_KEY = 'adminPortal';
export const AdminPortal = () => SetMetadata(ADMIN_PORTAL_KEY, true);

type JwtPayload = {
  sub: string;
  email: string;
  role?: string;
  kind?: string;
  activeBranchId?: string;
};

export type RequestUser = {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  kind: string;
  activeBranchId?: string;
  branchMembership?: {
    branchId: string;
    branchRoles: {
      id: string;
      roleName: string;
    }[];
    kind: string;
    isBranchHead: boolean;
    isPrimary: boolean;
  };
};

type BranchPermissionLike = {
  resource: string;
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
};

@Injectable()
export class ControllerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Token is missing or invalid');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: [
        'branchMemberships',
        'branchMemberships.branch',
        'branchMemberships.branchRoles',
        'branchMemberships.branchRoles.permissions',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // ====== Admin-portal gate: block CUSTOMERs from admin-only endpoints ======
    const isAdminPortal = this.reflector.get<boolean>(
      ADMIN_PORTAL_KEY,
      context.getHandler(),
    );
    if (isAdminPortal && user.kind === 'CUSTOMER' && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Customers cannot access the admin portal. Please use onecasa.in',
      );
    }

    const activeBranchIdFromToken = payload.activeBranchId;
    const memberships = (user as any).branchMemberships ?? [];
    const activeMembership =
      memberships.find((m: any) => m.branch?.id === activeBranchIdFromToken) ||
      memberships.find((m: any) => m.isPrimary) ||
      memberships[0] ||
      null;

    const requestUser: RequestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      kind: user.kind,
      fullName: [(user as any).firstName, (user as any).lastName]
        .filter(Boolean)
        .join(' '),
      activeBranchId: activeMembership?.branch?.id,
      branchMembership: activeMembership
        ? {
            branchId: activeMembership.branch.id,
            branchRoles:
              activeMembership.branchRoles?.map((br: any) => ({
                id: br.id,
                roleName: br.roleName,
              })) ?? [],
            kind: activeMembership.kind,
            isBranchHead: activeMembership.isBranchHead,
            isPrimary: activeMembership.isPrimary,
          }
        : undefined,
    };

    request.user = requestUser;

    // ====== ADMIN role bypasses all permission checks ======
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // ====== Permission checks for STANDARD users ======

    const metadata = this.reflector.get<{
      resource: string;
      action: PermissionAction;
    }>(PERMISSIONS_KEY, context.getHandler());

    if (!metadata) {
      return true;
    }

    // BranchHead bypasses resource-level permissions within their branch
    if (activeMembership?.isBranchHead) {
      return true;
    }

    const { resource, action } = metadata;

    const hasBranchPermission =
      activeMembership?.branchRoles?.some((role: any) =>
        role.permissions?.some((p: BranchPermissionLike) =>
          this.permissionMatches(p, resource, action),
        ),
      ) ?? false;

    if (!hasBranchPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private permissionMatches(
    permission: BranchPermissionLike,
    resource: string,
    action: PermissionAction,
  ): boolean {
    if (permission.resource.toLowerCase() !== resource.toLowerCase()) {
      return false;
    }

    switch (action) {
      case 'view':
        return !!permission.view;
      case 'create':
        return !!permission.create;
      case 'edit':
        return !!permission.edit;
      case 'delete':
        return !!permission.delete;
      default:
        return false;
    }
  }
}
