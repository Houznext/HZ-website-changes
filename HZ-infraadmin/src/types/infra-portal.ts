export interface BranchMembership {
  branchId: string;
  branchName: string;
  level: string;
  isBranchHead: boolean;
  isPrimary: boolean;
  branchRoles: { id: string; roleName: string }[];
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}
