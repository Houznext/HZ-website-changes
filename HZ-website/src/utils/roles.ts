import type { BranchMembership } from "@/types/next-auth";
import type { SessionUser } from "@/store/useSessionStore";

export enum UserKind {
  CUSTOMER = "CUSTOMER",
  SELLER = "SELLER",
  STAFF = "STAFF",
  SERVICE_PROVIDER = "SERVICE_PROVIDER",
  AGENT = "AGENT",
}

export enum UserRole {
  ADMIN = "ADMIN",
  STANDARD = "STANDARD",
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === UserRole.ADMIN;
}

export function isStaff(user: SessionUser | null): boolean {
  return user?.kind === UserKind.STAFF;
}

export function isCustomer(user: SessionUser | null): boolean {
  return !user?.kind || user.kind === UserKind.CUSTOMER;
}

export function isSeller(user: SessionUser | null): boolean {
  return user?.kind === UserKind.SELLER;
}

export function isAgent(user: SessionUser | null): boolean {
  return user?.kind === UserKind.AGENT;
}

export function isServiceProvider(user: SessionUser | null): boolean {
  return user?.kind === UserKind.SERVICE_PROVIDER;
}

export function getActiveBranchMembership(
  user: SessionUser | null
): BranchMembership | undefined {
  if (!user?.branchMemberships?.length) return undefined;

  if (user.activeBranchId) {
    return user.branchMemberships.find(
      (m) => m.branchId === user.activeBranchId
    );
  }

  return (
    user.branchMemberships.find((m) => m.isPrimary) ??
    user.branchMemberships[0]
  );
}

export function hasPermission(
  user: SessionUser | null,
  resource: string,
  action: "view" | "create" | "edit" | "delete"
): boolean {
  if (isAdmin(user)) return true;

  const membership = getActiveBranchMembership(user);
  if (!membership) return false;

  if (membership.isBranchHead) return true;

  return (
    membership.permissions?.some(
      (p) =>
        p.resource.toLowerCase() === resource.toLowerCase() && p[action]
    ) ?? false
  );
}

export function getUserRoleLabel(user: SessionUser | null): string {
  if (!user) return "Guest";

  if (isAdmin(user)) return "Admin";

  switch (user.kind) {
    case UserKind.STAFF:
      return "Staff";
    case UserKind.SELLER:
      return "Seller";
    case UserKind.AGENT:
      return "Agent";
    case UserKind.SERVICE_PROVIDER:
      return "Service Provider";
    case UserKind.CUSTOMER:
    default:
      return "Customer";
  }
}
