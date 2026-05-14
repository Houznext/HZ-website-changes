import type { InfraUserBranchMembership } from '../infra-branch/entities/infra-user-branch-membership.entity';

export type PortalBranchMembershipPayload = {
  branchId: string;
  branchName: string;
  level: string;
  isBranchHead: boolean;
  isPrimary: boolean;
  branchRoles: { id: string; roleName: string }[];
  permissions: {
    resource: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }[];
};

export function mapMembershipsToPortalPayload(
  memberships: InfraUserBranchMembership[],
): PortalBranchMembershipPayload[] {
  return memberships.map((m) => ({
    branchId: m.branch?.id ?? '',
    branchName: m.branch?.name ?? '',
    level: m.branch?.level ?? '',
    isBranchHead: m.isBranchHead,
    isPrimary: m.isPrimary,
    branchRoles: (m.branchRoles ?? []).map((r) => ({ id: r.id, roleName: r.roleName })),
    permissions: (m.branchRoles ?? []).flatMap((r) =>
      (r.permissions ?? []).map((p) => ({
        resource: p.resource,
        view: p.view,
        create: p.create,
        edit: p.edit,
        delete: p.delete,
      })),
    ),
  }));
}
