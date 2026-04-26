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

/** Match backend / session store role variants (middleware must agree with usePermissions.isAdmin) */
function isAdminRole(role?: string | null): boolean {
  if (role == null || role === "") return false;
  const r = role.toString().trim();
  const u = r.toUpperCase();
  return (
    u === "ADMIN" ||
    u === "SUPERADMIN" ||
    u === "SUPER_ADMIN" ||
    r === "SuperAdmin"
  );
}

function isStaffKind(kind?: string | null): boolean {
  return (kind ?? "").toString().trim().toUpperCase() === "STAFF";
}

function hasBackendJwt(token: Record<string, unknown> | null | undefined): boolean {
  const u = token?.user as { token?: string } | undefined;
  return typeof u?.token === "string" && u.token.length > 0;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const path = req.nextUrl.pathname;

    const user = token?.user as TokenUser | undefined;
    const memberships = user?.branchMemberships ?? [];
    const kind = user?.kind;

    const isAuthenticated = !!token && !!(token as any).user;
    const isStaffOrBranchUser =
      isStaffKind(kind) ||
      (Array.isArray(memberships) && memberships.length > 0);
    const isBranchHead = Array.isArray(memberships)
      ? memberships.some((m) => m.isBranchHead)
      : false;

    const isAdmin = isAdminRole(user?.role);
    /** Same gate as withAuth `authorized`: must have backend JWT (avoids OAuth half-sessions + /login ↔ /dashboard loops) */
    const hasBackendSession =
      isAuthenticated && hasBackendJwt(token as Record<string, unknown>);

    // 1️⃣ Real Houznext session on /login → dashboard
    if (path === "/login" && hasBackendSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2️⃣ Real session on "/" → dashboard
    if (path === "/" && hasBackendSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Builder packages page removed from nav; old links go to LiveBuild home
    if (path === "/livebuild/packages" || path.startsWith("/livebuild/packages/")) {
      return NextResponse.redirect(new URL("/livebuild", req.url));
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
      { match: /^\/design-ideas-cms(\/.*)?$/, staffOnly: true },
      { match: /^\/interiors-cms(\/.*)?$/, staffOnly: true },
      // Dashboard: any valid Houznext JWT session (staff gate applies on other routes only)
      {
        match: /^\/dashboard$/,
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

      // Furnitures
      {
        match: /^\/furnitures(\/.*)?$/,
        resource: "furniture",
        action: "view",
        staffOnly: true,
      },

      // Interior packages CMS (admin /packages)
      {
        match: /^\/packages(\/.*)?$/,
        staffOnly: true,
      },

      // LiveBuild (custom builder admin)
      {
        match: /^\/livebuild(\/.*)?$/,
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

      // Houznext Rewards (refer & earn admin)
      {
        match: /^\/houznext-rewards(\/.*)?$/,
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

        // Reject empty / expired JWT objects from callback
        if (!token || !(token as any).user) return false;

        // Houznext admin app requires backend-issued bearer JWT on the user object
        if (!hasBackendJwt(token as Record<string, unknown>)) return false;

        const now = Math.floor(Date.now() / 1000);
        const exp = (token as any)?.exp;
        if (exp && now > exp) return false;

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
    "/cost-estimator",
    "/packages",
    "/packages/:path*",
    "/user-management",
    "/property",
    "/user-profile",
    "/access-control",
    "/livebuild/:path*",
    "/invoice",
    "/blogs",
    "/company-property",
    "/cost-estimator/:path*",
    "/settings/:path*",
    "/branches/:path*",
    "/projects/:path*",
    "/furnitures/:path*",
    "/crm/:path*",
    "/houznext-rewards/:path*",
    "/generalenquires/:path*",
    "/testimonials/:path*",
    "/design-ideas-cms/:path*",
    "/interiors-cms/:path*",
    "/about-us-cms",
  ],
};
