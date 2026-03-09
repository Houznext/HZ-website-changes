import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "process";
import apiClient from "@/utils/apiClient";

function decodeJwt(token?: string | null): any | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  try {
    if (typeof Buffer !== "undefined") {
      const json = Buffer.from(padded, "base64").toString("utf8");
      return JSON.parse(json);
    }

    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

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
        identifier: { label: "Email or Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier;
        const otp = credentials?.otp;
        const payload: { email?: string; phone?: string; otp?: string } = {
          otp,
        };

        if (identifier?.includes("@")) {
          payload.email = identifier;
        } else {
          payload.phone = identifier;
        }
        try {
          const res = await apiClient.post(`${apiClient.URLS.otp}/verify`, {
            ...payload,
          });
          const { body } = res || {};
          const {
            user,
            existingUser,
            token,
            email,
            branchMemberships,
          } = body || {};
          const userData = user || existingUser;

          if (res?.status === 201 && token) {
            const decoded = decodeJwt(token) as any;

            if (userData) {
              return {
                ...userData,
                kind: userData.kind || userData.userkind || decoded?.kind,
                role: userData.role || decoded?.role,
                activeBranchId: decoded?.activeBranchId,
                branchMemberships: branchMemberships || [],
                token,
              };
            }

            return {
              id: decoded?.sub || email || identifier,
              email: email || decoded?.email || identifier,
              kind: decoded?.kind,
              role: decoded?.role,
              activeBranchId: decoded?.activeBranchId,
              branchMemberships: [],
              token,
            };
          } else {
            console.warn("Unexpected response structure or missing token.");
            return null;
          }
        } catch (error) {
          console.error("Error in OTP verification:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email or Phone Login",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const identifier = credentials?.identifier;
        const password = credentials?.password;

        if (!identifier || !password) return null;

        const payload: { email?: string; phone?: string; password: string } = {
          password,
        };

        if (identifier.includes("@")) {
          payload.email = identifier;
        } else {
          payload.phone = identifier;
        }

        try {
          const res = await apiClient.post(
            `${apiClient.URLS.user}/login-user`,
            payload
          );

          const { body } = res || {};
          const { user, token, branchMemberships } = body || {};

          if (res?.status === 201 && user && token) {
            const decoded = decodeJwt(token) as any;
            return {
              ...user,
              activeBranchId: decoded?.activeBranchId,
              branchMemberships: branchMemberships || [],
              token,
            };
          } else {
            console.warn("Invalid credentials.");
            return null;
          }
        } catch (error) {
          console.error("Error in login:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ token, session }: any) {
      if (!token.user) {
        return null;
      }

      if (token?.userToken) {
        const decoded = decodeJwt(token.userToken) as any;
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (decoded?.exp < currentTimestamp) {
          return null;
        }

        session.user = {
          id: token.user.id,
          username: token.user.username,
          email: token.user.email,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          phone: token.user.phone,
          profile: token.user.profile,
          kind: token.user.kind,
          role: token.user.role,
          activeBranchId: token.user.activeBranchId,
          branchMemberships: token.user.branchMemberships || [],
        };

        session.token = token.userToken;
      }

      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        const {
          password,
          token: userToken,
          ...safeUser
        } = user;

        token.user = {
          ...safeUser,
        };

        token.userToken = userToken;
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
