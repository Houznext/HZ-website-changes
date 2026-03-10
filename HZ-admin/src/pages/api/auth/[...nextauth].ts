import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "process";
import apiClient from "@/src/utils/apiClient";

type DecodedToken = {
  exp?: number;
  lastLogin?: number;
};

const decodeJwtPayload = (token?: string): DecodedToken | null => {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (payload.length % 4)) % 4);
    const json = Buffer.from(payload + padding, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "otp-login",
      name: "OTP Login",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      authorize: async (credentials) => {
        try {
          const res = await apiClient.post(`${apiClient.URLS.otp}/verify`, {
            email: credentials?.email,
            otp: credentials?.otp,
          });
          const { body } = res || {};
          const { existingUser, token } = body || {};

          if (res?.status === 201 && existingUser && token) {
            return { ...existingUser, token };
          } else {
            console.warn("Unexpected response structure or missing fields.");
            return null;
          }
        } catch (error) {
          console.error("Error in OTP verification:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "email-login",
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        // Houznext static admin fallback (does not depend on backend user record)
        if (
          email === "business@houznext.com" &&
          password === "Houznext@758"
        ) {
          const now = Math.floor(Date.now() / 1000);
          const payload = { exp: now + 60 * 60 * 24 * 30, lastLogin: now };
          const header = { alg: "HS256", typ: "JWT" };
          const base64url = (obj: any) =>
            Buffer.from(JSON.stringify(obj))
              .toString("base64")
              .replace(/=/g, "")
              .replace(/\+/g, "-")
              .replace(/\//g, "_");

          const token = `${base64url(header)}.${base64url(
            payload
          )}.houznext-static-signature`;

          return {
            id: "houznext-admin",
            email: "business@houznext.com",
            firstName: "Houznext",
            lastName: "Admin",
            username: "houznext-admin",
            phone: null,
            profile: null,
            kind: "STAFF",
            role: "ADMIN",
            token,
            branchMemberships: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any;
        }

        // Default behaviour: delegate to backend login endpoint
        try {
          const res = await apiClient.post(
            `${apiClient.URLS.user}/login-user`,
            {
              email,
              password,
            }
          );

          const { body } = res || {};

          const { user, token, branchMemberships } = body || {};
          if ((res?.status === 201 || res?.status === 200) && user && token) {
            const isAdmin = user.role === "ADMIN";
            const isStaff = user.kind === "STAFF";
            const hasBranchMemberships =
              Array.isArray(branchMemberships) && branchMemberships.length > 0;

            if (!isAdmin && !isStaff && !hasBranchMemberships) {
              console.warn(
                "User is not admin, not staff, and has no branch memberships."
              );
              return null;
            }
            return { ...user, token, branchMemberships };
          } else {
            console.warn("Unexpected response structure or missing fields.");
            return null;
          }
        } catch (error) {
          console.error("Error in email-password authentication:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async session({ token, session }: any) {
      try {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (!token?.user || !token?.user?.token) {
          session.error = "InvalidSession";
          session.user = null;
          session.token = null;
          return session;
        }

        const decoded = decodeJwtPayload(token.user.token);

        // Validate token expiry from decoded JWT
        if (!decoded?.exp || decoded.exp < currentTimestamp) {
          session.error = "SessionExpired";
          session.user = null;
          session.token = null;
          return session;
        }

        session.user = token.user;
        session.token = token.user.token;
        session.branchMemberships = token.user.branchMemberships ?? [];
        session.lastLogin = decoded.lastLogin;
        return session;
      } catch (error) {
        console.error("Session decode error:", error);
        session.error = "InvalidSession";
        session.user = null;
        session.token = null;
        session.branchMemberships = [];
        return session;
      }
    },
    async jwt({ token, user }: any) {
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (user) {
        token.sub = user.id;

        const memberships = (user.branchMemberships ?? []).map((m: any) => ({
          branchId: m.branchId,
          branchName: m.branchName,
          level: m.level,
          isBranchHead: m.isBranchHead,
          isPrimary: m.isPrimary,
          branchRoles: (m.branchRoles ?? []).map((r: any) => ({
            id: r.id,
            roleName: r.roleName,
          })),
          permissions: (m.permissions ?? []).map((p: any) => ({
            resource: p.resource,
            view: p.view,
            create: p.create,
            edit: p.edit,
            delete: p.delete,
          })),
        }));

        token.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profile: user.profile ?? null,
          kind: user.kind,
          role: user.role,
          token: user.token,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          addresses: [],
          branchMemberships: memberships,
        };
        token.exp = currentTimestamp + 60 * 60 * 24 * 7;
        token.lastLogin = currentTimestamp;
      }

      if (token.exp && currentTimestamp > token.exp) {
        return {};
      }

      return token;
    },
  },
  pages: {
    signOut: env.NEXTAUTH_URL,
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
