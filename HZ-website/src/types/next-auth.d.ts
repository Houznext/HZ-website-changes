import NextAuth from "next-auth";

export interface BranchMembership {
  branchId: string;
  branchName?: string;
  isBranchHead?: boolean;
  isPrimary?: boolean;
  branchRoles?: Array<{ id: string; roleName: string }>;
  permissions?: Array<{
    id: string;
    resource: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  }>;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string;
      email?: string | null;
      firstName?: string;
      lastName?: string;
      phone?: string;
      profile?: string | null;
      kind?: string;
      role?: string;
      activeBranchId?: string;
      branchMemberships?: BranchMembership[];
      [key: string]: any;
    };
    token?: string;
    error?: string;
  }

  interface User {
    id: string;
    username?: string;
    email?: string | null;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profile?: string | null;
    token: string;
    kind?: string;
    role?: string;
    activeBranchId?: string;
    branchMemberships?: BranchMembership[];
    [key: string]: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      profile?: string | null;
      kind?: string;
      role?: string;
      activeBranchId?: string;
      branchMemberships?: BranchMembership[];
      [key: string]: any;
    };
    userToken?: string;
    sub?: string;
  }
}
