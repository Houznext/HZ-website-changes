import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

type Permission = {
  resource: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

type BranchMembershipToken = {
  branchId: string;
  branchName?: string;
  level?: string;
  isPrimary?: boolean;
  isBranchHead?: boolean;
  permissions?: Permission[];
};

type TokenUser = {
  id: number;
  email?: string;
  kind?: string;
  role?: string;
  branchMemberships?: BranchMembershipToken[];
};

function getActiveMembership(
  user?: TokenUser | null
): BranchMembershipToken | null {
  const memberships = user?.branchMemberships ?? [];
  if (!memberships.length) return null;
  const primary = memberships.find((m) => m.isPrimary);
  return primary ?? memberships[0];
}

// Helper: check permission for ACTIVE branch
function hasPermissionOnActiveBranch(
  user: TokenUser | undefined,
  resource: string,
  action: keyof Permission = "view"
): boolean {
  const membership = getActiveMembership(user);
  if (!membership) return false;
  const perms = membership.permissions ?? [];
  return perms.some((p) => p.resource === resource && p[action]);
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    const user = token?.user as TokenUser | undefined;
    const memberships = user?.branchMemberships ?? [];
    const kind = user?.kind;

    const isAuthenticated = !!token;
    const isStaffOrBranchUser =
      kind === "STAFF" ||
      (Array.isArray(memberships) && memberships.length > 0);
    const isBranchHead = Array.isArray(memberships)
      ? memberships.some((m) => m.isBranchHead)
      : false;

    // 1️⃣ Authenticated user going to /login → send to /dashboard
    if (path === "/login" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2️⃣ Authenticated user going to "/" → send to /dashboard (optional)
    if (path === "/" && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 3️⃣ Route → permission/resource mapping
    //    You can tweak resource names to match backend Permission.resource
    const routeChecks: {
      match: RegExp;
      resource?: string;
      action?: keyof Permission;
      staffOnly?: boolean;
      branchHeadOnly?: boolean;
    }[] = [
      // General staff/branch dashboard
      {
        match: /^\/dashboard$/,
        staffOnly: true,
      },

      // Company / premises
      {
        match: /^\/company-property(\/.*)?$/,
        resource: "company_property",
        action: "view",
        staffOnly: true,
      },

      // Branch management
      {
        match: /^\/branches(\/.*)?$/,
        resource: "branches",
        action: "view",
        staffOnly: true,
        branchHeadOnly: true, // only branch heads manage branches
      },

      // Blogs
      {
        match: /^\/blogs(\/.*)?$/,
        resource: "blog",
        action: "view",
        staffOnly: true,
      },

      // Property
      {
        match: /^\/property(\/.*)?$/,
        resource: "property",
        action: "view",
        staffOnly: true,
      },

      // Projects
      {
        match: /^\/projects(\/.*)?$/,
        resource: "project",
        action: "view",
        staffOnly: true,
      },

      // Home Decor
      {
        match: /^\/home-decors(\/.*)?$/,
        resource: "home_decor",
        action: "view",
        staffOnly: true,
      },

      // Electronics
      {
        match: /^\/electronics(\/.*)?$/,
        resource: "electronics",
        action: "view",
        staffOnly: true,
      },

      // Furnitures
      {
        match: /^\/furnitures(\/.*)?$/,
        resource: "furniture",
        action: "view",
        staffOnly: true,
      },

      // Custom Builder
      {
        match: /^\/custom-builder(\/.*)?$/,
        resource: "custom_builder",
        action: "view",
        staffOnly: true,
      },

      // Cost Estimator
      {
        match: /^\/cost-estimator(\/.*)?$/,
        resource: "cost_estimator",
        action: "view",
        staffOnly: true,
      },

      // CRM
      {
        match: /^\/crm(\/.*)?$/,
        resource: "crm",
        action: "view",
        staffOnly: true,
      },

      // Invoice
      {
        match: /^\/invoice(\/.*)?$/,
        resource: "invoice_estimator",
        action: "view",
        staffOnly: true,
      },

      // Service Leads
      {
        match: /^\/serviceleads(\/.*)?$/,
        resource: "service_leads",
        action: "view",
        staffOnly: true,
      },

      // Refer & Earn
      {
        match: /^\/referandearn(\/.*)?$/,
        resource: "referrals",
        action: "view",
        staffOnly: true,
      },

      // General Queries
      {
        match: /^\/generalenquires(\/.*)?$/,
        resource: "general_queries",
        action: "view",
        staffOnly: true,
      },

      // Testimonials
      {
        match: /^\/testimonials(\/.*)?$/,
        resource: "testimonials",
        action: "view",
        staffOnly: true,
      },

      // Settings root
      {
        match: /^\/settings$/,
        staffOnly: true,
      },

      // Settings → User Management
      {
        match: /^\/settings\/user-management(\/.*)?$/,
        resource: "user",
        action: "view",
        staffOnly: true,
      },

      // Settings → Careers
      {
        match: /^\/settings\/careersAdmin(\/.*)?$/,
        resource: "careers",
        action: "view",
        staffOnly: true,
      },

      // Settings → Access Control (branch-head only)
      {
        match: /^\/settings\/access-control(\/.*)?$/,
        resource: "role", // or "branch_role", whatever you use in Permission.resource
        action: "view",
        staffOnly: true,
        branchHeadOnly: true,
      },

      // Profile (settings/user-profile)
      {
        match: /^\/settings\/user-profile(\/.*)?$/,
        resource: "user",
        action: "view",
        staffOnly: true,
      },
    ];

    const isAdmin = user?.role === "ADMIN";

    // 4. Apply route checks
    for (const rule of routeChecks) {
      if (!rule.match.test(path)) continue;

      // ADMIN role bypasses all route-level permission checks
      if (isAdmin) break;

      // Staff / branch user restriction
      if (rule.staffOnly && !isStaffOrBranchUser) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Branch head only routes
      if (rule.branchHeadOnly && !isBranchHead) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      break;
    }

    // Default: let request pass through
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        if (path === "/login") return true;

        if (!token) return false;

        // Token expiry check (auto-logout when expired)
        const now = Math.floor(Date.now() / 1000);
        const exp = (token as any)?.exp;

        if (exp && now > exp) {
          // token expired → treat as unauthenticated
          return false;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/", // home
    "/dashboard",
    "/login",
    "/home-decors",
    "/user-management",
    "/property",
    "/user-profile",
    "/access-control",
    "/custom-builder",
    "/invoice",
    "/blogs",
    "/company-property",
    "/cost-estimator/:path*",
    "/settings/:path*",
    "/branches/:path*",
    "/projects/:path*",
    "/electronics/:path*",
    "/furnitures/:path*",
    "/crm/:path*",
    "/serviceleads/:path*",
    "/referandearn/:path*",
    "/generalenquires/:path*",
    "/testimonials/:path*",
  ],
};
