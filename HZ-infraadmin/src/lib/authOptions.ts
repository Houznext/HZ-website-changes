import type { NextAuthOptions } from 'next-auth';
import type { User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { InfraSessionBranchMembership } from '@/types/next-auth';
import { verifyInfraAdminCredentials } from '@/server/infraAdminFileStore';

type DecodedToken = {
  exp?: number;
  lastLogin?: number;
};

const decodeJwtPayload = (token?: string): DecodedToken | null => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(payload + padding, 'base64').toString('utf-8');
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'infra-admin-credentials',
      name: 'Infra Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;
        return verifyInfraAdminCredentials(email, password) as User | null;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  secret:
    process.env.INFRA_ADMIN_NEXTAUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'houznext-infra-admin-local-dev-secret-change-me',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.sub = u.id as string;

        const rawMemberships = (u.branchMemberships ?? []) as Array<Record<string, unknown>>;
        const memberships = rawMemberships.map((m) => ({
          branchId: m.branchId as string,
          branchName: m.branchName as string,
          level: m.level as string,
          isBranchHead: !!m.isBranchHead,
          isPrimary: !!m.isPrimary,
          branchRoles: ((m.branchRoles ?? []) as Array<Record<string, unknown>>).map((r) => ({
            id: r.id as string,
            roleName: r.roleName as string,
          })),
          permissions: ((m.permissions ?? []) as Array<Record<string, unknown>>).map((p) => ({
            resource: p.resource as string,
            view: !!p.view,
            create: !!p.create,
            edit: !!p.edit,
            delete: !!p.delete,
          })),
        }));

        token.user = {
          id: u.id as string,
          email: u.email as string,
          username: u.username as string,
          firstName: u.firstName as string,
          lastName: u.lastName as string,
          phone: (u.phone as string | null) ?? null,
          profile: (u.profile as string | null) ?? null,
          kind: u.kind as string,
          role: u.role as string,
          token: u.token as string,
          createdAt: u.createdAt as string,
          updatedAt: u.updatedAt as string,
          branchMemberships: memberships,
        };

        token.exp = currentTimestamp + 60 * 60 * 24 * 7;
        token.lastLogin = currentTimestamp;
      }

      if (token.exp && currentTimestamp > (token.exp as number)) {
        return {};
      }

      return token;
    },
    async session({ session, token }) {
      try {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const t = token as Record<string, unknown>;
        const u = t.user as Record<string, unknown> | undefined;

        if (!u?.token) {
          session.error = 'InvalidSession';
          session.user = null;
          (session as { token?: string }).token = undefined;
          session.accessToken = undefined;
          session.branchMemberships = [];
          return session;
        }

        const decoded = decodeJwtPayload(u.token as string);
        if (!decoded?.exp || decoded.exp < currentTimestamp) {
          session.error = 'SessionExpired';
          session.user = null;
          (session as { token?: string }).token = undefined;
          session.accessToken = undefined;
          session.branchMemberships = [];
          return session;
        }

        const displayName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || (u.email as string);

        session.user = {
          ...session.user,
          id: u.id as string,
          email: u.email as string,
          name: displayName,
          image: (u.profile as string | null) ?? null,
          role: u.role as string,
          kind: u.kind as string,
          firstName: u.firstName as string,
          lastName: u.lastName as string,
          username: u.username as string,
          branchMemberships: u.branchMemberships as InfraSessionBranchMembership[] | undefined,
        };

        session.branchMemberships = (u.branchMemberships ?? []) as InfraSessionBranchMembership[];
        session.token = u.token as string;
        session.accessToken = u.token as string;
        session.lastLogin = decoded.lastLogin;
        delete session.error;
        return session;
      } catch (err) {
        console.error('[infra-admin] session callback', err);
        session.error = 'InvalidSession';
        session.user = null;
        (session as { token?: string }).token = undefined;
        session.accessToken = undefined;
        session.branchMemberships = [];
        return session;
      }
    },
  },
};
