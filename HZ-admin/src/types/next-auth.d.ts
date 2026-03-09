import "next-auth";

declare module "next-auth" {
  interface BranchMembership {
    branchId: string;
    branchName: string;
    level: string;
    isBranchHead: boolean;
    isPrimary: boolean;
    branchRoles: {
      id: string;
      roleName: string;
    }[];
    permissions: any[];
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      profile?: string;
      createdAt: string;
      updatedAt: string;
      kind: string;
      role: string;
      addresses: any[];
      token: string;
      branchMemberships: BranchMembership[];
    };
    expires: string;
    token: string;
    accessToken?: string;
    lastLogin?: number;
    branchMemberships: BranchMembership[];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    token: string;
    role: string;
    kind: string;
    [key: string]: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string;
      token: string;
      role: string;
      kind: string;
      [key: string]: any;
    };
    sub?: string;
  }
}
