import { User } from 'src/user/entities/user.entity';
import { UserRole } from 'src/user/enum/user.enum';
import { RequestUser } from 'src/guard';

export function isAdmin(user: User): boolean {
  return user.role === UserRole.ADMIN;
}

export function isAdminRequest(reqUser: RequestUser): boolean {
  return reqUser.role === UserRole.ADMIN;
}

export function isBranchHead(reqUser: RequestUser): boolean {
  return reqUser.branchMembership?.isBranchHead ?? false;
}
